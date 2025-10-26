'use client';

import React, { useEffect } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantColors = {
    danger: { icon: '⚠️', bgClass: 'bg-red-50 dark:bg-red-950', borderClass: 'border-red-200 dark:border-red-800', textClass: 'text-red-900 dark:text-red-100', buttonVariant: 'destructive' as const },
    warning: { icon: '⚡', bgClass: 'bg-yellow-50 dark:bg-yellow-950', borderClass: 'border-yellow-200 dark:border-yellow-800', textClass: 'text-yellow-900 dark:text-yellow-100', buttonVariant: 'secondary' as const },
    info: { icon: 'ℹ️', bgClass: 'bg-blue-50 dark:bg-blue-950', borderClass: 'border-blue-200 dark:border-blue-800', textClass: 'text-blue-900 dark:text-blue-100', buttonVariant: 'primary' as const },
  };

  const config = variantColors[variant];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-background border ${config.borderClass} rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${config.bgClass} px-6 py-4 border-b ${config.borderClass}`}>
            <h2 className={`text-lg font-semibold ${config.textClass} flex items-center gap-2`}>
              <span className="text-xl">{config.icon}</span>
              {title}
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3 justify-end rounded-b-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={config.buttonVariant}
              size="sm"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
