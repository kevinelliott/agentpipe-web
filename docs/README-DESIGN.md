# AgentPipe Web Design System Documentation

## Overview

This directory contains comprehensive documentation for the AgentPipe Web design system, including component specifications, design principles, and implementation guidelines.

---

## Documentation Index

### 1. Design System Update (Comprehensive Guide)
**File**: `/docs/design-system-update.md`

**Contents**:
- New component specifications (AgentCard, AgentDetails, AgentsPageClient)
- Updated component details (ConversationCard)
- Complete color system (14 agent colors)
- Typography and spacing guidelines
- Responsive design patterns
- Accessibility compliance details
- Implementation guidelines

**Audience**: Developers and designers implementing new features

**Length**: ~1000 lines, comprehensive reference

---

### 2. Design Principles
**File**: `/docs/design-principles.md`

**Contents**:
- 6 core design principles
- Color philosophy and psychology
- Typography system
- Spacing and layout guidelines
- Component patterns
- Responsive design strategy
- Accessibility checklist
- Dark mode implementation
- Animation guidelines
- Performance considerations

**Audience**: All team members, especially designers making decisions

**Length**: ~400 lines, philosophical and practical

---

### 3. Component Relationships
**File**: `/docs/component-relationships.md`

**Contents**:
- Component hierarchy diagrams
- Data flow visualizations
- State management patterns
- Responsive layout breakdowns
- Color theming system
- Interaction patterns
- File organization
- Usage examples

**Audience**: Developers understanding component architecture

**Length**: ~600 lines, visual and structural

---

### 4. Design System Summary (Legacy)
**File**: `/docs/design-system-summary.md`

**Contents**:
- Original design system overview
- Historical context
- Color systems (original 6 agents)
- Component patterns
- Migration notes

**Note**: This document predates the January 2025 updates. Refer to `design-system-update.md` for current specifications.

**Audience**: Historical reference

---

## Quick Navigation

### For New Developers

**Start Here**:
1. Read `/docs/design-principles.md` - Understand the "why"
2. Review `/docs/component-relationships.md` - See how components fit together
3. Reference `/docs/design-system-update.md` - Detailed specs for implementation

**Key Concepts to Understand**:
- Tailwind CSS v4 (CSS-based configuration, NO JavaScript config)
- CSS variables for all design tokens
- Mobile-first responsive design
- WCAG AA accessibility standards
- Agent color theming system

---

### For Designers

**Start Here**:
1. Read `/docs/design-principles.md` - Core philosophy and guidelines
2. Review `/docs/design-system-update.md` - Component specifications
3. Check `/app/globals.css` - All design tokens

**Design Resources**:
- Color palette with light/dark mode variants
- Typography scale (11px to 48px)
- Spacing system (4px grid)
- Component states (hover, focus, active, selected)
- Responsive breakpoints (640px, 768px, 1024px, 1280px, 1536px)

---

### For Product Managers

**Start Here**:
1. Scan `/docs/component-relationships.md` - Visual component overview
2. Read "Component Selection Guide" in `/docs/design-system-update.md`
3. Review accessibility features in `/docs/design-principles.md`

**Key Features**:
- 14 supported AI agents with distinct visual identities
- Master-detail layout for agent exploration
- Responsive design (mobile to desktop)
- Real-time conversation visualization
- Accessibility-first approach

---

## Component Catalog

### New Components (January 2025)

#### AgentCard
- **Purpose**: Compact agent summary with selection state
- **Location**: `/app/components/agent/AgentCard.tsx`
- **Features**: Avatar, name, tagline, stats grid (3 metrics)
- **States**: Default, hover, selected, focus
- **Documentation**: `/docs/design-system-update.md` (lines 204-344)

#### AgentDetails
- **Purpose**: Comprehensive agent information panel
- **Location**: `/app/components/agent/AgentDetails.tsx`
- **Features**: Full description, stats, models, external links
- **Responsive**: Full-screen (mobile), sticky panel (desktop)
- **Documentation**: `/docs/design-system-update.md` (lines 346-493)

#### AgentsPageClient
- **Purpose**: Master-detail layout for agents directory
- **Location**: `/app/components/agent/AgentsPageClient.tsx`
- **Features**: Summary stats, category grouping, responsive layout
- **Layout**: 2-column grid + sticky details panel
- **Documentation**: `/docs/design-system-update.md` (lines 495-621)

### Updated Components

#### ConversationCard
- **Purpose**: Conversation summary card
- **Location**: `/app/components/conversation/ConversationCard.tsx`
- **Updates**: Improved hierarchy, AI summary support, avatar positioning
- **Documentation**: `/docs/design-system-update.md` (lines 623-708)

### Base Components

#### AgentAvatar
- **Purpose**: Visual agent identification
- **Location**: `/app/components/agent/AgentAvatar.tsx`
- **Sizes**: xs (20px), sm (24px), md (32px), lg (40px), xl (48px)
- **Agents**: 14 supported (Claude, Gemini, Copilot, etc.)

#### AgentBadge
- **Purpose**: Compact agent label
- **Location**: `/app/components/agent/AgentBadge.tsx`
- **Features**: Color dot + label text

#### StatusDot
- **Purpose**: Status indicator
- **Location**: `/app/components/status/StatusDot.tsx`
- **States**: active, completed, error, interrupted, pending
- **Features**: Optional pulse animation

#### Badge
- **Purpose**: General-purpose badge
- **Location**: `/app/components/ui/Badge.tsx`
- **Variants**: default, primary, success, error, warning, info
- **Sizes**: default, lg

#### Card, Button
- **Purpose**: Base UI components
- **Location**: `/app/components/ui/`
- **Usage**: Generic containers and actions

---

## Design Tokens Reference

### Colors

**Agent Colors (14)**:
- Claude: `#cc785c` (copper)
- Gemini: `#4f7fd9` (blue)
- Copilot: `#8b5cf6` (purple)
- Cursor: `#14b8a6` (teal)
- Factory: `#0891b2` (cyan)
- Groq: `#7c3aed` (royal purple)
- Kimi: `#0891b2` (cyan)
- Amp: `#7c3aed` (purple)
- Codex: `#6366f1` (indigo)
- OpenCode: `#06b6d4` (bright cyan)
- Ollama: `#f97316` (orange)
- Qoder: `#ec4899` (pink)
- Qwen: `#f59e0b` (amber)
- Crush: `#ec4899` (pink)

Each has 4 variations: base, bg, border, hover (+ dark mode)

**Status Colors (5)**:
- Active: `#22c55e` (green)
- Completed: `#3b82f6` (blue)
- Error: `#ef4444` (red)
- Interrupted: `#f59e0b` (amber)
- Pending: `#6b7280` (gray)

**Semantic Colors**:
- Primary: `#3b82f6` (blue)
- Background: `#fafafa` light / `#09090b` dark
- Card: `#ffffff` light / `#18181b` dark
- Border: `#e4e4e7` light / `#27272a` dark
- Foreground: `#09090b` light / `#fafafa` dark

### Typography

**Sizes**: 2xs (11px), xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px), 4xl (36px), 5xl (48px)

**Weights**: normal (400), medium (500), semibold (600), bold (700)

**Line Heights**: tight (1.25), snug (1.375), normal (1.5), relaxed (1.625)

### Spacing

**Scale**: 4px grid
- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- 12 = 48px
- 16 = 64px

### Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

---

## Implementation Patterns

### Importing Components

```typescript
// Always import from central index
import { AgentCard, AgentDetails, AgentAvatar } from '@/app/components';

// Never import directly
// ❌ import { AgentCard } from '@/app/components/agent/AgentCard';
```

### Using Design Tokens

```tsx
// Agent colors
className="bg-agent-claude-bg text-agent-claude border-agent-claude-border"

// Status colors
className="bg-status-active text-status-active-foreground"

// Semantic colors
className="bg-card text-foreground border-border"
```

### Selection Pattern

```typescript
const [selectedId, setSelectedId] = useState<string | null>(null);

<AgentCard
  isSelected={selectedId === agent.id}
  onClick={() => setSelectedId(agent.id)}
/>

<AgentDetails
  agent={agents.find(a => a.id === selectedId)}
/>
```

### Responsive Visibility

```tsx
{/* Mobile only */}
<div className="lg:hidden">Mobile content</div>

{/* Desktop only */}
<div className="hidden lg:block">Desktop content</div>
```

---

## Accessibility Standards

All components meet **WCAG 2.1 Level AA**:

- Color contrast ≥ 4.5:1 for text
- Touch targets ≥ 44×44px
- Keyboard navigation fully supported
- Screen reader compatible
- Focus indicators visible (2px blue outline)
- Reduced motion support

**Testing Tools**:
- axe DevTools (browser extension)
- WAVE (web accessibility evaluation)
- Lighthouse (Chrome DevTools)
- NVDA/JAWS (screen readers)

---

## File Locations

### Documentation
```
/docs/
├── README-DESIGN.md              # This file
├── design-system-update.md       # Comprehensive guide (NEW)
├── component-relationships.md    # Visual diagrams (NEW)
├── design-principles.md          # Core principles
├── design-system-summary.md      # Legacy overview
└── architecture.md               # System architecture
```

### Design System Code
```
/app/
├── globals.css                   # All design tokens (CSS variables)
├── components/
│   ├── index.ts                  # Central exports
│   ├── agent/                    # Agent components
│   │   ├── AgentCard.tsx         # NEW
│   │   ├── AgentDetails.tsx      # NEW
│   │   ├── AgentsPageClient.tsx  # NEW
│   │   ├── AgentAvatar.tsx
│   │   └── AgentBadge.tsx
│   ├── ui/                       # Base UI
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   ├── status/                   # Status indicators
│   │   └── StatusDot.tsx
│   ├── conversation/             # Conversation components
│   │   └── ConversationCard.tsx  # UPDATED
│   └── marketing/                # Marketing pages
│       ├── Hero.tsx              # UPDATED
│       └── SupportedAgents.tsx   # UPDATED
└── lib/
    ├── agentMetadata.ts          # Agent data definitions
    └── agentStats.ts             # Stats type definitions
```

### Configuration
```
/
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS + Tailwind v4
└── next.config.ts                # Next.js configuration
```

---

## Common Questions

### Q: Why Tailwind CSS v4?
**A**: Tailwind v4 uses CSS-based configuration instead of JavaScript, providing better performance and native CSS variable integration. This aligns with our design token strategy.

### Q: Where are agent colors defined?
**A**: `/app/globals.css` lines 180-254 (light mode) and 470-544 (dark mode). They're automatically mapped to Tailwind utilities via the `@theme` directive.

### Q: How do I add a new agent?
**A**:
1. Add color scheme to `/app/globals.css` (both light/dark sections)
2. Add to `AgentType` in `/app/components/agent/AgentAvatar.tsx`
3. Add metadata to `/app/lib/agentMetadata.ts`
4. Add to marketing components if public-facing

### Q: How do I test accessibility?
**A**:
1. Use keyboard-only navigation (Tab, Enter, Space)
2. Run axe DevTools in browser
3. Test with NVDA or VoiceOver screen reader
4. Verify color contrast with WebAIM checker
5. Check Lighthouse accessibility score

### Q: What's the difference between AgentCard and AgentDetails?
**A**: AgentCard is a compact summary for lists/grids (selectable). AgentDetails is a comprehensive view for a single agent (side panel or modal).

### Q: When should I use AgentsPageClient vs building my own layout?
**A**: Use AgentsPageClient for a full agents directory page with master-detail layout. Build your own if you need a different layout pattern (e.g., tabs, modal-based, etc.).

---

## Changelog

### January 2025 (v1.1)
- Added 3 new agent components (AgentCard, AgentDetails, AgentsPageClient)
- Updated ConversationCard with improved hierarchy
- Expanded to 14 agent color schemes (from 9)
- Created comprehensive documentation suite
- Added component relationship diagrams
- Enhanced accessibility features

### December 2024 (v1.0)
- Initial design system
- 9 agent colors
- Base component library
- Dark mode support
- Design principles documented

---

## Support & Contribution

### Getting Help
1. Check this documentation index
2. Review relevant detailed docs
3. Check component source code
4. Open an issue on GitHub

### Contributing
1. Read `/docs/design-principles.md` first
2. Follow existing patterns in `/docs/design-system-update.md`
3. Ensure accessibility compliance
4. Update documentation with changes
5. Test across breakpoints and themes

### Design Reviews
Submit design proposals with:
- Component specifications
- Accessibility considerations
- Responsive behavior
- Color contrast verification
- Code examples

---

## External Resources

### Design System Inspiration
- [Material Design](https://material.io/design)
- [Inclusive Components](https://inclusive-components.design/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)

### Technical
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Accessibility](https://react.dev/learn/accessibility)

---

**Last Updated**: January 2025
**Maintained By**: AgentPipe Design Team
**Version**: 1.1
