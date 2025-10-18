'use client';

import React from 'react';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface WebSocketStatusProps {
  status: ConnectionStatus;
  className?: string;
}

const statusConfig: Record<ConnectionStatus, { label: string; dotClass: string }> = {
  connected: {
    label: 'Connected',
    dotClass: 'bg-status-active animate-connection-pulse',
  },
  connecting: {
    label: 'Connecting...',
    dotClass: 'bg-status-interrupted animate-pulse',
  },
  disconnected: {
    label: 'Disconnected',
    dotClass: 'bg-status-error',
  },
};

export function WebSocketStatus({ status, className = '' }: WebSocketStatusProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted border border-border text-xs font-medium ${className}`.trim()}
    >
      <span className={`w-2 h-2 rounded-full relative ${config.dotClass}`} />
      <span>{config.label}</span>
    </div>
  );
}
