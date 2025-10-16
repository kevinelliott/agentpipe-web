import { NextResponse } from 'next/server';
import { eventManager } from '@/app/lib/eventManager';

/**
 * GET /api/realtime/stats
 * Get realtime connection statistics
 */
export async function GET() {
  const stats = eventManager.getStats();

  return NextResponse.json({
    ...stats,
    timestamp: new Date().toISOString(),
  });
}
