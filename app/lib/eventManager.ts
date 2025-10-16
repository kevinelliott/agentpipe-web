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

  // Subscribe to all events
  subscribe(listener: EventListener): () => void {
    const listenerId = Math.random().toString(36);
    if (!this.listeners.has(listenerId)) {
      this.listeners.set(listenerId, new Set());
    }
    this.listeners.get(listenerId)!.add(listener);

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
  subscribeToConversation(conversationId: string, listener: EventListener): () => void {
    if (!this.conversationListeners.has(conversationId)) {
      this.conversationListeners.set(conversationId, new Set());
    }
    this.conversationListeners.get(conversationId)!.add(listener);

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
      globalListeners: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      conversationListeners: this.conversationListeners.size,
      totalListeners: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0) +
        Array.from(this.conversationListeners.values()).reduce((sum, set) => sum + set.size, 0),
    };
  }
}

// Singleton instance
export const eventManager = new EventManager();
