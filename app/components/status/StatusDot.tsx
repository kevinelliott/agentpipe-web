import React from 'react';

export type StatusType = 'active' | 'completed' | 'error' | 'interrupted' | 'pending';
type DotSize = 'default' | 'lg';

interface StatusDotProps {
  status: StatusType;
  size?: DotSize;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({
  status,
  size = 'default',
  pulse = false,
  className = '',
}: StatusDotProps) {
  const baseClasses = 'inline-block rounded-full flex-shrink-0';

  const sizeClasses: Record<DotSize, string> = {
    default: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const statusClasses: Record<StatusType, string> = {
    active: 'bg-status-active',
    completed: 'bg-status-completed',
    error: 'bg-status-error',
    interrupted: 'bg-status-interrupted',
    pending: 'bg-status-pending',
  };

  const pulseClass = pulse ? 'animate-pulse' : '';

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${statusClasses[status]} ${pulseClass} ${className}`.trim()}
      aria-label={`Status: ${status}`}
    />
  );
}
