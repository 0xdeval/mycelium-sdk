import { NextRequest, NextResponse } from "next/server";
import { MyceliumService } from "@/libs/MyceliumService";
import { BeefyProtocol } from "@mycelium-sdk/core";
// import type { SmartWallet } from "@mycelium-sdk/core";

console.log("=== vault-deposit route.ts loaded ===");

export async function POST(request: NextRequest) {
  console.log("API Request received!!!!");
  try {
    const body = await request.json();
    // console.log('Raw request body:', body);

    const { walletId, walletAddress, vaultInfo, amount, chainId } = body;

    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    // const embeddedWallet = await myceliumService.getSDK()!.wallet.getEmbeddedWallet({ walletId });
    // const account = await embeddedWallet.account();

    const embeddedWallet = await myceliumService
      .getSDK()!
      .wallet.getEmbeddedWallet({ walletId });
    // walletId: "f1qli4jkpiupss1gkoh66adc"
    // address: "0xE0c0077A7F957979Be56feD6D1A69Deb7Bc1ecD5"

    // 2. Создается Smart Wallet с Embedded Wallet как signer
    // const wallet = await myceliumService.getSDK()!.wallet.createSmartWallet({
    //   owners: [embeddedWallet.address], // Embedded wallet как владелец
    //   signer: await embeddedWallet.account(), // Embedded wallet как подписант
    // });
    const smartWallet = await myceliumService
      .getSDK()!
      .wallet.getSmartWalletWithEmbeddedSigner({ walletId });
    console.log(" ====== Wallet: ====== ", smartWallet);

    const beefyProtocol = new BeefyProtocol(
      myceliumService.getSDK()!.chainManager
    );
    const result = await beefyProtocol.deposit(
      amount,
      vaultInfo,
      walletAddress,
      chainId,
      smartWallet
    );

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
