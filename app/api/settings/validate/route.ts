/**
 * Settings Validation API Route
 * POST /api/settings/validate - Validate a setting value before saving
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/app/lib/settings';
import { SettingKey } from '@/app/types/settings';

/**
 * POST /api/settings/validate
 * Validate a setting value
 *
 * Body: { key: string, value: any }
 * Returns: { key: string, isValid: boolean, error?: string, details?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

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
          key,
          isValid: false,
          error: 'Invalid setting key',
          details: `Key must be one of: ${validKeys.join(', ')}`,
        },
        { status: 200 } // Return 200 with validation result
      );
    }

    // Validate the value
    const result = await settingsService.validate(key, value);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating setting:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Validation error',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
