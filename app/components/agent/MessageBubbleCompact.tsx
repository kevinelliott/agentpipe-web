'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentAvatar, type AgentType } from './AgentAvatar';

interface MessageBubbleCompactProps {
  agent: AgentType;
  agentName: string;
  content: string;
  timestamp: Date;
  onClick?: () => void;
  className?: string;
}

export function MessageBubbleCompact({
  agent,
  agentName,
  content,
  timestamp,
  onClick,
  className = '',
}: MessageBubbleCompactProps) {
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
      <div className="flex items-center gap-2 mb-2">
        <AgentAvatar agent={agent} size="xs" />
        <span className="text-sm font-medium text-foreground">{agentName}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{formattedTime}</span>
      </div>
      <div className="text-sm leading-relaxed text-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Customize paragraph spacing
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            // Style headings
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0">{children}</h3>,
            // Style lists
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="ml-2">{children}</li>,
            // Style code blocks
            code: ({ inline, children, ...props }: any) =>
              inline ? (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              ) : (
                <code className="block bg-muted p-2 rounded text-xs font-mono overflow-x-auto mb-2 whitespace-pre" {...props}>
                  {children}
                </code>
              ),
            pre: ({ children }) => <pre className="mb-2">{children}</pre>,
            // Style blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-current opacity-50 pl-3 italic my-2">
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
            hr: () => <hr className="my-3 border-t border-current opacity-20" />,
            // Style strong/bold
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            // Style emphasis/italic
            em: ({ children }) => <em className="italic">{children}</em>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
