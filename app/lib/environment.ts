/**
 * Environment detection utilities
 */

/**
 * Check if the app is running in production on the agentpipe.ai domain
 * This is used to disable features that require local CLI access
 */
export function isProductionDomain(): boolean {
  // Server-side: always return false (we need client-side detection)
  if (typeof window === 'undefined') {
    return false;
  }

  // Client-side: check hostname
  const hostname = window.location.hostname;
  return hostname === 'agentpipe.ai' || hostname === 'www.agentpipe.ai';
}

/**
 * Check if local CLI features should be enabled
 * Returns true if:
 * - Running in development
 * - Running on localhost
 * - Running on any domain other than agentpipe.ai
 */
export function isLocalCLIAvailable(): boolean {
  return !isProductionDomain();
}
