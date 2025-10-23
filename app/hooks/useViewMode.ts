'use client';

import { useState, useEffect } from 'react';

export type ViewMode = 'normal' | 'compact' | 'slim';

/**
 * Hook to manage conversation view mode with localStorage persistence
 * @returns [viewMode, setViewMode] tuple
 */
export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewModeState] = useState<ViewMode>('normal');
  const [isClient, setIsClient] = useState(false);

  // Hydration: load from localStorage after mount
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('conversationViewMode');
    if (stored === 'normal' || stored === 'compact' || stored === 'slim') {
      setViewModeState(stored);
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (isClient) {
      localStorage.setItem('conversationViewMode', mode);
    }
  };

  return [viewMode, setViewMode];
}
