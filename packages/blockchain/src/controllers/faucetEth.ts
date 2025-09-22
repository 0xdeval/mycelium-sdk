import type { FaucetRequestBody, FaucetResponse } from "@/types/faucet";
import type { Request, Response } from "express";
import { rpcCall } from "@/utils";
import { getEth } from "@/methods/getEth";

export const faucetEth = async (
  req: Request<{}, {}, FaucetRequestBody>,
  res: Response<FaucetResponse | { error: string }>
) => {
  try {
    const { to, amountEth = "0.1" } = req.body;
    if (!to) return res.status(400).json({ error: "`to` is required" });

    const result = await getEth({ to, amountEth });

    if (!result) {
      return res.status(500).json({ error: "Failed to get ETH" });
    }

    res.json({ ok: true, address: to, balance: amountEth + " ETH" });
  } catch (e) {
    res
      .status(500)
      .json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
};
