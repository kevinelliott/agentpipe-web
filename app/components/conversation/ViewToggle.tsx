'use client';

import React from 'react';
import type { ViewMode } from '@/app/hooks/useViewMode';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`inline-flex rounded-lg border border-border p-1 gap-1 bg-background ${className}`} role="group" aria-label="View mode">
      <button
        onClick={() => onChange('normal')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
          value === 'normal'
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={value === 'normal'}
        aria-label="Normal view"
      >
        Normal
      </button>
      <button
        onClick={() => onChange('slim')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
          value === 'slim'
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={value === 'slim'}
        aria-label="Slim view"
      >
        Slim
      </button>
    </div>
  );
}
