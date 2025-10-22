/**
 * Settings API Routes
 * GET /api/settings - Get all settings (optionally filtered by category)
 * PUT /api/settings - Update a single setting
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/app/lib/settings';
import { SettingKey } from '@/app/types/settings';

/**
 * GET /api/settings?category=agentpipe
 * Get all settings, optionally filtered by category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const settings = category
      ? await settingsService.getByCategory(category)
      : await settingsService.getAll();

    return NextResponse.json({
      settings,
      total: settings.length,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch settings',
        details: errorMessage,
        settings: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update a single setting
 *
 * Body: { key: string, value: any, userId?: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, userId } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required field: key' },
        { status: 400 }
      );
    }

    if (value === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: value' },
        { status: 400 }
      );
    }

    // Validate key is a valid SettingKey
    const validKeys = Object.values(SettingKey);
    if (!validKeys.includes(key as SettingKey)) {
      return NextResponse.json(
        {
          error: 'Invalid setting key',
          details: `Key must be one of: ${validKeys.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Set the setting (this will validate the value)
    const setting = await settingsService.set(key, value, userId);

    return NextResponse.json({
      setting,
      message: 'Setting updated successfully',
    });
  } catch (error) {
    console.error('Error updating setting:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // If validation failed, return 400
    if (errorMessage.includes('Invalid') || errorMessage.includes('must be')) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errorMessage,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update setting',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings?key=agentpipe.binary_path
 * Delete a setting
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    await settingsService.delete(key);

    return NextResponse.json({
      message: 'Setting deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting setting:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to delete setting',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
