import { redirect } from 'next/navigation';
import { auth } from './auth';
import { isRouteAuthorized } from './rbac/route-manifest';
import { getRoleLandingPath, ROUTES } from '@/core/routes';
import { getSession, requireSession as dalRequireSession, type SessionUser } from '@/server/auth/session.dal';

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
  const role = session?.user?.role;
  const authResult = isRouteAuthorized(pathname, role);

  if (!authResult.allowed) {
    if (authResult.reason === 'unauthenticated' || !session?.user) {
      redirect(`${ROUTES.signIn}?redirect=${encodeURIComponent(pathname)}`);
    }

    if (authResult.reason === 'forbidden') {
      const destination = getRoleLandingPath(session?.user?.role);
      if (pathname !== destination) {
        redirect(destination);
      }
    }
  }

  return session as SessionType;
}

/**
 * Server guard: Enforces Admin role.
 */
export async function requireAdmin(): Promise<SessionType> {
  const session = await requireSession();
  if (session.user.role !== 'admin') {
    redirect(ROUTES.dashboardPatient);
  }
  return session;
}

/**
 * Server guard: Enforces Patient role.
 */
export async function requirePatient(): Promise<SessionType> {
  const session = await requireSession();
  if (session.user.role === 'admin') {
    redirect(ROUTES.dashboardAdmin);
  }
  return session;
}

/**
 * Server guard: Enforces specific permissions via Better Auth access controller.
 */
export async function requirePermission(
  permissions: Record<string, string[]>
): Promise<SessionType> {
  const session = await requireSession();
  if (session.user.role === 'admin') {
    return session;
  }

  try {
    const { success } = await auth.api.userHasPermission({
      body: { userId: session.user.id, permissions }
    });

    if (!success) {
      redirect(ROUTES.dashboardPatient);
    }
  } catch {
    if (session.user.role !== 'admin') {
      redirect(ROUTES.dashboardPatient);
    }
  }

  return session;
}
