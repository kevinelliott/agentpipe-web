import React from 'react';
import { AgentAvatar, type AgentType } from '../agent/AgentAvatar';
import { StatusDot, type StatusType } from '../status/StatusDot';
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
  summaryText?: string; // Optional AI-generated summary
  messageCount: number;
  tokenCount: string;
  onClick?: () => void;
  className?: string;
}

export function ConversationCard({
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

      {/* Header with Agents on Right */}
      <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
        <div className="flex-1 min-w-0">
          {/* Title: Use prompt text instead of generic title */}
          <h4 className="text-base font-bold leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors pr-2">
            {title}
          </h4>
          {/* Status indicator with dot only - no redundant text */}
          <div className="flex items-center gap-1.5">
            <StatusDot status={status} pulse={status === 'active'} />
            <span className="text-xs text-muted-foreground font-medium">{statusLabel}</span>
          </div>
        </div>

        {/* Agent Avatars Positioned on Right */}
        <div className="flex -space-x-2 flex-shrink-0">
          {participants.slice(0, 3).map((participant, i) => (
            <div
              key={i}
              className="ring-2 ring-card transition-transform duration-300 group-hover:ring-2 group-hover:ring-primary/50"
              title={participant.name}
            >
              <AgentAvatar
                agent={participant.type}
                size="sm"
              />
            </div>
          ))}
          {participants.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-card ring-2 ring-card flex items-center justify-center text-[0.5rem] font-bold text-primary flex-shrink-0">
              +{participants.length - 3}
            </div>
          )}
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
      <div className="flex items-center justify-between pt-3 border-t border-border/50 relative z-10">
        <div className="flex items-center gap-3 text-xs">
          {/* Last Activity Time */}
          <span className="text-muted-foreground">{lastActivity}</span>

          {/* Metrics */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/40">
              <span className="font-semibold text-foreground">{messageCount}</span>
              <span className="text-muted-foreground">msgs</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/40">
              <span className="font-semibold text-foreground">{tokenCount}</span>
              <span className="text-muted-foreground">tokens</span>
            </div>
          </div>
        </div>

        {/* Status Badge Only (the text in header is sufficient as indicator) */}
        <Badge variant={statusBadgeVariant[status]} className="font-semibold text-xs">
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}
