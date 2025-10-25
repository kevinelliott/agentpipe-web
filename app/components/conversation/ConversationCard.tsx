import React from 'react';
import { AgentAvatar, type AgentType } from '../agent/AgentAvatar';
import { Badge } from '../ui/Badge';

interface Participant {
  type: AgentType;
  name: string;
}

interface ConversationCardProps {
  title: string;
  participants: Participant[];
  status: StatusType;
  statusLabel: string;
  lastActivity: string;
  preview: string;
  summaryText?: string; // Optional AI-generated summary (not used in simple design)
  messageCount: number;
  tokenCount: string;
  onClick?: () => void;
  className?: string;
}

type StatusType = 'active' | 'completed' | 'error' | 'interrupted' | 'pending';

export function ConversationCard({
  title,
  participants,
  status,
  statusLabel,
  lastActivity,
  preview,
  onClick,
  className = '',
}: ConversationCardProps) {
  const statusBadgeVariant = {
    active: 'success' as const,
    completed: 'info' as const,
    error: 'error' as const,
    interrupted: 'warning' as const,
    pending: 'default' as const,
  };

  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 transition-all duration-300 cursor-pointer hover:shadow-md hover:border-border-strong ${className}`.trim()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Header: Title on left, Badge on right */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-foreground leading-snug line-clamp-2 mb-1">
            {title}
          </h4>
          <div className="text-xs text-muted-foreground">
            {lastActivity} • {preview}
          </div>
        </div>
        <Badge variant={statusBadgeVariant[status]} className="flex-shrink-0 text-xs">
          {statusLabel}
        </Badge>
      </div>

      {/* Agent Avatars */}
      <div className="flex gap-2">
        {participants.slice(0, 3).map((participant, i) => (
          <div key={i} title={participant.name}>
            <AgentAvatar agent={participant.type} size="sm" />
          </div>
        ))}
        {participants.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[0.65rem] font-semibold text-muted-foreground">
            +{participants.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}
