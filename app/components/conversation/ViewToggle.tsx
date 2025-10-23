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
        className={`px-3 py-2 rounded-md transition-colors duration-150 ${
          value === 'normal'
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={value === 'normal'}
        aria-label="Normal view - Full details with metrics"
        title="Normal view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
          <line x1="6" y1="9" x2="6" y2="9.01" />
          <line x1="6" y1="13" x2="6" y2="13.01" />
          <line x1="6" y1="17" x2="6" y2="17.01" />
        </svg>
      </button>
      <button
        onClick={() => onChange('compact')}
        className={`px-3 py-2 rounded-md transition-colors duration-150 ${
          value === 'compact'
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={value === 'compact'}
        aria-label="Compact view - Full text without metrics"
        title="Compact view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <button
        onClick={() => onChange('slim')}
        className={`px-3 py-2 rounded-md transition-colors duration-150 ${
          value === 'slim'
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={value === 'slim'}
        aria-label="Slim view - Single line preview"
        title="Slim view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="8" x2="21" y2="8" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="16" x2="21" y2="16" />
        </svg>
      </button>
    </div>
  );
}
