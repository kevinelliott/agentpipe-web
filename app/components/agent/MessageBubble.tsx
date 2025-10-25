import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentAvatar, type AgentType } from './AgentAvatar';

interface MessageBubbleProps {
  agent: AgentType;
  agentName: string;
  agentVersion?: string | null;
  content: string;
  timestamp: Date;
  tokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  model?: string | null;
  duration?: number | null;
  className?: string;
}

export function MessageBubble({
  agent,
  agentName,
  agentVersion,
  content,
  timestamp,
  tokens,
  inputTokens,
  outputTokens,
  cost,
  model,
  duration,
  className = '',
}: MessageBubbleProps) {
  const baseClasses = 'p-5 rounded-lg border border-l-5 mb-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 animate-message-appear group';

  const agentClasses: Record<AgentType, string> = {
    amp: 'bg-agent-amp-bg/80 border-agent-amp-border border-l-agent-amp group-hover:bg-agent-amp-bg group-hover:shadow-agent-amp',
    claude: 'bg-agent-claude-bg/80 border-agent-claude-border border-l-agent-claude group-hover:bg-agent-claude-bg group-hover:shadow-agent-claude',
    codex: 'bg-agent-codex-bg/80 border-agent-codex-border border-l-agent-codex group-hover:bg-agent-codex-bg group-hover:shadow-agent-codex',
    copilot: 'bg-agent-copilot-bg/80 border-agent-copilot-border border-l-agent-copilot group-hover:bg-agent-copilot-bg group-hover:shadow-agent-copilot',
    crush: 'bg-agent-crush-bg/80 border-agent-crush-border border-l-agent-crush group-hover:bg-agent-crush-bg group-hover:shadow-agent-crush',
    cursor: 'bg-agent-cursor-bg/80 border-agent-cursor-border border-l-agent-cursor group-hover:bg-agent-cursor-bg group-hover:shadow-agent-cursor',
    factory: 'bg-agent-factory-bg/80 border-agent-factory-border border-l-agent-factory group-hover:bg-agent-factory-bg group-hover:shadow-agent-factory',
    gemini: 'bg-agent-gemini-bg/80 border-agent-gemini-border border-l-agent-gemini group-hover:bg-agent-gemini-bg group-hover:shadow-agent-gemini',
    groq: 'bg-agent-groq-bg/80 border-agent-groq-border border-l-agent-groq group-hover:bg-agent-groq-bg group-hover:shadow-agent-groq',
    kimi: 'bg-agent-kimi-bg/80 border-agent-kimi-border border-l-agent-kimi group-hover:bg-agent-kimi-bg group-hover:shadow-agent-kimi',
    opencode: 'bg-agent-opencode-bg/80 border-agent-opencode-border border-l-agent-opencode group-hover:bg-agent-opencode-bg group-hover:shadow-agent-opencode',
    ollama: 'bg-agent-ollama-bg/80 border-agent-ollama-border border-l-agent-ollama group-hover:bg-agent-ollama-bg group-hover:shadow-agent-ollama',
    qoder: 'bg-agent-qoder-bg/80 border-agent-qoder-border border-l-agent-qoder group-hover:bg-agent-qoder-bg group-hover:shadow-agent-qoder',
    qwen: 'bg-agent-qwen-bg/80 border-agent-qwen-border border-l-agent-qwen group-hover:bg-agent-qwen-bg group-hover:shadow-agent-qwen',
    default: 'bg-agent-default-bg/80 border-agent-default-border border-l-agent-default group-hover:bg-agent-default-bg',
  };

  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formatDuration = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds < 1) return `${ms}ms`;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    return `${minutes.toFixed(1)}m`;
  };

  return (
    <div
      className={`${baseClasses} ${agentClasses[agent]} ${className}`.trim()}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-current opacity-30">
        <AgentAvatar agent={agent} size="sm" />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{agentName}</span>
          {(model || agentVersion) && (
            <span className="text-xs opacity-60">
              {model}
              {model && agentVersion && ' • '}
              {agentVersion && `v${agentVersion}`}
            </span>
          )}
        </div>
        <span className="ml-auto text-xs opacity-70">{formattedTime}</span>
      </div>

      {/* Content */}
      <div className="text-sm leading-relaxed text-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Customize paragraph spacing
            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
            // Style headings
            h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h3>,
            // Style lists
            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="ml-2">{children}</li>,
            // Style code blocks
            code: ({ inline, children, ...props }: any) =>
              inline ? (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              ) : (
                <code className="block bg-muted p-3 rounded text-xs font-mono overflow-x-auto mb-3 whitespace-pre" {...props}>
                  {children}
                </code>
              ),
            pre: ({ children }) => <pre className="mb-3">{children}</pre>,
            // Style blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-current opacity-50 pl-4 italic my-3">
                {children}
              </blockquote>
            ),
            // Style links
            a: ({ children, href }) => (
              <a href={href} className="text-primary-600 dark:text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            // Style horizontal rules
            hr: () => <hr className="my-4 border-t border-current opacity-20" />,
            // Style strong/bold
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            // Style emphasis/italic
            em: ({ children }) => <em className="italic">{children}</em>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      {(tokens !== undefined || inputTokens !== undefined || outputTokens !== undefined || cost !== undefined || duration !== undefined) && (
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-current opacity-30 text-xs text-muted-foreground">
          {(inputTokens !== undefined || outputTokens !== undefined) ? (
            <>
              {inputTokens !== undefined && (
                <div className="flex items-center gap-1">
                  <span>↓ {inputTokens.toLocaleString()}</span>
                </div>
              )}
              {outputTokens !== undefined && (
                <div className="flex items-center gap-1">
                  <span>↑ {outputTokens.toLocaleString()}</span>
                </div>
              )}
              {(inputTokens !== undefined && outputTokens !== undefined) && (
                <div className="flex items-center gap-1">
                  <span>= {(inputTokens + outputTokens).toLocaleString()} tokens</span>
                </div>
              )}
            </>
          ) : tokens !== undefined && (
            <div className="flex items-center gap-1">
              <span>{tokens.toLocaleString()} tokens</span>
            </div>
          )}
          {duration != null && (
            <div className="flex items-center gap-1">
              <span>⏱ {formatDuration(duration)}</span>
            </div>
          )}
          {cost !== undefined && cost > 0 && (
            <div className="flex items-center gap-1">
              <span>${cost.toFixed(4)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
