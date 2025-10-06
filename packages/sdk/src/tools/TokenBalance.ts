import { type Address, erc20Abi, formatEther, formatUnits } from 'viem';

import type { SupportedChainId } from '@/constants/chains';
import type { ChainManager } from '@/tools/ChainManager';
import { getTokenAddress, type TokenInfo } from '@/utils/tokens';
import type { TokenBalance } from '@/types/token';

/**
 * Fetches the ETH balance for a wallet across configured supported chain
 *
 * @internal
 * @category Balances
 * @param chainManager Chain manager instance
 * @param walletAddress Target wallet address
 * @returns Promise resolving to a {@link TokenBalance} object for ETH
 */
export async function fetchETHBalance(
  chainManager: ChainManager,
  walletAddress: Address,
): Promise<TokenBalance> {
  const supportedChain = chainManager.getSupportedChain();

  const publicClient = chainManager.getPublicClient(supportedChain);
  const balance = await publicClient.getBalance({
    address: walletAddress,
  });

  return {
    symbol: 'ETH',
    totalBalance: balance,
    totalFormattedBalance: formatEther(balance),
    chainBalances: [
      {
        chainId: supportedChain,
        balance,
        formattedBalance: formatEther(balance),
      },
    ],
  };
}

/**
 * Fetches the ERC20 token balance for a wallet across the configured supported chain
 *
 * @internal
 * @category Balances
 * @param chainManager Chain manager instance
 * @param walletAddress Target wallet address
 * @param token Token metadata including address and decimals
 * @returns Promise resolving to a {@link TokenBalance} object for the token
 */
export async function fetchERC20Balance(
  chainManager: ChainManager,
  walletAddress: Address,
  token: TokenInfo,
): Promise<TokenBalance> {
  const supportedChain = chainManager.getSupportedChain();

  const balance = await fetchERC20BalanceForChain(
    token,
    supportedChain,
    walletAddress,
    chainManager,
  );

  return {
    symbol: token.symbol,
    totalBalance: balance,
    totalFormattedBalance: formatUnits(balance, token.decimals),
    chainBalances: [
      {
        chainId: supportedChain,
        balance,
        formattedBalance: formatUnits(balance, token.decimals),
      },
    ],
  };
}

/**
 * Fetches the ERC20 token balance for a wallet on a specific chain
 *
 * @internal
 * @category Balances
 * @remarks
 * Falls back to native ETH balance if `token.symbol` is ETH
 *
 * @param token Token metadata
 * @param chainId Chain ID to query
 * @param walletAddress Target wallet address
 * @param chainManager Chain manager instance
 * @returns Promise resolving to raw bigint balance
 * @throws Error if token is not supported on the given chain
 */
async function fetchERC20BalanceForChain(
  token: TokenInfo,
  chainId: SupportedChainId,
  walletAddress: Address,
  chainManager: ChainManager,
): Promise<bigint> {
  const tokenAddress = getTokenAddress(token.symbol, chainId);
  if (!tokenAddress) {
    throw new Error(`${token.symbol} not supported on chain ${chainId}`);
  }

  const publicClient = chainManager.getPublicClient(chainId);

  // Handle native ETH balance
  if (token.symbol === 'ETH') {
    return publicClient.getBalance({
      address: walletAddress,
    });
  }

  // Handle ERC20 token balance
  return publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress],
  });
}
