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
    amp: 'bg-agent-amp-bg text-agent-amp border-agent-amp-border',
    claude: 'bg-agent-claude-bg text-agent-claude border-agent-claude-border',
    codex: 'bg-agent-codex-bg text-agent-codex border-agent-codex-border',
    copilot: 'bg-agent-copilot-bg text-agent-copilot border-agent-copilot-border',
    crush: 'bg-agent-crush-bg text-agent-crush border-agent-crush-border',
    cursor: 'bg-agent-cursor-bg text-agent-cursor border-agent-cursor-border',
    factory: 'bg-agent-factory-bg text-agent-factory border-agent-factory-border',
    gemini: 'bg-agent-gemini-bg text-agent-gemini border-agent-gemini-border',
    groq: 'bg-agent-groq-bg text-agent-groq border-agent-groq-border',
    kimi: 'bg-agent-kimi-bg text-agent-kimi border-agent-kimi-border',
    opencode: 'bg-agent-opencode-bg text-agent-opencode border-agent-opencode-border',
    ollama: 'bg-agent-ollama-bg text-agent-ollama border-agent-ollama-border',
    qoder: 'bg-agent-qoder-bg text-agent-qoder border-agent-qoder-border',
    qwen: 'bg-agent-qwen-bg text-agent-qwen border-agent-qwen-border',
    default: 'bg-agent-default-bg text-agent-default border-agent-default-border',
  };

  return (
    <span className={`${baseClasses} ${agentClasses[agent]} ${className}`.trim()}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {label}
    </span>
  );
}
