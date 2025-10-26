import React from 'react';
import { AgentAvatar, type AgentType } from '../agent/AgentAvatar';

interface ParticipantCardProps {
  agentName: string;
  agentType: AgentType;
  model?: string | null;
  agentVersion?: string | null;
  cliVersion?: string | null;
  prompt?: string | null;
}

export function ParticipantCard({
  agentName,
  agentType,
  model,
  agentVersion,
  cliVersion,
  prompt,
}: ParticipantCardProps) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-3">
      {/* Agent header */}
      <div className="flex items-start gap-3">
        <AgentAvatar agent={agentType} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">
            {agentName}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {agentType.charAt(0).toUpperCase() + agentType.slice(1)}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs">
        {model && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground font-medium">Model:</span>
            <span className="text-foreground text-right truncate">
              {model}
            </span>
          </div>
        )}

        {agentVersion && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground font-medium">Version:</span>
            <span className="text-foreground">v{agentVersion}</span>
          </div>
        )}

        {cliVersion && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground font-medium">CLI:</span>
            <span className="text-foreground">v{cliVersion}</span>
          </div>
        )}
      </div>

      {/* Prompt (if available and different from agent name) */}
      {prompt && prompt !== agentName && (
        <div className="bg-muted/50 rounded p-2 text-xs text-muted-foreground line-clamp-2">
          &quot;{prompt}&quot;
        </div>
      )}
    </div>
  );
}
