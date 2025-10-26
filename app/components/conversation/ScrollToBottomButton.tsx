/* eslint-disable no-undef */
'use client';

import React, { useRef, useEffect } from 'react';

interface ScrollToBottomButtonProps {
  isVisible: boolean;
  isAutoScrollEnabled: boolean;
  onScrollToBottom: (smooth?: boolean) => void;
  onToggleAutoScroll: () => void;
}

export function ScrollToBottomButton({
  isVisible,
  isAutoScrollEnabled,
  onScrollToBottom,
  onToggleAutoScroll,
}: ScrollToBottomButtonProps) {
  const scrollButtonRef = useRef<HTMLButtonElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Add keyboard support for buttons (Escape to dismiss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        // Dismiss button by blurring (or could add logic to hide)
        scrollButtonRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  if (!isVisible && isAutoScrollEnabled) {
    return null;
  }

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2"
      role="group"
      aria-label="Message scrolling controls"
    >
      {/* Auto-scroll toggle (always visible as indicator) */}
      {isAutoScrollEnabled && (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-2 text-xs font-medium text-foreground flex items-center gap-2 shadow-lg animate-in fade-in zoom-in-95 duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Auto-scroll enabled
        </div>
      )}

      {/* Scroll to bottom button (only visible when not at bottom) */}
      {isVisible && (
        <button
          ref={scrollButtonRef}
          onClick={() => onScrollToBottom(true)}
          className="bg-primary hover:bg-primary-600 text-primary-foreground font-medium py-2 px-4 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 text-sm hover:shadow-xl hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          aria-label="Scroll to latest message"
          title="Scroll to latest message (Press Enter)"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          Latest
        </button>
      )}

      {/* Toggle auto-scroll when visible */}
      {isVisible && (
        <button
          ref={toggleButtonRef}
          onClick={onToggleAutoScroll}
          className="bg-background/95 backdrop-blur-sm hover:bg-muted border border-border text-foreground font-medium py-2 px-3 rounded-full shadow-lg transition-all duration-200 text-sm hover:shadow-xl hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2"
          aria-label={isAutoScrollEnabled ? 'Disable auto-scroll' : 'Enable auto-scroll'}
          aria-pressed={isAutoScrollEnabled}
          title={isAutoScrollEnabled ? 'Disable auto-scroll (currently enabled)' : 'Enable auto-scroll (currently disabled)'}
        >
          {isAutoScrollEnabled ? (
            <svg
              className="w-4 h-4 transition-transform duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5m-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11m3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7m19.086 0c-1.275 4.057-5.064 7-9.543 7m0 0a9.9 9.9 0 01-5.23-1.43m12.46-12.46c-1.15 0-2.63-.756-4.254-1.5m0 0c1.624-.744 3.105-1.5 4.254-1.5"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
