import type { Address } from "viem";
import { erc20Abi, formatEther, formatUnits } from "viem";

import type { SupportedChainId } from "@/constants/chains";
import type { ChainManager } from "@/tools/ChainManager";
import { getTokenAddress, type TokenInfo } from "@/utils/tokens";
import type { TokenBalance } from "@/types/token.js";

/**
 * Fetch ETH balance across all supported chains
 * @param chainManager - The chain manager
 * @param walletAddress - The wallet address
 * @returns Promise resolving to array of ETH balances
 */
export async function fetchETHBalance(
  chainManager: ChainManager,
  walletAddress: Address
): Promise<TokenBalance> {
  const supportedChain = chainManager.getSupportedChain();

  const publicClient = chainManager.getPublicClient(supportedChain);
  const balance = await publicClient.getBalance({
    address: walletAddress,
  });

  return {
    symbol: "ETH",
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
 * Fetch total balance for this token across all supported chains
 */
export async function fetchERC20Balance(
  chainManager: ChainManager,
  walletAddress: Address,
  token: TokenInfo
): Promise<TokenBalance> {
  const supportedChain = chainManager.getSupportedChain();

  const balance = await fetchERC20BalanceForChain(
    token,
    supportedChain,
    walletAddress,
    chainManager
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
 * Fetch balance for this token on a specific chain
 */
async function fetchERC20BalanceForChain(
  token: TokenInfo,
  chainId: SupportedChainId,
  walletAddress: Address,
  chainManager: ChainManager
): Promise<bigint> {
  const tokenAddress = getTokenAddress(token.symbol, chainId);
  if (!tokenAddress) {
    throw new Error(`${token.symbol} not supported on chain ${chainId}`);
  }

  const publicClient = chainManager.getPublicClient(chainId);

  // Handle native ETH balance
  if (token.symbol === "ETH") {
    return publicClient.getBalance({
      address: walletAddress,
    });
  }

  // Handle ERC20 token balance
  return publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [walletAddress],
  });
}
