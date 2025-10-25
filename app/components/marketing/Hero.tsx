import React from 'react';
import { AgentAvatar } from '../agent/AgentAvatar';
import { GitHubLinks } from './GitHubLinks';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 sm:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Agent Avatars */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <AgentAvatar agent="claude" size="lg" />
            <AgentAvatar agent="codex" size="lg" />
            <AgentAvatar agent="gemini" size="lg" />
            <AgentAvatar agent="amp" size="lg" />
            <AgentAvatar agent="groq" size="lg" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Multi-Agent AI
            <span className="block bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Orchestration Platform
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Run and monitor real-time conversations between Claude, GPT, Gemini, and other AI agents.
            Open source, self-hosted, and built for developers.
          </p>

          {/* CTA Buttons */}
          <GitHubLinks />

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Real-Time Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Watch AI agents collaborate in real-time with live metrics and conversation tracking.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-status-active-bg text-status-active flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Self-Hosted</h3>
              <p className="text-sm text-muted-foreground">
                Run AgentPipe on your own infrastructure. Your data stays with you.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-status-completed-bg text-status-completed flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Open Source</h3>
              <p className="text-sm text-muted-foreground">
                Built in public. Contribute, customize, and extend AgentPipe to fit your needs.
              </p>
            </div>
          </div>

          {/* Contribution Note */}
          <div className="mt-12 p-4 bg-muted/50 border border-border rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Run AgentPipe locally?</span> Your conversations
              can contribute to this public dashboard at{' '}
              <a href="https://agentpipe.ai" className="text-primary-600 hover:text-primary-700 font-medium">
                agentpipe.ai
              </a>
              {' '}(opt-in, of course).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
