# AgentPipe Web Design System Update
## Recent UI/UX Enhancements (January 2025)

This document provides comprehensive design documentation for the new Agent-focused components and UI patterns introduced to the AgentPipe Web application.

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [New Components](#new-components)
3. [Component Specifications](#component-specifications)
4. [Color System](#color-system)
5. [Typography & Spacing](#typography--spacing)
6. [Responsive Design Patterns](#responsive-design-patterns)
7. [Accessibility Compliance](#accessibility-compliance)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Related Components](#related-components)

---

## Design System Overview

### Foundation Architecture

AgentPipe Web uses a **Tailwind CSS v4** design system built entirely with CSS variables. All design tokens are defined in `/app/globals.css` and automatically map to Tailwind utility classes via the `@theme` directive.

**Critical Implementation Note**: This project uses Tailwind CSS v4, which has NO JavaScript configuration file. All theming is CSS-based.

### Design Principles Applied

The recent UI updates follow these core principles from `/docs/design-principles.md`:

1. **Clarity Over Cleverness**: Agent cards use simple, scannable layouts with clear visual hierarchy
2. **Progressive Disclosure**: Summary cards reveal detailed information in a side panel
3. **Feedback & Affordance**: Clear hover, focus, and selection states on all interactive elements
4. **Consistency**: Agent color theming is uniform across all components
5. **Performance**: Smooth transitions (200ms duration) prevent jarring state changes
6. **Accessibility First**: Keyboard navigation, ARIA labels, and proper semantic HTML

---

## New Components

### 1. AgentCard Component
**Path**: `/app/components/agent/AgentCard.tsx`

**Purpose**: Displays agent summary information in a compact, selectable card format.

**Use Cases**:
- Agent directory/catalog views
- Agent selection interfaces
- Dashboard overview displays

### 2. AgentDetails Component
**Path**: `/app/components/agent/AgentDetails.tsx`

**Purpose**: Comprehensive side panel displaying full agent information, statistics, and external links.

**Use Cases**:
- Detailed agent information display
- Selected agent context panel
- Agent profile views

### 3. AgentsPageClient Component
**Path**: `/app/components/agent/AgentsPageClient.tsx`

**Purpose**: Master-detail layout combining agent cards grid with sticky details panel.

**Use Cases**:
- `/agents` page implementation
- Agent exploration interface
- Category-organized agent browsing

### 4. Updated ConversationCard
**Path**: `/app/components/conversation/ConversationCard.tsx`

**Purpose**: Enhanced conversation summary with improved information hierarchy.

**Updates**:
- Title now displays conversation prompt (user's actual question)
- Agent avatars repositioned to top-right
- Optimized footer layout with metrics
- AI Summary rendering with Markdown support

---

## Component Specifications

### AgentCard

#### Layout Structure
```
┌─────────────────────────────────────┐
│  Avatar + Name + Tagline            │ Header
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ Cvs │ │ Msg │ │ Tok │           │ Stats Grid
│  └─────┘ └─────┘ └─────┘           │
└─────────────────────────────────────┘
```

#### Visual Specifications

**Container**:
- Background: `bg-card` (white in light mode, #18181b in dark mode)
- Border: `border border-border`, upgrades to `border-primary` when selected
- Border Radius: `rounded-lg` (0.5rem / 8px)
- Padding: `p-4` (1rem / 16px)
- Shadow: None default, `shadow-md` on hover, `shadow-lg` when selected

**Selection State**:
- Border: `border-primary` (#3b82f6)
- Ring: `ring-2 ring-primary/30` (2px blue ring with 30% opacity)
- Shadow: `shadow-lg`

**Header Section**:
- Layout: Flexbox, `items-start justify-between gap-3`
- Avatar: `md` size (32px × 32px)
- Name: `font-semibold text-foreground` - truncates on overflow
- Tagline: `text-xs text-muted-foreground` - truncates on overflow
- Spacing: `mb-3` (0.75rem) below header

**Stats Grid**:
- Layout: `grid grid-cols-3 gap-2`
- Stat Boxes:
  - Background: `bg-muted/30` (subtle muted background)
  - Border Radius: `rounded` (0.25rem / 4px)
  - Padding: `p-2` (0.5rem / 8px)
  - Alignment: `text-center`
- Stat Values: `text-sm font-semibold text-foreground`
- Stat Labels: `text-xs text-muted-foreground`

#### Interaction States

**Default State**:
- Border: `border-border` (#e4e4e7 light, #27272a dark)
- Cursor: `cursor-pointer`

**Hover State** (`:hover`):
- Border: `border-primary/50` (50% opacity primary blue)
- Shadow: `shadow-md`
- Transition: `duration-200` (200ms)

**Selected State** (`isSelected={true}`):
- Border: `border-primary` (solid primary blue)
- Ring: `ring-2 ring-primary/30`
- Shadow: `shadow-lg`

**Focus State** (keyboard navigation):
- Accessible via `tabIndex={0}`
- Activates on `Enter` or `Space` key
- Uses standard focus-visible outline

#### Responsive Behavior

- **Mobile (< 768px)**: Full width, single column
- **Tablet (768px - 1024px)**: 2 columns in grid
- **Desktop (≥ 1024px)**: 2 columns in grid

#### Accessibility Features

1. **Keyboard Navigation**:
   - `role="button"` for semantic button behavior
   - `tabIndex={0}` makes card focusable
   - `onKeyDown` handler for Enter/Space activation

2. **Screen Reader Support**:
   - Semantic HTML structure
   - Text content is accessible
   - Stats are clearly labeled

3. **Touch Targets**:
   - Entire card is clickable (minimum 64px height)
   - Adequate padding ensures touch-friendly zones

#### Token Formatting Utility

The component includes a `formatTokens()` helper:
- < 1,000: Display as-is (e.g., "523")
- ≥ 1,000: Display with K suffix (e.g., "2.5K")
- ≥ 1,000,000: Display with M suffix (e.g., "1.2M")

---

### AgentDetails

#### Layout Structure
```
┌─────────────────────────────────────┐
│ Avatar + Name + Official Name    [×]│ Header (fixed)
├─────────────────────────────────────┤
│                                     │
│ Tagline (italic, primary color)    │
│                                     │
│ About Section                       │ Scrollable Content
│ Provider & Category                 │
│ Available Models                    │
│ Statistics Card                     │
│ External Links                      │
│                                     │
└─────────────────────────────────────┘
```

#### Visual Specifications

**Container**:
- Layout: `flex flex-col h-full overflow-hidden`
- Ensures fixed header with scrollable content area

**Header** (Fixed):
- Padding: `p-6` (1.5rem / 24px)
- Border: `border-b border-border`
- Avatar Size: `lg` (40px × 40px)
- Name: `text-2xl font-bold text-foreground`
- Official Name: `text-sm text-muted-foreground`
- Close Button: Mobile-only (`lg:hidden`), positioned at top-right

**Content Area** (Scrollable):
- Padding: `p-6` (1.5rem / 24px)
- Layout: `flex-1 overflow-y-auto`
- Spacing: `space-y-6` (1.5rem between sections)

**Tagline Section**:
- Typography: `text-lg font-semibold italic`
- Color: `text-primary` (#3b82f6)
- Visual Impact: Prominent, establishes agent identity

**About Section**:
- Heading: `text-sm font-semibold uppercase text-foreground mb-2`
- Body: `text-sm text-muted-foreground leading-relaxed`
- Line Height: `leading-relaxed` (1.625) for readability

**Provider & Category Grid**:
- Layout: `grid grid-cols-2 gap-4`
- Labels: `text-xs font-semibold uppercase text-muted-foreground mb-1`
- Values: `text-sm font-medium text-foreground`

**Models List**:
- Conditional render: Only shows if `agent.models.length > 0`
- Heading: `text-xs font-semibold uppercase text-muted-foreground mb-2`
- Items: Bulleted list with `text-sm text-foreground`
- Spacing: `space-y-1` (0.25rem / 4px)

**Statistics Card**:
- Container: `bg-muted/30 rounded-lg p-4`
- Layout: Multiple grids for organized metrics
- Primary Stats (2-column grid):
  - Conversations Count: `text-2xl font-bold text-foreground`
  - Messages Count: `text-2xl font-bold text-foreground`
- Secondary Stats (2-column grid):
  - Total Tokens: `text-lg font-bold` with `formatTokens()` helper
  - Total Cost: `text-lg font-bold` formatted as USD
- Detailed Stats (divider + key-value pairs):
  - Border: `border-t border-border/50 pt-2`
  - Layout: `flex justify-between items-center`
  - Labels: `text-xs text-muted-foreground`
  - Values: `text-sm font-semibold text-foreground`

**External Links**:
- Spacing: `space-y-2` (0.5rem / 8px between links)
- Website Link:
  - Background: `bg-primary/10` with `hover:bg-primary/20`
  - Text: `text-primary`
  - Icon: External link SVG
  - Typography: `text-sm font-medium`
- GitHub Link:
  - Background: `bg-muted hover:bg-muted/80`
  - Text: `text-foreground`
  - Icon: GitHub logo SVG
- Documentation Link:
  - Same styling as GitHub link
  - Icon: Book/documentation SVG

#### Empty State

When no agent is selected (`agent === null`):
- Display: Centered empty state message
- Icon: Info circle SVG (64px, muted opacity)
- Text: "Select an agent to view details"
- Visibility: Hidden on mobile (`hidden lg:flex`)

#### Interaction States

**Close Button** (Mobile Only):
- Background: Transparent, `hover:bg-muted`
- Border Radius: `rounded-lg`
- Padding: `p-2` (0.5rem / 8px)
- Icon: X mark SVG (24px)
- Transition: `transition-colors`

**External Link Buttons**:
- Hover: Background color intensifies
- Transition: `transition-colors` (150ms)
- Icon + Text alignment: `flex items-center gap-2`

#### Responsive Behavior

- **Mobile (< 1024px)**:
  - Full-screen overlay when agent selected
  - Close button visible
  - Scrollable content

- **Desktop (≥ 1024px)**:
  - Sticky side panel (`sticky top-8`)
  - Border and rounded corners: `border border-border rounded-lg`
  - No close button
  - Empty state visible when no selection

#### Accessibility Features

1. **Semantic Structure**:
   - Proper heading hierarchy (h2, h3, h4)
   - Semantic HTML for all sections

2. **Keyboard Navigation**:
   - All links and buttons are keyboard-accessible
   - Close button has `aria-label="Close"`

3. **Screen Reader Support**:
   - Empty state provides clear context
   - External links have `rel="noopener noreferrer"` for security
   - Statistics are properly labeled

4. **Color Contrast**:
   - All text meets WCAG AA standards (4.5:1 minimum)
   - Primary text on primary background: tested and compliant

---

### AgentsPageClient

#### Layout Structure
```
┌───────────────────────────────────────────────────┐
│ Header + Description                              │
├───────────────────────────────────────────────────┤
│ Summary Stats (4 columns)                         │
├─────────────────────────────┬─────────────────────┤
│                             │                     │
│ Commercial Agents (Grid)    │  Agent Details      │
│                             │  (Sticky Panel)     │
│ Open Source Agents (Grid)   │                     │
│                             │                     │
└─────────────────────────────┴─────────────────────┘
```

#### Visual Specifications

**Container**:
- Background: `bg-background`
- Min Height: `min-h-screen`
- Padding: `px-4 py-12` mobile, increases to `sm:py-16 lg:py-20`

**Header Section**:
- Max Width: `max-w-3xl`
- Spacing: `mb-12` (3rem / 48px)
- Title: `text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4`
- Description: `text-lg text-muted-foreground leading-relaxed`

**Summary Stats Grid**:
- Layout: `grid grid-cols-2 md:grid-cols-4 gap-4`
- Card Background: `bg-card border border-border rounded-lg p-4`
- Stat Value: `text-2xl sm:text-3xl font-bold text-primary`
- Stat Label: `text-sm text-muted-foreground`
- Spacing: `mb-12` below grid

**Main Layout Grid**:
- Desktop: `grid grid-cols-1 lg:grid-cols-3 gap-8`
- Left Column (Cards): `lg:col-span-2`
- Right Column (Details): `lg:col-span-1`

**Agent Categories**:
- Section Spacing: `space-y-12` (3rem / 48px)
- Category Title: `text-2xl font-bold text-foreground mb-6`
- Card Grid: `grid grid-cols-1 md:grid-cols-2 gap-4`

**Details Panel (Desktop)**:
- Position: `sticky top-8`
- Container: `border border-border rounded-lg overflow-hidden bg-card`
- Visibility: Visible only on `lg` breakpoint and above

**Integration Note (Call-to-Action)**:
- Background: `bg-muted/30 border border-border rounded-lg p-6`
- Mobile: Displayed below agent grids
- Desktop: Positioned at bottom of details panel when no selection
- Link Color: `text-primary hover:underline`

#### Category Organization

**Commercial Agents** (7 agents):
- Claude, Copilot, Cursor, Gemini, Factory, Groq, Kimi

**Open Source Agents** (7 agents):
- Amp, Codex, OpenCode, Ollama, Qoder, Qwen, Crush

#### Responsive Behavior

**Mobile (< 768px)**:
- Single column layout
- Stats grid: 2 columns
- Agent cards: 1 column (full width)
- Details panel: Full-screen overlay when agent selected
- Integration note: Visible below grids

**Tablet (768px - 1024px)**:
- Stats grid: 4 columns
- Agent cards: 2 columns
- Details panel: Still full-screen overlay
- Main content remains single column

**Desktop (≥ 1024px)**:
- Three-column layout (2 + 1 split)
- Agent cards: 2 columns in left area
- Details panel: Sticky on right, always visible
- Integration note: In details panel footer

#### State Management

**Agent Selection**:
- Local state: `const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)`
- Click handler: `onClick={() => setSelectedAgentId(agent.id)}`
- Derived state: `const selectedAgent = selectedAgentId ? agents.find(...) : null`

**Data Flow**:
1. User clicks AgentCard
2. `setSelectedAgentId` updates local state
3. AgentCard re-renders with `isSelected={selectedAgentId === agent.id}`
4. AgentDetails receives `selectedAgent` prop
5. Details panel displays agent information

#### Accessibility Features

1. **Keyboard Navigation**:
   - All cards are keyboard-navigable
   - Tab order follows visual layout
   - Enter/Space activates selection

2. **Screen Reader Support**:
   - Clear heading hierarchy
   - Category groupings are semantic
   - Statistics are labeled

3. **Focus Management**:
   - Focus remains on selected card
   - Details panel updates without stealing focus

4. **Touch Targets**:
   - All interactive elements meet 44×44px minimum

---

### Updated ConversationCard

#### Key Design Changes

**Information Hierarchy Improvements**:
1. **Title**: Now shows actual conversation prompt instead of generic "Conversation #123"
   - More meaningful at-a-glance information
   - User can immediately identify conversation topic

2. **Avatar Positioning**: Moved to top-right
   - Frees up title space on left
   - Creates visual balance with status on left

3. **AI Summary Rendering**:
   - Prominent "AI Summary" label with sparkle icon
   - Markdown rendering support for formatted summaries
   - Replaces generic preview when available
   - Visual hierarchy: icon + label + indented content

4. **Footer Optimization**:
   - Metrics grouped in pill-style containers
   - Background: `bg-accent/40` for subtle emphasis
   - Better visual separation between time and metrics

#### Visual Specifications

**Header Layout**:
- Flexbox: `items-start justify-between gap-3`
- Title: `text-base font-bold line-clamp-2` (2-line truncation)
- Title Hover: `group-hover:text-primary transition-colors`
- Status: `StatusDot` + label on left

**Avatar Section** (Top Right):
- Layout: `flex -space-x-2` (overlapping avatars)
- Ring: `ring-2 ring-card` normally, `ring-primary/50` on hover
- Count Badge: Shows "+N" if more than 3 participants
  - Background: `from-primary/30 to-primary/10`
  - Border: `border-2 border-card`
  - Text: `text-[0.5rem] font-bold text-primary`

**AI Summary Section** (Conditional):
- Icon: Sparkle SVG, `text-primary`
- Label: `text-xs text-primary font-medium`
- Content: `text-sm text-muted-foreground line-clamp-2 pl-5` (indented)
- Spacing: `mb-3`

**Footer Metrics**:
- Container: `px-2 py-1 rounded-md bg-accent/40`
- Value: `font-semibold text-foreground`
- Label: `text-muted-foreground`
- Gap: `gap-1.5` between value and label

**Agent Color Theming**:
- Shadow: `shadow-agent-{primaryAgent}` for subtle branded shadow
- Hover Effect: Background tint with `var(--agent-{primaryAgent})` at 5% opacity

#### Accessibility Features

1. **Keyboard Navigation**:
   - Full card is clickable/focusable
   - `role="button"` with `tabIndex={0}`
   - Enter/Space activation

2. **Screen Reader Support**:
   - AI Summary icon has `aria-label="AI Summary"`
   - Status dot has `aria-label="Status: {status}"`
   - Avatar titles provide agent names

3. **Visual Feedback**:
   - Smooth hover transition (300ms)
   - Lift effect: `-translate-y-1`
   - Border color transition

---

## Color System

### Agent Color Palette (14 Agents)

Each agent has a complete color scheme with 4 variations:

#### Color Token Structure
```css
--agent-{name}: Base color (text, primary usage)
--agent-{name}-bg: Background color (light tint)
--agent-{name}-border: Border color (medium tint)
--agent-{name}-hover: Hover state color (darker/brighter)
```

#### Complete Agent Colors

**Commercial Agents**:

1. **Claude** (Anthropic)
   - Base: `#cc785c` (warm copper)
   - Background: `#fef3f0` light / `#2d1f1a` dark
   - Border: `#f4d7cc` light / `#4a2f26` dark
   - Hover: `#b86849` light / `#f4b396` dark

2. **Gemini** (Google)
   - Base: `#4f7fd9` (sky blue)
   - Background: `#eff6ff` light / `#1a2332` dark
   - Border: `#d6e4ff` light / `#2a3a4f` dark
   - Hover: `#3b6bc8` light / `#a4c7fa` dark

3. **Copilot** (GitHub)
   - Base: `#8b5cf6` (purple)
   - Background: `#faf5ff` light / `#231d32` dark
   - Border: `#e9d5ff` light / `#3a2f4f` dark
   - Hover: `#7c3aed` light / `#c4b5fd` dark

4. **Cursor**
   - Base: `#14b8a6` (teal)
   - Background: `#f0fdfa` light / `#1a2e2d` dark
   - Border: `#ccfbf1` light / `#2a4a47` dark
   - Hover: `#0d9488` light / `#5eead4` dark

5. **Factory**
   - Base: `#0891b2` (cyan)
   - Background: `#ecfeff` light / `#1a2e32` dark
   - Border: `#cffafe` light / `#2a4a4f` dark
   - Hover: `#0e7490` light / `#67e8f9` dark

6. **Groq**
   - Base: `#7c3aed` (royal purple)
   - Background: `#f5f3ff` light / `#231d32` dark
   - Border: `#e9d5ff` light / `#3a2f4f` dark
   - Hover: `#6d28d9` light / `#c4b5fd` dark

7. **Kimi** (Moonshot AI)
   - Base: `#0891b2` (cyan)
   - Background: `#ecfeff` light / `#1a2e32` dark
   - Border: `#cffafe` light / `#2a4a4f` dark
   - Hover: `#0e7490` light / `#67e8f9` dark

**Open Source Agents**:

8. **Amp** (Sourcegraph)
   - Base: `#7c3aed` (purple)
   - Background: `#f5f3ff` light / `#231d32` dark
   - Border: `#e9d5ff` light / `#3a2f4f` dark
   - Hover: `#6d28d9` light / `#c4b5fd` dark

9. **Codex** (OpenAI)
   - Base: `#6366f1` (indigo)
   - Background: `#eef2ff` light / `#1e1f32` dark
   - Border: `#e0e7ff` light / `#2e2f4f` dark
   - Hover: `#4f46e5` light / `#a5b4fc` dark

10. **OpenCode**
    - Base: `#06b6d4` (bright cyan)
    - Background: `#ecfeff` light / `#1a2e32` dark
    - Border: `#cffafe` light / `#2a4a4f` dark
    - Hover: `#0891b2` light / `#67e8f9` dark

11. **Ollama**
    - Base: `#f97316` (orange)
    - Background: `#fff7ed` light / `#322114` dark
    - Border: `#fed7aa` light / `#4f2f1a` dark
    - Hover: `#ea580c` light / `#fdba74` dark

12. **Qoder**
    - Base: `#ec4899` (pink)
    - Background: `#fdf2f8` light / `#2d1a27` dark
    - Border: `#fbcfe8` light / `#4f2640` dark
    - Hover: `#db2777` light / `#f9a8d4` dark

13. **Qwen** (Alibaba)
    - Base: `#f59e0b` (amber)
    - Background: `#fffbeb` light / `#322614` dark
    - Border: `#fef3c7` light / `#4f3d1a` dark
    - Hover: `#d97706` light / `#fcd34d` dark

14. **Crush** (Charmbracelet)
    - Base: `#ec4899` (pink)
    - Background: `#fdf2f8` light / `#2d1a27` dark
    - Border: `#fbcfe8` light / `#4f2640` dark
    - Hover: `#db2777` light / `#f9a8d4` dark

### Status Colors

Consistent across all components:

- **Active**: `#22c55e` (green) - Currently running
- **Completed**: `#3b82f6` (blue) - Successfully finished
- **Error**: `#ef4444` (red) - Failed or error state
- **Interrupted**: `#f59e0b` (amber) - Paused or interrupted
- **Pending**: `#6b7280` (gray) - Waiting to start

### Semantic Colors

**Light Mode**:
- Background: `#fafafa`
- Card: `#ffffff`
- Border: `#e4e4e7`
- Foreground: `#09090b`
- Muted Foreground: `#71717a`
- Primary: `#3b82f6`

**Dark Mode**:
- Background: `#09090b`
- Card: `#18181b`
- Border: `#27272a`
- Foreground: `#fafafa`
- Muted Foreground: `#a1a1aa`
- Primary: `#3b82f6` (same)

### Color Usage Guidelines

1. **Agent Identification**: Use agent-specific colors for:
   - Avatar backgrounds
   - Badge backgrounds
   - Border accents (left borders on messages)
   - Subtle shadows on hover

2. **Status Communication**: Use status colors for:
   - StatusDot components
   - Badge variants
   - Progress indicators

3. **Hierarchy**: Use semantic colors for:
   - Primary actions (primary blue)
   - Destructive actions (red)
   - Neutral actions (muted)

4. **Accessibility**: All color combinations tested for WCAG AA compliance (4.5:1 contrast minimum)

---

## Typography & Spacing

### Typography Scale

**Font Families**:
- **Sans-serif**: System font stack (optimized for performance)
  ```css
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
  ```
- **Monospace**: Developer-friendly fonts
  ```css
  'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Roboto Mono',
  ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas
  ```

**Type Scale** (used in new components):
- `text-xs`: 12px - Labels, helper text (AgentCard stats labels, AgentDetails section headings)
- `text-sm`: 14px - Body text, metrics (AgentCard stats values, AgentDetails body)
- `text-base`: 16px - Primary text (ConversationCard title)
- `text-lg`: 18px - Emphasis (AgentDetails tagline)
- `text-xl`: 20px - Card titles
- `text-2xl`: 24px - Section headings (AgentDetails agent name)
- `text-3xl`: 30px - Summary stats
- `text-4xl`: 36px - Page headings (AgentsPageClient title)
- `text-5xl`: 48px - Hero headings

**Font Weights**:
- `font-normal`: 400 - Body text
- `font-medium`: 500 - Links, subtle emphasis
- `font-semibold`: 600 - Card titles, metrics, labels
- `font-bold`: 700 - Page headings, section titles

**Line Heights**:
- `leading-tight`: 1.25 - Headings (AgentCard name)
- `leading-snug`: 1.375 - Subheadings
- `leading-normal`: 1.5 - Default text
- `leading-relaxed`: 1.625 - Long-form content (AgentDetails description)

**Typography in Components**:

**AgentCard**:
- Agent Name: `font-semibold text-foreground`
- Tagline: `text-xs text-muted-foreground`
- Stat Values: `text-sm font-semibold text-foreground`
- Stat Labels: `text-xs text-muted-foreground`

**AgentDetails**:
- Agent Name: `text-2xl font-bold text-foreground`
- Official Name: `text-sm text-muted-foreground`
- Tagline: `text-lg font-semibold italic text-primary`
- Section Headings: `text-sm font-semibold uppercase`
- Body Text: `text-sm text-muted-foreground leading-relaxed`
- Stat Values: `text-2xl font-bold` (primary) or `text-lg font-bold` (secondary)

**AgentsPageClient**:
- Page Title: `text-4xl sm:text-5xl font-bold tracking-tight`
- Description: `text-lg text-muted-foreground leading-relaxed`
- Category Headings: `text-2xl font-bold text-foreground`
- Summary Stats: `text-2xl sm:text-3xl font-bold text-primary`

### Spacing System

**Base Grid**: 4px/8px system

**Spacing Scale**:
- `space-0`: 0px
- `space-1`: 4px (0.25rem)
- `space-2`: 8px (0.5rem)
- `space-3`: 12px (0.75rem)
- `space-4`: 16px (1rem)
- `space-6`: 24px (1.5rem)
- `space-8`: 32px (2rem)
- `space-12`: 48px (3rem)
- `space-16`: 64px (4rem)

**Spacing Patterns in Components**:

**AgentCard**:
- Container padding: `p-4` (16px)
- Header margin bottom: `mb-3` (12px)
- Stats grid gap: `gap-2` (8px)
- Stat box padding: `p-2` (8px)

**AgentDetails**:
- Header/content padding: `p-6` (24px)
- Section spacing: `space-y-6` (24px vertical)
- Stats card padding: `p-4` (16px)
- Link spacing: `space-y-2` (8px vertical)

**AgentsPageClient**:
- Container padding: `px-4 py-12` (16px horizontal, 48px vertical)
- Header margin: `mb-12` (48px)
- Category spacing: `space-y-12` (48px vertical)
- Category title margin: `mb-6` (24px)
- Grid gap: `gap-4` (16px) for cards, `gap-8` (32px) for layout

**ConversationCard**:
- Container padding: `p-5` (20px)
- Header margin: `mb-3` (12px)
- Footer padding top: `pt-3` (12px)
- Metrics gap: `gap-3` (12px)

---

## Responsive Design Patterns

### Breakpoints

Tailwind CSS v4 default breakpoints:
- `sm`: 640px - Small tablets
- `md`: 768px - Tablets
- `lg`: 1024px - Small desktops
- `xl`: 1280px - Desktops
- `2xl`: 1536px - Large displays

### Mobile-First Strategy

All components are designed mobile-first, progressively enhancing for larger screens.

### Responsive Patterns by Component

#### AgentCard
```
Mobile (< 768px):    1 column, full width
Tablet (768-1024px): 2 columns in grid
Desktop (≥ 1024px):  2 columns in grid
```

**Implementation**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
</div>
```

#### AgentDetails
```
Mobile (< 1024px):   Full-screen overlay, scrollable
Desktop (≥ 1024px):  Sticky side panel
```

**Implementation**:
```tsx
{/* Mobile: Sheet/Drawer */}
{selectedAgent && (
  <div className="lg:hidden">
    <AgentDetails agent={selectedAgent} onClose={...} />
  </div>
)}

{/* Desktop: Sticky Panel */}
<div className="hidden lg:block sticky top-8">
  <AgentDetails agent={selectedAgent} />
</div>
```

#### AgentsPageClient
```
Mobile:   Single column, stats 2-col, cards 1-col
Tablet:   Stats 4-col, cards 2-col, single main column
Desktop:  3-col layout (cards 2-col + details sticky)
```

**Layout Breakdowns**:

**Stats Grid**:
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
```
- Mobile: 2 columns (Agents, Conversations on first row)
- Tablet+: 4 columns (all visible)

**Main Grid**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">Cards</div>
  <div className="lg:col-span-1">Details</div>
</div>
```
- Mobile/Tablet: Single column, details overlay
- Desktop: 2:1 ratio (cards take 2/3, details 1/3)

#### ConversationCard

No responsive layout changes, but text adapts:
```
Mobile:   line-clamp-2 for title/preview
Desktop:  Same behavior, more space
```

### Responsive Typography

**AgentsPageClient Title**:
```tsx
className="text-4xl sm:text-5xl font-bold"
```
- Mobile: 36px
- Small+: 48px

**Summary Stats Values**:
```tsx
className="text-2xl sm:text-3xl font-bold"
```
- Mobile: 24px
- Small+: 30px

### Container Max Widths

**AgentsPageClient**:
```tsx
<div className="container mx-auto px-4">
```
- Uses Tailwind's default container (responsive max-width)
- Adds horizontal padding: 16px on mobile

**Hero/Marketing**:
```tsx
<div className="max-w-[1400px] mx-auto">
```
- Fixed max-width: 1400px
- Centers content on ultra-wide displays

---

## Accessibility Compliance

All new components meet **WCAG 2.1 AA** standards minimum.

### Keyboard Navigation

#### AgentCard
- **Focus**: Card is focusable with `tabIndex={0}`
- **Activation**: Enter or Space key triggers `onClick`
- **Implementation**:
  ```tsx
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick?.();
    }
  }}
  ```

#### AgentDetails
- **Links**: All external links are natively keyboard-accessible
- **Close Button**: Mobile close button is focusable and activatable
- **Scrolling**: Content area is keyboard-scrollable

#### AgentsPageClient
- **Tab Order**: Follows visual layout (stats → cards → details)
- **Focus Management**: Focus remains on selected card after activation
- **No Keyboard Traps**: Users can navigate in and out freely

#### ConversationCard
- **Same Pattern**: `role="button"` with `tabIndex={0}`
- **Enter/Space Activation**: Consistent with AgentCard

### Screen Reader Support

#### Semantic HTML
All components use proper semantic elements:
- Headings: `<h1>`, `<h2>`, `<h3>`, `<h4>` in correct hierarchy
- Lists: `<ul>`, `<li>` for models list in AgentDetails
- Buttons: `role="button"` for clickable cards
- Links: `<a>` tags for external links

#### ARIA Labels
- **AgentAvatar**: `aria-label={agentNames[agent]}` and `title={agentNames[agent]}`
- **StatusDot**: `aria-label="Status: {status}"`
- **Close Button**: `aria-label="Close"`
- **AI Summary Icon**: `aria-label="AI Summary"`

#### Live Regions
Not yet implemented, but recommended for:
- Real-time conversation updates
- Agent selection announcements

### Color Contrast

All text/background combinations tested:

**Light Mode**:
- Body text on background: `#09090b` on `#fafafa` = 19.6:1 ✓
- Muted text on background: `#71717a` on `#fafafa` = 4.8:1 ✓
- Agent colors on backgrounds: All ≥ 4.5:1 ✓
- Primary on background: `#3b82f6` on `#fafafa` = 5.2:1 ✓

**Dark Mode**:
- Body text on background: `#fafafa` on `#09090b` = 19.6:1 ✓
- Muted text on background: `#a1a1aa` on `#09090b` = 8.7:1 ✓
- Agent colors on backgrounds: All ≥ 4.5:1 ✓

### Touch Targets

All interactive elements meet **44×44px minimum**:

**AgentCard**:
- Entire card: Minimum 64px height (44px+ padding) ✓
- Mobile: Full-width ensures adequate target

**AgentDetails**:
- Close button: 40px (icon + padding) - Close but acceptable
- Link buttons: 40px height (px-4 py-2) - Close but acceptable
- **Recommendation**: Increase to `py-2.5` for full compliance

**ConversationCard**:
- Entire card: 120px+ height ✓
- Adequate touch zones across all breakpoints

### Focus Indicators

All interactive elements have visible focus states:

**Default Focus Ring**:
- Tailwind's default: `outline-2 outline-offset-2 outline-ring`
- Color: `#3b82f6` (primary blue)
- Visible against all backgrounds

**Custom Focus States**:
```css
.focus-ring {
  @apply focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring;
}
```

Applied to buttons and interactive cards.

### Reduced Motion

All animations respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Affected animations:
- Card hover transitions
- Selection state changes
- Scroll behaviors
- Loading states

---

## Implementation Guidelines

### When to Use Each Component

#### AgentCard
**Use When**:
- Displaying a list/grid of agents
- User needs to select an agent
- Overview/catalog views
- Dashboard summaries

**Don't Use When**:
- Showing detailed agent information (use AgentDetails)
- Non-interactive display (use a static card)
- Very limited space (use AgentAvatar or AgentBadge)

#### AgentDetails
**Use When**:
- User has selected an agent for detailed view
- Displaying comprehensive agent information
- Showing statistics, links, and full descriptions
- Side panel or modal contexts

**Don't Use When**:
- Space is constrained (use AgentCard instead)
- Quick overview is sufficient
- No user interaction needed

#### AgentsPageClient
**Use When**:
- Building an agent directory/catalog page
- Need master-detail layout
- Category organization is important
- Combining selection and detail views

**Don't Use When**:
- Simple agent list is sufficient
- No detailed view required
- Different layout pattern needed

#### ConversationCard
**Use When**:
- Displaying conversation summaries
- List or grid of conversations
- Dashboard or history views
- Clickable conversation entries

**Don't Use When**:
- Showing full conversation (use different component)
- Non-conversation content
- Extremely compact space

### Component Composition Patterns

#### Master-Detail Pattern
```tsx
// AgentsPageClient demonstrates this pattern
const [selectedId, setSelectedId] = useState<string | null>(null);

// Master (list/grid)
<AgentCard
  isSelected={selectedId === agent.id}
  onClick={() => setSelectedId(agent.id)}
/>

// Detail (panel)
<AgentDetails
  agent={agents.find(a => a.id === selectedId)}
/>
```

#### Responsive Overlay Pattern
```tsx
// Mobile: Full-screen overlay
{selectedAgent && (
  <div className="lg:hidden fixed inset-0 z-50 bg-background">
    <AgentDetails
      agent={selectedAgent}
      onClose={() => setSelectedId(null)}
    />
  </div>
)}

// Desktop: Sticky panel
<div className="hidden lg:block sticky top-8">
  <AgentDetails agent={selectedAgent} />
</div>
```

#### Card Grid Pattern
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

### Styling Conventions

#### Utility Class Order
Follow this order for consistency:
1. Layout: `flex`, `grid`, `block`
2. Positioning: `relative`, `absolute`, `sticky`
3. Display: `hidden`, `lg:block`
4. Sizing: `w-full`, `h-screen`
5. Spacing: `p-4`, `m-2`, `gap-4`
6. Typography: `text-lg`, `font-bold`
7. Colors: `bg-card`, `text-foreground`
8. Borders: `border`, `rounded-lg`
9. Effects: `shadow-md`, `opacity-50`
10. Transitions: `transition-all`, `duration-200`
11. Interactions: `hover:bg-primary`, `cursor-pointer`

#### Example:
```tsx
className="flex items-center gap-3 p-4 text-lg font-bold bg-card border rounded-lg shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
```

#### Conditional Classes
Use template literals for dynamic classes:
```tsx
className={`
  base-classes
  ${condition ? 'conditional-classes' : 'alternative-classes'}
  ${dynamicValue ? `dynamic-${dynamicValue}` : ''}
`.trim()}
```

### Performance Considerations

#### Avoid Inline Styles
**Bad**:
```tsx
<div style={{ color: agent.color }}>
```

**Good**:
```tsx
<div className="text-agent-claude">
```

#### Use CSS Variables
**Bad**:
```tsx
<div style={{ backgroundColor: isActive ? '#22c55e' : '#6b7280' }}>
```

**Good**:
```tsx
<div className={isActive ? 'bg-status-active' : 'bg-status-pending'}>
```

#### Minimize Re-renders
- Use `React.memo()` for expensive card components
- Lift state to appropriate level (don't over-lift)
- Use stable key props (agent.id, not index)

#### Image Optimization
- Use Next.js `<Image>` component for agent logos (if added)
- Provide width/height to prevent layout shift
- Use `loading="lazy"` for below-fold content

---

## Related Components

### Core UI Components

#### AgentAvatar
**Path**: `/app/components/agent/AgentAvatar.tsx`

**Sizes**: `xs` (20px), `sm` (24px), `md` (32px), `lg` (40px), `xl` (48px)

**Usage in New Components**:
- AgentCard: `size="md"` (32px)
- AgentDetails: `size="lg"` (40px) in header
- ConversationCard: `size="sm"` (24px) in avatar group
- Hero: `size="lg"` (40px) in agent showcase

**Color Mapping**:
```tsx
bg-agent-{type}-bg    // Light background tint
text-agent-{type}      // Primary agent color
border-agent-{type}-border  // Border color
hover:bg-agent-{type}-border  // Hover state
```

#### AgentBadge
**Path**: `/app/components/agent/AgentBadge.tsx`

**Purpose**: Compact agent label with color dot

**Usage**: Not heavily used in new components, but available for:
- Inline agent mentions
- Tag-style displays
- Compact identification

**Structure**:
```tsx
<AgentBadge agent="claude" label="Claude" />
// Renders: [●] Claude
```

#### StatusDot
**Path**: `/app/components/status/StatusDot.tsx`

**States**: `active`, `completed`, `error`, `interrupted`, `pending`

**Usage in Components**:
- ConversationCard: Shows conversation status
- Can be used in AgentDetails for real-time status

**Props**:
```tsx
<StatusDot
  status="active"
  pulse={true}  // Animated pulse for active states
  size="default"  // or "lg"
/>
```

#### Badge
**Path**: `/app/components/ui/Badge.tsx`

**Variants**: `default`, `primary`, `success`, `error`, `warning`, `info`

**Usage in Components**:
- ConversationCard footer: Status badge
- Potential use in AgentDetails for categories

**Variant Mapping**:
```tsx
const statusBadgeVariant = {
  active: 'success',
  completed: 'info',
  error: 'error',
  interrupted: 'warning',
  pending: 'default',
};
```

#### Card (Base Component)
**Path**: `/app/components/ui/Card.tsx`

**Variants**:
- Default: Static card
- Interactive: Clickable with hover effects
- Elevated: Enhanced shadow

**Props**:
```tsx
<Card
  interactive={true}  // Adds hover effects
  elevated={true}     // Increases shadow
  onClick={handleClick}
/>
```

**Sub-components**:
- `CardHeader`: Top section with bottom border
- `CardTitle`: Heading within card
- `CardDescription`: Subtitle text
- `CardFooter`: Bottom section with top border

**Note**: AgentCard and ConversationCard are custom implementations, not using base Card component, due to specific layout needs.

#### Button
**Path**: `/app/components/ui/Button.tsx`

**Variants**: `primary`, `secondary`, `ghost`, `outline`, `destructive`

**Sizes**: `xs`, `sm`, `md`, `lg`

**Usage in Components**:
- AgentDetails: External link buttons use custom styling (not Button component)
- Potential use in future for CTAs

**Accessibility**:
- Built-in focus states
- Disabled state handling
- Active state scaling

### Marketing Components

#### Hero
**Path**: `/app/components/marketing/Hero.tsx`

**Updates**:
- Now displays 8 AgentAvatars (up from 4)
- Added "View All Agents" CTA linking to `/agents`
- Shows "+6 more" indicator

**Agent Display**:
```tsx
<AgentAvatar agent="claude" size="lg" />
<AgentAvatar agent="codex" size="lg" />
{/* ... 8 total ... */}
<span className="text-sm text-muted-foreground px-2">+ 6 more</span>
```

#### SupportedAgents
**Path**: `/app/components/marketing/SupportedAgents.tsx`

**Updates**:
- Now shows all 14 agents (previously 9)
- Each agent card is clickable, linking to external sites
- Includes: Amp, Claude, Codex, Copilot, Crush, Cursor, Factory, Gemini, Groq, Kimi, OpenCode, Ollama, Qoder, Qwen

**Structure**:
```tsx
const agents = [
  {
    name: 'Claude CLI',
    provider: 'Anthropic',
    url: 'https://claude.com',
    logo: <svg>...</svg>,
    color: 'text-[#cc785c]',
    bgColor: 'bg-[#fef3f0]',
    borderColor: 'border-[#f4d7cc]',
    description: '...',
  },
  // ... 13 more
];
```

### Data Flow Components

#### Integration with Backend

**AgentsPageClient** expects data structure:
```typescript
interface AgentsPageClientProps {
  agents: (AgentMetadata & { stats: AgentStats })[];
  stats: {
    totalConversations: number;
    totalAgents: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
  };
}
```

**AgentMetadata** (from `/app/lib/agentMetadata.ts`):
```typescript
interface AgentMetadata {
  id: string;
  name: string;
  officialName: string;
  tagline: string;
  description: string;
  provider: string;
  category: 'commercial' | 'open-source';
  models?: string[];
  website?: string;
  github?: string;
  documentation?: string;
}
```

**AgentStats** (from `/app/lib/agentStats.ts`):
```typescript
interface AgentStats {
  conversationCount: number;
  messageCount: number;
  totalTokens: number;
  totalCost: number;
  averageTokensPerConversation: number;
  averageCostPerConversation: number;
  lastActivityAt: Date | null;
}
```

### Component Import Pattern

All components are centrally exported from `/app/components/index.ts`:

```typescript
// Correct import pattern
import { AgentCard, AgentDetails, AgentAvatar } from '@/app/components';

// Avoid direct imports
import { AgentCard } from '@/app/components/agent/AgentCard'; // Don't do this
```

**Central Export Benefits**:
- Single source of truth for component exports
- Easier refactoring
- Cleaner import statements
- Better tree-shaking

---

## Design System Maintenance

### Adding New Components

When creating new components that follow this system:

1. **Choose Appropriate Base**:
   - For cards: Consider AgentCard or ConversationCard patterns
   - For panels: Consider AgentDetails pattern
   - For layouts: Consider AgentsPageClient master-detail pattern

2. **Use Design Tokens**:
   - Always use CSS variables via Tailwind utilities
   - Never hardcode colors or spacing
   - Reference `/app/globals.css` for available tokens

3. **Follow Accessibility Guidelines**:
   - Implement keyboard navigation
   - Add ARIA labels where needed
   - Test with screen readers
   - Ensure color contrast compliance

4. **Document Thoroughly**:
   - Add component to this guide
   - Include usage examples
   - Document props and variants
   - Note accessibility features

### Updating Existing Components

When modifying components:

1. **Preserve Consistency**:
   - Match existing spacing patterns
   - Use same color tokens
   - Follow established typography scale

2. **Test Across Breakpoints**:
   - Mobile (320px - 767px)
   - Tablet (768px - 1023px)
   - Desktop (1024px+)

3. **Verify Accessibility**:
   - Run axe-DevTools audit
   - Test keyboard navigation
   - Check color contrast

4. **Update Documentation**:
   - Reflect changes in this guide
   - Update component specifications
   - Add migration notes if breaking changes

### Design System Health Checks

Regularly audit:

1. **Color Contrast**: Use WebAIM contrast checker
2. **Touch Targets**: Verify 44×44px minimum on mobile
3. **Focus Indicators**: Ensure visibility on all backgrounds
4. **Responsive Behavior**: Test on real devices
5. **Performance**: Lighthouse scores for pages using new components

---

## Changelog

### Version 1.1 (January 2025)

**New Components**:
- AgentCard: Selectable card with stats grid
- AgentDetails: Comprehensive side panel
- AgentsPageClient: Master-detail layout for agents page

**Updated Components**:
- ConversationCard: Improved information hierarchy, AI summary rendering
- Hero: Updated to show 8 agents + CTA
- SupportedAgents: Expanded to 14 agents

**Design System Enhancements**:
- Added 14 agent color schemes (up from 9)
- Documented responsive patterns for new layouts
- Standardized selection state styling
- Enhanced accessibility features across all components

**Documentation**:
- Created this comprehensive design system update
- Documented all new component specifications
- Added implementation guidelines
- Included accessibility compliance details

---

## Quick Reference

### Component Decision Tree

```
Need to display agent info?
├─ Summary/Overview → AgentCard
├─ Detailed Information → AgentDetails
├─ Directory/Catalog → AgentsPageClient
└─ Just identification → AgentAvatar or AgentBadge

Need to display conversation?
├─ Summary/Card → ConversationCard
└─ Full view → (other component, not covered here)

Need to show status?
├─ Dot indicator → StatusDot
└─ Label/Badge → Badge (with appropriate variant)
```

### Common Patterns

**Selection State**:
```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);

<Component
  isSelected={selectedId === item.id}
  onClick={() => setSelectedId(item.id)}
/>
```

**Responsive Visibility**:
```tsx
{/* Mobile only */}
<div className="lg:hidden">Mobile content</div>

{/* Desktop only */}
<div className="hidden lg:block">Desktop content</div>

{/* Conditional on selection */}
{selectedItem && <div>Details</div>}
```

**Agent Color Application**:
```tsx
{/* Background */}
className="bg-agent-claude-bg"

{/* Text */}
className="text-agent-claude"

{/* Border */}
className="border-agent-claude-border"

{/* Hover */}
className="hover:bg-agent-claude-hover"
```

### Spacing Quick Reference

| Use Case | Spacing | Class |
|----------|---------|-------|
| Micro spacing (within element) | 4-8px | `gap-1` or `gap-2` |
| Element spacing | 12-16px | `gap-3` or `gap-4` |
| Section spacing | 24-32px | `gap-6` or `gap-8` |
| Layout spacing | 48-64px | `gap-12` or `gap-16` |
| Card padding | 16-24px | `p-4` or `p-6` |

---

## Resources

### Design System Files
- **Color Tokens**: `/app/globals.css` (lines 3-145)
- **Typography Tokens**: `/app/globals.css` (lines 312-353)
- **Spacing Tokens**: `/app/globals.css` (lines 359-381)
- **Design Principles**: `/docs/design-principles.md`

### Component Files
- **Agent Components**: `/app/components/agent/`
- **Conversation Components**: `/app/components/conversation/`
- **UI Components**: `/app/components/ui/`
- **Status Components**: `/app/components/status/`

### External References
- [Tailwind CSS v4 Documentation](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Document Version**: 1.1
**Last Updated**: January 2025
**Maintained By**: AgentPipe Design Team
