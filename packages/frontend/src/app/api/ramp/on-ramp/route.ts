import { type NextRequest, NextResponse } from 'next/server';
import { MyceliumService } from '@/libs/MyceliumService';
import type { RampConfigResponse } from '@mycelium-sdk/core';

export async function GET(_request: NextRequest) {
  try {
    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    try {
      const topUpOptions: RampConfigResponse = await myceliumService.getTopUpOptions();

      console.log('topUpOptions', topUpOptions);
      return NextResponse.json({
        success: true,
        data: topUpOptions,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get top-up options: ' + error,
      });
    }
  } catch (error) {
    console.error('Error getting top-up options:', error);
    return NextResponse.json({ error: `Failed to get top-up options: ${error}` }, { status: 500 });
  }
}
