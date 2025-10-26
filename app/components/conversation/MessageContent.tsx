import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
  viewMode?: 'normal' | 'compact' | 'slim';
}

export function MessageContent({
  content,
  viewMode = 'normal',
}: MessageContentProps) {
  const [isExpanded, setIsExpanded] = useState(viewMode === 'normal');

  // Truncate long content in compact view
  const shouldTruncate = viewMode === 'compact' && content.length > 500;
  const displayContent = shouldTruncate && !isExpanded
    ? content.substring(0, 500) + '...'
    : content;

  return (
    <div className="space-y-2">
      <div className="text-sm leading-relaxed text-foreground prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="my-2">{children}</p>,
            code: ({ children }) => <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{children}</code>,
            pre: ({ children }) => (
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
                {children}
              </pre>
            ),
          }}
        >
          {displayContent}
        </ReactMarkdown>
      </div>

      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary hover:text-primary-600 font-medium transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
