import { v4 as uuidv4 } from 'uuid';
import { extractHeadersMap } from './client-metadata.extractor';
import { redactSensitiveValue } from '../sanitizers/redaction.sanitizer';

export function resolveRequestId(
  headers: Headers | Record<string, string | string[] | undefined>
): { requestId: string; correlationId: string } {
  const h = extractHeadersMap(headers);
  const clientReqId = h['x-request-id'];
  const clientCorrId = h['x-correlation-id'];

  // Generate safe server ID with prefix
  const serverGeneratedId = `req_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  const requestId = clientReqId && clientReqId.trim().length > 0 ? clientReqId : serverGeneratedId;
  const correlationId = clientCorrId && clientCorrId.trim().length > 0 ? clientCorrId : requestId;

  return { requestId, correlationId };
}

export function extractQueryParams(urlStr: string): Record<string, unknown> {
  try {
    const url = new URL(urlStr, 'http://localhost');
    const query: Record<string, unknown> = {};

    url.searchParams.forEach((val, key) => {
      if (query[key] !== undefined) {
        if (Array.isArray(query[key])) {
          (query[key] as unknown[]).push(val);
        } else {
          query[key] = [query[key], val];
        }
      } else {
        query[key] = val;
      }
    });

    return redactSensitiveValue(query) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function extractUrlPath(urlStr: string): {
  path: string;
  hostname?: string;
  protocol?: string;
} {
  try {
    const url = new URL(urlStr, 'http://localhost');
    return {
      path: url.pathname,
      hostname: url.hostname !== 'localhost' ? url.hostname : undefined,
      protocol: url.protocol.replace(':', '')
    };
  } catch {
    return { path: urlStr };
  }
}
