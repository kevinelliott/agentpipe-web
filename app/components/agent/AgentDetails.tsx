'use client';

import { AgentMetadata } from '@/app/lib/agentMetadata';
import type { AgentStats } from '@/app/lib/agentStats';
import { AgentAvatar } from './AgentAvatar';
import type { AgentType } from './AgentAvatar';

interface AgentDetailsProps {
  agent: (AgentMetadata & { stats: AgentStats }) | null;
  onClose?: () => void;
}

export function AgentDetails({ agent, onClose }: AgentDetailsProps) {
  if (!agent) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-muted-foreground">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>Select an agent to view details</p>
        </div>
      </div>
    );
  }

  const agentType = agent.id as AgentType;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-border">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <AgentAvatar agent={agentType} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground">{agent.name}</h2>
            <p className="text-sm text-muted-foreground">{agent.officialName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors ml-2"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tagline */}
        <div>
          <p className="text-lg font-semibold text-primary italic">{agent.tagline}</p>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase mb-2">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
        </div>

        {/* Provider & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
              Provider
            </h4>
            <p className="text-sm font-medium text-foreground">{agent.provider}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
              Category
            </h4>
            <p className="text-sm font-medium text-foreground capitalize">{agent.category}</p>
          </div>
        </div>

        {/* Models */}
        {agent.models && agent.models.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Available Models
            </h4>
            <div className="space-y-1">
              {agent.models.map((model, i) => (
                <div key={i} className="text-sm text-foreground">
                  • {model}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground uppercase">Statistics</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {agent.stats.conversationCount}
              </div>
              <div className="text-xs text-muted-foreground">Conversations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {agent.stats.messageCount}
              </div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-foreground">
                {formatTokens(agent.stats.totalTokens)}
              </div>
              <div className="text-xs text-muted-foreground">Total Tokens</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                ${agent.stats.totalCost.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Avg Tokens/Conversation</span>
              <span className="text-sm font-semibold text-foreground">
                {agent.stats.averageTokensPerConversation.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Avg Cost/Conversation</span>
              <span className="text-sm font-semibold text-foreground">
                ${agent.stats.averageCostPerConversation.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Last Activity</span>
              <span className="text-sm font-semibold text-foreground">
                {agent.stats.lastActivityAt
                  ? new Date(agent.stats.lastActivityAt).toLocaleDateString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Links</h4>
          <div className="flex flex-col gap-2">
            {agent.website && (
              <a
                href={agent.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                  bg-primary/10 text-primary hover:bg-primary/20
                  transition-colors font-medium
                `}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6l4 4m0 0l-4-4m4 4V3"
                  />
                </svg>
                Visit Website
              </a>
            )}
            {agent.github && (
              <a
                href={agent.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                  bg-muted hover:bg-muted/80
                  transition-colors font-medium text-foreground
                `}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            )}
            {agent.documentation && (
              <a
                href={agent.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                  bg-muted hover:bg-muted/80
                  transition-colors font-medium text-foreground
                `}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C6.228 6.228 2 10.228 2 15c0 5.523 4.477 10 10 10s10-4.477 10-10c0-4.772-4.228-8.772-10-8.747z"
                  />
                </svg>
                Read Documentation
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format tokens with K/M suffixes
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}
