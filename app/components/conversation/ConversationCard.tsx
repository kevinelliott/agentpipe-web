import React from 'react';
import { AgentAvatar, type AgentType } from '../agent/AgentAvatar';
import { StatusDot, type StatusType } from '../status/StatusDot';
import { Badge } from '../ui/Badge';

interface Participant {
  type: AgentType;
  name: string;
}

interface ConversationCardProps {
  id: string;
  title: string;
  participants: Participant[];
  status: StatusType;
  statusLabel: string;
  lastActivity: string;
  preview: string;
  messageCount: number;
  tokenCount: string;
  onClick?: () => void;
  className?: string;
}

export function ConversationCard({
  id,
  title,
  participants,
  status,
  statusLabel,
  lastActivity,
  preview,
  messageCount,
  tokenCount,
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
      className={`bg-card border border-border rounded-lg p-4 transition-all duration-base cursor-pointer hover:border-strong hover:shadow-md hover:-translate-y-0.5 ${className}`.trim()}
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
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex gap-2">
          {participants.slice(0, 3).map((participant, i) => (
            <AgentAvatar
              key={i}
              agent={participant.type}
              size="sm"
            />
          ))}
          {participants.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center text-[0.6875rem] font-semibold">
              +{participants.length - 3}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold leading-snug mb-1 truncate">
            {title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <StatusDot status={status} pulse={status === 'active'} />
              <span>{statusLabel}</span>
            </div>
            <span>•</span>
            <span>{lastActivity}</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {preview}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{messageCount} messages</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{tokenCount} tokens</span>
          </div>
        </div>
        <Badge variant={statusBadgeVariant[status]}>
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}
