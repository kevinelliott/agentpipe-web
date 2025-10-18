import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  icon,
  className = '',
}: MetricCardProps) {
  const changeColors = {
    positive: 'text-status-active',
    negative: 'text-status-error',
    neutral: 'text-muted-foreground',
  };

  const changeIcons = {
    positive: '↑',
    negative: '↓',
    neutral: '',
  };

  return (
    <div
      className={`bg-card border border-border rounded-lg p-5 transition-all duration-base hover:shadow-md ${className}`.trim()}
    >
      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground font-medium">
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{label}</span>
      </div>

      <div className="text-3xl font-bold leading-none mb-2 text-foreground">
        {value}
      </div>

      {change && (
        <div
          className={`text-xs font-medium flex items-center gap-1 ${changeColors[change.type]}`}
        >
          {changeIcons[change.type] && <span>{changeIcons[change.type]}</span>}
          <span>{change.value}</span>
        </div>
      )}
    </div>
  );
}
