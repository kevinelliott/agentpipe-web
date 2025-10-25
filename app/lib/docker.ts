import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    // Build the AgentPipe command line arguments
    const args: string[] = [];

    // Add mode
    args.push('--mode', config.mode);

    // Add max turns if specified
    if (config.maxTurns) {
      args.push('--max-turns', config.maxTurns.toString());
    }

    // Add agents
    for (const agent of config.agents) {
      args.push('--agent', agent.type);

      if (agent.model) {
        args.push('--model', agent.model);
      }

      if (agent.name) {
        args.push('--name', agent.name);
      }

      if (agent.prompt) {
        // Escape the prompt for shell
        const escapedPrompt = agent.prompt.replace(/"/g, '\\"');
        args.push('--prompt', `"${escapedPrompt}"`);
      }
    }

    // Add initial prompt (escaped)
    const escapedInitialPrompt = config.initialPrompt.replace(/"/g, '\\"');
    args.push('--initial-prompt', `"${escapedInitialPrompt}"`);

    // Build the Docker command
    // Note: Using detached mode (-d) to run in background
    const dockerCmd = [
      'docker run',
      '-d', // Detached mode
      '--name', `agentpipe-${conversationId}`,
      '--label', `agentpipe.conversation.id=${conversationId}`,
      '--rm', // Remove container when it stops
      // Mount volumes if needed (e.g., for config, logs)
      // '-v', '/path/to/config:/config',
      // Environment variables
      '-e', `CONVERSATION_ID=${conversationId}`,
      // AgentPipe Docker image
      'kevinelliott/agentpipe:latest',
      // AgentPipe arguments
      ...args,
    ].join(' ');

    // Execute the Docker command
    const { stdout, stderr } = await execAsync(dockerCmd);

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
    const { stdout } = await execAsync(
      `docker inspect --format='{{.State.Status}}' ${containerId}`
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
    await execAsync(`docker stop ${containerId}`);
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
    const { stdout } = await execAsync(`docker logs --tail ${tail} ${containerId}`);
    return stdout;
  } catch (_error) {
    return '';
  }
}
