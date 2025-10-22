/**
 * Single Setting API Route
 * GET /api/settings/[key] - Get a single setting by key
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/app/lib/settings';

interface RouteParams {
  params: Promise<{
    key: string;
  }>;
}

/**
 * GET /api/settings/agentpipe.binary_path
 * Get a single setting by key
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        { error: 'Missing setting key' },
        { status: 400 }
      );
    }

    // Get the setting value
    const value = await settingsService.get(key);

    return NextResponse.json({
      key,
      value,
    });
  } catch (error) {
    console.error(`Error fetching setting ${(await params).key}:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // If setting not found, return 404
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          error: 'Setting not found',
          details: errorMessage,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch setting',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
