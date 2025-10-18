# AgentPipe Web Component Guide

## Overview

This guide provides detailed implementation examples for all components in the AgentPipe Web design system. Components are designed to be accessible, performant, and consistent across the application.

## Table of Contents

1. [Layout Components](#layout-components)
2. [Form Components](#form-components)
3. [Data Display Components](#data-display-components)
4. [Agent Components](#agent-components)
5. [Message Components](#message-components)
6. [Status Components](#status-components)
7. [Feedback Components](#feedback-components)

---

## Layout Components

### Container

**Purpose**: Constrains content width and centers it on the page

**Variants**:
- Default (1400px max-width)
- Narrow (1200px max-width)
- Wide (1600px max-width)

**Example**:
```html
<div class="container">
  <!-- Content -->
</div>

<div class="container container-narrow">
  <!-- Narrower content -->
</div>
```

**Next.js / React**:
```tsx
export function Container({
  children,
  variant = 'default'
}: {
  children: React.ReactNode
  variant?: 'default' | 'narrow' | 'wide'
}) {
  const className = `container ${
    variant === 'narrow' ? 'container-narrow' :
    variant === 'wide' ? 'container-wide' : ''
  }`.trim()

  return <div className={className}>{children}</div>
}
```

### Grid

**Purpose**: Responsive grid layout for cards and content

**Example**:
```html
<!-- Auto-fit grid (300px min column width) -->
<div class="grid grid-auto">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>

<!-- Fixed columns (responsive) -->
<div class="grid grid-cols-2 lg:grid-cols-4">
  <div class="metric-card">Metric 1</div>
  <div class="metric-card">Metric 2</div>
  <div class="metric-card">Metric 3</div>
  <div class="metric-card">Metric 4</div>
</div>
```

---

## Form Components

### Button

**Purpose**: Primary interaction element

**Sizes**: xs, sm, md (default), lg

**Variants**: primary, secondary, ghost, outline, destructive

**Example**:
```html
<!-- Primary action -->
<button class="btn btn-primary btn-md">
  Start Conversation
</button>

<!-- Secondary action -->
<button class="btn btn-secondary btn-md">
  Cancel
</button>

<!-- Icon button -->
<button class="btn btn-ghost btn-icon btn-md" aria-label="Settings">
  <svg>...</svg>
</button>
```

**Accessibility**:
- Use semantic `<button>` elements
- Provide `aria-label` for icon-only buttons
- Ensure 44x44px minimum touch target
- Maintain visible focus indicators

### Input

**Purpose**: Text input field

**States**: Default, Focus, Error, Disabled

**Variants**: Default, Search

**Example**:
```html
<!-- Basic input -->
<div>
  <label class="input-label" for="name">Name</label>
  <input
    type="text"
    id="name"
    class="input"
    placeholder="Enter your name"
  >
  <p class="input-helper">This will be displayed publicly</p>
</div>

<!-- Search input -->
<div>
  <label class="input-label" for="search">Search</label>
  <input
    type="search"
    id="search"
    class="input input-search"
    placeholder="Search conversations..."
  >
</div>

<!-- Error state -->
<div>
  <label class="input-label" for="email">Email</label>
  <input
    type="email"
    id="email"
    class="input input-error"
    placeholder="email@example.com"
    aria-invalid="true"
    aria-describedby="email-error"
  >
  <p class="input-error-text" id="email-error">
    Please enter a valid email address
  </p>
</div>
```

**Next.js / React**:
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, ...props }: InputProps) {
  const inputId = props.id || `input-${Math.random()}`
  const errorId = `${inputId}-error`

  return (
    <div>
      <label className="input-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p className="input-error-text" id={errorId}>{error}</p>
      )}
      {helperText && !error && (
        <p className="input-helper">{helperText}</p>
      )}
    </div>
  )
}
```

### Badge

**Purpose**: Compact status or label indicator

**Variants**: default, primary, success, error, warning, info

**Sizes**: default, lg

**Example**:
```html
<!-- Status badge -->
<span class="badge badge-success">Active</span>

<!-- Label badge -->
<span class="badge badge-primary">New</span>

<!-- Large variant -->
<span class="badge badge-info badge-lg">Processing</span>
```

---

## Data Display Components

### Card

**Purpose**: Container for related content

**Variants**: Default, Interactive, Elevated

**Example**:
```html
<!-- Basic card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-description">Description text</p>
  </div>
  <p>Card content goes here.</p>
  <div class="card-footer">
    <button class="btn btn-primary btn-sm">Action</button>
  </div>
</div>

<!-- Interactive card (clickable) -->
<div class="card card-interactive" role="button" tabindex="0">
  <div class="card-header">
    <h3 class="card-title">Clickable Card</h3>
  </div>
  <p>This card responds to hover and click.</p>
</div>
```

**Next.js / React**:
```tsx
interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  interactive?: boolean
  elevated?: boolean
  footer?: React.ReactNode
  onClick?: () => void
}

export function Card({
  title,
  description,
  children,
  interactive,
  elevated,
  footer,
  onClick
}: CardProps) {
  const className = `card ${
    interactive ? 'card-interactive' : ''
  } ${elevated ? 'card-elevated' : ''}`.trim()

  return (
    <div
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {(title || description) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {description && <p className="card-description">{description}</p>}
        </div>
      )}
      {children}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}
```

### Metric Card

**Purpose**: Display key metrics with optional change indicators

**Example**:
```html
<div class="metric-card">
  <div class="metric-card-label">Total Conversations</div>
  <div class="metric-card-value">1,234</div>
  <div class="metric-card-change metric-card-change-positive">
    ↑ 12.5% vs last month
  </div>
</div>
```

**Next.js / React**:
```tsx
interface MetricCardProps {
  label: string
  value: string | number
  change?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
}

export function MetricCard({ label, value, change }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value">{value}</div>
      {change && (
        <div className={`metric-card-change metric-card-change-${change.type}`}>
          {change.type === 'positive' && '↑ '}
          {change.type === 'negative' && '↓ '}
          {change.value}
        </div>
      )}
    </div>
  )
}
```

---

## Agent Components

### Agent Avatar

**Purpose**: Visual identifier for AI agents

**Sizes**: sm (24px), md (32px), lg (40px), xl (48px)

**Agents**: claude, gemini, gpt, amp, o1, default

**Example**:
```html
<!-- Small avatar -->
<div class="agent-avatar agent-avatar-sm agent-claude">CL</div>

<!-- Medium avatar (default) -->
<div class="agent-avatar agent-avatar-md agent-gpt">GP</div>

<!-- Large avatar -->
<div class="agent-avatar agent-avatar-lg agent-gemini">GM</div>
```

**Next.js / React**:
```tsx
type AgentType = 'claude' | 'gemini' | 'gpt' | 'amp' | 'o1' | 'default'
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AgentAvatarProps {
  agent: AgentType
  size?: AvatarSize
  label?: string
}

const agentLabels: Record<AgentType, string> = {
  claude: 'CL',
  gemini: 'GM',
  gpt: 'GP',
  amp: 'AM',
  o1: 'O1',
  default: 'DF'
}

export function AgentAvatar({
  agent,
  size = 'md',
  label
}: AgentAvatarProps) {
  return (
    <div className={`agent-avatar agent-avatar-${size} agent-${agent}`}>
      {label || agentLabels[agent]}
    </div>
  )
}
```

### Agent Badge

**Purpose**: Agent identifier with dot indicator

**Example**:
```html
<span class="agent-badge agent-claude">Claude</span>
<span class="agent-badge agent-gpt">GPT-4</span>
```

**Next.js / React**:
```tsx
interface AgentBadgeProps {
  agent: AgentType
  label: string
}

export function AgentBadge({ agent, label }: AgentBadgeProps) {
  return (
    <span className={`agent-badge agent-${agent}`}>
      {label}
    </span>
  )
}
```

---

## Message Components

### Message Bubble

**Purpose**: Display individual agent messages

**Example**:
```html
<div class="message-bubble message-claude">
  <div class="message-bubble-header">
    <div class="agent-avatar agent-avatar-sm agent-claude">CL</div>
    <span class="message-bubble-agent-name">Claude</span>
    <span class="message-bubble-timestamp">2:34 PM</span>
  </div>
  <div class="message-bubble-content">
    <p>I'll help you analyze that dataset.</p>
    <p>Here's some code: <code>const data = []</code></p>
  </div>
  <div class="message-bubble-footer">
    <div class="message-bubble-meta">
      <span>1,234 tokens</span>
    </div>
    <div class="message-bubble-meta">
      <span>$0.0123</span>
    </div>
  </div>
</div>
```

**Next.js / React**:
```tsx
interface Message {
  id: string
  agent: AgentType
  agentName: string
  content: string
  timestamp: Date
  tokens: number
  cost: number
}

export function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`message-bubble message-${message.agent}`}>
      <div className="message-bubble-header">
        <AgentAvatar agent={message.agent} size="sm" />
        <span className="message-bubble-agent-name">{message.agentName}</span>
        <span className="message-bubble-timestamp">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      <div className="message-bubble-content">
        {/* Render markdown content */}
        <div dangerouslySetInnerHTML={{ __html: message.content }} />
      </div>
      <div className="message-bubble-footer">
        <div className="message-bubble-meta">
          <span>{message.tokens.toLocaleString()} tokens</span>
        </div>
        <div class="message-bubble-meta">
          <span>${message.cost.toFixed(4)}</span>
        </div>
      </div>
    </div>
  )
}
```

### Conversation Card

**Purpose**: Summary view of conversations

**Example**:
```html
<div class="conversation-card">
  <div class="conversation-card-header">
    <div class="conversation-card-agents">
      <div class="agent-avatar agent-avatar-sm agent-claude">CL</div>
      <div class="agent-avatar agent-avatar-sm agent-gpt">GP</div>
    </div>
    <div class="flex-1">
      <h4 class="conversation-card-title">Product Analysis</h4>
      <div class="conversation-card-meta">
        <span class="status-dot status-active pulse"></span>
        <span>Active</span>
        <span>•</span>
        <span>5m ago</span>
      </div>
    </div>
  </div>
  <p class="conversation-card-preview">
    Claude and GPT-4 are analyzing user metrics...
  </p>
  <div class="conversation-card-footer">
    <div class="conversation-card-stats">
      <div class="conversation-card-stat">
        <span>12 messages</span>
      </div>
      <div class="conversation-card-stat">
        <span>5.2K tokens</span>
      </div>
    </div>
    <span class="badge badge-success">Active</span>
  </div>
</div>
```

### Code Block

**Purpose**: Display formatted code with syntax highlighting

**Example**:
```html
<div class="code-block">
  <div class="code-block-header">
    <span class="code-block-language">TypeScript</span>
    <div class="code-block-actions">
      <button class="btn btn-ghost btn-xs">Copy</button>
    </div>
  </div>
  <div class="code-block-content">
    <pre><code><span class="token-keyword">const</span> <span class="token-variable">agent</span> = <span class="token-string">'claude'</span>;</code></pre>
  </div>
</div>
```

**Syntax Highlighting Classes**:
- `.token-comment` - Comments (gray, italic)
- `.token-keyword` - Keywords like const, let, function (purple, bold)
- `.token-string` - String literals (green)
- `.token-function` - Function names (cyan)
- `.token-number` - Numbers (red)
- `.token-operator` - Operators like =, +, - (light gray)
- `.token-variable` - Variable names (orange)

---

## Status Components

### Status Dot

**Purpose**: Visual status indicator

**States**: active, completed, error, interrupted, pending

**Sizes**: default, lg

**Example**:
```html
<!-- Active with pulse animation -->
<div class="flex items-center gap-2">
  <div class="status-dot status-active pulse"></div>
  <span>Active</span>
</div>

<!-- Completed -->
<div class="flex items-center gap-2">
  <div class="status-dot status-completed"></div>
  <span>Completed</span>
</div>

<!-- Large variant -->
<div class="status-dot status-dot-lg status-error"></div>
```

### WebSocket Status

**Purpose**: Real-time connection status indicator

**States**: connected, connecting, disconnected

**Example**:
```html
<!-- Connected -->
<div class="websocket-status websocket-connected">
  <div class="websocket-status-dot"></div>
  <span>Connected</span>
</div>

<!-- Connecting -->
<div class="websocket-status websocket-connecting">
  <div class="websocket-status-dot"></div>
  <span>Connecting...</span>
</div>

<!-- Disconnected -->
<div class="websocket-status websocket-disconnected">
  <div class="websocket-status-dot"></div>
  <span>Disconnected</span>
</div>
```

**Next.js / React**:
```tsx
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

interface WebSocketStatusProps {
  status: ConnectionStatus
}

const statusLabels: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting...',
  disconnected: 'Disconnected'
}

export function WebSocketStatus({ status }: WebSocketStatusProps) {
  return (
    <div className={`websocket-status websocket-${status}`}>
      <div className="websocket-status-dot" />
      <span>{statusLabels[status]}</span>
    </div>
  )
}
```

---

## Feedback Components

### Skeleton Loader

**Purpose**: Loading state placeholder

**Variants**: text, heading, avatar, card, message

**Example**:
```html
<!-- Text skeleton -->
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-text"></div>

<!-- Heading skeleton -->
<div class="skeleton skeleton-heading"></div>

<!-- Avatar skeleton -->
<div class="skeleton skeleton-avatar"></div>

<!-- Card skeleton -->
<div class="card">
  <div class="skeleton skeleton-heading"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
</div>
```

**Next.js / React**:
```tsx
export function ConversationCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton skeleton-avatar" />
        <div className="flex-1">
          <div className="skeleton skeleton-heading" style={{ width: '60%' }} />
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
        </div>
      </div>
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
    </div>
  )
}
```

### Empty State

**Purpose**: Communicate absence of content

**Example**:
```html
<div class="card">
  <div class="empty-state">
    <div class="empty-state-icon">
      <svg><!-- Icon SVG --></svg>
    </div>
    <h3 class="empty-state-title">No conversations yet</h3>
    <p class="empty-state-description">
      Start a new conversation to see realtime messages from multiple AI agents.
    </p>
    <button class="btn btn-primary btn-md">Start Conversation</button>
  </div>
</div>
```

**Next.js / React**:
```tsx
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
        {action && (
          <button
            className="btn btn-primary btn-md"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## Search & Filter Components

### Search Bar

**Purpose**: Integrated search interface

**Example**:
```html
<div class="search-bar">
  <input
    type="search"
    class="input input-search search-bar-input"
    placeholder="Search conversations..."
  >
  <button class="btn btn-primary btn-md">Search</button>
</div>
```

### Filter Chips

**Purpose**: Toggle filters

**Example**:
```html
<div class="filter-group">
  <button class="filter-chip active">All</button>
  <button class="filter-chip">Active</button>
  <button class="filter-chip">Completed</button>
  <button class="filter-chip">Error</button>
</div>
```

**Next.js / React**:
```tsx
interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
}

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      className={`filter-chip ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
```

---

## Accessibility Best Practices

### Keyboard Navigation

All interactive components support keyboard navigation:

- **Buttons**: Enter/Space to activate
- **Links**: Enter to follow
- **Forms**: Tab to navigate, Enter to submit
- **Cards (interactive)**: Tab to focus, Enter to activate

### Focus Management

- All interactive elements have visible focus indicators (2px blue outline)
- Focus order follows visual order
- Modal dialogs trap focus
- Skip links allow jumping to main content

### Screen Readers

- Use semantic HTML (`button`, `nav`, `main`, `article`)
- Provide ARIA labels for icon-only buttons
- Use `aria-live` for real-time updates
- Ensure all images have alt text

### Color Contrast

All color combinations meet WCAG AA standards:

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Touch Targets

All interactive elements meet minimum touch target size:

- Minimum: 44x44px
- Recommended: 48x48px for primary actions

---

## Next.js Implementation Tips

### Server vs Client Components

**Use Server Components for**:
- Static content
- Data fetching
- SEO-critical content

**Use Client Components for**:
- Interactive elements (buttons, forms)
- State management
- Real-time updates (WebSocket)
- Browser APIs

### Example Structure

```tsx
// app/conversations/[id]/page.tsx (Server Component)
export default async function ConversationPage({ params }) {
  const conversation = await getConversation(params.id)

  return (
    <Container>
      <ConversationHeader conversation={conversation} />
      <MessageList conversationId={params.id} />
    </Container>
  )
}

// components/MessageList.tsx (Client Component)
'use client'

export function MessageList({ conversationId }: { conversationId: string }) {
  const { messages, isLoading } = useMessages(conversationId)

  if (isLoading) {
    return <MessageListSkeleton />
  }

  return (
    <div>
      {messages.map(message => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  )
}
```

---

## Further Resources

- [Design Principles](/docs/design-principles.md)
- [Tailwind CSS Configuration](/tailwind.config.ts)
- [Design System Preview](/design-system/index.html)
