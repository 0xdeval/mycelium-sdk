import { NextRequest, NextResponse } from "next/server";
import { MyceliumService } from "@/libs/MyceliumService";
import { BeefyProtocol } from "@mycelium-sdk/core";

export async function POST(request: NextRequest) {
  try {
    const { walletId } = await request.json();

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    const vaultInfo = await myceliumService.getVault(walletId);

    return NextResponse.json({ success: true, vaultInfo });
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