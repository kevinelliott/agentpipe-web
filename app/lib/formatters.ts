import type { AgentType } from '../components/agent/AgentAvatar';
import type { StatusType } from '../components/status/StatusDot';

/**
 * Format utilities for dashboard data transformation
 */

/**
 * Format a timestamp to relative time (e.g., "5m ago", "2h ago")
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

/**
 * Format token count with K/M suffixes (e.g., "5.2K", "1.5M")
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Format large numbers with comma separators (e.g., "1,234")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format cost as currency (e.g., "$1.23")
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

/**
 * Map database conversation status to StatusType
 */
export function mapConversationStatus(status: string): StatusType {
  const statusMap: Record<string, StatusType> = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ERROR: 'error',
    INTERRUPTED: 'interrupted',
  };
  return statusMap[status] || 'pending';
}

/**
 * Map agent type string to AgentType
 */
export function mapAgentType(agentType: string): AgentType {
  const agentMap: Record<string, AgentType> = {
    claude: 'claude',
    gemini: 'gemini',
    gpt: 'gpt',
    'gpt-4': 'gpt',
    'gpt-3.5': 'gpt',
    amp: 'amp',
    o1: 'o1',
    copilot: 'copilot',
    cursor: 'cursor',
    qoder: 'qoder',
    qwen: 'qwen',
    codex: 'codex',
    opencode: 'opencode',
    ollama: 'ollama',
    factory: 'factory',
  };
  return agentMap[agentType.toLowerCase()] || 'default';
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    ERROR: 'Error',
    INTERRUPTED: 'Interrupted',
  };
  return labelMap[status] || status;
}

/**
 * Transform API conversation data to ConversationCard props
 */
export function transformConversation(conversation: any) {
  // Get the most recently updated message for preview
  const preview = conversation.initialPrompt
    ? conversation.initialPrompt.substring(0, 150) + (conversation.initialPrompt.length > 150 ? '...' : '')
    : 'No messages yet';

  return {
    id: conversation.id,
    title: conversation.name,
    participants: (conversation.participants || []).map((p: any) => ({
      type: mapAgentType(p.agentType),
      name: p.agentName,
    })),
    status: mapConversationStatus(conversation.status),
    statusLabel: getStatusLabel(conversation.status),
    lastActivity: formatRelativeTime(conversation.updatedAt || conversation.startedAt),
    preview,
    messageCount: conversation.totalMessages || conversation.messageCount || 0,
    tokenCount: formatTokenCount(conversation.totalTokens || 0),
  };
}

/**
 * Transform API message data to MessageBubble props
 */
export function transformMessage(message: any) {
  return {
    agent: mapAgentType(message.agentType),
    agentName: message.agentName,
    content: message.content,
    timestamp: new Date(message.timestamp),
    tokens: message.totalTokens || undefined,
    cost: message.cost || undefined,
  };
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: any) {
  return {
    totalConversations: formatNumber(metrics.totalConversations || 0),
    activeAgents: formatNumber(metrics.topAgents?.length || 0),
    totalTokens: formatTokenCount(metrics.totalTokens || 0),
    totalCost: formatCost(metrics.totalCost || 0),
  };
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
