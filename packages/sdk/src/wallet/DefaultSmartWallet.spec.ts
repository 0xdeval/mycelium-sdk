import { type Address, type LocalAccount, pad } from 'viem';
import { toCoinbaseSmartAccount } from 'viem/account-abstraction';
import { baseSepolia, unichain } from 'viem/chains';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { smartWalletFactoryAbi } from '@mycelium/sdk/abis/smartWalletFactory';
import { smartWalletFactoryAddress } from '@mycelium/sdk/constants/addresses';
import type { ChainManager } from '@mycelium/sdk/tools/ChainManager';
import { createMockChainManager } from '@mycelium/sdk/test/mocks/ChainManagerMock';
import { getRandomAddress } from '@mycelium/sdk/test/utils';
import { DefaultSmartWallet } from '@mycelium/sdk/wallet/DefaultSmartWallet';
import { createMockProtocol } from '@mycelium/sdk/test/mocks/ProtocolMock';
import type { Protocol } from '@mycelium/sdk/types/protocols/general';
import type { TransactionData } from '@mycelium/sdk/types/transaction';
import { createMockCoinbaseCDP } from '@mycelium/sdk/test/mocks/CoinbaseCDPMock';
import type { CoinbaseCDP } from '@mycelium/sdk/tools/CoinbaseCDP';
import { onRampResponseMock } from '@mycelium/sdk/test/mocks/ramp/on-ramp';
import { offRampResponseMock } from '@mycelium/sdk/test/mocks/ramp/off-ramp';

vi.mock('viem/account-abstraction', () => ({
  toCoinbaseSmartAccount: vi.fn(),
}));
const mockOwners: Address[] = ['0x123', '0x456'];
const mockSigner: LocalAccount = {
  address: '0x123',
  type: 'local',
} as unknown as LocalAccount;
const mockChainManager = createMockChainManager() as unknown as ChainManager;
const mockProtocol = createMockProtocol();
const mockCoinbaseCDP: CoinbaseCDP = createMockCoinbaseCDP();

describe('DefaultSmartWallet', () => {
  it('should create a smart wallet instance', () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );
    expect(wallet).toBeInstanceOf(DefaultSmartWallet);
  });

  it('should return the correct signer', () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );
    expect(wallet.signer).toEqual(mockSigner);
  });

  it('should get the wallet address', async () => {
    const owners = [getRandomAddress(), getRandomAddress()];
    const wallet = new DefaultSmartWallet(
      owners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );
    const mockAddress = getRandomAddress();
    const publicClient = vi.mocked(mockChainManager.getPublicClient(baseSepolia.id));
    publicClient.readContract = vi.fn().mockResolvedValue(mockAddress);

    const address = await wallet.getAddress();

    expect(address).toBe(mockAddress);
    expect(publicClient.readContract).toHaveBeenCalledWith({
      abi: smartWalletFactoryAbi,
      address: smartWalletFactoryAddress,
      functionName: 'getAddress',
      args: [owners.map((owner) => pad(owner)), BigInt(0)],
    });
  });

  it('should return the deployment address', async () => {
    const deploymentAddress = getRandomAddress();
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
      deploymentAddress,
    );
    const address = await wallet.getAddress();
    expect(address).toBe(deploymentAddress);
  });

  it('should call toCoinbaseSmartAccount with correct arguments', async () => {
    const deploymentAddress = getRandomAddress();
    const signerOwnerIndex = 1;
    const nonce = BigInt(123);
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
      deploymentAddress,
      signerOwnerIndex,
      nonce,
    );
    const chainId = unichain.id;
    await wallet.getCoinbaseSmartAccount(chainId);

    const toCoinbaseSmartAccountMock = vi.mocked(toCoinbaseSmartAccount);
    expect(toCoinbaseSmartAccountMock).toHaveBeenCalledWith({
      address: deploymentAddress,
      ownerIndex: signerOwnerIndex,
      client: mockChainManager.getPublicClient(chainId),
      owners: [wallet.signer],
      nonce: nonce,
      version: '1.1',
    });
  });

  it('should send a transaction via ERC-4337', async () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );
    const chainId = unichain.id;
    const recipientAddress = getRandomAddress();
    const value = BigInt(1000);
    const data = '0x123';
    const transactionData: TransactionData = {
      to: recipientAddress,
      value,
      data,
    };
    const mockAccount = {
      address: '0x123',
      client: mockChainManager.getPublicClient(baseSepolia.id),
      owners: [mockSigner],
      nonce: BigInt(0),
    } as any;
    vi.mocked(toCoinbaseSmartAccount).mockResolvedValue(mockAccount);
    const bundlerClient = mockChainManager.getBundlerClient(chainId, mockAccount);

    vi.mocked(bundlerClient.sendUserOperation).mockResolvedValue('0xTransactionHash');

    const result = await wallet.send(transactionData, chainId);

    expect(mockChainManager.getBundlerClient).toHaveBeenCalledWith(chainId, mockAccount);
    expect(bundlerClient.sendUserOperation).toHaveBeenCalledWith({
      account: mockAccount,
      calls: [transactionData],
      callGasLimit: BigInt(140000),
      verificationGasLimit: BigInt(140000),
      preVerificationGas: BigInt(140000),
    });
    expect(bundlerClient.waitForUserOperationReceipt).toHaveBeenCalledWith({
      hash: '0xTransactionHash',
    });
    expect(result).toBe('0xTransactionHash');
  });

  it('should send a batch transaction via ERC-4337', async () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );
    const chainId = unichain.id;
    const recipientAddress = getRandomAddress();
    const value = BigInt(1000);
    const data = '0x123';
    const transactionData: TransactionData[] = [
      {
        to: recipientAddress,
        value,
        data,
      },
    ];
    const mockAccount = {
      address: '0x123',
      client: mockChainManager.getPublicClient(baseSepolia.id),
      owners: [mockSigner],
      nonce: BigInt(0),
    } as any;
    vi.mocked(toCoinbaseSmartAccount).mockResolvedValue(mockAccount);
    const bundlerClient = mockChainManager.getBundlerClient(chainId, mockAccount);

    vi.mocked(bundlerClient.sendUserOperation).mockResolvedValue('0xTransactionHash');

    const result = await wallet.sendBatch(transactionData, chainId);

    expect(mockChainManager.getBundlerClient).toHaveBeenCalledWith(chainId, mockAccount);
    expect(bundlerClient.sendUserOperation).toHaveBeenCalledWith({
      account: mockAccount,
      calls: transactionData,
      callGasLimit: BigInt(140000),
      verificationGasLimit: BigInt(140000),
      preVerificationGas: BigInt(140000),
    });
    expect(bundlerClient.waitForUserOperationReceipt).toHaveBeenCalledWith({
      hash: '0xTransactionHash',
    });
    expect(result).toBe('0xTransactionHash');
  });

  it('should use earn method and deposit to a vault', async () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );

    const depositSpy = vi.mocked(mockProtocol).deposit as ReturnType<typeof vi.fn>;

    const amount = '1000';

    const result = await wallet.earn(amount);

    expect(depositSpy).toHaveBeenCalledWith(amount, wallet);
    expect(result.hash).toBe('0x3c36293ab6884794bda1271b570ca9e9b68a406e93486359e7213a30f88c349b');
    expect(result.success).toBe(true);
  });

  it('should use withdraw method and withdraw from a vault', async () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );

    const withdrawSpy = vi.mocked(mockProtocol).withdraw as ReturnType<typeof vi.fn>;

    const amount = '1000';

    const result = await wallet.withdraw(amount);

    expect(withdrawSpy).toHaveBeenCalledWith(amount, wallet);
    expect(result.hash).toBe('0x3c36293ab6884794bda1271b570ca9e9b68a406e93486359e7213a30f88c349b');
    expect(result.success).toBe(true);
  });

  it('should use getEarnBalance method and get the balance of the vault', async () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );

    const result = await wallet.getEarnBalance();

    expect(result).not.toBeNull();
    expect(result?.shares).toBe('100');
    expect(result?.depositedAmount).toBe('100');
  });

  describe('topUp (on-ramp)', () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );

    it('should generate a proper on-ramp link with all parameters', async () => {
      const amount = '100';
      const redirectUrl = 'https://mysite.com/success';
      const purchaseCurrency = 'USDC';
      const paymentCurrency = 'USD';
      const paymentMethod = 'CARD';
      const country = 'US';

      const result = await wallet.topUp(
        amount,
        redirectUrl,
        purchaseCurrency,
        paymentCurrency,
        paymentMethod,
        country,
      );

      expect(mockCoinbaseCDP.getOnRampLink).toHaveBeenCalledWith(
        await wallet.getAddress(),
        redirectUrl,
        amount,
        purchaseCurrency,
        paymentCurrency,
        paymentMethod,
        country,
      );
      expect(result).toEqual(onRampResponseMock);
    });

    it('should generate on-ramp link with minimal parameters', async () => {
      const amount = '50';
      const redirectUrl = 'https://mysite.com/success';

      const result = await wallet.topUp(amount, redirectUrl);

      expect(mockCoinbaseCDP.getOnRampLink).toHaveBeenCalledWith(
        await wallet.getAddress(),
        redirectUrl,
        amount,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(onRampResponseMock);
    });

    it('should throw error when CoinbaseCDP is not initialized', async () => {
      const smartWalletWithoutCDP = new DefaultSmartWallet(
        [getRandomAddress()],
        mockSigner,
        mockChainManager,
        mockProtocol,
        null, // No CoinbaseCDP
      );

      await expect(
        smartWalletWithoutCDP.topUp('100', 'https://mysite.com/success'),
      ).rejects.toThrow(
        'Coinbase CDP is not initialized. Please, provide the configuration in the SDK initialization',
      );
    });

    it('should handle CoinbaseCDP API errors', async () => {
      const error = new Error('API Error');
      mockCoinbaseCDP.getOnRampLink = vi.fn().mockRejectedValue(error);

      await expect(wallet.topUp('100', 'https://mysite.com/success')).rejects.toThrow('API Error');
    });
  });

  describe('cashOut (off-ramp)', () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
      mockCoinbaseCDP,
    );

    it('should generate a proper off-ramp link with all parameters', async () => {
      const country = 'US';
      const paymentMethod = 'FIAT_WALLET';
      const redirectUrl = 'https://mysite.com/success';
      const sellAmount = '100';
      const cashoutCurrency = 'USD';
      const sellCurrency = 'USDC';

      const result = await wallet.cashOut(
        country,
        paymentMethod,
        redirectUrl,
        sellAmount,
        cashoutCurrency,
        sellCurrency,
      );

      expect(mockCoinbaseCDP.getOffRampLink).toHaveBeenCalledWith(
        await wallet.getAddress(),
        country,
        paymentMethod,
        redirectUrl,
        sellAmount,
        cashoutCurrency,
        sellCurrency,
      );
      expect(result).toEqual(offRampResponseMock);
    });

    it('should generate off-ramp link with minimal parameters', async () => {
      const country = 'US';
      const paymentMethod = 'CARD';
      const redirectUrl = 'https://mysite.com/success';
      const sellAmount = '50';

      const result = await wallet.cashOut(country, paymentMethod, redirectUrl, sellAmount);

      expect(mockCoinbaseCDP.getOffRampLink).toHaveBeenCalledWith(
        await wallet.getAddress(),
        country,
        paymentMethod,
        redirectUrl,
        sellAmount,
        undefined,
        undefined,
      );
      expect(result).toEqual(offRampResponseMock);
    });

    it('should throw error when CoinbaseCDP is not initialized', async () => {
      const smartWalletWithoutCDP = new DefaultSmartWallet(
        [getRandomAddress()],
        mockSigner,
        mockChainManager,
        mockProtocol,
        null,
      );

      await expect(
        smartWalletWithoutCDP.cashOut('US', 'CARD', 'https://mysite.com/success', '100'),
      ).rejects.toThrow(
        'Coinbase CDP is not initialized. Please, provide the configuration in the SDK initialization',
      );
    });

    it('should handle CoinbaseCDP API errors', async () => {
      const error = new Error('API Error');
      mockCoinbaseCDP.getOffRampLink = vi.fn().mockRejectedValue(error);

      await expect(
        wallet.cashOut('US', 'CARD', 'https://mysite.com/success', '100'),
      ).rejects.toThrow('API Error');
    });
  });

  describe('integration scenarios', () => {
    let mockCoinbaseCDP: CoinbaseCDP;
    let mockChainManager: ChainManager;
    let wallet: DefaultSmartWallet;

    beforeEach(() => {
      vi.restoreAllMocks();
      mockCoinbaseCDP = createMockCoinbaseCDP();
      mockChainManager = createMockChainManager();
      wallet = new DefaultSmartWallet(
        mockOwners,
        mockSigner,
        mockChainManager,
        mockProtocol as unknown as Protocol['instance'],
        mockCoinbaseCDP,
      );
    });

    it('should handle complete on-ramp flow', async () => {
      // Generate on-ramp link
      const onRampResult = await wallet.topUp(
        '100',
        'https://mysite.com/success',
        'USDC',
        'USD',
        'CARD',
        'US',
      );

      expect(onRampResult.session?.onrampUrl).toContain('pay.coinbase.com');
      expect(onRampResult.quote).toBeDefined();
    });

    it('should handle complete off-ramp flow', async () => {
      // Generate off-ramp link
      const offRampResult = await wallet.cashOut(
        'US',
        'FIAT_WALLET',
        'https://mysite.com/success',
        '100',
        'USD',
        'USDC',
      );

      expect(offRampResult.offramp_url).toContain('pay.coinbase.com');
      expect(offRampResult.cashout_total).toBeDefined();
      expect(offRampResult.sell_amount).toBeDefined();
    });
  });
});
