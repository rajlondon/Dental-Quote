/**
 * Simple logger utility
 */

// Set log level based on environment
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Log levels in order of verbosity
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Current log level as a number
const currentLogLevel = LOG_LEVELS[LOG_LEVEL as keyof typeof LOG_LEVELS] || LOG_LEVELS.info;

/**
 * Check if a log level should be output based on the current log level
 * @param level The level to check
 * @returns Boolean indicating if the log should be output
 */
function shouldLog(level: keyof typeof LOG_LEVELS): boolean {
  return LOG_LEVELS[level] <= currentLogLevel;
}

/**
 * Format log with timestamp and level
 * @param level Log level
 * @param message Log message
 * @param meta Additional metadata
 * @returns Formatted log string
 */
function formatLog(level: string, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

/**
 * Logger object with methods for each log level
 */
export const log = {
  error: (message: string, meta?: any) => {
    if (shouldLog('error')) {
      console.error(formatLog('error', message, meta));
    }
  },
  
  warn: (message: string, meta?: any) => {
    if (shouldLog('warn')) {
      console.warn(formatLog('warn', message, meta));
    }
  },
  
  info: (message: string, meta?: any) => {
    if (shouldLog('info')) {
      console.info(formatLog('info', message, meta));
    }
  },
  
  http: (message: string, meta?: any) => {
    if (shouldLog('http')) {
      console.log(formatLog('http', message, meta));
    }
  },
  
  debug: (message: string, meta?: any) => {
    if (shouldLog('debug')) {
      console.debug(formatLog('debug', message, meta));
    }
  }
};

export default log;