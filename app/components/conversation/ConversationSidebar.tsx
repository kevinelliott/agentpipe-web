'use client';

import React from 'react';
import { type AgentType } from '../agent/AgentAvatar';
import { MetricsGrid } from './MetricsGrid';
import { ParticipantsList } from './ParticipantsList';
import { TechnicalDetailsCard } from './TechnicalDetailsCard';

interface Participant {
  id: string;
  agentId: string;
  agentType: string;
  agentName: string;
  agentVersion: string | null;
  model: string | null;
  prompt: string | null;
  announcement: string | null;
  cliVersion: string | null;
}

interface ConversationSidebarProps {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;
  maxTurns?: number | null;
  participants: Participant[];
  mapAgentTypeToAgentType: (agentType: string) => AgentType;
  agentpipeVersion?: string | null;
  systemOS?: string | null;
  systemOSVersion?: string | null;
  systemGoVersion?: string | null;
  systemArchitecture?: string | null;
  containerId?: string | null;
  containerStatus?: string | null;
}

export function ConversationSidebar({
  totalMessages,
  totalTokens,
  totalCost,
  totalDuration,
  maxTurns,
  participants,
  mapAgentTypeToAgentType,
  agentpipeVersion,
  systemOS,
  systemOSVersion,
  systemGoVersion,
  systemArchitecture,
  containerId,
  containerStatus,
}: ConversationSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <MetricsGrid
        totalMessages={totalMessages}
        totalTokens={totalTokens}
        totalCost={totalCost}
        totalDuration={totalDuration}
        maxTurns={maxTurns}
      />

      {/* Participants List */}
      <ParticipantsList
        participants={participants}
        mapAgentTypeToAgentType={mapAgentTypeToAgentType}
      />

      {/* Technical Details */}
      <TechnicalDetailsCard
        agentpipeVersion={agentpipeVersion}
        systemOS={systemOS}
        systemOSVersion={systemOSVersion}
        systemGoVersion={systemGoVersion}
        systemArchitecture={systemArchitecture}
        containerId={containerId}
        containerStatus={containerStatus}
      />
    </div>
  );
}
