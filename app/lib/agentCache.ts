/**
 * Cache layer for AgentPipe doctor results
 *
 * Caches the expensive `agentpipe doctor --json` call to avoid
 * repeated slow executions during page loads and navigation.
 */

interface CachedAgentData {
  data: any;
  timestamp: number;
}

class AgentCache {
  private cache: CachedAgentData | null = null;
  private readonly TTL = 60000; // 60 seconds cache

  /**
   * Get cached data if still valid
   */
  get(): any | null {
    if (!this.cache) return null;

    const now = Date.now();
    const age = now - this.cache.timestamp;

    if (age > this.TTL) {
      // Cache expired
      this.cache = null;
      return null;
    }

    return this.cache.data;
  }

  /**
   * Store data in cache with current timestamp
   */
  set(data: any): void {
    this.cache = {
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache = null;
  }

  /**
   * Get cache age in milliseconds
   */
  getAge(): number | null {
    if (!this.cache) return null;
    return Date.now() - this.cache.timestamp;
  }

  /**
   * Check if cache is still valid
   */
  isValid(): boolean {
    if (!this.cache) return false;
    const age = Date.now() - this.cache.timestamp;
    return age <= this.TTL;
  }
}

// Export singleton instance
export const agentCache = new AgentCache();
