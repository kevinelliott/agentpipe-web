import { z } from 'zod';

// System information schema
export const systemInfoSchema = z.object({
  agentpipe_version: z.string(),
  os: z.string(),
  os_version: z.string(),
  go_version: z.string(),
  architecture: z.string().optional(),
  arch: z.string().optional(),
}).refine(
  (data) => data.architecture || data.arch,
  { message: "Either 'architecture' or 'arch' must be provided" }
);

// Agent participant schema
export const agentParticipantSchema = z.object({
  agent_id: z.string().optional(), // Unique ID for this agent in the conversation
  agent_type: z.string(),
  agent_version: z.string().optional(),
  model: z.string().optional(),
  name: z.string().optional(),
  prompt: z.string().optional(),
  cli_version: z.string().optional(),
});

// Conversation started event
export const conversationStartedSchema = z.object({
  type: z.literal('conversation.started'),
  timestamp: z.string().datetime(),
  data: z.object({
    conversation_id: z.string(),
    mode: z.string(),
    initial_prompt: z.string(),
    max_turns: z.number().optional(),
    // Support both 'participants' (new) and 'agents' (old) for backward compatibility
    participants: z.array(agentParticipantSchema).optional(),
    agents: z.array(agentParticipantSchema).optional(),
    system_info: systemInfoSchema,
  }).refine(
    (data) => data.participants || data.agents,
    { message: "Either 'participants' or 'agents' must be provided" }
  ),
});

// Message created event
export const messageCreatedSchema = z.object({
  type: z.literal('message.created'),
  timestamp: z.string().datetime(),
  data: z.object({
    conversation_id: z.string(),
    message_id: z.string().optional(),
    agent_type: z.string(),
    agent_name: z.string().optional(),
    agent_version: z.string().optional(),
    content: z.string().max(100000), // 100KB limit
    role: z.string().optional(),
    sequence_number: z.number().optional(),
    turn_number: z.number().optional(),
    tokens_used: z.number().optional(),
    input_tokens: z.number().optional(),
    output_tokens: z.number().optional(),
    cost: z.number().optional(),
    model: z.string().optional(),
    duration_ms: z.number().optional(),
  }),
});

// Conversation summary schema
export const conversationSummarySchema = z.object({
  short_text: z.string().max(1000).optional(), // Optional short summary
  text: z.string().max(10000), // 10KB limit for summary text
  agent_type: z.string(),
  model: z.string(),
  input_tokens: z.number(),
  output_tokens: z.number(),
  total_tokens: z.number(),
  cost: z.number(),
  duration_ms: z.number(),
});

// Conversation completed event
export const conversationCompletedSchema = z.object({
  type: z.literal('conversation.completed'),
  timestamp: z.string().datetime(),
  data: z.object({
    conversation_id: z.string(),
    status: z.enum(['completed', 'interrupted', 'error']),
    total_messages: z.number().optional(),
    total_turns: z.number().optional(),
    total_tokens: z.number().optional(),
    total_cost: z.number().optional(),
    duration_seconds: z.number().optional(),
    summary: conversationSummarySchema.optional(),
  }),
});

// Conversation error event
export const conversationErrorSchema = z.object({
  type: z.literal('conversation.error'),
  timestamp: z.string().datetime(),
  data: z.object({
    conversation_id: z.string(),
    error_message: z.string(),
    error_type: z.string().optional(),
    agent_type: z.string().optional(),
  }),
});

// Bridge test event (for testing connectivity)
export const bridgeTestSchema = z.object({
  type: z.literal('bridge.test'),
  timestamp: z.string().datetime(),
  data: z.object({
    message: z.string().optional(),
    system_info: systemInfoSchema.optional(),
  }),
});

// Bridge connected event (when an emitter is created)
export const bridgeConnectedSchema = z.object({
  type: z.literal('bridge.connected'),
  timestamp: z.string().datetime(),
  data: z.object({
    system_info: systemInfoSchema,
    connected_at: z.string().datetime(),
  }),
});

// Union type for all streaming events
export const streamingEventSchema = z.discriminatedUnion('type', [
  conversationStartedSchema,
  messageCreatedSchema,
  conversationCompletedSchema,
  conversationErrorSchema,
  bridgeConnectedSchema,
  bridgeTestSchema,
]);

// Session upload schema (for bulk historical uploads)
export const sessionUploadSchema = z.object({
  conversation: z.object({
    id: z.string().optional(), // Optional, we can generate if not provided
    name: z.string(),
    mode: z.string(),
    initial_prompt: z.string(),
    max_turns: z.number().optional(),
    started_at: z.string().datetime(),
    completed_at: z.string().datetime().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'INTERRUPTED', 'ERROR']),
    total_messages: z.number().optional(),
    total_tokens: z.number().optional(),
    total_cost: z.number().optional(),
    total_duration: z.number().optional(),
    system_info: systemInfoSchema.optional(), // Optional for backwards compatibility
  }),
  agents: z.array(z.object({
    agent_type: z.string(),
    agent_name: z.string(),
    agent_version: z.string().optional(),
    model: z.string().optional(),
    prompt: z.string().optional(),
    cli_version: z.string().optional(),
  })),
  messages: z.array(z.object({
    agent_type: z.string(),
    agent_name: z.string(),
    agent_version: z.string().optional(),
    content: z.string().max(100000),
    role: z.string().optional(),
    timestamp: z.string().datetime(),
    sequence_number: z.number().optional(),
    turn_number: z.number().optional(),
    tokens_used: z.number().optional(),
    input_tokens: z.number().optional(),
    output_tokens: z.number().optional(),
    cost: z.number().optional(),
    model: z.string().optional(),
    duration_ms: z.number().optional(),
  })),
});

// Type exports
export type StreamingEvent = z.infer<typeof streamingEventSchema>;
export type ConversationStartedEvent = z.infer<typeof conversationStartedSchema>;
export type MessageCreatedEvent = z.infer<typeof messageCreatedSchema>;
export type ConversationCompletedEvent = z.infer<typeof conversationCompletedSchema>;
export type ConversationErrorEvent = z.infer<typeof conversationErrorSchema>;
export type BridgeConnectedEvent = z.infer<typeof bridgeConnectedSchema>;
export type BridgeTestEvent = z.infer<typeof bridgeTestSchema>;
export type SessionUpload = z.infer<typeof sessionUploadSchema>;
