'use client';

import React from 'react';
import { MessageBubble } from '@/app/components/agent/MessageBubble';
import { MessageBubbleSlim } from '@/app/components/agent/MessageBubbleSlim';
import { TurnSeparator } from './TurnSeparator';
import type { AgentType } from '@/app/components/agent/AgentAvatar';
import type { ViewMode } from '@/app/hooks/useViewMode';

interface Message {
  id: string;
  agentId: string;
  agentName: string;
  agentType: string;
  agentVersion: string | null;
  content: string;
  role: string;
  timestamp: string;
  sequenceNumber: number | null;
  turnNumber: number | null;
  duration: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  model: string | null;
  cost: number | null;
}

interface ConversationMessagesProps {
  messages: Message[];
  viewMode: ViewMode;
  mapAgentTypeToAgentType: (agentType: string) => AgentType;
  onMessageClick?: (message: Message) => void;
  emptyState?: React.ReactNode;
}

export function ConversationMessages({
  messages,
  viewMode,
  mapAgentTypeToAgentType,
  onMessageClick,
  emptyState,
}: ConversationMessagesProps) {
  if (messages.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  // Calculate time differences and detect turn changes
  const messagesWithMetadata = messages.map((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const timeDiff = prevMessage
      ? new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()
      : 0;
    const isTurnChange = prevMessage ? message.agentId !== prevMessage.agentId : false;

    return {
      message,
      timeDiff,
      isTurnChange,
    };
  });

  if (viewMode === 'slim') {
    return (
      <div className="space-y-0">
        {messagesWithMetadata.map(({ message, timeDiff, isTurnChange }, index) => (
          <React.Fragment key={message.id}>
            {isTurnChange && index > 0 && <TurnSeparator timeDiff={timeDiff} />}
            <MessageBubbleSlim
              agent={mapAgentTypeToAgentType(message.agentType)}
              agentName={message.agentName}
              content={message.content}
              timestamp={new Date(message.timestamp)}
              onClick={onMessageClick ? () => onMessageClick(message) : undefined}
            />
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Normal view
  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          agent={mapAgentTypeToAgentType(message.agentType)}
          agentName={message.agentName}
          agentVersion={message.agentVersion}
          content={message.content}
          timestamp={new Date(message.timestamp)}
          tokens={message.totalTokens || undefined}
          inputTokens={message.inputTokens || undefined}
          outputTokens={message.outputTokens || undefined}
          cost={message.cost || undefined}
          model={message.model}
          duration={message.duration || undefined}
        />
      ))}
    </div>
  );
}
