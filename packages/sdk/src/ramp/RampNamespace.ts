import type { CoinbaseCDP } from '@/tools/CoinbaseCDP';
import type { RampConfigResponse } from '@/types/ramp';

/**
 * Ramp namespace to manage ramp operations via {@link CoinbaseCDP} service
 * @public
 * @category Tools
 */
export class RampNamespace {
  private readonly coinbaseCDP: CoinbaseCDP | null = null;

  constructor(coinbaseCDP: CoinbaseCDP) {
    if (!coinbaseCDP) {
      throw new Error(
        'Coinbase CDP is not initialized. Please, provide the configuration in the SDK initialization',
      );
    }

    this.coinbaseCDP = coinbaseCDP;
  }

  /**
   * Return all supported countries and payment methods for on-ramp by Coinbase CDP
   * @public
   * @category Ramp
   *
   * @returns @see {@link RampConfigResponse} with supported countries and payment methods for top-up
   * @throws If API returned an error
   */
  async getTopUpConfig(): Promise<RampConfigResponse> {
    return await this.coinbaseCDP!.getOnRampConfig();
  }

  /**
   * Return all supported countries and payment methods for off-ramp by Coinbase CDP
   * @public
   * @category Ramp
   *
   *
   * @returns @see {@link RampConfigResponse} with supported countries and payment methods for cash out
   * @throws If API returned an error
   */
  async getCashOutConfig(): Promise<RampConfigResponse> {
    return await this.coinbaseCDP!.getOffRampConfig();
  }
}
