import { describe, expect, test } from 'bun:test';
import { NextRequest, NextResponse } from 'next/server';
import {
  ssotLogger,
  withApiObservability,
  redactSensitiveValue,
  redactHeaders,
  sanitizePayload,
  extractClientMetadata,
  extractClientIp,
  resolveRequestId,
  extractQueryParams
} from '@/core/observability';

describe('Global HTTP API Observability Layer', () => {
  describe('1. SSOT Logger & Redaction', () => {
    test('ssotLogger exposes standard logging methods', () => {
      expect(typeof ssotLogger.trace).toBe('function');
      expect(typeof ssotLogger.debug).toBe('function');
      expect(typeof ssotLogger.info).toBe('function');
      expect(typeof ssotLogger.warn).toBe('function');
      expect(typeof ssotLogger.error).toBe('function');
      expect(typeof ssotLogger.child).toBe('function');
    });

    test('redactSensitiveValue recursively redacts passwords, tokens, and secrets', () => {
      const payload = {
        email: 'user@example.com',
        password: 'myPassword123',
        auth: {
          token: 'token_abc123',
          refreshToken: 'refresh_xyz',
          nested: {
            pin: '1234',
            secret: 'top_secret'
          }
        },
        safeField: 'visible'
      };

      const redacted = redactSensitiveValue(payload) as Record<string, unknown>;
      expect(redacted.email).toBe('user@example.com');
      expect(redacted.password).toBe('[REDACTED]');
      expect((redacted.auth as Record<string, unknown>).token).toBe('[REDACTED]');
      expect((redacted.auth as Record<string, unknown>).refreshToken).toBe('[REDACTED]');
      expect(
        ((redacted.auth as Record<string, unknown>).nested as Record<string, unknown>).pin
      ).toBe('[REDACTED]');
      expect(
        ((redacted.auth as Record<string, unknown>).nested as Record<string, unknown>).secret
      ).toBe('[REDACTED]');
      expect(redacted.safeField).toBe('visible');
    });

    test('redactSensitiveValue sanitizes Bearer tokens in strings', () => {
      const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.secret';
      expect(redactSensitiveValue(authHeader)).toBe('Bearer [REDACTED]');
    });

    test('redactHeaders censors sensitive headers', () => {
      const headers = {
        'content-type': 'application/json',
        authorization: 'Bearer token123',
        cookie: 'session=abc',
        'x-api-key': 'secret-key'
      };

      const redacted = redactHeaders(headers);
      expect(redacted['content-type']).toBe('application/json');
      expect(redacted['authorization']).toBe('[REDACTED]');
      expect(redacted['cookie']).toBe('[REDACTED]');
      expect(redacted['x-api-key']).toBe('[REDACTED]');
    });
  });

  describe('2. Payload Sanitizer', () => {
    test('marks binary content types as [BINARY_BODY_OMITTED]', () => {
      expect(sanitizePayload({ some: 'data' }, { contentType: 'application/pdf' })).toBe(
        '[BINARY_BODY_OMITTED]'
      );
      expect(sanitizePayload({ some: 'data' }, { contentType: 'image/jpeg' })).toBe(
        '[BINARY_BODY_OMITTED]'
      );
    });

    test('truncates payloads exceeding maximum length', () => {
      const hugeString = 'a'.repeat(500);
      const sanitized = sanitizePayload(hugeString, { maxBodyLength: 100 }) as Record<
        string,
        unknown
      >;
      expect(sanitized['_truncated']).toBe(true);
      expect(sanitized['_originalSize']).toBe(500);
      expect(sanitized['_loggedSize']).toBe(100);
    });

    test('omits raw buffer content safely', () => {
      const buf = Buffer.from('hello binary world');
      const sanitized = sanitizePayload(buf) as Record<string, unknown>;
      expect(sanitized['_type']).toBe('Buffer');
      expect(sanitized.note).toBe('[BINARY_BUFFER_OMITTED]');
    });
  });

  describe('3. Extractors', () => {
    test('extractClientMetadata captures Flutter / mobile headers', () => {
      const headers = {
        'user-agent': 'Dart/3.4 (dart:io)',
        'x-client-type': 'mobile',
        'x-platform': 'android',
        'x-app-version': '1.4.2',
        'x-device-model': 'Pixel 7 Pro',
        'x-os-version': 'Android 16'
      };

      const client = extractClientMetadata(headers);
      expect(client.type).toBe('mobile');
      expect(client.platform).toBe('android');
      expect(client.appVersion).toBe('1.4.2');
      expect(client.deviceModel).toBe('Pixel 7 Pro');
      expect(client.osVersion).toBe('Android 16');
    });

    test('extractClientIp respects trusted proxy configuration', () => {
      const headers = {
        'x-forwarded-for': '203.0.113.195, 10.0.0.1'
      };

      const untrusted = extractClientIp(headers, undefined, { trustedProxies: false });
      expect(untrusted.ip).toBe('203.0.113.195');
      expect(untrusted.source).toBe('untrusted_forwarded');

      const trusted = extractClientIp(headers, undefined, { trustedProxies: true });
      expect(trusted.ip).toBe('203.0.113.195');
      expect(trusted.source).toBe('trusted_forwarded');
    });

    test('resolveRequestId reuses existing x-request-id or generates req_ prefixed ID', () => {
      const withHeader = resolveRequestId({ 'x-request-id': 'client_req_999' });
      expect(withHeader.requestId).toBe('client_req_999');

      const withoutHeader = resolveRequestId({});
      expect(withoutHeader.requestId).toStartWith('req_');
    });

    test('extractQueryParams parses and sanitizes query params', () => {
      const query = extractQueryParams(
        'http://localhost:3000/api/users?search=Ahmad&password=hidden'
      );
      expect(query.search).toBe('Ahmad');
      expect(query.password).toBe('[REDACTED]');
    });
  });

  describe('4. withApiObservability Route Adapter', () => {
    test('observes successful request and response without mutating payload', async () => {
      const handler = withApiObservability(async () => {
        return NextResponse.json({ success: true, count: 5 });
      });

      const req = new NextRequest('http://localhost:3000/api/v1/test', {
        method: 'GET'
      });

      const res = await handler(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({ success: true, count: 5 });
    });

    test('captures route params and logs response without crashing on exceptions', async () => {
      const handler = withApiObservability(async () => {
        throw new Error('TestRouteCrash');
      });

      const req = new NextRequest('http://localhost:3000/api/v1/crash', {
        method: 'POST'
      });

      let caught: unknown;
      try {
        await handler(req);
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toBe('TestRouteCrash');
    });
  });
});
