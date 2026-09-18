import 'server-only';
import { getBaseApiUrl } from './base-url';

export const paths = {
  auth: {
    // Engine A: Canonical JWT API (/api/v1/auth/*)
    login: () => `${getBaseApiUrl()}/api/v1/auth/email/login`,
    register: () => `${getBaseApiUrl()}/api/v1/auth/email/register`,
    me: () => `${getBaseApiUrl()}/api/v1/auth/me`,
    refresh: () => `${getBaseApiUrl()}/api/v1/auth/refresh`,
    forgotPassword: () => `${getBaseApiUrl()}/api/v1/auth/forgot/password`,
    resetPassword: () => `${getBaseApiUrl()}/api/v1/auth/reset/password`,
    logout: () => `${getBaseApiUrl()}/api/v1/auth/logout`,

    // Engine B: Better Auth (/api/auth/*)
    betterAuthSignIn: () => `${getBaseApiUrl()}/api/auth/sign-in/email`,
    betterAuthSignOut: () => `${getBaseApiUrl()}/api/auth/sign-out`,
    betterAuthGetSession: () => `${getBaseApiUrl()}/api/auth/get-session`,
    betterAuthForgetPassword: () => `${getBaseApiUrl()}/api/auth/forget-password`,
    betterAuthResetPassword: () => `${getBaseApiUrl()}/api/auth/reset-password`,
    betterAuthAdminListUsers: () => `${getBaseApiUrl()}/api/auth/admin/list-users`,
    betterAuthAdminSetRole: () => `${getBaseApiUrl()}/api/auth/admin/set-role`,
    betterAuthAdminBanUser: () => `${getBaseApiUrl()}/api/auth/admin/ban-user`,
    betterAuthAdminImpersonateUser: () => `${getBaseApiUrl()}/api/auth/admin/impersonate-user`
  },
  users: {
    byId: (id: string) => `${getBaseApiUrl()}/api/v1/users/${id}`,
    list: () => `${getBaseApiUrl()}/api/v1/users`
  }
} as const;
