import { NextRequest, NextResponse } from "next/server";
import { MyceliumService } from "@/libs/MyceliumService";

export async function GET(
  request: NextRequest,
  { params }: { params: { walletId: string } }
) {
  try {
    const { walletId } = await params;

    if (!walletId) {
      return NextResponse.json(
        { error: "Wallet ID is required" },
        { status: 400 }
      );
    }

    const myceliumService = MyceliumService.getInstance();
    console.log("=== About to call init() ===");
    await myceliumService.init();
    console.log("=== init() completed ===");

    try {
      const balance = await myceliumService.getWalletBalance(walletId);
      return NextResponse.json({
        success: true,
        balance: balance || { shares: "0", depositedAmount: "0", ppfs: "0" },
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: "Failed to get balance: " + error,
      });
    }
  } catch (error) {
    console.error("Error getting balance:", error);
    return NextResponse.json(
      { error: `Failed to get balance: ${error}` },
      { status: 500 }
    );
  }
}
