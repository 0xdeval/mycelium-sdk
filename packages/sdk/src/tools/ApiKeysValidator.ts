import type { ProtocolsRouterConfig } from '@/types/protocols/general';
import { logger } from '@/tools/Logger';

/**
 * Utility class for validating API keys used in protocol configurations
 *
 * @internal
 * @category Utilities
 * @remarks
 * API keys may be required for accessing premium protocols with higher APY
 * Validation helps prevent invalid configurations and potential security risks
 */
export class ApiKeysValidator {
  // TODO: Implement the validation logic

  /**
   * Validates whether the provided API key is valid
   *
   * @internal
   * @param apiKey API key from {@link ProtocolsRouterConfig}
   * @returns True if the API key is considered valid
   */
  validate(apiKey: ProtocolsRouterConfig['apiKey']) {
    logger.info('Validating api key...', apiKey, 'ApiKeysValidator');
    return true;
  }
}
