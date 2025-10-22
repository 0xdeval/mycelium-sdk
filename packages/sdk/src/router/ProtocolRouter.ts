import type { SupportedChainId } from '@/constants/chains';
import { availableProtocols } from '@/constants/protocols';
import { ProtocolRouterBase } from '@/router/base/ProtocolRouterBase';
import type { ChainManager } from '@/tools/ChainManager';
import type { Protocol, ProtocolsRouterConfig } from '@/types/protocols/general';

/**
 * Protocol Router
 *
 * @internal
 * @category Protocols
 * @remarks
 * Selects and recommends protocols for yield strategies based on router configuration,
 * available protocols, and API key for paid protocols
 */
export class ProtocolRouter extends ProtocolRouterBase {
  /**
   * Initialize the protocol router
   * @param config Router configuration including risk level, min APY, and optional API key
   * @param chainManager Chain manager instance for network validation
   */
  constructor(config: ProtocolsRouterConfig, chainManager: ChainManager) {
    super(config.riskLevel, chainManager, config.minApy, config.apiKey);
  }
  /**
   * Get all protocols available for the current configuration
   *
   * Includes all non-premium protocols and premium protocols if the API key is valid
   * @returns Array of available protocol definitions
   */
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

  /**
   * Check if any protocol supports a given set of chains
   * @param chainIds List of chain IDs to validate
   * @returns True if at least one chain is supported by the router
   */
  isProtocolSupportedChain(chainIds: SupportedChainId[]): boolean {
    return chainIds.some((chainId) => this.chainManager.getSupportedChain() === chainId);
  }

  /**
   * Recommend the best protocol for the current router configuration
   *
   * Filters available protocols by risk level and supported chains. More criteria will be added later on
   *
   *
   * @remarks
   * Currently returns the first match. Future improvements will add
   * smarter sorting and pool-based APY checks
   *
   * @throws Error if no protocols are available for the current risk level
   * @returns Protocol instance considered the best match
   */
  recommend(): Protocol {
    const protocols = this.getProtocols();

    // TODO: Implement the recommendation logic => fetch pools for each protocol and then check APY for each pool to make sure the protocols is the best suited for the given router config
    // Filter protocols that match the risk level. Later on add more conditions for the recommendation
    const eligibleProtocols = protocols.filter((protocol) => {
      // Check if protocol matches risk level
      const riskMatches = protocol.info.riskLevel === this.riskLevel;

      const isSupportedChain = this.isProtocolSupportedChain(protocol.info.supportedChains);

      return riskMatches && isSupportedChain;
    });

    if (eligibleProtocols.length === 0) {
      throw new Error(`No protocols available for risk level: ${this.riskLevel}`);
    }

    // TODO: Add a smarter sorting of protocols here and then return the best one
    // For now, we just return the first protocol that matches the risk level
    const bestProtocol = eligibleProtocols[0];

    return bestProtocol!;
  }
}
