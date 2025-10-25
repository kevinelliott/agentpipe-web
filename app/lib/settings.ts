/**
 * Settings Service for AgentPipe Web
 *
 * Provides centralized settings management with:
 * - Database persistence via Prisma
 * - In-memory caching with TTL
 * - Environment variable fallbacks
 * - Default value fallbacks
 * - Type-safe setting access
 * - Async validation for paths
 */

import { PrismaClient } from '@prisma/client';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { access, constants } from 'fs/promises';
import {
  Setting,
  SettingKey,
  SettingDataType,
  SettingValidationResult,
  DEFAULT_SETTINGS,
  SETTING_METADATA,
} from '@/app/types/settings';

const execFileAsync = promisify(execFile);

// Singleton Prisma client instance
const prisma = new PrismaClient();

interface CacheEntry {
  value: any;
  timestamp: number;
}

class SettingsService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 60000; // 60 seconds

  /**
   * Get a setting value by key with type casting
   * Priority: cache > database > environment variable > default
   */
  async get<T = string>(key: SettingKey | string, userId?: string): Promise<T> {
    const cacheKey = this.getCacheKey(key, userId);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached !== undefined) {
      return cached as T;
    }

    try {
      // Try database
      // Note: Prisma doesn't allow null in unique constraints, so we use findFirst
      const setting = await prisma.setting.findFirst({
        where: {
          key: key.toString(),
          userId: userId ?? null,
        },
      });

      if (setting && setting.isValid) {
        const parsedValue = this.parseValue(setting.value, setting.dataType);
        this.setCache(cacheKey, parsedValue);
        return parsedValue as T;
      }
    } catch (error) {
      console.error(`Error fetching setting ${key} from database:`, error);
    }

    // Fallback to environment variable
    const envValue = this.getFromEnv(key);
    if (envValue !== undefined) {
      const metadata = SETTING_METADATA[key];
      const dataType = metadata?.dataType || SettingDataType.STRING;
      const parsedValue = this.parseValue(envValue, dataType);
      this.setCache(cacheKey, parsedValue);
      return parsedValue as T;
    }

    // Fallback to default
    const defaultValue = DEFAULT_SETTINGS[key];
    if (defaultValue !== undefined) {
      this.setCache(cacheKey, defaultValue);
      return defaultValue as T;
    }

    // No value found
    throw new Error(`Setting not found: ${key}`);
  }

  /**
   * Set a setting value
   */
  async set(
    key: SettingKey | string,
    value: any,
    userId?: string,
    skipValidation = false
  ): Promise<Setting> {
    const metadata = SETTING_METADATA[key];
    const dataType = metadata?.dataType || SettingDataType.STRING;
    const category = metadata?.category?.toString();
    const description = metadata?.description;

    // Validate the value before saving
    if (!skipValidation) {
      const validation = await this.validate(key, value);
      if (!validation.isValid) {
        throw new Error(validation.error || `Invalid value for ${key}`);
      }
    }

    const stringValue = this.stringifyValue(value, dataType);

    // Check if setting exists (Prisma doesn't support null in unique constraints)
    const existing = await prisma.setting.findFirst({
      where: {
        key: key.toString(),
        userId: userId ?? null,
      },
    });

    let setting;
    if (existing) {
      // Update existing setting
      setting = await prisma.setting.update({
        where: { id: existing.id },
        data: {
          value: stringValue,
          dataType,
          category,
          description,
          isValid: true,
          validatedAt: new Date(),
        },
      });
    } else {
      // Create new setting
      setting = await prisma.setting.create({
        data: {
          key: key.toString(),
          value: stringValue,
          dataType,
          category,
          description,
          userId: userId ?? null,
          isValid: true,
          validatedAt: new Date(),
        },
      });
    }

    // Invalidate cache
    const cacheKey = this.getCacheKey(key, userId);
    this.cache.delete(cacheKey);

    return setting;
  }

  /**
   * Get all settings, optionally filtered by category
   */
  async getAll(category?: string, userId?: string): Promise<Setting[]> {
    const where: any = {
      userId: userId ?? null,
    };

    if (category) {
      where.category = category;
    }

    const settings = await prisma.setting.findMany({
      where,
      orderBy: {
        key: 'asc',
      },
    });

    return settings;
  }

  /**
   * Get settings by category
   */
  async getByCategory(category: string, userId?: string): Promise<Setting[]> {
    return this.getAll(category, userId);
  }

  /**
   * Delete a setting
   */
  async delete(key: SettingKey | string, userId?: string): Promise<void> {
    // Use deleteMany instead of delete since we can't use null in unique constraints
    await prisma.setting.deleteMany({
      where: {
        key: key.toString(),
        userId: userId ?? null,
      },
    });

    // Invalidate cache
    const cacheKey = this.getCacheKey(key, userId);
    this.cache.delete(cacheKey);
  }

  /**
   * Validate a setting value
   */
  async validate(key: SettingKey | string, value: any): Promise<SettingValidationResult> {
    const keyStr = key.toString();

    try {
      // Type-specific validation
      const metadata = SETTING_METADATA[key];
      if (!metadata) {
        return { key: keyStr, isValid: true };
      }

      switch (metadata.dataType) {
        case SettingDataType.PATH:
          return await this.validatePath(keyStr, value);

        case SettingDataType.NUMBER:
          return this.validateNumber(keyStr, value);

        case SettingDataType.BOOLEAN:
          return this.validateBoolean(keyStr, value);

        case SettingDataType.JSON:
          return this.validateJSON(keyStr, value);

        default:
          return { key: keyStr, isValid: true };
      }
    } catch (error) {
      return {
        key: keyStr,
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Validate a path setting (file or directory)
   */
  private async validatePath(key: string, value: string): Promise<SettingValidationResult> {
    if (!value || typeof value !== 'string') {
      return {
        key,
        isValid: false,
        error: 'Path must be a non-empty string',
      };
    }

    // Sanitize: reject paths with null bytes or other suspicious characters
    if (value.includes('\0') || value.includes('..')) {
      return {
        key,
        isValid: false,
        error: 'Invalid characters in path',
        details: 'Path must not contain null bytes or ".." sequences',
      };
    }

    // Special handling for agentpipe binary path
    if (key === SettingKey.AGENTPIPE_BINARY_PATH) {
      return await this.validateBinaryPath(key, value);
    }

    // General path validation - check if path exists
    try {
      await access(value, constants.F_OK);
      return { key, isValid: true };
    } catch (_error) {
      // Path doesn't exist - not necessarily invalid if it's just a command name
      if (!value.includes('/')) {
        // Might be a command in PATH
        return { key, isValid: true };
      }

      return {
        key,
        isValid: false,
        error: `Path does not exist: ${value}`,
        details: 'Please provide an absolute path to an existing file or directory.',
      };
    }
  }

  /**
   * Validate AgentPipe binary path by executing --version
   */
  private async validateBinaryPath(key: string, value: string): Promise<SettingValidationResult> {
    try {
      // Execute with execFile for safe argument passing (no shell injection)
      const { stdout, stderr } = await execFileAsync(value, ['--version'], {
        timeout: 5000,
      });

      const output = stdout || stderr;

      // Check if output contains "agentpipe" to confirm it's the right binary
      if (output.toLowerCase().includes('agentpipe')) {
        return {
          key,
          isValid: true,
          details: `AgentPipe binary validated: ${output.trim()}`,
        };
      }

      return {
        key,
        isValid: false,
        error: 'Binary exists but does not appear to be agentpipe',
        details: output.trim(),
      };
    } catch (error) {
      return {
        key,
        isValid: false,
        error: 'Failed to execute agentpipe binary',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate a number setting
   */
  private validateNumber(key: string, value: any): SettingValidationResult {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return {
        key,
        isValid: false,
        error: 'Value must be a valid number',
      };
    }

    // Specific validation for timeout
    if (key === SettingKey.AGENTPIPE_TIMEOUT_MS) {
      if (num < 1000 || num > 60000) {
        return {
          key,
          isValid: false,
          error: 'Timeout must be between 1000ms (1s) and 60000ms (60s)',
        };
      }
    }

    return { key, isValid: true };
  }

  /**
   * Validate a boolean setting
   */
  private validateBoolean(key: string, value: any): SettingValidationResult {
    const validBooleans = ['true', 'false', true, false, 1, 0];

    if (!validBooleans.includes(value)) {
      return {
        key,
        isValid: false,
        error: 'Value must be a boolean (true/false)',
      };
    }

    return { key, isValid: true };
  }

  /**
   * Validate a JSON setting
   */
  private validateJSON(key: string, value: any): SettingValidationResult {
    if (typeof value === 'string') {
      try {
        JSON.parse(value);
        return { key, isValid: true };
      } catch (_error) {
        return {
          key,
          isValid: false,
          error: 'Invalid JSON format',
        };
      }
    }

    // Already an object
    return { key, isValid: true };
  }

  /**
   * Cache management
   */
  private getCacheKey(key: SettingKey | string, userId?: string): string {
    return userId ? `${key}:${userId}` : key.toString();
  }

  private getFromCache(cacheKey: string): any | undefined {
    const entry = this.cache.get(cacheKey);
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(cacheKey);
      return undefined;
    }

    return entry.value;
  }

  private setCache(cacheKey: string, value: any): void {
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get value from environment variable
   */
  private getFromEnv(key: SettingKey | string): string | undefined {
    // Map setting keys to environment variable names
    const envMap: Record<string, string> = {
      [SettingKey.AGENTPIPE_BINARY_PATH]: 'AGENTPIPE_BINARY_PATH',
      [SettingKey.AGENTPIPE_TIMEOUT_MS]: 'AGENTPIPE_TIMEOUT_MS',
      [SettingKey.AGENTPIPE_AUTO_DETECT]: 'AGENTPIPE_AUTO_DETECT',
    };

    const envKey = envMap[key.toString()];
    return envKey ? process.env[envKey] : undefined;
  }

  /**
   * Parse a string value based on data type
   */
  private parseValue(value: string, dataType: string): any {
    switch (dataType) {
      case SettingDataType.NUMBER:
        return parseFloat(value);

      case SettingDataType.BOOLEAN:
        return value === 'true' || value === '1';

      case SettingDataType.JSON:
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }

      default:
        return value;
    }
  }

  /**
   * Convert a value to string for storage
   */
  private stringifyValue(value: any, dataType: string): string {
    if (dataType === SettingDataType.JSON && typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
