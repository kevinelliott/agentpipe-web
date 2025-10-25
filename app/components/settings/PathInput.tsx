'use client';

import React, { useRef } from 'react';

export interface PathInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'file' | 'directory';
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  validating?: boolean;
  validationStatus?: 'valid' | 'invalid' | null;
}

export function PathInput({
  label,
  value,
  onChange,
  type = 'file',
  error,
  helperText,
  placeholder,
  disabled = false,
  required = false,
  validating = false,
  validationStatus = null,
}: PathInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      // In a browser environment, we get a File object with a path property
      // For web, we'll use the file name; for Electron/Tauri, we'd get full path
      const selectedPath = (files[0] as any).path || files[0].name;
      onChange(selectedPath);
    }
  };

  const getValidationIcon = () => {
    if (validating) {
      return (
        <svg
          className="w-5 h-5 text-muted-foreground animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }

    if (validationStatus === 'valid') {
      return (
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }

    if (validationStatus === 'invalid') {
      return (
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    }

    return null;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Group */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-3 py-2 pr-10
              bg-background text-foreground
              border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              ${error ? 'border-red-500' : 'border-border hover:border-border/80'}
            `}
          />

          {/* Validation Icon */}
          {(validating || validationStatus) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
          )}
        </div>

        {/* Browse Button */}
        <button
          type="button"
          onClick={handleBrowse}
          disabled={disabled}
          className="
            px-4 py-2
            bg-secondary text-secondary-foreground
            border border-border
            rounded-lg
            font-medium text-sm
            hover:bg-secondary/80
            focus:outline-none focus:ring-2 focus:ring-primary-500/50
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            whitespace-nowrap
          "
        >
          Browse
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          {...(type === 'directory' && { webkitdirectory: '', directory: '' } as any)}
        />
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p
          className={`text-sm ${
            error ? 'text-red-500' : 'text-muted-foreground'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
