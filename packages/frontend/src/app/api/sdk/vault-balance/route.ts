import { NextRequest, NextResponse } from "next/server";
import { MyceliumService } from "@/libs/MyceliumService";
import { BeefyProtocol } from "@mycelium-sdk/core";

export async function POST(request: NextRequest) {
  try {
    const { walletId, walletAddress, vaultInfo, chainId } =
      await request.json();

    // console.log("API Request data:", {
    //   walletId,
    //   walletAddress,
    //   vaultInfo,
    //   chainId,
    // });

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    // const beefyProtocol = new BeefyProtocol(
    //   myceliumService.getSDK()!.chainManager
    // );

    // const smartWallet = await myceliumService
    //   .getSDK()!
    //   .wallet.getSmartWalletWithEmbeddedSigner({ walletId });

    // const balance = await beefyProtocol.getBalance(
    //   vaultInfo,
    //   await smartWallet.getAddress(),
    //   chainId
    // );

    const balance = await myceliumService.getEarnBalance(walletId);

    console.log("Balance on server >>>>> ", balance);

    return NextResponse.json({ success: true, balance });
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
