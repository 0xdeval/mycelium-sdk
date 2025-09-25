import { type NextRequest, NextResponse } from 'next/server';
import { MyceliumService } from '@/libs/MyceliumService';
import { WalletDatabase } from '@/libs/WalletDatabase';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = await params;

    console.log('userId in API: ', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
    }

    const walletDb = WalletDatabase.getInstance();
    await walletDb.init();

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    const walletRecord = await walletDb.getWallet(userId);

    if (!walletRecord) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    const wallet = await myceliumService.getWallet(walletRecord);
    const address = await wallet.getAddress();

    return NextResponse.json({
      userId,
      walletId: walletRecord.wallet_id,
      address,
      found: true,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get wallet: ${error}`, found: false },
      { status: 500 },
    );
  }
}
