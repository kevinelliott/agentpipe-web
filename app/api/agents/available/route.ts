import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AgentInfo {
  name: string;
  command?: string;
  version?: string;
  available: boolean;
  authenticated?: boolean;
  path?: string;
  install_cmd?: string;
  upgrade_cmd?: string;
  docs?: string;
  error?: string;
  issues?: string[];
}

export interface DoctorOutput {
  agents: Record<string, AgentInfo>;
  system?: {
    os: string;
    arch: string;
  };
}

/**
 * GET /api/agents/available
 * Returns available agents from agentpipe doctor --json
 *
 * This endpoint calls the agentpipe CLI to check which AI CLI tools
 * are installed and available on the system.
 */
export async function GET(request: NextRequest) {
  try {
    // Execute agentpipe doctor --json
    const { stdout, stderr } = await execAsync('agentpipe doctor --json', {
      timeout: 10000, // 10 second timeout
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
    } catch (parseError) {
      console.error('Failed to parse agentpipe doctor output:', stdout);
      return NextResponse.json(
        { error: 'Invalid JSON from agentpipe doctor', details: stdout },
        { status: 500 }
      );
    }

    // Transform into frontend-friendly format
    const availableAgents = Object.entries(doctorOutput.agents || {})
      .filter(([_, info]) => info.available)
      .map(([name, info]) => ({
        id: name.toLowerCase(),
        name: formatAgentName(name),
        type: name.toLowerCase(),
        command: info.command,
        version: info.version,
        path: info.path,
        authenticated: info.authenticated,
        available: info.available,
        upgradeCmd: info.upgrade_cmd,
        docsUrl: info.docs,
      }));

    const unavailableAgents = Object.entries(doctorOutput.agents || {})
      .filter(([_, info]) => !info.available)
      .map(([name, info]) => ({
        id: name.toLowerCase(),
        name: formatAgentName(name),
        type: name.toLowerCase(),
        command: info.command,
        available: info.available,
        error: info.error,
        issues: info.issues || [],
        installCmd: info.install_cmd,
        docsUrl: info.docs,
      }));

    return NextResponse.json({
      available: availableAgents,
      unavailable: unavailableAgents,
      system: doctorOutput.system,
      totalAvailable: availableAgents.length,
      totalUnavailable: unavailableAgents.length,
    });
  } catch (error) {
    console.error('Error fetching available agents:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // If agentpipe is not installed, provide helpful error
    if (errorMessage.includes('command not found') || errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          error: 'AgentPipe CLI not installed',
          details: 'Install agentpipe from https://github.com/kevinelliott/agentpipe',
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
        available: [],
        unavailable: [],
        totalAvailable: 0,
        totalUnavailable: 0,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to format agent names for display
 */
function formatAgentName(name: string): string {
  const nameMap: Record<string, string> = {
    'amp': 'Amp CLI',
    'claude': 'Claude CLI',
    'copilot': 'GitHub Copilot CLI',
    'cursor': 'Cursor CLI',
    'gemini': 'Gemini CLI',
    'qoder': 'Qoder CLI',
    'qwen': 'Qwen CLI',
    'codex': 'Codex CLI',
    'gpt': 'GPT CLI',
    'o1': 'O1 CLI',
  };

  return nameMap[name.toLowerCase()] || `${name.charAt(0).toUpperCase()}${name.slice(1)} CLI`;
}
