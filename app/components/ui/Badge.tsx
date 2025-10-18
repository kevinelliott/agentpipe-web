import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info';
type BadgeSize = 'default' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'default',
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 rounded-full font-medium leading-[1.5] border whitespace-nowrap';

  const sizeClasses: Record<BadgeSize, string> = {
    default: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-muted text-foreground border-border',
    primary: 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-800',
    success: 'bg-status-active-bg text-status-active border-status-active-border',
    error: 'bg-status-error-bg text-status-error border-status-error-border',
    warning: 'bg-status-interrupted-bg text-status-interrupted border-status-interrupted-border',
    info: 'bg-status-completed-bg text-status-completed border-status-completed-border',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
