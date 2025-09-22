import type { SupportedChainId } from "@/constants/chains";
import { availableProtocols } from "@/constants/protocols";
import { ProtocolRouterBase } from "@/router/base/ProtocolRouterBase";
import type { ChainManager } from "@/tools/ChainManager";
import type {
  Protocol,
  ProtocolsRouterConfig,
} from "@/types/protocols/general";

export class ProtocolRouter extends ProtocolRouterBase {
  constructor(config: ProtocolsRouterConfig, chainManager: ChainManager) {
    super(config.riskLevel, chainManager, config.minApy, config.apiKey);
  }

  getProtocols(): Protocol[] {
    const isKeyValid = this.apiKeyValidator.validate(this.apiKey);

    // Filter protocols based on two conditions:
    // 1. Include all non-premium protocols
    // 2. Include premium protocols only if API key is valid
    const allAvailableProtocols = availableProtocols.filter((protocol) => {
      // Always include non-premium protocols
      if (!protocol.info.isPremium) {
        return true;
      }

      // Include premium protocols only if API key is valid
      return protocol.info.isPremium && isKeyValid;
    });

    return allAvailableProtocols;
  }

  isProtocolSupportedChain(chainIds: SupportedChainId[]): boolean {
    return chainIds.some(
      (chainId) => this.chainManager.getSupportedChain() === chainId
    );
  }

  recommend(): Protocol {
    const protocols = this.getProtocols();

    // TODO: Implement the recommendation logic => fetch pools for each protocol and then check APY for each pool to make sure the protocols is the best suited for the given router config
    // Filter protocols that match the risk level. Later on add more conditions for the recommendation
    const eligibleProtocols = protocols.filter((protocol) => {
      // Check if protocol matches risk level
      const riskMatches = protocol.info.riskLevel === this.riskLevel;

      const isSupportedChain = this.isProtocolSupportedChain(
        protocol.info.supportedChains
      );

      return riskMatches && isSupportedChain;
    });

    if (eligibleProtocols.length === 0) {
      throw new Error(
        `No protocols available for risk level: ${this.riskLevel}`
      );
    }

    // TODO: Add a smarter sorting of protocols here and then return the best one
    // For now, we just return the first protocol that matches the risk level
    const bestProtocol = eligibleProtocols[0];

    return bestProtocol!;
  }
}
