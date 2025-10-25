'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '../ui/Badge';

interface SummaryCardProps {
  text: string;
  agentType?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  duration?: number; // milliseconds
  className?: string;
}

export function SummaryCard({
  text,
  model,
  inputTokens,
  outputTokens,
  totalTokens,
  cost,
  duration,
  className = '',
}: SummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowToggle = text.length > 500;

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatCost = (costValue: number) => {
    if (costValue === 0) return '$0.00';
    if (costValue < 0.01) return `$${costValue.toFixed(4)}`;
    return `$${costValue.toFixed(2)}`;
  };

  return (
    <div
      className={`bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20 rounded-lg p-5 transition-all duration-base hover:shadow-md hover:border-primary/30 ${className}`.trim()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-hidden="true"
        >
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />
          <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
        </svg>
        <Badge variant="info" className="text-xs">
          AI Summary
        </Badge>
      </div>

      {/* Summary Text */}
      <div className="mb-4">
        <div
          className={`text-sm text-foreground leading-relaxed ${
            !isExpanded && shouldShowToggle ? 'line-clamp-3' : ''
          }`}
        >
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
                <blockquote className="border-l-4 border-primary/30 pl-4 italic my-3">
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
              hr: () => <hr className="my-4 border-t border-primary/20" />,
              // Style strong/bold
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              // Style emphasis/italic
              em: ({ children }) => <em className="italic">{children}</em>,
            }}
          >
            {text}
          </ReactMarkdown>
        </div>

        {shouldShowToggle && (
          <button
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className="text-xs text-primary hover:text-primary-hover font-medium mt-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded px-1"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Show less' : 'Show more'}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="pt-3 border-t border-primary/10">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {model && (
            <div className="flex items-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
              <span className="font-medium">{model}</span>
            </div>
          )}

          {totalTokens != null && (
            <div className="flex items-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>
                {totalTokens.toLocaleString()} tokens
                {inputTokens != null && outputTokens != null && (
                  <span className="text-muted-foreground/70">
                    {' '}({inputTokens.toLocaleString()} in / {outputTokens.toLocaleString()} out)
                  </span>
                )}
              </span>
            </div>
          )}

          {cost != null && (
            <div className="flex items-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
              </svg>
              <span>{formatCost(cost)}</span>
            </div>
          )}

          {duration != null && (
            <div className="flex items-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatDuration(duration)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
