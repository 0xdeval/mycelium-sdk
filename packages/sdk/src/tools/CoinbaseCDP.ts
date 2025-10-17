import { generateJwt } from '@coinbase/cdp-sdk/auth';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { CoinbaseCDPAuthParams, OnRampUrlResponse, CoinbaseCDPError } from '@/types/ramp';
import type { Address } from 'viem';
import type { ChainManager } from './ChainManager';
import { checkValidUrl } from '@/utils/urls';
import { chainById } from '@/utils/chains';

export class CoinbaseCDP {
  private readonly apiKeyId: string;
  private readonly apiKeySecret: string;
  private readonly chainManager: ChainManager;

  private readonly coinbaseCdpHostname: string = 'https://api.cdp.coinbase.com';

  private readonly onRampUrlAuthParams: CoinbaseCDPAuthParams = {
    requestMethod: 'POST',
    requestHost: 'api.cdp.coinbase.com',
    requestPath: '/platform/v2/onramp/sessions',
    expiresIn: 120,
  };

  private readonly client: AxiosInstance = axios.create({
    baseURL: this.coinbaseCdpHostname,
  });

  constructor(apiKeyId: string, apiKeySecret: string, chainManager: ChainManager) {
    this.apiKeyId = apiKeyId;
    this.apiKeySecret = apiKeySecret;
    this.chainManager = chainManager;
  }

  async auth(authParams: CoinbaseCDPAuthParams): Promise<string> {
    const jwtToken = await generateJwt({
      apiKeyId: this.apiKeyId,
      apiKeySecret: this.apiKeySecret,
      ...authParams,
    });

    return jwtToken;
  }

  async getOnRampLink(
    receiverAddress: Address,
    redirectUrl: string,
    amount: string,
    purchaseCurrency: string = 'USDC',
    paymentCurrency: string = 'USD',
    paymentMethod: string = 'CARD',
    country?: string,
  ): Promise<OnRampUrlResponse> {
    if (!checkValidUrl(redirectUrl)) {
      throw new Error('Redirect URL is not a valid URL');
    }

    const chainId = this.chainManager.getSupportedChain();
    const chainName = chainById[chainId]?.name.toLowerCase();

    const authJwtToken = await this.auth(this.onRampUrlAuthParams);

    const response: AxiosResponse<OnRampUrlResponse | CoinbaseCDPError> = await this.client.post(
      this.onRampUrlAuthParams.requestPath,
      {
        destinationAddress: receiverAddress,
        destinationNetwork: chainName,
        redirectUrl,
        paymentAmount: amount,
        purchaseCurrency,
        paymentCurrency,
        paymentMethod,
        country: country,
      },
      {
        method: this.onRampUrlAuthParams.requestMethod,
        headers: { Authorization: `Bearer ${authJwtToken}`, 'Content-Type': 'application/json' },
      },
    );

    if (response.status !== 200 && response.status !== 201) {
      const error = response.data as CoinbaseCDPError;
      throw error;
    }

    const onRampResponse = response.data as OnRampUrlResponse;

    return onRampResponse;
  }
}
