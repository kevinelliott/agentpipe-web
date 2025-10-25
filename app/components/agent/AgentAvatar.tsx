import React from 'react';

export type AgentType = 'amp' | 'claude' | 'codex' | 'copilot' | 'crush' | 'cursor' | 'factory' | 'gemini' | 'groq' | 'kimi' | 'opencode' | 'ollama' | 'qoder' | 'qwen' | 'default';
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
  codex: 'CD',
  copilot: 'CP',
  crush: 'CR',
  cursor: 'CU',
  factory: 'FA',
  gemini: 'GM',
  groq: 'GR',
  kimi: 'KI',
  opencode: 'OC',
  ollama: 'OL',
  qoder: 'QD',
  qwen: 'QW',
  default: 'DF',
};

const agentNames: Record<AgentType, string> = {
  amp: 'Amp',
  claude: 'Claude',
  codex: 'Codex',
  copilot: 'Copilot',
  crush: 'Crush',
  cursor: 'Cursor',
  factory: 'Factory',
  gemini: 'Gemini',
  groq: 'Groq',
  kimi: 'Kimi',
  opencode: 'OpenCode',
  ollama: 'Ollama',
  qoder: 'Qoder',
  qwen: 'Qwen',
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
    amp: 'bg-agent-amp-bg text-agent-amp border-agent-amp-border hover:bg-agent-amp-border',
    claude: 'bg-agent-claude-bg text-agent-claude border-agent-claude-border hover:bg-agent-claude-border',
    codex: 'bg-agent-codex-bg text-agent-codex border-agent-codex-border hover:bg-agent-codex-border',
    copilot: 'bg-agent-copilot-bg text-agent-copilot border-agent-copilot-border hover:bg-agent-copilot-border',
    crush: 'bg-agent-crush-bg text-agent-crush border-agent-crush-border hover:bg-agent-crush-border',
    cursor: 'bg-agent-cursor-bg text-agent-cursor border-agent-cursor-border hover:bg-agent-cursor-border',
    factory: 'bg-agent-factory-bg text-agent-factory border-agent-factory-border hover:bg-agent-factory-border',
    gemini: 'bg-agent-gemini-bg text-agent-gemini border-agent-gemini-border hover:bg-agent-gemini-border',
    groq: 'bg-agent-groq-bg text-agent-groq border-agent-groq-border hover:bg-agent-groq-border',
    kimi: 'bg-agent-kimi-bg text-agent-kimi border-agent-kimi-border hover:bg-agent-kimi-border',
    opencode: 'bg-agent-opencode-bg text-agent-opencode border-agent-opencode-border hover:bg-agent-opencode-border',
    ollama: 'bg-agent-ollama-bg text-agent-ollama border-agent-ollama-border hover:bg-agent-ollama-border',
    qoder: 'bg-agent-qoder-bg text-agent-qoder border-agent-qoder-border hover:bg-agent-qoder-border',
    qwen: 'bg-agent-qwen-bg text-agent-qwen border-agent-qwen-border hover:bg-agent-qwen-border',
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
