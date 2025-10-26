/**
 * Export formatters for conversation data
 * Provides utilities to format conversation data in various formats (JSON, CSV, Markdown)
 */

interface ConversationExportData {
  id: string;
  title: string;
  status: string;
  source: string;
  createdAt: string;
  completedAt: string | null;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;
  messages: Array<{
    agentName: string;
    agentType: string;
    content: string;
    timestamp: string;
    model?: string | null;
    inputTokens?: number | null;
    outputTokens?: number | null;
    totalTokens?: number | null;
    cost?: number | null;
    duration?: number | null;
  }>;
  participants?: Array<{
    agentName: string;
    agentType: string;
    model?: string | null;
  }>;
  summaryText?: string | null;
}

/**
 * Format conversation data as JSON
 */
export function formatAsJSON(data: ConversationExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format conversation data as CSV
 * Creates a CSV with headers: Agent, Type, Timestamp, Tokens, Cost, Duration, Content
 */
export function formatAsCSV(data: ConversationExportData): string {
  const headers = ['Timestamp', 'Agent', 'Type', 'Model', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Cost', 'Duration (ms)', 'Content'];
  const rows = data.messages.map((msg) => [
    new Date(msg.timestamp).toISOString(),
    `"${msg.agentName.replace(/"/g, '""')}"`,
    msg.agentType,
    msg.model || '',
    msg.inputTokens || '',
    msg.outputTokens || '',
    msg.totalTokens || '',
    msg.cost || '',
    msg.duration || '',
    `"${msg.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Format conversation data as Markdown
 * Creates a well-formatted markdown document with conversation details
 */
export function formatAsMarkdown(data: ConversationExportData): string {
  const timestamp = new Date().toISOString();
  const conversationStartTime = new Date(data.createdAt).toLocaleString();
  const conversationEndTime = data.completedAt ? new Date(data.completedAt).toLocaleString() : 'In Progress';

  let markdown = '';

  // Title and metadata
  markdown += `# ${data.title}\n\n`;
  markdown += `**Status**: ${data.status}  \n`;
  markdown += `**Source**: ${data.source}  \n`;
  markdown += `**Created**: ${conversationStartTime}  \n`;
  markdown += `**Completed**: ${conversationEndTime}  \n`;
  markdown += `**Export Date**: ${timestamp}  \n\n`;

  // Summary statistics
  markdown += `## Summary\n\n`;
  markdown += `- **Total Messages**: ${data.totalMessages}\n`;
  markdown += `- **Total Tokens**: ${data.totalTokens.toLocaleString()}\n`;
  markdown += `- **Total Cost**: $${data.totalCost.toFixed(4)}\n`;
  markdown += `- **Total Duration**: ${(data.totalDuration / 1000).toFixed(2)}s\n\n`;

  // Participants
  if (data.participants && data.participants.length > 0) {
    markdown += `## Participants\n\n`;
    markdown += data.participants.map((p) => `- **${p.agentName}** (${p.agentType}${p.model ? ` - ${p.model}` : ''})`).join('\n');
    markdown += '\n\n';
  }

  // Summary text
  if (data.summaryText) {
    markdown += `## AI Summary\n\n`;
    markdown += `${data.summaryText}\n\n`;
  }

  // Messages
  markdown += `## Conversation\n\n`;
  markdown += data.messages
    .map((msg) => {
      let blockquote = `### ${msg.agentName} (${msg.agentType})\n`;
      blockquote += `**Time**: ${new Date(msg.timestamp).toLocaleTimeString()}  \n`;
      if (msg.model) blockquote += `**Model**: ${msg.model}  \n`;
      if (msg.totalTokens) blockquote += `**Tokens**: ${msg.totalTokens}${msg.inputTokens ? ` (${msg.inputTokens}→${msg.outputTokens})` : ''}  \n`;
      if (msg.cost) blockquote += `**Cost**: $${msg.cost.toFixed(6)}  \n`;
      if (msg.duration) blockquote += `**Duration**: ${(msg.duration / 1000).toFixed(2)}s  \n`;
      blockquote += `\n${msg.content}\n\n`;
      return blockquote;
    })
    .join('---\n\n');

  return markdown;
}

/**
 * Determine file extension based on format
 */
export function getFileExtension(format: 'json' | 'csv' | 'markdown'): string {
  const extensions: Record<string, string> = {
    json: 'json',
    csv: 'csv',
    markdown: 'md',
  };
  return extensions[format] || 'txt';
}

/**
 * Determine MIME type based on format
 */
export function getMimeType(format: 'json' | 'csv' | 'markdown'): string {
  const mimeTypes: Record<string, string> = {
    json: 'application/json',
    csv: 'text/csv',
    markdown: 'text/markdown',
  };
  return mimeTypes[format] || 'text/plain';
}
