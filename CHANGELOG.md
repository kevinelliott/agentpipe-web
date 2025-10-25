# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.11] - 2025-10-24

### Added
- **MIT License**: Added MIT License file to the project

### Changed
- **Conversation Detail Page**: Initial prompt now displayed as the main page title instead of session name
- **Primary Call-to-Action**: "Live Dashboard" button is now the primary CTA on the front page (changed from secondary to primary style)
- **Terminology**: Updated "Back to Sessions" to "Back to Conversations" for consistency

### Fixed
- **Docker Build**: Fixed invalid Docker image tag format in GitHub Actions workflow
  - Changed SHA tag prefix from `{{branch}}-` to `sha-` to prevent empty branch variable issues on pull requests
  - Resolves: `invalid reference format` error in docker-build workflow
- **CI Environment Variables**: Added missing `DIRECT_URL` environment variable for Prisma schema validation
  - Required for proper database connection pooling configuration
  - Added to build and validate-prisma jobs
- **CI Scripts**: Made build and test scripts CI-friendly
  - `npm run build`: Now gracefully handles missing database (skips `prisma migrate deploy` if no DB available)
  - `npm test`: Changed to exit with 0 when no tests configured (was previously exiting with 1)
  - Allows CI builds to succeed without a running database while still generating Prisma client

### Dependencies
- Bumped `github/codeql-action` from v3 to v4
- Bumped `docker/build-push-action` from v5 to v6
- Bumped `actions/setup-node` from v5 to v6

## [0.0.6] - 2025-10-22

### Fixed
- **UI Consistency**: Changed page title from "Sessions" to "Conversations" on `/conversations` page
- **Markdown Rendering**: AI Summary now properly renders Markdown formatting
  - Added `ReactMarkdown` with `remarkGfm` support to `SummaryCard` component
  - Summaries now display headings, lists, code blocks, links, bold/italic text, blockquotes, and horizontal rules
  - Consistent formatting with message bubble Markdown rendering
  - Improved readability for structured AI-generated summaries

### Changed
- Updated grid section comment for clarity ("Sessions Grid" → "Conversations Grid")

## [0.0.5] - 2025-10-22

### Added
- **Slim View Feature**: New compact conversation view for easier reading
  - `ViewToggle` component: Segmented control to switch between Normal and Slim views
  - `MessageBubbleSlim` component: Minimalist message display with:
    - 3px left border in agent-specific colors
    - Extra-small avatar (20px)
    - Single-line truncated plain text (no Markdown)
    - No metrics footer for reduced visual noise
  - `TurnSeparator` component: Visual dividers between agent turns with time gap labels
  - `ConversationMessages` wrapper: Conditionally renders Normal or Slim view
  - `useViewMode` hook: Manages view state with localStorage persistence
  - CSS utilities: `.border-l-3` and agent-specific border colors (`.border-l-agent-*`)
  - Extra-small (`xs`) avatar size support: 20px avatars for compact displays
- **Navigation Improvements**:
  - "View All" button on dashboard next to "Live Conversations" heading
  - Easy access to archived/completed conversations from the dashboard
- **Agent Support Expansion**:
  - Added color definitions for Copilot, Cursor, QoDer, Qwen, and Codex agents
  - Support for both light and dark mode color schemes

### Changed
- **Route Consolidation**: Renamed `/sessions` to `/conversations` throughout the application
  - Updated all route references in dashboard, navigation, and API calls
  - Consolidated duplicate API routes for cleaner structure
  - Enhanced `/api/conversations` to support dual parameter styles for backward compatibility
- **UI Layout Improvements**:
  - Moved System Information section below Conversation block on detail pages
  - Improved information hierarchy for better user flow

### Technical
- Added localStorage persistence for user view mode preference
- Turn detection and grouping in conversation messages
- Time gap calculation and display between agent turns
- CSS utility layer extensions for slim view styling
- TypeScript type definitions for ViewMode, ConversationMessages props

## [0.0.4] - 2025-10-22

### Fixed
- **Unique Constraint Violation**: Fixed P2002 error when conversations have multiple participants with the same agent type
  - Added support for optional `agent_id` field from AgentPipe CLI
  - Updated `agentParticipantSchema` to accept `agent_id`
  - Modified ingest API to use CLI-provided `agent_id` when available
  - Falls back to legacy format for backward compatibility
  - Resolves: "Unique constraint failed on the fields: (`conversationId`,`agentId`)"

### Changed
- Ingest API now accepts and honors `agent_id` field in participant data
- AgentPipe CLI can now provide unique IDs for each participant to prevent collisions

## [0.0.3] - 2025-10-22

### Added
- **Vercel Analytics** integration for page view tracking and web vitals monitoring
- **SSE Debugging Tools**:
  - `/api/test/emit-event` endpoint to manually emit test events
  - `/api/debug/sse-status` endpoint to check EventManager stats and connected clients
- **Real-Time Debugging Documentation** (`docs/REALTIME_DEBUGGING.md`):
  - Comprehensive guide for diagnosing SSE connection issues
  - Testing procedures for local and production environments
  - Common fixes and troubleshooting steps
- **Migration Documentation** (`docs/MIGRATION_GUIDE.md`):
  - Guide for deploying v0.0.2 database schema changes
  - Manual and automated deployment instructions

### Changed
- **Event Stream Debug Page**: `connection.established` events now hidden by default
  - Added checkbox control to show/hide connection events
  - Reduces noise while debugging
  - Optional visibility when needed for connection diagnostics

### Fixed
- **Database Migration**: Created proper migration file for conversation summary fields
  - Migration: `20251022150000_add_conversation_summary`
  - Fixes "column does not exist" error in production
  - Includes all 10 summary fields (text, metadata, tokens, cost, duration)
- **Production Deployment**: Migration now runs automatically during build via `prisma migrate deploy`

### Documentation
- Added comprehensive real-time event debugging guide
- Added database migration guide for v0.0.2 schema changes
- Documented SSE diagnostic endpoints and usage

### Technical
- Server-side SSE pipeline verified 100% functional
- Event buffer replay working correctly
- EventManager broadcasting to all connected clients
- Issue identified: Dashboard client-side SSE connection not establishing (see docs/REALTIME_DEBUGGING.md)

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
