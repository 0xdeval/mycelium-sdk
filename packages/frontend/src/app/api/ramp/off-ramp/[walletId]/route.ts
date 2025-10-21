import { type NextRequest, NextResponse } from 'next/server';
import { MyceliumService } from '@/libs/MyceliumService';
import type { CashOutUrlResponse } from '@mycelium-sdk/core';

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      walletId: string;
    }>;
  },
) {
  try {
    const { walletId } = await params;

    const { country, paymentMethod, redirectLink, amount, tokenToSell, fiatToReceive } =
      await request.json();

    if (!walletId) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
    }

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    try {
      const cashOutLink: CashOutUrlResponse = await myceliumService.getCashOutLink(
        walletId,
        country,
        paymentMethod,
        redirectLink,
        amount,
        tokenToSell,
        fiatToReceive,
      );
      return NextResponse.json({
        success: true,
        data: cashOutLink,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get cash out link: ' + error,
      });
    }
  } catch (error) {
    console.error('Error getting cash out link:', error);
    return NextResponse.json({ error: `Failed to get cash out link: ${error}` }, { status: 500 });
  }
}
