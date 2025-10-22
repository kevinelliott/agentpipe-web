// Event Manager for realtime updates
// Handles broadcasting events to all connected SSE clients

type EventListener = (event: RealtimeEvent) => void;

export interface RealtimeEvent {
  type: string;
  timestamp: Date;
  data: any;
}

class EventManager {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private conversationListeners: Map<string, Set<EventListener>> = new Map();
  private eventBuffer: RealtimeEvent[] = [];
  private readonly MAX_BUFFER_SIZE = 100; // Keep last 100 events
  private readonly instanceId: string;

  constructor() {
    this.instanceId = Math.random().toString(36).substring(7);
    console.log(`[EventManager:${this.instanceId}] Instance initialized`);
  }

  // Subscribe to all events
  subscribe(listener: EventListener, replayRecent: boolean = true): () => void {
    const listenerId = Math.random().toString(36);
    if (!this.listeners.has(listenerId)) {
      this.listeners.set(listenerId, new Set());
    }
    this.listeners.get(listenerId)!.add(listener);

    // Replay recent events to new subscriber
    if (replayRecent && this.eventBuffer.length > 0) {
      console.log(`[EventManager:${this.instanceId}] Replaying ${this.eventBuffer.length} buffered events to new subscriber`);
      this.eventBuffer.forEach((event) => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[EventManager:${this.instanceId}] Error replaying event:`, error);
        }
      });
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(listenerId);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(listenerId);
        }
      }
    };
  }

  // Subscribe to specific conversation events
  subscribeToConversation(conversationId: string, listener: EventListener, replayRecent: boolean = true): () => void {
    if (!this.conversationListeners.has(conversationId)) {
      this.conversationListeners.set(conversationId, new Set());
    }
    this.conversationListeners.get(conversationId)!.add(listener);

    // Replay recent events for this conversation to new subscriber
    if (replayRecent) {
      const conversationEvents = this.eventBuffer.filter(
        (event) => event.data?.conversationId === conversationId
      );
      if (conversationEvents.length > 0) {
        console.log(`[EventManager:${this.instanceId}] Replaying ${conversationEvents.length} buffered events for conversation ${conversationId}`);
        conversationEvents.forEach((event) => {
          try {
            listener(event);
          } catch (error) {
            console.error(`[EventManager:${this.instanceId}] Error replaying conversation event:`, error);
          }
        });
      }
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.conversationListeners.get(conversationId);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.conversationListeners.delete(conversationId);
        }
      }
    };
  }

  // Emit event to all subscribers
  emit(event: RealtimeEvent) {
    const stats = this.getStats();
    console.log(`[EventManager:${this.instanceId}] Emitting event: ${event.type}, listeners: ${stats.globalListeners}, buffer: ${stats.bufferedEvents}/${stats.bufferCapacity}`);

    // Add event to buffer for replay
    this.eventBuffer.push(event);

    // Keep buffer size under limit (remove oldest events)
    if (this.eventBuffer.length > this.MAX_BUFFER_SIZE) {
      const removed = this.eventBuffer.splice(0, this.eventBuffer.length - this.MAX_BUFFER_SIZE);
      console.log(`[EventManager:${this.instanceId}] Buffer full, removed ${removed.length} oldest events`);
    }

    // Notify global listeners
    this.listeners.forEach((listenerSet) => {
      listenerSet.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    });

    // Notify conversation-specific listeners if event has conversationId
    if (event.data?.conversationId) {
      const conversationListeners = this.conversationListeners.get(event.data.conversationId);
      if (conversationListeners) {
        conversationListeners.forEach((listener) => {
          try {
            listener(event);
          } catch (error) {
            console.error('Error in conversation event listener:', error);
          }
        });
      }
    }
  }

  // Emit conversation started event
  emitConversationStarted(data: {
    conversationId: string;
    mode: string;
    participants: string[];
    initialPrompt: string;
  }) {
    this.emit({
      type: 'conversation.started',
      timestamp: new Date(),
      data,
    });
  }

  // Emit message created event
  emitMessageCreated(data: {
    conversationId: string;
    message: any;
  }) {
    this.emit({
      type: 'message.created',
      timestamp: new Date(),
      data,
    });
  }

  // Emit conversation completed event
  emitConversationCompleted(data: {
    conversationId: string;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    totalDuration: number;
  }) {
    this.emit({
      type: 'conversation.completed',
      timestamp: new Date(),
      data,
    });
  }

  // Emit conversation interrupted event
  emitConversationInterrupted(data: {
    conversationId: string;
    reason?: string;
  }) {
    this.emit({
      type: 'conversation.interrupted',
      timestamp: new Date(),
      data,
    });
  }

  // Emit error event
  emitError(data: {
    conversationId?: string;
    error: string;
    details?: any;
  }) {
    this.emit({
      type: 'error.occurred',
      timestamp: new Date(),
      data,
    });
  }

  // Get statistics
  getStats() {
    return {
      instanceId: this.instanceId,
      globalListeners: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      conversationListeners: this.conversationListeners.size,
      totalListeners: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0) +
        Array.from(this.conversationListeners.values()).reduce((sum, set) => sum + set.size, 0),
      bufferedEvents: this.eventBuffer.length,
      bufferCapacity: this.MAX_BUFFER_SIZE,
    };
  }

  // Get buffered events (for debugging)
  getBufferedEvents(): RealtimeEvent[] {
    return [...this.eventBuffer];
  }

  // Clear event buffer
  clearBuffer() {
    const count = this.eventBuffer.length;
    this.eventBuffer = [];
    console.log(`[EventManager:${this.instanceId}] Cleared ${count} events from buffer`);
  }
}

// Singleton instance - ensure we only have one instance even with Next.js hot reloading
const globalForEventManager = global as unknown as {
  eventManager: EventManager | undefined;
};

// Log instance creation for debugging
const isNewInstance = !globalForEventManager.eventManager;
if (isNewInstance) {
  console.log('[EventManager] Creating new EventManager instance');
} else {
  console.log('[EventManager] Reusing existing EventManager instance');
}

export const eventManager = globalForEventManager.eventManager ?? new EventManager();

// Store in global to prevent multiple instances during development hot reload
if (process.env.NODE_ENV !== 'production' || !globalForEventManager.eventManager) {
  globalForEventManager.eventManager = eventManager;
}
