'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseConversationActionsProps {
  conversationId: string;
  summaryText?: string | null;
  onDeleted?: () => void;
}

interface ActionState {
  loading: boolean;
  error: string | null;
}

export function useConversationActions({
  conversationId,
  summaryText,
  onDeleted,
}: UseConversationActionsProps) {
  const router = useRouter();
  const [copySummaryState, setCopySummaryState] = useState<ActionState>({ loading: false, error: null });
  const [exportState, setExportState] = useState<ActionState>({ loading: false, error: null });
  const [deleteState, setDeleteState] = useState<ActionState>({ loading: false, error: null });

  /**
   * Copy conversation summary to clipboard
   */
  const handleCopySummary = useCallback(async () => {
    if (!summaryText) {
      setCopySummaryState({ loading: false, error: 'No summary available' });
      return;
    }

    setCopySummaryState({ loading: true, error: null });
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopySummaryState({ loading: false, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy summary';
      setCopySummaryState({ loading: false, error: errorMessage });
      console.error('Error copying summary:', err);
    }
  }, [summaryText]);

  /**
   * Export conversation data
   * Currently triggers download - full export functionality in Phase 4
   */
  const handleExport = useCallback(async () => {
    setExportState({ loading: true, error: null });
    try {
      const response = await fetch(`/api/conversations/${conversationId}/export?format=json`);

      if (!response.ok) {
        throw new Error('Failed to export conversation');
      }

      const data = await response.blob();
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation-${conversationId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportState({ loading: false, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export conversation';
      setExportState({ loading: false, error: errorMessage });
      console.error('Error exporting conversation:', err);
    }
  }, [conversationId]);

  /**
   * Delete conversation from database
   */
  const handleDelete = useCallback(async () => {
    setDeleteState({ loading: true, error: null });
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      setDeleteState({ loading: false, error: null });

      // Call the onDeleted callback if provided
      onDeleted?.();

      // Redirect to conversations list after deletion
      router.push('/conversations');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete conversation';
      setDeleteState({ loading: false, error: errorMessage });
      console.error('Error deleting conversation:', err);
    }
  }, [conversationId, router, onDeleted]);

  return {
    // Actions
    onCopySummary: handleCopySummary,
    onExport: handleExport,
    onDelete: handleDelete,

    // State
    isCopySummaryLoading: copySummaryState.loading,
    copySummaryError: copySummaryState.error,
    isExporting: exportState.loading,
    exportError: exportState.error,
    isDeleting: deleteState.loading,
    deleteError: deleteState.error,

    // Combined loading state for UI
    isActionLoading: copySummaryState.loading || exportState.loading || deleteState.loading,
  };
}
