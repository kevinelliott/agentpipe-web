'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationCard } from '@/app/components/conversation/ConversationCard';
import { EmptyState } from '@/app/components/status/EmptyState';
import { Skeleton } from '@/app/components/status/Skeleton';
import { Select } from '@/app/components/ui/Select';
import { Button } from '@/app/components/ui/Button';
import type { AgentType } from '@/app/components/agent/AgentAvatar';
import type { StatusType } from '@/app/components/status/StatusDot';
import { Badge } from '@/app/components/ui/Badge';

interface Session {
  id: string;
  name: string;
  mode: string;
  status: string;
  source: string;
  startedAt: string;
  completedAt: string | null;
  initialPrompt: string;
  summaryText?: string; // Optional AI-generated summary
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;
  participants: Array<{
    agentType: string;
    agentName: string;
  }>;
}

interface SessionsResponse {
  conversations: Session[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination metadata
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
      });

      if (statusFilter) params.append('status', statusFilter);
      if (modeFilter) params.append('mode', modeFilter);
      if (sourceFilter) params.append('source', sourceFilter);

      const response = await fetch(`/api/conversations?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data: SessionsResponse = await response.json();

      setSessions(data.conversations);
      setTotalCount(data.pagination.totalCount);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
      setHasPreviousPage(data.pagination.hasPreviousPage);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, statusFilter, modeFilter, sourceFilter]);

  // Fetch sessions on mount and when filters/pagination change
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, page, statusFilter, modeFilter, sourceFilter, sortBy, sortOrder]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, modeFilter, sourceFilter, sortBy, sortOrder]);

  // Helper functions
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(1)}M`;
    }
    if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const mapStatusToStatusType = (status: string): StatusType => {
    const statusMap: Record<string, StatusType> = {
      ACTIVE: 'active',
      COMPLETED: 'completed',
      ERROR: 'error',
      INTERRUPTED: 'interrupted',
    };
    return statusMap[status] || 'pending';
  };

  const mapAgentTypeToAgentType = (agentType: string): AgentType => {
    const agentMap: Record<string, AgentType> = {
      claude: 'claude',
      gemini: 'gemini',
      gpt: 'gpt',
      'gpt-4': 'gpt',
      'gpt-3.5': 'gpt',
      amp: 'amp',
    };
    return agentMap[agentType.toLowerCase()] || 'claude';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sessions</h1>
          <p className="text-muted-foreground">
            Browse all AgentPipe conversations from web, CLI streams, and uploads
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <Select
              label="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              placeholder="All Statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'INTERRUPTED', label: 'Interrupted' },
                { value: 'ERROR', label: 'Error' },
              ]}
            />

            {/* Mode Filter */}
            <Select
              label="Mode"
              value={modeFilter}
              onChange={(value) => setModeFilter(value)}
              placeholder="All Modes"
              options={[
                { value: '', label: 'All Modes' },
                { value: 'round-robin', label: 'Round Robin' },
                { value: 'reactive', label: 'Reactive' },
                { value: 'free-form', label: 'Free Form' },
              ]}
            />

            {/* Source Filter */}
            <Select
              label="Source"
              value={sourceFilter}
              onChange={(value) => setSourceFilter(value)}
              placeholder="All Sources"
              options={[
                { value: '', label: 'All Sources' },
                { value: 'web', label: 'Web' },
                { value: 'cli-stream', label: 'CLI Stream' },
                { value: 'cli-upload', label: 'CLI Upload' },
              ]}
            />

            {/* Sort By */}
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              placeholder="Sort by..."
              options={[
                { value: 'createdAt', label: 'Created Date' },
                { value: 'startedAt', label: 'Started Date' },
                { value: 'totalMessages', label: 'Message Count' },
                { value: 'totalTokens', label: 'Token Count' },
                { value: 'totalCost', label: 'Cost' },
              ]}
            />

            {/* Sort Order */}
            <Select
              label="Order"
              value={sortOrder}
              onChange={(value) => setSortOrder(value)}
              placeholder="Order..."
              options={[
                { value: 'desc', label: 'Newest First' },
                { value: 'asc', label: 'Oldest First' },
              ]}
            />
          </div>

          {/* Active Filters Summary */}
          {(statusFilter || modeFilter || sourceFilter) && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {statusFilter && (
                  <Badge variant="default">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter('')}
                      className="ml-2 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {modeFilter && (
                  <Badge variant="default">
                    Mode: {modeFilter}
                    <button
                      onClick={() => setModeFilter('')}
                      className="ml-2 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {sourceFilter && (
                  <Badge variant="default">
                    Source: {sourceFilter}
                    <button
                      onClick={() => setSourceFilter('')}
                      className="ml-2 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setModeFilter('');
                    setSourceFilter('');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {sessions.length} of {totalCount} session{totalCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
            <p className="text-error">{error}</p>
            <Button onClick={fetchSessions} variant="outline" size="sm" className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sessions.length === 0 && (
          <EmptyState
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            }
            title="No sessions found"
            description={
              statusFilter || modeFilter || sourceFilter
                ? 'Try adjusting your filters to see more results'
                : 'Start your first conversation to see it here'
            }
          />
        )}

        {/* Sessions Grid */}
        {!isLoading && !error && sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <ConversationCard
                key={session.id}
                id={session.id}
                title={session.name}
                participants={session.participants.map((p) => ({
                  type: mapAgentTypeToAgentType(p.agentType),
                  name: p.agentName,
                }))}
                status={mapStatusToStatusType(session.status)}
                statusLabel={session.status}
                lastActivity={formatRelativeTime(session.startedAt)}
                preview={session.initialPrompt}
                summaryText={session.summaryText}
                messageCount={session.totalMessages}
                tokenCount={formatTokens(session.totalTokens)}
                onClick={() => router.push(`/conversations/${session.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPreviousPage}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNextPage}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
