# AgentPipe Web - Session Viewing Visual Guide

Quick visual reference for implementing the session viewing interface.

---

## Page Wireframes

### 1. Session List - Desktop View

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  AgentPipe                         [Search...]                    🟢 Connected │
│  [Dashboard] [Sessions*] [Settings]                                   [Avatar] │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Sessions                                                    [↑ Upload Sessions]│
│  ━━━━━━━━━                                                                     │
│                                                                                │
│  [🔵 All]  [🟢 Active]  [🔵 Completed]  [❌ Error]                            │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  [Search sessions...]  [Advanced Filters ▾]  [Sort: Recent ▾]  [⊞ Grid] │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  🟢 Active Sessions (2)                                                │   │
│  │                                                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐                                 │   │
│  │  │  🟢 LIVE     │  │  🟢 LIVE     │                                 │   │
│  │  │              │  │              │                                 │   │
│  │  │  CL GM GP +2 │  │  CL GP       │                                 │   │
│  │  │              │  │              │                                 │   │
│  │  │  Multi-agent │  │  Code review │                                 │   │
│  │  │  Round Robin │  │  Reactive    │                                 │   │
│  │  │  23 messages │  │  45 messages │                                 │   │
│  │  │              │  │              │                                 │   │
│  │  │  "Building a │  │  "Review the │                                 │   │
│  │  │   feature    │  │   codebase   │                                 │   │
│  │  │   for..."    │  │   and..."    │                                 │   │
│  │  │              │  │              │                                 │   │
│  │  │  ──────────  │  │  ──────────  │                                 │   │
│  │  │  2m • 1.2K   │  │  5m • 3.4K   │                                 │   │
│  │  │  tokens •    │  │  tokens •    │                                 │   │
│  │  │  $0.12       │  │  $0.34       │                                 │   │
│  │  │  [Active] ▸  │  │  [Active] ▸  │                                 │   │
│  │  └──────────────┘  └──────────────┘                                 │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Recent Sessions                                                               │
│  ────────────────                                                              │
│                                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │  CL GM GP    │  │  GP O1       │  │  CL GM       │                       │
│  │              │  │              │  │              │                       │
│  │  API design  │  │  Debug issue │  │  Content gen │                       │
│  │  Free-form   │  │  Round Robin │  │  Reactive    │                       │
│  │  156 msgs    │  │  89 msgs     │  │  234 msgs    │                       │
│  │              │  │              │  │              │                       │
│  │  "Design new │  │  "Fix the    │  │  "Generate   │                       │
│  │   API..."    │  │   timeout"   │  │   blog..."   │                       │
│  │              │  │              │  │              │                       │
│  │  ──────────  │  │  ──────────  │  │  ──────────  │                       │
│  │  45m • 23K   │  │  12m • 8.9K  │  │  1h • 45K    │                       │
│  │  $2.34       │  │  $0.89       │  │  $4.56       │                       │
│  │  [Complete]  │  │  [Error]     │  │  [Complete]  │                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
│                                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │  ...more     │  │  ...more     │  │  ...more     │                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
│                                                                                │
│                              [Load More Sessions]                              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Live Session Detail - Desktop View

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  Multi-agent conversation          🟢 Live     🟢 Connected          │
├────────────────────────────────────────────────────────────────────────────────┤
│  CL GM GP +2  [Round Robin]  💬 23  🪙 1.2K  ⏱ 2m 34s  💰 $0.12  [Share] [⋮] │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│                    ┌─────────────────────────────────┐                        │
│                    │  ℹ Session started              │                        │
│                    │  3 agents joined                │                        │
│                    └─────────────────────────────────┘                        │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │  CL  Claude                                         2:34 PM     │  │   │
│  │  │  ─────────────────────────────────────────────────────────────  │  │   │
│  │  │                                                                 │  │   │
│  │  │  I'll help you build this feature. Let me start by analyzing   │  │   │
│  │  │  the requirements you've provided. The key aspects are...      │  │   │
│  │  │                                                                 │  │   │
│  │  │  ─────────────────────────────────────────────────────────────  │  │   │
│  │  │  234 tokens • $0.0023                                           │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │  GM  Gemini                                         2:34 PM     │  │   │
│  │  │  ─────────────────────────────────────────────────────────────  │  │   │
│  │  │                                                                 │  │   │
│  │  │  Building on Claude's analysis, I'd recommend considering the   │  │   │
│  │  │  performance implications. Here are some optimizations...       │  │   │
│  │  │                                                                 │  │   │
│  │  │  ─────────────────────────────────────────────────────────────  │  │   │
│  │  │  189 tokens • $0.0019                                           │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │  GP  GPT-4                                          2:35 PM     │  │   │
│  │  │  ─────────────────────────────────────────────────────────────  │  │   │
│  │  │                                                                 │  │   │
│  │  │  Great points from both of you. I'll add that we should also   │  │   │
│  │  │  consider the testing strategy. Here's what I propose...        │  │   │
│  │  │                                                                 │  │   │
│  │  │  ─────────────────────────────────────────────────────────────  │  │   │
│  │  │  312 tokens • $0.0031                                           │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │  CL  Claude is thinking...                                      │  │   │
│  │  │                                                                 │  │   │
│  │  │      ● ● ●                                                      │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│                                                                                │
│                                                   ┌──────────────────┐         │
│                                                   │  ↓  Scroll Down  │         │
│                                                   │     2 new msgs   │         │
│                                                   └──────────────────┘         │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Historical Session Detail - Desktop View

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  API design discussion                        Completed              │
├────────────────────────────────────────────────────────────────────────────────┤
│  CL GM GP  [Free-form]  💬 156  🪙 23K  ⏱ 45m  💰 $2.34  [Share] [Export] [⋮] │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  Session Summary                                       [Completed] ✓   │   │
│  │  ────────────────                                                      │   │
│  │                                                                        │   │
│  │  Started:  Oct 20, 2025 at 2:00 PM                                    │   │
│  │  Ended:    Oct 20, 2025 at 2:45 PM                                    │   │
│  │  Duration: 45 minutes 23 seconds                                      │   │
│  │                                                                        │   │
│  │  Participants: Claude, Gemini, GPT-4                                  │   │
│  │  Mode: Free-form                                                      │   │
│  │                                                                        │   │
│  │  Total: 156 messages • 23,456 tokens • $2.34 cost                    │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│                    ┌─────────────────────────────────┐                        │
│                    │  ℹ Session started              │                        │
│                    │  3 agents joined                │                        │
│                    └─────────────────────────────────┘                        │
│                                                                                │
│  [All messages loaded - 156 total]                                            │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐      │
│  │  [MessageBubble - Claude]                                           │      │
│  └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐      │
│  │  [MessageBubble - Gemini]                                           │      │
│  └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                │
│  ... [154 more messages] ...                                                  │
│                                                                                │
│                    ┌─────────────────────────────────┐                        │
│                    │  ℹ Session completed            │                        │
│                    │  Final metrics: 156 msgs, $2.34 │                        │
│                    └─────────────────────────────────┘                        │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**With Timeline Navigation (sidebar):**

```
┌──────────────────────────────┬──────────────────────────────────────────────────┐
│  [MessageBubbles...]         │  Timeline                                        │
│                              │  ────────                                        │
│                              │                                                  │
│                              │  ┌─ Jump to:                                    │
│                              │  │                                               │
│                              │  │  [CL] Claude (52 msgs)  ─┐                   │
│                              │  │  [GM] Gemini (48 msgs)   │                   │
│                              │  │  [GP] GPT-4 (56 msgs)   ─┘                   │
│                              │  │                                               │
│                              │  │  Timestamps:                                 │
│                              │  │  ◉ 2:00 PM - Start                           │
│                              │  │  ○ 2:15 PM                                   │
│                              │  │  ◉ 2:30 PM ← You are here                    │
│                              │  │  ○ 2:45 PM - End                             │
│                              │  │                                               │
│                              │  └─                                              │
│                              │                                                  │
│                              │  Progress: 60%                                   │
│                              │  ▓▓▓▓▓▓░░░░                                     │
│                              │                                                  │
└──────────────────────────────┴──────────────────────────────────────────────────┘
```

---

### 4. Upload Page - Desktop View

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  Upload Sessions                                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                        │   │
│  │                           📤                                           │   │
│  │                                                                        │   │
│  │               Drag & drop session files here                           │   │
│  │                   or click to browse                                   │   │
│  │                                                                        │   │
│  │              Supported: .json, .jsonl                                  │   │
│  │              Max size: 50MB per file                                   │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│                                                                                │
│  No files selected                                                             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**With Files Selected:**

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  Upload Sessions                                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  📤  Drag & drop more files or click to browse                         │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Upload Queue (4 files)                                                        │
│  ────────────────────                                                          │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  ✓  session-2025-10-20-01.json                              [✗]       │   │
│  │     Uploaded successfully                                              │   │
│  │     ▓▓▓▓▓▓▓▓▓▓ 100%                                                   │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  ⟳  session-2025-10-20-02.json                              [✗]       │   │
│  │     Uploading... 2.3 MB / 5.1 MB                                       │   │
│  │     ▓▓▓▓▓░░░░░ 45%                                                    │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  ⏳  session-2025-10-20-03.json                              [✗]       │   │
│  │     Pending...                                                         │   │
│  │     ░░░░░░░░░░ 0%                                                     │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  ❌  session-invalid.txt                                     [✗]       │   │
│  │     Error: Invalid file format. Only .json and .jsonl supported.      │   │
│  │     [Retry]                                                            │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│                                                                                │
│  [Cancel All]                                              [Upload All (3)]   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5. Mobile Views

#### Session List - Mobile

```
┌─────────────────────────┐
│  AgentPipe       [≡] [⚙]│
│                         │
│  [Search sessions...]   │
│                         │
│  [All] [Active] [Done]  │
│  [Error]                │
│                         │
│  🟢 Active (2)          │
│  ┌─────────────────────┐│
│  │ 🟢 LIVE             ││
│  │ CL GM GP +2         ││
│  │ Multi-agent chat    ││
│  │ Round Robin • 23    ││
│  │ ─────────────────   ││
│  │ 2m • 1.2K • $0.12   ││
│  │ [Active]         ▸  ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 🟢 LIVE             ││
│  │ CL GP               ││
│  │ Code review         ││
│  │ Reactive • 45       ││
│  │ ─────────────────   ││
│  │ 5m • 3.4K • $0.34   ││
│  │ [Active]         ▸  ││
│  └─────────────────────┘│
│                         │
│  Recent                 │
│  ┌─────────────────────┐│
│  │ CL GM GP            ││
│  │ API design          ││
│  │ Free-form • 156     ││
│  │ ─────────────────   ││
│  │ 45m • 23K • $2.34   ││
│  │ [Complete]       ▸  ││
│  └─────────────────────┘│
│                         │
│  [Load More]            │
│                         │
│ ┌─┬─┬─┬─┬─┐            │
│ │H│S│U│⋮│+│ Bottom Nav │
│ └─┴─┴─┴─┴─┘            │
└─────────────────────────┘
```

#### Live Session - Mobile

```
┌─────────────────────────┐
│  [←] Multi-agent  [⋮]   │
│  🟢 Live   🟢 Connected │
├─────────────────────────┤
│  CL GM GP +2            │
│  [Round Robin]          │
│  23 • 1.2K • 2m • $0.12 │
├─────────────────────────┤
│                         │
│  ℹ Session started      │
│                         │
│  ┌─────────────────────┐│
│  │ CL Claude   2:34 PM ││
│  │ ─────────────────── ││
│  │ I'll help you build ││
│  │ this feature...     ││
│  │ ─────────────────── ││
│  │ 234 tokens • $0.002 ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ GM Gemini   2:34 PM ││
│  │ ─────────────────── ││
│  │ Building on...      ││
│  │ ─────────────────── ││
│  │ 189 tokens • $0.001 ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ GP GPT-4    2:35 PM ││
│  │ ─────────────────── ││
│  │ Great points...     ││
│  │ ─────────────────── ││
│  │ 312 tokens • $0.003 ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ CL is thinking...   ││
│  │   ● ● ●             ││
│  └─────────────────────┘│
│                         │
│                         │
│            [↓ 2 new]    │
│                         │
└─────────────────────────┘
```

#### Upload - Mobile

```
┌─────────────────────────┐
│  [←] Upload Sessions    │
├─────────────────────────┤
│                         │
│  ┌─────────────────────┐│
│  │       📤            ││
│  │                     ││
│  │  Drag & drop or     ││
│  │  tap to select      ││
│  │                     ││
│  │  .json, .jsonl      ││
│  │  Max 50MB           ││
│  └─────────────────────┘│
│                         │
│  Files (3)              │
│  ┌─────────────────────┐│
│  │ ✓ session-01.json [✗││
│  │   Uploaded          ││
│  │   ▓▓▓▓▓▓▓▓▓▓ 100%  ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ ⟳ session-02.json [✗││
│  │   45% (2.3/5.1 MB)  ││
│  │   ▓▓▓▓▓░░░░░ 45%   ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ ❌ invalid.txt    [✗││
│  │   Invalid format    ││
│  │   [Retry]           ││
│  └─────────────────────┘│
│                         │
│  [Cancel]  [Upload All] │
│                         │
└─────────────────────────┘
```

---

## Component States Visual Reference

### SessionCard States

#### Default State
```
┌──────────────────────────────┐
│  CL GM GP                    │
│                              │
│  API Design Discussion       │
│  Round Robin • 156 messages  │
│                              │
│  "Design a new REST API for  │
│   the product catalog..."    │
│                              │
│  ────────────────────────    │
│  45m • 23K tokens • $2.34    │
│                [Completed]   │
└──────────────────────────────┘
```

#### Hover State
```
┌──────────────────────────────┐ ↑ Lifted
│  CL GM GP                    │ (shadow-lg)
│                              │
│  API Design Discussion       │
│  Round Robin • 156 messages  │
│                              │
│  "Design a new REST API for  │
│   the product catalog..."    │
│                              │
│  ────────────────────────    │
│  45m • 23K tokens • $2.34    │
│                [Completed]   │
└──────────────────────────────┘
```

#### Live/Active State
```
┌──────────────────────────────┐
│  🟢 LIVE                     │ ← Pulsing badge
│  CL GM GP                    │
│                              │
│  Multi-agent Conversation    │
│  Round Robin • 23 messages   │
│                              │
│  "Building a feature for...  │
│                              │
│  ────────────────────────    │
│  2m 34s • 1.2K • $0.12       │
│                   [Active]   │ ← Green badge
└──────────────────────────────┘
```

#### Error State
```
┌──────────────────────────────┐
│  CL GP O1                    │
│                              │
│  Debug timeout issue         │
│  Round Robin • 89 messages   │
│                              │
│  "Fix the timeout error in   │
│   the API endpoint..."       │
│                              │
│  ────────────────────────    │
│  12m • 8.9K tokens • $0.89   │
│                    [Error]   │ ← Red badge
└──────────────────────────────┘
```

#### Loading/Skeleton State
```
┌──────────────────────────────┐
│  ○ ○ ○                       │ ← Gray circles
│                              │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬            │ ← Pulsing bars
│  ▬▬▬▬▬▬▬▬▬▬                 │
│                              │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬         │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬             │
│                              │
│  ────────────────────────    │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬            │
└──────────────────────────────┘
```

---

### MessageBubble States

#### Claude Message (Default)
```
┌─────────────────────────────────────────────┐
│  CL  Claude                     2:34 PM     │ ← Agent color: Rust/Orange
│  ─────────────────────────────────────────  │
│                                             │
│  I'll help you build this feature. Let me   │
│  start by analyzing the requirements...     │
│                                             │
│  ─────────────────────────────────────────  │
│  234 tokens • $0.0023                       │
└─────────────────────────────────────────────┘
```

#### Gemini Message
```
┌─────────────────────────────────────────────┐
│  GM  Gemini                     2:34 PM     │ ← Agent color: Blue
│  ─────────────────────────────────────────  │
│                                             │
│  Building on Claude's analysis, I'd         │
│  recommend considering performance...       │
│                                             │
│  ─────────────────────────────────────────  │
│  189 tokens • $0.0019                       │
└─────────────────────────────────────────────┘
```

#### GPT Message
```
┌─────────────────────────────────────────────┐
│  GP  GPT-4                      2:35 PM     │ ← Agent color: Green
│  ─────────────────────────────────────────  │
│                                             │
│  Great points from both. I'll add that we   │
│  should also consider testing strategy...   │
│                                             │
│  ─────────────────────────────────────────  │
│  312 tokens • $0.0031                       │
└─────────────────────────────────────────────┘
```

#### Message Hover State
```
┌─────────────────────────────────────────────┐ ↑ Lifted
│  CL  Claude                     2:34 PM     │ (shadow-md)
│  ─────────────────────────────────────────  │
│                                             │
│  Message content here...                    │
│                                             │
│  ─────────────────────────────────────────  │
│  234 tokens • $0.0023                       │
└─────────────────────────────────────────────┘
```

---

### Status Indicators

#### Connection Status

```
Connected:     🟢 Connected         (pulsing green dot)
Connecting:    🟡 Connecting...     (pulsing amber dot)
Disconnected:  🔴 Disconnected      (static red dot)
```

#### Session Status Badges

```
Active:        [ Active ]           (green bg/border)
Completed:     [ Completed ]        (blue bg/border)
Error:         [ Error ]            (red bg/border)
Interrupted:   [ Interrupted ]      (amber bg/border)
```

#### Mode Badges

```
Round Robin:   [ Round Robin ]      (blue)
Reactive:      [ Reactive ]         (purple)
Free-form:     [ Free-form ]        (green)
```

---

### Filter Pills

#### Inactive Filter
```
┌──────────┐
│   All    │  ← Gray border, muted text
└──────────┘
```

#### Active Filter
```
┌══════════┐
║  Active  ║  ← Solid border, filled bg
└══════════┘
```

#### Hover State
```
┌──────────┐
│  Error   │  ← Highlighted border
└──────────┘
```

---

### Empty States

#### No Sessions Yet
```
┌────────────────────────────────────┐
│                                    │
│              📭                    │
│                                    │
│      No sessions yet               │
│                                    │
│   Upload your first session to     │
│   get started with AgentPipe Web   │
│                                    │
│      [Upload Sessions]             │
│                                    │
└────────────────────────────────────┘
```

#### No Search Results
```
┌────────────────────────────────────┐
│                                    │
│              🔍                    │
│                                    │
│   No sessions match "api design"   │
│                                    │
│   Try adjusting your search or     │
│   clearing active filters          │
│                                    │
│      [Clear Filters]               │
│                                    │
└────────────────────────────────────┘
```

#### No Active Sessions
```
┌────────────────────────────────────┐
│                                    │
│  No active sessions right now      │
│                                    │
│  Start a new session in the CLI    │
│  and it will appear here live      │
│                                    │
└────────────────────────────────────┘
```

---

## Animation Sequences

### New Message Appearing

```
Frame 1 (0ms):     [Invisible, below position]
                   opacity: 0
                   translateY: 8px
                   scale: 0.98

Frame 2 (150ms):   [Fading in, moving up]
                   opacity: 0.5
                   translateY: 4px
                   scale: 0.99

Frame 3 (300ms):   [Fully visible]
                   opacity: 1
                   translateY: 0
                   scale: 1
```

### Typing Indicator Dots

```
Dot 1:  ● ○ ○  →  ○ ● ○  →  ○ ○ ●  →  ● ○ ○  (loop)
        0ms       300ms      600ms      900ms

Animation: Staggered pulse, infinite loop
```

### Connection Pulse

```
Frame 1: ●         (normal dot)
Frame 2: ◉         (ring expands, fades)
Frame 3: ◎         (ring larger, more faded)
Frame 4: ○         (ring disappears)
Frame 5: ●         (back to normal)

Duration: 2s, infinite
```

### Card Hover Transition

```
Default:     position: 0
             shadow: sm
             border: border

Hover:       position: -4px (up)
             shadow: lg
             border: border-strong

Duration: 150ms ease-out
```

---

## Color Reference

### Status Colors (Light Mode)

```
Active:       bg: #f0fdf4   text: #22c55e   border: #bbf7d0
Completed:    bg: #eff6ff   text: #3b82f6   border: #bfdbfe
Error:        bg: #fef2f2   text: #ef4444   border: #fecaca
Interrupted:  bg: #fffbeb   text: #f59e0b   border: #fef3c7
```

### Agent Colors (Light Mode)

```
Claude:   bg: #fef3f0   text: #cc785c   border: #f4d7cc
Gemini:   bg: #eff6ff   text: #4f7fd9   border: #d6e4ff
GPT:      bg: #ecfdf5   text: #0d8968   border: #d1f4e8
Amp:      bg: #f5f3ff   text: #7c3aed   border: #e9d5ff
Factory:  bg: #ecfeff   text: #0891b2   border: #cffafe
O1:       bg: #fef2f2   text: #dc2626   border: #fecaca
```

### Dark Mode Adjustments

All backgrounds become darker, text becomes lighter, maintaining same hue but adjusted for dark theme.

---

## Interaction Patterns

### Click/Tap Targets

```
Minimum size: 44x44px

Button:         ┌──────────┐
                │  Button  │  44px height minimum
                └──────────┘

Icon button:    ┌────┐
                │ 🔍 │  44x44px
                └────┘

Checkbox:       ☐ Label     44px height touch area
```

### Spacing Between Interactive Elements

```
Minimum: 8px

[Button 1]  8px  [Button 2]  8px  [Button 3]
```

### Scroll Behavior

```
Smooth scroll:      behavior: smooth
Auto-scroll:        Enabled when scrolled to bottom
Manual override:    Disabled when user scrolls up
Re-enable:          Click "New messages" banner
```

---

## Quick Implementation Checklist

### Session List Page
- [ ] SessionCard component (grid & list variants)
- [ ] Filter pills (status quick filters)
- [ ] Search input with debounce
- [ ] Advanced filters popover
- [ ] Sort dropdown
- [ ] View toggle (grid/list)
- [ ] Live sessions section (conditional)
- [ ] Infinite scroll or pagination
- [ ] Empty states (no sessions, no results)
- [ ] Loading skeletons

### Session Detail Page
- [ ] Header with back button
- [ ] Live indicator (conditional)
- [ ] WebSocket status (conditional)
- [ ] Session info bar (sticky)
- [ ] Participant avatar stack
- [ ] Mode and metrics display
- [ ] MessageList component
- [ ] MessageBubble component
- [ ] System message component
- [ ] TypingIndicator component (conditional)
- [ ] Scroll to bottom button (conditional)
- [ ] Auto-scroll logic
- [ ] Session summary panel (historical)
- [ ] Timeline navigation (historical, long sessions)
- [ ] WebSocket integration

### Upload Page
- [ ] UploadZone component (drag & drop)
- [ ] FileQueue component
- [ ] File item component (with progress)
- [ ] Upload progress tracking
- [ ] Success/error states per file
- [ ] Validation (file type, size)
- [ ] Retry failed uploads
- [ ] Bulk operations (cancel all, retry all)

### Responsive Design
- [ ] Mobile layouts (< 768px)
- [ ] Tablet layouts (768-1023px)
- [ ] Desktop layouts (1024px+)
- [ ] Touch-friendly targets (44x44px)
- [ ] Bottom navigation (mobile)
- [ ] Collapsible sidebars (tablet)

### Accessibility
- [ ] Keyboard navigation (full app)
- [ ] Focus indicators (all interactive elements)
- [ ] ARIA labels (buttons, status, live regions)
- [ ] Screen reader announcements (new messages)
- [ ] Color contrast (WCAG AA - 4.5:1)
- [ ] Skip links
- [ ] Semantic HTML (landmarks)

### Animations
- [ ] Message appear animation
- [ ] Typing indicator dots
- [ ] Connection pulse
- [ ] Card hover transitions
- [ ] Skeleton loading
- [ ] Toast notifications

### Performance
- [ ] Code splitting (pages)
- [ ] Lazy loading (components)
- [ ] Virtualized lists (long conversations)
- [ ] Debounced search
- [ ] Throttled scroll
- [ ] Optimistic updates
- [ ] Image optimization

---

## Implementation Priority

### Phase 1: MVP (Week 1-2)
1. Session list page with basic filtering
2. SessionCard component
3. Historical session detail view
4. MessageBubble component
5. Basic responsive design

### Phase 2: Real-Time (Week 3-4)
1. WebSocket integration
2. Live session view
3. TypingIndicator component
4. Auto-scroll logic
5. Connection status monitoring

### Phase 3: Upload & Polish (Week 5-6)
1. Upload page and drag & drop
2. Advanced filtering
3. Timeline navigation
4. Search functionality
5. Animation refinement

### Phase 4: Optimization (Week 7-8)
1. Performance optimization
2. Accessibility audit
3. Cross-browser testing
4. Edge case handling
5. Documentation

---

This visual guide complements the main design specification and provides quick visual references for implementation. Use it alongside the detailed spec for a complete understanding of the design system.
