import 'server-only';

export function serializeRequestBody(body: unknown, headers: Headers): BodyInit | null {
  if (body === undefined || body === null) {
    return null;
  }

  if (typeof body === 'string' || body instanceof FormData || body instanceof URLSearchParams) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
}
