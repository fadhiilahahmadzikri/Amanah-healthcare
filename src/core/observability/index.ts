// Ports
export type { ILogger, LogLevel, LogContext } from './ports/logger.port';
export type { IHttpObservabilityAdapter } from './ports/http-observability.port';

// Models
export type {
  HttpRequestEvent,
  HttpResponseEvent,
  HttpErrorEvent,
  HttpContext,
  AuthContext,
  ObservableRequest,
  ObservableResponse,
  ObservableContext
} from './models/http-event.types';
export type { ClientMetadata, ClientIpInfo } from './models/client-metadata.types';

// Adapters
export { ssotLogger, PinoLoggerAdapter } from './adapters/pino/pino-logger.adapter';
export {
  defaultHttpObservability,
  NextHttpObservabilityAdapter
} from './adapters/http/next-http-observability.adapter';
export { withApiObservability, observeRoute } from './adapters/http/route-observability.adapter';

// Extractors
export { extractClientMetadata } from './extractors/client-metadata.extractor';
export { extractClientIp } from './extractors/ip.extractor';
export {
  resolveRequestId,
  extractQueryParams,
  extractUrlPath
} from './extractors/request-metadata.extractor';
export { extractAuthContext } from './extractors/auth-context.extractor';

// Sanitizers
export {
  redactSensitiveValue,
  redactHeaders,
  isSensitiveKey
} from './sanitizers/redaction.sanitizer';
export { sanitizePayload, isBinaryContentType } from './sanitizers/payload.sanitizer';
