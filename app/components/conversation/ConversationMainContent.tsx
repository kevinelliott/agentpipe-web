import React, { ReactNode } from 'react';
import { ViewToggle } from './ViewToggle';

type ViewMode = 'normal' | 'compact' | 'slim';

interface ConversationMainContentProps {
  children: ReactNode;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isLive?: boolean;
}

export function ConversationMainContent({
  children,
  viewMode,
  onViewModeChange,
  isLive = false,
}: ConversationMainContentProps) {
  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-sm -mx-4 px-4 py-3 -mb-3 border-b border-border/40">
        <h2 className="text-lg font-semibold text-foreground">
          Conversation
        </h2>

        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-active/10 border border-status-active/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-active opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-active"></span>
              </span>
              <span className="text-xs font-medium text-status-active">Live</span>
            </div>
          )}

          <ViewToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      {/* Messages container */}
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
}
