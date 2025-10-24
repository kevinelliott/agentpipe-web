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
    positive: 'bg-status-active/15',
    negative: 'bg-status-error/15',
    neutral: 'bg-muted/40',
  };

  const changeIcons = {
    positive: '↑',
    negative: '↓',
    neutral: '',
  };

  const baseClasses = `bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/30 ${className}`;
  const interactiveClasses = onClick ? 'cursor-pointer' : '';

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
      <div className="flex items-start justify-between mb-5">
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/20 shadow-md">
            {React.cloneElement(icon as React.ReactElement, { size: 32 } as Record<string, unknown>)}
          </div>
        )}
        {change && (
          <div
            className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full ${changeColors[change.type]} ${changeBgColors[change.type]} backdrop-blur-sm`}
          >
            {changeIcons[change.type] && <span className="text-sm">{changeIcons[change.type]}</span>}
            <span>{change.value}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider opacity-75">{label}</span>
        <div className="text-5xl font-bold leading-none text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {value}
        </div>
      </div>
    </div>
  );
}
