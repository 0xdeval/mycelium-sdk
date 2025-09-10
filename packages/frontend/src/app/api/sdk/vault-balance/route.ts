import { NextRequest, NextResponse } from 'next/server';
import { MyceliumService } from '@/libs/MyceliumService';
import { BeefyProtocol } from '@mycelium-sdk/core';

export async function POST(request: NextRequest) {
  try {
      const { walletId, walletAddress, vaultInfo, chainId } = await request.json();
      
console.log('API Request data:', { walletId, walletAddress, vaultInfo, chainId });

    
    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();
    
    const beefyProtocol = new BeefyProtocol(myceliumService.getSDK()!.chainManager);

        const embeddedWallet = await myceliumService.getSDK()!.wallet.getEmbeddedWallet({ walletId });
    const account = await embeddedWallet.account();
    const balance = await beefyProtocol.getBalance(vaultInfo, account.address, chainId);
    
    return NextResponse.json({ success: true, balance });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
