'use client';

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const selectClasses = `
    w-full min-h-[2.5rem] px-3 pr-10 border border-input rounded-md
    bg-background text-input-foreground text-sm font-sans
    transition-all duration-fast appearance-none cursor-pointer
    bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M10.293%203.293%206%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%2001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]
    hover:not(:disabled):not(:focus):border-border-strong
    focus:border-ring focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium mb-1.5 text-foreground"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`${selectClasses} ${className}`.trim()}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-muted-foreground mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
