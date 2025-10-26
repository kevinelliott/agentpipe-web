'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AgentAvatar, type AgentType } from '@/app/components/agent/AgentAvatar';
import { Button } from '@/app/components/ui/Button';
import { Skeleton } from '@/app/components/status/Skeleton';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import { SummaryCard } from '@/app/components/conversation/SummaryCard';
import { ConversationMessages } from '@/app/components/conversation/ConversationMessages';
import { ViewToggle } from '@/app/components/conversation/ViewToggle';
import { ConversationHeader } from '@/app/components/conversation/ConversationHeader';
import { useRealtimeEvents } from '@/app/hooks/useRealtimeEvents';
import { useViewMode } from '@/app/hooks/useViewMode';
import { useConversationActions } from '@/app/hooks/useConversationActions';

interface Participant {
  id: string;
  agentId: string;
  agentType: string;
  agentName: string;
  agentVersion: string | null;
  model: string | null;
  prompt: string | null;
  announcement: string | null;
  cliVersion: string | null;
}

interface Message {
  id: string;
  agentId: string;
  agentName: string;
  agentType: string;
  agentVersion: string | null;
  content: string;
  role: string;
  timestamp: string;
  sequenceNumber: number | null;
  turnNumber: number | null;
  duration: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  model: string | null;
  cost: number | null;
}

interface SessionDetail {
  id: string;
  name: string;
  mode: string;
  status: string;
  source: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  initialPrompt: string;
  maxTurns: number | null;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;
  containerId: string | null;
  containerStatus: string | null;
  errorMessage: string | null;
  errorStack: string | null;
  agentpipeVersion: string | null;
  systemOS: string | null;
  systemOSVersion: string | null;
  systemGoVersion: string | null;
  systemArchitecture: string | null;
  // Conversation Summary
  summaryText: string | null;
  summaryAgentType: string | null;
  summaryModel: string | null;
  summaryInputTokens: number | null;
  summaryOutputTokens: number | null;
  summaryTotalTokens: number | null;
  summaryCost: number | null;
  summaryDuration: number | null;
  summaryGeneratedAt: string | null;
  summaryData: Record<string, any> | null;
  participants: Participant[];
  messages: Message[];
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useViewMode();

  // Initialize conversation actions hook
  const conversationActions = useConversationActions({
    conversationId: sessionId,
    summaryText: session?.summaryText,
    onDeleted: () => router.push('/conversations'),
  });

  // Fetch session details
  const fetchSession = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsUpdating(true);
      }
      setError(null);

      const response = await fetch(`/api/conversations/${sessionId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error('Failed to fetch session');
      }

      const data: SessionDetail = await response.json();
      setSession(data);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      } else {
        setIsUpdating(false);
      }
    }
  }, [sessionId]);

  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Real-time updates - subscribe to events for this specific conversation
  useRealtimeEvents({
    conversationId: sessionId,
    onMessageCreated: (data) => {
      console.log('[SessionDetail] New message received:', data);
      // Refetch session to get the new message (without showing loading state)
      fetchSession(false);
    },
    onConversationCompleted: (data) => {
      console.log('[SessionDetail] Conversation completed:', data);
      // Refetch session to get final status and metrics (without showing loading state)
      fetchSession(false);
    },
    onConversationInterrupted: (data) => {
      console.log('[SessionDetail] Conversation interrupted:', data);
      // Refetch session to get updated status (without showing loading state)
      fetchSession(false);
    },
    onError: (data) => {
      console.log('[SessionDetail] Error occurred:', data);
      // Refetch session to get error state (without showing loading state)
      fetchSession(false);
    },
  });

  // Helper functions
  const mapAgentTypeToAgentType = (agentType: string): AgentType => {
    const agentMap: Record<string, AgentType> = {
      claude: 'claude',
      gemini: 'gemini',
      codex: 'codex',
      copilot: 'copilot',
      crush: 'crush',
      cursor: 'cursor',
      qoder: 'qoder',
      qwen: 'qwen',
      opencode: 'opencode',
      ollama: 'ollama',
      groq: 'groq',
      kimi: 'kimi',
      amp: 'amp',
      factory: 'factory',
    };
    return agentMap[agentType.toLowerCase()] || 'default';
  };

  const formatDuration = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 mb-6" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="bg-error/10 border border-error rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-error mb-2">
              {error === 'Session not found' ? 'Session Not Found' : 'Error Loading Session'}
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/conversations')} variant="outline">
              Back to Conversations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ConversationHeader
        id={session.id}
        title={session.initialPrompt}
        status={session.status as 'ACTIVE' | 'COMPLETED' | 'INTERRUPTED' | 'ERROR'}
        source={session.source}
        messageCount={session.totalMessages}
        duration={session.totalDuration}
        createdAt={session.createdAt}
        isUpdating={isUpdating}
        onCopySummary={conversationActions.onCopySummary}
        onExport={conversationActions.onExport}
        onDelete={conversationActions.onDelete}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Initial Prompt */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Initial Prompt</h3>
          <p className="text-sm leading-relaxed">{session.initialPrompt}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Messages"
            value={session.totalMessages.toString()}
          />
          <MetricCard
            label="Tokens"
            value={formatTokens(session.totalTokens)}
          />
          <MetricCard
            label="Cost"
            value={`$${session.totalCost.toFixed(4)}`}
          />
          <MetricCard
            label="Duration"
            value={formatDuration(session.totalDuration)}
          />
        </div>

        {/* AI Summary */}
        {session.summaryText && (
          <div className="mb-6">
            <SummaryCard
              text={session.summaryText}
              agentType={session.summaryAgentType || undefined}
              model={session.summaryModel || undefined}
              inputTokens={session.summaryInputTokens || undefined}
              outputTokens={session.summaryOutputTokens || undefined}
              totalTokens={session.summaryTotalTokens || undefined}
              cost={session.summaryCost || undefined}
              duration={session.summaryDuration || undefined}
            />
          </div>
        )}

        {/* Participants */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold mb-4">Participants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {session.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <AgentAvatar
                  agent={mapAgentTypeToAgentType(participant.agentType)}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {participant.agentName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {participant.model || participant.agentType}
                    {participant.cliVersion && (
                      <span className="ml-1">• CLI v{participant.cliVersion}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {session.errorMessage && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-error mb-2">Error</h3>
            <p className="text-sm text-error">{session.errorMessage}</p>
          </div>
        )}

        {/* Messages */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Conversation ({session.messages.length} messages)
            </h3>
            <div className="flex items-center gap-3">
              <ViewToggle value={viewMode} onChange={setViewMode} />
              {session.status === 'ACTIVE' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live updates
                </span>
              )}
            </div>
          </div>

          <ConversationMessages
            messages={session.messages}
            viewMode={viewMode}
            mapAgentTypeToAgentType={mapAgentTypeToAgentType}
            emptyState={
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No messages in this conversation yet</p>
                {session.status === 'ACTIVE' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Messages will appear here as they arrive
                  </p>
                )}
              </div>
            }
          />
        </div>

        {/* System Information */}
        {(session.agentpipeVersion || session.systemOS) && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold mb-4">System Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {session.agentpipeVersion && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">AgentPipe Version</div>
                  <div className="font-mono text-sm font-medium">{session.agentpipeVersion}</div>
                </div>
              )}
              {session.systemOS && session.systemOSVersion && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Operating System</div>
                  <div className="font-mono text-sm font-medium">
                    {session.systemOS} {session.systemOSVersion}
                  </div>
                </div>
              )}
              {session.systemGoVersion && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Go Version</div>
                  <div className="font-mono text-sm font-medium">{session.systemGoVersion}</div>
                </div>
              )}
              {session.systemArchitecture && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Architecture</div>
                  <div className="font-mono text-sm font-medium">{session.systemArchitecture}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-xs text-muted-foreground">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="font-semibold mb-1">Session ID</div>
              <div className="font-mono text-xs truncate">{session.id}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Created</div>
              <div>{new Date(session.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Updated</div>
              <div>{new Date(session.updatedAt).toLocaleString()}</div>
            </div>
            {session.completedAt && (
              <div>
                <div className="font-semibold mb-1">Completed</div>
                <div>{new Date(session.completedAt).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
