/* eslint-disable no-undef */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';

type ExportFormat = 'json' | 'csv' | 'markdown';

interface ExportDialogProps {
  conversationId: string;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onExport?: (format: ExportFormat) => void;
}

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: string;
  extension: string;
}

export function ExportDialog({
  conversationId,
  isOpen,
  isLoading = false,
  onClose,
  onExport,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard navigation (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // ESC key closes dialog
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus first format button when dialog opens
      setTimeout(() => firstButtonRef.current?.focus(), 0);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const exportOptions: ExportOption[] = [
    {
      format: 'json',
      label: 'JSON',
      description: 'Full conversation data with all metadata and metrics',
      icon: '{}',
      extension: '.json',
    },
    {
      format: 'csv',
      label: 'CSV',
      description: 'Messages table with timestamps, agents, tokens, and cost',
      icon: '📊',
      extension: '.csv',
    },
    {
      format: 'markdown',
      label: 'Markdown',
      description: 'Well-formatted document with summary and full conversation',
      icon: '📄',
      extension: '.md',
    },
  ];

  const handleExport = async () => {
    if (onExport) {
      onExport(selectedFormat);
    } else {
      // Default behavior: trigger download
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/export?format=${selectedFormat}`
        );

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `conversation-${conversationId}-${new Date().toISOString().split('T')[0]}.${selectedFormat === 'markdown' ? 'md' : selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onClose();
      } catch (error) {
        console.error('Error exporting conversation:', error);
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
        onClick={(e) => e.currentTarget === e.target && onClose()}
      >
        <div
          ref={dialogRef}
          className="bg-background border border-border rounded-lg shadow-lg max-w-sm w-full animate-in fade-in zoom-in-95 duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-dialog-title"
          aria-describedby="export-dialog-description"
        >
          {/* Header */}
          <div className="border-b border-border px-6 py-4">
            <h2 id="export-dialog-title" className="text-lg font-semibold text-foreground">
              Export Conversation
            </h2>
            <p id="export-dialog-description" className="text-sm text-muted-foreground mt-1">
              Choose a format to export this conversation
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-3">
            {exportOptions.map((option, index) => (
              <button
                ref={index === 0 ? firstButtonRef : null}
                key={option.format}
                onClick={() => setSelectedFormat(option.format)}
                className={`w-full text-left p-4 md:p-3 rounded-lg border-2 transition-all hover:shadow-md active:scale-98 animate-in fade-in slide-in-from-top-2 duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[3rem] md:min-h-[2.5rem] flex items-center ${
                  selectedFormat === option.format
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                role="radio"
                aria-checked={selectedFormat === option.format}
                aria-label={`Export as ${option.label}`}
                title={option.description}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0 pt-1">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {option.label}
                      </h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        {option.extension}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                  {selectedFormat === option.format && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-background"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 flex gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              aria-label="Close export dialog"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              variant="primary"
              size="sm"
              disabled={isLoading}
              aria-label={`Export conversation as ${selectedFormat.toUpperCase()}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2" aria-label="Exporting conversation">
                  <span className="inline-flex animate-spin">⟳</span>
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>↓</span>
                  Export
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
