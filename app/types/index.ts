// Core types based on AgentPipe data structures

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  INTERRUPTED = 'INTERRUPTED',
  ERROR = 'ERROR',
}

export enum OrchestratorMode {
  ROUND_ROBIN = 'round-robin',
  REACTIVE = 'reactive',
  FREE_FORM = 'free-form',
}

export enum MessageRole {
  AGENT = 'agent',
  USER = 'user',
  SYSTEM = 'system',
}

export interface ResponseMetrics {
  duration?: number;        // milliseconds
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  model?: string;           // AI model: "claude-sonnet-4", "gpt-4-turbo", etc.
  cost?: number;            // USD
}

export interface ConversationSummaryData {
  text: string;
  agent_type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  duration_ms: number;
}

export interface Message {
  id: string;
  conversationId: string;
  agentId: string;
  agentName: string;
  agentType: string;          // Agent type: "claude", "amp", "gemini", etc.
  agentVersion?: string;      // Agent software version: "1.2.0", "0.5.0", etc.
  content: string;
  role: MessageRole;
  timestamp: Date;
  metrics?: ResponseMetrics;
}

export interface ConversationAgent {
  id: string;
  conversationId: string;
  agentId: string;
  agentType: string;          // Agent type: "claude", "amp", "gemini", etc.
  agentName: string;
  agentVersion?: string;      // Agent software version: "1.2.0", "0.5.0", etc.
  model?: string;             // AI model: "claude-sonnet-4", "gpt-4-turbo", etc.
  prompt?: string;
  announcement?: string;
}

export interface Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  completedAt?: Date;
  status: ConversationStatus;
  mode: OrchestratorMode;
  maxTurns?: number;
  initialPrompt: string;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;    // milliseconds

  // Conversation Summary (AI-generated)
  summaryText?: string;
  summaryAgentType?: string;
  summaryModel?: string;
  summaryInputTokens?: number;
  summaryOutputTokens?: number;
  summaryTotalTokens?: number;
  summaryCost?: number;
  summaryDuration?: number; // milliseconds
  summaryGeneratedAt?: Date;
  summaryData?: Record<string, any>; // Full summary JSON

  messages?: Message[];
  participants?: ConversationAgent[];
  metadata?: Record<string, any>;
}

export interface ConversationSummary {
  id: string;
  createdAt: Date;
  status: ConversationStatus;
  mode: OrchestratorMode;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;
  participantCount: number;
  participantTypes: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MetricsSummary {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  averageConversationDuration: number;
  topAgents: Array<{
    type: string;
    count: number;
    totalCost: number;
  }>;
}

export interface SearchFilters {
  status?: ConversationStatus[];
  agentTypes?: string[];
  models?: string[];
  startDate?: Date;
  endDate?: Date;
  minCost?: number;
  maxCost?: number;
  minTokens?: number;
  maxTokens?: number;
}

export interface SearchRequest {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'totalCost' | 'totalTokens' | 'totalDuration';
  order?: 'asc' | 'desc';
}

// WebSocket event types

export enum WebSocketEventType {
  CONVERSATION_STARTED = 'conversation.started',
  CONVERSATION_COMPLETED = 'conversation.completed',
  CONVERSATION_INTERRUPTED = 'conversation.interrupted',
  MESSAGE_CREATED = 'message.created',
  TURN_STARTED = 'turn.started',
  TURN_COMPLETED = 'turn.completed',
  ERROR_OCCURRED = 'error.occurred',
}

export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  timestamp: Date;
  data: T;
}

export interface ConversationStartedEvent {
  conversationId: string;
  mode: OrchestratorMode;
  participants: string[];
  initialPrompt: string;
}

export interface MessageCreatedEvent {
  conversationId: string;
  message: Message;
}

export interface ConversationCompletedEvent {
  conversationId: string;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;
  summary?: ConversationSummaryData;
}
