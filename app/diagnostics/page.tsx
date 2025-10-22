'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { AgentAvatar, type AgentType } from '@/app/components/agent/AgentAvatar';

interface SystemEnvironmentCheck {
  name: string;
  status: boolean;
  message: string;
  icon: string;
}

interface ConfigurationCheck {
  name: string;
  status: boolean;
  message: string;
  icon: string;
}

interface AgentInfo {
  id: string;
  name: string;
  type: AgentType;
  version?: string;
  path?: string;
  authenticated?: boolean;
  available: boolean;
  command?: string;
}

interface DoctorSummary {
  total_agents: number;
  available_count: number;
  ready: boolean;
}

interface DiagnosticData {
  systemEnvironment: SystemEnvironmentCheck[];
  availableAgents: AgentInfo[];
  supportedAgents: AgentInfo[];
  configuration: ConfigurationCheck[];
  summary: DoctorSummary;
}

export default function DiagnosticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDiagnostics = async (skipCache = false) => {
    try {
      setIsRefreshing(true);
      setError(null);

      const url = skipCache ? '/api/agents/doctor?skipCache=true' : '/api/agents/doctor';
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load diagnostics');
      }

      setDiagnostics(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading diagnostics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load diagnostics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleRefresh = () => {
    loadDiagnostics(true);
  };

  const getOverallStatus = (): 'success' | 'warning' | 'error' => {
    if (!diagnostics) return 'error';
    if (!diagnostics.summary.ready) return 'error';

    const hasWarnings = diagnostics.systemEnvironment.some(check => !check.status) ||
                       diagnostics.configuration.some(check => !check.status);

    return hasWarnings ? 'warning' : 'success';
  };

  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusText = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'System Ready';
      case 'warning':
        return 'Issues Detected';
      case 'error':
        return 'System Not Ready';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading diagnostics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8">
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              ← Back to Settings
            </Link>
            <h1 className="text-3xl font-bold text-foreground">System Diagnostics</h1>
          </header>

          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="p-6 text-center">
              <svg className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">Failed to Load Diagnostics</h2>
              <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
              <div className="flex justify-center gap-3">
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
                <Link href="/settings">
                  <Button variant="primary">
                    Go to Settings
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="mb-8">
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Back to Settings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">System Diagnostics</h1>
              <p className="text-muted-foreground mt-1">AgentPipe system health and agent availability</p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="primary">
              {isRefreshing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {formatTimeAgo(lastUpdated)}
            </p>
          )}
        </header>

        {/* Health Summary */}
        {diagnostics && (
          <>
            <Card className={`mb-6 border-2 ${getStatusColor(overallStatus)}`}>
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className={`rounded-full p-4 ${getStatusColor(overallStatus)}`}>
                      {getStatusIcon(overallStatus)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{getStatusText(overallStatus)}</h2>
                    <p className="text-muted-foreground mb-4">
                      {overallStatus === 'success'
                        ? 'All systems operational and agents available for multi-agent conversations.'
                        : overallStatus === 'warning'
                        ? 'Some issues detected. Review the sections below for details.'
                        : 'Critical issues detected. Please review and resolve before using AgentPipe.'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Agents</div>
                        <div className="text-lg font-semibold">
                          {diagnostics.summary.available_count}/{diagnostics.summary.total_agents}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Environment</div>
                        <div className="text-lg font-semibold">
                          {diagnostics.systemEnvironment.every(check => check.status) ? 'Pass' : 'Warning'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Configuration</div>
                        <div className="text-lg font-semibold">
                          {diagnostics.configuration.every(check => check.status) ? 'Pass' : 'Warning'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Last Checked</div>
                        <div className="text-lg font-semibold">
                          {lastUpdated ? formatTimeAgo(lastUpdated) : 'Just now'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Available Agents */}
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Available Agents</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Installed and detected AI agents
                    </p>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {diagnostics.availableAgents.length} agents
                  </div>
                </div>

                {diagnostics.availableAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diagnostics.availableAgents.map((agent) => (
                      <div key={agent.id} className="border border-border rounded-lg p-4 hover:border-border-strong hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <AgentAvatar agent={agent.type} size="md" />
                            <div>
                              <h4 className="font-semibold text-foreground">{agent.name}</h4>
                              <p className="text-xs text-muted-foreground">{agent.type}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          {agent.version && (
                            <div className="flex items-start justify-between">
                              <span className="text-muted-foreground">Version</span>
                              <span className="font-mono text-foreground">{agent.version}</span>
                            </div>
                          )}
                          {agent.path && (
                            <div className="flex items-start justify-between">
                              <span className="text-muted-foreground">Path</span>
                              <span className="font-mono text-foreground truncate max-w-[200px]" title={agent.path}>
                                {agent.path}
                              </span>
                            </div>
                          )}
                          <div className="flex items-start justify-between">
                            <span className="text-muted-foreground">Authentication</span>
                            <span className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${agent.authenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="font-mono text-foreground">
                                {agent.authenticated ? 'Configured' : 'Missing'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No agents detected. Configure API keys in Settings to enable agents.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* System Environment */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">System Environment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Operating system and runtime environment information
                </p>

                <div className="space-y-0 divide-y divide-border">
                  {diagnostics.systemEnvironment.map((check, index) => (
                    <div key={index} className="flex items-center justify-between py-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${check.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-foreground">{check.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                          {check.message}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Configuration */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">Configuration Checks</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Verification of AgentPipe configuration settings
                </p>

                <div className="space-y-0 divide-y divide-border">
                  {diagnostics.configuration.map((check, index) => (
                    <div key={index} className="py-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        {check.status ? (
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-foreground">{check.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${check.status ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'}`}>
                              {check.status ? 'Pass' : 'Warning'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {check.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
