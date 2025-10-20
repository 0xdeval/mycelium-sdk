import { type NextRequest, NextResponse } from 'next/server';
import { MyceliumService } from '@/libs/MyceliumService';
import type { TopUpUrlResponse } from '@mycelium-sdk/core';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ walletId: string }> },
) {
  try {
    const { walletId } = await params;

    if (!walletId) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
    }

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    try {
      const topUpLink: TopUpUrlResponse = await myceliumService.getTopUpLink(walletId);
      return NextResponse.json({
        success: true,
        data: topUpLink,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get top-up link: ' + error,
      });
    }
  } catch (error) {
    console.error('Error getting top-up link:', error);
    return NextResponse.json({ error: `Failed to get top-up link: ${error}` }, { status: 500 });
  }
}
