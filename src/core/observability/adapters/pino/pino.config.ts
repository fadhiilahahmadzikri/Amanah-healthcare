import pino, { type LoggerOptions } from 'pino';
import pretty from 'pino-pretty';

const PINO_REDACT_PATHS = [
  'password',
  '*.password',
  '*.*.password',
  '*.*.*.password',
  'passwordConfirmation',
  '*.passwordConfirmation',
  'token',
  '*.token',
  '*.*.token',
  'refreshToken',
  '*.refreshToken',
  'accessToken',
  '*.accessToken',
  'secret',
  '*.secret',
  'clientSecret',
  '*.clientSecret',
  'authorization',
  '*.authorization',
  'headers.authorization',
  'headers.cookie',
  'headers.set-cookie',
  'cookie',
  '*.cookie',
  'nik',
  '*.nik',
  'creditCard',
  '*.creditCard',
  'pin',
  '*.pin',
  'otp',
  '*.otp',
  'apiKey',
  '*.apiKey'
];

export function createPinoConfig(): LoggerOptions {
  const isDev = process.env.NODE_ENV !== 'production';
  const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

  return {
    level: logLevel,
    redact: {
      paths: PINO_REDACT_PATHS,
      censor: '[REDACTED]'
    },
    base: {
      env: process.env.NODE_ENV || 'development'
    },
    timestamp: pino.stdTimeFunctions.isoTime
  };
}

export function createRootPinoLogger() {
  const isDev = process.env.NODE_ENV !== 'production';
  const config = createPinoConfig();

  if (isDev) {
    const prettyStream = pretty({
      colorize: true,
      translateTime: 'SYS:HH:MM:ss',
      ignore: 'pid,hostname,env',
      singleLine: false,
      messageFormat: (log, messageKey) => {
        const msg = log[messageKey];
        return typeof msg === 'string' ? msg : '';
      }
    });

    return pino(config, prettyStream);
  }

  // Canonical structured JSON in production
  return pino(config);
}
