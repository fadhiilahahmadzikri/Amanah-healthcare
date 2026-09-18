import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { isRouteAuthorized } from './rbac/route-manifest';
import { loadCurrentUser } from '@/server/loaders/auth.loader';

export type SessionType = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/**
 * Resolves active session from either Better Auth or Engine A (JWT via backend).
 */
export async function getUnifiedSession(): Promise<SessionType | null> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (session?.user) {
    return session;
  }

  const currentUser = await loadCurrentUser();
  if (currentUser) {
    const role = currentUser.systemRole === 'ADMIN' ? 'admin' : 'patient';
    const name = currentUser.staff?.fullName || currentUser.patient?.fullName || currentUser.email;

    return {
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name,
        image: currentUser.staff?.photoUrl || null,
        role,
        banned: false,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      session: {
        id: `session_${currentUser.id}`,
        userId: currentUser.id,
        token: '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } as unknown as SessionType;
  }

  return null;
}

/**
 * Server guard: Enforces authenticated session.
 * Throws redirect to `/auth/sign-in` if unauthenticated.
 */
export async function requireSession(): Promise<SessionType> {
  const session = await getUnifiedSession();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  if (session.user.banned) {
    redirect('/auth/sign-in?error=account_banned');
  }

  return session;
}

/**
 * Centralized Route Guard: Evaluates pathname against Route Manifest.
 * Enforces Fail-Closed Default Deny.
 */
export async function requireRouteAccess(pathname: string): Promise<SessionType> {
  const session = await getUnifiedSession();

  const role = session?.user?.role;
  const authResult = isRouteAuthorized(pathname, role);

  if (!authResult.allowed) {
    if (authResult.reason === 'unauthenticated' || !session?.user) {
      redirect(`/auth/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }

    if (authResult.reason === 'forbidden') {
      // Role mismatch: redirect to the respective authorized home portal
      if (session.user.role === 'admin') {
        redirect('/dashboard/admin');
      } else {
        redirect('/dashboard/klinik/antrean');
      }
    }
  }

  return session as SessionType;
}

/**
 * Server guard: Enforces Admin role (`role === 'admin'`).
 * If user is a patient or non-admin, immediately redirects to patient portal `/dashboard/klinik/antrean`.
 */
export async function requireAdmin(): Promise<SessionType> {
  const session = await requireSession();

  if (session.user.role !== 'admin') {
    redirect('/dashboard/klinik/antrean');
  }

  return session;
}

/**
 * Server guard: Enforces Patient role (`role === 'patient'` or default `user`).
 * If user is an admin, immediately redirects to admin portal `/dashboard/admin`.
 */
export async function requirePatient(): Promise<SessionType> {
  const session = await requireSession();

  if (session.user.role === 'admin') {
    redirect('/dashboard/admin');
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
      redirect('/dashboard/klinik/antrean');
    }
  } catch {
    if (session.user.role !== 'admin') {
      redirect('/dashboard/klinik/antrean');
    }
  }

  return session;
}
