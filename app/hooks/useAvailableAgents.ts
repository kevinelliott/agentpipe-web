'use client';

import { useState, useEffect } from 'react';

export interface AvailableAgent {
  id: string;
  name: string;
  type: string;
  command?: string;
  version?: string;
  path?: string;
  authenticated?: boolean;
  available: boolean;
  upgradeCmd?: string;
  docsUrl?: string;
}

export interface UnavailableAgent {
  id: string;
  name: string;
  type: string;
  command?: string;
  available: boolean;
  error?: string;
  issues?: string[];
  installCmd?: string;
  docsUrl?: string;
}

export interface AvailableAgentsResponse {
  available: AvailableAgent[];
  unavailable: UnavailableAgent[];
  system?: {
    os: string;
    arch: string;
  };
  totalAvailable: number;
  totalUnavailable: number;
  error?: string;
  details?: string;
}

export interface UseAvailableAgentsResult {
  agents: AvailableAgent[];
  unavailableAgents: UnavailableAgent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch available agents from agentpipe doctor --json
 */
export function useAvailableAgents(): UseAvailableAgentsResult {
  const [agents, setAgents] = useState<AvailableAgent[]>([]);
  const [unavailableAgents, setUnavailableAgents] = useState<UnavailableAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/available');
      const data: AvailableAgentsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch available agents');
      }

      setAgents(data.available || []);
      setUnavailableAgents(data.unavailable || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching available agents:', err);

      // Set empty arrays on error
      setAgents([]);
      setUnavailableAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    unavailableAgents,
    isLoading,
    error,
    refetch: fetchAgents,
  };
}
