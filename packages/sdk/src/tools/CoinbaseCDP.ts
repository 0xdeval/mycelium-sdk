import { generateJwt } from '@coinbase/cdp-sdk/auth';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
  CoinbaseCDPAuthParams,
  TopUpUrlResponse,
  CoinbaseCDPError,
  RampConfigResponse,
  CashOutUrlResponse,
} from '@/types/ramp';
import type { Address } from 'viem';
import type { ChainManager } from '@/tools/ChainManager';
import { checkValidUrl } from '@/utils/urls';
import { chainById } from '@/utils/chains';

export class CoinbaseCDP {
  private readonly apiKeyId: string;
  private readonly apiKeySecret: string;
  private readonly chainManager: ChainManager;
  private readonly integratorId: string;

  private readonly coinbaseCdpV2Hostname: string = 'https://api.cdp.coinbase.com';
  private readonly coinbaseCdpV1Hostname: string = 'https://api.developer.coinbase.com';

  private readonly onRampUrlAuthParams: CoinbaseCDPAuthParams = {
    requestMethod: 'POST',
    requestHost: 'api.cdp.coinbase.com',
    requestPath: '/platform/v2/onramp/sessions',
    expiresIn: 120,
  };

  private readonly onRampConfigAuthParams: CoinbaseCDPAuthParams = {
    requestMethod: 'GET',
    requestHost: 'api.developer.coinbase.com',
    requestPath: '/onramp/v1/buy/config',
    expiresIn: 120,
  };

  private readonly offRampUrlAuthParams: CoinbaseCDPAuthParams = {
    requestMethod: 'POST',
    requestHost: 'api.developer.coinbase.com',
    requestPath: '/onramp/v1/sell/quote',
    expiresIn: 120,
  };

  private readonly offRampConfigAuthParams: CoinbaseCDPAuthParams = {
    requestMethod: 'GET',
    requestHost: 'api.developer.coinbase.com',
    requestPath: '/onramp/v1/sell/config',
    expiresIn: 120,
  };

  private readonly clientV2: AxiosInstance = axios.create({
    baseURL: this.coinbaseCdpV2Hostname,
  });
  private readonly clientV1: AxiosInstance = axios.create({
    baseURL: this.coinbaseCdpV1Hostname,
  });
  constructor(
    apiKeyId: string,
    apiKeySecret: string,
    integratorId: string,
    chainManager: ChainManager,
  ) {
    this.apiKeyId = apiKeyId;
    this.apiKeySecret = apiKeySecret;
    this.chainManager = chainManager;
    this.integratorId = integratorId;

    this.verifyParameters();
  }

  private verifyParameters(): void {
    if (!this.apiKeyId || !this.apiKeySecret || !this.integratorId) {
      throw new Error('API key ID, secret and integrator ID are required');
    }
  }

  /**
   * @internal
   * Generate a JWT token for a provided API endpoint and hostname to make a request after
   * @category Ramp
   *
   * @param authParams Authentication parameters
   * @returns JWT token
   * @throws Error if the JWT token generation fails
   */
  async auth(authParams: CoinbaseCDPAuthParams): Promise<string> {
    const jwtToken = await generateJwt({
      apiKeyId: this.apiKeyId,
      apiKeySecret: this.apiKeySecret,
      ...authParams,
    });

    return jwtToken;
  }

  /**
   * @internal
   * Return a on-ramp URL for the given parameters via Coinbase CDP V2 API
   * @category Ramp
   *
   * @param receiverAddress
   * @param redirectUrl
   * @param amount
   * @param purchaseCurrency
   * @param paymentCurrency
   * @param paymentMethod
   * @param country
   * @returns OnRampUrlResponse
   * @throws Error if redirect URL is not a valid URL
   * @throws CoinbaseCDPError if the request fails
   */
  async getOnRampLink(
    receiverAddress: Address,
    redirectUrl: string,
    amount: string,
    purchaseCurrency: string = 'USDC',
    paymentCurrency: string = 'USD',
    paymentMethod: string = 'CARD',
    country?: string,
  ): Promise<TopUpUrlResponse> {
    if (!checkValidUrl(redirectUrl)) {
      throw new Error('Redirect URL is not a valid URL');
    }

    const chainId = this.chainManager.getSupportedChain();
    const chainName = chainById[chainId]?.name.toLowerCase();

    const authJwtToken = await this.auth(this.onRampUrlAuthParams);

    const response: AxiosResponse<TopUpUrlResponse | CoinbaseCDPError> = await this.clientV2.post(
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

    const onRampResponse = response.data as TopUpUrlResponse;

    return onRampResponse;
  }

  /**
   * @internal
   * Current method return all supported countries and payment methods for on-ramp by Coinbase CDP
   * @category Ramp
   *
   * @returns Config with supported countries and payment methods for on-ramp
   * @throws If API returned an error
   */
  public async getOnRampConfig(): Promise<RampConfigResponse> {
    const authJwtToken = await this.auth(this.onRampConfigAuthParams);

    const response: AxiosResponse<RampConfigResponse | CoinbaseCDPError> = await this.clientV1.get(
      this.onRampConfigAuthParams.requestPath,
      {
        headers: { Authorization: `Bearer ${authJwtToken}` },
      },
    );

    if (response.status !== 200) {
      const error = response.data as CoinbaseCDPError;
      throw error;
    }

    const onRampConfigResponse = response.data as RampConfigResponse;
    return onRampConfigResponse;
  }

  /**
   * @internal
   * Return a off-ramp URL for the given parameters via Coinbase CDP V1 API
   * @remarks
   * Use an integratorId as a partnerUserId  in Coinbase CDP API
   * @category Ramp
   *
   * @param address
   * @param country
   * @param paymentMethod
   * @param redirectUrl
   * @param sellAmount
   * @param cashoutCurrency
   * @param sellCurrency
   * @returns OffRampUrlResponse
   * @throws Error if redirect URL is not a valid URL
   * @throws CoinbaseCDPError if the request fails
   */
  // TODO: Find an issue why it returns a 400 Axios error
  async getOffRampLink(
    address: Address,
    country: string,
    paymentMethod: string,
    redirectUrl: string,
    sellAmount: string,
    cashoutCurrency: string = 'USD',
    sellCurrency: string = 'USDC',
  ): Promise<CashOutUrlResponse> {
    if (!checkValidUrl(redirectUrl)) {
      throw new Error('Redirect URL is not a valid URL');
    }

    const chainId = this.chainManager.getSupportedChain();
    const chainName = chainById[chainId]?.name.toLowerCase();

    const authJwtToken = await this.auth(this.offRampUrlAuthParams);

    const response: AxiosResponse<CashOutUrlResponse | CoinbaseCDPError> = await this.clientV1.post(
      this.offRampUrlAuthParams.requestPath,
      {
        sourceAddress: address,
        country,
        paymentMethod,
        partnerUserId: this.integratorId,
        redirectUrl,
        sellAmount,
        sellNetwork: chainName,
        cashoutCurrency,
        sellCurrency,
      },
      {
        method: this.offRampUrlAuthParams.requestMethod,
        headers: { Authorization: `Bearer ${authJwtToken}`, 'Content-Type': 'application/json' },
      },
    );

    if (response.status !== 200 && response.status !== 201) {
      const error = response.data as CoinbaseCDPError;
      throw error;
    }

    const offRampResponse = response.data as CashOutUrlResponse;

    return offRampResponse;
  }

  /**
   * @internal
   * Current method return all supported countries and payment methods for off-ramp by Coinbase CDP
   * @category Ramp
   * @returns Config with supported countries and payment methods for off-ramp
   * @throws If API returned an error
   */
  public async getOffRampConfig(): Promise<RampConfigResponse> {
    const authJwtToken = await this.auth(this.offRampConfigAuthParams);

    const response: AxiosResponse<RampConfigResponse | CoinbaseCDPError> = await this.clientV1.get(
      this.offRampConfigAuthParams.requestPath,
      {
        headers: { Authorization: `Bearer ${authJwtToken}` },
      },
    );

    if (response.status !== 200) {
      const error = response.data as CoinbaseCDPError;
      throw error;
    }

    const offRampConfigResponse = response.data as RampConfigResponse;
    return offRampConfigResponse;
  }
}
