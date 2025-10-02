import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BeefyProtocol } from '@mycelium/sdk/protocols/implementations/BeefyProtocol';
import { parseUnits, formatUnits, type Address } from 'viem';
import type { ChainManager } from '@mycelium/sdk/tools/ChainManager';
import type { SmartWallet } from '@mycelium/sdk/wallet/base/wallets/SmartWallet';

import { mockApiResponses, mockVaultInfo } from '@mycelium/sdk/test/mocks/protocols/beefy';
import { createMockChainManager } from '@mycelium/sdk/test/mocks/ChainManagerMock';
import { createMockSmartWallet } from '@mycelium/sdk/test/mocks/SmartWalletMock';

vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    encodeFunctionData: vi.fn().mockReturnValue('0xencodeddata'),
  };
});

describe('BeefyProtocol', () => {
  let beefyProtocol: BeefyProtocol;
  let mockChainManager: ChainManager;
  let mockSmartWallet: SmartWallet;
  let mockPublicClient: any;

  beforeEach(() => {
    beefyProtocol = new BeefyProtocol();

    mockChainManager = createMockChainManager();

    mockPublicClient = mockChainManager.getPublicClient(8453);

    mockSmartWallet = createMockSmartWallet();

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockApiResponses.vaults) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockApiResponses.apy) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockApiResponses.fees) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockApiResponses.tvl) });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('should initialize protocol successfully', async () => {
      await expect(beefyProtocol.init(mockChainManager)).resolves.not.toThrow();
      expect(mockChainManager.getSupportedChain).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should set chainManager property', async () => {
      await beefyProtocol.init(mockChainManager);
      expect(beefyProtocol.chainManager).toBe(mockChainManager);
    });
  });

  describe('getVaults', () => {
    beforeEach(async () => {
      await beefyProtocol.init(mockChainManager);
    });

    it('should fetch and return filtered vaults', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockApiResponses.vaults) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockApiResponses.apy) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockApiResponses.fees) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockApiResponses.tvl) });
      const vaults = await beefyProtocol.getVaults();

      expect(vaults).toHaveLength(1);
      expect(vaults[0]).toBeDefined();
      expect(vaults[0]?.id).toBe('beefy-usdc-vault');
      expect(vaults[0]?.metadata?.apy).toBe(0.05);
      expect(vaults[0]?.metadata?.tvl).toBe(1000000);
    });

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      await expect(beefyProtocol.getVaults()).rejects.toThrow('API Error');
    });
  });

  describe('getBestVault', () => {
    beforeEach(async () => {
      await beefyProtocol.init(mockChainManager);
    });

    it('should return vault with highest TVL', async () => {
      const bestVault = await beefyProtocol.getBestVault();

      expect(bestVault.id).toBe('beefy-usdc-vault');
      expect(bestVault.metadata?.tvl).toBe(1000000);
    });

    it('should throw error when no vaults available', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({}) });

      const newProtocol = new BeefyProtocol();
      await newProtocol.init(mockChainManager);

      await expect(newProtocol.getBestVault()).rejects.toThrow('No vaults found');
    });
  });

  describe('deposit', () => {
    beforeEach(async () => {
      await beefyProtocol.init(mockChainManager);

      beefyProtocol['fetchDepositedVaults'] = vi.fn().mockResolvedValue(null);

      beefyProtocol['getBestVault'] = vi.fn().mockResolvedValue(mockVaultInfo);

      mockSmartWallet['getAddress'] = vi
        .fn()
        .mockResolvedValue('0x1234567890123456789012345678901234567890' as Address);

      beefyProtocol['checkAllowance'] = vi.fn().mockResolvedValue(parseUnits('1000', 6));
    });

    it('should execute deposit successfully', async () => {
      const result = await beefyProtocol.deposit('100', mockSmartWallet);

      expect(result.success).toBe(true);
      expect(result.hash).toBeDefined();
      expect(mockSmartWallet.sendBatch).toHaveBeenCalled();
    });

    it('should handle insufficient allowance', async () => {
      beefyProtocol['checkAllowance'] = vi.fn().mockResolvedValue(0n);

      const result = await beefyProtocol.deposit('100', mockSmartWallet);

      expect(result.success).toBe(true);
      expect(mockSmartWallet.sendBatch).toHaveBeenCalled();

      // Should include approve transaction in batch
      const callArgs = (mockSmartWallet.sendBatch as any).mock.calls[0][0];
      expect(callArgs).toHaveLength(2); // approve + deposit
    });
  });

  describe('withdraw', () => {
    beforeEach(async () => {
      await beefyProtocol.init(mockChainManager);

      beefyProtocol['fetchDepositedVaults'] = vi.fn().mockResolvedValue(mockVaultInfo);

      mockPublicClient.readContract.mockResolvedValue(parseUnits('1.1', 18));
    });

    it('should execute partial withdraw successfully', async () => {
      const result = await beefyProtocol.withdraw('50', mockSmartWallet);

      expect(result.success).toBe(true);
      expect(result.hash).toBeDefined();
      expect(mockSmartWallet.send).toHaveBeenCalled();
    });

    it('should execute full withdraw when no amount specified', async () => {
      const result = await beefyProtocol.withdraw(undefined, mockSmartWallet);

      expect(result.success).toBe(true);
      expect(mockSmartWallet.send).toHaveBeenCalled();
    });

    it('should throw error when no deposited vault found', async () => {
      beefyProtocol['fetchDepositedVaults'] = vi.fn().mockResolvedValue(null);

      await expect(beefyProtocol.withdraw('50', mockSmartWallet)).rejects.toThrow(
        'No vault found to withdraw from',
      );
    });
  });

  describe('getBalance', () => {
    beforeEach(async () => {
      await beefyProtocol.init(mockChainManager);
    });

    it('should return balance for vault with shares', async () => {
      const shares = parseUnits('0.00000000001', 18);
      const ppfs = parseUnits('1.1', 18);

      mockPublicClient.readContract
        .mockResolvedValueOnce(shares) // balanceOf
        .mockResolvedValueOnce(ppfs); // getPricePerFullShare

      const balance = await beefyProtocol.getBalance(
        mockVaultInfo,
        '0x1234567890123456789012345678901234567890',
      );

      expect(balance.shares).toBe(formatUnits(shares, 18));
      expect(balance.depositedAmount).toBe('11');
    });

    it('should return zero balance when no shares', async () => {
      mockPublicClient.readContract.mockResolvedValue(BigInt(0));

      const balance = await beefyProtocol.getBalance(
        mockVaultInfo,
        '0x1234567890123456789012345678901234567890',
      );

      expect(balance.shares).toBe('0');
      expect(balance.depositedAmount).toBe('0');
    });
  });

  describe('fetchDepositedVaults', () => {
    beforeEach(async () => {
      await beefyProtocol.init(mockChainManager);
    });

    it('should return vault when user has deposited', async () => {
      beefyProtocol.getBalance = vi.fn().mockResolvedValue({
        shares: '100',
        depositedAmount: '110',
      });

      const vault = await beefyProtocol.fetchDepositedVaults(mockSmartWallet);

      expect(vault).toEqual(mockVaultInfo);
    });

    it('should return null when user has no deposits', async () => {
      beefyProtocol.getBalance = vi.fn().mockResolvedValue({
        shares: '0',
        depositedAmount: '0',
      });

      const vault = await beefyProtocol.fetchDepositedVaults(mockSmartWallet);

      expect(vault).toBeNull();
    });
  });
});
