import { BaseProtocol } from '@/protocols/base/BaseProtocol';
import { beefyVaultAbi } from '@/abis/protocols/beefyVault';
import type {
  BeefyVaultInfo,
  BeefyVaultTxnResult,
  BeefyVaultBalance,
} from '@/types/protocols/beefy';
import type { ChainManager } from '@/tools/ChainManager';
import type { SupportedChainId } from '@/constants/chains';

import {
  type PublicClient,
  encodeFunctionData,
  erc20Abi,
  parseUnits,
  type Address,
  formatUnits,
} from 'viem';
import type { SmartWallet } from '@/wallet/base/wallets/SmartWallet';
import { BEEFY_API_URLS, ONE_E18 } from '@/protocols/constants/beefy';
import { logger } from '@/tools/Logger';
// TODO:  init should take SmartWallet instance and then init this.vaultInfo. After this, this.vaultInfo should be used for all other methods.

/**
 * Beefy protocol implementation
 *
 * @internal
 * @category Protocols
 * @remarks
 * Integrates Beefy vaults for deposit, withdrawal, and balance reads
 * Current MVP focuses on single-asset USDC vaults on the selected chain
 */
export class BeefyProtocol extends BaseProtocol {
  private vaultInfo: BeefyVaultInfo | undefined;
  private allVaults: BeefyVaultInfo[] = [];
  private selectedChainId: SupportedChainId | undefined;

  /**
   * Initializes the protocol with required dependencies
   *
   * @internal
   * @category Lifecycle
   * @param chainManager Chain manager instance
   */
  async init(chainManager: ChainManager): Promise<void> {
    // TODO: Add more necessary parameters for the protocol init
    this.chainManager = chainManager;

    // TODO: Remove multiple chains support for now. Leave only one chain for SDK overall
    this.selectedChainId = chainManager.getSupportedChain();
    this.allVaults = await this.getVaults();
    logger.info(
      'All fetched Beefy vaults:',
      { allVaultsLength: this.allVaults.length },
      'BeefyProtocol',
    );
  }

  /**
   * Fetches all available Beefy vaults and enriches them with APY, TVL, and fees
   *
   * @internal
   * @category Discovery
   * @returns Array of enriched vault definitions
   */
  async getVaults(): Promise<BeefyVaultInfo[]> {
    try {
      const { vaults, apy, fees, tvl } = await this.fetchVaultsMetrics();

      const enrichedVaults = vaults
        .filter((vault: BeefyVaultInfo) => {
          const isSupportedChain = this.chainManager!.isChainSupported(vault.chain);
          if (!isSupportedChain) {
            return false;
          }

          // TODO: custom case for MVP. Leave only USDC asset for now.
          const hasUSDC = vault.assets && vault.assets.includes('USDC');

          const vaultChainId = this.chainManager!.getChainIdByName(vault.chain);
          const isCorrectChain = vaultChainId === this.selectedChainId;

          return isCorrectChain && hasUSDC;
        })
        .map((vault: BeefyVaultInfo) => {
          const vaultId = vault.id;

          return {
            ...vault,
            vaultAddress: vault.earnContractAddress,
            depositTokenAddress: vault.tokenAddress,
            depositTokenDecimals: vault.tokenDecimals,
            metadata: {
              apy: apy[vaultId] || 0,
              tvl: tvl[vaultId] || 0,
              fees: fees[vaultId] || {
                performance: { total: 0, call: 0, strategist: 0, treasury: 0, stakers: 0 },
                withdraw: 0,
                lastUpdated: Date.now(),
              },
            },
          };
        });

      return enrichedVaults;
    } catch (error) {
      logger.error('Error fetching vaults:', error, 'BeefyProtocol');
      throw error;
    }
  }

  /**
   * Fetches vault metrics from Beefy public API
   *
   * @internal
   * @category Discovery
   * @returns Combined vault metadata for the selected chain
   */
  private async fetchVaultsMetrics(): Promise<{
    vaults: BeefyVaultInfo[];
    apy: Record<string, number>;
    fees: Record<string, number>;
    tvl: Record<string, number>;
  }> {
    try {
      const [vaultsResponse, apyResponse, feesResponse, tvlResponse] = await Promise.all([
        fetch(BEEFY_API_URLS.vaults),
        fetch(BEEFY_API_URLS.apy),
        fetch(BEEFY_API_URLS.fees),
        fetch(BEEFY_API_URLS.tvl),
      ]);

      const [vaults, apy, fees, tvl] = await Promise.all([
        vaultsResponse.json(),
        apyResponse.json(),
        feesResponse.json(),
        tvlResponse.json(),
      ]);

      const vaultsTvlForSelectedChain = tvl[this.selectedChainId!];

      return { vaults, apy, fees, tvl: vaultsTvlForSelectedChain };
    } catch (error) {
      logger.error('Error fetching vaults metrics:', error, 'BeefyProtocol');
      throw error;
    }
  }

  /**
   * Returns the best vault candidate for deposits
   *
   * @internal
   * @category Recommendation
   * @remarks
   * Current heuristic picks the active vault with highest TVL
   * Future work: incorporate APY, user history, and fees
   *
   * @returns Selected vault info
   * @throws Error if no active vaults found
   */
  async getBestVault(): Promise<BeefyVaultInfo> {
    // TODO: Implement the logic of getting the best vault for the protocol
    // TODO: Also implement logic of getting the best vault among all supported by the protocol chains
    // TODO: Check and take into account that a user could already have deposit to a vault

    if (this.allVaults.length === 0) {
      throw new Error('No vaults found');
    }

    // Filter out vaults with eol status (end of life)
    const activeVaults: BeefyVaultInfo[] = this.allVaults.filter((vault) => {
      const status = vault.status;
      return status !== 'eol';
    });

    if (activeVaults.length === 0) {
      throw new Error('No active vaults found');
    }

    const sortedVaults = activeVaults.sort((a, b) => {
      const tvlA = a.metadata?.tvl || 0;
      const tvlB = b.metadata?.tvl || 0;
      return tvlB - tvlA;
    });

    const bestVault = sortedVaults[0]!;

    logger.info('Best vault:', { bestVault }, 'BeefyProtocol');
    return { ...bestVault };
  }

  /**
   * Tries to find a vault where the user already has shares
   *
   * @internal
   * @category Discovery
   * @param smartWallet Smart wallet used to query user address
   * @returns Previously used vault or null
   */
  async fetchDepositedVaults(smartWallet: SmartWallet): Promise<BeefyVaultInfo | null> {
    // TODO: Support logic for fetching info about vaults where a user already deposited funds previously:
    // 1. Fetch all vaults
    // 2. Check balance of each vault token for a provided wallet address
    // 3. Return all vaults where the balance is greater than 0. It means a user deposited to this vault previously

    let depositedVaults: BeefyVaultInfo | undefined = undefined;
    const userAddress = await smartWallet.getAddress();
    for (const vault of this.allVaults) {
      const balance = await this.getBalance(vault, userAddress);
      if (parseInt(balance.depositedAmount) > 0) {
        depositedVaults = vault;
      }
    }
    logger.info('Deposited vaults:', { depositedVaults }, 'BeefyProtocol');

    return depositedVaults || null;
  }

  /**
   * Withdraws funds from the selected vault
   *
   * @internal
   * @category Actions
   * @param amountInUnderlying Optional human-readable amount to withdraw, withdraws all if omitted
   * @param smartWallet Smart wallet that will execute the withdrawal
   * @returns Result object including transaction hash
   * @throws Error if no vault is found to withdraw from
   */
  async deposit(amount: string, smartWallet: SmartWallet): Promise<BeefyVaultTxnResult> {
    // Check if a user deposited previously to any vault of the protocol
    const depositedVault = await this.fetchDepositedVaults(smartWallet);

    logger.info('Previously deposited vault:', { depositedVault }, 'BeefyProtocol');
    if (depositedVault) {
      this.vaultInfo = depositedVault;
    } else {
      // Find the best pool to deposit for a protocol
      this.vaultInfo = await this.getBestVault();
      logger.info('Best vault that found:', { bestVault: this.vaultInfo }, 'BeefyProtocol');
    }

    // TODO: Support other types of vaults as well. Right now we're supporting only single asset vaults where a user needs to deposit one asset -> USDC
    const isSingleAssetVault =
      this.vaultInfo.oracle !== 'lps' && this.vaultInfo.assets.length === 1;

    logger.info('Is single asset vault:', { isSingleAssetVault }, 'BeefyProtocol');

    if (!this.vaultInfo!.tokenDecimals) {
      throw new Error('TokenDecimals is undefined');
    }

    const currentAddress = await smartWallet.getAddress();

    const operationsCallData = [];
    const depositTokenDecimals = this.vaultInfo.depositTokenDecimals;
    const depositTokenAddress = this.vaultInfo.depositTokenAddress;
    const vaultAddress = this.vaultInfo.vaultAddress;

    const rawDepositAmount = parseUnits(amount, depositTokenDecimals);

    logger.info('Raw deposit amount for earn:', { amount, rawDepositAmount }, 'BeefyProtocol');

    const allowance = await this.checkAllowance(
      depositTokenAddress,
      vaultAddress,
      currentAddress,
      this.selectedChainId!,
    );

    logger.info('Current vault contract allowance:', { allowance }, 'BeefyProtocol');

    if (allowance < rawDepositAmount) {
      const approveData = {
        to: depositTokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [vaultAddress, rawDepositAmount],
        }),
      };

      operationsCallData.push(approveData);
    }

    const depositData = {
      to: vaultAddress,
      data: encodeFunctionData({
        abi: beefyVaultAbi,
        functionName: 'deposit',
        args: [rawDepositAmount],
      }),
    };

    operationsCallData.push(depositData);

    const hash = await smartWallet.sendBatch(operationsCallData, this.selectedChainId!);

    return { hash, success: true };
  }

  /**
   * Withdraws funds from the selected vault
   *
   * @internal
   * @category Actions
   * @param amountInUnderlying Optional human-readable amount to withdraw, withdraws all if omitted
   * @param smartWallet Smart wallet that will execute the withdrawal
   * @returns Result object including transaction hash
   * @throws Error if no vault is found to withdraw from
   */
  async withdraw(
    amountInUnderlying: string | undefined,
    smartWallet: SmartWallet,
  ): Promise<BeefyVaultTxnResult> {
    const ceilDiv = (a: bigint, b: bigint) => (a + b - BigInt(1)) / b;

    const vaultInfo = await this.fetchDepositedVaults(smartWallet);

    if (!vaultInfo) {
      throw new Error('No vault found to withdraw from');
    }

    let withdrawData;

    if (amountInUnderlying) {
      const publicClient = this.chainManager!.getPublicClient(this.selectedChainId!);

      const ppfs = await this.readPpfs(publicClient, vaultInfo.vaultAddress);

      // BigInt value of amount that a user wants to withdraw
      const rawUnderlying = parseUnits(amountInUnderlying, vaultInfo.depositTokenDecimals);

      // Retrieve the amount of shares that a user wants to withdraw
      const sharesToWithdraw = ceilDiv(rawUnderlying * ONE_E18, ppfs);

      logger.info(
        'Raw shares amount for withdraw:',
        { amountInUnderlying, sharesToWithdraw },
        'BeefyProtocol',
      );
      withdrawData = {
        to: vaultInfo.vaultAddress,
        data: encodeFunctionData({
          abi: beefyVaultAbi,
          functionName: 'withdraw',
          args: [sharesToWithdraw],
        }),
      };
    } else {
      withdrawData = {
        to: vaultInfo.vaultAddress,
        data: encodeFunctionData({
          abi: beefyVaultAbi,
          functionName: 'withdrawAll',
          args: [],
        }),
      };
    }

    const hash = await smartWallet.send(withdrawData, this.selectedChainId!);

    return { hash, success: true };
  }

  /**
   * Reads price per full share from the vault
   *
   * @internal
   * @category Helpers
   * @remarks
   * Uses `getPricePerFullShare` and falls back to `pricePerShare` if needed
   *
   * @param publicClient Public viem client
   * @param vaultAddress Vault contract address
   * @returns Bigint PPFS value
   */
  private async readPpfs(publicClient: PublicClient, vaultAddress: Address) {
    let ppfs: bigint;
    try {
      ppfs = await publicClient.readContract({
        address: vaultAddress,
        abi: beefyVaultAbi,
        functionName: 'getPricePerFullShare',
      });
    } catch {
      logger.error(
        "Couldn't get data from getPricePerFullShare, using pricePerShare...",
        'BeefyProtocol',
      );
      ppfs = await publicClient.readContract({
        address: vaultAddress,
        abi: beefyVaultAbi,
        functionName: 'pricePerShare',
      });
    }

    return ppfs;
  }

  /**
   * Reads the number of shares held by a wallet in a vault
   *
   * @internal
   * @category Helpers
   * @param publicClient Public viem client
   * @param vaultAddress Vault contract address
   * @param walletAddress User wallet address
   * @returns Bigint shares amount
   */
  private async getSharesAmount(
    publicClient: PublicClient,
    vaultAddress: Address,
    walletAddress: Address,
  ) {
    // 'share' is a share of moo tokens that a user received after a deposit
    const shares = await publicClient.readContract({
      address: vaultAddress,
      abi: beefyVaultAbi,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    return shares;
  }

  /**
   * Returns deposited balance information for a wallet
   *
   * @internal
   * @category Reads
   * @param vaultInfo Vault to query
   * @param walletAddress User wallet address
   * @returns Balance object with shares, ppfs, and deposited amount
   */
  async getBalance(vaultInfo: BeefyVaultInfo, walletAddress: Address): Promise<BeefyVaultBalance> {
    const publicClient = this.chainManager!.getPublicClient(this.selectedChainId!);
    const shares = await this.getSharesAmount(publicClient, vaultInfo.vaultAddress, walletAddress);

    if (shares === 0n) {
      return {
        shares: '0',
        depositedAmount: '0',
      };
    }

    // 'ppfs' is a Price Per Full Share per one base token. For example, 1.0 share == 1 USDC
    const ppfs = await this.readPpfs(publicClient, vaultInfo.vaultAddress);

    // 'underlying' is an actual price of a base token in the vault that a user deposited
    const underlyingRaw = (shares * ppfs) / ONE_E18;

    return {
      shares: formatUnits(shares, 18),
      ppfs: formatUnits(ppfs, 18),
      depositedAmount: formatUnits(underlyingRaw, vaultInfo.depositTokenDecimals),
    };
  }
}
