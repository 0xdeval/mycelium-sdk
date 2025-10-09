import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SparkProtocol } from '@mycelium/sdk/protocols/implementations/SparkProtocol';
import { parseUnits, formatUnits, type Address } from 'viem';
import type { ChainManager } from '@mycelium/sdk/tools/ChainManager';
import type { SmartWallet } from '@mycelium/sdk/wallet/base/wallets/SmartWallet';

import { mockVaultInfo } from '@mycelium/sdk/test/mocks/protocols/spark';
import { createMockChainManager } from '@mycelium/sdk/test/mocks/ChainManagerMock';
import { createMockSmartWallet } from '@mycelium/sdk/test/mocks/SmartWalletMock';

vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    encodeFunctionData: vi.fn().mockReturnValue('0xencodeddata'),
  };
});

describe('SparkProtocol', () => {
  let sparkProtocol: SparkProtocol;
  let mockChainManager: ChainManager;
  let mockSmartWallet: SmartWallet;
  let mockPublicClient: any;

  beforeEach(() => {
    sparkProtocol = new SparkProtocol();

    mockChainManager = createMockChainManager();

    mockPublicClient = mockChainManager.getPublicClient(8453);

    mockSmartWallet = createMockSmartWallet();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('should initialize protocol successfully', async () => {
      await expect(sparkProtocol.init(mockChainManager)).resolves.not.toThrow();
      expect(mockChainManager.getSupportedChain).toHaveBeenCalled();
    });

    it('should set chainManager property', async () => {
      await sparkProtocol.init(mockChainManager);
      expect(sparkProtocol.chainManager).toBe(mockChainManager);
    });
  });

  describe('getVaults', () => {
    beforeEach(async () => {
      await sparkProtocol.init(mockChainManager);
    });

    it('should return static vault list', () => {
      const vaults = sparkProtocol.getVaults();

      expect(vaults).toHaveLength(1);
      expect(vaults[0]).toBeDefined();
      expect(vaults[0]?.id).toBe('sUSDC');
    });
  });

  describe('getBestVault', () => {
    beforeEach(async () => {
      await sparkProtocol.init(mockChainManager);
    });

    it('should return the only available vault', async () => {
      sparkProtocol.getAPY = vi.fn().mockResolvedValue(0.048);

      const bestVault = await sparkProtocol.getBestVault();

      expect(bestVault.id).toBe('sUSDC');
      expect(bestVault.metadata?.apy).toBe(0.048);
    });

    it('should throw error when no vaults available', async () => {
      // Create a new protocol instance and mock empty vaults
      const newProtocol = new SparkProtocol();
      newProtocol['allVaults'] = [];

      await expect(newProtocol.getBestVault()).rejects.toThrow('No vaults found');
    });
  });

  describe('deposit', () => {
    beforeEach(async () => {
      await sparkProtocol.init(mockChainManager);

      sparkProtocol['fetchDepositedVaults'] = vi.fn().mockResolvedValue(null);

      sparkProtocol['getBestVault'] = vi.fn().mockReturnValue(mockVaultInfo);

      mockSmartWallet['getAddress'] = vi
        .fn()
        .mockResolvedValue('0x1234567890123456789012345678901234567890' as Address);

      sparkProtocol['checkAllowance'] = vi.fn().mockResolvedValue(parseUnits('1000', 6));
    });

    it('should execute deposit successfully', async () => {
      const result = await sparkProtocol.deposit('100', mockSmartWallet);

      expect(result.success).toBe(true);
      expect(result.hash).toBeDefined();
      expect(mockSmartWallet.sendBatch).toHaveBeenCalled();
    });

    it('should handle insufficient allowance', async () => {
      sparkProtocol['checkAllowance'] = vi.fn().mockResolvedValue(0n);

      const result = await sparkProtocol.deposit('100', mockSmartWallet);

      expect(result.success).toBe(true);
      expect(mockSmartWallet.sendBatch).toHaveBeenCalled();

      // Should include approve transaction in batch
      const callArgs = (mockSmartWallet.sendBatch as any).mock.calls[0][0];
      expect(callArgs).toHaveLength(2); // approve + deposit
    });

    it('should use previously deposited vault if exists', async () => {
      sparkProtocol['fetchDepositedVaults'] = vi.fn().mockResolvedValue(mockVaultInfo);

      const result = await sparkProtocol.deposit('100', mockSmartWallet);

      expect(result.success).toBe(true);
      expect(sparkProtocol['getBestVault']).not.toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    beforeEach(async () => {
      await sparkProtocol.init(mockChainManager);

      sparkProtocol['fetchDepositedVaults'] = vi.fn().mockResolvedValue(mockVaultInfo);

      mockSmartWallet['getAddress'] = vi
        .fn()
        .mockResolvedValue('0x1234567890123456789012345678901234567890' as Address);
    });

    it('should execute partial withdraw successfully', async () => {
      const result = await sparkProtocol.withdraw('50', mockSmartWallet);

      expect(result.success).toBe(true);
      expect(result.hash).toBeDefined();
      expect(mockSmartWallet.send).toHaveBeenCalled();
    });

    it('should execute full withdraw when no amount specified', async () => {
      const maxShares = parseUnits('100', 18);
      sparkProtocol['getMaxRedeemableShares'] = vi.fn().mockResolvedValue(maxShares);

      const result = await sparkProtocol.withdraw(undefined, mockSmartWallet);

      expect(result.success).toBe(true);
      expect(mockSmartWallet.send).toHaveBeenCalled();
      expect(sparkProtocol['getMaxRedeemableShares']).toHaveBeenCalled();
    });

    it('should throw error when no deposited vault found', async () => {
      sparkProtocol['fetchDepositedVaults'] = vi.fn().mockResolvedValue(null);

      await expect(sparkProtocol.withdraw('50', mockSmartWallet)).rejects.toThrow(
        'No vault found to withdraw from',
      );
    });
  });

  describe('getBalance', () => {
    beforeEach(async () => {
      await sparkProtocol.init(mockChainManager);
    });

    it('should return balance for vault with shares', async () => {
      const shares = parseUnits('100', 18);
      const assets = parseUnits('110', 6); // 110 USDC

      mockPublicClient.readContract
        .mockResolvedValueOnce(shares) // balanceOf
        .mockResolvedValueOnce(assets); // convertToAssets

      const balance = await sparkProtocol.getBalance(
        mockVaultInfo,
        '0x1234567890123456789012345678901234567890',
      );

      expect(balance.shares).toBe(formatUnits(shares, 18));
      expect(balance.depositedAmount).toBe('110');
    });

    it('should return zero balance when no shares', async () => {
      mockPublicClient.readContract.mockResolvedValue(BigInt(0));

      const balance = await sparkProtocol.getBalance(
        mockVaultInfo,
        '0x1234567890123456789012345678901234567890',
      );

      expect(balance.shares).toBe('0');
      expect(balance.depositedAmount).toBe('0');
    });
  });

  describe('fetchDepositedVaults', () => {
    beforeEach(async () => {
      await sparkProtocol.init(mockChainManager);
    });

    it('should return vault when user has deposited', async () => {
      sparkProtocol.getBalance = vi.fn().mockResolvedValue({
        shares: '100',
        depositedAmount: '110',
      });

      sparkProtocol.getAPY = vi.fn().mockResolvedValue(0.048);

      const vault = await sparkProtocol.fetchDepositedVaults(mockSmartWallet);

      expect(vault).toEqual(mockVaultInfo);
    });

    it('should return null when user has no deposits', async () => {
      sparkProtocol.getBalance = vi.fn().mockResolvedValue({
        shares: '0',
        depositedAmount: '0',
      });

      const vault = await sparkProtocol.fetchDepositedVaults(mockSmartWallet);

      expect(vault).toBeNull();
    });
  });

  describe('getMaxRedeemableShares', () => {
    beforeEach(async () => {
      await sparkProtocol.init(mockChainManager);
    });

    it('should return user balance as max redeemable shares', async () => {
      const userShares = parseUnits('100', 18);
      mockPublicClient.readContract.mockResolvedValue(userShares);

      const maxShares = await sparkProtocol['getMaxRedeemableShares'](
        mockVaultInfo,
        '0x1234567890123456789012345678901234567890',
      );

      expect(maxShares).toBe(userShares);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: mockVaultInfo.vaultAddress,
        abi: expect.any(Object),
        functionName: 'balanceOf',
        args: ['0x1234567890123456789012345678901234567890'],
      });
    });
  });
});
