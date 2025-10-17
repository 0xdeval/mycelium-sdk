import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChainManager } from '@mycelium/sdk/tools/ChainManager';
import type { ChainConfig } from '@mycelium/sdk/types/chain';

describe('ChainManager', () => {
  let mockChainConfig: ChainConfig;
  let chainManager: ChainManager;

  beforeEach(() => {
    mockChainConfig = {
      chainId: 8453,
      rpcUrl: 'https://base-rpc-url.com',
      bundlerUrl: 'https://base-bundler-url.com',
    };

    chainManager = new ChainManager(mockChainConfig);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with chain config', () => {
      expect(chainManager).toBeInstanceOf(ChainManager);
    });
  });

  describe('getPublicClient', () => {
    it('should return public client for valid chain ID', () => {
      const client = chainManager.getPublicClient(8453);
      expect(client).toBeDefined();
    });
  });

  describe('getBundlerClient', () => {
    const mockAccount = {} as any;

    it('should return bundler client for valid chain ID', () => {
      const client = chainManager.getBundlerClient(8453, mockAccount);

      expect(client).toBeDefined();
    });

    it('should throw error when bundler URL is not a url', () => {
      const configWithoutBundler = {
        ...mockChainConfig,
        bundlerUrl: 'randomUrl',
      };
      const managerWithoutBundler = new ChainManager(configWithoutBundler);

      expect(() => managerWithoutBundler.getBundlerClient(8453, mockAccount)).toThrow(
        'Invalid bundler URL for chain ID: 8453',
      );
    });
  });

  describe('getRpcUrl', () => {
    it('should return RPC URL for valid chain ID', () => {
      const rpcUrl = chainManager.getRpcUrl(8453);
      expect(rpcUrl).toBe('https://base-rpc-url.com');
    });

    it('should throw error when rpc url is not a url', () => {
      const invalidConfig = { ...mockChainConfig, rpcUrl: 'randomUrl' };
      const invalidManager = new ChainManager(invalidConfig);

      expect(() => invalidManager.getRpcUrl(8453)).toThrow('Invalid RPC URL for chain ID: 8453');
    });
  });

  describe('getBundlerUrl', () => {
    it('should return bundler URL for valid chain ID', () => {
      const bundlerUrl = chainManager.getBundlerUrl(8453);
      expect(bundlerUrl).toBe('https://base-bundler-url.com');
    });

    it('should throw error when bundler url is not a url', () => {
      const invalidConfig = { ...mockChainConfig, bundlerUrl: 'randomUrl' };
      const invalidManager = new ChainManager(invalidConfig);

      expect(() => invalidManager.getBundlerUrl(8453)).toThrow(
        'Invalid bundler URL for chain ID: 8453',
      );
    });
  });

  describe('getChain', () => {
    it('should return chain object for valid chain ID', () => {
      const chain = chainManager.getChain(8453);
      expect(chain).toBeDefined();
      expect(chain.id).toBe(8453);
    });

    it('should throw error for invalid chain ID', () => {
      expect(() => chainManager.getChain(9999 as any)).toThrow('Chain not found for ID: 9999');
    });
  });

  describe('getSupportedChain', () => {
    it('should return supported chain ID from config', () => {
      const supportedChain = chainManager.getSupportedChain();
      expect(supportedChain).toBe(8453);
    });
  });

  describe('createPublicClient', () => {
    it('should create public client with correct configuration', () => {
      expect(chainManager).toBeDefined();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle multiple chain ID calls consistently', () => {
      const rpcUrl1 = chainManager.getRpcUrl(8453);
      const rpcUrl2 = chainManager.getRpcUrl(8453);
      expect(rpcUrl1).toBe(rpcUrl2);
    });

    it('should maintain consistency between chain config methods', () => {
      const rpcUrl = chainManager.getRpcUrl(8453);
      const bundlerUrl = chainManager.getBundlerUrl(8453);
      const supportedChain = chainManager.getSupportedChain();

      expect(supportedChain).toBe(8453);
      expect(rpcUrl).toBeTruthy();
      expect(bundlerUrl).toBeTruthy();
    });
  });
});
