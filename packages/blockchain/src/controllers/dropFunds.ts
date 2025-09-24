import type { DropFundsResponse, FaucetRequestBody } from '@/types/faucet';
import type { Request, Response } from 'express';
import { getEth } from '@/methods/getEth';
import { getUsdc } from '@/methods/getUsdc';

export const dropFunds = async (
  req: Request<{}, {}, FaucetRequestBody>,
  res: Response<DropFundsResponse | { error: string }>,
) => {
  try {
    const { to, amountEth = '0.1', amountUsdc = '100' } = req.body;
    if (!to) {
      return res.status(400).json({ error: '`to` is required' });
    }

    const result = await getEth({ to, amountEth });
    if (!result) {
      return res.status(500).json({ error: 'Failed to get ETH' });
    }

    const resultUsdc = await getUsdc({ to, amountUsdc });
    if (!resultUsdc) {
      return res.status(500).json({ error: 'Failed to get USDC' });
    }

    res.json({
      ok: true,
      address: to,
      balanceEth: amountEth + ' ETH',
      balanceUsdc: amountUsdc + ' USDC',
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
};
