import React from 'react';
import { ParticipantCard } from './ParticipantCard';
import { type AgentType } from '../agent/AgentAvatar';
import { SidebarSection } from '../ui/SidebarSection';

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

interface ParticipantsListProps {
  participants: Participant[];
  mapAgentTypeToAgentType: (agentType: string) => AgentType;
}

export function ParticipantsList({
  participants,
  mapAgentTypeToAgentType,
}: ParticipantsListProps) {
  if (!participants || participants.length === 0) {
    return (
      <SidebarSection title="Participants" collapsible>
        <div className="text-xs text-muted-foreground text-center py-4">
          No participants
        </div>
      </SidebarSection>
    );
  }

  return (
    <SidebarSection
      title="Participants"
      collapsible
      defaultOpen={true}
      count={participants.length}
    >
      <div className="space-y-2">
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.id}
            agentName={participant.agentName}
            agentType={mapAgentTypeToAgentType(participant.agentType)}
            model={participant.model}
            agentVersion={participant.agentVersion}
            cliVersion={participant.cliVersion}
            prompt={participant.prompt}
          />
        ))}
      </div>
    </SidebarSection>
  );
}
