import type { AuthContext } from '../models/http-event.types';

export function extractAuthContext(userOrSession?: unknown): AuthContext {
  if (!userOrSession || typeof userOrSession !== 'object') {
    return { authenticated: false };
  }

  const obj = userOrSession as Record<string, unknown>;
  const user = (obj.user && typeof obj.user === 'object' ? obj.user : obj) as Record<
    string,
    unknown
  >;

  const userId =
    typeof user.id === 'string'
      ? user.id
      : typeof user.userId === 'string'
        ? user.userId
        : typeof user.sub === 'string'
          ? user.sub
          : undefined;

  const role =
    typeof user.role === 'string' ? user.role : typeof obj.role === 'string' ? obj.role : undefined;

  const staffId = typeof user.staffId === 'string' ? user.staffId : undefined;
  const doctorId = typeof user.doctorId === 'string' ? user.doctorId : undefined;

  if (!userId) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    userId,
    role,
    staffId,
    doctorId
  };
}
