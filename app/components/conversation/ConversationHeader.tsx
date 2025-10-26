'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StatusDot, type StatusType } from '../status/StatusDot';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConversationMetaBadges } from './ConversationMetaBadges';
import { ConversationActions } from './ConversationActions';

interface ConversationHeaderProps {
  id: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETED' | 'INTERRUPTED' | 'ERROR';
  source: string;
  messageCount: number;
  duration?: number | null;
  createdAt: string;
  isUpdating?: boolean;
  onCopySummary?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export function ConversationHeader({
  id,
  title,
  status,
  source,
  messageCount,
  duration,
  createdAt,
  isUpdating = false,
  onCopySummary,
  onExport,
  onShare,
  onDelete,
}: ConversationHeaderProps) {
  const router = useRouter();

  const mapStatusToStatusType = (s: string): StatusType => {
    const map: Record<string, StatusType> = {
      ACTIVE: 'active',
      COMPLETED: 'completed',
      ERROR: 'error',
      INTERRUPTED: 'interrupted',
    };
    return map[s] || 'pending';
  };

  const getSourceBadgeVariant = (s: string) => {
    const variants: Record<string, 'default' | 'success' | 'info' | 'warning' | 'error'> = {
      web: 'info',
      'cli-stream': 'success',
      'cli-upload': 'default',
    };
    return variants[s] || 'default';
  };

  const getStatusBadgeVariant = (s: string) => {
    const variants: Record<string, 'default' | 'success' | 'info' | 'warning' | 'error'> = {
      ACTIVE: 'success',
      COMPLETED: 'info',
      INTERRUPTED: 'warning',
      ERROR: 'error',
    };
    return variants[s] || 'default';
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Top row: Back button + Status + Actions */}
      <div className="flex items-start justify-between gap-4">
        <Button
          onClick={() => router.push('/conversations')}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StatusDot status={mapStatusToStatusType(status)} pulse={status === 'ACTIVE'} />
            <span className="text-sm font-semibold text-foreground">{status}</span>
          </div>

          {isUpdating && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Updating...
            </span>
          )}
        </div>
      </div>

      {/* Title and metadata */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground line-clamp-2">
          {title}
        </h1>
        <ConversationMetaBadges
          messageCount={messageCount}
          duration={duration}
          createdAt={createdAt}
        />
      </div>

      {/* Bottom row: Badges and Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant={getSourceBadgeVariant(source)}>
            {source}
          </Badge>
          <Badge variant={getStatusBadgeVariant(status)}>
            {status}
          </Badge>
        </div>

        <ConversationActions
          conversationId={id}
          conversationTitle={title}
          onCopySummary={onCopySummary}
          onExport={onExport}
          onShare={onShare}
          onDelete={onDelete}
          isLoading={isUpdating}
        />
      </div>
    </div>
  );
}
