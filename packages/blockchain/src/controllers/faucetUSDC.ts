import type { FaucetRequestBody, FaucetResponse } from "@/types/faucet";
import type { Request, Response } from "express";
import { rpcCall } from "@/utils";

export const usdcFaucetImpersonate = async (
  req: Request<{}, {}, FaucetRequestBody>,
  res: Response<FaucetResponse | { error: string }>
) => {
  try {
    const { to, amountUsdc = "100" } = req.body;
    if (!to) return res.status(400).json({ error: "`to` is required" });

    // Known USDC-rich addresses (Uniswap pools, large holders)
    const richAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8"; // Uniswap V3 USDC/ETH pool

    // Impersonate the rich address
    await rpcCall("anvil_impersonateAccount", [richAddress] as any);

    // Convert USDC amount to wei (6 decimals)
    const usdcAmount = BigInt(Math.floor(parseFloat(amountUsdc) * 10 ** 6));

    // Create USDC transfer transaction data
    // transfer(address,uint256) = 0xa9059cbb + padded address + padded amount
    const paddedAddress = to.slice(2).padStart(64, "0");
    const paddedAmount = usdcAmount.toString(16).padStart(64, "0");
    const transferData = "0xa9059cbb" + paddedAddress + paddedAmount;

    // Send transaction from impersonated address
    const txHash = await rpcCall("eth_sendTransaction", [
      {
        from: richAddress,
        to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract address (replace with real)
        data: transferData,
        gas: "0x186A0", // 100,000 gas
        gasPrice: "0x0", // Free gas
      },
    ] as any);

    // Stop impersonating
    await rpcCall("anvil_stopImpersonatingAccount", [richAddress] as any);

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
