import { rpcCall } from '../utils';

export const getUsdc = async ({ to, amountUsdc }: { to: string; amountUsdc: string }) => {
  const richAddress = '0x0b0a5886664376f59c351ba3f598c8a8b4d0a6f3';

  await rpcCall('anvil_impersonateAccount', [richAddress] as never[]);

  await rpcCall('anvil_setBalance', [richAddress, '0x56BC75E2D630000000'] as never[]);

  const usdcAmount = BigInt(Math.floor(parseFloat(amountUsdc) * 10 ** 6));

  const paddedAddress = to.slice(2).padStart(64, '0');
  const paddedAmount = usdcAmount.toString(16).padStart(64, '0');
  const transferData = '0xa9059cbb' + paddedAddress + paddedAmount;

  const txHash = await rpcCall('eth_sendTransaction', [
    {
      from: richAddress,
      to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      data: transferData,
      gas: '0x186A0',
      gasPrice: '0x3B9ACA00',
    },
  ] as never[]);

  await rpcCall('anvil_stopImpersonatingAccount', [richAddress] as never[]);

  return { txHash, richAddress };
};
