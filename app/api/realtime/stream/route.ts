import { NextRequest } from 'next/server';
import { eventManager } from '@/app/lib/eventManager';

/**
 * GET /api/realtime/stream
 * Server-Sent Events (SSE) endpoint for realtime updates
 *
 * Query Parameters:
 * - conversationId: Subscribe to specific conversation (optional)
 *
 * Events:
 * - conversation.started
 * - message.created
 * - conversation.completed
 * - conversation.interrupted
 * - error.occurred
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString(),
        message: conversationId
          ? `Subscribed to conversation ${conversationId}`
          : 'Subscribed to all events',
      })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Set up event listener
      const listener = (event: any) => {
        const message = `data: ${JSON.stringify({
          type: event.type,
          timestamp: event.timestamp.toISOString(),
          data: event.data,
        })}\n\n`;

        try {
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      };

      // Subscribe to events
      const unsubscribe = conversationId
        ? eventManager.subscribeToConversation(conversationId, listener)
        : eventManager.subscribe(listener);

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `:heartbeat\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch (error) {
          // Controller might already be closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  });
}
