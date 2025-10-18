'use client';

import Link from 'next/link';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Button } from '../ui/Button';

export function Header() {
  return (
    <header className="sticky top-0 z-sticky bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AgentPipe</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Multi-Agent AI Orchestration
              </p>
            </div>
          </Link>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <a
                href="https://github.com/kevinelliott/agentpipe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </nav>
            <ThemeToggle />
            <Button
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => window.open('https://github.com/kevinelliott/agentpipe', '_blank')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
