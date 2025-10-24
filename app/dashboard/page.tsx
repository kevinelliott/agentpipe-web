'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/Input';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  MessagesIcon,
  TokensIcon,
  CostIcon,
  AgentsIcon,
  RadioIcon,
} from '../components/ui/Icon';
import { MetricCard } from '../components/metrics/MetricCard';
import { ConversationCard } from '../components/conversation/ConversationCard';
import { MessageBubble } from '../components/agent/MessageBubble';
import { WebSocketStatus } from '../components/status/WebSocketStatus';
import { EmptyState } from '../components/status/EmptyState';
import { ConversationCardSkeleton, MessageBubbleSkeleton } from '../components/status/Skeleton';
import { Footer } from '../components/layout/Footer';
import { isLocalCLIAvailable } from '../lib/environment';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';
import { useDebounce } from '../hooks/useDebounce';
import {
  transformConversation,
  transformMessage,
  formatMetrics,
  formatNumber,
} from '../lib/formatters';

export default function Dashboard() {
  const router = useRouter();
  const [cliAvailable, setCliAvailable] = useState(false);

  // Data state
  const [conversations, setConversations] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // Loading state
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const debouncedMessageSearch = useDebounce(messageSearchQuery, 300);

  // Real-time events
  const { isConnected: wsConnected } = useRealtimeEvents({
    onConversationStarted: (data) => {
      // Refetch conversations when a new one starts
      fetchConversations();
      fetchMetrics();
    },
    onMessageCreated: (data) => {
      // Add new message to recent messages
      fetchRecentMessages();
      // Update the conversation that received the message
      fetchConversations();
      fetchMetrics();
    },
    onConversationCompleted: (data) => {
      // Update conversation status
      fetchConversations();
      fetchMetrics();
    },
  });

  // Check if local CLI is available (not on production domain)
  useEffect(() => {
    setCliAvailable(isLocalCLIAvailable());
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await fetch('/api/conversations?status=ACTIVE&pageSize=10&sortBy=updatedAt&sortOrder=desc');
      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Fetch recent messages
  const fetchRecentMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch('/api/messages/recent?limit=10&status=ACTIVE');
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setRecentMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load recent messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      setIsLoadingMetrics(true);
      const response = await fetch('/api/metrics/summary');
      if (!response.ok) throw new Error('Failed to fetch metrics');

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load metrics');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchConversations();
    fetchRecentMessages();
    fetchMetrics();
  }, []);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.name.toLowerCase().includes(query) ||
      conv.initialPrompt.toLowerCase().includes(query) ||
      conv.participants.some((p: any) =>
        p.agentName.toLowerCase().includes(query) ||
        p.agentType.toLowerCase().includes(query)
      )
    );
  });

  // Filter messages based on search
  const filteredMessages = recentMessages.filter((msg) => {
    if (!debouncedMessageSearch) return true;
    const query = debouncedMessageSearch.toLowerCase();
    return (
      msg.content.toLowerCase().includes(query) ||
      msg.agentName.toLowerCase().includes(query) ||
      msg.agentType.toLowerCase().includes(query) ||
      (msg.conversation?.name?.toLowerCase().includes(query) || false)
    );
  });

  // Transform data for components
  const transformedConversations = filteredConversations.map(transformConversation);
  const transformedMessages = filteredMessages.map(transformMessage);

  // Get WebSocket status
  const wsStatus = wsConnected ? 'connected' : 'disconnected';

  // Format metrics
  const formattedMetrics = metrics ? formatMetrics(metrics) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Live Dashboard</h1>
              <p className="text-muted-foreground">
                Real-time monitoring of multi-agent conversations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <WebSocketStatus status={wsStatus} />
              {cliAvailable && (
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/conversations/new'}
                >
                  New Conversation
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Metrics Overview</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingMetrics ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </>
            ) : formattedMetrics ? (
              <>
                <MetricCard
                  label="Total Conversations"
                  value={formattedMetrics.totalConversations}
                  icon={<RadioIcon size={24} />}
                  onClick={() => router.push('/conversations')}
                />
                <MetricCard
                  label="Active Agents"
                  value={formattedMetrics.activeAgents}
                  icon={<AgentsIcon size={24} />}
                />
                <MetricCard
                  label="Total Tokens"
                  value={formattedMetrics.totalTokens}
                  icon={<TokensIcon size={24} />}
                />
                <MetricCard
                  label="Total Cost"
                  value={formattedMetrics.totalCost}
                  icon={<CostIcon size={24} />}
                />
              </>
            ) : (
              <div className="col-span-4 text-center text-muted-foreground py-8">
                Unable to load metrics
              </div>
            )}
          </div>
        </section>

        {/* Live Conversations Section */}
        <section className="mb-8">
          <SectionHeader
            icon={<RadioIcon size={20} className="animate-pulse" />}
            title="Live Conversations"
          >
            <SearchInput
              placeholder="Search conversations..."
              className="w-full sm:w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/conversations')}
            >
              View All
            </Button>
          </SectionHeader>

          {isLoadingConversations ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ConversationCardSkeleton />
              <ConversationCardSkeleton />
            </div>
          ) : transformedConversations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {transformedConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  {...conversation}
                  onClick={() => router.push(`/conversations/${conversation.id}`)}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="bg-card border border-border rounded-lg">
              <EmptyState
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                title="No conversations found"
                description={`No conversations match "${searchQuery}". Try a different search term.`}
              />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg">
              <EmptyState
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                }
                title="No active conversations"
                description={
                  cliAvailable
                    ? "Start a new conversation to see realtime messages from multiple AI agents collaborating together."
                    : "Conversations started via the AgentPipe CLI will appear here in real-time."
                }
                action={
                  cliAvailable
                    ? {
                        label: 'Start Conversation',
                        onClick: () => console.log('Start new conversation'),
                      }
                    : undefined
                }
              />
            </div>
          )}
        </section>

        {/* Recent Messages Section */}
        <section>
          <SectionHeader
            icon={<MessagesIcon size={20} />}
            title="Recent Messages"
          >
            <SearchInput
              placeholder="Search messages..."
              className="w-full sm:w-80"
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/conversations')}
            >
              View All
            </Button>
          </SectionHeader>

          {isLoadingMessages ? (
            <div className="space-y-3">
              <MessageBubbleSkeleton />
              <MessageBubbleSkeleton />
              <MessageBubbleSkeleton />
            </div>
          ) : transformedMessages.length > 0 ? (
            <div className="space-y-0">
              {transformedMessages.map((message, i) => (
                <MessageBubble
                  key={i}
                  agent={message.agent}
                  agentName={message.agentName}
                  content={message.content}
                  timestamp={message.timestamp}
                  tokens={message.tokens}
                  cost={message.cost}
                />
              ))}
            </div>
          ) : messageSearchQuery ? (
            <div className="bg-card border border-border rounded-lg">
              <EmptyState
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                title="No messages found"
                description={`No messages match "${messageSearchQuery}". Try a different search term.`}
              />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg">
              <EmptyState
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                }
                title="No messages yet"
                description="Messages from active conversations will appear here."
              />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
