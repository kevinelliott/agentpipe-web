import React from 'react';
import { AgentAvatar, type AgentType } from '../agent/AgentAvatar';

interface MessageHeaderProps {
  agentName: string;
  agentType: AgentType;
  timestamp: string;
  turnNumber?: number | null;
  model?: string | null;
  messageNumber: number;
}

export function MessageHeader({
  agentName,
  agentType,
  timestamp,
  turnNumber,
  model,
  messageNumber,
}: MessageHeaderProps) {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-3 mb-3">
      <AgentAvatar agent={agentType} size="sm" />

      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-foreground">
          {agentName}
        </span>

        <span className="text-xs text-muted-foreground">•</span>

        <span className="text-xs text-muted-foreground">
          {turnNumber !== null && turnNumber !== undefined ? `Turn ${turnNumber}` : `Message ${messageNumber}`}
        </span>

        <span className="text-xs text-muted-foreground">•</span>

        <span className="text-xs text-muted-foreground" title={new Date(timestamp).toLocaleString()}>
          {formatTime(timestamp)}
        </span>

        {model && (
          <>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
              {model}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
