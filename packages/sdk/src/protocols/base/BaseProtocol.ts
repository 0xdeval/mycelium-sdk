import type { ChainManager } from '@/tools/ChainManager';
import type { VaultInfo, VaultTransactionResult, VaultBalance } from '@/types/protocols/beefy';
import {
  type Address,
  type LocalAccount,
  erc20Abi,
  createWalletClient,
  http,
  parseGwei,
} from 'viem';
import type { SupportedChainId } from '@/constants/chains';
import type { SmartWallet } from '@/wallet/base/wallets/SmartWallet';

export abstract class BaseProtocol {
  /** the chain manager instance */
  public chainManager: ChainManager | undefined;

  /**
   * Initialize the protocol with all necessary parameters for it
   */
  abstract init(chainManager: ChainManager): Promise<void>;

  /**
   * Check if the protocol is properly initialized
   */
  protected ensureInitialized(): void {
    if (!this.chainManager) {
      throw new Error('Protocol must be initialized before use. Call init() first.');
    }
  }

  /**
   * Get all vaults for the protocol that are available for a deposit operation
   */
  abstract getVaults(): Promise<VaultInfo[]>;

  /**
   * Get the best vault for the protocol to deposit based on the given parameters
   */
  abstract getBestVault(): Promise<VaultInfo>;

  /**
   * Method defines and return a pool where a user could already have deposited funds previously
   */
  abstract fetchDepositedVaults(smartWallet: SmartWallet): Promise<VaultInfo | null>;

  /**
   * Deposit funds into a vault
   */
  abstract deposit(amount: string, smartWallet: SmartWallet): Promise<VaultTransactionResult>;

  /**
   * Withdraw funds from a vault
   */
  abstract withdraw(
    amountInShares: string,
    smartWallet: SmartWallet,
  ): Promise<VaultTransactionResult>;

  /**
   * Get the balance of deposited funds to a vault
   */
  abstract getBalance(
    vaultInfo: VaultInfo,
    walletAddress: Address, // chainId: SupportedChainId
  ): Promise<VaultBalance>;

  /**
   * Approve a token to be spent by a spender
   */
  protected async approveToken(
    tokenAddress: Address,
    spenderAddress: Address,
    amount: bigint,
    chainId: SupportedChainId,
    account: LocalAccount,
  ): Promise<string> {
    this.ensureInitialized();

    const walletClient = createWalletClient({
      account,
      chain: this.chainManager!.getChain(chainId),
      transport: http(this.chainManager!.getRpcUrl(chainId)),
    });

    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, amount],
      gas: 100000n,
      maxFeePerGas: parseGwei('20'),
      maxPriorityFeePerGas: parseGwei('2'),
    });

    return hash;
  }

  /**
   * Check the allowance of a token to be spent by a spender
   */
  protected async checkAllowance(
    tokenAddress: Address,
    spenderAddress: Address,
    walletAddress: Address,
    chainId: SupportedChainId,
  ): Promise<bigint> {
    this.ensureInitialized();

    const publicClient = this.chainManager!.getPublicClient(chainId);

    return await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [walletAddress, spenderAddress],
    });
  }
}
