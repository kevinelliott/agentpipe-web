'use client';

import React, { ReactNode } from 'react';

interface ConversationLayoutProps {
  children: ReactNode; // Main content (center column)
  rightSidebar?: ReactNode; // Right sidebar (collapsible on tablet)
  rightSidebarOpen?: boolean;
  onRightSidebarToggle?: () => void;
}

export function ConversationLayout({
  children,
  rightSidebar,
  rightSidebarOpen = true,
  onRightSidebarToggle,
}: ConversationLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main layout container */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Center column (primary content) */}
        <main className="min-w-0 order-1 lg:order-1">
          {children}
        </main>

        {/* Right sidebar (collapsible on tablet/mobile) */}
        {rightSidebar && (
          <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-80 order-2 sticky top-24 max-h-[calc(100vh-96px)] overflow-y-auto">
              <div className="space-y-6">
                {rightSidebar}
              </div>
            </aside>

            {/* Mobile/Tablet drawer button - only show when sidebar is closed */}
            {!rightSidebarOpen && (
              <button
                onClick={onRightSidebarToggle}
                className="lg:hidden fixed bottom-6 right-6 bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 z-30 flex items-center justify-center w-12 h-12"
                aria-label="Open sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {/* Mobile/Tablet drawer overlay and sidebar */}
            {rightSidebarOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={onRightSidebarToggle}
                />

                {/* Sidebar drawer */}
                <div className="fixed bottom-0 right-0 top-0 w-full max-w-sm bg-background border-l border-border z-50 lg:hidden overflow-y-auto">
                  <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Details</h3>
                    <button
                      onClick={onRightSidebarToggle}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label="Close sidebar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {rightSidebar}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
