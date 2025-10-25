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
  aiSummary?: string; // Optional AI-generated summary
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
  aiSummary,
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

      {/* AI Summary Section */}
      {aiSummary && aiSummary.trim() && (
        <div className="bg-muted border border-border rounded-md p-3 mt-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-primary-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-primary-600 uppercase">AI Summary</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {aiSummary}
          </p>
        </div>
      )}

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
