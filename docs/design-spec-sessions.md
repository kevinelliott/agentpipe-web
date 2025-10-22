# AgentPipe Web - Session Viewing UI/UX Design Specification

## Table of Contents
1. [Design Overview](#design-overview)
2. [Page Layouts](#page-layouts)
3. [Component Specifications](#component-specifications)
4. [User Flows](#user-flows)
5. [Responsive Behavior](#responsive-behavior)
6. [Real-Time Update Patterns](#real-time-update-patterns)
7. [Accessibility](#accessibility)
8. [Implementation Notes](#implementation-notes)

---

## Design Overview

### Design Approach
The session viewing interface follows a **three-tier information architecture**:
1. **Session List View** - Browse and filter all sessions
2. **Session Detail View** - View a single session with full conversation thread
3. **Session Upload** - Upload historical sessions from CLI

The design emphasizes:
- **Clear visual distinction** between live and historical sessions
- **Progressive disclosure** of complexity (summary → details → metrics)
- **Real-time feedback** with optimistic UI updates
- **Scan-friendly layouts** with consistent information hierarchy
- **Accessible interactions** with keyboard navigation and ARIA labels

### Key Design Decisions

**1. Color Coding System**
- Live sessions: Green accent (status-active)
- Completed sessions: Blue accent (status-completed)
- Error sessions: Red accent (status-error)
- Interrupted sessions: Amber accent (status-interrupted)

**2. Layout Patterns**
- Desktop: Sidebar navigation + main content area
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation + full-width content

**3. Real-Time Indicators**
- Pulsing dot animation for live sessions
- "Streaming" badge for active sessions
- Auto-scroll with manual override control
- WebSocket connection status in header

---

## Page Layouts

### 1. Session List View
**Route:** `/sessions`

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ - Logo + Navigation                                        │
│ - WebSocket Status Indicator (when live sessions exist)   │
│ - Search Bar (global)                                      │
├─────────────────────────────────────────────────────────────┤
│ Page Header                                                │
│ - Title: "Sessions"                                        │
│ - Upload Button (primary action)                           │
│ - Filter Pills (Active, Completed, Error, All)            │
├─────────────────────────────────────────────────────────────┤
│ Toolbar                                                    │
│ - Search Input (session-specific)                         │
│ - Filter Dropdown (Advanced)                               │
│ - Sort Dropdown (Date, Cost, Duration, Messages)          │
│ - View Toggle (Grid / List)                               │
├─────────────────────────────────────────────────────────────┤
│ Live Sessions Section (if any active)                     │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ 🟢 Active Sessions (2)                               │ │
│ │                                                       │ │
│ │ [SessionCard] [SessionCard]                          │ │
│ └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Historical Sessions Section                               │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Recent Sessions                                       │ │
│ │                                                       │ │
│ │ [SessionCard] [SessionCard] [SessionCard]            │ │
│ │ [SessionCard] [SessionCard] [SessionCard]            │ │
│ │                                                       │ │
│ │ [Load More Button / Infinite Scroll]                 │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Specifications

**Page Container**
- Background: `bg-background`
- Padding: `px-4 md:px-6 lg:px-8`
- Max-width: `max-w-7xl mx-auto`

**Page Header**
- Margin bottom: `mb-6 md:mb-8`
- Title typography: `text-3xl md:text-4xl font-bold leading-tight`
- Upload button: Primary variant, `gap-2` with upload icon

**Filter Pills (Quick Filters)**
- Container: `flex gap-2 flex-wrap`
- Individual pill: `px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-base`
- Active state: `bg-primary-100 text-primary-700 border-2 border-primary-300 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-700`
- Inactive state: `bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground`
- Focus state: `focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2`

**Toolbar**
- Background: `bg-card border border-border`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Shadow: `shadow-sm`
- Layout: `flex flex-col sm:flex-row gap-3 items-stretch sm:items-center`

**Live Sessions Section**
- Background: `bg-status-active-bg border border-status-active-border`
- Padding: `p-6`
- Border radius: `rounded-lg`
- Margin bottom: `mb-6`
- Header icon: `text-status-active` with pulse animation
- Section title: `text-lg font-semibold flex items-center gap-2`

**Session Grid (Default View)**
- Container: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Each card: Uses `SessionCard` component (see below)

**Session List View (Alternative)**
- Container: `flex flex-col gap-3`
- Each item: Horizontal layout variant of `SessionCard`

#### Interaction States

**Filter Pills**
- Hover: Subtle background change + border highlight
- Active: Filled background, bold border
- Focus: Outline ring for keyboard navigation

**Session Cards**
- Hover: Elevation increase (shadow-md → shadow-lg), subtle lift (-translate-y-0.5)
- Active: Slight scale down (scale-[0.995])
- Focus: Ring outline for keyboard navigation

**Empty States**
- No sessions: Illustration + "No sessions yet" message + Upload CTA
- No results: "No sessions match your filters" + Clear filters button
- Loading: Skeleton cards (3-6 items with pulse animation)

---

### 2. Live Session View
**Route:** `/sessions/[id]` (when status = ACTIVE)

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ - Back Button                                              │
│ - Session Title (editable)                                 │
│ - 🟢 Live Indicator (pulsing)                             │
│ - WebSocket Status                                         │
├─────────────────────────────────────────────────────────────┤
│ Session Info Bar (Sticky)                                  │
│ - Participants (avatar stack)                              │
│ - Mode Badge (Round Robin / Reactive / Free-form)         │
│ - Message Count • Token Count • Duration • Cost           │
│ - Actions: Share, Export, Stop Session                    │
├─────────────────────────────────────────────────────────────┤
│ Conversation Thread                                        │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [System Message: Session Started]                    │ │
│ │                                                       │ │
│ │ [MessageBubble - Agent 1]                            │ │
│ │ [MessageBubble - Agent 2]                            │ │
│ │ [MessageBubble - Agent 1]                            │ │
│ │                                                       │ │
│ │ [Typing Indicator - Agent 2] ← Only when active     │ │
│ │                                                       │ │
│ │ [Scroll to Bottom Button] ← Appears when scrolled up │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Specifications

**Header**
- Background: `bg-card border-b border-border`
- Padding: `px-4 md:px-6 py-4`
- Sticky: `sticky top-0 z-sticky`
- Shadow (when scrolled): `shadow-md`
- Layout: `flex items-center gap-4`

**Back Button**
- Icon: Left arrow
- Style: `text-muted-foreground hover:text-foreground transition-colors`
- Size: `w-10 h-10 rounded-full hover:bg-accent`

**Live Indicator**
- Badge: `bg-status-active-bg text-status-active border border-status-active-border`
- Size: `px-3 py-1.5 rounded-full text-sm font-medium`
- Dot: `w-2 h-2 rounded-full bg-status-active mr-2 animate-connection-pulse`
- Text: "Live"

**Session Info Bar**
- Background: `bg-muted border-b border-border`
- Padding: `px-4 md:px-6 py-3`
- Sticky: `sticky top-[73px] z-sticky` (below header)
- Layout: `flex flex-wrap items-center gap-4`

**Participants (Avatar Stack)**
- Container: `flex -space-x-2`
- Each avatar: `AgentAvatar` component, size="sm", `ring-2 ring-background`
- Max visible: 5 avatars, "+N more" indicator for overflow

**Mode Badge**
- Variant: Based on mode
  - Round Robin: `bg-blue-100 text-blue-700 border-blue-200`
  - Reactive: `bg-purple-100 text-purple-700 border-purple-200`
  - Free-form: `bg-green-100 text-green-700 border-green-200`
- Style: `px-2.5 py-1 rounded-full text-xs font-medium border`

**Metrics Display**
- Container: `flex items-center gap-4 text-sm text-muted-foreground`
- Separator: `•` between items
- Format: Icon + Value (e.g., "💬 23 messages", "🪙 1.2K tokens", "⏱ 2m 34s", "💰 $0.12")

**Conversation Thread**
- Container: `max-w-4xl mx-auto px-4 md:px-6 py-6`
- Spacing: `space-y-4`
- Background: `bg-background`

**System Messages**
- Background: `bg-muted border border-border`
- Padding: `px-4 py-3`
- Border radius: `rounded-lg`
- Text: `text-sm text-muted-foreground text-center`
- Icon: `text-muted-foreground mr-2`
- Examples: "Session started", "Agent joined", "Session completed"

**Message Bubbles**
- Uses existing `MessageBubble` component
- Animation: `animate-message-appear` on new messages
- Spacing: `mb-4`

**Typing Indicator**
- Container: `flex items-center gap-3 p-4 rounded-lg bg-muted border border-border`
- Avatar: `AgentAvatar` size="sm"
- Animation: Three dots with staggered pulse
- Text: `text-sm text-muted-foreground` (e.g., "Claude is thinking...")
- Dots: `flex gap-1` with `w-2 h-2 rounded-full bg-muted-foreground` and staggered animations

**Scroll to Bottom Button**
- Position: `fixed bottom-6 right-6 z-fixed`
- Style: `bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-all`
- Icon: Down arrow
- Badge: Show unread message count if > 0
- Animation: Slide up from bottom when appearing

**Auto-Scroll Behavior**
- Default: Auto-scroll enabled when at bottom
- Manual override: Disable auto-scroll when user scrolls up
- Re-enable: Show "New messages" banner at bottom, click to scroll and re-enable
- Indicator: Subtle highlight on new messages (fade in/out)

#### Interaction States

**WebSocket Connection**
- Connected: Green dot, "Connected" text
- Connecting: Amber dot pulsing, "Connecting..." text
- Disconnected: Red dot, "Disconnected" text + Reconnect button

**Message Bubbles**
- Hover: Slight shadow increase, lift
- Focus: Ring outline for keyboard navigation
- Long-press (mobile): Show context menu (Copy, Share)

**Typing Indicator**
- Dots animate in sequence (300ms delay between each)
- Infinite loop while agent is processing

---

### 3. Historical Session View
**Route:** `/sessions/[id]` (when status = COMPLETED, INTERRUPTED, ERROR)

#### Layout Structure
Same as Live Session View, but with the following differences:

**Differences from Live View:**
1. No live indicator badge
2. No typing indicator
3. No WebSocket status
4. No "Scroll to bottom" dynamic behavior (all messages loaded)
5. Shows completion timestamp and final metrics
6. Includes session summary at top
7. Timeline navigation for long sessions

#### Additional Components

**Session Summary Panel** (Top of thread)
- Background: `bg-card border border-border`
- Padding: `p-6`
- Border radius: `rounded-lg`
- Shadow: `shadow-sm`
- Margin bottom: `mb-6`
- Content:
  - Status badge (Completed/Interrupted/Error)
  - Duration: Start → End time with total duration
  - Total metrics: Messages, tokens, cost
  - Participants summary
  - Error message (if status = ERROR)

**Timeline Navigation** (For sessions with 20+ messages)
- Position: `sticky top-[130px] right-0 z-sticky` (sidebar on desktop)
- Background: `bg-card border border-border`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Width: `w-64` on desktop, hidden on mobile (accessible via button)
- Content:
  - Minimap of conversation
  - Clickable agent badges to jump to their messages
  - Timestamp markers (every 5 minutes)
  - Progress indicator showing current scroll position

**Jump to Timestamp**
- Format: Dropdown or input field
- Position: In toolbar
- Behavior: Smooth scroll to specific message by time or index

#### Visual Specifications

**Status Badge Styling (Summary Panel)**
- Completed: `bg-status-completed-bg text-status-completed border-status-completed-border px-4 py-2 rounded-lg text-base font-semibold`
- Interrupted: `bg-status-interrupted-bg text-status-interrupted border-status-interrupted-border`
- Error: `bg-status-error-bg text-status-error border-status-error-border`

**Error Message Display**
- Background: `bg-destructive-bg border border-destructive-border`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Icon: Alert triangle in `text-destructive`
- Text: `text-sm text-destructive-foreground`
- Stack trace: Collapsible, monospace font

**Timeline Navigation**
- Minimap: Vertical list of small agent avatars with connecting lines
- Current position: Highlighted with ring
- Hover: Show message preview tooltip
- Click: Smooth scroll to message

---

### 4. Session Upload View
**Route:** `/sessions/upload`

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ - Back Button                                              │
│ - Title: "Upload Sessions"                                │
├─────────────────────────────────────────────────────────────┤
│ Upload Area                                                │
│ ┌───────────────────────────────────────────────────────┐ │
│ │                                                       │ │
│ │     [Upload Icon]                                    │ │
│ │                                                       │ │
│ │     Drag & drop session files here                   │ │
│ │     or click to browse                               │ │
│ │                                                       │ │
│ │     Supported: .json, .jsonl                         │ │
│ │     Max size: 50MB per file                          │ │
│ │                                                       │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                            │
│ Upload Queue (when files selected)                        │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [FileItem] ✓ Uploaded                                │ │
│ │ [FileItem] [Progress 45%]                            │ │
│ │ [FileItem] ⏳ Pending                                │ │
│ │ [FileItem] ❌ Error: Invalid format                  │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                            │
│ [Upload All Button] [Cancel Button]                       │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Specifications

**Upload Area (Drop Zone)**
- Background: `bg-muted border-2 border-dashed border-border`
- Padding: `p-12 md:p-16`
- Border radius: `rounded-lg`
- Min height: `min-h-[400px]`
- Layout: `flex flex-col items-center justify-center text-center`
- Hover state: `border-primary-400 bg-primary-50 dark:bg-primary-950/20`
- Active state (dragging): `border-primary-600 bg-primary-100 dark:bg-primary-900/30 scale-[1.02]`
- Transition: `transition-all duration-base`

**Upload Icon**
- Size: `w-16 h-16`
- Color: `text-muted-foreground`
- Margin bottom: `mb-4`

**Upload Text**
- Primary text: `text-lg font-semibold mb-2`
- Secondary text: `text-sm text-muted-foreground`
- File specs: `text-xs text-muted-foreground mt-4`

**Upload Queue**
- Container: `space-y-3 mt-6`
- Max height: `max-h-96 overflow-y-auto`
- Padding: `p-4 bg-card border border-border rounded-lg`

**File Item**
- Layout: `flex items-center gap-4 p-3 rounded-lg bg-muted`
- Icon: File icon based on status
  - Pending: Clock icon
  - Uploading: Spinner animation
  - Success: Check icon in green
  - Error: X icon in red
- File name: `text-sm font-medium truncate flex-1`
- Progress bar: `h-2 rounded-full bg-background overflow-hidden`
  - Fill: `bg-primary-600 h-full transition-all duration-slow`
- Status text: `text-xs text-muted-foreground`
- Remove button: `text-muted-foreground hover:text-destructive`

**Progress Bar**
- Container: `w-full h-2 bg-muted rounded-full overflow-hidden`
- Fill: `bg-primary-600 h-full transition-all duration-slow`
- Style: Smooth animated transition

**Success State**
- Icon: Checkmark in circle
- Background: `bg-success-bg`
- Border: `border-success-border`
- Text: `text-success`

**Error State**
- Icon: X in circle
- Background: `bg-destructive-bg`
- Border: `border-destructive-border`
- Text: `text-destructive`
- Error message: Below file name, `text-xs text-destructive`
- Retry button: Available for failed uploads

**Action Buttons**
- Upload All: `bg-primary-600 text-white hover:bg-primary-700` (disabled when queue empty)
- Cancel: `bg-muted text-foreground hover:bg-accent` (clears queue)

#### Interaction States

**Drop Zone**
- Idle: Dashed border, muted colors
- Hover: Solid border, highlighted background
- Drag over: Bright border, emphasized background, scale up slightly
- Disabled: Grayed out, cursor not-allowed

**File Upload Flow**
1. User selects/drops files
2. Files validated (format, size)
3. Invalid files shown with error immediately
4. Valid files queued
5. User clicks "Upload All"
6. Files upload sequentially with progress
7. Success/error feedback per file
8. Success notification when complete

**Bulk Operations**
- Select all checkbox
- Remove selected button
- Retry failed button

---

## Component Specifications

### SessionCard Component
**Purpose:** Display session summary in list/grid views

#### Props
```typescript
interface SessionCardProps {
  session: {
    id: string;
    name: string;
    status: ConversationStatus;
    mode: OrchestratorMode;
    startedAt: Date;
    completedAt?: Date;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    totalDuration: number;
    participants: Array<{
      agentType: string;
      agentName: string;
    }>;
    initialPrompt: string;
  };
  variant?: 'grid' | 'list';
  showLiveBadge?: boolean;
  onClick?: () => void;
}
```

#### Grid Variant Layout
```
┌─────────────────────────────────────────┐
│ 🟢 LIVE (if active)                    │
│                                         │
│ [Avatar] [Avatar] [Avatar] +2          │
│                                         │
│ Session Name                            │
│ Round Robin • 23 messages               │
│                                         │
│ "Initial prompt preview text that      │
│  gets truncated after two lines..."    │
│                                         │
│ ─────────────────────────────────────── │
│ 2m 34s • 1.2K tokens • $0.12           │
│                              [Badge]    │
└─────────────────────────────────────────┘
```

#### Visual Specifications - Grid

**Card Container**
- Background: `bg-card`
- Border: `border border-border`
- Border radius: `rounded-lg`
- Padding: `p-5`
- Shadow: `shadow-sm hover:shadow-lg`
- Transition: `transition-all duration-base`
- Hover: `hover:border-border-strong hover:-translate-y-1`
- Focus: `focus-visible:outline-2 focus-visible:outline-ring`

**Live Badge** (Conditional)
- Position: `absolute -top-2 -right-2`
- Style: `bg-status-active text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md`
- Animation: `animate-connection-pulse`

**Avatar Stack**
- Container: `flex -space-x-3 mb-4`
- Avatars: `AgentAvatar` size="md", `ring-2 ring-card`
- Overflow indicator: `w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center text-xs font-semibold`

**Session Name**
- Typography: `text-base font-semibold leading-snug mb-2`
- Truncate: `truncate`
- Color: `text-foreground`

**Metadata Row**
- Layout: `flex items-center gap-2 text-sm text-muted-foreground mb-3`
- Mode badge: Small badge with mode name
- Separator: `•`

**Preview Text**
- Typography: `text-sm text-muted-foreground leading-relaxed`
- Line clamp: `line-clamp-2`
- Min height: `min-h-[2.5rem]` (preserve space even if empty)

**Divider**
- Style: `border-t border-border my-3`

**Footer Metrics**
- Layout: `flex items-center justify-between`
- Metrics: `flex items-center gap-3 text-xs text-muted-foreground`
- Format: Duration • Tokens • Cost

**Status Badge**
- Variant: Based on status (uses Badge component)
- Size: `text-xs`

#### List Variant Layout
```
┌────────────────────────────────────────────────────────────────┐
│ [Avatar] [Avatar]  Session Name            🟢 LIVE  [Badge]   │
│       +2           Round Robin • 23 messages                    │
│                    2m 34s • 1.2K tokens • $0.12                │
│                    Started 5 minutes ago                        │
└────────────────────────────────────────────────────────────────┘
```

#### Visual Specifications - List

**Card Container**
- Layout: `flex items-center gap-4 p-4`
- All other properties same as grid variant

**Avatar Stack**
- Horizontal, no margin bottom
- Fixed width: `w-24`

**Content Section**
- Flex: `flex-1 min-w-0`
- Session name: `text-base font-semibold truncate`
- Metadata: Single line with separators

**Right Section**
- Layout: `flex items-center gap-3`
- Live badge + Status badge aligned

#### States

**Default**
- Standard styling as specified above

**Hover**
- Elevation increase
- Border highlight
- Subtle upward movement

**Focus**
- Visible focus ring
- Same hover effects

**Active (Clicked)**
- Slight scale down
- Immediate navigation

**Loading (Skeleton)**
- Replace all text with gray bars
- Avatars replaced with gray circles
- Pulse animation

---

### MessageList Component
**Purpose:** Display conversation thread with real-time updates

#### Props
```typescript
interface MessageListProps {
  conversationId: string;
  messages: Message[];
  isLive: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}
```

#### Layout
```
┌─────────────────────────────────────────┐
│ [System: Session Started]              │
│                                         │
│ [MessageBubble - Agent 1]              │
│ [MessageBubble - Agent 2]              │
│ [MessageBubble - Agent 1]              │
│                                         │
│ [Load More Button] (if historical)     │
│                                         │
│ [Typing Indicator] (if live)           │
│                                         │
│ [Scroll Anchor] (auto-scroll target)   │
└─────────────────────────────────────────┘
```

#### Visual Specifications

**Container**
- Max width: `max-w-4xl mx-auto`
- Padding: `px-4 md:px-6 py-6`
- Spacing: `space-y-4`

**Message Grouping**
- Same agent messages within 2 minutes: Reduce spacing to `space-y-2`
- Different agents: Standard spacing `space-y-4`
- System messages: Distinct styling, centered

**Load More Button**
- Style: `text-primary-600 hover:text-primary-700 text-sm font-medium mx-auto block`
- Padding: `px-4 py-2`
- Border: `border border-border rounded-lg hover:bg-accent`

**Scroll Anchor**
- Invisible div at bottom
- Used for auto-scroll functionality
- `ref` for scroll behavior

**Virtualization** (Performance)
- For sessions with 100+ messages
- Use react-window or similar
- Render only visible messages + buffer
- Preserve scroll position on updates

---

### TypingIndicator Component
**Purpose:** Show when an agent is processing

#### Props
```typescript
interface TypingIndicatorProps {
  agentType: AgentType;
  agentName: string;
  className?: string;
}
```

#### Layout
```
┌─────────────────────────────────────────┐
│ [Avatar] Agent Name is thinking...     │
│          ● ● ●  (animated dots)        │
└─────────────────────────────────────────┘
```

#### Visual Specifications

**Container**
- Background: `bg-muted border border-border`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Layout: `flex items-start gap-3`
- Animation: `animate-message-appear` on mount

**Avatar**
- Size: `sm`
- Aligned top

**Content**
- Layout: `flex flex-col gap-2`

**Text**
- Typography: `text-sm text-muted-foreground`
- Content: `{agentName} is thinking...`

**Dots Animation**
- Container: `flex gap-1.5`
- Each dot: `w-2 h-2 rounded-full bg-muted-foreground`
- Animation: Staggered pulse (0ms, 300ms, 600ms delays)

**Dot Animation Keyframes**
```css
@keyframes dot-pulse {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}
```

---

### SessionFilters Component
**Purpose:** Advanced filtering for session list

#### Props
```typescript
interface SessionFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClear: () => void;
}
```

#### Layout (Popover/Dropdown)
```
┌─────────────────────────────────────────┐
│ Filters                            [X]  │
│ ─────────────────────────────────────── │
│                                         │
│ Status                                  │
│ □ Active  □ Completed  □ Error         │
│                                         │
│ Agent Types                             │
│ □ Claude  □ GPT  □ Gemini  □ All      │
│                                         │
│ Date Range                              │
│ [Start Date] → [End Date]              │
│                                         │
│ Cost Range                              │
│ $[Min] → $[Max]                        │
│                                         │
│ Token Range                             │
│ [Min] → [Max]                          │
│                                         │
│ ─────────────────────────────────────── │
│ [Clear All]           [Apply Filters]  │
└─────────────────────────────────────────┘
```

#### Visual Specifications

**Popover Container**
- Background: `bg-card border border-border`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Shadow: `shadow-lg`
- Width: `w-80`
- Z-index: `z-popover`

**Section**
- Margin bottom: `mb-4`
- Label: `text-sm font-semibold mb-2`

**Checkboxes**
- Layout: `flex flex-wrap gap-2`
- Style: Uses custom checkbox component
- Label: `text-sm`

**Date Inputs**
- Layout: `flex items-center gap-2`
- Input: Standard input component
- Arrow: `→` separator

**Range Inputs**
- Layout: `flex items-center gap-2`
- Min/Max: Number inputs
- Arrow: `→` separator

**Footer Buttons**
- Clear All: Secondary variant
- Apply: Primary variant
- Layout: `flex justify-between`

---

### SessionMetrics Component
**Purpose:** Display session statistics

#### Props
```typescript
interface SessionMetricsProps {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number; // milliseconds
  participants: number;
  variant?: 'compact' | 'detailed';
}
```

#### Compact Variant
```
23 messages • 1.2K tokens • $0.12 • 2m 34s
```

#### Detailed Variant
```
┌─────────────────────────────────────────┐
│ [Icon] Messages          23            │
│ [Icon] Tokens            1,234         │
│ [Icon] Cost              $0.1234       │
│ [Icon] Duration          2m 34s        │
│ [Icon] Participants      3 agents      │
└─────────────────────────────────────────┘
```

#### Visual Specifications - Compact

**Container**
- Layout: `flex items-center gap-4 text-sm text-muted-foreground`
- Separator: `•` between items

**Format**
- Messages: `{count} messages`
- Tokens: `{formatted}` (1K, 1.2M, etc.)
- Cost: `${amount}` (2-4 decimal places)
- Duration: `{mm}m {ss}s` or `{hh}h {mm}m`

#### Visual Specifications - Detailed

**Container**
- Background: `bg-card border border-border`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Layout: `grid grid-cols-2 md:grid-cols-5 gap-4`

**Metric Item**
- Layout: `flex flex-col gap-1`
- Icon: `text-muted-foreground w-5 h-5`
- Label: `text-xs text-muted-foreground`
- Value: `text-lg font-semibold`

---

## User Flows

### Flow 1: Viewing a Live Session

**Entry Point:** User receives notification of new live session or navigates to Sessions page

**Steps:**
1. User sees live session highlighted in "Active Sessions" section
   - Visual: Green background, pulsing dot, "LIVE" badge
2. User clicks on live session card
   - Interaction: Card scales down slightly, then navigates
3. Session detail view loads with WebSocket connection
   - Visual: Connection status indicator appears in header
4. Messages stream in real-time
   - Animation: Each new message slides up with fade-in
   - Auto-scroll: Page automatically scrolls to bottom
5. User scrolls up to read previous messages
   - Behavior: Auto-scroll disables
   - Indicator: "New messages" banner appears at bottom
6. User clicks "New messages" banner
   - Behavior: Smooth scroll to bottom, auto-scroll re-enabled
7. Session completes
   - Visual: Live badge changes to "Completed" badge
   - Notification: Success toast appears
   - Metrics: Final totals update

**Exit Points:**
- Navigate back to session list
- Session completes naturally
- User closes tab/browser

**Edge Cases:**
- Connection lost: Show reconnecting indicator, retry logic
- Connection failed: Show error state, manual reconnect button
- No messages yet: Show "Waiting for first message..." empty state

---

### Flow 2: Browsing Historical Sessions

**Entry Point:** User navigates to /sessions

**Steps:**
1. Sessions list loads with most recent sessions
   - Visual: Skeleton cards → populated cards
2. User scrolls through sessions
   - Behavior: Infinite scroll loads more (or pagination)
3. User applies filters
   - Interaction: Opens filter popover
   - Selection: Checkboxes for status, agents, etc.
   - Visual: Active filters shown as pills below search
4. Filtered results update
   - Animation: Fade out old cards, fade in new cards
   - Empty state: If no results, show "No matches" message
5. User clicks on session card
   - Interaction: Navigate to session detail
6. Historical session view loads
   - Visual: All messages loaded at once
   - Summary: Session summary panel at top
7. User scrolls through conversation
   - For long sessions: Timeline navigation appears
8. User clicks agent in timeline
   - Behavior: Jump to that agent's messages

**Exit Points:**
- Navigate back to list
- Navigate to another session
- User closes tab

**Edge Cases:**
- No sessions exist: Show empty state with upload CTA
- Session load error: Show error message, retry button
- Very long session (1000+ messages): Virtualized list, performance optimization

---

### Flow 3: Uploading Historical Sessions

**Entry Point:** User clicks "Upload" button on sessions list or navigates to /sessions/upload

**Steps:**
1. Upload page loads
   - Visual: Large drop zone prominently displayed
2. User drags session file over drop zone
   - Interaction: Drop zone highlights with border color change
3. User drops file
   - Validation: File type and size checked immediately
   - Visual: File appears in queue with "Pending" status
4. User adds more files (optional)
   - Multiple files queue up
5. User clicks "Upload All"
   - Visual: Progress bars appear for each file
   - Animation: Upload progress animates smoothly
6. Files upload sequentially
   - Success: Green checkmark, "Uploaded" status
   - Error: Red X, error message, "Retry" button
7. All files complete
   - Notification: Success toast with count
   - CTA: "View uploaded sessions" button

**Exit Points:**
- Upload completes, navigate to sessions
- User cancels upload mid-process
- User navigates away (confirmation dialog if uploads in progress)

**Edge Cases:**
- Invalid file format: Immediate error, file rejected
- File too large: Immediate error, file rejected
- Network error during upload: Retry logic, manual retry button
- Duplicate session: Warning message, "Replace" or "Keep both" options
- Malformed JSON: Validation error with specific details

---

### Flow 4: Searching Sessions

**Entry Point:** User enters text in search input

**Steps:**
1. User types in search field
   - Behavior: Debounced search (300ms delay)
2. Search executes
   - Visual: Loading indicator in search input
3. Results update
   - Animation: Smooth transition
   - Highlight: Search terms highlighted in results
4. User clears search
   - Interaction: X button in search field
   - Behavior: Return to unfiltered view

**Search Scope:**
- Session names
- Initial prompts
- Agent names
- Agent types

**Empty State:**
- Message: "No sessions match '{query}'"
- CTA: "Clear search" button

---

## Responsive Behavior

### Desktop (1024px+)

**Session List**
- Grid: 3 columns
- Sidebar: Permanent filters sidebar (optional design)
- Toolbar: All controls in single row

**Session Detail**
- Timeline navigation: Fixed sidebar on right
- Content: Centered with max-width
- Metrics: Full row display

**Upload**
- Drop zone: Large and prominent
- Queue: Side-by-side layout

### Tablet (768px - 1023px)

**Session List**
- Grid: 2 columns
- Toolbar: Wraps to two rows if needed
- Filters: Dropdown/popover

**Session Detail**
- Timeline navigation: Collapsible overlay
- Content: Full width with padding
- Metrics: Wrap to 2 rows

**Upload**
- Drop zone: Full width
- Queue: Stacked layout

### Mobile (< 768px)

**Session List**
- Grid: 1 column (or switch to list view)
- Toolbar: Stacks vertically
- Search: Full width
- Filters: Bottom sheet modal

**Session Detail**
- Header: Collapses to single row with dropdown menu
- Info bar: Wraps metrics to multiple rows
- Timeline: Bottom sheet modal
- Scroll to bottom button: Bottom right, slightly larger

**Upload**
- Drop zone: Reduced padding, smaller text
- Queue: Full width cards
- Buttons: Full width, stacked

### Breakpoint Strategy
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Mobile-first approach: Base styles for mobile, enhance for larger screens
- Touch targets: Minimum 44x44px on mobile
- Font sizes: Slightly larger on mobile for readability

---

## Real-Time Update Patterns

### WebSocket Integration

**Connection Management**
```typescript
// Connection states
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Event handling
socket.on('message.created', (event: MessageCreatedEvent) => {
  // Add message to conversation
  // Animate appearance
  // Auto-scroll if enabled
});

socket.on('conversation.completed', (event: ConversationCompletedEvent) => {
  // Update session status
  // Show completion notification
  // Update metrics
});
```

**Optimistic Updates**
- Add messages immediately to UI
- Show pending state (lighter opacity)
- Confirm with server response
- Rollback on error

**Reconnection Strategy**
1. Connection lost: Show "Reconnecting..." indicator
2. Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
3. Max retries: 10 attempts
4. Manual reconnect: Button after max retries
5. Resume: Fetch missed messages on reconnect

### Animation Patterns

**New Message Animation**
```css
@keyframes message-appear {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
/* Duration: 300ms, ease-out */
```

**Status Change Animation**
- Badge: Cross-fade between states (200ms)
- Metrics: Count-up animation for numbers (500ms)
- Connection dot: Pulse animation for active states

**Skeleton Loading**
```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
/* Duration: 2s, ease-in-out, infinite */
```

### Performance Optimizations

**Message List Virtualization**
- Use `react-window` or `react-virtual`
- Render only visible messages + 10 item buffer
- Implement dynamic row heights
- Preserve scroll position on updates

**Debouncing & Throttling**
- Search input: Debounce 300ms
- Scroll events: Throttle 100ms
- WebSocket messages: Batch updates every 100ms if burst

**Code Splitting**
- Session detail view: Separate chunk
- Upload page: Separate chunk
- Filter components: Lazy load

**Image Optimization**
- Agent avatars: SVG or optimized PNGs
- Lazy load: Off-screen session cards
- Responsive images: Multiple sizes for different screens

---

## Accessibility

### Keyboard Navigation

**Session List**
- Tab order: Search → Filters → Session cards
- Enter/Space: Open session
- Arrow keys: Navigate between cards (optional enhancement)
- Escape: Clear search or close filters

**Session Detail**
- Tab order: Back → Header actions → Messages → Scroll to bottom
- Enter/Space: Activate buttons
- Escape: Close modals/overlays

**Upload**
- Tab order: Drop zone → File queue → Action buttons
- Enter: Open file picker (on drop zone)
- Delete: Remove file from queue (when focused)

### Screen Reader Support

**Landmarks**
- `<header>`: Main header
- `<nav>`: Navigation
- `<main>`: Primary content
- `<aside>`: Sidebars, filters
- `<footer>`: Page footer

**ARIA Labels**
- Live regions: `aria-live="polite"` for new messages
- Status indicators: `aria-label="Connection status: Connected"`
- Session cards: `aria-label="Session: {name}, {status}, {time}"`
- Buttons: Clear, descriptive labels

**Dynamic Content**
- Announce new messages: `aria-live="polite"` region
- Status changes: `aria-atomic="true"` for complete updates
- Loading states: `aria-busy="true"` during operations

### Focus Management

**Focus Indicators**
- Visible outline: `focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2`
- Color: `--color-ring` (primary blue)
- Never remove focus styles

**Focus Trapping**
- Modals: Trap focus within modal
- Dropdowns: Return focus to trigger on close
- Forms: Focus first invalid field on error

**Skip Links**
- "Skip to main content" link at top
- Hidden until focused
- Position: `sr-only focus:not-sr-only`

### Color Contrast

**WCAG AA Compliance (4.5:1)**
- Text on background: Verified ratios
- Agent colors: Sufficient contrast on light/dark modes
- Status colors: High contrast variants
- Disabled states: Reduced but still readable (3:1 minimum)

**Color Blindness**
- Don't rely on color alone
- Use icons + text for status
- Patterns or shapes for agent differentiation
- Test with color blindness simulators

### Touch Targets

**Minimum Size: 44x44px**
- Buttons: At least 44x44px
- Links: Adequate padding
- Interactive cards: Full card clickable
- Spacing: Minimum 8px between targets

---

## Implementation Notes

### Component Architecture

**Server Components (Default)**
- Session list page
- Session detail page (initial load)
- Upload page

**Client Components**
- Real-time message list
- WebSocket status
- Filter controls
- Upload drag & drop
- Interactive elements

### Data Fetching Strategy

**Initial Load**
- Server-side: Fetch initial sessions (first 20)
- Streaming: Use React Server Components streaming for fast initial paint

**Pagination**
- Cursor-based pagination for infinite scroll
- Load 20 sessions per page
- Prefetch next page when 80% scrolled

**Real-Time Updates**
- WebSocket connection on session detail
- Optimistic UI updates
- Server-side events for cross-tab synchronization

### State Management

**Recommended Approach**
- React Context for global state (WebSocket connection)
- URL state for filters (searchParams)
- Local state for UI (modals, dropdowns)
- React Query/SWR for server state caching

**State Structure**
```typescript
interface SessionsState {
  sessions: ConversationSummary[];
  filters: SearchFilters;
  sort: SortOptions;
  view: 'grid' | 'list';
}

interface SessionDetailState {
  session: Conversation;
  messages: Message[];
  connectionStatus: ConnectionStatus;
  autoScroll: boolean;
  typingAgent: string | null;
}
```

### Performance Targets

**Metrics**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

**Bundle Size**
- Initial JS: < 150KB gzipped
- Session detail chunk: < 50KB gzipped
- Upload chunk: < 30KB gzipped

**Runtime Performance**
- Scroll FPS: 60fps
- Message render: < 16ms per message
- Filter update: < 100ms

### Testing Checklist

**Visual Testing**
- Light mode
- Dark mode
- All status states
- All agent types
- Empty states
- Error states
- Loading states
- Responsive breakpoints

**Interaction Testing**
- Click all buttons
- Submit all forms
- Test keyboard navigation
- Test screen reader
- Test touch gestures (mobile)
- Test drag & drop (upload)

**Edge Cases**
- Very long session names
- Sessions with 1000+ messages
- Sessions with 10+ participants
- No network connection
- Slow network (throttle to 3G)
- WebSocket disconnections
- Malformed data

**Browser Support**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android 10+)

---

## Visual Design Examples

### Color Usage Matrix

| Element | Light Mode | Dark Mode | Purpose |
|---------|-----------|-----------|---------|
| Live session bg | `bg-status-active-bg` | `bg-status-active-bg` | Highlight active |
| Completed badge | `bg-status-completed` | `bg-status-completed` | Status indicator |
| Error state | `bg-status-error-bg` | `bg-status-error-bg` | Alert user |
| Message bubble (Claude) | `bg-agent-claude-bg` | `bg-agent-claude-bg` | Agent identity |
| Message bubble (GPT) | `bg-agent-gpt-bg` | `bg-agent-gpt-bg` | Agent identity |
| Hover state | `hover:bg-accent` | `hover:bg-accent` | Interactivity |
| Focus ring | `outline-ring` | `outline-ring` | Keyboard nav |

### Typography Scale

| Element | Desktop | Mobile | Weight | Line Height |
|---------|---------|--------|--------|-------------|
| Page title | `text-4xl` (36px) | `text-3xl` (30px) | `font-bold` (700) | `leading-tight` (1.25) |
| Section title | `text-2xl` (24px) | `text-xl` (20px) | `font-semibold` (600) | `leading-snug` (1.375) |
| Card title | `text-base` (16px) | `text-base` (16px) | `font-semibold` (600) | `leading-snug` (1.375) |
| Body text | `text-sm` (14px) | `text-sm` (14px) | `font-normal` (400) | `leading-relaxed` (1.625) |
| Caption | `text-xs` (12px) | `text-xs` (12px) | `font-medium` (500) | `leading-normal` (1.5) |
| Code | `text-sm` (14px) | `text-xs` (12px) | `font-mono` | `leading-normal` (1.5) |

### Spacing System

| Context | Gap/Padding | Margin |
|---------|------------|--------|
| Between cards | `gap-4` (1rem) | - |
| Card padding | `p-5` (1.25rem) | - |
| Section spacing | - | `mb-8` (2rem) |
| Component internal | `gap-3` (0.75rem) | - |
| Tight groups | `gap-2` (0.5rem) | - |
| Page margins | `px-4 md:px-6 lg:px-8` | - |

---

## Conclusion

This design specification provides a comprehensive blueprint for implementing the AgentPipe Web session viewing interface. The design prioritizes:

1. **Clarity** - Clear visual hierarchy and information architecture
2. **Responsiveness** - Adaptive layouts for all device sizes
3. **Performance** - Optimized for real-time updates and large datasets
4. **Accessibility** - WCAG AA compliant with full keyboard navigation
5. **Consistency** - Aligned with existing design system and components

### Next Steps for Implementation

1. **Phase 1: Core List & Detail Views**
   - Implement SessionCard component
   - Build session list page with filtering
   - Create historical session detail view
   - Add basic search functionality

2. **Phase 2: Real-Time Features**
   - Integrate WebSocket connection
   - Implement live session view
   - Add typing indicators and auto-scroll
   - Build connection status monitoring

3. **Phase 3: Upload & Advanced Features**
   - Create upload interface
   - Implement drag & drop
   - Add timeline navigation
   - Build advanced filtering

4. **Phase 4: Polish & Optimization**
   - Performance optimization (virtualization)
   - Accessibility audit
   - Animation refinement
   - Cross-browser testing

### File Paths & Components

**New Component Files to Create:**
- `/app/components/session/SessionCard.tsx`
- `/app/components/session/MessageList.tsx`
- `/app/components/session/TypingIndicator.tsx`
- `/app/components/session/SessionFilters.tsx`
- `/app/components/session/SessionMetrics.tsx`
- `/app/components/session/SessionSummary.tsx`
- `/app/components/session/TimelineNavigation.tsx`
- `/app/components/upload/UploadZone.tsx`
- `/app/components/upload/FileQueue.tsx`

**New Page Files to Create:**
- `/app/sessions/page.tsx` (Session list)
- `/app/sessions/[id]/page.tsx` (Session detail)
- `/app/sessions/upload/page.tsx` (Upload interface)

**API Routes:**
- `/app/api/sessions/route.ts` (List, search, filter)
- `/app/api/sessions/[id]/route.ts` (Get session)
- `/app/api/sessions/upload/route.ts` (Upload handler)
- `/app/api/ws/route.ts` (WebSocket connection)

This specification should provide all the information needed to implement a production-ready session viewing interface that delivers an excellent user experience for both real-time and historical AgentPipe sessions.
