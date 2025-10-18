'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AgentAvatar, type AgentType } from '../../components/agent/AgentAvatar';

interface Agent {
  id: string;
  type: AgentType;
  model: string;
  name: string;
  prompt: string;
}

const AGENT_TYPES = [
  { value: 'amp', label: 'Amp CLI', provider: 'Optimized' },
  { value: 'claude', label: 'Claude CLI', provider: 'Anthropic' },
  { value: 'copilot', label: 'GitHub Copilot CLI', provider: 'GitHub' },
  { value: 'cursor', label: 'Cursor CLI', provider: 'Cursor' },
  { value: 'gemini', label: 'Gemini CLI', provider: 'Google' },
  { value: 'qoder', label: 'Qoder CLI', provider: 'Qoder' },
  { value: 'qwen', label: 'Qwen CLI', provider: 'Alibaba Cloud' },
  { value: 'codex', label: 'Codex CLI', provider: 'OpenAI' },
];

const MODEL_OPTIONS: Record<string, { value: string; label: string }[]> = {
  amp: [
    { value: 'amp-default', label: 'Amp Default' },
  ],
  claude: [
    { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
    { value: 'claude-opus-4', label: 'Claude Opus 4' },
    { value: 'claude-haiku-4', label: 'Claude Haiku 4' },
  ],
  copilot: [
    { value: 'copilot-default', label: 'GitHub Copilot' },
  ],
  cursor: [
    { value: 'cursor-default', label: 'Cursor Default' },
  ],
  gemini: [
    { value: 'gemini-pro-1.5', label: 'Gemini Pro 1.5' },
    { value: 'gemini-flash-1.5', label: 'Gemini Flash 1.5' },
  ],
  qoder: [
    { value: 'qoder-default', label: 'Qoder Default' },
  ],
  qwen: [
    { value: 'qwen-max', label: 'Qwen Max' },
    { value: 'qwen-plus', label: 'Qwen Plus' },
  ],
  codex: [
    { value: 'codex-default', label: 'Codex Default' },
  ],
};

const MODES = [
  {
    value: 'round-robin',
    label: 'Round Robin',
    description: 'Agents take turns in sequence',
    icon: '→',
  },
  {
    value: 'reactive',
    label: 'Reactive',
    description: 'Agents respond when relevant',
    icon: '⚡',
  },
  {
    value: 'free-form',
    label: 'Free-form',
    description: 'Open conversation flow',
    icon: '∞',
  },
];

export default function NewConversation() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [initialPrompt, setInitialPrompt] = useState('');
  const [mode, setMode] = useState<string>('round-robin');
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      type: 'amp',
      model: 'amp-default',
      name: '',
      prompt: '',
    },
  ]);
  const [maxTurns, setMaxTurns] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAgent = () => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      type: 'amp',
      model: 'amp-default',
      name: '',
      prompt: '',
    };
    setAgents([...agents, newAgent]);
  };

  const removeAgent = (id: string) => {
    if (agents.length > 1) {
      setAgents(agents.filter((agent) => agent.id !== id));
    }
  };

  const updateAgent = (id: string, field: keyof Agent, value: string) => {
    setAgents(
      agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              [field]: value,
              // Reset model when type changes
              ...(field === 'type' && { model: MODEL_OPTIONS[value as AgentType][0].value }),
            }
          : agent
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call API to create conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          mode,
          maxTurns: maxTurns ? parseInt(maxTurns) : undefined,
          initialPrompt,
          participants: agents.map((agent) => ({
            type: agent.type,
            model: agent.model,
            name: agent.name || undefined,
            prompt: agent.prompt || undefined,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error
        console.error('Failed to create conversation:', data.error);
        alert(`Failed to create conversation: ${data.error || 'Unknown error'}`);
        setIsSubmitting(false);
        return;
      }

      // Check if Docker container was spawned successfully
      if (!data.success) {
        console.error('Container spawn failed:', data.error);
        alert(`Conversation created but container failed to start: ${data.error}`);
      }

      // Redirect to dashboard or conversation view
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isFormValid = name.trim() && initialPrompt.trim() && agents.length > 0;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold leading-tight text-foreground mb-2">
            New Conversation
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Configure a multi-agent conversation session. Choose your agents, set the initial
            prompt, and start orchestrating AI collaboration.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Conversation Name"
                placeholder="e.g., Code Review Session, Architecture Discussion"
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText="A descriptive name for this conversation"
                maxLength={100}
                required
              />

              <Textarea
                label="Initial Prompt"
                placeholder="Describe what you want the agents to discuss or accomplish..."
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                helperText="This will be the starting point for the multi-agent conversation"
                showCount
                maxLength={1000}
                required
              />

              {/* Mode Selector */}
              <div>
                <label className="block text-sm font-medium mb-3 text-foreground">
                  Orchestrator Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {MODES.map((modeOption) => (
                    <button
                      key={modeOption.value}
                      type="button"
                      onClick={() => setMode(modeOption.value)}
                      className={`
                        border-2 rounded-lg p-4 text-left transition-all duration-fast cursor-pointer
                        ${
                          mode === modeOption.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                            : 'border-border hover:border-border-strong hover:bg-accent/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{modeOption.icon}</span>
                        <span className="font-semibold text-sm">{modeOption.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{modeOption.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Agent Configuration */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Agents</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add and configure the AI agents participating in this conversation
              </p>
            </div>

            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="bg-muted/20 border border-border rounded-lg p-4"
                >
                  {/* Agent Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <AgentAvatar agent={agent.type} size="md" />
                      <span className="text-base font-semibold">Agent {index + 1}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => removeAgent(agent.id)}
                      disabled={agents.length === 1}
                      className={agents.length > 1 ? 'hover:text-destructive' : ''}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>

                  {/* Agent Fields */}
                  <div className="space-y-3">
                    <Select
                      label="Agent Type"
                      value={agent.type}
                      onChange={(value) => updateAgent(agent.id, 'type', value)}
                      options={AGENT_TYPES.map((t) => ({
                        value: t.value,
                        label: `${t.label} (${t.provider})`,
                      }))}
                    />

                    <Select
                      label="Model"
                      value={agent.model}
                      onChange={(value) => updateAgent(agent.id, 'model', value)}
                      options={MODEL_OPTIONS[agent.type] || []}
                    />

                    <Input
                      label="Agent Name (optional)"
                      placeholder="Leave empty to use default"
                      value={agent.name}
                      onChange={(e) => updateAgent(agent.id, 'name', e.target.value)}
                      helperText="Custom identifier for this agent instance"
                    />

                    <Textarea
                      label="Agent Prompt (optional)"
                      placeholder="Optional custom system prompt for this agent..."
                      value={agent.prompt}
                      onChange={(e) => updateAgent(agent.id, 'prompt', e.target.value)}
                      helperText="Override the default agent behavior with custom instructions"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addAgent}
                className="w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Agent
              </Button>
            </div>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/50 transition-colors rounded-t-lg"
            >
              <h3 className="text-lg font-semibold">Advanced Settings</h3>
              <svg
                className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAdvanced && (
              <div className="p-6 pt-0 space-y-4">
                <Input
                  type="number"
                  label="Maximum Turns (optional)"
                  placeholder="e.g., 10"
                  value={maxTurns}
                  onChange={(e) => setMaxTurns(e.target.value)}
                  helperText="Limit the number of conversation turns. Leave empty for default (10)."
                  min={1}
                />
              </div>
            )}
          </Card>

          {/* Action Bar */}
          <div className="sticky bottom-0 md:static bg-background/95 backdrop-blur-sm md:bg-transparent border-t border-border md:border-0 p-4 md:p-0 md:mt-8 -mx-4 md:mx-0">
            <div className="flex flex-col-reverse md:flex-row md:justify-between gap-3 max-w-3xl mx-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isFormValid || isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    Start Conversation
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
