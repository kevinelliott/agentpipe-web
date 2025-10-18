# AgentPipe Web Design Principles

## Overview

AgentPipe Web is a technical dashboard for visualizing real-time and historical multi-agent AI conversations. The design system is built with accessibility, performance, and data-dense interfaces in mind.

## Core Design Principles

### 1. Clarity Over Cleverness

**Principle**: Prioritize intuitive, self-explanatory interfaces over novel but confusing patterns.

**Application**:
- Use standard UI patterns for navigation, search, and filtering
- Provide clear labels and helper text throughout the interface
- Avoid trendy design patterns that sacrifice usability
- Ensure every interactive element has a clear purpose

### 2. Progressive Disclosure

**Principle**: Show essential information first, reveal complexity gradually.

**Application**:
- Display conversation summaries in list/card views, full details on click
- Show key metrics upfront, provide detailed analytics on demand
- Use expandable sections for advanced filtering options
- Implement tooltips and helper text for complex features

### 3. Feedback & Affordance

**Principle**: Every interaction should provide clear visual feedback.

**Application**:
- All interactive elements have distinct hover, focus, and active states
- WebSocket connection status is always visible
- Real-time updates animate smoothly to draw attention
- Loading states use skeleton loaders to maintain layout stability
- Error states are clearly communicated with contextual messages

### 4. Consistency

**Principle**: Maintain predictable patterns across the entire application.

**Application**:
- Agent colors are consistent throughout (avatars, badges, messages)
- Status indicators use the same color system everywhere
- Spacing follows a consistent 4px/8px grid system
- Typography hierarchy is standardized across all views
- Component patterns are reusable and composable

### 5. Performance

**Principle**: Design should feel instant - use optimistic UI updates and skeleton screens.

**Application**:
- Skeleton loaders for async content loading
- Smooth transitions (150ms) prevent jarring state changes
- Real-time updates animate in gracefully (message-appear animation)
- Virtual scrolling for long conversation lists (implementation detail)
- Lazy loading for images and non-critical content

### 6. Accessibility First

**Principle**: Design for all users, including those with disabilities.

**Application**:
- WCAG 2.1 AA compliance minimum (4.5:1 contrast ratios)
- All touch targets meet 44x44px minimum size
- Keyboard navigation fully supported with visible focus indicators
- Screen reader support with semantic HTML and ARIA labels
- Color is never the only indicator of meaning
- Reduced motion support for animations

## Color Philosophy

### Agent Colors

Each AI agent has a distinctive color palette for quick identification:

- **Claude**: Warm copper (#cc785c) - Professional, trustworthy
- **Gemini**: Sky blue (#4f7fd9) - Intelligent, analytical
- **GPT**: Forest green (#0d8968) - Reliable, established
- **AMP**: Royal purple (#7c3aed) - Creative, powerful
- **O1**: Cardinal red (#dc2626) - Bold, direct
- **Default**: Slate gray (#64748b) - Neutral, flexible

### Status Colors

Status indicators follow universal conventions:

- **Active**: Green (#22c55e) - Currently running
- **Completed**: Blue (#3b82f6) - Successfully finished
- **Error**: Red (#ef4444) - Failed or error state
- **Interrupted**: Amber (#f59e0b) - Paused or interrupted
- **Pending**: Gray (#6b7280) - Waiting to start

### Semantic Colors

- **Background**: Light gray (#fafafa) / Dark gray (#09090b)
- **Elevated surfaces**: White (#ffffff) / Charcoal (#18181b)
- **Borders**: Light (#e4e4e7) / Dark (#27272a)
- **Text**: Near-black (#09090b) / Off-white (#fafafa)

All colors are tested for WCAG AA compliance in both light and dark modes.

## Typography

### Font Stack

**Sans-serif**: System font stack for optimal performance and native feel
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
```

**Monospace**: Developer-friendly fonts for code display
```css
'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Roboto Mono',
ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas
```

### Type Scale

Optimized for data-dense interfaces:

- **2xs**: 11px - Micro labels, timestamps
- **xs**: 12px - Captions, helper text
- **sm**: 14px - Body text, UI elements
- **base**: 16px - Primary body text
- **lg**: 18px - Subheadings
- **xl**: 20px - Section headings
- **2xl**: 24px - Page subheadings
- **3xl**: 30px - Page headings
- **4xl**: 36px - Hero headings

### Hierarchy Guidelines

1. **Hero/Page Title**: 4xl, bold, tight line height
2. **Section Heading**: 2xl, semibold, tight line height
3. **Subsection Heading**: xl, semibold, snug line height
4. **Card Title**: lg, semibold, tight line height
5. **Body Text**: sm (14px), normal, relaxed line height
6. **Metadata**: xs (12px), normal, for timestamps and counts

## Spacing System

Based on an 8px grid for vertical rhythm and 4px for fine-tuning:

**Base units**: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px)

**Usage patterns**:
- Micro spacing (1-2): Between related elements
- Element spacing (3-4): Within components
- Section spacing (6-8): Between components
- Layout spacing (12-16): Between major sections

## Component Patterns

### Cards

**Purpose**: Container for related content

**Variants**:
- Default: Static display
- Interactive: Clickable with hover states
- Elevated: Increased shadow for emphasis

**Usage**:
- Conversation summaries
- Metric displays
- Content grouping

### Badges

**Purpose**: Compact status or label indicators

**Variants**: Default, Primary, Success, Error, Warning, Info

**Usage**:
- Conversation status
- Agent type indicators
- Metric change indicators

### Agent Avatars

**Purpose**: Quick visual identification of AI agents

**Sizes**: sm (24px), md (32px), lg (40px), xl (48px)

**Usage**:
- Message headers
- Conversation participant lists
- Agent selection interfaces

### Message Bubbles

**Purpose**: Display individual messages from agents

**Features**:
- Agent-specific background colors
- Header with avatar, name, timestamp
- Content with code block support
- Footer with token count and cost

**Animations**: Slide-up and fade-in on new messages

### WebSocket Status

**Purpose**: Real-time connection status indicator

**States**:
- Connected: Green pulsing dot
- Connecting: Amber pulsing dot
- Disconnected: Red static dot

**Placement**: Persistent in header/toolbar

## Responsive Design

### Breakpoints

- **sm**: 640px - Small tablets
- **md**: 768px - Tablets
- **lg**: 1024px - Small desktops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Large displays

### Mobile-First Strategy

1. Start with mobile layout (320px+)
2. Progressively enhance for larger screens
3. Conversation cards stack on mobile, grid on tablet+
4. Sidebar hidden on mobile, visible on desktop (lg+)
5. Metrics cards: 1 column mobile, 2 tablet, 4 desktop

## Animation Guidelines

### Timing

- **Fast**: 100ms - Micro-interactions (hover, focus)
- **Base**: 150ms - Standard transitions
- **Slow**: 300ms - Page transitions, modals
- **Slower**: 500ms - Complex animations

### Easing

- **ease-out**: For entrances
- **ease-in**: For exits
- **ease-in-out**: For state changes

### Key Animations

1. **message-appear**: New messages slide up with fade (300ms)
2. **pulse**: Active status indicators (2s loop)
3. **connection-pulse**: WebSocket connection indicator (2s loop)
4. **shimmer**: Skeleton loader animation (2s loop)

### Reduced Motion

Respect `prefers-reduced-motion: reduce`:
- Disable decorative animations
- Keep essential state change animations
- Remove auto-playing carousels

## Accessibility Checklist

### Visual

- [ ] Minimum 4.5:1 contrast ratio for text
- [ ] Minimum 3:1 contrast ratio for UI components
- [ ] Color is not the only indicator of meaning
- [ ] Focus indicators are clearly visible (2px blue outline)
- [ ] Touch targets minimum 44x44px

### Interaction

- [ ] Keyboard navigation fully functional
- [ ] Tab order follows visual order
- [ ] Skip links for main content
- [ ] No keyboard traps
- [ ] Tooltips accessible via keyboard

### Semantic

- [ ] Semantic HTML elements used correctly
- [ ] ARIA labels for dynamic content
- [ ] Live regions for real-time updates
- [ ] Alternative text for all images
- [ ] Form labels associated with inputs

### Testing

- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Test keyboard-only navigation
- [ ] Test with browser zoom (200%)
- [ ] Test with color blindness simulators
- [ ] Validate HTML and ARIA

## Dark Mode Strategy

### Implementation

- CSS variables for all colors
- System preference detection by default
- Manual override persisted to localStorage
- Instant theme switching without flash

### Color Adjustments

**Dark mode enhancements**:
- Increased contrast for better readability
- Darker shadows for depth (0.3-0.8 opacity)
- Adjusted agent colors for dark backgrounds
- Lighter text on dark surfaces

## Performance Considerations

### Critical Rendering Path

1. Inline critical CSS (design tokens)
2. Defer non-critical fonts
3. Lazy load below-fold images
4. Use system fonts when possible

### Asset Optimization

- SVG icons instead of icon fonts
- WebP images with PNG/JPG fallbacks
- Responsive images with `srcset`
- Lazy loading for conversation history

### Real-time Updates

- WebSocket connection pooling
- Debounce rapid updates (100ms)
- Virtual scrolling for long lists
- Optimistic UI updates

## Implementation Notes

### Next.js Integration

- Use Server Components where possible
- Client Components for interactive elements
- Streaming SSR for initial page load
- Route prefetching for instant navigation

### State Management

- Server state: React Query/SWR
- URL state: Next.js router params
- Client state: React Context/Zustand
- Form state: React Hook Form

### Testing Strategy

- Visual regression: Chromatic/Percy
- Unit tests: Jest + Testing Library
- E2E tests: Playwright
- Accessibility: axe-DevTools

## Design Tokens

All design tokens are defined as CSS custom properties in `/design-system/index.html`. These should be imported into Tailwind CSS configuration for consistency across the application.

### Token Categories

1. **Colors**: Brand, agent, status, semantic
2. **Typography**: Font families, sizes, weights, line heights
3. **Spacing**: Consistent 4px/8px grid system
4. **Borders**: Radius values for different contexts
5. **Shadows**: Depth hierarchy for elevation
6. **Transitions**: Timing and easing functions
7. **Z-index**: Layering system for modals, dropdowns, etc.

## Further Reading

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Components](https://inclusive-components.design/)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)
- [WebAIM Resources](https://webaim.org/resources/)

## Changelog

**v1.0 (2025-01-17)**
- Initial design system
- Agent color palette
- Component library
- Dark mode support
- Accessibility guidelines
- Animation patterns
- WebSocket status indicators
- Code syntax highlighting
