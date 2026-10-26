import { auth } from '@/lib/auth';
import { loadCurrentUser } from '@/server/loaders/auth.loader';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { getPatients } from '@/features/data-pasien/api/service';
import type { Patient } from '@/features/data-pasien/api/types';
import { withApiObservability } from '@/core/observability/adapters/http/route-observability.adapter';

function resolveUserDisplayName(user: {
  staff?: { fullName: string } | null;
  patient?: { fullName: string } | null;
  email: string;
}): string {
  if (user.staff?.fullName) return user.staff.fullName;
  if (user.patient?.fullName) return user.patient.fullName;
  return user.email;
}

export const GET = withApiObservability(async function GET() {
  const reqHeaders = await headers();
  let user: { id: string; email?: string | null; name?: string | null } | null = null;
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (session?.user) {
    user = session.user;
  } else {
    const currentUser = await loadCurrentUser();
    if (currentUser) {
      user = {
        id: currentUser.id,
        email: currentUser.email,
        name: resolveUserDisplayName(currentUser)
      };
    }
  }

  if (!user) {
    return NextResponse.json({ patient: null }, { status: 401 });
  }

  const email = user.email ?? '';
  const fullName = user.name ?? '';
  const searchKey = email ? email : fullName;

  if (!searchKey) {
    return NextResponse.json({ patient: null });
  }

  const response = await getPatients({
    page: 1,
    limit: 1000,
    search: searchKey
  });

  const exactMatch = findExactPatient(response.patients, { email, fullName });
  const patient = exactMatch ?? (response.patients.length > 0 ? response.patients[0] : null);

  return NextResponse.json({ patient });
});

function findExactPatient(
  patients: Patient[],
  lookup: {
    email: string;
    fullName: string;
  }
): Patient | undefined {
  return patients.find((patient) => {
    if (matches(patient.email, lookup.email)) return true;
    if (matches(patient.name, lookup.fullName)) return true;
    return false;
  });
}

function matches(value: string | undefined, expected: string): boolean {
  return Boolean(value && expected && value.toLowerCase() === expected.toLowerCase());
}
