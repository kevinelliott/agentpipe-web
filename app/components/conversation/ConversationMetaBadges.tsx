import React from 'react';

interface ConversationMetaBadgesProps {
  duration?: number | null;
  messageCount: number;
  createdAt: string;
}

export function ConversationMetaBadges({
  duration,
  messageCount,
  createdAt,
}: ConversationMetaBadgesProps) {
  const formatDuration = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  };

  const formatRelativeTime = (dateString: string): string => {
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">
        {messageCount} message{messageCount !== 1 ? 's' : ''}
      </span>

      {duration !== null && duration !== undefined && (
        <>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground font-medium">
            {formatDuration(duration)}
          </span>
        </>
      )}

      <span className="text-xs text-muted-foreground">•</span>

      <span className="text-xs text-muted-foreground font-medium" title={new Date(createdAt).toLocaleString()}>
        {formatRelativeTime(createdAt)}
      </span>
    </div>
  );
}
