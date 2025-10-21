export interface CoinbaseCDPAuthParams {
  requestMethod: string;
  requestHost: string;
  requestPath: string;
  expiresIn?: number;
}

/**
 * The quote and session URL for a valid on-ramp operation
 * @public
 * @category Types
 */
export interface OnRampUrlResponse {
  quote?: {
    destinationNetwork: string;
    exchangeRate: string;
    fees: Array<{
      amount: string;
      currency: string;
      type: string;
    }>;
    paymentCurrency: string;
    paymentSubtotal: string;
    paymentTotal: string;
    purchaseAmount: string;
    purchaseCurrency: string;
  };
  session?: {
    onrampUrl: string;
  };
}

interface OffRampUrlResponseSellingParams {
  value: string;
  currency: string;
}

/**
 * Details and a URL link for a valid off-ramp operation
 * @public
 * @category Types
 */
export interface OffRampUrlResponse {
  cashout_total: OffRampUrlResponseSellingParams;
  cashout_subtotal: OffRampUrlResponseSellingParams;
  sell_amount: OffRampUrlResponseSellingParams;
  coinbase_fee: OffRampUrlResponseSellingParams;
  quote_id: string;
  offramp_url: string;
}

export interface CoinbaseCDPError {
  correlationId: string;
  errorLink: string;
  errorMessage: string;
  errorType: string;
}

interface RampConfigPaymentMethod {
  id: string;
}

interface RampConfigCountryWithMethods {
  id: string;
  subdivisions?: string[];
  payment_methods?: RampConfigPaymentMethod[];
}

/**
 * The list of countries and payment methods for on/off-ramp
 * @public
 * @category Types
 */
export interface RampConfigResponse {
  countries: RampConfigCountryWithMethods[];
}
