import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { isRouteAuthorized, resolveRouteRule } from './rbac/route-manifest';

export type SessionType = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/**
 * Server guard: Enforces authenticated session.
 * Throws redirect to `/auth/sign-in` if unauthenticated.
 */
export async function requireSession(): Promise<SessionType> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

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
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

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

  const { success } = await auth.api.userHasPermission({
    body: { userId: session.user.id, permissions }
  });

  if (!success) {
    if (session.user.role === 'admin') {
      redirect('/dashboard/admin');
    } else {
      redirect('/dashboard/klinik/antrean');
    }
  }

  return session;
}
