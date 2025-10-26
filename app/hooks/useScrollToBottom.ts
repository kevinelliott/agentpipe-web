/* eslint-disable no-undef */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollToBottomOptions {
  threshold?: number; // Pixels from bottom to consider "at bottom" (default: 100)
  enabled?: boolean; // Enable/disable auto-scroll (default: true)
}

export function useScrollToBottom({
  threshold = 100,
  enabled = true,
}: UseScrollToBottomOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(enabled);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Check if container is near the bottom
   */
  const checkIfNearBottom = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < threshold;

    setIsNearBottom(nearBottom);

    // Disable auto-scroll if user scrolls up
    if (!nearBottom && isAutoScrollEnabled) {
      setIsAutoScrollEnabled(false);
    }
  }, [threshold, isAutoScrollEnabled]);

  /**
   * Scroll to bottom of container
   */
  const scrollToBottom = useCallback((smooth = true) => {
    if (!containerRef.current) return;

    if (smooth) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }

    // Re-enable auto-scroll after manual scroll
    setIsAutoScrollEnabled(true);
  }, []);

  /**
   * Handle scroll event
   */
  const handleScroll = useCallback(() => {
    checkIfNearBottom();

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scroll event to avoid excessive state updates
    scrollTimeoutRef.current = setTimeout(() => {
      checkIfNearBottom();
    }, 100);
  }, [checkIfNearBottom]);

  /**
   * Auto-scroll to bottom when new content arrives
   */
  useEffect(() => {
    if (!isAutoScrollEnabled || !containerRef.current) return;

    // Use ResizeObserver to detect content changes and auto-scroll
    const resizeObserver = new ResizeObserver(() => {
      if (isAutoScrollEnabled) {
        scrollToBottom(false);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isAutoScrollEnabled, scrollToBottom]);

  /**
   * Setup scroll event listener
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    isNearBottom,
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    scrollToBottom,
    checkIfNearBottom,
  };
}
