import React from 'react';

export type AgentType = 'amp' | 'claude' | 'copilot' | 'cursor' | 'factory' | 'gemini' | 'gpt' | 'o1' | 'opencode' | 'ollama' | 'qoder' | 'qwen' | 'codex' | 'default';
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AgentAvatarProps {
  agent: AgentType;
  size?: AvatarSize;
  label?: string;
  className?: string;
}

const agentLabels: Record<AgentType, string> = {
  amp: 'AM',
  claude: 'CL',
  copilot: 'CP',
  cursor: 'CR',
  factory: 'FA',
  gemini: 'GM',
  gpt: 'GP',
  o1: 'O1',
  opencode: 'OC',
  ollama: 'OL',
  qoder: 'QD',
  qwen: 'QW',
  codex: 'CD',
  default: 'DF',
};

const agentNames: Record<AgentType, string> = {
  amp: 'Amp',
  claude: 'Claude',
  copilot: 'Copilot',
  cursor: 'Cursor',
  factory: 'Factory',
  gemini: 'Gemini',
  gpt: 'GPT',
  o1: 'O1',
  opencode: 'OpenCode',
  ollama: 'Ollama',
  qoder: 'Qoder',
  qwen: 'Qwen',
  codex: 'Codex',
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
    xs: 'w-5 h-5 text-[0.625rem]',
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
    copilot: 'bg-agent-copilot-bg text-agent-copilot border-agent-copilot-border hover:bg-agent-copilot-border',
    cursor: 'bg-agent-cursor-bg text-agent-cursor border-agent-cursor-border hover:bg-agent-cursor-border',
    qoder: 'bg-agent-qoder-bg text-agent-qoder border-agent-qoder-border hover:bg-agent-qoder-border',
    qwen: 'bg-agent-qwen-bg text-agent-qwen border-agent-qwen-border hover:bg-agent-qwen-border',
    codex: 'bg-agent-codex-bg text-agent-codex border-agent-codex-border hover:bg-agent-codex-border',
    opencode: 'bg-agent-opencode-bg text-agent-opencode border-agent-opencode-border hover:bg-agent-opencode-border',
    ollama: 'bg-agent-ollama-bg text-agent-ollama border-agent-ollama-border hover:bg-agent-ollama-border',
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
