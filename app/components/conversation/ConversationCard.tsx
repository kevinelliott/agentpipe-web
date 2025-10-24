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
  summaryText?: string; // Optional AI-generated summary
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
  summaryText,
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

  // Get primary agent for color theming
  const primaryAgent = participants[0]?.type;

  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 group overflow-hidden ${primaryAgent ? `shadow-agent-${primaryAgent}` : ''} ${className}`.trim()}
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
      {/* Background Accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
        style={{
          background: primaryAgent ? `var(--agent-${primaryAgent})` : 'var(--primary-500)',
        }}
      />

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="flex -space-x-2">
          {participants.slice(0, 4).map((participant, i) => (
            <div
              key={i}
              className="ring-2 ring-card transition-transform duration-300 group-hover:ring-2 group-hover:ring-primary/50"
            >
              <AgentAvatar
                agent={participant.type}
                size="md"
              />
            </div>
          ))}
          {participants.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-card ring-2 ring-card flex items-center justify-center text-[0.625rem] font-bold text-primary">
              +{participants.length - 4}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <h4 className="text-base font-bold leading-snug mb-2 truncate group-hover:text-primary transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <StatusDot status={status} pulse={status === 'active'} />
              <span className="font-medium">{statusLabel}</span>
            </div>
            <span className="opacity-50">•</span>
            <span>{lastActivity}</span>
          </div>
        </div>
      </div>

      {/* Preview - Show summary if available, otherwise show initial prompt */}
      {summaryText ? (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary flex-shrink-0"
              aria-label="AI Summary"
            >
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
              <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />
            </svg>
            <span className="text-xs text-primary font-medium">AI Summary</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 pl-5">
            {summaryText}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50 relative z-10">
        <div className="flex gap-5 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-accent/40">
            <span className="font-semibold text-foreground">{messageCount}</span>
            <span className="text-muted-foreground">msgs</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-accent/40">
            <span className="font-semibold text-foreground">{tokenCount}</span>
            <span className="text-muted-foreground">tokens</span>
          </div>
        </div>
        <Badge variant={statusBadgeVariant[status]} className="font-semibold">
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}
