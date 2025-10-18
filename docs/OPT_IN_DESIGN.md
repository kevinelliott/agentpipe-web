# Opt-In Design & Privacy

## Overview

AgentPipe Web operates on an **opt-in model** for data collection. By default, no conversation data is sent from AgentPipe CLI/TUI to the web application. Users must explicitly enable the bridge feature to share their conversations.

This document outlines the design approach for encouraging opt-in while respecting user privacy.

## Core Principles

1. **Explicit Consent**: Data is never collected without user permission
2. **Transparency**: Clear explanation of what data is collected and why
3. **Control**: Easy to enable and disable at any time
4. **Value Proposition**: Clear benefits of opting in
5. **Privacy First**: No tracking or analytics without consent

## Empty State Design

When no data has been shared yet, the UI should include a compelling but respectful CTA.

### Realtime Dashboard Empty State

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│              🚀 Welcome to AgentPipe Web              │
│                                                        │
│     View your multi-agent conversations in realtime   │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │  To get started, enable data sharing in      │   │
│  │  your AgentPipe CLI configuration:           │   │
│  │                                              │   │
│  │  1. Open your AgentPipe config file          │   │
│  │  2. Enable the bridge feature                │   │
│  │  3. Set the URL to this instance             │   │
│  │                                              │   │
│  │  [View Setup Guide]  [Copy Configuration]   │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│              Learn what data is shared →              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Historical Search Empty State

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│              📚 No Conversations Yet                   │
│                                                        │
│     Start using AgentPipe with data sharing enabled   │
│     to see your conversation history here.            │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  What you'll see here:                       │   │
│  │  • Full conversation history                 │   │
│  │  • Searchable messages                       │   │
│  │  • Cost and performance metrics              │   │
│  │  • Agent comparisons                         │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│              [Enable Data Sharing]                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Setup Guide Modal

When user clicks "View Setup Guide", show detailed instructions:

```
┌──────────────────────────────────────────────────────────┐
│  Enable Data Sharing                           [✕ Close] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Follow these steps to start sharing your AgentPipe     │
│  conversations with this web interface:                 │
│                                                          │
│  Step 1: Locate Your Config File                        │
│  ─────────────────────────────────────────────────────  │
│  Your AgentPipe configuration is typically at:          │
│  ~/.agentpipe/config.yaml                               │
│                                                          │
│  Step 2: Add Bridge Configuration                       │
│  ─────────────────────────────────────────────────────  │
│  Add this to your config.yaml:                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ bridge:                                        │    │
│  │   enabled: true                                │    │
│  │   type: http                                   │    │
│  │   url: https://your-instance.com/api/ingest    │    │
│  │   auth:                                        │    │
│  │     type: bearer                               │    │
│  │     token: YOUR_API_KEY_HERE                   │    │
│  └────────────────────────────────────────────────┘    │
│                              [Copy to Clipboard]        │
│                                                          │
│  Step 3: Get Your API Key                               │
│  ─────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────┐    │
│  │ sk_live_abc123def456...                        │    │
│  └────────────────────────────────────────────────┘    │
│                [Generate New Key] [Copy Key]            │
│                                                          │
│  Step 4: Test the Connection                            │
│  ─────────────────────────────────────────────────────  │
│  Run a test conversation:                               │
│  agentpipe run --config your-config.yaml                │
│                                                          │
│  You should see your conversation appear here in        │
│  real-time!                                             │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  ℹ️  What data is shared?                       │    │
│  │  • Conversation metadata (mode, participants)  │    │
│  │  • Messages (content, timestamps, metrics)     │    │
│  │  • Performance data (tokens, cost, duration)   │    │
│  │                                                │    │
│  │  What is NOT shared?                           │    │
│  │  • Your AgentPipe configuration                │    │
│  │  • API keys to AI services                     │    │
│  │  • Local file system data                      │    │
│  │  • Any data from conversations when bridge     │    │
│  │    is disabled                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│                                        [Done]            │
└──────────────────────────────────────────────────────────┘
```

## Privacy Information Page

Create a dedicated `/privacy` page explaining data handling:

### Key Points to Cover

1. **What We Collect** (only when opted in)
   - Conversation metadata
   - Message content and timestamps
   - Performance metrics (tokens, costs, duration)
   - Agent types and versions

2. **What We Don't Collect**
   - AgentPipe configuration files
   - API keys or credentials
   - File system data
   - Analytics or tracking when not opted in

3. **How Data is Used**
   - Display in realtime dashboard
   - Store in your database for historical search
   - Generate aggregate metrics
   - Never sold or shared with third parties

4. **Data Retention**
   - Stored as long as you want
   - Can be deleted at any time
   - Export available in multiple formats

5. **Security**
   - API key authentication required
   - HTTPS encryption in transit
   - Database encryption at rest (if configured)
   - No public access without authentication

## Configuration Template Generator

Provide a web-based form to generate the configuration:

```
┌──────────────────────────────────────────────────────────┐
│  Configuration Generator                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Instance URL:                                           │
│  ┌────────────────────────────────────────────────┐    │
│  │ https://agentpipe-web.yourdomain.com           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  API Key:                                                │
│  ┌────────────────────────────────────────────────┐    │
│  │ sk_live_abc123...                    [Generate]│    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Optional Settings:                                      │
│  ☐ Retry on failure (max 3 attempts)                    │
│  ☐ Include agent announcements                          │
│                                                          │
│  Generated Configuration:                                │
│  ┌────────────────────────────────────────────────┐    │
│  │ bridge:                                        │    │
│  │   enabled: true                                │    │
│  │   type: http                                   │    │
│  │   url: https://agentpipe-web.yourdomain.com... │    │
│  │   auth:                                        │    │
│  │     type: bearer                               │    │
│  │     token: sk_live_abc123...                   │    │
│  │   retry_max: 3                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Copy to Clipboard]  [Download config.yaml]            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## API Key Management

Users should be able to manage API keys within the web interface:

### API Keys Page (`/settings/api-keys`)

```
┌──────────────────────────────────────────────────────────┐
│  API Keys                                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Manage keys for AgentPipe CLI to send data             │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Production Key                       [Revoke] │    │
│  │  sk_live_abc123...                             │    │
│  │  Created: 2025-10-01 • Last used: 2 hours ago  │    │
│  │  45 conversations • 1,234 messages              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Test Key                             [Revoke] │    │
│  │  sk_test_def456...                             │    │
│  │  Created: 2025-09-15 • Last used: Never        │    │
│  │  0 conversations                                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Generate New Key]                                      │
│                                                          │
│  ⚠️  Never share your API keys or commit them to        │
│     version control.                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Banner for Active Sharing

When data sharing is active, show a subtle indicator:

### Header Banner (Optional, Dismissible)

```
┌──────────────────────────────────────────────────────────┐
│  ℹ️  AgentPipe conversations are being shared in         │
│     realtime. [Manage Settings] [Dismiss]                │
└──────────────────────────────────────────────────────────┘
```

## Documentation Updates

### AgentPipe Integration Guide

Update `docs/AGENTPIPE_INTEGRATION.md` to emphasize opt-in:

**Add this section at the beginning:**

```markdown
## Important: Opt-In Only

⚠️ **AgentPipe does NOT send data to AgentPipe Web by default.**

The bridge feature must be explicitly enabled in your configuration. No data is collected or transmitted unless you choose to enable it.

### Why Enable Data Sharing?

- **Realtime Monitoring**: View conversations as they happen
- **Historical Search**: Search through past conversations
- **Performance Analytics**: Track costs, tokens, and response times
- **Agent Comparison**: Compare different AI models and agents
- **Team Collaboration**: Share insights with your team (optional)

### Privacy & Security

- Data is only sent when bridge is enabled
- You control what instances receive your data
- API key authentication required
- HTTPS encryption
- Data can be deleted at any time
- Full transparency on what's collected
```

## Implementation Checklist

### Backend

- [ ] API key generation and management endpoints
- [ ] API key validation middleware
- [ ] Rate limiting per API key
- [ ] API key usage tracking (last used, message count)
- [ ] Revocation mechanism

### Frontend

- [ ] Empty state with CTA (realtime dashboard)
- [ ] Empty state with CTA (historical search)
- [ ] Setup guide modal with copy-to-clipboard
- [ ] Configuration generator page
- [ ] API key management page
- [ ] Privacy information page (`/privacy`)
- [ ] Link to setup guide in header/nav

### Documentation

- [ ] Update AGENTPIPE_INTEGRATION.md with opt-in emphasis
- [ ] Create OPT_IN_DESIGN.md (this document)
- [ ] Add privacy section to README.md
- [ ] Update PROJECT_SUMMARY.md with opt-in approach

### User Flow

1. User visits AgentPipe Web → sees empty state with CTA
2. User clicks "View Setup Guide" → modal with instructions
3. User generates API key → copy configuration
4. User adds config to AgentPipe → bridge enabled
5. User runs AgentPipe → data appears in realtime
6. User can disable/revoke at any time

## UI Components Needed

### 1. EmptyStateWithCTA Component

```tsx
interface EmptyStateProps {
  title: string;
  description: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}
```

### 2. SetupGuideModal Component

```tsx
interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  instanceUrl: string;
}
```

### 3. ConfigGenerator Component

```tsx
interface ConfigGeneratorProps {
  onGenerate: (config: BridgeConfig) => void;
  defaultUrl?: string;
}
```

### 4. APIKeyManager Component

```tsx
interface APIKeyManagerProps {
  keys: APIKey[];
  onGenerate: () => void;
  onRevoke: (keyId: string) => void;
}
```

## Messaging Guidelines

### Do's ✅

- Use clear, simple language
- Explain benefits transparently
- Provide easy setup instructions
- Make opt-out equally easy
- Link to detailed privacy info

### Don'ts ❌

- Use dark patterns to trick users
- Hide the opt-out mechanism
- Collect data before consent
- Make privacy policy hard to find
- Shame users for not opting in

## Example Copy

### CTA Headline
"Unlock Real-Time Insights for Your Multi-Agent Conversations"

### CTA Description
"Enable secure data sharing to view your AgentPipe conversations in real-time, search your history, and track performance metrics. Your data stays under your control."

### Button Text
- Primary: "Enable Data Sharing"
- Secondary: "Learn More"
- Tertiary: "View Privacy Policy"

### Success Message (after enabling)
"✅ Data sharing enabled! Run an AgentPipe conversation and it will appear here in real-time."

### Confirmation (before disabling)
"Are you sure you want to disable data sharing? Realtime updates will stop, but your historical data will remain accessible."

## Compliance Considerations

If deploying publicly or for organizations:

1. **GDPR Compliance** (EU users)
   - Right to access data
   - Right to deletion
   - Data portability
   - Consent mechanisms

2. **CCPA Compliance** (California users)
   - Disclosure of data collection
   - Opt-out mechanism
   - Do Not Sell notice

3. **SOC 2** (Enterprise)
   - Audit logging
   - Access controls
   - Data encryption
   - Incident response

## Metrics to Track

Monitor opt-in effectiveness:
- Opt-in rate (visitors → enabled bridge)
- Time to first shared conversation
- API key generation rate
- Setup guide completion rate
- Support requests related to setup

## Related Files

- `app/components/EmptyStateWithCTA.tsx` (to be created)
- `app/components/SetupGuideModal.tsx` (to be created)
- `app/settings/api-keys/page.tsx` (to be created)
- `app/privacy/page.tsx` (to be created)
- `docs/AGENTPIPE_INTEGRATION.md` (update)
- `README.md` (add privacy section)
