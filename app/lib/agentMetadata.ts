/**
 * Agent Metadata Configuration
 * Static configuration for all 14 supported AI agents
 * Used for agent showcase page and branding throughout the app
 */

export interface AgentMetadata {
  id: string;
  name: string;
  officialName: string;
  shortName: string;
  description: string;
  tagline: string;
  category: 'commercial' | 'open-source' | 'research';
  provider: string;
  website?: string;
  github?: string;
  documentation?: string;
  models?: string[];
  logoPath: string;
  order: number; // For consistent ordering
}

export const AGENT_METADATA: Record<string, AgentMetadata> = {
  amp: {
    id: 'amp',
    name: 'Amp',
    officialName: 'AI Model Planner',
    shortName: 'AMP',
    description:
      'Anthropic\'s AI Model Planner. A strategic planning and analysis agent designed to orchestrate complex multi-step tasks using Claude models.',
    tagline: 'Strategic planning at scale',
    category: 'commercial',
    provider: 'Anthropic',
    website: 'https://anthropic.com',
    github: 'https://github.com/anthropics',
    documentation: 'https://docs.anthropic.com',
    models: ['claude-3.5-sonnet', 'claude-3-opus'],
    logoPath: '/logos/amp.svg',
    order: 1,
  },

  claude: {
    id: 'claude',
    name: 'Claude',
    officialName: 'Claude Code',
    shortName: 'CL',
    description:
      'Anthropic\'s advanced AI assistant. A powerful language model excelling at reasoning, coding, analysis, mathematics, and creative tasks. Ideal for complex problem-solving and code generation.',
    tagline: 'Think deeply, code precisely',
    category: 'commercial',
    provider: 'Anthropic',
    website: 'https://claude.ai',
    github: 'https://github.com/anthropics',
    documentation: 'https://docs.anthropic.com',
    models: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    logoPath: '/logos/claude.svg',
    order: 2,
  },

  codex: {
    id: 'codex',
    name: 'Codex',
    officialName: 'OpenAI Codex',
    shortName: 'CD',
    description:
      'GitHub Copilot powered by OpenAI Codex. Specialized in code generation, completion, and explanation. Excellent for programming tasks across multiple languages.',
    tagline: 'Code generation redefined',
    category: 'commercial',
    provider: 'OpenAI / GitHub',
    website: 'https://github.com/features/copilot',
    github: 'https://github.com/github/copilot-docs',
    documentation: 'https://docs.github.com/en/copilot',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    logoPath: '/logos/codex.svg',
    order: 3,
  },

  copilot: {
    id: 'copilot',
    name: 'Copilot',
    officialName: 'GitHub Copilot',
    shortName: 'CP',
    description:
      'GitHub\'s AI pair programmer powered by OpenAI. Provides intelligent code suggestions, completions, and explanations. Integrated directly into your IDE.',
    tagline: 'Your AI pair programmer',
    category: 'commercial',
    provider: 'GitHub / OpenAI',
    website: 'https://github.com/features/copilot',
    github: 'https://github.com/github/copilot-docs',
    documentation: 'https://docs.github.com/en/copilot',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    logoPath: '/logos/copilot.svg',
    order: 4,
  },

  crush: {
    id: 'crush',
    name: 'Crush',
    officialName: 'Crush by Charmbracelet',
    shortName: 'CR',
    description:
      'Charmbracelet\'s terminal-first AI assistant. A beautiful TUI-based AI tool with multi-provider support (OpenAI, Anthropic, etc.). Perfect for command-line workflows.',
    tagline: 'Terminal-first AI magic',
    category: 'open-source',
    provider: 'Charmbracelet',
    website: 'https://charm.sh',
    github: 'https://github.com/charmbracelet/crush',
    documentation: 'https://github.com/charmbracelet/crush',
    models: ['multiple providers supported'],
    logoPath: '/logos/crush.svg',
    order: 5,
  },

  cursor: {
    id: 'cursor',
    name: 'Cursor',
    officialName: 'Cursor IDE',
    shortName: 'CU',
    description:
      'The AI-first code editor. Built on VS Code with integrated AI capabilities for code generation, debugging, and refactoring. Seamless AI-powered development workflow.',
    tagline: 'The AI-first IDE',
    category: 'commercial',
    provider: 'Cursor',
    website: 'https://cursor.sh',
    github: 'https://github.com/getcursor',
    documentation: 'https://docs.cursor.sh',
    models: ['gpt-4', 'claude-3.5-sonnet'],
    logoPath: '/logos/cursor.svg',
    order: 6,
  },

  factory: {
    id: 'factory',
    name: 'Factory',
    officialName: 'Factory Agent',
    shortName: 'FA',
    description:
      'A flexible agent framework for building and orchestrating multi-agent AI systems. Designed for complex workflows requiring coordination between multiple specialized agents.',
    tagline: 'Build agent ecosystems',
    category: 'open-source',
    provider: 'AgentPipe',
    website: 'https://github.com/kevinelliott/agentpipe',
    github: 'https://github.com/kevinelliott/agentpipe',
    documentation: 'https://github.com/kevinelliott/agentpipe#readme',
    models: ['configurable'],
    logoPath: '/logos/factory.svg',
    order: 7,
  },

  gemini: {
    id: 'gemini',
    name: 'Gemini',
    officialName: 'Google Gemini',
    shortName: 'GM',
    description:
      'Google\'s multimodal AI model. Highly capable across text, images, audio, and video. Excellent for creative tasks, reasoning, and understanding complex visual content.',
    tagline: 'Multimodal AI excellence',
    category: 'commercial',
    provider: 'Google DeepMind',
    website: 'https://gemini.google.com',
    github: 'https://github.com/google/generative-ai',
    documentation: 'https://ai.google.dev',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    logoPath: '/logos/gemini.svg',
    order: 8,
  },

  groq: {
    id: 'groq',
    name: 'Groq',
    officialName: 'Groq Code CLI',
    shortName: 'GR',
    description:
      'Lightning-fast code generation using Groq\'s LPUs (Language Processing Units). Specialized in rapid code synthesis and generation with exceptional speed.',
    tagline: 'Lightning-fast code generation',
    category: 'commercial',
    provider: 'Groq',
    website: 'https://groq.com',
    github: 'https://github.com/groqcloud',
    documentation: 'https://console.groq.com/docs',
    models: ['mixtral-8x7b', 'llama2-70b'],
    logoPath: '/logos/groq.svg',
    order: 9,
  },

  kimi: {
    id: 'kimi',
    name: 'Kimi',
    officialName: 'Kimi by Moonshot AI',
    shortName: 'KI',
    description:
      'Chinese AI coding assistant by Moonshot AI. Optimized for programming with excellent multilingual support and understanding of Chinese code contexts and documentation.',
    tagline: 'Programming without borders',
    category: 'commercial',
    provider: 'Moonshot AI',
    website: 'https://kimi.moonshot.cn',
    github: 'https://github.com/moonshot-ai',
    documentation: 'https://platform.moonshot.cn/docs',
    models: ['moonshot-v1'],
    logoPath: '/logos/kimi.svg',
    order: 10,
  },

  opencode: {
    id: 'opencode',
    name: 'OpenCode',
    officialName: 'OpenCode',
    shortName: 'OC',
    description:
      'An open-source code generation and analysis tool. Designed for collaborative development with focus on code quality, testing, and best practices.',
    tagline: 'Code generation for everyone',
    category: 'open-source',
    provider: 'OpenCode Community',
    website: 'https://github.com/opencode-dev',
    github: 'https://github.com/opencode-dev/opencode',
    documentation: 'https://github.com/opencode-dev/opencode#readme',
    models: ['configurable'],
    logoPath: '/logos/opencode.svg',
    order: 11,
  },

  ollama: {
    id: 'ollama',
    name: 'Ollama',
    officialName: 'Ollama',
    shortName: 'OL',
    description:
      'Run large language models locally. Open-source tool supporting models like Llama 2, Mistral, and others. Perfect for privacy-conscious development and offline usage.',
    tagline: 'LLMs on your machine',
    category: 'open-source',
    provider: 'Ollama',
    website: 'https://ollama.ai',
    github: 'https://github.com/ollama/ollama',
    documentation: 'https://github.com/ollama/ollama#readme',
    models: ['llama2', 'mistral', 'neural-chat', 'and 50+ more'],
    logoPath: '/logos/ollama.svg',
    order: 12,
  },

  qoder: {
    id: 'qoder',
    name: 'QoDer',
    officialName: 'QoDer AI Code Assistant',
    shortName: 'QD',
    description:
      'Quality-oriented code generation assistant. Focuses on code quality, testing, documentation, and best practices. Built for developers who care about code excellence.',
    tagline: 'Quality code, automatically',
    category: 'commercial',
    provider: 'QoDer',
    website: 'https://qoder.io',
    github: 'https://github.com/qoder-io',
    documentation: 'https://docs.qoder.io',
    models: ['custom models'],
    logoPath: '/logos/qoder.svg',
    order: 13,
  },

  qwen: {
    id: 'qwen',
    name: 'Qwen',
    officialName: 'Qwen by Alibaba',
    shortName: 'QW',
    description:
      'Alibaba\'s advanced language model. A powerful and efficient model family excelling at coding, reasoning, and understanding. Strong support for multiple languages including Chinese.',
    tagline: 'Reasoning with precision',
    category: 'commercial',
    provider: 'Alibaba',
    website: 'https://qwen.aliyun.com',
    github: 'https://github.com/QwenLM',
    documentation: 'https://github.com/QwenLM/Qwen#readme',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    logoPath: '/logos/qwen.svg',
    order: 14,
  },
};

/**
 * Get metadata for a single agent by ID
 */
export function getAgentMetadata(agentId: string): AgentMetadata | null {
  return AGENT_METADATA[agentId.toLowerCase()] || null;
}

/**
 * Get all agents sorted by display order
 */
export function getAllAgentsMetadata(): AgentMetadata[] {
  return Object.values(AGENT_METADATA).sort((a, b) => a.order - b.order);
}

/**
 * Get agents by category
 */
export function getAgentsByCategory(
  category: 'commercial' | 'open-source' | 'research'
): AgentMetadata[] {
  return Object.values(AGENT_METADATA)
    .filter((agent) => agent.category === category)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get agent name by ID (with fallback to official name)
 */
export function getAgentDisplayName(agentId: string): string {
  const agent = getAgentMetadata(agentId);
  return agent?.name || agentId;
}
