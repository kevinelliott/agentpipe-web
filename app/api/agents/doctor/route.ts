import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { settingsService } from '@/app/lib/settings';
import { SettingKey } from '@/app/types/settings';

const execAsync = promisify(exec);

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
 * GET /api/agents/doctor
 * Returns diagnostic information from agentpipe doctor --json
 *
 * This endpoint runs the agentpipe doctor command to check system
 * environment, configuration, and agent availability.
 */
export async function GET(_request: NextRequest) {
  try {
    // Get AgentPipe binary path and timeout from settings
    const binaryPath = await settingsService.get<string>(
      SettingKey.AGENTPIPE_BINARY_PATH
    );
    const timeout = await settingsService.get<number>(
      SettingKey.AGENTPIPE_TIMEOUT_MS
    );

    console.log(`Executing agentpipe doctor (timeout: ${timeout}ms)`);

    // Execute agentpipe doctor --json
    const { stdout, stderr } = await execAsync(`${binaryPath} doctor --json`, {
      timeout,
    });

    if (stderr && !stdout) {
      console.error('agentpipe doctor stderr:', stderr);
      return NextResponse.json(
        { error: 'Failed to execute agentpipe doctor', details: stderr },
        { status: 500 }
      );
    }

    // Parse JSON output
    let doctorOutput: DoctorOutput;
    try {
      doctorOutput = JSON.parse(stdout);
    } catch (_parseError) {
      console.error('Failed to parse agentpipe doctor output:', stdout);
      return NextResponse.json(
        { error: 'Invalid JSON from agentpipe doctor', details: stdout },
        { status: 500 }
      );
    }

    // Return the full doctor output
    return NextResponse.json({
      systemEnvironment: doctorOutput.system_environment,
      supportedAgents: doctorOutput.supported_agents,
      availableAgents: doctorOutput.available_agents,
      configuration: doctorOutput.configuration,
      summary: doctorOutput.summary,
    });
  } catch (error) {
    console.error('Error running agentpipe doctor:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorObj = error as any;

    // If command was killed (timeout), provide helpful guidance
    if (errorObj.killed || errorObj.signal === 'SIGTERM') {
      return NextResponse.json(
        {
          error: 'AgentPipe doctor command timed out',
          details: 'The agentpipe doctor command did not respond within the timeout period. Please verify your AgentPipe installation and configure the correct binary path in Settings.',
          settingsUrl: '/settings',
        },
        { status: 503 } // Service Unavailable
      );
    }

    // If agentpipe is not installed, provide helpful error
    if (errorMessage.includes('command not found') || errorMessage.includes('not found') || errorMessage.includes('ENOENT')) {
      return NextResponse.json(
        {
          error: 'AgentPipe CLI not found',
          details: 'AgentPipe CLI could not be found. Please install AgentPipe or configure the correct binary path in Settings.',
          settingsUrl: '/settings',
          installUrl: 'https://github.com/kevinelliott/agentpipe',
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to run agentpipe doctor',
        details: errorMessage,
        settingsUrl: '/settings',
      },
      { status: 500 }
    );
  }
}
