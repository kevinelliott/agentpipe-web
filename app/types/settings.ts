/**
 * Settings type definitions for AgentPipe Web
 */

export interface ManualAgent {
  name: string;
  type: string;
  status: 'available' | 'unavailable';
  version?: string;
}

export enum SettingKey {
  // AgentPipe Configuration
  AGENTPIPE_BINARY_PATH = 'agentpipe.binary_path',
  AGENTPIPE_TIMEOUT_MS = 'agentpipe.timeout_ms',
  AGENTPIPE_AUTO_DETECT = 'agentpipe.auto_detect',
  AGENTPIPE_MANUAL_AGENTS = 'agentpipe.manual_agents',

  // UI Preferences
  UI_THEME = 'ui.theme',
  UI_LANGUAGE = 'ui.language',

  // System Settings
  SYSTEM_NOTIFICATIONS = 'system.notifications',
}

export enum SettingCategory {
  AGENTPIPE = 'agentpipe',
  UI = 'ui',
  SYSTEM = 'system',
}

export enum SettingDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  PATH = 'path',
}

export interface Setting {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  key: string;
  value: string;
  description?: string | null;
  category?: string | null;
  dataType: string;
  userId?: string | null;
  isValid: boolean;
  validatedAt?: Date | null;
}

export interface SettingInput {
  key: string;
  value: string;
  description?: string;
  category?: SettingCategory;
  dataType?: SettingDataType;
  userId?: string;
}

export interface SettingValidationResult {
  key: string;
  isValid: boolean;
  error?: string;
  details?: string;
}

export interface SettingsResponse {
  settings: Setting[];
  total: number;
  error?: string;
}

export interface SettingResponse {
  setting: Setting;
  message?: string;
  error?: string;
}

/**
 * Default values for settings
 */
export const DEFAULT_SETTINGS: Record<string, any> = {
  [SettingKey.AGENTPIPE_BINARY_PATH]: 'agentpipe', // Will check PATH first, then use this
  [SettingKey.AGENTPIPE_TIMEOUT_MS]: 60000, // 60 seconds
  [SettingKey.AGENTPIPE_AUTO_DETECT]: true,
  [SettingKey.AGENTPIPE_MANUAL_AGENTS]: [],
  [SettingKey.UI_THEME]: 'system',
  [SettingKey.UI_LANGUAGE]: 'en',
  [SettingKey.SYSTEM_NOTIFICATIONS]: true,
};

/**
 * Setting metadata (descriptions, categories, data types)
 */
export const SETTING_METADATA: Record<string, {
  description: string;
  category: SettingCategory;
  dataType: SettingDataType;
  placeholder?: string;
  helperText?: string;
}> = {
  [SettingKey.AGENTPIPE_BINARY_PATH]: {
    description: 'Path to the AgentPipe CLI executable',
    category: SettingCategory.AGENTPIPE,
    dataType: SettingDataType.PATH,
    placeholder: '/usr/local/bin/agentpipe',
    helperText: 'Absolute path to the agentpipe binary. Leave as "agentpipe" to use PATH.',
  },
  [SettingKey.AGENTPIPE_TIMEOUT_MS]: {
    description: 'Timeout for AgentPipe commands in milliseconds',
    category: SettingCategory.AGENTPIPE,
    dataType: SettingDataType.NUMBER,
    placeholder: '60000',
    helperText: 'Maximum time to wait for agentpipe commands (1000-60000ms, default: 60000ms).',
  },
  [SettingKey.AGENTPIPE_AUTO_DETECT]: {
    description: 'Automatically detect available agents on startup',
    category: SettingCategory.AGENTPIPE,
    dataType: SettingDataType.BOOLEAN,
    helperText: 'When enabled, available agents will be detected automatically.',
  },
  [SettingKey.AGENTPIPE_MANUAL_AGENTS]: {
    description: 'Manually configured agents',
    category: SettingCategory.AGENTPIPE,
    dataType: SettingDataType.JSON,
    helperText: 'List of manually configured agents to use when CLI is not available (e.g., in production).',
  },
  [SettingKey.UI_THEME]: {
    description: 'UI theme preference',
    category: SettingCategory.UI,
    dataType: SettingDataType.STRING,
    helperText: 'Choose between light, dark, or system theme.',
  },
  [SettingKey.UI_LANGUAGE]: {
    description: 'UI language',
    category: SettingCategory.UI,
    dataType: SettingDataType.STRING,
    helperText: 'Interface language preference.',
  },
  [SettingKey.SYSTEM_NOTIFICATIONS]: {
    description: 'Enable system notifications',
    category: SettingCategory.SYSTEM,
    dataType: SettingDataType.BOOLEAN,
    helperText: 'Show desktop notifications for important events.',
  },
};
