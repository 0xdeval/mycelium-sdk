export interface CoinbaseCDPAuthParams {
  requestMethod: string;
  requestHost: string;
  requestPath: string;
  expiresIn?: number;
}

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

export interface CoinbaseCDPError {
  correlationId: string;
  errorLink: string;
  errorMessage: string;
  errorType: string;
}
