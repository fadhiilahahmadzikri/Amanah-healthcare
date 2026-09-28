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

// Adapters — runtime-agnostic only (Edge-safe barrel).
// ⚠ DO NOT re-export Node.js-only adapters (Pino, process.stdout) here.
//   This barrel may be imported by files bundled for ALL runtimes (Edge included).
//   Node-only exports must be consumed directly from their source files:
//     Node HTTP adapter:    './adapters/http/next-http-observability.adapter.node'
//     Edge HTTP adapter:    './adapters/http/next-http-observability.adapter.edge'
//     Node route wrapper:   './adapters/http/route-observability.adapter'  (Node only)
export { BaseHttpObservabilityAdapter } from './adapters/http/next-http-observability.adapter.base';
export { EdgeHttpObservabilityAdapter } from './adapters/http/next-http-observability.adapter.edge';

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
