import { redactSensitiveValue } from './redaction.sanitizer';

const DEFAULT_MAX_BODY_LENGTH =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' ? 1_000_000 : 100_000;

const BINARY_MIME_PREFIXES = [
  'image/',
  'audio/',
  'video/',
  'application/octet-stream',
  'application/pdf',
  'application/zip',
  'application/gzip',
  'application/x-tar'
];

export function isBinaryContentType(contentType?: string | null): boolean {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return BINARY_MIME_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export interface SanitizedPayloadOptions {
  maxBodyLength?: number;
  contentType?: string | null;
}

export function sanitizePayload(payload: unknown, options: SanitizedPayloadOptions = {}): unknown {
  if (payload === null || payload === undefined) {
    return payload;
  }

  // 1. Binary Content-Type Check
  if (isBinaryContentType(options.contentType)) {
    return '[BINARY_BODY_OMITTED]';
  }

  // 2. Buffer or Uint8Array Check
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(payload)) {
    return {
      _type: 'Buffer',
      byteLength: payload.length,
      note: '[BINARY_BUFFER_OMITTED]'
    };
  }

  if (payload instanceof Uint8Array || payload instanceof ArrayBuffer) {
    return {
      _type: 'ArrayBuffer',
      byteLength: payload.byteLength,
      note: '[BINARY_DATA_OMITTED]'
    };
  }

  // 3. ReadableStream Check
  if (typeof ReadableStream !== 'undefined' && payload instanceof ReadableStream) {
    return '[STREAM_BODY_OMITTED]';
  }

  // 4. FormData Check
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    const fields: Record<string, unknown> = {};
    for (const [key, value] of payload.entries()) {
      if (typeof value === 'object' && value && 'name' in value && 'size' in value) {
        fields[key] = {
          filename: (value as { name: string }).name,
          size: (value as { size: number }).size,
          mimeType: (value as { type?: string }).type || 'application/octet-stream'
        };
      } else {
        fields[key] = redactSensitiveValue(value);
      }
    }
    return fields;
  }

  // 5. String Payload
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return sanitizePayload(parsed, options);
      } catch {
        // Not JSON, continue as string
      }
    }

    const maxLength = options.maxBodyLength ?? DEFAULT_MAX_BODY_LENGTH;
    if (payload.length > maxLength) {
      return {
        _truncated: true,
        _originalSize: payload.length,
        _loggedSize: maxLength,
        note: `Payload truncated (${payload.length} bytes exceeded limit of ${maxLength} bytes)`
      };
    }
    return redactSensitiveValue(payload);
  }

  // 6. Object / Array Payload
  const redacted = redactSensitiveValue(payload);
  try {
    const jsonString = JSON.stringify(redacted);
    const maxLength = options.maxBodyLength ?? DEFAULT_MAX_BODY_LENGTH;

    if (jsonString && jsonString.length > maxLength) {
      if (Array.isArray(redacted)) {
        return {
          _truncated: true,
          _totalItems: redacted.length,
          _loggedItems: Math.min(redacted.length, 10),
          items: redacted.slice(0, 10),
          note: `Array truncated (${jsonString.length} bytes exceeded limit of ${maxLength} bytes)`
        };
      }

      return {
        _truncated: true,
        _originalSize: jsonString.length,
        _loggedSize: maxLength,
        note: `Object truncated (${jsonString.length} bytes exceeded limit of ${maxLength} bytes)`
      };
    }
  } catch {
    return '[UNSERIALIZABLE_PAYLOAD]';
  }

  return redacted;
}
