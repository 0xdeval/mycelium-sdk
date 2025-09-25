import { NextRequest, NextResponse } from "next/server";
import { MyceliumService } from "@/libs/MyceliumService";

export async function POST(request: NextRequest) {
  try {
    const { walletId } = await request.json();

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    const balance = await myceliumService.getEarnBalance(walletId);

    console.log("Balance on server >>>>> ", balance, walletId);

    return NextResponse.json({ success: true, balance });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
