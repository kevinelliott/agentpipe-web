import { NextResponse } from 'next/server';
import { eventManager } from '@/app/lib/eventManager';

/**
 * GET /api/diagnostics/events
 * Diagnostic endpoint to check EventManager status and buffered events
 *
 * Query Parameters:
 * - includeEvents: boolean - Include full event details (default: false)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeEvents = url.searchParams.get('includeEvents') === 'true';

  const stats = eventManager.getStats();
  const bufferedEvents = includeEvents ? eventManager.getBufferedEvents() : [];

  return NextResponse.json({
    stats: {
      ...stats,
      timestamp: new Date().toISOString(),
    },
    ...(includeEvents && {
      bufferedEvents: bufferedEvents.map((event) => ({
        type: event.type,
        timestamp: event.timestamp.toISOString(),
        conversationId: event.data?.conversationId || null,
        dataKeys: Object.keys(event.data || {}),
      })),
    }),
  });
}
