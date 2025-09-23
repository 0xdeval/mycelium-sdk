import { NextRequest, NextResponse } from "next/server";
import { MyceliumService } from "@/libs/MyceliumService";

export async function POST(request: NextRequest) {
  try {
    const { walletId, walletAddress, vaultInfo, chainId } =
      await request.json();

    console.log("Withdraw All Request data:", {
      walletId,
      walletAddress,
      vaultInfo,
      chainId,
    });

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    // Используем существующий метод из MyceliumService
    const result = await myceliumService.withdrawAll(walletId);

    console.log("Withdraw All result:", result);

    return NextResponse.json({ success: true, hash: result.hash });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}