import { createAuthClient } from 'better-auth/react';
import { organizationClient, adminClient, emailOTPClient } from 'better-auth/client/plugins';
import { isProtectedRoute } from '@/core/routes';
import { ac, admin, patient, user } from './permissions';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : undefined,
  basePath: '/api/auth',
  plugins: [
    organizationClient(),
    adminClient({ ac, roles: { admin, patient, user } }),
    emailOTPClient()
  ],
  fetchOptions: {
    credentials: 'include',
    onError: async (context) => {
      if (context.response?.status === 401) {
        if (typeof window !== 'undefined' && isProtectedRoute(window.location.pathname)) {
          window.location.href = '/auth/sign-in';
        }
      }
      if (context.response?.status === 429) {
        const retryAfter = context.response.headers.get('X-Retry-After');
        console.warn(`Rate limited. Retry after ${retryAfter ?? 'a few'}s.`);
      }
    }
  }
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  changePassword,
  changeEmail,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  revokeSessions,
  updateUser,
  deleteUser
} = authClient;
