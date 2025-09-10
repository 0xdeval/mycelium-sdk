import type { Abi } from "viem";

/**
 * Beefy Finance Vault ABI
 * Based on official beefy-contracts repository
 * https://github.com/beefyfinance/beefy-contracts
 */
export const beefyVaultAbi = [
  // Deposit functions
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "_amount",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    name: "depositAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  
  // Withdraw functions
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "_shares",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    name: "withdrawAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  
  // View functions
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  
  // Price per share (crucial for Beefy vaults)
  {
    name: "getPricePerFullShare",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  
  // Token information
  {
    name: "token",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
  },
  
  // Strategy functions
  {
    name: "strategy",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  
  // Emergency functions
  {
    name: "panic",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "pause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "unpause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  
  // Events
  {
    name: "Deposit",
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
    ],
  },
  {
    name: "Withdraw",
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
    ],
  },
] as const satisfies Abi;