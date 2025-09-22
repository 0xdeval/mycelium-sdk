import type { ProtocolsRouterConfig } from "@/types/protocols/general";

/**
 * A class to validate if the api key tha was provided to a config is valid. The API key is used to access premium protocols with a higher APY
 * It is important to validate the API key to avoid any potential security issues or unexpected behavior
 */
export class ApiKeysValidator {
  // TODO: Implement the validation logic

  /**
   * Validate if the api key is valid
   * @param apiKey - The api key to validate
   * @returns True if the api key is valid, false otherwise
   */
  validate(apiKey: ProtocolsRouterConfig["apiKey"]) {
    return true;
  }
}
