import React from 'react';
import { type AgentType } from './AgentAvatar';

interface AgentBadgeProps {
  agent: AgentType;
  label: string;
  className?: string;
}

export function AgentBadge({ agent, label, className = '' }: AgentBadgeProps) {
  const baseClasses = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border';

  const agentClasses: Record<AgentType, string> = {
    claude: 'bg-agent-claude-bg text-agent-claude border-agent-claude-border',
    gemini: 'bg-agent-gemini-bg text-agent-gemini border-agent-gemini-border',
    gpt: 'bg-agent-gpt-bg text-agent-gpt border-agent-gpt-border',
    amp: 'bg-agent-amp-bg text-agent-amp border-agent-amp-border',
    factory: 'bg-agent-factory-bg text-agent-factory border-agent-factory-border',
    o1: 'bg-agent-o1-bg text-agent-o1 border-agent-o1-border',
    copilot: 'bg-agent-copilot-bg text-agent-copilot border-agent-copilot-border',
    cursor: 'bg-agent-cursor-bg text-agent-cursor border-agent-cursor-border',
    qoder: 'bg-agent-qoder-bg text-agent-qoder border-agent-qoder-border',
    qwen: 'bg-agent-qwen-bg text-agent-qwen border-agent-qwen-border',
    codex: 'bg-agent-codex-bg text-agent-codex border-agent-codex-border',
    opencode: 'bg-agent-opencode-bg text-agent-opencode border-agent-opencode-border',
    ollama: 'bg-agent-ollama-bg text-agent-ollama border-agent-ollama-border',
    default: 'bg-agent-default-bg text-agent-default border-agent-default-border',
  };

  return (
    <span className={`${baseClasses} ${agentClasses[agent]} ${className}`.trim()}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {label}
    </span>
  );
}
