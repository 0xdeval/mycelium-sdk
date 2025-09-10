import type { Address } from "viem";
import { ProtocolManager } from "./base/ProtocolManager";
import type { VaultInfo, VaultTransactionResult, VaultBalance } from "@/types/protocol";

export class ProtocolNamespace {
  private protocolManager: ProtocolManager;

  constructor(protocolManager: ProtocolManager) {
    this.protocolManager = protocolManager;
  }

  // Universal methods for all protocols
  async deposit(amount: string, vaultInfo: VaultInfo, walletAddress: Address, chainId: number): Promise<VaultTransactionResult> {
    const protocol = this.protocolManager.getProtocol(vaultInfo.protocol);
    if (!protocol) {
      throw new Error(`Protocol ${vaultInfo.protocol} not supported`);
    }
    return protocol.deposit(amount, vaultInfo, walletAddress, chainId, smartWallet);
  }

  async withdraw(shares: string, vaultInfo: VaultInfo, walletAddress: Address, chainId: number): Promise<VaultTransactionResult> {
    const protocol = this.protocolManager.getProtocol(vaultInfo.protocol);
    if (!protocol) {
      throw new Error(`Protocol ${vaultInfo.protocol} not supported`);
    }
    return protocol.withdraw(shares, vaultInfo, walletAddress, chainId);
  }

  async getBalance(vaultInfo: VaultInfo, walletAddress: Address, chainId: number): Promise<VaultBalance> {
    const protocol = this.protocolManager.getProtocol(vaultInfo.protocol);
    if (!protocol) {
      throw new Error(`Protocol ${vaultInfo.protocol} not supported`);
    }
    return protocol.getBalance(vaultInfo, walletAddress, chainId);
  }

  // Specific methods for specific protocols
  getBeefy() {
    return this.protocolManager.getProtocol('beefy');
  }

  getAave() {
    return this.protocolManager.getProtocol('aave');
  }

  getMorpho() {
    return this.protocolManager.getProtocol('morpho');
  }
}