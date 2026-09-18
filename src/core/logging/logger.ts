import { redactSensitiveData } from './redact';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  event: string;
  message?: string;
  traceId?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface ILogger {
  debug(event: string, context?: Record<string, unknown>): void;
  info(event: string, context?: Record<string, unknown>): void;
  warn(event: string, context?: Record<string, unknown>): void;
  error(event: string, error?: unknown, context?: Record<string, unknown>): void;
}

class StructuredLogger implements ILogger {
  private log(
    level: LogLevel,
    event: string,
    context?: Record<string, unknown>,
    err?: unknown
  ): void {
    const entry: LogEntry = {
      level,
      event,
      timestamp: new Date().toISOString(),
      ...(context ? { context: redactSensitiveData(context) as Record<string, unknown> } : {}),
      ...(err instanceof Error ? { message: err.message } : {})
    };

    const serialized = JSON.stringify(entry);
    if (level === 'error') {
      console.error(serialized);
    } else if (level === 'warn') {
      console.warn(serialized);
    } else if (typeof process !== 'undefined' && process.stdout) {
      process.stdout.write(serialized + '\n');
    }
  }

  debug(event: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', event, context);
    }
  }

  info(event: string, context?: Record<string, unknown>): void {
    this.log('info', event, context);
  }

  warn(event: string, context?: Record<string, unknown>): void {
    this.log('warn', event, context);
  }

  error(event: string, error?: unknown, context?: Record<string, unknown>): void {
    this.log('error', event, context, error);
  }
}

export const logger: ILogger = new StructuredLogger();
