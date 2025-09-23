import { NextRequest, NextResponse } from "next/server";
import { MyceliumService } from "@/libs/MyceliumService";

export async function POST(request: NextRequest) {
  try {
    const { walletId, walletAddress, vaultInfo, amount, chainId } =
      await request.json();

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    const result = await myceliumService.withdraw(walletId, amount);

    console.log("Withdraw result:", result);

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