import type { Request, Response } from 'express';

export const health = async (req: Request, res: Response<{ ok: boolean; message: string }>) => {
  try {
    res.json({
      ok: true,
      message: 'health',
    });
  } catch {
    res.status(500).json({ ok: false, message: 'Unknown error' });
  }
};
