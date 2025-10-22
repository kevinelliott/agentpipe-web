import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { Header } from './components/layout/Header';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'AgentPipe - Multi-Agent AI Orchestration',
  description: 'Run and monitor multi-agent AI conversations in real-time. AgentPipe enables seamless collaboration between Claude, GPT, Gemini, and other AI agents. Open source and self-hosted.',
  keywords: ['AI', 'agents', 'multi-agent', 'orchestration', 'AgentPipe', 'Claude', 'GPT', 'Gemini', 'open source'],
  authors: [{ name: 'AgentPipe' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = savedTheme || (prefersDark ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
