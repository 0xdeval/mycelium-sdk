import type { PrivyClient } from '@privy-io/server-auth';
import { createViemAccount, type GetViemAccountInputType } from '@privy-io/server-auth/viem';
import {
  type Address,
  createWalletClient,
  type Hash,
  http,
  type LocalAccount,
  type WalletClient,
} from 'viem';
import { unichain } from 'viem/chains';

import type { SupportedChainId } from '@/constants/chains';
import type { ChainManager } from '@/tools/ChainManager';
import { EmbeddedWallet } from '@/wallet/base/wallets/EmbeddedWallet';
import type { TransactionData } from '@/types/transaction';
import { logger } from '@/tools/Logger';

/**
 * Internal embedded wallet implementation backed by Privy
 *
 * @internal
 * @category Wallets
 * @remarks
 * Wraps Privy’s server-auth wallet to expose a viem-compatible {@link LocalAccount}
 * and {@link WalletClient}
 * Not exported in the public API — composed by higher-level providers/namespaces
 */
export class PrivyWallet extends EmbeddedWallet {
  /** Privy wallet ID */
  public override walletId: string;
  /** Privy client instance */
  private privyClient: PrivyClient;
  /** Network and client manager */
  private chainManager: ChainManager;
  /**
   * Creates a Privy-backed embedded wallet
   *
   * @internal
   * @param privyClient Privy client used to access wallet and signing APIs
   * @param walletId Privy wallet identifier
   * @param address Wallet EVM address
   * @param chainManager Chain and client manager
   */
  constructor(
    privyClient: PrivyClient,
    walletId: string,
    address: Address,
    chainManager: ChainManager,
  ) {
    super(address, walletId);
    this.privyClient = privyClient;
    this.walletId = walletId;
    this.chainManager = chainManager;
  }

  /**
   * Returns a viem-compatible {@link LocalAccount} for this Privy wallet
   *
   * @internal
   * @category Accounts
   * @remarks
   * Uses Privy’s signing infra under the hood while exposing the standard viem interface
   *
   * @returns Promise that resolves to a {@link LocalAccount}
   * @throws Error if wallet retrieval or account construction fails
   */
  async account(): Promise<LocalAccount> {
    const account = await createViemAccount({
      walletId: this.walletId,
      address: this.address,
      // TODO: Fix this type error
      privy: this.privyClient as unknown as GetViemAccountInputType['privy'],
    });
    return account;
  }

  /**
   * Creates a viem {@link WalletClient} for a given chain
   *
   * @internal
   * @category Accounts
   * @param chainId Target chain ID
   * @returns Promise that resolves to a {@link WalletClient}
   * @throws Error if the chain is unsupported or client creation fails
   */
  async walletClient(chainId: SupportedChainId): Promise<WalletClient> {
    const account = await this.account();
    return createWalletClient({
      account,
      chain: this.chainManager.getChain(chainId),
      transport: http(this.chainManager.getRpcUrl(chainId)),
    });
  }

  /**
   * Signs a transaction without broadcasting it
   *
   * @internal
   * @category Signing
   * @param transactionData Transaction payload to sign
   * @returns Promise that resolves to a signed transaction hex string
   */
  async sign(transactionData: TransactionData): Promise<`0x${string}`> {
    return (await this.signOnly(transactionData)) as `0x${string}`;
  }

  /**
   * Produces a signed transaction using Privy’s wallet API without sending it
   *
   * @internal
   * @category Signing
   * @remarks
   * Estimates gas, fees, and nonce to build a complete EIP-1559 transaction
   * Per Privy docs, if any gas field is set, all must be set
   *
   * @param transactionData Transaction payload to sign
   * @returns Promise that resolves to a signed transaction string
   * @throws Error if signing fails
   */
  async signOnly(transactionData: TransactionData): Promise<string> {
    try {
      const privyWallet = await this.privyClient.walletApi.getWallet({
        id: this.walletId,
      });
      // Get public client for gas estimation
      const publicClient = this.chainManager.getPublicClient(unichain.id); // Unichain

      // Estimate gas limit
      const gasLimit = await publicClient.estimateGas({
        account: privyWallet.address as Address,
        to: transactionData.to,
        data: transactionData.data as `0x${string}`,
        value: BigInt(transactionData.value || 0),
      });

      // Get current gas price and fee data
      const feeData = await publicClient.estimateFeesPerGas();

      // Get current nonce for the wallet - manual management since Privy isn't handling it properly
      const nonce = await publicClient.getTransactionCount({
        address: privyWallet.address as Address,
        blockTag: 'pending', // Use pending to get the next nonce including any pending txs
      });

      // According to Privy docs: if you provide ANY gas parameters, you must provide ALL of them
      const txParams: any = {
        to: transactionData.to,
        data: transactionData.data as `0x${string}`,
        value: transactionData.value,
        chainId: 130, // Unichain
        type: 2, // EIP-1559
        gasLimit: `0x${gasLimit.toString(16)}`,
        maxFeePerGas: `0x${(feeData.maxFeePerGas || BigInt(1000000000)).toString(16)}`, // fallback to 1 gwei
        maxPriorityFeePerGas: `0x${(feeData.maxPriorityFeePerGas || BigInt(100000000)).toString(16)}`, // fallback to 0.1 gwei
        nonce: `0x${nonce.toString(16)}`, // Explicitly provide the correct nonce
      };

      logger.info(
        'Complete tx params: ',
        {
          txParamsType: txParams.type,
          txParamsNonce: nonce,
          txParamsLimit: gasLimit,
          txParamsMaxFee: feeData.maxFeePerGas || 'fallback',
          txParamsPriority: feeData.maxPriorityFeePerGas || 'fallback',
        },
        'PrivyWallet',
      );

      const response = await this.privyClient.walletApi.ethereum.signTransaction({
        walletId: this.walletId,
        transaction: txParams,
      });

      return response.signedTransaction;
    } catch (error) {
      throw new Error(
        `Failed to sign transaction for wallet ${this.walletId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Broadcasts a previously-signed transaction
   *
   * @internal
   * @category Sending
   * @param signedTransaction Signed transaction hex
   * @param publicClient Viem public client to send the transaction
   * @returns Promise that resolves to the transaction {@link Hash}
   * @throws Error if submission fails
   */
  async send(signedTransaction: string, publicClient: any): Promise<Hash> {
    try {
      const hash = await publicClient.sendRawTransaction({
        serializedTransaction: signedTransaction as `0x${string}`,
      });
      return hash;
    } catch (error) {
      throw new Error(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
