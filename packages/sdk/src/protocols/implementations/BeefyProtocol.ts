import { BaseProtocol } from "../base/BaseProtocol";
import { beefyVaultAbi } from "@/abis/protocols/beefyVault";
import { parseUnits, createWalletClient, http, type Address } from "viem";
import type { VaultInfo, VaultTransactionResult, VaultBalance } from "@/types/protocol";
import type { ChainManager } from "@/tools/ChainManager";
import type { SupportedChainId } from "@/constants/chains";
import type { LocalAccount } from "viem";
import { encodeFunctionData } from "viem";
import { erc20Abi } from "viem";
import type { SmartWallet } from "@/wallet/base/wallets/SmartWallet";

export class BeefyProtocol extends BaseProtocol {
  constructor(chainManager: ChainManager) {
    super(chainManager, {
      id: 'beefy',
      name: 'Beefy Finance',
      website: 'https://beefy.finance',
      logo: '/logos/beefy.png',
      supportedChains: [1],
      riskLevel: 'medium'
    });
  }

  async deposit(amount: string, vaultInfo: VaultInfo, walletAddress: Address, chainId: SupportedChainId, smartWallet: SmartWallet): Promise<VaultTransactionResult> {
    const amountWei = parseUnits(amount, vaultInfo.tokenDecimals);

      const smartWalletAddress = await smartWallet.getAddress();
  const code = await this.chainManager.getPublicClient(chainId).getCode({
    address: smartWalletAddress
  });
    
    console.log('====== Code: ====== ', code, smartWalletAddress);
  
  if (code === '0x') {
    console.log('Smart Wallet not deployed, deploying...', smartWalletAddress);
    // Развертываем Smart Wallet пустой транзакцией
    const deployData = {
      to: "0x5E2Bd40bcC8a85186A9d7E5E23bb58a6CFEbA9b7" as const,
      value: 0n,
      data: '0x' as const,
    };
    await smartWallet.send(deployData, chainId);
  }
      const allowance = await this.checkAllowance(vaultInfo.tokenAddress, vaultInfo.earnContractAddress, walletAddress, chainId);
  
  if (allowance < amountWei) {
    const approveData = {
      to: vaultInfo.tokenAddress,
      value: 0n,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [vaultInfo.earnContractAddress, amountWei],
      }),
    };
    
    await smartWallet.send(approveData, chainId);
  }

  const depositData = {
    to: vaultInfo.earnContractAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: beefyVaultAbi,
      functionName: "deposit",
      args: [amountWei],
    }),
  };

  const hash = await smartWallet.send(depositData, chainId);
    // const allowance = await this.checkAllowance(vaultInfo.tokenAddress, vaultInfo.earnContractAddress, walletAddress, chainId);
    // if (allowance < amountWei) {
    //   await this.approveToken(vaultInfo.tokenAddress, vaultInfo.earnContractAddress, amountWei, walletAddress, chainId, account);
    // }

    // const walletClient = createWalletClient({
    //   account,
    //   chain: this.chainManager.getChain(chainId),
    //   transport: http(this.chainManager.getRpcUrl(chainId)),
    // });

    // const hash = await walletClient.writeContract({
    //   address: vaultInfo.earnContractAddress,
    //   abi: beefyVaultAbi,
    //   functionName: "deposit",
    //   args: [amountWei],
    // });

    return { hash, success: true };
  }

  async withdraw(shares: string, vaultInfo: VaultInfo, walletAddress: Address, chainId: SupportedChainId, smartWallet: SmartWallet): Promise<VaultTransactionResult> {
    const sharesWei = parseUnits(shares, vaultInfo.tokenDecimals);
    return { hash: '', success: true };
    // const walletClient = createWalletClient({
    //   account,
    //   chain: this.chainManager.getChain(chainId),
    //   transport: http(this.chainManager.getRpcUrl(chainId)),
    // });

    // const hash = await walletClient.writeContract({
    //   address: vaultInfo.earnContractAddress,
    //   abi: beefyVaultAbi,
    //   functionName: "withdraw",
    //   args: [sharesWei],
    // });

    // return { hash, success: true };

  }

  async withdrawAll(vaultInfo: VaultInfo, walletAddress: Address, chainId: SupportedChainId, smartWallet: SmartWallet): Promise<VaultTransactionResult> {
    return { hash: '', success: true };
    // const walletClient = createWalletClient({
    //   account,
    //   chain: this.chainManager.getChain(chainId),
    //   transport: http(this.chainManager.getRpcUrl(chainId)),
    // });

    // const hash = await walletClient.writeContract({
    //   address: vaultInfo.earnContractAddress,
    //   abi: beefyVaultAbi,
    //   functionName: "withdrawAll",
    //   args: [],
    // });

    // return { hash, success: true };
  }

  async getBalance(vaultInfo: VaultInfo, walletAddress: Address, chainId: SupportedChainId): Promise<VaultBalance> {
    const publicClient = this.chainManager.getPublicClient(chainId);
    const balance = await publicClient.readContract({
      address: vaultInfo.earnContractAddress,
      abi: beefyVaultAbi,
      functionName: "balanceOf",
      args: [walletAddress],
    });

    return {
      balance: balance.toString(),
      shares: balance.toString(),
      value: balance.toString(),
    };
  }
}