'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PathInput } from '@/app/components/settings/PathInput';
import { Toggle } from '@/app/components/settings/Toggle';
import { Toast } from '@/app/components/ui/Toast';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { SettingKey, SETTING_METADATA, ManualAgent } from '@/app/types/settings';
import { isLocalCLIAvailable } from '@/app/lib/environment';

interface SettingValue {
  value: string;
  isValid?: boolean;
  validating?: boolean;
  error?: string;
}

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function SettingsPage() {
  // Settings state
  const [settings, setSettings] = useState<Record<string, SettingValue>>({
    [SettingKey.AGENTPIPE_BINARY_PATH]: { value: 'agentpipe' },
    [SettingKey.AGENTPIPE_TIMEOUT_MS]: { value: '60000' },
    [SettingKey.AGENTPIPE_AUTO_DETECT]: { value: 'true' },
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDoctorRunning, setIsDoctorRunning] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testResultMessage, setTestResultMessage] = useState<string>('');
  const [doctorResult, setDoctorResult] = useState<'success' | 'error' | null>(null);
  const [doctorResultMessage, setDoctorResultMessage] = useState<string>('');

  // Manual agents state
  const [manualAgents, setManualAgents] = useState<ManualAgent[]>([]);
  const [cliAvailable, setCliAvailable] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState('');

  // Check if local CLI is available
  useEffect(() => {
    setCliAvailable(isLocalCLIAvailable());
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings?category=agentpipe');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load settings');
      }

      // Convert settings array to state object
      const settingsMap: Record<string, SettingValue> = {};
      data.settings.forEach((setting: any) => {
        settingsMap[setting.key] = {
          value: setting.value,
          isValid: setting.isValid,
        };
      });

      // Merge with defaults for any missing settings
      setSettings({
        [SettingKey.AGENTPIPE_BINARY_PATH]: settingsMap[SettingKey.AGENTPIPE_BINARY_PATH] || { value: 'agentpipe' },
        [SettingKey.AGENTPIPE_TIMEOUT_MS]: settingsMap[SettingKey.AGENTPIPE_TIMEOUT_MS] || { value: '10000' },
        [SettingKey.AGENTPIPE_AUTO_DETECT]: settingsMap[SettingKey.AGENTPIPE_AUTO_DETECT] || { value: 'true' },
      });

      // Load manual agents
      const manualAgentsSetting = settingsMap[SettingKey.AGENTPIPE_MANUAL_AGENTS];
      if (manualAgentsSetting) {
        try {
          const agents = JSON.parse(manualAgentsSetting.value) as ManualAgent[];
          setManualAgents(agents);
        } catch (error) {
          console.error('Error parsing manual agents:', error);
          setManualAgents([]);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = async (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value, isValid: undefined },
    }));
    setHasChanges(true);

    // Clear test results when settings change
    setTestResult(null);
    setTestResultMessage('');
    setDoctorResult(null);
    setDoctorResultMessage('');

    // Validate the value
    if (key === SettingKey.AGENTPIPE_BINARY_PATH) {
      await validateSetting(key, value);
    }
  };

  const validateSetting = async (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], validating: true },
    }));

    try {
      const response = await fetch('/api/settings/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      const result = await response.json();

      setSettings((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          validating: false,
          isValid: result.isValid,
          error: result.error,
        },
      }));
    } catch (error) {
      setSettings((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          validating: false,
          isValid: false,
          error: 'Validation failed',
        },
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save each setting
      const promises = Object.entries(settings).map(([key, { value }]) =>
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        })
      );

      // Save manual agents
      await handleSaveManualAgents();

      const results = await Promise.all(promises);
      const allSuccessful = results.every((r) => r.ok);

      if (!allSuccessful) {
        throw new Error('Failed to save some settings');
      }

      showToast('Settings saved successfully', 'success');
      setHasChanges(false);
      // Clear test results since settings have changed
      setTestResult(null);
      setTestResultMessage('');
      setDoctorResult(null);
      setDoctorResultMessage('');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConfiguration = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestResultMessage('');

    try {
      // Test by calling the agents/available endpoint with cache bypass
      const response = await fetch('/api/agents/available?skipCache=true');
      const data = await response.json();

      if (!response.ok) {
        // Provide detailed error message with helpful context
        let errorMessage = data.error || 'Agent detection failed';

        if (data.details) {
          errorMessage = `${errorMessage}: ${data.details}`;
        }

        if (errorMessage.includes('timed out')) {
          errorMessage = 'AgentPipe command timed out. This usually means:\n• AgentPipe is not installed or not in the specified path\n• The binary path is incorrect\n• AgentPipe is taking too long to respond\n\nPlease verify your installation and binary path.';
        } else if (errorMessage.includes('not found')) {
          errorMessage = 'AgentPipe CLI not found. Please:\n• Install AgentPipe from GitHub\n• Add it to your system PATH, or\n• Specify the full path to the binary above';
        }

        throw new Error(errorMessage);
      }

      const successMessage = `Configuration test passed! Found ${data.totalAvailable} available agent(s).`;
      setTestResult('success');
      setTestResultMessage(successMessage);
      showToast(successMessage, 'success');
    } catch (error) {
      console.error('Error testing configuration:', error);
      const errorMsg = error instanceof Error ? error.message : 'Configuration test failed';
      setTestResult('error');
      setTestResultMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunDoctor = async () => {
    setIsDoctorRunning(true);
    setDoctorResult(null);
    setDoctorResultMessage('');

    try {
      // Run agentpipe doctor --json
      const response = await fetch('/api/agents/doctor');
      const data = await response.json();

      if (!response.ok) {
        // Provide detailed error message with helpful context
        let errorMessage = data.error || 'Doctor check failed';

        if (data.details) {
          errorMessage = `${errorMessage}: ${data.details}`;
        }

        if (errorMessage.includes('timed out')) {
          errorMessage = 'AgentPipe doctor command timed out. This usually means:\n• AgentPipe is not installed or not in the specified path\n• The binary path is incorrect\n• AgentPipe is taking too long to respond\n\nPlease verify your installation and binary path.';
        } else if (errorMessage.includes('not found')) {
          errorMessage = 'AgentPipe CLI not found. Please:\n• Install AgentPipe from GitHub\n• Add it to your system PATH, or\n• Specify the full path to the binary above';
        }

        throw new Error(errorMessage);
      }

      // Build success message with summary
      const summary = data.summary;
      const successMessage = `Doctor check passed! System is ${summary?.ready ? 'ready' : 'not ready'}. Found ${summary?.available_count || 0} of ${summary?.total_agents || 0} agents available.`;
      setDoctorResult('success');
      setDoctorResultMessage(successMessage);
      showToast(successMessage, 'success');
    } catch (error) {
      console.error('Error running doctor:', error);
      const errorMsg = error instanceof Error ? error.message : 'Doctor check failed';
      setDoctorResult('error');
      setDoctorResultMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsDoctorRunning(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    setHasChanges(false);
    // Clear test results since settings have changed
    setTestResult(null);
    setTestResultMessage('');
    setDoctorResult(null);
    setDoctorResultMessage('');
    showToast('Settings reset to saved values', 'info');
  };

  const showToast = (message: string, type: ToastNotification['type']) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddManualAgent = () => {
    if (!newAgentName.trim() || !newAgentType.trim()) {
      showToast('Please enter both agent name and type', 'error');
      return;
    }

    const newAgent: ManualAgent = {
      name: newAgentName.trim(),
      type: newAgentType.trim().toLowerCase(),
      status: 'available',
    };

    setManualAgents((prev) => [...prev, newAgent]);
    setNewAgentName('');
    setNewAgentType('');
    setHasChanges(true);
    showToast(`Agent "${newAgent.name}" added`, 'success');
  };

  const handleRemoveManualAgent = (index: number) => {
    const agent = manualAgents[index];
    setManualAgents((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
    showToast(`Agent "${agent.name}" removed`, 'info');
  };

  const handleSaveManualAgents = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: SettingKey.AGENTPIPE_MANUAL_AGENTS,
          value: JSON.stringify(manualAgents),
        }),
      });
    } catch (error) {
      console.error('Error saving manual agents:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background-elevated">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
              >
                ← Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Configure your AgentPipe installation and preferences
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/debug">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Debug Events
                </Button>
              </Link>
              <Link href="/diagnostics">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  View Diagnostics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">AgentPipe Binary Configuration</p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  AgentPipe is a Go binary that needs to be installed separately. You can install it from{' '}
                  <a
                    href="https://github.com/kevinelliott/agentpipe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    GitHub
                  </a>
                  . After installation, either add it to your system PATH or specify the full path below.
                </p>
              </div>
            </div>
          </div>

          {/* AgentPipe Configuration Section */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                AgentPipe Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure the AgentPipe CLI binary and detection settings
              </p>
            </div>

            <div className="space-y-6">
              {/* Binary Path */}
              <PathInput
                label={SETTING_METADATA[SettingKey.AGENTPIPE_BINARY_PATH].description}
                value={settings[SettingKey.AGENTPIPE_BINARY_PATH].value}
                onChange={(value) => handleChange(SettingKey.AGENTPIPE_BINARY_PATH, value)}
                placeholder={SETTING_METADATA[SettingKey.AGENTPIPE_BINARY_PATH].placeholder}
                helperText={SETTING_METADATA[SettingKey.AGENTPIPE_BINARY_PATH].helperText}
                error={settings[SettingKey.AGENTPIPE_BINARY_PATH].error}
                validating={settings[SettingKey.AGENTPIPE_BINARY_PATH].validating}
                validationStatus={
                  settings[SettingKey.AGENTPIPE_BINARY_PATH].isValid === undefined
                    ? null
                    : settings[SettingKey.AGENTPIPE_BINARY_PATH].isValid
                    ? 'valid'
                    : 'invalid'
                }
              />

              {/* Timeout */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {SETTING_METADATA[SettingKey.AGENTPIPE_TIMEOUT_MS].description}
                </label>
                <input
                  type="number"
                  value={settings[SettingKey.AGENTPIPE_TIMEOUT_MS].value}
                  onChange={(e) =>
                    handleChange(SettingKey.AGENTPIPE_TIMEOUT_MS, e.target.value)
                  }
                  placeholder={SETTING_METADATA[SettingKey.AGENTPIPE_TIMEOUT_MS].placeholder}
                  className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  min="1000"
                  max="60000"
                  step="1000"
                />
                <p className="text-sm text-muted-foreground">
                  {SETTING_METADATA[SettingKey.AGENTPIPE_TIMEOUT_MS].helperText}
                </p>
              </div>

              {/* Auto Detect */}
              <Toggle
                label={SETTING_METADATA[SettingKey.AGENTPIPE_AUTO_DETECT].description}
                checked={settings[SettingKey.AGENTPIPE_AUTO_DETECT].value === 'true'}
                onChange={(checked) =>
                  handleChange(SettingKey.AGENTPIPE_AUTO_DETECT, String(checked))
                }
                helperText={SETTING_METADATA[SettingKey.AGENTPIPE_AUTO_DETECT].helperText}
              />
            </div>

            {/* Diagnostic Buttons */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleTestConfiguration}
                  disabled={isTesting}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isTesting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Testing Configuration...
                    </>
                  ) : (
                    'Test Configuration'
                  )}
                </Button>

                <Button
                  onClick={handleRunDoctor}
                  disabled={isDoctorRunning}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isDoctorRunning ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Running Doctor...
                    </>
                  ) : (
                    'Run Doctor'
                  )}
                </Button>
              </div>

              {/* Test Result Indicator */}
              {testResult && (
                <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg border ${
                  testResult === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  {testResult === 'success' ? (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      testResult === 'success'
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {testResultMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Doctor Result Indicator */}
              {doctorResult && (
                <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg border ${
                  doctorResult === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  {doctorResult === 'success' ? (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      doctorResult === 'success'
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {doctorResultMessage}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-2">
                Test Configuration checks if agents are available. Run Doctor performs a full diagnostic check.
              </p>
            </div>
          </Card>

          {/* Manual Agent Configuration Section */}
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Manual Agent Configuration
                </h2>
                {!cliAvailable && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                    Production Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {!cliAvailable
                  ? 'CLI is not available in production. Configure agents manually to use AgentPipe features.'
                  : 'Optionally define agents manually when CLI auto-detection is not available or disabled.'}
              </p>
            </div>

            {/* Add Agent Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="Claude"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Agent Type
                  </label>
                  <input
                    type="text"
                    value={newAgentType}
                    onChange={(e) => setNewAgentType(e.target.value)}
                    placeholder="claude"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddManualAgent}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Add Agent
              </Button>
            </div>

            {/* Agent List */}
            {manualAgents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Configured Agents</h3>
                <div className="space-y-2">
                  {manualAgents.map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Type: {agent.type} • Status: {agent.status}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveManualAgent(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {manualAgents.length === 0 && (
              <div className="mt-6 p-6 text-center bg-muted/20 rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">
                  No agents configured. Add agents above to use AgentPipe in production.
                </p>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button onClick={handleReset} variant="outline" disabled={!hasChanges || isSaving}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
