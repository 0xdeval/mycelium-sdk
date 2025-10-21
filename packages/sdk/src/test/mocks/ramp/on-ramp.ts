import type { CoinbaseCDPError, OnRampUrlResponse, RampConfigResponse } from '@/types/ramp';

export const onRampResponseMock: OnRampUrlResponse = {
  quote: {
    destinationNetwork: 'base',
    exchangeRate: '1',
    fees: [
      {
        amount: '2.44',
        currency: 'USD',
        type: 'FEE_TYPE_EXCHANGE',
      },
      {
        amount: '0',
        currency: 'USD',
        type: 'FEE_TYPE_NETWORK',
      },
    ],
    paymentCurrency: 'USD',
    paymentSubtotal: '97.56',
    paymentTotal: '100',
    purchaseAmount: '97.56',
    purchaseCurrency: 'USDC',
  },
  session: {
    onrampUrl:
      'https://pay.coinbase.com/buy?defaultPaymentMethod=CARD&fiatCurrency=USD&presetFiatAmount=100.00&quoteId=f3a59047-72c2-40d9-b299-fb7665366c35&redirectUrl=https%3A%2F%2Fyourapp.com%2Fsuccess&sessionToken=MWYwYWFiMWMtNjUwOS02NGJhLTk3YzktODY4MDI1Y2I0ZWNl',
  },
};

export const coinbaseCDPErrorMock: CoinbaseCDPError = {
  correlationId: '98f986a0d9d35bdc-IAD',
  errorLink: 'https://docs.cdp.coinbase.com/api-reference/v2/errors#invalid_request',
  errorMessage: 'InvalidRequest: payment method APPLE_PAY is not supported by country PT',
  errorType: 'invalid_request',
};

export const onRampConfigResponseMock: RampConfigResponse = {
  countries: [
    {
      id: 'AD',
      subdivisions: [],
      payment_methods: [
        {
          id: 'CARD',
        },
        {
          id: 'CRYPTO_ACCOUNT',
        },
        {
          id: 'FIAT_WALLET',
        },
      ],
    },
    {
      id: 'AE',
      subdivisions: [],
      payment_methods: [
        {
          id: 'CRYPTO_ACCOUNT',
        },
      ],
    },
  ],
};
