'use client';

import React from 'react';
import { AgentAvatar, type AgentType } from './AgentAvatar';

interface MessageBubbleSlimProps {
  agent: AgentType;
  agentName: string;
  content: string;
  timestamp: Date;
  onClick?: () => void;
  className?: string;
}

export function MessageBubbleSlim({
  agent,
  agentName,
  content,
  timestamp,
  onClick,
  className = '',
}: MessageBubbleSlimProps) {
  const agentBorderColors: Record<AgentType, string> = {
    claude: 'border-l-agent-claude',
    gemini: 'border-l-agent-gemini',
    gpt: 'border-l-agent-gpt',
    amp: 'border-l-agent-amp',
    factory: 'border-l-agent-factory',
    o1: 'border-l-agent-o1',
    copilot: 'border-l-agent-copilot',
    cursor: 'border-l-agent-cursor',
    qoder: 'border-l-agent-qoder',
    qwen: 'border-l-agent-qwen',
    codex: 'border-l-agent-codex',
    opencode: 'border-l-agent-opencode',
    ollama: 'border-l-agent-ollama',
    default: 'border-l-border-strong',
  };

  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Strip Markdown formatting for plain text preview
  const plainContent = content
    .replace(/[#*`_~\[\]]/g, '') // Remove Markdown syntax
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  return (
    <div
      className={`border border-border border-l-3 ${agentBorderColors[agent]} rounded-md p-3 mb-2 ${
        onClick ? 'cursor-pointer hover:bg-accent transition-colors duration-150' : ''
      } ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <AgentAvatar agent={agent} size="xs" />
        <span className="text-sm font-medium text-foreground">{agentName}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{formattedTime}</span>
      </div>
      <p className="text-sm text-foreground truncate">
        {plainContent}
      </p>
    </div>
  );
}
