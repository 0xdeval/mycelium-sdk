import type { ChainManager } from "@/tools/ChainManager";
import type { ProtocolInfo, VaultInfo, VaultOperations, VaultTransactionResult, VaultBalance } from "@/types/protocol";
import type { Address, LocalAccount } from "viem";
import { erc20Abi, createWalletClient, http, parseGwei } from "viem";
import type { SupportedChainId } from "@/constants/chains";
import type { SmartWallet } from "@/wallet/base/wallets/SmartWallet";

export abstract class BaseProtocol implements VaultOperations {
  protected chainManager: ChainManager;
  public readonly protocolInfo: ProtocolInfo;

  constructor(chainManager: ChainManager, protocolInfo: ProtocolInfo) {
    this.chainManager = chainManager;
    this.protocolInfo = protocolInfo;
  }

  // Abstract methods that must be implemented by specific protocols
  abstract deposit(amount: string, vaultInfo: VaultInfo, walletAddress: Address, chainId: SupportedChainId, smartWallet: SmartWallet): Promise<VaultTransactionResult>;
  abstract withdraw(shares: string, vaultInfo: VaultInfo, walletAddress: Address, chainId: SupportedChainId, smartWallet: SmartWallet): Promise<VaultTransactionResult>;
  abstract withdrawAll(vaultInfo: VaultInfo, walletAddress: Address, chainId: SupportedChainId, smartWallet: SmartWallet): Promise<VaultTransactionResult>;
  abstract getBalance(vaultInfo: VaultInfo, walletAddress: Address, chainId: SupportedChainId): Promise<VaultBalance>;

  // Common methods for all protocols
  protected async approveToken(
    tokenAddress: Address,
    spenderAddress: Address,
    amount: bigint,
    walletAddress: Address,
    chainId: SupportedChainId,
    account: LocalAccount
  ): Promise<string> {
    const walletClient = createWalletClient({
      account,
      chain: this.chainManager.getChain(chainId),
      transport: http(this.chainManager.getRpcUrl(chainId)),
    });
    
    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
        args: [spenderAddress, amount],
            gas: 100000n,
      maxFeePerGas: parseGwei('20'), // Увеличиваем gas price
      maxPriorityFeePerGas: parseGwei('2'),
    });

    return hash;
  }

  protected async checkAllowance(
    tokenAddress: Address,
    spenderAddress: Address,
    walletAddress: Address,
    chainId: SupportedChainId
  ): Promise<bigint> {
    const publicClient = this.chainManager.getPublicClient(chainId);
    
    return await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [walletAddress, spenderAddress],
    });
  }
}