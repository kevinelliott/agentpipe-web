import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  icon,
  onClick,
  className = '',
}: MetricCardProps) {
  const changeColors = {
    positive: 'text-status-active',
    negative: 'text-status-error',
    neutral: 'text-muted-foreground',
  };

  const changeBgColors = {
    positive: 'bg-status-active/10',
    negative: 'bg-status-error/10',
    neutral: 'bg-muted/30',
  };

  const changeIcons = {
    positive: '↑',
    negative: '↓',
    neutral: '',
  };

  const baseClasses = `bg-card border border-border rounded-lg p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${className}`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:border-primary/50' : '';

  return (
    <div
      className={`${baseClasses} ${interactiveClasses}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        {change && (
          <div
            className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-full ${changeColors[change.type]} ${changeBgColors[change.type]}`}
          >
            {changeIcons[change.type] && <span>{changeIcons[change.type]}</span>}
            <span>{change.value}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
        <div className="text-4xl font-bold leading-none text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
