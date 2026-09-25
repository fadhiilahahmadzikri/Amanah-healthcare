import {
  ssotLogger,
  type ILogger as IObservabilityLogger,
  type LogLevel as ObsLogLevel
} from '@/core/observability';

export type LogLevel = ObsLogLevel;

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

class SsotLoggerBridge implements ILogger {
  constructor(private readonly delegate: IObservabilityLogger = ssotLogger) {}

  debug(event: string, context?: Record<string, unknown>): void {
    this.delegate.debug(event, context);
  }

  info(event: string, context?: Record<string, unknown>): void {
    this.delegate.info(event, context);
  }

  warn(event: string, context?: Record<string, unknown>): void {
    this.delegate.warn(event, context);
  }

  error(event: string, error?: unknown, context?: Record<string, unknown>): void {
    this.delegate.error(event, error, context);
  }
}

export const logger: ILogger = new SsotLoggerBridge();
