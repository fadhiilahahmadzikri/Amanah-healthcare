import 'server-only';
import { getRequestContext } from '../request-context';

export function applyAuthHeader(headers: Headers, tokenOverride?: string | null): void {
  if (tokenOverride) {
    headers.set('Authorization', `Bearer ${tokenOverride}`);
    return;
  }

  const context = getRequestContext();
  if (context.authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${context.authToken}`);
  }
}
