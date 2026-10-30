import { redirect } from 'next/navigation';
import { auth } from './auth';
import { isRouteAuthorized } from './rbac/route-manifest';
import { getRoleLandingPath, ROUTES } from '@/core/routes';
import { AUDIENCE, type AudienceType } from '@/core/auth/permissions.constants';
import { getSession, requireSession as dalRequireSession } from '@/server/auth/session.dal';

export type SessionType = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/**
 * Single source of truth session getter for Better Auth.
 */
export async function getUnifiedSession(): Promise<SessionType | null> {
  const result = await getSession();
  if (result.status === 'authenticated') {
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        image: result.user.image,
        role: result.role,
        audience: result.audience,
        permissions: result.user.permissions ?? [],
        banned: result.user.banned ?? false,
        emailVerified: result.user.emailVerified ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      session: {
        id: `session_${result.user.id}`,
        userId: result.user.id,
        token: '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } as unknown as SessionType;
  }
  return null;
}

/**
 * Server guard: Enforces authenticated session via DAL.
 */
export async function requireSession(): Promise<SessionType> {
  await dalRequireSession();
  const session = await getUnifiedSession();
  if (!session) {
    redirect(ROUTES.signIn);
  }
  return session;
}

/**
 * Centralized Route Guard: Evaluates pathname against Route Manifest.
 */
export async function requireRouteAccess(pathname: string): Promise<SessionType> {
  const session = await getUnifiedSession();
  const audience: AudienceType =
    (session?.user as { audience?: AudienceType })?.audience ?? AUDIENCE.INTERNAL;
  const permissions = (session?.user as { permissions?: string[] })?.permissions ?? [];

  const authResult = isRouteAuthorized(pathname, {
    audience,
    permissions,
    role: session?.user?.role
  });

  if (!authResult.allowed) {
    if (authResult.reason === 'unauthenticated' || !session?.user) {
      redirect(`${ROUTES.signIn}?redirect=${encodeURIComponent(pathname)}`);
    }

    if (authResult.reason === 'forbidden') {
      const destination = getRoleLandingPath(audience);
      if (pathname !== destination) {
        redirect(destination);
      }
    }
  }

  return session as SessionType;
}
