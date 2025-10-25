# AgentPipe Web Component Relationships

This document visualizes the relationships between components in the AgentPipe Web design system, particularly focusing on the new Agent-focused components.

---

## Component Hierarchy

### Agent Components

```
AgentsPageClient (Master Layout)
├── Summary Stats Grid
│   └── 4× Stat Cards (Agent count, Conversations, Tokens, Cost)
│
├── Agent Cards Grid (Left Column, 2/3 width)
│   ├── Commercial Category Section
│   │   └── AgentCard (×7) ──┐
│   │       ├── AgentAvatar    │
│   │       ├── Agent Name     │
│   │       ├── Tagline        │
│   │       └── Stats Grid     │
│   │           ├── Conversations│
│   │           ├── Messages    │  Selection State
│   │           └── Tokens      │  ─────────────►
│   │                           │
│   └── Open Source Category    │
│       └── AgentCard (×7) ─────┘
│
└── Agent Details Panel (Right Column, 1/3 width, Sticky)
    └── AgentDetails
        ├── Header (Fixed)
        │   ├── AgentAvatar (lg)
        │   ├── Agent Name
        │   ├── Official Name
        │   └── Close Button (Mobile)
        │
        └── Content (Scrollable)
            ├── Tagline
            ├── About Section
            ├── Provider & Category Grid
            ├── Models List
            ├── Statistics Card
            │   ├── Primary Stats (Conversations, Messages)
            │   ├── Secondary Stats (Tokens, Cost)
            │   └── Detailed Stats (Averages, Last Activity)
            │
            └── External Links
                ├── Website Button
                ├── GitHub Button
                └── Documentation Button
```

---

## Conversation Components

```
ConversationCard
├── Header Section
│   ├── Title (Conversation Prompt) ──────┐
│   ├── Status Indicator                  │ Left: Info
│   │   ├── StatusDot                     │
│   │   └── Status Label                  │
│   │                                      │
│   └── Agent Avatars ────────────────────┘ Right: Agents
│       ├── AgentAvatar (×3 max)
│       └── +N Badge (if more)
│
├── Content Section
│   ├── AI Summary (Conditional)
│   │   ├── Sparkle Icon
│   │   ├── "AI Summary" Label
│   │   └── Summary Text (Markdown)
│   │
│   └── Preview Text (Fallback)
│
└── Footer Section
    ├── Last Activity Time
    ├── Message Count Badge
    ├── Token Count Badge
    └── Status Badge
```

---

## Base UI Components

```
Component Library Structure
├── Agent Components (/app/components/agent/)
│   ├── AgentAvatar
│   │   ├── Sizes: xs, sm, md, lg, xl
│   │   ├── 14 Agent Types
│   │   └── Color Mapping
│   │
│   ├── AgentBadge
│   │   ├── Color Dot
│   │   └── Label Text
│   │
│   ├── AgentCard (NEW)
│   ├── AgentDetails (NEW)
│   └── AgentsPageClient (NEW)
│
├── UI Components (/app/components/ui/)
│   ├── Card
│   │   ├── CardHeader
│   │   ├── CardTitle
│   │   ├── CardDescription
│   │   └── CardFooter
│   │
│   ├── Button
│   │   ├── Variants: primary, secondary, ghost, outline, destructive
│   │   └── Sizes: xs, sm, md, lg
│   │
│   └── Badge
│       ├── Variants: default, primary, success, error, warning, info
│       └── Sizes: default, lg
│
├── Status Components (/app/components/status/)
│   └── StatusDot
│       ├── States: active, completed, error, interrupted, pending
│       ├── Sizes: default, lg
│       └── Pulse Animation (optional)
│
└── Conversation Components (/app/components/conversation/)
    └── ConversationCard (UPDATED)
```

---

## Data Flow Diagram

```
Server (Page Component)
│
│ Fetch Agent Data + Stats
│
▼
AgentsPageClient
│
├─ Manages Selection State ─────────────┐
│  const [selectedId, setSelectedId]    │
│                                        │
├─ Agent Cards Grid ◄───────────────────┤
│  │                                     │
│  └─ AgentCard                          │
│     │                                  │
│     ├─ Props:                          │
│     │  • agent (metadata + stats)     │
│     │  • isSelected (computed)        │
│     │  • onClick (sets selectedId) ───┘
│     │
│     └─ Displays:
│        • AgentAvatar
│        • Name, Tagline
│        • Stats (Conversations, Messages, Tokens)
│
└─ Agent Details Panel
   │
   └─ AgentDetails
      │
      ├─ Props:
      │  • agent (computed from selectedId)
      │  • onClose (clears selectedId, mobile)
      │
      └─ Displays:
         • Full agent information
         • Statistics
         • External links
```

---

## State Management Flow

```
User Interaction Flow
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. User clicks AgentCard                               │
│     │                                                   │
│     ▼                                                   │
│  2. onClick={() => setSelectedId(agent.id)}             │
│     │                                                   │
│     ▼                                                   │
│  3. State Update: selectedId = 'claude'                 │
│     │                                                   │
│     ├──────────────────────┬─────────────────────────┐  │
│     ▼                      ▼                         ▼  │
│  4a. AgentCard           4b. AgentDetails       4c. URL │
│      Re-renders              Re-renders          (future)│
│      │                      │                         │  │
│      • isSelected =         • agent =                │  │
│        (id === 'claude')      agents.find(...)       │  │
│      • Ring + Border        • Shows details          │  │
│      • Shadow-lg            • Scrolls to top         │  │
│                                                         │
└─────────────────────────────────────────────────────────┘

Mobile vs Desktop Behavior
┌──────────────────────┬──────────────────────┐
│ Mobile (< lg)        │ Desktop (≥ lg)       │
├──────────────────────┼──────────────────────┤
│ • Cards: Full width  │ • Cards: 2 columns   │
│ • Details: Overlay   │ • Details: Sticky    │
│ • Close button       │ • No close button    │
│ • Full screen        │ • Side panel         │
└──────────────────────┴──────────────────────┘
```

---

## Responsive Layout Breakdown

### Mobile Layout (< 1024px)

```
┌─────────────────────────────────────┐
│          Page Header                │
├─────────────────────────────────────┤
│         Summary Stats               │
│  ┌──────┐ ┌──────┐                  │
│  │Agents│ │Convos│                  │
│  └──────┘ └──────┘                  │
│  ┌──────┐ ┌──────┐                  │
│  │Tokens│ │ Cost │                  │
│  └──────┘ └──────┘                  │
├─────────────────────────────────────┤
│   Commercial Agents (Category)      │
├─────────────────────────────────────┤
│   ┌───────────────────────────┐     │
│   │      AgentCard (1)        │     │
│   └───────────────────────────┘     │
│   ┌───────────────────────────┐     │
│   │      AgentCard (2)        │     │
│   └───────────────────────────┘     │
│                                     │
│   ... more cards ...                │
│                                     │
├─────────────────────────────────────┤
│   Open Source Agents (Category)     │
├─────────────────────────────────────┤
│   ┌───────────────────────────┐     │
│   │      AgentCard (8)        │     │
│   └───────────────────────────┘     │
│                                     │
│   ... more cards ...                │
│                                     │
└─────────────────────────────────────┘

When Agent Selected:
┌─────────────────────────────────────┐
│  [X]  AgentDetails (Full Screen)    │
│                                     │
│  Fixed Header                       │
│  ─────────────────────────────      │
│                                     │
│  Scrollable Content                 │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### Desktop Layout (≥ 1024px)

```
┌───────────────────────────────────────────────────────────────┐
│                        Page Header                            │
├───────────────────────────────────────────────────────────────┤
│              Summary Stats (4 columns)                        │
│   ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐                 │
│   │Agents │  │Convos │  │Tokens │  │ Cost  │                 │
│   └───────┘  └───────┘  └───────┘  └───────┘                 │
├────────────────────────────────────┬──────────────────────────┤
│                                    │                          │
│   Commercial Agents                │   AgentDetails           │
│  ┌──────────┐  ┌──────────┐        │  ┌────────────────────┐ │
│  │  Card 1  │  │  Card 2  │        │  │   Fixed Header     │ │
│  └──────────┘  └──────────┘        │  ├────────────────────┤ │
│  ┌──────────┐  ┌──────────┐        │  │                    │ │
│  │  Card 3  │  │  Card 4  │        │  │  Scrollable        │ │
│  └──────────┘  └──────────┘        │  │  Content           │ │
│  ┌──────────┐  ┌──────────┐        │  │                    │ │
│  │  Card 5  │  │  Card 6  │        │  │  • About           │ │
│  └──────────┘  └──────────┘        │  │  • Stats           │ │
│  ┌──────────┐                      │  │  • Links           │ │
│  │  Card 7  │                      │  │                    │ │
│  └──────────┘                      │  │                    │ │
│                                    │  └────────────────────┘ │
│   Open Source Agents               │      (Sticky: top-8)    │
│  ┌──────────┐  ┌──────────┐        │                          │
│  │  Card 8  │  │  Card 9  │        │                          │
│  └──────────┘  └──────────┘        │                          │
│  ... more cards ...                │                          │
│                                    │                          │
└────────────────────────────────────┴──────────────────────────┘
     2/3 width (lg:col-span-2)            1/3 width (lg:col-span-1)
```

---

## Color Theming System

### Agent Color Application

Each agent has a consistent color scheme applied across components:

```
Agent: Claude (#cc785c - copper)
│
├─ AgentAvatar
│  ├─ Background: bg-agent-claude-bg (#fef3f0 light)
│  ├─ Text: text-agent-claude (#cc785c)
│  ├─ Border: border-agent-claude-border (#f4d7cc)
│  └─ Hover: hover:bg-agent-claude-border
│
├─ AgentCard
│  └─ Shadow: shadow-agent-claude (0 4px 12px rgba(204,120,92,0.25))
│
├─ ConversationCard
│  ├─ Shadow: shadow-agent-claude
│  └─ Hover BG Tint: var(--agent-claude) at 5% opacity
│
└─ AgentBadge
   ├─ Background: bg-agent-claude-bg
   ├─ Text: text-agent-claude
   ├─ Border: border-agent-claude-border
   └─ Dot: bg-current (inherits text color)
```

### Status Color Application

```
Status: Active (#22c55e - green)
│
├─ StatusDot
│  ├─ Background: bg-status-active
│  └─ Animation: animate-pulse (when active)
│
├─ Badge
│  ├─ Background: bg-status-active-bg
│  ├─ Text: text-status-active
│  └─ Border: border-status-active-border
│
└─ ConversationCard
   └─ Status Badge: variant="success"
```

---

## Component Interaction Patterns

### Selection Pattern (Master-Detail)

```typescript
// Parent component state
const [selectedId, setSelectedId] = useState<string | null>(null);

// Derive selected item
const selectedAgent = selectedId
  ? agents.find(a => a.id === selectedId)
  : null;

// Card (Master)
<AgentCard
  isSelected={selectedId === agent.id}
  onClick={() => setSelectedId(agent.id)}
/>

// Details (Detail)
<AgentDetails agent={selectedAgent} />
```

### Keyboard Navigation Pattern

```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Interactive Card Content
</div>
```

### Responsive Overlay Pattern

```tsx
{/* Mobile: Full-screen overlay */}
{selectedAgent && (
  <div className="lg:hidden fixed inset-0 z-50 bg-background">
    <AgentDetails
      agent={selectedAgent}
      onClose={() => setSelectedId(null)}
    />
  </div>
)}

{/* Desktop: Sticky side panel */}
<div className="hidden lg:block sticky top-8">
  <AgentDetails agent={selectedAgent} />
</div>
```

---

## Marketing Component Integration

### Hero Section

```
Hero Component
├── Background Pattern (Grid)
├── Agent Avatar Showcase
│   ├── 8× AgentAvatar (lg size)
│   └── "+6 more" indicator
│
├── Headline
│   ├── "Multi-Agent AI"
│   └── "Orchestration Platform" (gradient)
│
├── Description
├── CTA Buttons
│   ├── GitHub Links (primary)
│   └── "View All Agents" (secondary) → /agents
│
└── Features Grid (3 columns)
    ├── Real-Time Monitoring
    ├── Self-Hosted
    └── Open Source
```

### Supported Agents Section

```
SupportedAgents Component
├── Section Header
│   ├── Title: "Supported CLI Agents"
│   └── Description
│
├── Agent Grid (3 columns on desktop)
│   └── 14× Agent Cards
│       ├── Logo Icon
│       ├── Agent Name + External Link Icon
│       ├── Provider
│       ├── Description
│       ├── Hover Effects
│       └── Link to external site
│
└── Footer CTA
    └── "Open an issue on GitHub" link
```

---

## Component Import Dependency Graph

```
AgentsPageClient
├── requires:
│   ├── AgentCard
│   │   └── requires: AgentAvatar
│   │
│   └── AgentDetails
│       └── requires: AgentAvatar
│
ConversationCard
├── requires:
│   ├── AgentAvatar
│   ├── StatusDot
│   └── Badge
│
Hero
└── requires: AgentAvatar

SupportedAgents
└── requires: (none, uses SVG icons)
```

---

## File Organization

```
/app/components/
├── index.ts                    # Central export point
│
├── agent/
│   ├── AgentAvatar.tsx
│   ├── AgentBadge.tsx
│   ├── AgentCard.tsx           # NEW
│   ├── AgentDetails.tsx        # NEW
│   └── AgentsPageClient.tsx    # NEW
│
├── ui/
│   ├── Card.tsx
│   ├── Button.tsx
│   └── Badge.tsx
│
├── status/
│   └── StatusDot.tsx
│
├── conversation/
│   └── ConversationCard.tsx    # UPDATED
│
└── marketing/
    ├── Hero.tsx                # UPDATED
    └── SupportedAgents.tsx     # UPDATED
```

---

## Usage Flow

### Creating an Agents Directory Page

```typescript
// 1. Server Component: Fetch data
// app/agents/page.tsx
import { AgentsPageClient } from '@/app/components';
import { getAgents, getAgentStats } from '@/app/lib/agents';

export default async function AgentsPage() {
  const agents = await getAgents();
  const stats = await getAgentStats();

  return <AgentsPageClient agents={agents} stats={stats} />;
}

// 2. Client Component: Render interactive UI
// AgentsPageClient handles all interactions
// - Selection state
// - Responsive layout
// - Category organization
```

### Using Individual Components

```typescript
// AgentCard in a custom layout
import { AgentCard } from '@/app/components';

function CustomAgentList({ agents }) {
  return (
    <div className="space-y-4">
      {agents.map(agent => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onClick={() => router.push(`/agents/${agent.id}`)}
        />
      ))}
    </div>
  );
}

// AgentDetails in a modal
import { AgentDetails } from '@/app/components';

function AgentModal({ agent, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="bg-card rounded-lg max-w-2xl mx-auto mt-20">
        <AgentDetails agent={agent} onClose={onClose} />
      </div>
    </div>
  );
}
```

---

## Performance Considerations

### Component Optimization

```typescript
// Memoize expensive cards
const MemoizedAgentCard = React.memo(AgentCard);

// Virtualize long lists (if needed)
import { FixedSizeGrid } from 'react-window';

// Lazy load details panel
const LazyAgentDetails = lazy(() => import('./AgentDetails'));
```

### Data Fetching Strategy

```typescript
// Server-side data fetching (optimal)
// - Fetch on server
// - Send HTML with data
// - No loading states

// Client-side hydration
// - Interactive immediately
// - No additional data fetching
```

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Related Docs**: `/docs/design-system-update.md`, `/docs/design-principles.md`
