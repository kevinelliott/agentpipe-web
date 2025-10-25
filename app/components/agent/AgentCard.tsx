'use client';

import { useState, useCallback } from 'react';
import { AgentMetadata } from '@/app/lib/agentMetadata';
import type { AgentStats } from '@/app/lib/agentStats';
import { AgentAvatar } from './AgentAvatar';
import type { AgentType } from './AgentAvatar';

interface AgentCardProps {
  agent: AgentMetadata & { stats: AgentStats };
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = useCallback(() => {
    setIsExpanded(!isExpanded);
    onClick?.();
  }, [isExpanded, onClick]);

  const agentType = agent.id as AgentType;

  return (
    <div
      onClick={handleClick}
      className={`
        transition-all duration-200 cursor-pointer
        bg-card border border-border rounded-lg overflow-hidden
        hover:border-primary/50 hover:shadow-md
        ${isExpanded ? 'ring-2 ring-primary/30' : ''}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Collapsed State */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <AgentAvatar agent={agentType} size="md" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{agent.tagline}</p>
            </div>
          </div>
          <button
            className={`
              flex-shrink-0 p-1 transition-transform
              ${isExpanded ? 'rotate-180' : ''}
            `}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <svg
              className="w-5 h-5 text-muted-foreground"
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
          </button>
        </div>

        {/* Stats Grid (Always Visible) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/30 rounded p-2 text-center">
            <div className="text-sm font-semibold text-foreground">
              {agent.stats.conversationCount}
            </div>
            <div className="text-xs text-muted-foreground">Conversations</div>
          </div>
          <div className="bg-muted/30 rounded p-2 text-center">
            <div className="text-sm font-semibold text-foreground">{agent.stats.messageCount}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="bg-muted/30 rounded p-2 text-center">
            <div className="text-sm font-semibold text-foreground">
              {formatTokens(agent.stats.totalTokens)}
            </div>
            <div className="text-xs text-muted-foreground">Tokens</div>
          </div>
        </div>
      </div>

      {/* Expanded State */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
          </div>

          {/* Provider & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase">Provider</div>
              <div className="text-sm text-foreground">{agent.provider}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase">Type</div>
              <div className="text-sm text-foreground capitalize">{agent.category}</div>
            </div>
          </div>

          {/* Models (if available) */}
          {agent.models && agent.models.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Models
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.models.slice(0, 3).map((model, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                  >
                    {model}
                  </span>
                ))}
                {agent.models.length > 3 && (
                  <span className="px-2 py-1 text-muted-foreground text-xs">
                    +{agent.models.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Detailed Stats */}
          <div className="space-y-2 bg-card rounded p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Tokens/Conversation</span>
              <span className="text-sm font-semibold text-foreground">
                {agent.stats.averageTokensPerConversation.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Cost</span>
              <span className="text-sm font-semibold text-foreground">
                ${agent.stats.totalCost.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Activity</span>
              <span className="text-sm font-semibold text-foreground">
                {agent.stats.lastActivityAt
                  ? new Date(agent.stats.lastActivityAt).toLocaleDateString()
                  : 'Never'}
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-2 flex-wrap">
            {agent.website && (
              <a
                href={agent.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center gap-1 px-3 py-2 rounded text-sm
                  bg-primary/10 text-primary hover:bg-primary/20
                  transition-colors
                `}
                onClick={(e) => e.stopPropagation()}
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
                Website
              </a>
            )}
            {agent.github && (
              <a
                href={agent.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center gap-1 px-3 py-2 rounded text-sm
                  bg-muted hover:bg-muted/80
                  transition-colors
                `}
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}
            {agent.documentation && (
              <a
                href={agent.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center gap-1 px-3 py-2 rounded text-sm
                  bg-muted hover:bg-muted/80
                  transition-colors
                `}
                onClick={(e) => e.stopPropagation()}
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
                Docs
              </a>
            )}
          </div>
        </div>
      )}
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
