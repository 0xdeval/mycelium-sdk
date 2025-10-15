import { type NextRequest, NextResponse } from 'next/server';
import { MyceliumService } from '@/libs/MyceliumService';
import { WalletsDatabase } from '@/libs/WalletsDatabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const walletDb = WalletsDatabase.getInstance();
    await walletDb.init();

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    const result = await myceliumService.createWallet();

    await walletDb.saveWallet(userId, result.walletId, result.walletAddress);

    return NextResponse.json({
      walletId: result.walletId,
      walletAddress: result.walletAddress,
      success: true,
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return NextResponse.json({ error: `Failed to create wallet: ${error}` }, { status: 500 });
  }
}
