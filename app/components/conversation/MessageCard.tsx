import React from 'react';
import { type AgentType } from '../agent/AgentAvatar';
import { MessageHeader } from './MessageHeader';
import { MessageContent } from './MessageContent';
import { MessageMetrics } from './MessageMetrics';

interface MessageCardProps {
  id: string;
  agentName: string;
  agentType: AgentType;
  content: string;
  timestamp: string;
  turnNumber?: number | null;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  cost?: number | null;
  duration?: number | null;
  viewMode?: 'normal' | 'compact' | 'slim';
  messageNumber: number;
  isLatest?: boolean;
}

export const MessageCard = React.memo(function MessageCard({
  id,
  agentName,
  agentType,
  content,
  timestamp,
  turnNumber,
  model,
  inputTokens,
  outputTokens,
  totalTokens,
  cost,
  duration,
  viewMode = 'normal',
  messageNumber,
  isLatest = false,
}: MessageCardProps) {
  return (
    <div
      key={id}
      className={`bg-card border-l-4 border-agent-${agentType} rounded-lg p-5 mb-4 transition-all duration-200 hover:shadow-md hover:border-border-strong border border-border`}
    >
      {/* Message Header */}
      <MessageHeader
        agentName={agentName}
        agentType={agentType}
        timestamp={timestamp}
        turnNumber={turnNumber}
        model={model}
        messageNumber={messageNumber}
      />

      {/* Message Content */}
      {viewMode !== 'slim' && (
        <div className="border-t border-border mt-3 pt-3 mb-3">
          <MessageContent
            content={content}
            viewMode={viewMode}
          />
        </div>
      )}

      {/* Message Metrics */}
      {viewMode !== 'slim' && (
        <MessageMetrics
          inputTokens={inputTokens}
          outputTokens={outputTokens}
          totalTokens={totalTokens}
          cost={cost}
          duration={duration}
          viewMode={viewMode}
        />
      )}

      {/* Latest indicator */}
      {isLatest && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Latest message
        </div>
      )}
    </div>
  );
},
(prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.id === nextProps.id &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.isLatest === nextProps.isLatest
  );
});

MessageCard.displayName = 'MessageCard';
