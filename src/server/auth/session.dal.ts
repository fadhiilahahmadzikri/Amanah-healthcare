import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/core/routes';
import { ALL_AUTH_COOKIE_NAMES } from '@/core/auth/auth.constants';
import { AUDIENCE, type AudienceType } from '@/core/auth/permissions.constants';
import { getCurrentUserQuery } from '@/server/services/auth/get-current-user.query';

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  emailVerified?: boolean;
  permissions?: string[];
  accessibleRoutes?: string[];
  audience?: AudienceType;
}

export type SessionResult =
  | { status: 'authenticated'; user: SessionUser; role: string; audience: AudienceType }
  | { status: 'anonymous' }
  | { status: 'rejected' };

function resolveUserDisplayName(user: {
  staff?: { fullName: string } | null;
  patient?: { fullName: string } | null;
  email: string;
}): string {
  if (user.staff?.fullName) return user.staff.fullName;
  if (user.patient?.fullName) return user.patient.fullName;
  return user.email;
}

export const getSession = cache(async (): Promise<SessionResult> => {
  const cookieStore = await cookies();
  const hasAnyAuthCookie = ALL_AUTH_COOKIE_NAMES.some((name) => cookieStore.has(name));

  // 1. Check Better Auth session
  const reqHeaders = await headers();
  const rawSession = await auth.api.getSession({ headers: reqHeaders });

  if (rawSession?.user && rawSession.user.id) {
    const canonicalUserResult = await getCurrentUserQuery();
    if (!canonicalUserResult.ok || !canonicalUserResult.value) {
      // Backend rejected or user profile unavailable (e.g. unassigned role, revoked access)
      return { status: 'rejected' };
    }

    const canonicalUser = canonicalUserResult.value;
    const resolvedRole = canonicalUser.role?.code ?? canonicalUser.roleCode ?? '';
    if (!resolvedRole || resolvedRole.trim() === '') {
      // Deny-by-default: user without active role cannot enter application portal
      return { status: 'rejected' };
    }

    const resolvedAudience: AudienceType = canonicalUser.audience ?? AUDIENCE.EXTERNAL;
    const resolvedPermissions = canonicalUser.permissions ?? [];
    const resolvedRoutes = canonicalUser.accessibleRoutes ?? [];

    return {
      status: 'authenticated',
      user: {
        id: rawSession.user.id,
        email: rawSession.user.email,
        name: rawSession.user.name || null,
        image: rawSession.user.image || null,
        role: resolvedRole,
        banned: rawSession.user.banned || false,
        emailVerified: rawSession.user.emailVerified ?? true,
        audience: resolvedAudience,
        permissions: resolvedPermissions,
        accessibleRoutes: resolvedRoutes
      },
      role: resolvedRole,
      audience: resolvedAudience
    };
  }

  // 2. Check canonical NestJS JWT auth session (via /api/v1/auth/me)
  const userResult = await getCurrentUserQuery();
  if (userResult.ok && userResult.value) {
    const currentUser = userResult.value;
    const role = currentUser.role?.code ?? currentUser.roleCode ?? '';
    if (!role || role.trim() === '') {
      // Deny-by-default: user without active role cannot enter application portal
      return { status: 'rejected' };
    }

    const audience: AudienceType = currentUser.audience ?? AUDIENCE.INTERNAL;
    const name = resolveUserDisplayName(currentUser);
    const accessibleRoutes = currentUser.accessibleRoutes ?? [];

    return {
      status: 'authenticated',
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name,
        image: currentUser.staff?.photoUrl || null,
        role,
        banned: false,
        emailVerified: true,
        permissions: currentUser.permissions ?? [],
        accessibleRoutes,
        audience
      },
      role,
      audience
    };
  }

  // 3. If cookies were present but backend rejected the session
  if (hasAnyAuthCookie) {
    return { status: 'rejected' };
  }

  // 4. Clean anonymous request
  return { status: 'anonymous' };
});

export async function requireSession(): Promise<{
  user: SessionUser;
  role: string;
  audience: AudienceType;
}> {
  const session = await getSession();

  switch (session.status) {
    case 'authenticated':
      if (session.user.banned || !session.role || session.role.trim() === '') {
        redirect(ROUTES.sessionExpired);
      }
      if (session.user.emailVerified === false && session.user.email) {
        redirect(`${ROUTES.verifyOtp}?email=${encodeURIComponent(session.user.email)}`);
      }
      return { user: session.user, role: session.role, audience: session.audience };
    case 'rejected':
      redirect(ROUTES.sessionExpired);
    case 'anonymous':
      redirect(ROUTES.signIn);
  }
}
