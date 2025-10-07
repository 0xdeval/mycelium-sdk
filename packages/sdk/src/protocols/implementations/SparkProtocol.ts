import { BaseProtocol } from '@/protocols/base/BaseProtocol';
import type { ChainManager } from '@/tools/ChainManager';
import type { SupportedChainId } from '@/constants/chains';
import type { SmartWallet } from '@/wallet/base/wallets/SmartWallet';
import type {
  SparkVaultInfo,
  SparkVaultTxnResult,
  SparkVaultBalance,
} from '@/types/protocols/spark';

import { type Address, encodeFunctionData, erc20Abi, formatUnits, parseUnits } from 'viem';

import { ERC4626_ABI } from '@/abis/protocols/erc4626';
import { SPARK_VAULT } from '@/protocols/constants/spark';
import { logger } from '@/tools/Logger';

/**
 * @internal
 * @category Protocols
 * @class SparkProtocol
 * @classdesc
 * Internal implementation of the Spark Protocol adapter
 * Provides ERC-4626 vault management including deposits, withdrawals, and balance tracking
 * Used by the SDK to interact with Spark-based yield vaults
 */
export class SparkProtocol extends BaseProtocol<
  SparkVaultInfo,
  SparkVaultBalance,
  SparkVaultTxnResult
> {
  private selectedChainId: SupportedChainId | undefined;
  private vaultInfo: SparkVaultInfo | undefined;
  private allVaults: SparkVaultInfo[] = [];

  /**
   * Initialize the Spark protocol with the provided chain manager
   * @param chainManager Chain manager instance used for network operations
   */
  async init(chainManager: ChainManager): Promise<void> {
    this.chainManager = chainManager;
    this.selectedChainId = chainManager.getSupportedChain();

    this.allVaults = this.getVaults();
  }

  /**
   *
   * @description Get all vault info from a Spark protocol
   * @returns The list of vaults
   */
  getVaults(): SparkVaultInfo[] {
    // Constant array as all vaults are static
    return SPARK_VAULT;
  }

  /**
   * Get the best available Spark vault
   * @returns The top-ranked Spark vault
   * @throws Error if no vaults found
   */
  getBestVault(): SparkVaultInfo {
    if (this.allVaults.length === 0) {
      throw new Error('No vaults found');
    }

    return this.allVaults[0]!;
  }

  /**
   * Fetch a vault where the user previously deposited funds
   * @param smartWallet Smart wallet to inspect
   * @returns The vault with user deposits, or null if none found
   */
  async fetchDepositedVaults(smartWallet: SmartWallet): Promise<SparkVaultInfo | null> {
    let depositedVaults: SparkVaultInfo | undefined = undefined;
    const userAddress = await smartWallet.getAddress();
    for (const vault of this.allVaults) {
      const balance = await this.getBalance(vault, userAddress);
      if (parseInt(balance.depositedAmount) > 0) {
        depositedVaults = vault;
      }
    }
    logger.info('Deposited vaults:', { depositedVaults }, 'SparkProtocol');

    return depositedVaults || null;
  }

  /**
   * Deposit funds into a Spark vault
   * @param amount Amount to deposit (human-readable)
   * @param smartWallet Smart wallet instance to use
   * @returns Transaction result with hash
   */
  async deposit(amount: string, smartWallet: SmartWallet): Promise<SparkVaultTxnResult> {
    // Check if a user deposited previously to any vault of the protocol
    const depositedVault = await this.fetchDepositedVaults(smartWallet);

    logger.info('Previously deposited vault:', { depositedVault }, 'SparkProtocol');
    if (depositedVault) {
      this.vaultInfo = depositedVault;
    } else {
      // Find the best pool to deposit for a protocol
      this.vaultInfo = this.getBestVault();
      logger.info('Best vault that found:', { bestVault: this.vaultInfo }, 'SparkProtocol');
    }

    const owner = await smartWallet.getAddress();
    const assets = parseUnits(amount, this.vaultInfo.depositTokenDecimals);
    logger.info('Raw deposit amount:', { amount, assets }, 'SparkProtocol');

    const allowance = await this.checkAllowance(
      this.vaultInfo.depositTokenAddress,
      this.vaultInfo.vaultAddress,
      owner,
      this.selectedChainId!,
    );

    logger.info('Current vault contract allowance:', { allowance }, 'SparkProtocol');

    const ops: { to: Address; data: `0x${string}` }[] = [];

    if (allowance < assets) {
      ops.push({
        to: this.vaultInfo.depositTokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [this.vaultInfo.vaultAddress, assets],
        }),
      });
    }
    ops.push({
      to: this.vaultInfo.vaultAddress,
      data: encodeFunctionData({
        abi: ERC4626_ABI,
        functionName: 'deposit',
        args: [assets, owner] as const,
      }),
    });

    const hash = await smartWallet.sendBatch(ops, this.selectedChainId!);
    return { success: true, hash };
  }

  /**
   * Withdraw funds from a Spark vault
   * @param amountInUnderlying Amount in base token units (or undefined to withdraw all)
   * @param smartWallet Smart wallet instance to withdraw from
   * @returns Transaction result with hash
   * @throws Error if no deposited vault found
   */
  async withdraw(
    amountInUnderlying: string | undefined,
    smartWallet: SmartWallet,
  ): Promise<SparkVaultTxnResult> {
    const vaultInfo = await this.fetchDepositedVaults(smartWallet);

    if (!vaultInfo) {
      throw new Error('No vault found to withdraw from');
    }

    const owner = await smartWallet.getAddress();

    let withdrawData: { to: Address; data: `0x${string}` };

    if (amountInUnderlying) {
      const assets = parseUnits(amountInUnderlying, vaultInfo.depositTokenDecimals);
      logger.info('Withdraw amount:', { amountInUnderlying, assets }, 'SparkProtocol');
      withdrawData = {
        to: vaultInfo.vaultAddress,
        data: encodeFunctionData({
          abi: ERC4626_ABI,
          functionName: 'withdraw',
          args: [assets, owner, owner] as const,
        }),
      };
    } else {
      const maxShares = await this.getMaxRedeemableShares(vaultInfo, owner);
      logger.info('Withdrawing all funds:', { maxShares }, 'SparkProtocol');
      withdrawData = {
        to: vaultInfo.vaultAddress,
        data: encodeFunctionData({
          abi: ERC4626_ABI,
          functionName: 'redeem',
          args: [maxShares, owner, owner] as const,
        }),
      };
    }

    const hash = await smartWallet.send(withdrawData, this.selectedChainId!);
    logger.info('Withdraw transaction sent:', { hash }, 'SparkProtocol');
    return { success: true, hash };
  }

  /**
   * Get the maximum redeemable shares for a wallet
   * @param vaultInfo Vault information
   * @param walletAddress Wallet address to check
   * @returns Maximum redeemable shares as bigint
   */
  private async getMaxRedeemableShares(
    vaultInfo: SparkVaultInfo,
    walletAddress: Address,
  ): Promise<bigint> {
    const publicClient = this.chainManager!.getPublicClient(this.selectedChainId!);

    const shares = await publicClient.readContract({
      address: vaultInfo.vaultAddress,
      abi: ERC4626_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    return shares;
  }

  /**
   * Get vault balance for a wallet
   * @param vaultInfo Vault information
   * @param walletAddress Wallet address to check
   * @returns Object containing shares and deposited amount
   */
  async getBalance(vaultInfo: SparkVaultInfo, walletAddress: Address): Promise<SparkVaultBalance> {
    const publicClient = this.chainManager!.getPublicClient(this.selectedChainId!);

    const shares = await publicClient.readContract({
      address: vaultInfo.vaultAddress,
      abi: ERC4626_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    if (shares === 0n) {
      return { shares: '0', depositedAmount: '0' };
    }

    const assets = await publicClient.readContract({
      address: vaultInfo.vaultAddress,
      abi: ERC4626_ABI,
      functionName: 'convertToAssets',
      args: [shares],
    });

    return {
      shares: formatUnits(shares, vaultInfo.earnTokenDecimals),
      depositedAmount: formatUnits(assets, vaultInfo.depositTokenDecimals),
    };
  }
}
