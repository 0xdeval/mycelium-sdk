import type { ChainManager } from '@/tools/ChainManager';
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
import type { VaultInfo, VaultBalance, VaultTxnResult } from '@/types/protocols/general';

/**
 * Base Protocol
 *
 * @internal
 * @abstract
 * @category Protocols
 * @remarks
 * Abstract class defining the contract for protocol integrations (e.g. Spark, Beefy, Aave, Morpho)
 * Provides lifecycle hooks (`init`) and required methods for vault discovery, deposit, withdrawal,
 * and balance tracking
 *
 * Generic parameters allow protocol-specific typing for vault info, balances, and transaction results
 */
export abstract class BaseProtocol<
  TVaultInfo extends VaultInfo = VaultInfo,
  TVaultBalance extends VaultBalance = VaultBalance,
  TVaultTxnResult extends VaultTxnResult = VaultTxnResult,
> {
  /** Chain manager instance injected during initialization */
  public chainManager: ChainManager | undefined;

  /**
   * Initialize the protocol
   * @param chainManager Chain manager for accessing RPC and bundler clients
   */
  abstract init(chainManager: ChainManager): Promise<void>;

  /**
   * Ensure the protocol has been initialized
   * @throws Error if `init()` has not been called
   */
  protected ensureInitialized(): void {
    if (!this.chainManager) {
      throw new Error('Protocol must be initialized before use. Call init() first.');
    }
  }

  /**
   * Get all available vaults
   * @returns List of vaults that support deposits
   */
  abstract getVaults(): Promise<TVaultInfo[]> | TVaultInfo[];

  /**
   * Get the best vault for deposits
   * @returns Single vault considered optimal for deposit
   */
  abstract getBestVault(): Promise<TVaultInfo> | TVaultInfo;

  /**
   * Get a vault where funds may already be deposited
   * @param smartWallet Wallet to check for existing deposits
   * @returns Vault info if deposits exist, otherwise null
   */
  abstract fetchDepositedVaults(smartWallet: SmartWallet): Promise<TVaultInfo | null>;

  /**
   * Deposit funds into a vault
   * @param amount Amount in human-readable format
   * @param smartWallet Wallet executing the deposit
   * @returns Result of the deposit transaction
   */
  abstract deposit(amount: string, smartWallet: SmartWallet): Promise<TVaultTxnResult>;

  /**
   * Withdraw funds from a vault
   * @param amountInShares Amount of shares to withdraw
   * @param smartWallet Wallet executing the withdrawal
   * @returns Result of the withdrawal transaction
   */
  abstract withdraw(amountInShares: string, smartWallet: SmartWallet): Promise<TVaultTxnResult>;

  /**
   * Get deposited balance in a vault
   * @param vaultInfo Vault to query
   * @param walletAddress Wallet address holding the deposit
   * @returns Balance of deposited funds
   */
  abstract getBalance(
    vaultInfo: TVaultInfo,
    walletAddress: Address, // chainId: SupportedChainId
  ): Promise<TVaultBalance>;

  /**
   * Approve a token for protocol use
   * @param tokenAddress Token address
   * @param spenderAddress Spender address
   * @param amount Allowance amount in wei
   * @param chainId Target chain ID
   * @param account Account authorizing the approval
   * @returns Transaction hash
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
   * Check token allowance for a spender
   * @param tokenAddress Token address
   * @param spenderAddress Spender address
   * @param walletAddress Wallet address granting allowance
   * @param chainId Target chain ID
   * @returns Current allowance amount
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
