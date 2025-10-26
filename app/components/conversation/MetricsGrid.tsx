import React from 'react';

interface MetricsGridProps {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;
  maxTurns?: number | null;
}

export function MetricsGrid({
  totalMessages,
  totalTokens,
  totalCost,
  totalDuration,
  maxTurns,
}: MetricsGridProps) {
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatDuration = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  };

  const metrics = [
    {
      label: 'Messages',
      value: totalMessages.toString(),
      icon: '💬',
      color: 'from-blue-500/20 to-blue-600/10',
    },
    {
      label: 'Tokens',
      value: formatTokens(totalTokens),
      icon: '🪙',
      color: 'from-purple-500/20 to-purple-600/10',
    },
    {
      label: 'Cost',
      value: `$${totalCost.toFixed(4)}`,
      icon: '💵',
      color: 'from-green-500/20 to-green-600/10',
    },
    {
      label: 'Duration',
      value: formatDuration(totalDuration),
      icon: '⏱️',
      color: 'from-orange-500/20 to-orange-600/10',
    },
  ];

  return (
    <div className="space-y-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`bg-gradient-to-br ${metric.color} border border-border rounded-lg p-4`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {metric.label}
              </div>
              <div className="text-lg font-semibold text-foreground truncate">
                {metric.value}
              </div>
            </div>
            <div className="text-2xl flex-shrink-0">
              {metric.icon}
            </div>
          </div>
        </div>
      ))}

      {maxTurns !== null && maxTurns !== undefined && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-xs text-muted-foreground">
          <div className="font-medium mb-1">Max Turns</div>
          <div className="text-sm font-semibold text-foreground">{maxTurns}</div>
        </div>
      )}
    </div>
  );
}
