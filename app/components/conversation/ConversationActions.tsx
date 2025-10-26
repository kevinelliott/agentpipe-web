'use client';

import React, { useState } from 'react';
import { ActionButton } from '../ui/ActionButton';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface ConversationActionsProps {
  conversationId: string;
  conversationTitle: string;
  onCopySummary?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function ConversationActions({
  conversationId,
  conversationTitle,
  onCopySummary,
  onExport,
  onShare,
  onDelete,
  isLoading = false,
}: ConversationActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleCopySummary = async () => {
    onCopySummary?.();
  };

  const handleExport = async () => {
    onExport?.();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/conversations/${conversationId}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
      // Clear the state after 2 seconds
      setTimeout(() => setShareUrl(null), 2000);
      onShare?.();
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Copy Summary Button */}
        <ActionButton
          label="Copy Summary"
          tooltip="Copy conversation summary to clipboard"
          onClick={handleCopySummary}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          iconOnly={false}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        />

        {/* Export Button */}
        <ActionButton
          label="Export"
          tooltip="Export conversation data"
          onClick={handleExport}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          iconOnly={false}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        />

        {/* Share Button */}
        <ActionButton
          label={shareUrl ? 'Copied!' : 'Share'}
          tooltip="Copy shareable link"
          onClick={handleShare}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          iconOnly={false}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.589 12.438 10 11.165 10 9.5c0-2.485-2.015-4.5-4.5-4.5S1 7.015 1 9.5 3.015 14 5.5 14c1.665 0 2.938-.411 3.842-1.316m0 0a6.001 6.001 0 01-1.084 6.3c-.636.636-1.5.636-2.136 0M13.316 10.684c.944-.944 1.316-2.217 1.316-3.684 0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5c-1.665 0-2.938.411-3.842 1.316m0 0a6.001 6.001 0 001.084 6.3c.636.636 1.5.636 2.136 0" />
            </svg>
          }
        />

        {/* More Menu (Delete) */}
        <div className="ml-auto">
          <ActionButton
            label="Delete"
            tooltip="Delete conversation"
            onClick={handleDeleteClick}
            disabled={isLoading}
            variant="destructive"
            size="sm"
            iconOnly={false}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Conversation"
        description={`Are you sure you want to delete "${conversationTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
