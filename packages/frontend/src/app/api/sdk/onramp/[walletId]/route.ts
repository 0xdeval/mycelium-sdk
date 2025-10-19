import { type NextRequest, NextResponse } from 'next/server';
import { MyceliumService } from '@/libs/MyceliumService';
import type { OnRampUrlResponse } from '@mycelium-sdk/core';

export async function GET(
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
      const onRampLink: OnRampUrlResponse = await myceliumService.getOnRampLink(walletId);
      return NextResponse.json({
        success: true,
        onRampLink,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get on-ramp link: ' + error,
      });
    }
  } catch (error) {
    console.error('Error getting on-ramp link:', error);
    return NextResponse.json({ error: `Failed to get on-ramp link: ${error}` }, { status: 500 });
  }
}
