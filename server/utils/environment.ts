/**
 * Utility functions for environment detection
 */

/**
 * Check if the application is running in production mode
 * @returns true if the environment is production, false otherwise
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if the application is running in development mode
 * @returns true if the environment is development, false otherwise
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Check if the application is running on Replit
 * @returns true if the environment is Replit, false otherwise
 */
export function isReplit(): boolean {
  return !!process.env.REPLIT || !!process.env.REPL_ID || !!process.env.REPLIT_DB_URL;
}

/**
 * Check if the application is running on a production Replit deployment
 * @returns true if the environment is a deployed Replit, false otherwise 
 */
export function isReplitDeployment(): boolean {
  return isReplit() && isProduction();
}

/**
 * Get environment name for logging
 * @returns A human-readable environment name
 */
export function getEnvironmentName(): string {
  if (isReplitDeployment()) return 'Replit Production';
  if (isReplit()) return 'Replit Development';
  if (isProduction()) return 'Production';
  return 'Development';
}