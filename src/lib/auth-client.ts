import { createAuthClient } from 'better-auth/react';
import { organizationClient, adminClient, oauthPopupClient } from 'better-auth/client/plugins';
import { ac, admin, patient, user } from './permissions';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    organizationClient(),
    adminClient({ ac, roles: { admin, patient, user } }),
    oauthPopupClient()
  ],
  fetchOptions: {
    onError: async (context) => {
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
