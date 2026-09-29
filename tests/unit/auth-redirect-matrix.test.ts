import { describe, expect, test } from 'bun:test';
import { safeRedirect, getRoleLandingPath, ROUTES, PROTECTED_PREFIXES } from '@/core/routes';
import { authCookieOptions } from '@/server/auth/token-store';
import { ALL_AUTH_COOKIE_NAMES, AUTH_COOKIES } from '@/core/auth/auth.constants';

describe('Auth Redirect Matrix & Acyclic Graph Tests', () => {
  describe('1. safeRedirect security validations', () => {
    test('allows valid relative paths', () => {
      expect(safeRedirect('/dashboard')).toBe('/dashboard');
      expect(safeRedirect('/dashboard/admin')).toBe('/dashboard/admin');
      expect(safeRedirect('/dashboard/klinik/antrean?tab=1')).toBe('/dashboard/klinik/antrean?tab=1');
    });

    test('rejects protocol relative and open redirects', () => {
      expect(safeRedirect('//evil.com')).toBe(ROUTES.dashboard);
      expect(safeRedirect('/\\evil.com')).toBe(ROUTES.dashboard);
      expect(safeRedirect('https://evil.com')).toBe(ROUTES.dashboard);
      expect(safeRedirect('http://evil.com')).toBe(ROUTES.dashboard);
      expect(safeRedirect('javascript:alert(1)')).toBe(ROUTES.dashboard);
      expect(safeRedirect('')).toBe(ROUTES.dashboard);
      expect(safeRedirect(null)).toBe(ROUTES.dashboard);
      expect(safeRedirect(undefined)).toBe(ROUTES.dashboard);
    });

    test('respects custom fallback when provided', () => {
      expect(safeRedirect('//evil.com', ROUTES.signIn)).toBe(ROUTES.signIn);
      expect(safeRedirect(null, ROUTES.signIn)).toBe(ROUTES.signIn);
    });
  });

  describe('2. Role landing paths', () => {
    test('maps admin role strictly to admin dashboard', () => {
      expect(getRoleLandingPath('admin')).toBe(ROUTES.dashboardAdmin);
    });

    test('maps patient or default role to patient portal antrean', () => {
      expect(getRoleLandingPath('patient')).toBe(ROUTES.dashboardPatient);
      expect(getRoleLandingPath(null)).toBe(ROUTES.dashboardPatient);
      expect(getRoleLandingPath(undefined)).toBe(ROUTES.dashboardPatient);
    });
  });

  describe('3. Cookie attribute uniformity and consistency', () => {
    test('authCookieOptions sets consistent security attributes', () => {
      const options = authCookieOptions(3600);
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe('lax');
      expect(options.path).toBe('/');
      expect(options.maxAge).toBe(3600);
    });

    test('authCookieOptions with maxAge=0 for purge matches path and sameSite', () => {
      const purgeOptions = authCookieOptions(0);
      expect(purgeOptions.maxAge).toBe(0);
      expect(purgeOptions.path).toBe('/');
      expect(purgeOptions.sameSite).toBe('lax');
      expect(purgeOptions.httpOnly).toBe(true);
    });

    test('ALL_AUTH_COOKIE_NAMES includes both Better Auth and JWT cookies for complete purge', () => {
      expect(ALL_AUTH_COOKIE_NAMES).toContain(AUTH_COOKIES.betterAuth);
      expect(ALL_AUTH_COOKIE_NAMES).toContain(AUTH_COOKIES.betterAuthSecure);
      expect(ALL_AUTH_COOKIE_NAMES).toContain(AUTH_COOKIES.session);
      expect(ALL_AUTH_COOKIE_NAMES).toContain(AUTH_COOKIES.accessToken);
      expect(ALL_AUTH_COOKIE_NAMES).toContain(AUTH_COOKIES.refreshToken);
    });
  });

  describe('4. Protected route prefix definitions', () => {
    test('protects dashboard and patient-registration paths', () => {
      expect(PROTECTED_PREFIXES).toContain('/dashboard');
      expect(PROTECTED_PREFIXES).toContain('/patient-registration');
    });

    test('does not mark auth or public paths as protected prefixes', () => {
      const isSignInProtected = PROTECTED_PREFIXES.some((p) => '/auth/sign-in'.startsWith(p));
      const isHomeProtected = PROTECTED_PREFIXES.some((p) => '/'.startsWith(p));
      expect(isSignInProtected).toBe(false);
      expect(isHomeProtected).toBe(false);
    });
  });
});
