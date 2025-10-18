import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const inputClasses = `
    w-full min-h-[2.5rem] px-3 border border-input rounded-md
    bg-background text-input-foreground text-sm font-sans
    transition-all duration-fast
    hover:not(:disabled):not(:focus):border-[var(--border-strong)]
    focus:border-ring focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-2 text-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${inputClasses} ${className}`.trim()}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface SearchInputProps extends Omit<InputProps, 'type'> {
  onSearch?: (value: string) => void;
}

export function SearchInput({
  onSearch,
  className = '',
  ...props
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch((e.target as HTMLInputElement).value);
    }
  };

  return (
    <Input
      type="search"
      className={`pl-10 bg-[url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%23737373" viewBox="0 0 16 16"%3E%3Cpath d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/%3E%3C/svg%3E')] bg-no-repeat bg-[12px_center] ${className}`}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
