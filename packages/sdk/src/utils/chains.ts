import { type Chain } from "viem";
import * as viemChains from "viem/chains";

/** Runtime map: chain ID -> Chain */
export const chainById: Record<number, Chain> = Object.values(
  viemChains
).reduce(
  (acc, maybeChain) => {
    // viem/chains exports both chain objects and helpers; pick only real Chain objects
    if (
      maybeChain &&
      typeof maybeChain === "object" &&
      "id" in maybeChain &&
      typeof (maybeChain as any).id === "number" &&
      "name" in maybeChain
    ) {
      const chain = maybeChain as Chain;
      acc[chain.id] = chain;
    }
    return acc;
  },
  {} as Record<number, Chain>
);
