'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseSidebarStateOptions {
  defaultOpen?: boolean;
}

export function useSidebarState({ defaultOpen = true }: UseSidebarStateOptions = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Close sidebar on mobile when clicking backdrop
  const handleBackdropClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close sidebar on mobile when window resizes above breakpoint
  useEffect(() => {
    const handleResize = () => {
      // Close drawer on desktop (1024px)
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    open: useCallback(() => setIsOpen(true), []),
    close: useCallback(() => setIsOpen(false), []),
    toggle: useCallback(() => setIsOpen((prev) => !prev), []),
    handleBackdropClick,
  };
}
