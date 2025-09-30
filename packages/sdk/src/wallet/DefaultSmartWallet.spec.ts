import { type Address, type LocalAccount, pad } from 'viem';
import { toCoinbaseSmartAccount } from 'viem/account-abstraction';
import { baseSepolia, unichain } from 'viem/chains';
import { describe, expect, it, vi } from 'vitest';

import { smartWalletFactoryAbi } from '@mycelium/sdk/abis/smartWalletFactory';
import { smartWalletFactoryAddress } from '@mycelium/sdk/constants/addresses';
import type { ChainManager } from '@mycelium/sdk/tools/ChainManager';
import { createMockChainManager } from '@mycelium/sdk/test/mocks/ChainManagerMock';
import { getRandomAddress } from '@mycelium/sdk/test/utils';
import { DefaultSmartWallet } from '@mycelium/sdk/wallet/DefaultSmartWallet';
import { createMockProtocol } from '@mycelium/sdk/test/mocks/ProtocolMock';
import type { Protocol } from '@mycelium/sdk/types/protocols/general';
import type { TransactionData } from '@mycelium/sdk/types/transaction';

// TODO: Add tests for 'earn', 'getEarnBalance', 'withdraw', 'sendBatch'

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

describe('DefaultSmartWallet', () => {
  it('should create a smart wallet instance', () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
    );
    expect(wallet).toBeInstanceOf(DefaultSmartWallet);
  });

  it('should return the correct signer', () => {
    const wallet = new DefaultSmartWallet(
      mockOwners,
      mockSigner,
      mockChainManager,
      mockProtocol as unknown as Protocol['instance'],
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
});
