export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogContext = Record<string, unknown>;

export interface ILogger {
  readonly level: LogLevel;
  trace(messageOrEvent: string, context?: LogContext): void;
  debug(messageOrEvent: string, context?: LogContext): void;
  info(messageOrEvent: string, context?: LogContext): void;
  warn(messageOrEvent: string, context?: LogContext): void;
  error(messageOrEvent: string, error?: unknown, context?: LogContext): void;
  fatal(messageOrEvent: string, error?: unknown, context?: LogContext): void;
  child(bindings: LogContext): ILogger;
}
