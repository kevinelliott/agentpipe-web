import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface AgentConfig {
  type: string;
  model: string;
  name?: string;
  prompt?: string;
}

export interface ConversationConfig {
  mode: string;
  maxTurns?: number;
  initialPrompt: string;
  agents: AgentConfig[];
}

export interface DockerSpawnResult {
  containerId: string;
  success: boolean;
  error?: string;
  errorStack?: string;
}

/**
 * Spawns an AgentPipe Docker container with the specified configuration
 */
export async function spawnAgentPipeContainer(
  conversationId: string,
  config: ConversationConfig
): Promise<DockerSpawnResult> {
  try {
    // Build the Docker command arguments (no shell escaping needed - passed as array)
    const dockerArgs: string[] = [
      'run',
      '-d', // Detached mode
      '--name', `agentpipe-${conversationId}`,
      '--label', `agentpipe.conversation.id=${conversationId}`,
      '--rm', // Remove container when it stops
      '-e', `CONVERSATION_ID=${conversationId}`,
      'kevinelliott/agentpipe:latest',
    ];

    // Add mode
    dockerArgs.push('--mode', config.mode);

    // Add max turns if specified
    if (config.maxTurns) {
      dockerArgs.push('--max-turns', config.maxTurns.toString());
    }

    // Add agents - no escaping needed with execFile
    for (const agent of config.agents) {
      dockerArgs.push('--agent', agent.type);

      if (agent.model) {
        dockerArgs.push('--model', agent.model);
      }

      if (agent.name) {
        dockerArgs.push('--name', agent.name);
      }

      if (agent.prompt) {
        // No escaping needed - passed as separate argument
        dockerArgs.push('--prompt', agent.prompt);
      }
    }

    // Add initial prompt - no escaping needed with execFile
    dockerArgs.push('--initial-prompt', config.initialPrompt);

    // Execute the Docker command using execFile (safe from shell injection)
    const { stdout, stderr } = await execFileAsync('docker', dockerArgs);

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    // The container ID is returned in stdout
    const containerId = stdout.trim();

    if (!containerId) {
      throw new Error('Failed to get container ID from Docker');
    }

    return {
      containerId,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return {
      containerId: '',
      success: false,
      error: errorMessage,
      errorStack,
    };
  }
}

/**
 * Gets the status of a Docker container
 */
export async function getContainerStatus(containerId: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      'docker',
      ['inspect', '--format={{.State.Status}}', containerId]
    );
    return stdout.trim();
  } catch (_error) {
    return 'error';
  }
}

/**
 * Stops a Docker container
 */
export async function stopContainer(containerId: string): Promise<boolean> {
  try {
    await execFileAsync('docker', ['stop', containerId]);
    return true;
  } catch (error) {
    console.error(`Failed to stop container ${containerId}:`, error);
    return false;
  }
}

/**
 * Gets logs from a Docker container
 */
export async function getContainerLogs(
  containerId: string,
  tail: number = 100
): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      'docker',
      ['logs', '--tail', tail.toString(), containerId]
    );
    return stdout;
  } catch (_error) {
    return '';
  }
}
