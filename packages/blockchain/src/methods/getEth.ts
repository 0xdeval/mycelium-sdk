import { rpcCall } from '@/utils';

export const getEth = async ({ to, amountEth }: { to: string; amountEth: string }) => {
  try {
    const wei = BigInt(Math.floor(parseFloat(amountEth) * 1e18));
    const hex = '0x' + wei.toString(16);

    await rpcCall('anvil_setBalance', [to, hex] as never[]);

    return true;
  } catch (e) {
    console.error('Error getting ETH:', e);
    return false;
  }
};
