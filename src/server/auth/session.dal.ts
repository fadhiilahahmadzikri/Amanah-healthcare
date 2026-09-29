import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/core/routes';
import { ALL_AUTH_COOKIE_NAMES } from '@/core/auth/auth.constants';
import { getCurrentUserQuery } from '@/server/services/auth/get-current-user.query';

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: 'admin' | 'patient';
  banned?: boolean | null;
  emailVerified?: boolean;
}

export type SessionResult =
  | { status: 'authenticated'; user: SessionUser; role: 'admin' | 'patient' }
  | { status: 'anonymous' }
  | { status: 'rejected' };

export const getSession = cache(async (): Promise<SessionResult> => {
  const cookieStore = await cookies();
  const hasAnyAuthCookie = ALL_AUTH_COOKIE_NAMES.some((name) => cookieStore.has(name));

  // 1. Check Better Auth session
  const reqHeaders = await headers();
  const rawSession = await auth.api.getSession({ headers: reqHeaders });

  if (rawSession?.user && rawSession.user.id) {
    const role: 'admin' | 'patient' = rawSession.user.role === 'admin' ? 'admin' : 'patient';
    return {
      status: 'authenticated',
      user: {
        id: rawSession.user.id,
        email: rawSession.user.email,
        name: rawSession.user.name || null,
        image: rawSession.user.image || null,
        role,
        banned: rawSession.user.banned || false,
        emailVerified: rawSession.user.emailVerified ?? true
      },
      role
    };
  }

  // 2. Check canonical NestJS JWT auth session (via /api/v1/auth/me)
  const userResult = await getCurrentUserQuery();
  if (userResult.ok && userResult.value) {
    const currentUser = userResult.value;
    const role: 'admin' | 'patient' = currentUser.systemRole === 'ADMIN' ? 'admin' : 'patient';
    const name = currentUser.staff?.fullName || currentUser.patient?.fullName || currentUser.email;

    return {
      status: 'authenticated',
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name,
        image: currentUser.staff?.photoUrl || null,
        role,
        banned: false,
        emailVerified: true
      },
      role
    };
  }

  // 3. If cookies were present but backend rejected the session
  if (hasAnyAuthCookie) {
    return { status: 'rejected' };
  }

  // 4. Clean anonymous request
  return { status: 'anonymous' };
});

export async function requireSession(): Promise<{ user: SessionUser; role: 'admin' | 'patient' }> {
  const session = await getSession();

  switch (session.status) {
    case 'authenticated':
      if (session.user.banned) {
        redirect(ROUTES.sessionExpired);
      }
      if (session.user.emailVerified === false && session.user.email) {
        redirect(`${ROUTES.verifyOtp}?email=${encodeURIComponent(session.user.email)}`);
      }
      return { user: session.user, role: session.role };
    case 'rejected':
      redirect(ROUTES.sessionExpired);
    case 'anonymous':
      redirect(ROUTES.signIn);
  }
}
