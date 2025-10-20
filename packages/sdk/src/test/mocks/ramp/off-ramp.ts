import type { CashOutUrlResponse, RampConfigResponse } from '@/types/ramp';

export const offRampConfigResponseMock: RampConfigResponse = {
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

export const offRampResponseMock: CashOutUrlResponse = {
  cashout_total: {
    value: '99',
    currency: 'USD',
  },
  cashout_subtotal: {
    value: '100',
    currency: 'USD',
  },
  sell_amount: {
    value: '100',
    currency: 'USDC',
  },
  coinbase_fee: {
    value: '1',
    currency: 'USD',
  },
  quote_id: '68762d91-642e-4994-b6fa-28b1f520d11a',
  offramp_url:
    'https://pay.coinbase.com/v3/sell/input?defaultAsset=USDC&defaultCashoutMethod=FIAT_WALLET&partnerUserId=mycleium&presetCryptoAmount=100&quoteId=68762d91-642e-4994-b6fa-28b1f520d11a&redirectUrl=https%3A%2F%2Fmysite.com&sessionToken=MWYwYWQxYTQtYjE4Mi02YzAzLWE3N2YtMzI2ZWY1YzlkMTc0',
};
