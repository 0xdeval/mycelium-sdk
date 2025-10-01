import { BaseProtocol } from '@/protocols/base/BaseProtocol';
import type { ChainManager } from '@/tools/ChainManager';
import type { SupportedChainId } from '@/constants/chains';
import type { SmartWallet } from '@/wallet/base/wallets/SmartWallet';
import type {
  SparkVaultInfo,
  SparkVaultTransactionResult,
  SparkVaultBalance,
} from '@/types/protocols/spark';

import { type Address, encodeFunctionData, erc20Abi, formatUnits, parseUnits } from 'viem';

import { ERC4626_ABI } from '@/abis/protocols/erc4626';
import { mockVaultInfo } from '@/test/mocks/protocols/spark';

export class SparkProtocol extends BaseProtocol<
  SparkVaultInfo,
  SparkVaultBalance,
  SparkVaultTransactionResult
> {
  private selectedChainId: SupportedChainId | undefined;
  private vault: SparkVaultInfo | undefined;

  async init(chainManager: ChainManager): Promise<void> {
    this.chainManager = chainManager;
    this.selectedChainId = chainManager.getSupportedChain();

    const entry = mockVaultInfo;

    this.vault = entry;
  }
  getVaults(): Promise<SparkVaultInfo[]> {
    return Promise.resolve([this.vault]) as Promise<SparkVaultInfo[]>;
  }
  getBestVault(): Promise<SparkVaultInfo> {
    return Promise.resolve(this.vault) as Promise<SparkVaultInfo>;
  }
  fetchDepositedVaults(): Promise<SparkVaultInfo | null> {
    return Promise.resolve(this.vault) as Promise<SparkVaultInfo | null>;
  }
  async deposit(amount: string, smartWallet: SmartWallet): Promise<SparkVaultTransactionResult> {
    if (!this.vault || !this.selectedChainId) {throw new Error('Spark not initialized');}

    const owner = await smartWallet.getAddress();
    const assets = parseUnits(amount, this.vault.underlyingDecimals);

    const allowance = await this.checkAllowance(
      this.vault.underlyingAddress,
      this.vault.vaultAddress,
      owner,
      this.selectedChainId,
    );

    const ops: { to: Address; data: `0x${string}` }[] = [];

    if (allowance < assets) {
      ops.push({
        to: this.vault.underlyingAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [this.vault.vaultAddress, assets],
        }),
      });
    }
    ops.push({
      to: this.vault.vaultAddress,
      data: encodeFunctionData({
        abi: ERC4626_ABI,
        functionName: 'deposit',
        args: [assets, owner] as const,
      }),
    });

    const hash = await smartWallet.sendBatch(ops, this.selectedChainId);
    return { success: true, hash };
  }
  async withdraw(
    amountInShares: string,
    smartWallet: SmartWallet,
  ): Promise<SparkVaultTransactionResult> {
    if (!this.vault || !this.selectedChainId) {throw new Error('Spark not initialized');}

    const owner = await smartWallet.getAddress();
    const assets = parseUnits(amountInShares, this.vault.underlyingDecimals);

    const ops: { to: Address; data: `0x${string}` }[] = [];

    ops.push({
      to: this.vault.vaultAddress,
      data: encodeFunctionData({
        abi: ERC4626_ABI,
        functionName: 'withdraw',
        args: [assets, owner, owner] as const,
      }),
    });

    const hash = await smartWallet.sendBatch(ops, this.selectedChainId);
    return { success: true, hash };
  }
  async getBalance(vaultInfo: SparkVaultInfo, walletAddress: Address): Promise<SparkVaultBalance> {
    if (!this.vault || !this.selectedChainId) {throw new Error('Spark not initialized');}

    const publicClient = this.chainManager!.getPublicClient(this.selectedChainId);

    const shares = await publicClient.readContract({
      address: vaultInfo.vaultAddress,
      abi: ERC4626_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    if (shares === 0n) {return { shares: '0', depositedAmount: '0' };}

    const assets = await publicClient.readContract({
      address: vaultInfo.vaultAddress,
      abi: ERC4626_ABI,
      functionName: 'convertToAssets',
      args: [shares],
    });

    return {
      shares: formatUnits(shares, this.vault.shareDecimals),
      depositedAmount: formatUnits(assets, this.vault.underlyingDecimals),
    };
  }
}
