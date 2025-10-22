# AgentPipe Web - Session Components Implementation Guide

This document provides TypeScript interfaces, implementation examples, and code snippets for building the session viewing interface.

---

## Component Interfaces

### 1. SessionCard Component

#### Props Interface
```typescript
// /app/components/session/SessionCard.tsx

import { ConversationStatus, OrchestratorMode } from '@/app/types';
import { AgentType } from '@/app/components/agent/AgentAvatar';

export interface SessionCardProps {
  session: {
    id: string;
    name: string;
    status: ConversationStatus;
    mode: OrchestratorMode;
    startedAt: Date;
    completedAt?: Date;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    totalDuration: number; // milliseconds
    participants: Array<{
      agentType: AgentType;
      agentName: string;
    }>;
    initialPrompt: string;
  };
  variant?: 'grid' | 'list';
  showLiveBadge?: boolean;
  onClick?: () => void;
  className?: string;
}
```

#### Implementation Example
```typescript
'use client';

import React from 'react';
import { AgentAvatar } from '@/app/components/agent/AgentAvatar';
import { Badge } from '@/app/components/ui/Badge';
import { StatusDot } from '@/app/components/status/StatusDot';
import { formatDuration, formatTokens, formatCost } from '@/lib/utils';

export function SessionCard({
  session,
  variant = 'grid',
  showLiveBadge = false,
  onClick,
  className = '',
}: SessionCardProps) {
  const isLive = session.status === 'ACTIVE';

  const statusBadgeVariant = {
    ACTIVE: 'success' as const,
    COMPLETED: 'info' as const,
    ERROR: 'error' as const,
    INTERRUPTED: 'warning' as const,
  };

  const modeBadgeColor = {
    'round-robin': 'bg-blue-100 text-blue-700 border-blue-200',
    'reactive': 'bg-purple-100 text-purple-700 border-purple-200',
    'free-form': 'bg-green-100 text-green-700 border-green-200',
  };

  if (variant === 'list') {
    return <SessionCardList {...arguments[0]} />;
  }

  return (
    <div
      className={`
        relative bg-card border border-border rounded-lg p-5 shadow-sm
        transition-all duration-base cursor-pointer
        hover:border-border-strong hover:shadow-lg hover:-translate-y-1
        focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2
        ${isLive ? 'ring-2 ring-status-active ring-opacity-20' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Session: ${session.name}, ${session.status}, ${session.totalMessages} messages`}
    >
      {/* Live Badge */}
      {showLiveBadge && isLive && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="success" size="lg" className="animate-connection-pulse">
            <span className="w-2 h-2 rounded-full bg-status-active mr-1.5" />
            LIVE
          </Badge>
        </div>
      )}

      {/* Avatar Stack */}
      <div className="flex -space-x-3 mb-4">
        {session.participants.slice(0, 3).map((participant, i) => (
          <AgentAvatar
            key={i}
            agent={participant.agentType}
            size="md"
            className="ring-2 ring-card"
          />
        ))}
        {session.participants.length > 3 && (
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center text-xs font-semibold ring-2 ring-card">
            +{session.participants.length - 3}
          </div>
        )}
      </div>

      {/* Session Name */}
      <h3 className="text-base font-semibold leading-snug mb-2 truncate">
        {session.name}
      </h3>

      {/* Metadata */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${modeBadgeColor[session.mode]}`}>
          {session.mode}
        </span>
        <span>•</span>
        <span>{session.totalMessages} messages</span>
      </div>

      {/* Preview */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem] mb-3">
        {session.initialPrompt}
      </p>

      {/* Divider */}
      <div className="border-t border-border my-3" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDuration(session.totalDuration)}</span>
          <span>•</span>
          <span>{formatTokens(session.totalTokens)}</span>
          <span>•</span>
          <span>{formatCost(session.totalCost)}</span>
        </div>
        <Badge variant={statusBadgeVariant[session.status]}>
          {session.status}
        </Badge>
      </div>
    </div>
  );
}

// List variant (horizontal layout)
function SessionCardList({ session, onClick, className = '' }: SessionCardProps) {
  // Similar implementation but with horizontal flex layout
  // ... implementation
}
```

---

### 2. MessageList Component

#### Props Interface
```typescript
// /app/components/session/MessageList.tsx

import { Message } from '@/app/types';

export interface MessageListProps {
  conversationId: string;
  messages: Message[];
  isLive: boolean;
  isTyping?: boolean;
  typingAgent?: {
    name: string;
    type: AgentType;
  };
  autoScroll?: boolean;
  onAutoScrollChange?: (enabled: boolean) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}
```

#### Implementation Example
```typescript
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MessageBubble } from '@/app/components/agent/MessageBubble';
import { TypingIndicator } from '@/app/components/session/TypingIndicator';
import { Button } from '@/app/components/ui/Button';

export function MessageList({
  conversationId,
  messages,
  isLive,
  isTyping = false,
  typingAgent,
  autoScroll = true,
  onAutoScrollChange,
  onLoadMore,
  hasMore = false,
  className = '',
}: MessageListProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessageCountRef = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > prevMessageCountRef.current) {
      setNewMessageCount(messages.length - prevMessageCountRef.current);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, autoScroll]);

  // Detect if user has scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

      setShowScrollButton(!isAtBottom);

      if (onAutoScrollChange) {
        onAutoScrollChange(isAtBottom);
      }

      if (isAtBottom) {
        setNewMessageCount(0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onAutoScrollChange]);

  const scrollToBottom = () => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessageCount(0);
    if (onAutoScrollChange) {
      onAutoScrollChange(true);
    }
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-4 ${className}`}
      >
        {/* Load More Button */}
        {hasMore && onLoadMore && (
          <button
            onClick={onLoadMore}
            className="mx-auto block px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Load More Messages
          </button>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            agent={message.agentType as AgentType}
            agentName={message.agentName}
            content={message.content}
            timestamp={message.timestamp}
            tokens={message.totalTokens}
            cost={message.cost}
          />
        ))}

        {/* Typing Indicator */}
        {isLive && isTyping && typingAgent && (
          <TypingIndicator
            agentType={typingAgent.type}
            agentName={typingAgent.name}
          />
        )}

        {/* Scroll Anchor */}
        <div ref={scrollAnchorRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-6 right-6 z-fixed bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-all"
          aria-label={`Scroll to bottom${newMessageCount > 0 ? ` (${newMessageCount} new messages)` : ''}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {newMessageCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
              {newMessageCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
```

---

### 3. TypingIndicator Component

#### Props Interface
```typescript
// /app/components/session/TypingIndicator.tsx

import { AgentType } from '@/app/components/agent/AgentAvatar';

export interface TypingIndicatorProps {
  agentType: AgentType;
  agentName: string;
  className?: string;
}
```

#### Implementation Example
```typescript
'use client';

import React from 'react';
import { AgentAvatar, AgentType } from '@/app/components/agent/AgentAvatar';

export function TypingIndicator({
  agentType,
  agentName,
  className = '',
}: TypingIndicatorProps) {
  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg bg-muted border border-border
        animate-message-appear
        ${className}
      `.trim()}
      role="status"
      aria-live="polite"
      aria-label={`${agentName} is typing`}
    >
      <AgentAvatar agent={agentType} size="sm" />

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          {agentName} is thinking...
        </span>

        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-[dot-pulse_1.4s_ease-in-out_0s_infinite]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-[dot-pulse_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-[dot-pulse_1.4s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}
```

#### CSS Animation (add to globals.css)
```css
@keyframes dot-pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

### 4. SessionFilters Component

#### Props Interface
```typescript
// /app/components/session/SessionFilters.tsx

import { SearchFilters } from '@/app/types';

export interface SessionFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClear: () => void;
  className?: string;
}
```

#### Implementation Example
```typescript
'use client';

import React, { useState } from 'react';
import { ConversationStatus } from '@/app/types';
import { Button } from '@/app/components/ui/Button';

export function SessionFilters({
  filters,
  onFiltersChange,
  onClear,
  className = '',
}: SessionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusToggle = (status: ConversationStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];

    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleAgentTypeToggle = (agentType: string) => {
    const currentTypes = filters.agentTypes || [];
    const newTypes = currentTypes.includes(agentType)
      ? currentTypes.filter(t => t !== agentType)
      : [...currentTypes, agentType];

    onFiltersChange({ ...filters, agentTypes: newTypes });
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="gap-2"
      >
        Advanced Filters
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-popover"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover */}
          <div className="absolute top-full mt-2 right-0 w-80 bg-card border border-border rounded-lg shadow-lg p-4 z-popover">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close filters"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status Filters */}
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {['ACTIVE', 'COMPLETED', 'ERROR', 'INTERRUPTED'].map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status as ConversationStatus)}
                      onChange={() => handleStatusToggle(status as ConversationStatus)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Agent Types */}
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Agent Types</label>
              <div className="flex flex-wrap gap-2">
                {['claude', 'gpt', 'gemini', 'amp', 'o1'].map((agentType) => (
                  <label key={agentType} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.agentTypes?.includes(agentType)}
                      onChange={() => handleAgentTypeToggle(agentType)}
                      className="rounded border-border"
                    />
                    <span className="text-sm capitalize">{agentType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Date Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  })}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg"
                />
                <span className="text-muted-foreground">→</span>
                <input
                  type="date"
                  value={filters.endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  })}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-3 border-t border-border">
              <Button variant="ghost" onClick={onClear}>
                Clear All
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

### 5. UploadZone Component

#### Props Interface
```typescript
// /app/components/upload/UploadZone.tsx

export interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // bytes
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}
```

#### Implementation Example
```typescript
'use client';

import React, { useRef, useState } from 'react';

export function UploadZone({
  onFilesSelected,
  accept = '.json,.jsonl',
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = true,
  disabled = false,
  className = '',
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    validateAndEmitFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndEmitFiles(files);
  };

  const validateAndEmitFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['json', 'jsonl'].includes(extension || '')) {
        console.warn(`Invalid file type: ${file.name}`);
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        console.warn(`File too large: ${file.name}`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  return (
    <div
      className={`
        relative min-h-[400px] p-12 md:p-16
        flex flex-col items-center justify-center text-center
        bg-muted border-2 border-dashed border-border rounded-lg
        transition-all duration-base cursor-pointer
        ${isDragging ? 'border-primary-600 bg-primary-100 dark:bg-primary-900/30 scale-[1.02]' : ''}
        ${!isDragging && !disabled ? 'hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `.trim()}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload session files"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Icon */}
      <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>

      {/* Text */}
      <p className="text-lg font-semibold mb-2">
        Drag & drop session files here
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        or click to browse
      </p>

      {/* File Specs */}
      <div className="text-xs text-muted-foreground mt-4">
        <p>Supported: {accept}</p>
        <p>Max size: {Math.round(maxSize / 1024 / 1024)}MB per file</p>
      </div>
    </div>
  );
}
```

---

### 6. FileQueue Component

#### Props Interface
```typescript
// /app/components/upload/FileQueue.tsx

export interface FileQueueItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number; // 0-100
  error?: string;
}

export interface FileQueueProps {
  items: FileQueueItem[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  className?: string;
}
```

#### Implementation Example
```typescript
'use client';

import React from 'react';
import { Button } from '@/app/components/ui/Button';

export function FileQueue({
  items,
  onRemove,
  onRetry,
  className = '',
}: FileQueueProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No files selected
      </div>
    );
  }

  return (
    <div className={`space-y-3 max-h-96 overflow-y-auto ${className}`}>
      {items.map((item) => (
        <FileQueueItem
          key={item.id}
          item={item}
          onRemove={() => onRemove(item.id)}
          onRetry={() => onRetry(item.id)}
        />
      ))}
    </div>
  );
}

function FileQueueItem({
  item,
  onRemove,
  onRetry,
}: {
  item: FileQueueItem;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const statusConfig = {
    pending: {
      icon: '⏳',
      label: 'Pending...',
      color: 'text-muted-foreground',
    },
    uploading: {
      icon: '⟳',
      label: `Uploading... ${item.progress}%`,
      color: 'text-primary-600',
    },
    success: {
      icon: '✓',
      label: 'Uploaded successfully',
      color: 'text-success',
    },
    error: {
      icon: '❌',
      label: item.error || 'Upload failed',
      color: 'text-destructive',
    },
  };

  const config = statusConfig[item.status];

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
      {/* Status Icon */}
      <span className={`text-lg ${config.color}`}>{config.icon}</span>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.file.name}</p>
        <p className={`text-xs ${config.color}`}>{config.label}</p>

        {/* Progress Bar */}
        {item.status === 'uploading' && (
          <div className="w-full h-2 bg-background rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-primary-600 transition-all duration-slow"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}

        {/* Error Message */}
        {item.status === 'error' && item.error && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors"
        aria-label={`Remove ${item.file.name}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
```

---

### 7. SessionSummary Component

#### Props Interface
```typescript
// /app/components/session/SessionSummary.tsx

import { Conversation } from '@/app/types';

export interface SessionSummaryProps {
  session: Conversation;
  className?: string;
}
```

#### Implementation Example
```typescript
import React from 'react';
import { Badge } from '@/app/components/ui/Badge';
import { AgentAvatar } from '@/app/components/agent/AgentAvatar';
import { formatDuration, formatDateTime } from '@/lib/utils';

export function SessionSummary({ session, className = '' }: SessionSummaryProps) {
  const statusBadgeVariant = {
    ACTIVE: 'success' as const,
    COMPLETED: 'info' as const,
    ERROR: 'error' as const,
    INTERRUPTED: 'warning' as const,
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Session Summary</h2>
        <Badge variant={statusBadgeVariant[session.status]} size="lg">
          {session.status}
        </Badge>
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Started</p>
          <p className="text-sm font-medium">{formatDateTime(session.startedAt)}</p>
        </div>
        {session.completedAt && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ended</p>
            <p className="text-sm font-medium">{formatDateTime(session.completedAt)}</p>
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1">Duration</p>
        <p className="text-sm font-medium">{formatDuration(session.totalDuration)}</p>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Participants</p>
        <div className="flex items-center gap-3">
          {session.participants?.map((participant) => (
            <div key={participant.id} className="flex items-center gap-2">
              <AgentAvatar agent={participant.agentType as any} size="sm" />
              <span className="text-sm">{participant.agentName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1">Mode</p>
        <Badge>{session.mode}</Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Messages</p>
          <p className="text-lg font-semibold">{session.totalMessages}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Tokens</p>
          <p className="text-lg font-semibold">{session.totalTokens.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Cost</p>
          <p className="text-lg font-semibold">${session.totalCost.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Avg/Message</p>
          <p className="text-lg font-semibold">
            ${(session.totalCost / session.totalMessages).toFixed(4)}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {session.status === 'ERROR' && session.metadata?.errorMessage && (
        <div className="mt-4 p-4 bg-destructive-bg border border-destructive-border rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive mb-1">Error</p>
              <p className="text-sm text-destructive-foreground">
                {session.metadata.errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Utility Functions

### Formatting Utilities

```typescript
// /lib/utils/format.ts

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  } else {
    return tokens.toString();
  }
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDateTime(date);
}
```

---

## WebSocket Integration

### WebSocket Hook

```typescript
// /hooks/useWebSocket.ts

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketEvent, WebSocketEventType } from '@/app/types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useWebSocket(url: string | null) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const eventHandlersRef = useRef<Map<WebSocketEventType, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(() => {
    if (!url) return;

    setStatus('connecting');

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const wsEvent: WebSocketEvent = JSON.parse(event.data);
          const handlers = eventHandlersRef.current.get(wsEvent.type);

          if (handlers) {
            handlers.forEach(handler => handler(wsEvent.data));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus('disconnected');
        socketRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;

          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setStatus('error');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setStatus('disconnected');
  }, []);

  const on = useCallback((eventType: WebSocketEventType, handler: (data: any) => void) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = eventHandlersRef.current.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }, []);

  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
    on,
  };
}
```

### Usage Example

```typescript
// /app/sessions/[id]/page.tsx

'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { WebSocketEventType, MessageCreatedEvent } from '@/app/types';
import { useState, useEffect } from 'react';

export default function SessionPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const wsUrl = `/api/ws?conversationId=${params.id}`;
  const { status, on } = useWebSocket(wsUrl);

  useEffect(() => {
    // Subscribe to message created events
    const unsubscribe = on(WebSocketEventType.MESSAGE_CREATED, (data: MessageCreatedEvent) => {
      setMessages(prev => [...prev, data.message]);
      setIsTyping(false);
    });

    return unsubscribe;
  }, [on]);

  useEffect(() => {
    // Subscribe to turn started events (typing indicator)
    const unsubscribe = on(WebSocketEventType.TURN_STARTED, () => {
      setIsTyping(true);
    });

    return unsubscribe;
  }, [on]);

  return (
    <div>
      <WebSocketStatus status={status} />
      <MessageList
        conversationId={params.id}
        messages={messages}
        isLive={true}
        isTyping={isTyping}
      />
    </div>
  );
}
```

---

## Page Examples

### Session List Page

```typescript
// /app/sessions/page.tsx

import { Suspense } from 'react';
import { SessionCard } from '@/app/components/session/SessionCard';
import { Skeleton } from '@/app/components/status/Skeleton';
import { getConversations } from '@/lib/api/conversations';

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">Sessions</h1>
        <Button href="/sessions/upload">
          Upload Sessions
        </Button>
      </div>

      {/* Filters */}
      <FilterBar searchParams={searchParams} />

      {/* Sessions */}
      <Suspense fallback={<SessionsListSkeleton />}>
        <SessionsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SessionsList({ searchParams }: { searchParams: any }) {
  const { data: sessions, pagination } = await getConversations(searchParams);

  if (sessions.length === 0) {
    return <EmptyState />;
  }

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE');
  const historicalSessions = sessions.filter(s => s.status !== 'ACTIVE');

  return (
    <>
      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8 p-6 bg-status-active-bg border border-status-active-border rounded-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-active animate-connection-pulse" />
            Active Sessions ({activeSessions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                showLiveBadge
                onClick={() => router.push(`/sessions/${session.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Historical Sessions */}
      {historicalSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historicalSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => router.push(`/sessions/${session.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination pagination={pagination} />
      )}
    </>
  );
}
```

---

## Testing Examples

### Component Test

```typescript
// /app/components/session/__tests__/SessionCard.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionCard } from '../SessionCard';
import { mockSession } from '@/tests/mocks/sessions';

describe('SessionCard', () => {
  it('renders session information correctly', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText(mockSession.name)).toBeInTheDocument();
    expect(screen.getByText(`${mockSession.totalMessages} messages`)).toBeInTheDocument();
  });

  it('shows live badge for active sessions', () => {
    const activeSession = { ...mockSession, status: 'ACTIVE' };
    render(<SessionCard session={activeSession} showLiveBadge />);

    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<SessionCard session={mockSession} onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<SessionCard session={mockSession} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

This implementation guide provides all the necessary code structure, interfaces, and examples to build the session viewing interface. All components follow the design specifications and are ready for implementation.
