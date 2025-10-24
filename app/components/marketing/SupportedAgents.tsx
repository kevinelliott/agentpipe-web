import React from 'react';

const agents = [
  {
    name: 'Amp CLI',
    provider: 'Sourcegraph',
    url: 'https://ampcode.com',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-[#0d8968]',
    bgColor: 'bg-[#ecfdf5]',
    borderColor: 'border-[#d1f4e8]',
    description: 'Autonomous coding with IDE integration and smart filtering',
  },
  {
    name: 'Claude CLI',
    provider: 'Anthropic',
    url: 'https://claude.com',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
        <path d="M7 7h10M7 12h10M7 17h6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: 'text-[#cc785c]',
    bgColor: 'bg-[#fef3f0]',
    borderColor: 'border-[#f4d7cc]',
    description: 'Advanced reasoning and complex task execution',
  },
  {
    name: 'GitHub Copilot CLI',
    provider: 'GitHub',
    url: 'https://github.com/features/copilot',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
    color: 'text-[#24292e]',
    bgColor: 'bg-[#f6f8fa]',
    borderColor: 'border-[#e1e4e8]',
    description: 'AI pair programming with GitHub integration',
  },
  {
    name: 'Cursor CLI',
    provider: 'Cursor',
    url: 'https://cursor.com',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'text-[#7c3aed]',
    bgColor: 'bg-[#f5f3ff]',
    borderColor: 'border-[#e9d5ff]',
    description: 'AI-first code editor with CLI support',
  },
  {
    name: 'Factory CLI',
    provider: 'Factory.ai',
    url: 'https://factory.ai',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <rect x="5" y="2" width="14" height="7" rx="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 9v10a2 2 0 002 2h10a2 2 0 002-2V9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="14" r="1" fill="currentColor"/>
        <circle cx="15" cy="14" r="1" fill="currentColor"/>
        <path d="M9 18h6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: 'text-[#0891b2]',
    bgColor: 'bg-[#ecfeff]',
    borderColor: 'border-[#cffafe]',
    description: 'Agent-native software development with Code and Knowledge Droids',
  },
  {
    name: 'Gemini CLI',
    provider: 'Google',
    url: 'https://ai.google.dev',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    color: 'text-[#4f7fd9]',
    bgColor: 'bg-[#eff6ff]',
    borderColor: 'border-[#d6e4ff]',
    description: 'Google\'s conversational AI for terminal workflows',
  },
  {
    name: 'Qoder CLI',
    provider: 'Qoder',
    url: 'https://qoder.dev',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        <path d="M8 12h8M12 8v8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: 'text-[#10b981]',
    bgColor: 'bg-[#ecfdf5]',
    borderColor: 'border-[#d1fae5]',
    description: 'Enhanced context engineering with MCP integration',
  },
  {
    name: 'Qwen CLI',
    provider: 'Alibaba Cloud',
    url: 'https://github.com/QwenLM/Qwen',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: 'text-[#ea580c]',
    bgColor: 'bg-[#fff7ed]',
    borderColor: 'border-[#fed7aa]',
    description: 'Open-source large language model for CLI',
  },
  {
    name: 'Codex CLI',
    provider: 'OpenAI',
    url: 'https://openai.com/codex',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: 'text-[#64748b]',
    bgColor: 'bg-[#f8fafc]',
    borderColor: 'border-[#e2e8f0]',
    description: 'Code generation with non-interactive mode support',
  },
  {
    name: 'OpenCode CLI',
    provider: 'OpenCode',
    url: 'https://opencode.dev',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: 'text-[#06b6d4]',
    bgColor: 'bg-[#ecfeff]',
    borderColor: 'border-[#cffafe]',
    description: 'Open-source code completion and generation',
  },
  {
    name: 'Ollama CLI',
    provider: 'Ollama',
    url: 'https://ollama.ai',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
        <circle cx="12" cy="12" r="9" strokeWidth="2"/>
        <path d="M12 3v18M3 12h18" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: 'text-[#f97316]',
    bgColor: 'bg-[#fff7ed]',
    borderColor: 'border-[#fed7aa]',
    description: 'Run and orchestrate large language models locally',
  },
];

export function SupportedAgents() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Supported CLI Agents
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AgentPipe orchestrates conversations between AI CLI tools,
            enabling seamless multi-agent collaboration in your terminal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <a
              key={agent.name}
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group bg-card border ${agent.borderColor} rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-opacity-100 border-opacity-50`}
            >
              <div className="flex items-start gap-4">
                <div className={`${agent.bgColor} ${agent.color} rounded-lg p-3 transition-transform group-hover:scale-110`}>
                  {agent.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                    {agent.name}
                    <svg
                      className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{agent.provider}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to add support for another agent?
          </p>
          <a
            href="https://github.com/kevinelliott/agentpipe/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Open an issue on GitHub
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
