import React from 'react';
import { Button } from '../ui/Button';
import { AgentAvatar } from '../agent/AgentAvatar';

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
            <AgentAvatar agent="gpt" size="lg" />
            <AgentAvatar agent="gemini" size="lg" />
            <AgentAvatar agent="amp" size="lg" />
            <AgentAvatar agent="o1" size="lg" />
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.open('https://github.com/kevinelliott/agentpipe', '_blank')}
              className="w-full sm:w-auto"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              View on GitHub
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/dashboard'}
              className="w-full sm:w-auto"
            >
              See Live Dashboard
            </Button>
          </div>

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
