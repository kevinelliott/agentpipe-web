import React from 'react';
import { AgentAvatar, type AgentType } from './AgentAvatar';

interface MessageBubbleProps {
  agent: AgentType;
  agentName: string;
  content: string;
  timestamp: Date;
  tokens?: number;
  cost?: number;
  className?: string;
}

export function MessageBubble({
  agent,
  agentName,
  content,
  timestamp,
  tokens,
  cost,
  className = '',
}: MessageBubbleProps) {
  const baseClasses = 'p-4 rounded-lg border mb-3 transition-all duration-base hover:shadow-md hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 animate-message-appear';

  const agentClasses: Record<AgentType, string> = {
    claude: 'bg-agent-claude-bg border-agent-claude-border',
    gemini: 'bg-agent-gemini-bg border-agent-gemini-border',
    gpt: 'bg-agent-gpt-bg border-agent-gpt-border',
    amp: 'bg-agent-amp-bg border-agent-amp-border',
    factory: 'bg-agent-factory-bg border-agent-factory-border',
    o1: 'bg-agent-o1-bg border-agent-o1-border',
    default: 'bg-agent-default-bg border-agent-default-border',
  };

  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={`${baseClasses} ${agentClasses[agent]} ${className}`.trim()}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-current opacity-30">
        <AgentAvatar agent={agent} size="sm" />
        <span className="font-semibold text-sm">{agentName}</span>
        <span className="ml-auto text-xs opacity-70">{formattedTime}</span>
      </div>

      {/* Content */}
      <div className="text-sm leading-relaxed text-foreground">
        {content.split('\n\n').map((paragraph, i) => (
          <p key={i} className="mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Footer */}
      {(tokens !== undefined || cost !== undefined) && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-current opacity-30 text-xs text-muted-foreground">
          {tokens !== undefined && (
            <div className="flex items-center gap-1">
              <span>{tokens.toLocaleString()} tokens</span>
            </div>
          )}
          {cost !== undefined && (
            <div className="flex items-center gap-1">
              <span>${cost.toFixed(4)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
