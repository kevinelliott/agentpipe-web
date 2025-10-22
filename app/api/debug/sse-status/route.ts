import { NextResponse } from 'next/server';
import { eventManager } from '@/app/lib/eventManager';

/**
 * GET /api/debug/sse-status
 * Get current SSE connection status and EventManager stats
 */
export async function GET() {
  const stats = eventManager.getStats();
  const bufferedEvents = eventManager.getBufferedEvents();

  return NextResponse.json({
    eventManager: stats,
    bufferedEvents: bufferedEvents.map(e => ({
      type: e.type,
      timestamp: e.timestamp,
      conversationId: e.data?.conversationId || null,
    })),
    diagnosis: {
      hasListeners: stats.totalListeners > 0,
      hasBufferedEvents: bufferedEvents.length > 0,
      recommendation: stats.totalListeners === 0
        ? 'No SSE clients connected. Open the dashboard or a session detail page to establish a connection.'
        : `${stats.totalListeners} client(s) connected and listening for events.`,
    },
  });
}
