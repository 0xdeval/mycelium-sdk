import { rpcCall } from "@/utils";

export const getUsdc = async ({
  to,
  amountUsdc,
}: {
  to: string;
  amountUsdc: string;
}) => {
  // Known USDC-rich addresses (Uniswap pools, large holders)
  const richAddress = "0x0b0a5886664376f59c351ba3f598c8a8b4d0a6f3"; // Uniswap V3 USDC/ETH pool

  // Impersonate the rich address
  await rpcCall("anvil_impersonateAccount", [richAddress] as any);

  // Give the impersonated address some ETH for gas
  await rpcCall("anvil_setBalance", [
    richAddress,
    "0x56BC75E2D630000000",
  ] as any); // 100 ETH

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
      to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC contract address (replace with real)
      data: transferData,
      gas: "0x186A0", // 100,000 gas
      gasPrice: "0x3B9ACA00", // 1 gwei (1000000000 wei)
    },
  ] as any);

  // Stop impersonating
  await rpcCall("anvil_stopImpersonatingAccount", [richAddress] as any);

  return { txHash, richAddress };
};
