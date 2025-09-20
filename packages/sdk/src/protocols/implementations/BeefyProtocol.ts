import { BaseProtocol } from "@/protocols/base/BaseProtocol";
import { beefyVaultAbi } from "@/abis/protocols/beefyVault";
import { parseUnits, type Address, formatUnits } from "viem";
import type {
  VaultInfo,
  VaultTransactionResult,
  VaultBalance,
} from "@/types/protocol";
import type { ChainManager } from "@/tools/ChainManager";
import type { SupportedChainId } from "@/constants/chains";
import type { PublicClient } from "viem";
import { encodeFunctionData } from "viem";
import { erc20Abi } from "viem";
import type { SmartWallet } from "@/wallet/base/wallets/SmartWallet";

export class BeefyProtocol extends BaseProtocol {
  constructor(chainManager: ChainManager) {
    super(chainManager, {
      id: "beefy",
      name: "Beefy Finance",
      website: "https://beefy.finance",
      logo: "/logos/beefy.png",
      supportedChains: [1],
      riskLevel: "medium",
    });
  }

  async deposit(
    amount: string,
    vaultInfo: VaultInfo,
    walletAddress: Address,
    chainId: SupportedChainId,
    smartWallet: SmartWallet
  ): Promise<VaultTransactionResult> {
    console.log("VaultInfo:", vaultInfo);
    console.log("TokenDecimals:", vaultInfo.tokenDecimals);

    if (!vaultInfo.tokenDecimals) {
      throw new Error("TokenDecimals is undefined");
    }

    let operationsCallData = [];

    const rawDepositAmount = parseUnits(amount, vaultInfo.tokenDecimals);

    const allowance = await this.checkAllowance(
      vaultInfo.tokenAddress,
      vaultInfo.earnContractAddress,
      walletAddress,
      chainId
    );

    if (allowance < rawDepositAmount) {
      const approveData = {
        to: vaultInfo.tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [vaultInfo.earnContractAddress, rawDepositAmount],
        }),
      };

      operationsCallData.push(approveData);
    }

    const depositData = {
      to: vaultInfo.earnContractAddress,
      data: encodeFunctionData({
        abi: beefyVaultAbi,
        functionName: "deposit",
        args: [rawDepositAmount],
      }),
    };

    operationsCallData.push(depositData);

    const hash = await smartWallet.sendBatch(operationsCallData, chainId);

    return { hash, success: true };
  }

  async withdraw(): Promise<VaultTransactionResult> {
    throw new Error("'withdraw' is not yet implemented");
  }

  async withdrawAll(): Promise<VaultTransactionResult> {
    throw new Error("'withdrawAll' is not yet implemented");
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
        functionName: "getPricePerFullShare",
      });
    } catch {
      console.log(
        "Couldn't get data from getPricePerFullShare, using pricePerShare..."
      );
      ppfs = await publicClient.readContract({
        address: vaultAddress,
        abi: beefyVaultAbi,
        functionName: "pricePerShare",
      });
    }

    return ppfs;
  }

  async getBalance(
    vaultInfo: VaultInfo,
    walletAddress: Address,
    chainId: SupportedChainId
  ): Promise<VaultBalance> {
    const publicClient = this.chainManager.getPublicClient(chainId);

    // 'share' is a share of moo tokens that a user received after a deposit
    const shares = await publicClient.readContract({
      address: vaultInfo.earnContractAddress,
      abi: beefyVaultAbi,
      functionName: "balanceOf",
      args: [walletAddress],
    });

    if (shares === 0n) {
      return {
        shares: "0",
        depositedAmount: "0",
      };
    }

    // 'ppfs' is a Price Per Full Share per one base token. For example, 1.0 share == 1 USDC
    const ppfs = await this.readPpfs(
      publicClient,
      vaultInfo.earnContractAddress
    );

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
