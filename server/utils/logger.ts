/**
 * Simple logger utility for consistent logging across the application
 */

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Colored log output for better visibility
const colors = {
  reset: '\x1b[0m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  time: '\x1b[90m',  // Grey for timestamp
};

// Current log level, can be changed at runtime
let currentLogLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Map log levels to numeric values for comparison
const logLevelValues: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Get the current timestamp in a readable format
const getTimestamp = (): string => {
  return new Date().toLocaleTimeString();
};

// Format the log message with appropriate colors and prefixes
const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = getTimestamp();
  return `${colors.time}${timestamp}${colors.reset} ${colors[level]}[${level}]${colors.reset} ${message}`;
};

// Set the log level
const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = level;
  console.log(formatMessage('info', `Log level set to ${level}`));
};

// Log a message if the level is at or above the current log level
const log = (level: LogLevel, message: string, ...args: any[]): void => {
  if (logLevelValues[level] >= logLevelValues[currentLogLevel]) {
    const formattedMessage = formatMessage(level, message);
    
    // Output to console based on log level
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, ...args);
        break;
      case 'info':
        console.info(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
    }
  }
};

// Export the logger methods
export const logger = {
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args),
  setLogLevel,
};