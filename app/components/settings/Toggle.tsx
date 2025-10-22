'use client';

import React from 'react';

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Toggle({
  label,
  checked,
  onChange,
  helperText,
  disabled = false,
  required = false,
}: ToggleProps) {
  return (
    <div className="flex items-start gap-4">
      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-primary-600' : 'bg-border'}
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-background shadow ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>

      {/* Label and Helper Text */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-foreground cursor-pointer">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {helperText && (
          <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    </div>
  );
}
