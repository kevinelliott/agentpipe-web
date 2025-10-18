'use client';

import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/Input';
import { MetricCard } from '../components/metrics/MetricCard';
import { ConversationCard } from '../components/conversation/ConversationCard';
import { MessageBubble } from '../components/agent/MessageBubble';
import { WebSocketStatus } from '../components/status/WebSocketStatus';
import { EmptyState } from '../components/status/EmptyState';
import { ConversationCardSkeleton, MessageBubbleSkeleton } from '../components/status/Skeleton';
import { Footer } from '../components/layout/Footer';

export default function Dashboard() {
  const [isLoading] = useState(false);
  const [wsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  // Mock data for demonstration
  const mockConversations = [
    {
      id: '1',
      title: 'Product Analysis Discussion',
      participants: [
        { type: 'claude' as const, name: 'Claude' },
        { type: 'gpt' as const, name: 'GPT-4' },
      ],
      status: 'active' as const,
      statusLabel: 'Active',
      lastActivity: '5m ago',
      preview: 'Claude and GPT-4 are analyzing user metrics and discussing optimization strategies for the product dashboard...',
      messageCount: 12,
      tokenCount: '5.2K',
    },
    {
      id: '2',
      title: 'Multi-Agent Code Review',
      participants: [
        { type: 'gemini' as const, name: 'Gemini' },
        { type: 'amp' as const, name: 'AMP' },
        { type: 'o1' as const, name: 'O1' },
      ],
      status: 'completed' as const,
      statusLabel: 'Completed',
      lastActivity: '2h ago',
      preview: 'Three agents collaborated on reviewing the authentication module, identifying security improvements...',
      messageCount: 28,
      tokenCount: '12.4K',
    },
  ];

  const mockMessages = [
    {
      agent: 'claude' as const,
      agentName: 'Claude',
      content: "I'll help you analyze that dataset. Let me break down the key metrics and trends I'm seeing in the data.\n\nThe conversion rate has improved by 12% over the last quarter, which suggests our optimization efforts are working well.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      tokens: 1234,
      cost: 0.0123,
    },
    {
      agent: 'gpt' as const,
      agentName: 'GPT-4',
      content: "Based on Claude's analysis, I'd add that we should also look at the user retention metrics. The data shows strong engagement patterns in the first 30 days.",
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      tokens: 892,
      cost: 0.0089,
    },
    {
      agent: 'gemini' as const,
      agentName: 'Gemini',
      content: "Excellent points from both of you. I'll create a visualization to help illustrate these trends more clearly.",
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      tokens: 456,
      cost: 0.0045,
    },
  ];

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
              <Button
                variant="primary"
                onClick={() => window.location.href = '/conversations/new'}
              >
                New Conversation
              </Button>
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
            <MetricCard
              label="Total Conversations"
              value="1,234"
              change={{ value: '12.5% vs last month', type: 'positive' }}
            />
            <MetricCard
              label="Active Agents"
              value="6"
              change={{ value: 'No change', type: 'neutral' }}
            />
            <MetricCard
              label="Total Tokens"
              value="2.4M"
              change={{ value: '8.3% vs last month', type: 'positive' }}
            />
            <MetricCard
              label="Total Cost"
              value="$156.23"
              change={{ value: '3.2% vs last month', type: 'negative' }}
            />
          </div>
        </section>

        {/* Live Conversations Section */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground">Live Conversations</h2>
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="Search conversations..."
                className="w-full sm:w-80"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ConversationCardSkeleton />
              <ConversationCardSkeleton />
            </div>
          ) : mockConversations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  {...conversation}
                  onClick={() => console.log('Open conversation:', conversation.id)}
                />
              ))}
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
                description="Start a new conversation to see realtime messages from multiple AI agents collaborating together."
                action={{
                  label: 'Start Conversation',
                  onClick: () => console.log('Start new conversation'),
                }}
              />
            </div>
          )}
        </section>

        {/* Recent Messages Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recent Messages</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <MessageBubbleSkeleton />
              <MessageBubbleSkeleton />
              <MessageBubbleSkeleton />
            </div>
          ) : mockMessages.length > 0 ? (
            <div className="space-y-0">
              {mockMessages.map((message, i) => (
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
