import type { FaucetRequestBody, FaucetResponse } from "@/types/faucet";
import type { Request, Response } from "express";
import { rpcCall } from "@/utils";
import { getUsdc } from "@/methods/getUsdc";

export const usdcFaucetImpersonate = async (
  req: Request<{}, {}, FaucetRequestBody>,
  res: Response<FaucetResponse | { error: string }>
) => {
  try {
    console.log("req.body in usdcFaucetImpersonate", req.body);
    const { to, amountUsdc = "100" } = req.body;
    if (!to) return res.status(400).json({ error: "`to` is required" });

    const { txHash, richAddress } = await getUsdc({ to, amountUsdc });

    res.json({
      ok: true,
      address: to,
      balance: amountUsdc + " USDC",
      transactionHash: txHash,
      impersonatedAddress: richAddress,
    });
  } catch (e) {
    res
      .status(500)
      .json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
};
