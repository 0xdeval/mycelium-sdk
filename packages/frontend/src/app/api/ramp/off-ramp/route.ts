import { type NextRequest, NextResponse } from 'next/server';
import { MyceliumService } from '@/libs/MyceliumService';
import type { FundingOptionsResponse } from '@mycelium-sdk/core';

export async function GET(_request: NextRequest) {
  try {
    const myceliumService = MyceliumService.getInstance();
    await myceliumService.init();

    try {
      const cashOutOptions: FundingOptionsResponse = await myceliumService.getCashOutOptions();

      return NextResponse.json({
        success: true,
        data: cashOutOptions,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get cash out options: ' + error,
      });
    }
  } catch (error) {
    console.error('Error getting cash out options:', error);
    return NextResponse.json(
      { error: `Failed to get cash out options: ${error}` },
      { status: 500 },
    );
  }
}
