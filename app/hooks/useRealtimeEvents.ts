import { useCallback, useEffect, useRef, useState } from 'react';

export interface RealtimeEvent {
  type: string;
  timestamp: string;
  data: any;
}

interface UseRealtimeEventsOptions {
  conversationId?: string | null;
  onEvent?: (event: RealtimeEvent) => void;
  onConversationStarted?: (data: any) => void;
  onMessageCreated?: (data: any) => void;
  onConversationCompleted?: (data: any) => void;
  onConversationInterrupted?: (data: any) => void;
  onError?: (data: any) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useRealtimeEvents(options: UseRealtimeEventsOptions = {}) {
  const {
    conversationId = null,
    onEvent,
    onConversationStarted,
    onMessageCreated,
    onConversationCompleted,
    onConversationInterrupted,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualCloseRef = useRef(false);

  // Store callbacks in refs to avoid dependency issues
  // Update ref on every render without triggering effects
  const callbacksRef = useRef({
    onEvent,
    onConversationStarted,
    onMessageCreated,
    onConversationCompleted,
    onConversationInterrupted,
    onError,
  });
  callbacksRef.current = {
    onEvent,
    onConversationStarted,
    onMessageCreated,
    onConversationCompleted,
    onConversationInterrupted,
    onError,
  };

  const connect = useCallback(() => {
    // Clear any existing connection
    if (eventSourceRef.current) {
      console.log('[SSE Client] Closing existing connection');
      eventSourceRef.current.close();
    }

    // Build URL with optional conversationId
    const url = conversationId
      ? `/api/stream?conversationId=${encodeURIComponent(conversationId)}`
      : '/api/stream';

    console.log('[SSE Client] Attempting to connect to:', url);

    // Create new EventSource
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    console.log('[SSE Client] EventSource created, readyState:', eventSource.readyState);

    eventSource.onopen = () => {
      console.log('[SSE Client] Connection established (onopen fired), readyState:', eventSource.readyState);
      setIsConnected(true);
      setConnectionError(null);
    };

    eventSource.onmessage = (e) => {
      console.log('[SSE Client] Message received:', e.data.substring(0, 100));
      try {
        const event: RealtimeEvent = JSON.parse(e.data);
        console.log('[SSE Client] Parsed event type:', event.type);

        // Update state
        setLastEvent(event);
        setEventCount((count) => count + 1);

        // Call generic event handler using ref
        callbacksRef.current.onEvent?.(event);

        // Call specific event handlers using refs
        switch (event.type) {
          case 'conversation.started':
            callbacksRef.current.onConversationStarted?.(event.data);
            break;
          case 'message.created':
            callbacksRef.current.onMessageCreated?.(event.data);
            break;
          case 'conversation.completed':
            callbacksRef.current.onConversationCompleted?.(event.data);
            break;
          case 'conversation.interrupted':
            callbacksRef.current.onConversationInterrupted?.(event.data);
            break;
          case 'conversation.error':
          case 'error.occurred':
            callbacksRef.current.onError?.(event.data);
            break;
        }
      } catch (error) {
        console.error('[SSE Client] Error parsing event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[SSE Client] Connection error (onerror fired), readyState:', eventSource.readyState, 'error:', error);
      setIsConnected(false);

      if (!isManualCloseRef.current) {
        setConnectionError('Connection lost');

        // Auto-reconnect if enabled
        if (autoReconnect) {
          console.log(`[SSE Client] Reconnecting in ${reconnectInterval}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      }

      eventSource.close();
    };
  }, [conversationId, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    console.log('[SSE Client] Disconnecting manually');
    isManualCloseRef.current = true;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Connect on mount
  useEffect(() => {
    console.log('[SSE Client] useEffect triggered, conversationId:', conversationId);
    isManualCloseRef.current = false;
    connect();

    // Cleanup on unmount
    return () => {
      console.log('[SSE Client] Component unmounting, cleaning up');
      disconnect();
    };
  }, [conversationId, connect, disconnect]); // Reconnect if conversationId changes

  return {
    isConnected,
    connectionError,
    lastEvent,
    eventCount,
    disconnect,
    reconnect: connect,
  };
}

// Export default for easier imports
export default useRealtimeEvents;
