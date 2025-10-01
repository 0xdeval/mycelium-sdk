/* eslint-disable no-console */
import { LogLevel, type LogEntry } from '@/types/logger';

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor(logLevel: LogLevel = LogLevel.DEBUG) {
    this.logLevel = logLevel;
  }

  public static getInstance(logLevel?: LogLevel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel);
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';

    return `${timestamp} ${levelName}${contextStr}: ${message}`;
  }

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

  public debug(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.DEBUG, message, data, context);
  }

  public info(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.INFO, message, data, context);
  }

  public warn(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.WARN, message, data, context);
  }

  public error(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.ERROR, message, data, context);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public setMaxLogs(max: number): void {
    this.maxLogs = max;
  }
}

export const logger = Logger.getInstance();

export const log = {
  debug: (message: string, data?: any, context?: string) => logger.debug(message, data, context),
  info: (message: string, data?: any, context?: string) => logger.info(message, data, context),
  warn: (message: string, data?: any, context?: string) => logger.warn(message, data, context),
  error: (message: string, data?: any, context?: string) => logger.error(message, data, context),
};
