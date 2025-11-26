/**
 * Logging utility with different levels and formatting
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private prefix: string;
  private isDevelopment: boolean;

  constructor(moduleName: string, isDevelopment = process.env.NODE_ENV === 'development') {
    this.prefix = `[${moduleName}]`;
    this.isDevelopment = isDevelopment;
  }

  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `${timestamp} ${this.prefix} [${level}] ${message}`;
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
    }
    return baseMessage;
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(this.format(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: any): void {
    console.log(this.format(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.format(LogLevel.WARN, message, data));
  }

  error(message: string, error?: any): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(this.format(LogLevel.ERROR, message, errorData));
  }

  success(message: string, data?: any): void {
    console.log(this.format(LogLevel.INFO, `✓ ${message}`, data));
  }
}
