import 'server-only';

export function applyIdempotencyHeader(headers: Headers, idempotencyKey?: string): void {
  if (idempotencyKey && !headers.has('Idempotency-Key')) {
    headers.set('Idempotency-Key', idempotencyKey);
  }
}
