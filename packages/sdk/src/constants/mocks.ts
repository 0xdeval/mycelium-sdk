import type { VaultInfo } from "@/types/protocols/beefy";

export const MOCK_BEEFY_VAULTS: VaultInfo[] = [
  {
    id: "compound-base-usdc",
    name: "USDC",
    type: "standard",
    token: "USDC",
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    tokenDecimals: 6,
    earnedToken: "mooCompoundBaseUSDC",
    earnedTokenAddress: "0xeF6ED674486E54507d0f711C0d388BD8a1552E6F",
    earnContractAddress: "0xeF6ED674486E54507d0f711C0d388BD8a1552E6F",
    oracle: "tokens",
    oracleId: "USDC",
    status: "active",
    createdAt: 1711975000,
    platformId: "compound",
    assets: ["USDC"],
    risks: [
      "COMPLEXITY_LOW",
      "BATTLE_TESTED",
      "IL_NONE",
      "MCAP_LARGE",
      "PLATFORM_ESTABLISHED",
      "AUDIT",
      "CONTRACTS_VERIFIED",
    ],
    strategyTypeId: "lendingNoBorrow",
    buyTokenUrl:
      "https://swap.defillama.com/?chain=base&from=0x0000000000000000000000000000000000000000&to=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    network: "base",
    zaps: [
      {
        strategyId: "single",
      },
    ],
    lendingOracle: {
      provider: "chainlink",
      address: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
    },
    isGovVault: false,
    chain: "base",
    strategy: "0x2b4eF83aeE6bb3Dd5253dAa7d0756Ef5bD95f40f",
    pricePerFullShare: "1101411076034236632",
    lastHarvest: 1757617949,
  },
];
