import React from 'react';
import { Button } from './Button';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label: string;
  tooltip?: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export function ActionButton({
  icon,
  label,
  tooltip,
  loading = false,
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  className = '',
  ...props
}: ActionButtonProps) {
  const title = tooltip || label;

  return (
    <div className="relative group">
      <Button
        variant={variant}
        size={size}
        isIcon={iconOnly}
        title={title}
        disabled={loading || props.disabled}
        className={className}
        {...props}
      >
        {loading && (
          <span className="inline-flex animate-spin">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        )}
        {!loading && icon}
        {!iconOnly && label}
      </Button>

      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background rounded text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-foreground border-t-transparent border-l-transparent border-r-transparent" />
        </div>
      )}
    </div>
  );
}
