import { NextResponse } from 'next/server';
import { eventManager } from '@/app/lib/eventManager';

/**
 * GET /api/test/emit-event
 * Test endpoint to manually emit an event and verify the SSE pipeline
 */
export async function GET() {
  console.log('[Test] Emitting test event...');

  // Get current stats before emitting
  const statsBefore = eventManager.getStats();
  console.log('[Test] EventManager stats before emit:', statsBefore);

  // Emit a test event
  eventManager.emit({
    type: 'test.event',
    timestamp: new Date(),
    data: {
      message: 'This is a test event from /api/test/emit-event',
      timestamp: new Date().toISOString(),
    },
  });

  // Get stats after emitting
  const statsAfter = eventManager.getStats();
  console.log('[Test] EventManager stats after emit:', statsAfter);

  return NextResponse.json({
    success: true,
    message: 'Test event emitted',
    stats: {
      before: statsBefore,
      after: statsAfter,
    },
  });
}
