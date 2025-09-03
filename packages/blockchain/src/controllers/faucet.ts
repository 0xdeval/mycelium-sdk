import type { FaucetRequestBody, FaucetResponse } from "@/types/faucet";
import type { Request, Response } from "express";
import { rpcCall } from "@/utils";

export const localFaucet = async (
  req: Request<{}, {}, FaucetRequestBody>,
  res: Response<FaucetResponse | { error: string }>
) => {
  try {
    const { to, amountEth = "0.1" } = req.body;
    if (!to) return res.status(400).json({ error: "`to` is required" });

    // Use a more reasonable balance value that Anvil can handle
    const wei = BigInt(Math.floor(parseFloat(amountEth) * 1e18));
    const hex = "0x" + wei.toString(16);

    await rpcCall("anvil_setBalance", [to, hex] as any);

    res.json({ ok: true, address: to, balance: amountEth + " ETH" });
  } catch (e) {
    res
      .status(500)
      .json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
};
