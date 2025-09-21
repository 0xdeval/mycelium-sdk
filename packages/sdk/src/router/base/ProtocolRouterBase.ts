import { ApiKeysValidator } from "@/tools/ApiKeysValidator";
import type {
  Protocol,
  ProtocolsRouterConfig,
} from "@/types/protocols/general";

/**
 * Base protocol router class
 * @description Abstract base class for protocol router implementations to recommend protocols (Beefy, Aave, Morpho, etc.).
 * Provides a standard interface for extracting best protocols for a given router config
 */
export abstract class ProtocolRouterBase {
  /** The risk level the is required by an integrator */
  public readonly riskLevel: ProtocolsRouterConfig["riskLevel"];

  /** The minimum apy that is required by an integrator */
  public readonly minApy?: ProtocolsRouterConfig["minApy"];

  /** The API key to access premium protocols with a higher APY*/
  public readonly apiKey?: string; // TODO: Add an API key validation

  /** The API key validator instance */
  public readonly apiKeyValidator: ApiKeysValidator = new ApiKeysValidator();

  /**
   * Create a protocol router instance
   * @param riskLevel - The risk level the is required by an integrator
   * @param minApy - The minimum apy that is required by an integrator
   */
  constructor(
    riskLevel: ProtocolsRouterConfig["riskLevel"],
    minApy?: ProtocolsRouterConfig["minApy"],
    apiKey?: ProtocolsRouterConfig["apiKey"]
  ) {
    this.riskLevel = riskLevel;
    this.minApy = minApy;
    this.apiKey = apiKey;
  }

  /**
   * Get all protocols that are supported by the router
   * @returns Promise resolving to an array of protocols
   */
  abstract getProtocols(): Protocol[];

  /**
   * Recommend a protocol based on a router config
   * @description Returns a protocol that is best suited for the given router config
   * @returns Promise resolving to a protocol
   */
  abstract recommend(): Protocol;
}
