import { isAddress } from 'viem';
import { describe, expect, it, vi } from 'vitest';

import type { ChainManager } from '@mycelium/sdk/tools/ChainManager';
import { createMockChainManager } from '@mycelium/sdk/test/mocks/ChainManagerMock';
import { createMockPrivyClient } from '@mycelium/sdk/test/mocks/PrivyClientMock';
import { getRandomAddress } from '@mycelium/sdk/test/utils';
import { DefaultSmartWallet } from '@mycelium/sdk/wallet/DefaultSmartWallet';
import { PrivyWallet } from '@mycelium/sdk/wallet/PrivyWallet';
import { DefaultSmartWalletProvider } from '@mycelium/sdk/wallet/providers/DefaultSmartWalletProvider';
import { PrivyEmbeddedWalletProvider } from '@mycelium/sdk/wallet/providers/PrivyEmbeddedWalletProvider';
import { WalletNamespace } from '@mycelium/sdk/wallet/WalletNamespace';
import { WalletProvider } from '@mycelium/sdk/wallet/WalletProvider';
import { createMockProtocol } from '@mycelium/sdk/test/mocks/ProtocolMock';
import { createMockCoinbaseCDP } from '@mycelium/sdk/test/mocks/CoinbaseCDPMock';
import type { CoinbaseCDP } from '@mycelium/sdk/tools/CoinbaseCDP';

const mockChainManager = createMockChainManager() as unknown as ChainManager;
const mockProtocol = createMockProtocol();
const mockCoinbaseCDP: CoinbaseCDP = createMockCoinbaseCDP();

describe('WalletNamespace', () => {
  it('should create an embedded wallet via namespace', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const createEmbeddedWalletSpy = vi.spyOn(walletProvider, 'createEmbeddedWallet');
    const walletNamespace = new WalletNamespace(walletProvider);

    const wallet: PrivyWallet = (await walletNamespace.createEmbeddedWallet()) as PrivyWallet;

    expect(wallet).toBeInstanceOf(PrivyWallet);
    expect(wallet.walletId).toMatch(/^mock-wallet-\d+$/);
    expect(isAddress(wallet.address)).toBe(true);
    expect(createEmbeddedWalletSpy).toHaveBeenCalledOnce();
  });

  it('should create a smart wallet with provided signer and owners', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const createSmartWalletSpy = vi.spyOn(walletProvider, 'createSmartWallet');
    const walletNamespace = new WalletNamespace(walletProvider);

    // Create an embedded wallet to use as signer
    const embeddedWallet = await embeddedWalletProvider.createWallet();
    const account = await embeddedWallet.account();
    const owners = [getRandomAddress(), embeddedWallet.address];
    const nonce = BigInt(123);

    const smartWallet = await walletNamespace.createSmartWallet({
      owners,
      signer: account,
      nonce,
    });

    expect(smartWallet).toBeInstanceOf(DefaultSmartWallet);
    expect(smartWallet.signer).toBe(account);
    expect(createSmartWalletSpy).toHaveBeenCalledWith({
      owners,
      signer: account,
      nonce,
    });
  });

  it('should create a wallet with embedded signer (default owners)', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const createWalletWithEmbeddedSignerSpy = vi.spyOn(
      walletProvider,
      'createWalletWithEmbeddedSigner',
    );
    const walletNamespace = new WalletNamespace(walletProvider);

    const smartWallet = await walletNamespace.createWalletWithEmbeddedSigner();

    expect(smartWallet).toBeInstanceOf(DefaultSmartWallet);
    expect(createWalletWithEmbeddedSignerSpy).toHaveBeenCalledWith(undefined);
  });

  it('should create a wallet with embedded signer and additional owners', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const createWalletWithEmbeddedSignerSpy = vi.spyOn(
      walletProvider,
      'createWalletWithEmbeddedSigner',
    );
    const walletNamespace = new WalletNamespace(walletProvider);

    const additionalOwners = [getRandomAddress(), getRandomAddress()];
    const embeddedWalletIndex = 1;
    const nonce = BigInt(456);
    const params = {
      owners: additionalOwners,
      embeddedWalletIndex,
      nonce,
    };

    const smartWallet = await walletNamespace.createWalletWithEmbeddedSigner(params);

    expect(smartWallet).toBeInstanceOf(DefaultSmartWallet);
    expect(createWalletWithEmbeddedSignerSpy).toHaveBeenCalledWith(params);
  });

  it('should get an embedded wallet by ID', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const getEmbeddedWalletSpy = vi.spyOn(walletProvider, 'getEmbeddedWallet');
    const walletNamespace = new WalletNamespace(walletProvider);

    const createdWallet = await embeddedWalletProvider.createWallet();
    const walletId = createdWallet.walletId;

    const wallet: PrivyWallet = (await walletNamespace.getEmbeddedWallet({
      walletId,
    })) as PrivyWallet;

    expect(wallet).toBeInstanceOf(PrivyWallet);
    expect(wallet.walletId).toBe(walletId);
    expect(getEmbeddedWalletSpy).toHaveBeenCalledWith({ walletId });
  });

  it('should get a smart wallet with embedded signer', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const getSmartWalletWithEmbeddedSignerSpy = vi.spyOn(
      walletProvider,
      'getSmartWalletWithEmbeddedSigner',
    );
    const walletNamespace = new WalletNamespace(walletProvider);

    const embeddedWallet = await embeddedWalletProvider.createWallet();
    const walletId = embeddedWallet.walletId;
    const deploymentOwners = [embeddedWallet.address];
    const signerOwnerIndex = 0;
    const params = {
      walletId,
      deploymentOwners,
      signerOwnerIndex,
    };

    const smartWallet = await walletNamespace.getSmartWalletWithEmbeddedSigner(params);

    expect(smartWallet).toBeInstanceOf(DefaultSmartWallet);
    expect(getSmartWalletWithEmbeddedSignerSpy).toHaveBeenCalledWith(params);
  });

  it('should get a smart wallet with provided signer', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const getSmartWalletSpy = vi.spyOn(walletProvider, 'getSmartWallet');
    const walletNamespace = new WalletNamespace(walletProvider);

    const embeddedWallet = await embeddedWalletProvider.createWallet();
    const account = await embeddedWallet.account();
    const deploymentOwners = [embeddedWallet.address, getRandomAddress()];
    const signerOwnerIndex = 0;
    const nonce = BigInt(789);
    const params = {
      signer: account,
      deploymentOwners,
      signerOwnerIndex,
      nonce,
    };

    const smartWallet = await walletNamespace.getSmartWallet(params);

    expect(smartWallet).toBeInstanceOf(DefaultSmartWallet);
    expect(getSmartWalletSpy).toHaveBeenCalledWith(params);
  });

  it('should throw error when getting smart wallet without required parameters', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const walletNamespace = new WalletNamespace(walletProvider);

    const embeddedWallet = await embeddedWalletProvider.createWallet();
    const account = await embeddedWallet.account();

    await expect(
      walletNamespace.getSmartWallet({
        signer: account,
        // Missing both walletAddress and deploymentOwners
      }),
    ).rejects.toThrow(
      'Either walletAddress or deploymentOwners array must be provided to locate the smart wallet',
    );
  });

  it('should throw error when embedded wallet is not found', async () => {
    const mockPrivyClient = createMockPrivyClient('test-app-id', 'test-app-secret');
    const embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
      mockPrivyClient,
      mockChainManager,
    );
    const smartWalletProvider = new DefaultSmartWalletProvider(
      mockChainManager,
      mockProtocol,
      mockCoinbaseCDP,
    );
    const walletProvider = new WalletProvider(embeddedWalletProvider, smartWalletProvider);
    const walletNamespace = new WalletNamespace(walletProvider);

    const invalidWalletId = 'invalid-wallet-id';

    await expect(
      walletNamespace.getSmartWalletWithEmbeddedSigner({
        walletId: invalidWalletId,
      }),
    ).rejects.toThrow('Failed to get wallet with id: invalid-wallet-id');
  });
});
