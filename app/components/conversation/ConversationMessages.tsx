'use client';

import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { MessageBubble } from '@/app/components/agent/MessageBubble';
import { MessageBubbleCompact } from '@/app/components/agent/MessageBubbleCompact';
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

type VirtualizedItem =
  | { type: 'separator'; id: string; timeDiff: number }
  | { type: 'message'; id: string; message: Message; isTurnChange: boolean };

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

  // Prepare items for virtualization including turn separators
  const prepareVirtualizedItems = (): VirtualizedItem[] => {
    const items: VirtualizedItem[] = [];

    messages.forEach((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const timeDiff = prevMessage
        ? new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()
        : 0;
      const isTurnChange = prevMessage ? message.agentId !== prevMessage.agentId : false;

      // Add turn separator if needed (only for slim and compact views)
      if (isTurnChange && index > 0 && (viewMode === 'slim' || viewMode === 'compact')) {
        items.push({
          type: 'separator',
          id: `sep-${message.id}`,
          timeDiff,
        });
      }

      // Add message
      items.push({
        type: 'message',
        id: message.id,
        message,
        isTurnChange,
      });
    });

    return items;
  };

  const virtualizedItems = prepareVirtualizedItems();

  const renderItem = (index: number, item: VirtualizedItem) => {
    if (item.type === 'separator') {
      return <TurnSeparator key={item.id} timeDiff={item.timeDiff} />;
    }

    const { message } = item;
    const agentType = mapAgentTypeToAgentType(message.agentType);

    if (viewMode === 'slim') {
      return (
        <MessageBubbleSlim
          key={message.id}
          agent={agentType}
          agentName={message.agentName}
          content={message.content}
          timestamp={new Date(message.timestamp)}
          onClick={onMessageClick ? () => onMessageClick(message) : undefined}
        />
      );
    }

    if (viewMode === 'compact') {
      return (
        <MessageBubbleCompact
          key={message.id}
          agent={agentType}
          agentName={message.agentName}
          content={message.content}
          timestamp={new Date(message.timestamp)}
          onClick={onMessageClick ? () => onMessageClick(message) : undefined}
        />
      );
    }

    // Normal view
    return (
      <MessageBubble
        key={message.id}
        agent={agentType}
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
    );
  };

  return (
    <Virtuoso
      data={virtualizedItems}
      itemContent={renderItem}
      className="virtuoso-list"
      style={{ height: '100%' }}
      increaseViewportBy={{ top: 100, bottom: 100 }}
    />
  );
}
