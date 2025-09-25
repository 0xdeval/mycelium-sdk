import { BaseProtocol } from '@/protocols/base/BaseProtocol';
import { beefyVaultAbi } from '@/abis/protocols/beefyVault';
import type { VaultInfo, VaultTransactionResult, VaultBalance } from '@/types/protocols/beefy';
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

export class BeefyProtocol extends BaseProtocol {
  private vaultInfo: VaultInfo | undefined;
  private allVaults: VaultInfo[] = [];
  private selectedChainId: SupportedChainId | undefined;

  /**
   * @description Initialize the protocol with all necessary parameters for it
   * @param chainManager
   */
  async init(chainManager: ChainManager): Promise<void> {
    // TODO: Add more necessary parameters for the protocol init
    this.chainManager = chainManager;

    // TODO: Remove multiple chains support for now. Leave only one chain for SDK overall
    this.selectedChainId = chainManager.getSupportedChain();
    this.allVaults = await this.getVaults();
    console.log('===allVaults===', this.allVaults.length);
  }

  /**
   * @description Fetch all vaults for the protocol
   * @returns
   */
  async getVaults(): Promise<VaultInfo[]> {
    try {
      const [vaultsResponse, apyResponse, feesResponse, tvlResponse] = await Promise.all([
        fetch('https://api.beefy.finance/vaults'),
        fetch('https://api.beefy.finance/apy'),
        fetch('https://api.beefy.finance/fees'),
        fetch('https://api.beefy.finance/tvl')
      ]);

      const [vaults, apy, fees, tvl] = await Promise.all([
        vaultsResponse.json(),
        apyResponse.json(),
        feesResponse.json(),
        tvlResponse.json()
      ]);
      
      const enrichedVaults = vaults
        .filter((vault: any) => {
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
        .map((vault: any) => {
          const vaultId = vault.id;
          
          return {
            ...vault,
            apy: apy[vaultId] || 0,
            tvl: tvl[vaultId] || 0,
            fees: fees[vaultId] || {
              performance: { total: 0, call: 0, strategist: 0, treasury: 0, stakers: 0 },
              withdraw: 0,
              lastUpdated: Date.now()
            },
          };
        });
      console.log(`Enriched ${enrichedVaults.length} vaults for chain BASE`)

      return enrichedVaults as any;
    } catch (error) {
      console.error('Error fetching vaults:', error);
      throw error;
    }
  }

  /**
   * @description Get the best vault for the protocol to deposit based on the given parameters
   * @returns
   */
  async getBestVault(): Promise<VaultInfo> {
    // TODO: Implement the logic of getting the best vault for the protocol
    // TODO: Also implement logic of getting the best vault among all supported by the protocol chains
    // TODO: Check and take into account that a user could already have deposit to a vault

    console.log('===getBestVault===', this.allVaults.length);
    if (this.allVaults.length === 0) {
      throw new Error('No vaults found');
    }
    const sortedVaults = this.allVaults.sort((a, b) => {
      const apyA = (a as any).apy || 0;
      const apyB = (b as any).apy || 0;
      return apyB - apyA; // desc order
    });

    const bestVault = sortedVaults[0]!;
    console.log('bestVault', bestVault);
    return { ...bestVault };
  }

  /**
   * @description Fetch a vault where a user deposited funds previously
   * @param smartWallet
   * @returns
   */
  async fetchDepositedVaults(smartWallet: SmartWallet): Promise<VaultInfo | null> {
    // TODO: Support logic for fetching info about vaults where a user already deposited funds previously:
    // 1. Fetch all vaults
    // 2. Check balance of each vault token for a provided wallet address
    // 3. Return all vaults where the balance is greater than 0. It means a user deposited to this vault previously

    let depositedVaults: VaultInfo | undefined = undefined;
    const userAddress = await smartWallet.getAddress();
    for (const vault of this.allVaults) {
      const balance = await this.getBalance(vault, userAddress);
      if (parseInt(balance.depositedAmount) > 0) {
        depositedVaults = vault;
      }
    }
    console.log('depositedVaults', depositedVaults);

    return depositedVaults || null;
  }

  /**
   * @description Deposit funds into a best vault for the protocol OR to the same vault where a user deposited previously
   * @param amount
   * @param smartWallet
   * @returns
   */
  async deposit(amount: string, smartWallet: SmartWallet): Promise<VaultTransactionResult> {
    // Check if a user deposited previously to any vault of the protocol
    const depositedVault = await this.fetchDepositedVaults(smartWallet);
    if (depositedVault) {
      this.vaultInfo = depositedVault;
    } else {
      // Find the best pool to deposit for a protocol
      this.vaultInfo = await this.getBestVault();
    }

    if (!this.vaultInfo!.tokenDecimals) {
      throw new Error('TokenDecimals is undefined');
    }

    // const chainId = this.vaultInfo!.chainId!;
    const currentAddress = await smartWallet.getAddress();

    const operationsCallData = [];

    const rawDepositAmount = parseUnits(amount, this.vaultInfo!.tokenDecimals);

    const allowance = await this.checkAllowance(
      this.vaultInfo!.tokenAddress,
      this.vaultInfo!.earnContractAddress,
      currentAddress,
      this.selectedChainId!,
    );

    if (allowance < rawDepositAmount) {
      const approveData = {
        to: this.vaultInfo!.tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [this.vaultInfo!.earnContractAddress, rawDepositAmount],
        }),
      };

      operationsCallData.push(approveData);
    }

    const depositData = {
      to: this.vaultInfo!.earnContractAddress,
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
   * @description Partially withdraw funds from a vault
   */
  async withdraw(
    shares: string | undefined,
    vaultInfo: VaultInfo,
    walletAddress: Address,
    chainId: SupportedChainId,
    smartWallet: SmartWallet
  ): Promise<VaultTransactionResult> {
    let operationsCallData = [];

    let withdrawData;
    
    if (shares) {
      console.log("Withdrawing shares:", shares, "from vault:", vaultInfo.name);
      const rawSharesAmount = parseUnits(shares, 18);
      withdrawData = {
        to: vaultInfo.earnContractAddress,
        data: encodeFunctionData({
          abi: beefyVaultAbi,
          functionName: "withdraw",
          args: [rawSharesAmount],
        }),
      };
    } else {
      console.log("Withdrawing all funds from vault:", vaultInfo.name);
      withdrawData = {
        to: vaultInfo.earnContractAddress,
        data: encodeFunctionData({
          abi: beefyVaultAbi,
          functionName: "withdrawAll",
          args: [],
        }),
      };
    }

    operationsCallData.push(withdrawData);

    const hash = await smartWallet.sendBatch(
      operationsCallData,
      chainId
    );

    return { hash, success: true };
  }

  /**
   * @description Read the price per full share from the vault
   *
   * @param publicClient
   * @param vaultAddress
   * @returns
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
      console.log("Couldn't get data from getPricePerFullShare, using pricePerShare...");
      ppfs = await publicClient.readContract({
        address: vaultAddress,
        abi: beefyVaultAbi,
        functionName: 'pricePerShare',
      });
    }

    return ppfs;
  }

  /**
   * @description Get the balance of deposited funds to a vault
   *
   * @param vaultInfo
   * @param walletAddress
   * @returns
   */
  async getBalance(vaultInfo: VaultInfo, walletAddress: Address): Promise<VaultBalance> {
    // const chainId = vaultInfo.chainId!;

    const publicClient = this.chainManager!.getPublicClient(this.selectedChainId!);

    // 'share' is a share of moo tokens that a user received after a deposit
    const shares = await publicClient.readContract({
      address: vaultInfo.earnContractAddress,
      abi: beefyVaultAbi,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    if (shares === 0n) {
      return {
        shares: '0',
        depositedAmount: '0',
      };
    }

    // 'ppfs' is a Price Per Full Share per one base token. For example, 1.0 share == 1 USDC
    const ppfs = await this.readPpfs(publicClient, vaultInfo.earnContractAddress);

    const ONE_E18 = 10n ** 18n;

    // 'underlying' is an actual price of a base token in the vault that a user deposited
    const underlyingRaw = (shares * ppfs) / ONE_E18;

    return {
      shares: formatUnits(shares, 18),
      ppfs: formatUnits(ppfs, 18),
      depositedAmount: formatUnits(underlyingRaw, vaultInfo.tokenDecimals),
    };
  }
}
