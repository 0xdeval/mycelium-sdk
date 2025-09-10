import { BaseProtocol } from "./BaseProtocol";
import { BeefyProtocol } from "../implementations/BeefyProtocol";
// import { AaveProtocol } from "../implementations/AaveProtocol";
// import { MorphoProtocol } from "../implementations/MorphoProtocol";
import type { ChainManager } from "@/tools/ChainManager";

export class ProtocolManager {
  private protocols: Map<string, BaseProtocol> = new Map();
  private chainManager: ChainManager;

  constructor(chainManager: ChainManager) {
    this.chainManager = chainManager;
    this.initializeProtocols();
  }

  private initializeProtocols() {
    // Регистрируем все поддерживаемые протоколы
    this.protocols.set('beefy', new BeefyProtocol(this.chainManager));
    // this.protocols.set('aave', new AaveProtocol(this.chainManager));
    // this.protocols.set('morpho', new MorphoProtocol(this.chainManager));
  }

  getProtocol(protocolId: string): BaseProtocol | undefined {
    return this.protocols.get(protocolId);
  }

  getAllProtocols(): BaseProtocol[] {
    return Array.from(this.protocols.values());
  }

  getSupportedProtocols(chainId: number): BaseProtocol[] {
    return this.getAllProtocols().filter(protocol => 
      protocol.protocolInfo.supportedChains.includes(chainId)
    );
  }
}