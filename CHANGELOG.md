# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - 2025-10-22

### Added
- **AI Conversation Summaries**: Full support for AI-generated conversation summaries
  - Database schema with 10 new fields (text, agent type, model, tokens, cost, duration, timestamp, JSON data)
  - `SummaryCard` component with primary-tinted gradient design and sparkles icon
  - Expand/collapse functionality for long summaries (>500 characters)
  - Metadata footer displaying model, tokens (input/output breakdown), cost, and duration
  - Full WCAG AA accessibility compliance with ARIA labels and keyboard navigation
  - Summary preview on conversation cards (2-line truncated with visual distinction)
  - Graceful fallback to initial prompt when summary not available
  - Zod validation for summary data with 10KB text limit
  - API integration: ingest, session detail, and session list endpoints
  - Real-time summary updates via SSE when conversation completes
  - Backward compatible - all summary fields nullable for existing conversations

### Changed
- Updated `conversation.completed` event schema to include optional `summary` field
- Enhanced `ConversationCard` to prioritize AI summary over initial prompt when available
- Updated session detail page to display summary card after metrics, before participants

### Technical
- New TypeScript interfaces: `ConversationSummaryData`, updated `Conversation` interface
- Prisma schema migration with summary fields
- Zod schema: `conversationSummarySchema` with comprehensive validation
- React hooks for expand/collapse state management
- Cost and duration formatting utilities in `SummaryCard`

## [0.0.1] - 2025-10-21

### Added
- Initial release of AgentPipe Web interface
- Real-time dashboard showing live conversations and recent messages
- Server-Sent Events (SSE) streaming for real-time updates
- Event Stream Debug page with comprehensive event monitoring
  - Collapsible event cards with expand/collapse functionality
  - Copy to clipboard for JSON event data
  - Event filtering and search
  - Pause/resume event stream
  - Export events as JSON
  - Buffer statistics display
  - Color-coded event types
- Session detail pages with real-time message updates
- Markdown rendering in message bubbles
  - Support for headings, lists, code blocks, blockquotes, links
  - GitHub Flavored Markdown support via remark-gfm
  - Syntax highlighting for code blocks
- AgentPipe CLI webhook integration
  - `/api/ingest` endpoint for receiving events from AgentPipe bridge
  - Support for conversation.started, message.created, conversation.completed, conversation.error, and bridge.test events
  - Bearer token authentication
  - Zod schema validation
- Event replay buffer system
  - Stores last 100 events to prevent race condition losses
  - Automatic replay for new SSE subscribers
- PostgreSQL database integration via Prisma ORM
  - Conversation tracking
  - Message storage
  - Participant management
  - Event logging
- Settings page with diagnostics and debug access
- Responsive UI with Tailwind CSS design system
- Support for multiple AI agent types (Claude, GPT, Gemini, O1, Copilot, Cursor, QoDer, Qwen, Codex, OpenCode, Ollama)

### Technical Features
- Next.js 15 App Router
- TypeScript for type safety
- Prisma ORM for database management
- Singleton EventManager pattern for SSE coordination
- Backward compatibility for old and new event formats
- Real-time token usage and cost tracking
- Duration and performance metrics
- System information capture (OS, version, architecture)

### Security
- Bearer token authentication for webhook endpoints
- Constant-time comparison to prevent timing attacks
- Input validation with Zod schemas
- Content length limits for messages (100KB)
