# AgentPipe Web Quick Start Guide

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 3. Try Dark Mode

Click the theme toggle button in the top-right corner to switch between light and dark modes. Your preference is automatically saved.

## Component Usage Examples

### Using Agent Components

```tsx
import { AgentAvatar } from '@/app/components/agent/AgentAvatar';
import { MessageBubble } from '@/app/components/agent/MessageBubble';

// Display an agent avatar
<AgentAvatar agent="claude" size="md" />

// Display a message
<MessageBubble
  agent="claude"
  agentName="Claude"
  content="Hello! I'm Claude."
  timestamp={new Date()}
  tokens={120}
  cost={0.0012}
/>
```

### Using UI Components

```tsx
import { Button } from '@/app/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';

// Button
<Button variant="primary" size="md">
  Click Me
</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <p>Card content</p>
</Card>

// Badge
<Badge variant="success">Active</Badge>
```

### Using Status Components

```tsx
import { StatusDot } from '@/app/components/status/StatusDot';
import { WebSocketStatus } from '@/app/components/status/WebSocketStatus';
import { EmptyState } from '@/app/components/status/EmptyState';

// Status dot with pulse
<StatusDot status="active" pulse />

// WebSocket indicator
<WebSocketStatus status="connected" />

// Empty state
<EmptyState
  icon={<YourIconComponent />}
  title="No data"
  description="Description here"
  action={{
    label: "Action",
    onClick: () => {}
  }}
/>
```

### Using Theme

```tsx
'use client';

import { useTheme } from '@/app/components/theme/ThemeProvider';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
    </div>
  );
}
```

## Available Agent Types

- `claude` - Claude (copper color)
- `gemini` - Gemini (blue color)
- `gpt` - GPT (green color)
- `amp` - AMP (purple color)
- `o1` - O1 (red color)
- `default` - Default (gray color)

## Available Status Types

- `active` - Green, for running conversations
- `completed` - Blue, for finished conversations
- `error` - Red, for failed conversations
- `interrupted` - Amber, for paused conversations
- `pending` - Gray, for queued conversations

## Color Customization

All colors are defined in `/app/globals.css` as CSS custom properties. To customize:

1. Open `/app/globals.css`
2. Find the color section in `:root` or `.dark`
3. Modify the hex values
4. Colors automatically update throughout the app

Example:
```css
:root {
  --agent-claude: #cc785c;  /* Change this to customize Claude's color */
}
```

## Component Props Reference

### Button Props
- `variant`: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
- `size`: 'xs' | 'sm' | 'md' | 'lg'
- `isIcon`: boolean (for icon-only buttons)

### AgentAvatar Props
- `agent`: AgentType (required)
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `label`: string (custom label, defaults to agent initials)

### MessageBubble Props
- `agent`: AgentType (required)
- `agentName`: string (required)
- `content`: string (required)
- `timestamp`: Date (required)
- `tokens`: number (optional)
- `cost`: number (optional)

### MetricCard Props
- `label`: string (required)
- `value`: string | number (required)
- `change`: { value: string, type: 'positive' | 'negative' | 'neutral' } (optional)
- `icon`: ReactNode (optional)

### ConversationCard Props
- `id`: string
- `title`: string
- `participants`: Array<{ type: AgentType, name: string }>
- `status`: StatusType
- `statusLabel`: string
- `lastActivity`: string
- `preview`: string
- `messageCount`: number
- `tokenCount`: string
- `onClick`: () => void

## Tailwind CSS Classes

All design system tokens are available as Tailwind utilities:

### Colors
```tsx
// Agent colors
<div className="bg-agent-claude text-agent-claude border-agent-claude-border" />

// Status colors
<div className="bg-status-active text-status-error border-status-completed" />

// Semantic colors
<div className="bg-background text-foreground border-border" />
```

### Spacing
```tsx
<div className="p-4 m-6 gap-3" /> // Uses design system spacing scale
```

### Typography
```tsx
<p className="text-sm font-medium leading-relaxed" />
```

### Animations
```tsx
<div className="animate-pulse" />
<div className="animate-message-appear" />
<div className="animate-shimmer" />
```

## File Locations

- **Components**: `/app/components/`
- **Types**: `/app/types/index.ts`
- **Styles**: `/app/globals.css`
- **Tailwind Config**: `/tailwind.config.ts`
- **Design System**: `/design-system/index.html`
- **Documentation**: `/docs/`

## Troubleshooting

### Theme not persisting
- Check browser console for localStorage errors
- Ensure cookies/storage is enabled

### Colors not showing correctly
- Verify CSS custom properties are loaded
- Check browser DevTools computed styles
- Ensure globals.css is imported in layout.tsx

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check that all imports use correct paths
- Verify TypeScript version is 5.0+

### Build errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Next.js version is 15.0+

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Need Help?

1. Check `/docs/component-guide.md` for detailed component usage
2. Review `/docs/design-principles.md` for design guidelines
3. View `/design-system/index.html` for visual examples
4. Consult `/docs/implementation-summary.md` for architecture overview
