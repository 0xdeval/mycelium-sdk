import { BaseProtocol } from '@/protocols/base/BaseProtocol';
import type { ChainManager } from '@/tools/ChainManager';
import type { SupportedChainId } from '@/constants/chains';
import type { SmartWallet } from '@/wallet/base/wallets/SmartWallet';
import type {
  SparkVaultInfo,
  SparkVaultTxnResult,
  SparkVaultBalance,
} from '@/types/protocols/spark';

import {
  type Address,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  parseUnits,
  type PublicClient,
} from 'viem';

import { SPARK_VAULT_ABI, SPARK_SSR_ORACLE_ABI } from '@/abis/protocols/spark';
import {
  RAY,
  SECONDS_PER_YEAR,
  SPARK_SSR_ORACLE_ADDRESS,
  SPARK_VAULT,
} from '@/protocols/constants/spark';
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
  private allVaults: SparkVaultInfo[] = [];
  private publicClient: PublicClient | undefined;

  /**
   * Initialize the Spark protocol with the provided chain manager
   * @param chainManager Chain manager instance used for network operations
   */
  async init(chainManager: ChainManager): Promise<void> {
    this.chainManager = chainManager;
    this.selectedChainId = chainManager.getSupportedChain();

    this.publicClient = chainManager.getPublicClient(this.selectedChainId!);

    this.allVaults = this.getVaults();
  }

  /**
   * Get the SSR (Sky Saving Rate) of the Spark protocol
   * @remarks
   * The parameter ius necessary to calculate the APY of a vault
   * @returns
   */
  private async getSSR(): Promise<number> {
    if (!this.publicClient) {
      throw new Error('Public client not initialized');
    }

    const ssrRaw = await this.publicClient.readContract({
      address: SPARK_SSR_ORACLE_ADDRESS,
      abi: SPARK_SSR_ORACLE_ABI,
      functionName: 'getSSR',
    });

    const ssr = Number(ssrRaw) / Number(RAY);
    return ssr;
  }

  /**
   * Get the APY of the Spark protocol
   * @remarks
   * Calculation based on the formula from the documentation:
   * https://docs.spark.fi/dev/integration-guides/susds-lending-market#rates
   * @returns The APY of the Spark protocol in percentage
   */
  async getAPY(): Promise<number> {
    const ssr = await this.getSSR();

    const apy = Math.exp(Math.log(ssr) * SECONDS_PER_YEAR) - 1;

    return Number((apy * 100).toFixed(2));
  }

  /**
   *
   * @description Get all vault info from a Spark protocol
   * @returns The list of vaults
   */
  getVaults(): SparkVaultInfo[] {
    return SPARK_VAULT;
  }

  /**
   * Get the best available Spark vault
   * @returns The top-ranked Spark vault
   * @throws Error if no vaults found
   */
  async getBestVault(): Promise<SparkVaultInfo> {
    if (this.allVaults.length === 0) {
      throw new Error('No vaults found');
    }

    // Currently, the vault is only one and relates to sUSDC
    // More Spark vaults can be added in the future, but the APY calculation will remain the same
    const selectedVault = this.allVaults[0]!;

    // The APY for Spark vaults calculates the same for all vaults
    selectedVault.metadata!.apy = await this.getAPY();

    return selectedVault;
  }

  /**
   * Fetch a vault where the user previously deposited funds
   * @param smartWallet Smart wallet to inspect
   * @returns The vault with user deposits, or null if none found
   */
  async fetchDepositedVaults(smartWallet: SmartWallet): Promise<SparkVaultInfo | null> {
    let depositedVault: SparkVaultInfo | undefined = undefined;
    const userAddress = await smartWallet.getAddress();
    for (const vault of this.allVaults) {
      const balance = await this.getBalance(vault, userAddress);
      if (parseInt(balance.depositedAmount) > 0) {
        depositedVault = vault;
      }
    }

    if (depositedVault) {
      depositedVault.metadata!.apy = await this.getAPY();
    }
    logger.info('Deposited vaults:', { depositedVault }, 'SparkProtocol');

    return depositedVault || null;
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

    let vaultInfoToDeposit: SparkVaultInfo;
    logger.info('Previously deposited vault:', { depositedVault }, 'SparkProtocol');
    if (depositedVault) {
      vaultInfoToDeposit = depositedVault;
    } else {
      // Find the best pool to deposit for a protocol
      vaultInfoToDeposit = await this.getBestVault();
      logger.info('Best vault that found:', { bestVault: vaultInfoToDeposit }, 'SparkProtocol');
    }

    const owner = await smartWallet.getAddress();
    const assets = parseUnits(amount, vaultInfoToDeposit.depositTokenDecimals);
    logger.info('Raw deposit amount:', { amount, assets }, 'SparkProtocol');

    const allowance = await this.checkAllowance(
      vaultInfoToDeposit.depositTokenAddress,
      vaultInfoToDeposit.vaultAddress,
      owner,
      this.selectedChainId!,
    );

    logger.info('Current vault contract allowance:', { allowance }, 'SparkProtocol');

    const ops: { to: Address; data: `0x${string}` }[] = [];

    if (allowance < assets) {
      ops.push({
        to: vaultInfoToDeposit.depositTokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [vaultInfoToDeposit.vaultAddress, assets],
        }),
      });
    }
    ops.push({
      to: vaultInfoToDeposit.vaultAddress,
      data: encodeFunctionData({
        abi: SPARK_VAULT_ABI,
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
    const depositedVault = await this.fetchDepositedVaults(smartWallet);

    if (!depositedVault) {
      throw new Error('No vault found to withdraw from');
    }

    const owner = await smartWallet.getAddress();

    let withdrawData: { to: Address; data: `0x${string}` };

    if (amountInUnderlying) {
      const assets = parseUnits(amountInUnderlying, depositedVault.depositTokenDecimals);
      logger.info('Withdraw amount:', { amountInUnderlying, assets }, 'SparkProtocol');
      withdrawData = {
        to: depositedVault.vaultAddress,
        data: encodeFunctionData({
          abi: SPARK_VAULT_ABI,
          functionName: 'withdraw',
          args: [assets, owner, owner] as const,
        }),
      };
    } else {
      const maxShares = await this.getMaxRedeemableShares(depositedVault, owner);
      logger.info('Withdrawing all funds:', { maxShares }, 'SparkProtocol');
      withdrawData = {
        to: depositedVault.vaultAddress,
        data: encodeFunctionData({
          abi: SPARK_VAULT_ABI,
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
    if (!this.publicClient) {
      throw new Error('Public client not initialized');
    }

    const shares = await this.publicClient.readContract({
      address: vaultInfo.vaultAddress,
      abi: SPARK_VAULT_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    return shares;
  }

  /**
   * Get amount that a wallet has deposited in a vault
   * @param vaultInfo Vault information
   * @param walletAddress Wallet address to check
   * @returns Object containing shares and deposited amount
   */
  async getBalance(vaultInfo: SparkVaultInfo, walletAddress: Address): Promise<SparkVaultBalance> {
    if (!this.publicClient) {
      throw new Error('Public client not initialized');
    }

    const shares = await this.publicClient.readContract({
      address: vaultInfo.vaultAddress,
      abi: SPARK_VAULT_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    if (shares === 0n) {
      return { shares: '0', depositedAmount: '0', vaultInfo };
    }

    const assets = await this.publicClient.readContract({
      address: vaultInfo.vaultAddress,
      abi: SPARK_VAULT_ABI,
      functionName: 'convertToAssets',
      args: [shares],
    });

    return {
      shares: formatUnits(shares, vaultInfo.earnTokenDecimals),
      depositedAmount: formatUnits(assets, vaultInfo.depositTokenDecimals),
      vaultInfo,
    };
  }
}
