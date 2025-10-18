import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
}

export function Textarea({
  label,
  error,
  helperText,
  showCount = false,
  maxLength,
  id,
  className = '',
  value,
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const currentLength = typeof value === 'string' ? value.length : 0;

  const textareaClasses = `
    w-full min-h-[120px] px-3 py-2 border border-input rounded-md
    bg-background text-input-foreground text-sm font-sans
    transition-all duration-fast resize-y
    hover:not(:disabled):not(:focus):border-border-strong
    focus:border-ring focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium mb-1.5 text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={textareaId}
          className={`${textareaClasses} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
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
