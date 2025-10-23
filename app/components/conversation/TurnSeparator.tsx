import React from 'react';

interface TurnSeparatorProps {
  timeDiff?: number; // milliseconds
  className?: string;
}

export function TurnSeparator({ timeDiff, className = '' }: TurnSeparatorProps) {
  const formatTimeDiff = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes} min pause`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m pause`;
  };

  const showTimeLabel = timeDiff && timeDiff > 120000; // > 2 minutes

  return (
    <div className={`my-6 border-t border-border relative ${className}`}>
      {showTimeLabel && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-3 bg-background text-xs text-muted-foreground whitespace-nowrap">
          {formatTimeDiff(timeDiff)}
        </span>
      )}
    </div>
  );
}
