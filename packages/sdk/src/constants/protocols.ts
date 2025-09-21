import { BeefyProtocol } from "@/protocols/implementations/BeefyProtocol";
import type { Protocol } from "@/types/protocols/general";

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
