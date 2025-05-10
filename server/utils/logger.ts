/**
 * Logger utility for consistent logging throughout the application
 */

interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * Basic logger implementation
 */
class ConsoleLogger implements Logger {
  private timestamp(): string {
    return new Date().toISOString();
  }

  info(message: string, ...args: any[]): void {
    console.log(`${this.timestamp()} [INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`${this.timestamp()} [WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`${this.timestamp()} [ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`${this.timestamp()} [DEBUG] ${message}`, ...args);
    }
  }
}

export const logger: Logger = new ConsoleLogger();