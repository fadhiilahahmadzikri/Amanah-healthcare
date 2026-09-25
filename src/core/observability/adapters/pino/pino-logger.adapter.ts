import type { Logger as PinoInstance } from 'pino';
import type { ILogger, LogLevel, LogContext } from '../../ports/logger.port';
import { createRootPinoLogger } from './pino.config';
import { redactSensitiveValue } from '../../sanitizers/redaction.sanitizer';

export class PinoLoggerAdapter implements ILogger {
  private readonly pino: PinoInstance;

  constructor(pinoInstance?: PinoInstance) {
    this.pino = pinoInstance ?? createRootPinoLogger();
  }

  get level(): LogLevel {
    return this.pino.level as LogLevel;
  }

  get underlying(): PinoInstance {
    return this.pino;
  }

  trace(messageOrEvent: string, context?: LogContext): void {
    if (context) {
      this.pino.trace(redactSensitiveValue(context) as object, messageOrEvent);
    } else {
      this.pino.trace(messageOrEvent);
    }
  }

  debug(messageOrEvent: string, context?: LogContext): void {
    if (context) {
      this.pino.debug(redactSensitiveValue(context) as object, messageOrEvent);
    } else {
      this.pino.debug(messageOrEvent);
    }
  }

  info(messageOrEvent: string, context?: LogContext): void {
    if (context) {
      this.pino.info(redactSensitiveValue(context) as object, messageOrEvent);
    } else {
      this.pino.info(messageOrEvent);
    }
  }

  warn(messageOrEvent: string, context?: LogContext): void {
    if (context) {
      this.pino.warn(redactSensitiveValue(context) as object, messageOrEvent);
    } else {
      this.pino.warn(messageOrEvent);
    }
  }

  error(messageOrEvent: string, error?: unknown, context?: LogContext): void {
    const errorDetails: Record<string, unknown> = {};

    if (error instanceof Error) {
      errorDetails.err = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      };
    } else if (error !== undefined) {
      errorDetails.err = { message: String(error) };
    }

    const payload = {
      ...(context ? (redactSensitiveValue(context) as object) : {}),
      ...errorDetails
    };

    this.pino.error(payload, messageOrEvent);
  }

  fatal(messageOrEvent: string, error?: unknown, context?: LogContext): void {
    const errorDetails: Record<string, unknown> = {};

    if (error instanceof Error) {
      errorDetails.err = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      };
    } else if (error !== undefined) {
      errorDetails.err = { message: String(error) };
    }

    const payload = {
      ...(context ? (redactSensitiveValue(context) as object) : {}),
      ...errorDetails
    };

    this.pino.fatal(payload, messageOrEvent);
  }

  child(bindings: LogContext): ILogger {
    const childPino = this.pino.child(redactSensitiveValue(bindings) as object);
    return new PinoLoggerAdapter(childPino);
  }
}

// SSOT Logger Singleton Instance
export const ssotLogger: ILogger = new PinoLoggerAdapter();
