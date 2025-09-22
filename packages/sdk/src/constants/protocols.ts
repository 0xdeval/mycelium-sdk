import { BeefyProtocol } from "@/protocols/implementations/BeefyProtocol";
import type { Protocol } from "@/types/protocols/general";

/**
 * Current config of protocols should have correct supportedChains array as it used to:
 * 1. Fetch vaults per chain to find the best vault for the protocol
 * 2. Deposit funds of users to a best found vault
 */
export const availableProtocols: Protocol[] = [
  {
    info: {
      id: "beefy",
      name: "Beefy Finance",
      website: "https://beefy.finance",
      logo: "/logos/beefy.png",
      supportedChains: [8453],
      riskLevel: "medium",
      isPremium: false,
    },
    instance: new BeefyProtocol(),
  },
];
