import { NextRequest, NextResponse } from "next/server";
import { MyceliumService } from "@/libs/MyceliumService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { walletId, walletAddress, vaultInfo, amount, chainId } = body;

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    const result = await myceliumService.earn(walletId, amount);

    return NextResponse.json({ success: true, hash: result.hash });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
