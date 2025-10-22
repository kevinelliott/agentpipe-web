import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { settingsService } from '@/app/lib/settings';
import { SettingKey } from '@/app/types/settings';
import { agentCache } from '@/app/lib/agentCache';

const execAsync = promisify(exec);

export interface AgentInfo {
  name: string;
  command: string;
  available: boolean;
  path?: string;
  version?: string;
  install_cmd?: string;
  upgrade_cmd?: string;
  docs?: string;
  authenticated?: boolean;
}

export interface SystemEnvironmentCheck {
  name: string;
  status: boolean;
  message: string;
  icon: string;
}

export interface ConfigurationCheck {
  name: string;
  status: boolean;
  message: string;
  icon: string;
}

export interface DoctorSummary {
  total_agents: number;
  available_count: number;
  ready: boolean;
}

export interface DoctorOutput {
  system_environment: SystemEnvironmentCheck[];
  supported_agents: AgentInfo[];
  available_agents: AgentInfo[];
  configuration: ConfigurationCheck[];
  summary: DoctorSummary;
}

/**
 * GET /api/agents/available
 * Returns available agents from agentpipe agents list --json --installed --current
 *
 * This endpoint calls the agentpipe CLI to check which AI CLI tools
 * are installed and available on the system.
 */
export async function GET(request: NextRequest) {
  try {
    // Allow cache bypass via query parameter (useful for testing/settings)
    const searchParams = request.nextUrl.searchParams;
    const skipCache = searchParams.get('skipCache') === 'true';

    // Check cache first (60 second TTL) unless explicitly skipped
    if (!skipCache) {
      const cachedData = agentCache.get();
      if (cachedData) {
        console.log(`Returning cached agent data (age: ${agentCache.getAge()}ms)`);
        return NextResponse.json(cachedData);
      }
    } else {
      console.log('Cache bypassed via skipCache parameter');
    }

    // Get AgentPipe binary path and timeout from settings
    const binaryPath = await settingsService.get<string>(
      SettingKey.AGENTPIPE_BINARY_PATH
    );
    const timeout = await settingsService.get<number>(
      SettingKey.AGENTPIPE_TIMEOUT_MS
    );

    console.log(`Executing agentpipe agents list (timeout: ${timeout}ms)`);

    // Execute agentpipe agents list --json --installed --current
    const { stdout, stderr } = await execAsync(`${binaryPath} agents list --json --installed --current`, {
      timeout,
    });

    if (stderr && !stdout) {
      console.error('agentpipe agents list stderr:', stderr);
      return NextResponse.json(
        { error: 'Failed to execute agentpipe agents list', details: stderr },
        { status: 500 }
      );
    }

    // Parse JSON output - v0.2.4+ returns { agents: [...] }
    let agentsListOutput: { agents: AgentInfo[] };
    try {
      agentsListOutput = JSON.parse(stdout);
    } catch (parseError) {
      console.error('Failed to parse agentpipe agents list output:', stdout);
      return NextResponse.json(
        { error: 'Invalid JSON from agentpipe agents list', details: stdout },
        { status: 500 }
      );
    }

    // Transform into frontend-friendly format using new v0.2.4 structure
    const agentsArray = agentsListOutput.agents || [];
    const availableAgents = agentsArray
      .filter((agent) => agent.available)
      .map((agent) => ({
        id: agent.name.toLowerCase(),
        name: agent.name,
        type: agent.name.toLowerCase(),
        command: agent.command,
        version: agent.version,
        path: agent.path,
        authenticated: agent.authenticated,
        available: agent.available,
        upgradeCmd: agent.upgrade_cmd,
        docsUrl: agent.docs,
      }));

    // Get unavailable agents
    const unavailableAgents = agentsArray
      .filter((agent) => !agent.available)
      .map((agent) => ({
        id: agent.name.toLowerCase(),
        name: agent.name,
        type: agent.name.toLowerCase(),
        command: agent.command,
        available: false,
        installCmd: agent.install_cmd,
        docsUrl: agent.docs,
      }));

    const response = {
      available: availableAgents,
      unavailable: unavailableAgents,
      summary: {
        total_agents: agentsArray.length,
        available_count: availableAgents.length,
        ready: availableAgents.length > 0,
      },
      systemEnvironment: [],
      configuration: [],
      totalAvailable: availableAgents.length,
      totalUnavailable: unavailableAgents.length,
    };

    // Cache the successful response
    agentCache.set(response);
    console.log('Cached agent data for 60 seconds');

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching available agents:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Try to fall back to manual agent configuration
    try {
      console.log('CLI failed, attempting to load manual agents from settings');
      const manualAgentsJson = await settingsService.get<string>(SettingKey.AGENTPIPE_MANUAL_AGENTS);
      let manualAgents = [];

      try {
        manualAgents = JSON.parse(manualAgentsJson);
      } catch (parseError) {
        console.error('Failed to parse manual agents:', parseError);
      }

      if (Array.isArray(manualAgents) && manualAgents.length > 0) {
        console.log(`Using ${manualAgents.length} manually configured agents`);

        const availableAgents = manualAgents
          .filter((agent: any) => agent.status === 'available')
          .map((agent: any) => ({
            id: agent.type.toLowerCase(),
            name: agent.name,
            type: agent.type.toLowerCase(),
            command: agent.type.toLowerCase(),
            version: agent.version || 'manual',
            available: true,
            manual: true, // Flag to indicate this is manually configured
          }));

        const unavailableAgents = manualAgents
          .filter((agent: any) => agent.status === 'unavailable')
          .map((agent: any) => ({
            id: agent.type.toLowerCase(),
            name: agent.name,
            type: agent.type.toLowerCase(),
            command: agent.type.toLowerCase(),
            available: false,
            manual: true,
          }));

        const response = {
          available: availableAgents,
          unavailable: unavailableAgents,
          summary: {
            total_agents: manualAgents.length,
            available_count: availableAgents.length,
            ready: availableAgents.length > 0,
          },
          systemEnvironment: [],
          configuration: [],
          totalAvailable: availableAgents.length,
          totalUnavailable: unavailableAgents.length,
          source: 'manual', // Indicate that this data comes from manual configuration
          cliError: errorMessage, // Include CLI error for debugging
        };

        // Cache the manual agent data
        agentCache.set(response);

        return NextResponse.json(response);
      }
    } catch (fallbackError) {
      console.error('Error loading manual agents:', fallbackError);
    }

    // No manual agents configured, return appropriate error
    const errorObj = error as any;

    // If command was killed (timeout), provide helpful guidance
    if (errorObj.killed || errorObj.signal === 'SIGTERM') {
      return NextResponse.json(
        {
          error: 'AgentPipe command timed out',
          details: 'The agentpipe command did not respond within the timeout period. Please verify your AgentPipe installation or configure agents manually in Settings.',
          settingsUrl: '/settings',
          available: [],
          unavailable: [],
          totalAvailable: 0,
          totalUnavailable: 0,
        },
        { status: 503 } // Service Unavailable
      );
    }

    // If agentpipe is not installed, provide helpful error
    if (errorMessage.includes('command not found') || errorMessage.includes('not found') || errorMessage.includes('ENOENT')) {
      return NextResponse.json(
        {
          error: 'AgentPipe CLI not found',
          details: 'AgentPipe CLI could not be found. Please install AgentPipe or configure agents manually in Settings.',
          settingsUrl: '/settings',
          installUrl: 'https://github.com/kevinelliott/agentpipe',
          available: [],
          unavailable: [],
          totalAvailable: 0,
          totalUnavailable: 0,
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch available agents',
        details: errorMessage,
        settingsUrl: '/settings',
        available: [],
        unavailable: [],
        totalAvailable: 0,
        totalUnavailable: 0,
      },
      { status: 500 }
    );
  }
}

