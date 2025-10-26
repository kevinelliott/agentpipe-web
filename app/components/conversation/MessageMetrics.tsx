import React from 'react';

interface MessageMetricsProps {
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  cost?: number | null;
  duration?: number | null;
  viewMode?: 'normal' | 'compact' | 'slim';
}

export function MessageMetrics({
  inputTokens,
  outputTokens,
  totalTokens,
  cost,
  duration,
  viewMode = 'normal',
}: MessageMetricsProps) {
  const hasMetrics = totalTokens || cost || duration;

  if (!hasMetrics) return null;

  if (viewMode === 'slim') return null; // Hide metrics in slim view

  return (
    <div className="border-t border-border pt-3 mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
      {totalTokens !== null && totalTokens !== undefined && (
        <div className="flex items-center gap-1">
          <span className="font-medium">🪙</span>
          <span>
            {totalTokens.toLocaleString()} token{totalTokens !== 1 ? 's' : ''}
          </span>
          {inputTokens !== null && outputTokens !== null && (
            <span className="text-muted-foreground/60 ml-1">
              ({inputTokens}→{outputTokens})
            </span>
          )}
        </div>
      )}

      {cost !== null && cost !== undefined && (
        <div className="flex items-center gap-1">
          <span className="font-medium">💰</span>
          <span>${cost.toFixed(4)}</span>
        </div>
      )}

      {duration !== null && duration !== undefined && (
        <div className="flex items-center gap-1">
          <span className="font-medium">⏱️</span>
          <span>
            {(duration / 1000).toFixed(2)}s
          </span>
        </div>
      )}
    </div>
  );
}
