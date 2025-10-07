/* eslint-disable no-console */
import { LogLevel, type LogEntry } from '@/types/logger';

/**
 * Logger service
 *
 * @internal
 * @category Utilities
 * @remarks
 * Provides a singleton logger with configurable log levels, console output,
 * and an in-memory log buffer. Supports exporting logs for debugging or analytics
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  /**
   * Create a new logger instance
   * @param logLevel Initial log level, defaults to DEBUG
   */
  private constructor(logLevel: LogLevel = LogLevel.DEBUG) {
    this.logLevel = logLevel;
  }
  /**
   * Get singleton instance of the logger
   * @param logLevel Optional log level to initialize if instance not yet created
   * @returns Logger instance
   */
  public static getInstance(logLevel?: LogLevel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel);
    }
    return Logger.instance;
  }
  /** Set the log level */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
  /** Get the current log level */
  public getLogLevel(): LogLevel {
    return this.logLevel;
  }
  /** Internal check if a message should be logged */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }
  /** Format log message into a readable string */
  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';

    return `${timestamp} ${levelName}${contextStr}: ${message}`;
  }
  /** Add a log entry and output to console */
  private addLog(level: LogLevel, message: string, data?: any, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with colors
    const formattedMessage = this.formatMessage(level, message, data, context);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`🔍 ${formattedMessage}`, data || '');
        break;
      case LogLevel.INFO:
        console.info(`ℹ️ ${formattedMessage}`, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`⚠️ ${formattedMessage}`, data || '');
        break;
      case LogLevel.ERROR:
        console.error(`❌ ${formattedMessage}`, data || '');
        break;
    }
  }
  /** Log a debug message */
  public debug(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.DEBUG, message, data, context);
  }
  /** Log an info message */
  public info(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.INFO, message, data, context);
  }
  /** Log a warning message */
  public warn(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.WARN, message, data, context);
  }
  /** Log an error message */
  public error(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.ERROR, message, data, context);
  }
  /** Get all logs */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }
  /** Get logs by level */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }
  /** Clear all logs */
  public clearLogs(): void {
    this.logs = [];
  }
  /** Export logs as a JSON string */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
  /** Set maximum number of logs to retain in memory */
  public setMaxLogs(max: number): void {
    this.maxLogs = max;
  }
}
/** Global logger instance */
export const logger = Logger.getInstance();
/**
 * Shorthand log methods
 * @internal
 */
export const log = {
  debug: (message: string, data?: any, context?: string) => logger.debug(message, data, context),
  info: (message: string, data?: any, context?: string) => logger.info(message, data, context),
  warn: (message: string, data?: any, context?: string) => logger.warn(message, data, context),
  error: (message: string, data?: any, context?: string) => logger.error(message, data, context),
};
