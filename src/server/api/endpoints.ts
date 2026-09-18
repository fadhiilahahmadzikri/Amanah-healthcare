import 'server-only';

export const endpoints = {
  // Engine A: Canonical JWT API (/api/v1/auth/*)
  AUTH_LOGIN: {
    method: 'POST',
    path: '/api/v1/auth/email/login',
    auth: 'public',
    cache: 'NO_STORE',
    tag: null
  },
  AUTH_ME: {
    method: 'GET',
    path: '/api/v1/auth/me',
    auth: 'session',
    cache: 'NO_STORE',
    tag: 'auth:me'
  },
  AUTH_REFRESH: {
    method: 'POST',
    path: '/api/v1/auth/refresh',
    auth: 'session',
    cache: 'NO_STORE',
    tag: null
  },
  AUTH_FORGOT_PASSWORD: {
    method: 'POST',
    path: '/api/v1/auth/forgot/password',
    auth: 'public',
    cache: 'NO_STORE',
    tag: null
  },
  AUTH_LOGOUT: {
    method: 'POST',
    path: '/api/v1/auth/logout',
    auth: 'session',
    cache: 'NO_STORE',
    tag: null
  },

  // Engine B: Better Auth (/api/auth/*)
  BETTER_AUTH_SIGN_IN: {
    method: 'POST',
    path: '/api/auth/sign-in/email',
    auth: 'public',
    cache: 'NO_STORE',
    tag: null
  },
  BETTER_AUTH_SIGN_OUT: {
    method: 'POST',
    path: '/api/auth/sign-out',
    auth: 'session',
    cache: 'NO_STORE',
    tag: null
  },
  BETTER_AUTH_GET_SESSION: {
    method: 'GET',
    path: '/api/auth/get-session',
    auth: 'session',
    cache: 'NO_STORE',
    tag: 'auth:session'
  },
  BETTER_AUTH_FORGET_PASSWORD: {
    method: 'POST',
    path: '/api/auth/forget-password',
    auth: 'public',
    cache: 'NO_STORE',
    tag: null
  },
  BETTER_AUTH_RESET_PASSWORD: {
    method: 'POST',
    path: '/api/auth/reset-password',
    auth: 'public',
    cache: 'NO_STORE',
    tag: null
  },
  BETTER_AUTH_ADMIN_LIST_USERS: {
    method: 'POST',
    path: '/api/auth/admin/list-users',
    auth: 'role:admin',
    cache: 'NO_STORE',
    tag: null
  },
  BETTER_AUTH_ADMIN_SET_ROLE: {
    method: 'POST',
    path: '/api/auth/admin/set-role',
    auth: 'role:admin',
    cache: 'NO_STORE',
    tag: null
  },
  BETTER_AUTH_ADMIN_BAN_USER: {
    method: 'POST',
    path: '/api/auth/admin/ban-user',
    auth: 'role:admin',
    cache: 'NO_STORE',
    tag: null
  },
  BETTER_AUTH_ADMIN_IMPERSONATE_USER: {
    method: 'POST',
    path: '/api/auth/admin/impersonate-user',
    auth: 'role:admin',
    cache: 'NO_STORE',
    tag: null
  }
} as const;

export type EndpointKey = keyof typeof endpoints;
