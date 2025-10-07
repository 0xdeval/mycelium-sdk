import {
  type Address,
  type Hash,
  type LocalAccount,
  encodeFunctionData,
  erc20Abi,
  pad,
} from 'viem';
import { type WebAuthnAccount, toCoinbaseSmartAccount } from 'viem/account-abstraction';

import { smartWalletFactoryAbi } from '@/abis/smartWalletFactory';
import { smartWalletFactoryAddress } from '@/constants/addresses';
import type { SupportedChainId } from '@/constants/chains';
import type { ChainManager } from '@/tools/ChainManager';
import { fetchERC20Balance, fetchETHBalance } from '@/tools/TokenBalance';
import { SUPPORTED_TOKENS } from '@/constants/tokens';
import type { TokenBalance } from '@/types/token';
import { type AssetIdentifier, parseAssetAmount, resolveAsset } from '@/utils/assets';
import { SmartWallet } from '@/wallet/base/wallets/SmartWallet';
import type { TransactionData } from '@/types/transaction';
import type { VaultBalance, VaultTxnResult, Protocol } from '@/types/protocols/general';

/**
 * Default ERC-4337 smart wallet implementation (internal)
 *
 * @internal
 * @category Wallets
 * @remarks
 * Backed by Coinbase Smart Account and compatible with ERC-4337 UserOperations
 * Supports multi-owner wallets (EVM addresses or WebAuthn owners), gas-sponsored flows,
 * and cross-chain operations via {@link ChainManager}
 *
 * Not exported in the public API. It’s composed internally by higher-level providers/namespaces
 */
export class DefaultSmartWallet extends SmartWallet {
  /** Owners (EVM addresses or WebAuthn public keys) */
  private owners: Array<Address | WebAuthnAccount>;
  /** Signer for transactions and UserOperations */
  private _signer: LocalAccount;
  /** Index of signer within the owners array (undefined → default 0) */
  private signerOwnerIndex?: number;
  /** Known deployment address (if already deployed) */
  private deploymentAddress?: Address;
  /** Network and client management */
  private chainManager: ChainManager;
  /** Nonce (salt) for deterministic address calculation */
  private nonce?: bigint;
  /** Selected protocol provider instance */
  private protocolProvider: Protocol['instance'];

  /**
   * Creates a smart wallet instance
   *
   * @internal
   * @param owners Owners (addresses or WebAuthn accounts)
   * @param signer Local account used to sign
   * @param chainManager Chain/client manager
   * @param protocolProvider Protocol provider instance (selected upstream)
   * @param deploymentAddress Optional known deployment address
   * @param signerOwnerIndex Optional index of `signer` in owners (default 0)
   * @param nonce Optional salt for deterministic address calc (default 0)
   */
  constructor(
    owners: Array<Address | WebAuthnAccount>,
    signer: LocalAccount,
    chainManager: ChainManager,
    protocolProvider: Protocol['instance'],
    deploymentAddress?: Address,
    signerOwnerIndex?: number,
    nonce?: bigint,
  ) {
    super();
    this.owners = owners;
    this._signer = signer;
    this.signerOwnerIndex = signerOwnerIndex;
    this.deploymentAddress = deploymentAddress;
    this.chainManager = chainManager;
    this.nonce = nonce;
    this.protocolProvider = protocolProvider;
  }

  /**
   * Returns the signer account for this smart wallet
   *
   * @internal
   * @category Accessors
   * @remarks
   * Used to authorize UserOperations and on-chain transactions
   */
  get signer(): LocalAccount {
    return this._signer;
  }

  /**
   * Resolves the smart wallet address
   *
   * @internal
   * @category Accessors
   * @remarks
   * If `deploymentAddress` is known, returns it. Otherwise derives a deterministic address
   * via the factory (`getAddress`) using owners and `nonce` (CREATE2-style)
   *
   * @returns Promise that resolves to the wallet address
   * @throws Error if no supported chains are configured
   * @throws Error if an owner has an invalid type
   */
  async getAddress() {
    if (this.deploymentAddress) {
      return this.deploymentAddress;
    }

    const owners_bytes = this.owners.map((owner) => {
      if (typeof owner === 'string') {
        return pad(owner);
      }
      if (owner.type === 'webAuthn') {
        return owner.publicKey;
      }
      throw new Error('invalid owner type');
    });

    // Factory is the same across all chains, so we can use the first chain to get the wallet address
    const supportedChain = this.chainManager.getSupportedChain();
    if (!supportedChain) {
      throw new Error('No supported chains configured');
    }
    const publicClient = this.chainManager.getPublicClient(supportedChain);
    const smartWalletAddress = await publicClient.readContract({
      abi: smartWalletFactoryAbi,
      address: smartWalletFactoryAddress,
      functionName: 'getAddress',
      args: [owners_bytes, this.nonce || 0n],
    });
    return smartWalletAddress;
  }

  /**
   * Builds a Coinbase Smart Account for a specific chain
   *
   * @internal
   * @category Accounts
   * @param chainId Target chain ID
   * @returns Viem Coinbase Smart Account for the given chain
   */
  async getCoinbaseSmartAccount(
    chainId: SupportedChainId,
  ): ReturnType<typeof toCoinbaseSmartAccount> {
    return toCoinbaseSmartAccount({
      address: this.deploymentAddress,
      ownerIndex: this.signerOwnerIndex,
      client: this.chainManager.getPublicClient(chainId),
      owners: [this.signer],
      nonce: this.nonce,
      version: '1.1',
    });
  }

  /**
   * Fetches balances (ETH + ERC-20) across supported chains
   *
   * @internal
   * @category Balances
   * @returns Promise resolving to a list of {@link TokenBalance}
   */
  async getBalance(): Promise<TokenBalance[]> {
    const address = await this.getAddress();
    const tokenBalancePromises = Object.values(SUPPORTED_TOKENS).map(async (token) => {
      return fetchERC20Balance(this.chainManager, address, token);
    });

    const ethBalancePromise = fetchETHBalance(this.chainManager, address);

    return Promise.all([ethBalancePromise, ...tokenBalancePromises]);
  }

  /**
   * Deposits into the selected protocol’s vault
   *
   * @internal
   * @category Protocol
   * @param amount Human-readable amount string
   * @returns Transaction result for the deposit
   */
  async earn(amount: string): Promise<VaultTxnResult> {
    this.chainManager.getSupportedChain();

    const depositTransactionResult = this.protocolProvider.deposit(amount, this);

    return depositTransactionResult;
  }

  /**
   * Reads current deposit balance from the selected protocol’s vault
   *
   * @internal
   * @category Protocol
   * @returns Vault balance or `null` if nothing deposited
   */
  async getEarnBalance(): Promise<VaultBalance | null> {
    const vaultInfo = await this.protocolProvider.fetchDepositedVaults(this);
    if (!vaultInfo) {
      return null;
    }
    return this.protocolProvider.getBalance(vaultInfo, await this.getAddress());
  }

  /**
   * Withdraws from the selected protocol’s vault
   *
   * @internal
   * @category Protocol
   * @param amount Human-readable amount string
   * @returns Transaction result for the withdrawal
   */
  async withdraw(amount: string): Promise<VaultTxnResult> {
    const withdrawTransactionResult = await this.protocolProvider.withdraw(amount, this);

    return withdrawTransactionResult;
  }

  /**
   * Sends a single transaction via ERC-4337 (gas-sponsored)
   *
   * @internal
   * @category Transactions
   * @remarks
   * Builds a UserOperation and submits via the bundler, then waits for inclusion
   *
   * @param transactionData Transaction details (`to`, `value`, `data`)
   * @param chainId Target chain ID
   * @returns Promise that resolves to the UserOperation hash
   * @throws Error with a readable message if submission or inclusion fails
   */
  async send(transactionData: TransactionData, chainId: SupportedChainId): Promise<Hash> {
    try {
      const account = await this.getCoinbaseSmartAccount(chainId);
      const bundlerClient = this.chainManager.getBundlerClient(chainId, account);

      // Extra buffer for gas limits
      const bump = (x: bigint, pct = 40n) => x + (x * pct) / 100n;

      const gas = await bundlerClient.estimateUserOperationGas({
        account,
        calls: [transactionData],
      });

      const hash = await bundlerClient.sendUserOperation({
        account,
        calls: [transactionData],
        callGasLimit: bump(gas.callGasLimit),
        verificationGasLimit: bump(gas.verificationGasLimit),
        preVerificationGas: bump(gas.preVerificationGas),
      });

      // Wait for the transaction to be included in a block
      await bundlerClient.waitForUserOperationReceipt({
        hash,
      });

      return hash;
    } catch (error) {
      throw new Error(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Sends a batch of transactions via ERC-4337 (gas-sponsored)
   *
   * @internal
   * @category Transactions
   * @param transactionData An array of calls to execute
   * @param chainId Target chain ID
   * @returns Promise that resolves to the UserOperation hash for the batch
   * @throws Error with a readable message if submission or inclusion fails
   */
  async sendBatch(transactionData: TransactionData[], chainId: SupportedChainId): Promise<Hash> {
    try {
      const account = await this.getCoinbaseSmartAccount(chainId);
      const bundlerClient = this.chainManager.getBundlerClient(chainId, account);

      // Extra buffer for gas limits
      const bump = (x: bigint, pct = 40n) => x + (x * pct) / 100n;

      const gas = await bundlerClient.estimateUserOperationGas({
        account,
        calls: transactionData,
      });

      // Wait for the transaction to be included in a block
      const hash = await bundlerClient.sendUserOperation({
        account,
        calls: transactionData,
        callGasLimit: bump(gas.callGasLimit),
        verificationGasLimit: bump(gas.verificationGasLimit),
        preVerificationGas: bump(gas.preVerificationGas),
      });

      await bundlerClient.waitForUserOperationReceipt({
        hash,
      });

      return hash;
    } catch (error) {
      throw new Error(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Funds the wallet with USDC via an on-ramp service
   *
   * @internal
   * @category On-Ramp
   * @remarks
   * Placeholder for future on-ramp integration. Should return a URL to the provider’s flow
   *
   * @returns A URL string to the on-ramp service (to be implemented)
   */
  fundUSDC() {}

  /**
   * Builds transaction data to send ETH or ERC-20 tokens
   *
   * @internal
   * @category Transfers
   * @param amount Human-readable amount (e.g., `1.5`)
   * @param asset Asset symbol (e.g., `"usdc"`, `"eth"`) or token address
   * @param recipientAddress Destination address
   * @returns Transaction data suitable for inclusion in a UserOperation/call
   * @throws Error if `recipientAddress` is missing, `amount` ≤ 0, or asset cannot be resolved
   */
  async sendTokens(
    amount: number,
    asset: AssetIdentifier,
    recipientAddress: Address,
  ): Promise<TransactionData> {
    if (!recipientAddress) {
      throw new Error('Recipient address is required');
    }

    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const chainId = this.chainManager.getSupportedChain();

    // Handle ETH transfers
    if (asset.toLowerCase() === 'eth') {
      const parsedAmount = parseAssetAmount(amount, 18); // ETH has 18 decimals

      return {
        to: recipientAddress,
        value: parsedAmount,
        data: '0x',
      };
    }

    // Handle ERC20 token transfers
    const resolvedAsset = resolveAsset(asset, chainId);
    const parsedAmount = parseAssetAmount(amount, resolvedAsset.decimals);

    // Encode ERC20 transfer function call
    const transferData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipientAddress, parsedAmount],
    });

    return {
      to: resolvedAsset.address,
      value: 0n,
      data: transferData,
    };
  }
}
