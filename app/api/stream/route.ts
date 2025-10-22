import { NextRequest } from 'next/server';
import { eventManager } from '@/app/lib/eventManager';

/**
 * GET /api/stream
 * Server-Sent Events (SSE) endpoint for real-time updates
 *
 * Query Parameters:
 * - conversationId: string (optional) - Subscribe to specific conversation events
 *
 * This endpoint streams real-time events to connected clients using SSE.
 * Clients can optionally filter events by conversation ID.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conversationId = searchParams.get('conversationId');

  // Create a readable stream for SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      console.log(`[SSE] New client connected${conversationId ? ` (conversation: ${conversationId})` : ' (global stream)'}`);
      console.log(`[SSE] EventManager stats BEFORE subscribe:`, eventManager.getStats());

      // Send initial connection message
      const connectionMessage = `data: ${JSON.stringify({
        type: 'connection.established',
        timestamp: new Date().toISOString(),
        data: {
          conversationId: conversationId || null,
          message: conversationId
            ? `Connected to conversation ${conversationId}`
            : 'Connected to global event stream',
        },
      })}\n\n`;
      controller.enqueue(encoder.encode(connectionMessage));

      // Subscribe to events
      console.log(`[SSE] Subscribing to ${conversationId ? `conversation ${conversationId}` : 'global events'}...`);
      const unsubscribe = conversationId
        ? eventManager.subscribeToConversation(conversationId, (event) => {
            try {
              console.log(`[SSE] Received conversation event: ${event.type}`);
              const message = `data: ${JSON.stringify({
                type: event.type,
                timestamp: event.timestamp.toISOString(),
                data: event.data,
              })}\n\n`;
              controller.enqueue(encoder.encode(message));
            } catch (error) {
              console.error('Error encoding event:', error);
            }
          })
        : eventManager.subscribe((event) => {
            try {
              console.log(`[SSE] Broadcasting event to client: ${event.type}`);
              const message = `data: ${JSON.stringify({
                type: event.type,
                timestamp: event.timestamp.toISOString(),
                data: event.data,
              })}\n\n`;
              controller.enqueue(encoder.encode(message));
            } catch (error) {
              console.error('Error encoding event:', error);
            }
          });

      console.log(`[SSE] Subscription complete. EventManager stats AFTER subscribe:`, eventManager.getStats());

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const heartbeatMessage = `:heartbeat\n\n`;
          controller.enqueue(encoder.encode(heartbeatMessage));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
          clearInterval(heartbeat);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected${conversationId ? ` (conversation: ${conversationId})` : ' (global stream)'}`);
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  // Return SSE response with appropriate headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
