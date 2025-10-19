import React from 'react';

export type AgentType = 'claude' | 'gemini' | 'gpt' | 'amp' | 'factory' | 'o1' | 'default';
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AgentAvatarProps {
  agent: AgentType;
  size?: AvatarSize;
  label?: string;
  className?: string;
}

const agentLabels: Record<AgentType, string> = {
  claude: 'CL',
  gemini: 'GM',
  gpt: 'GP',
  amp: 'AM',
  factory: 'FA',
  o1: 'O1',
  default: 'DF',
};

const agentNames: Record<AgentType, string> = {
  claude: 'Claude',
  gemini: 'Gemini',
  gpt: 'GPT',
  amp: 'AMP',
  factory: 'Factory',
  o1: 'O1',
  default: 'Default',
};

export function AgentAvatar({
  agent,
  size = 'md',
  label,
  className = '',
}: AgentAvatarProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-semibold border-2 flex-shrink-0 transition-all duration-fast';

  const sizeClasses: Record<AvatarSize, string> = {
    sm: 'w-6 h-6 text-[0.6875rem]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  const agentClasses: Record<AgentType, string> = {
    claude: 'bg-agent-claude-bg text-agent-claude border-agent-claude-border hover:bg-agent-claude-border',
    gemini: 'bg-agent-gemini-bg text-agent-gemini border-agent-gemini-border hover:bg-agent-gemini-border',
    gpt: 'bg-agent-gpt-bg text-agent-gpt border-agent-gpt-border hover:bg-agent-gpt-border',
    amp: 'bg-agent-amp-bg text-agent-amp border-agent-amp-border hover:bg-agent-amp-border',
    factory: 'bg-agent-factory-bg text-agent-factory border-agent-factory-border hover:bg-agent-factory-border',
    o1: 'bg-agent-o1-bg text-agent-o1 border-agent-o1-border hover:bg-agent-o1-border',
    default: 'bg-agent-default-bg text-agent-default border-agent-default-border hover:bg-agent-default-border',
  };

  return (
    <div
      className={`${baseClasses} ${sizeClasses[size]} ${agentClasses[agent]} ${className}`.trim()}
      title={agentNames[agent]}
      aria-label={agentNames[agent]}
    >
      {label || agentLabels[agent]}
    </div>
  );
}
