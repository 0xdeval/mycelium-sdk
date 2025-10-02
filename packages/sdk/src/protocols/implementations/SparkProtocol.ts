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

// TODO:  init should take SmartWallet instance and then init this.vaultInfo. After this, this.vaultInfo should be used for all other methods.
export class SparkProtocol extends BaseProtocol<
  SparkVaultInfo,
  SparkVaultBalance,
  SparkVaultTxnResult
> {
  private selectedChainId: SupportedChainId | undefined;
  private vaultInfo: SparkVaultInfo | undefined;
  private allVaults: SparkVaultInfo[] = [];

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
    return SPARK_VAULT;
  }

  /**
   * @description Get the best vault from a Spark protocol based on all fetched vaults
   * @returns The best vault
   */
  getBestVault(): SparkVaultInfo {
    if (this.allVaults.length === 0) {
      throw new Error('No vaults found');
    }

    const sortedVaults = this.allVaults.sort((a, b) => {
      const apyA = a.metadata?.apy || 0;
      const apyB = b.metadata?.apy || 0;
      return apyB - apyA;
    });
    return sortedVaults[0]!;
  }

  /**
   *
   * @description Fetch a vault where a user deposited funds previously
   * @returns The vault
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
   * @description Deposit funds into a Spark protocol
   * @param amount The amount of funds to deposit
   * @param smartWallet The smart wallet to deposit funds from
   * @returns The transaction result
   */
  async deposit(amount: string, smartWallet: SmartWallet): Promise<SparkVaultTxnResult> {
    // Check if a user deposited previously to any vault of the protocol
    const depositedVault = await this.fetchDepositedVaults(smartWallet);

    logger.info('Previously deposited vault:', { depositedVault }, 'BeefyProtocol');
    if (depositedVault) {
      this.vaultInfo = depositedVault;
    } else {
      // Find the best pool to deposit for a protocol
      this.vaultInfo = this.getBestVault();
      logger.info('Best vault that found:', { bestVault: this.vaultInfo }, 'BeefyProtocol');
    }

    const owner = await smartWallet.getAddress();
    const assets = parseUnits(amount, this.vaultInfo.depositTokenDecimals);

    const allowance = await this.checkAllowance(
      this.vaultInfo.depositTokenAddress,
      this.vaultInfo.vaultAddress,
      owner,
      this.selectedChainId!,
    );

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
   * @description Withdraw funds from a Spark protocol
   * @param amountInShares The amount of shares to withdraw
   * @param smartWallet The smart wallet to withdraw funds from
   * @returns The transaction result
   */
  async withdraw(amountInShares: string, smartWallet: SmartWallet): Promise<SparkVaultTxnResult> {
    const vaultInfo = await this.fetchDepositedVaults(smartWallet);

    if (!vaultInfo) {
      throw new Error('No vault found to withdraw from');
    }

    const owner = await smartWallet.getAddress();
    const assets = parseUnits(amountInShares, vaultInfo.depositTokenDecimals);

    const ops: { to: Address; data: `0x${string}` }[] = [];

    ops.push({
      to: vaultInfo.vaultAddress,
      data: encodeFunctionData({
        abi: ERC4626_ABI,
        functionName: 'withdraw',
        args: [assets, owner, owner] as const,
      }),
    });

    const hash = await smartWallet.sendBatch(ops, this.selectedChainId!);
    return { success: true, hash };
  }

  /**
   * @description Get the balance of a vault
   * @param vaultInfo The vault info
   * @param walletAddress The address of the wallet
   * @returns The balance of the vault
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
