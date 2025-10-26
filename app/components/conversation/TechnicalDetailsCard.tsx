import React from 'react';
import { SidebarSection } from '../ui/SidebarSection';

interface TechnicalDetailsCardProps {
  agentpipeVersion?: string | null;
  systemOS?: string | null;
  systemOSVersion?: string | null;
  systemGoVersion?: string | null;
  systemArchitecture?: string | null;
  containerId?: string | null;
  containerStatus?: string | null;
}

export function TechnicalDetailsCard({
  agentpipeVersion,
  systemOS,
  systemOSVersion,
  systemGoVersion,
  systemArchitecture,
  containerId,
  containerStatus,
}: TechnicalDetailsCardProps) {
  const details: Array<{
    label: string;
    value: string;
    icon?: string;
  }> = [];

  if (agentpipeVersion) {
    details.push({
      label: 'AgentPipe',
      value: agentpipeVersion,
      icon: '📦',
    });
  }

  if (systemOS && systemOSVersion) {
    details.push({
      label: 'OS',
      value: `${systemOS} ${systemOSVersion}`,
      icon: '🖥️',
    });
  }

  if (systemArchitecture) {
    details.push({
      label: 'Architecture',
      value: systemArchitecture,
      icon: '⚙️',
    });
  }

  if (systemGoVersion) {
    details.push({
      label: 'Go',
      value: systemGoVersion,
      icon: '🐹',
    });
  }

  if (containerStatus) {
    details.push({
      label: 'Container',
      value: containerStatus,
      icon: '🐳',
    });
  }

  if (!details.length) {
    return null;
  }

  return (
    <SidebarSection title="Technical Details" collapsible defaultOpen={false}>
      <div className="space-y-2">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex items-start justify-between gap-2 p-2 rounded bg-muted/30 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              {detail.icon && <span className="flex-shrink-0">{detail.icon}</span>}
              <span className="text-muted-foreground font-medium flex-shrink-0">
                {detail.label}:
              </span>
            </div>
            <span className="text-foreground text-right truncate font-mono text-xs">
              {detail.value}
            </span>
          </div>
        ))}

        {containerId && (
          <div className="border-t border-border pt-2 mt-2">
            <div className="text-xs text-muted-foreground font-medium mb-2">
              Container ID
            </div>
            <div className="bg-muted/50 rounded p-2 font-mono text-xs text-muted-foreground break-all">
              {containerId}
            </div>
          </div>
        )}
      </div>
    </SidebarSection>
  );
}
