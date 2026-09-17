import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { getPatients } from '@/features/data-pasien/api/service';
import type { Patient } from '@/features/data-pasien/api/types';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ patient: null }, { status: 401 });
  }

  const patientRecordId = '';
  const email = user.email ?? '';
  const phone = '';
  const fullName = user.name ?? '';
  const searchKey = patientRecordId || email || phone || fullName;

  if (!searchKey) {
    return NextResponse.json({ patient: null });
  }

  const response = await getPatients({
    page: 1,
    limit: 1000,
    search: searchKey
  });

  const patient =
    findExactPatient(response.patients, { patientRecordId, email, phone, fullName }) ??
    response.patients[0] ??
    null;

  return NextResponse.json({ patient });
}

function findExactPatient(
  patients: Patient[],
  lookup: {
    patientRecordId: string;
    email: string;
    phone: string;
    fullName: string;
  }
): Patient | undefined {
  return patients.find((patient) => {
    return (
      matches(patient.patient_id, lookup.patientRecordId) ||
      matches(patient.email_pasien || patient.email, lookup.email) ||
      matches(patient.nomor_telepon_wa || patient.phone, lookup.phone) ||
      matches(patient.name, lookup.fullName)
    );
  });
}

function matches(value: string | undefined, expected: string): boolean {
  return Boolean(value && expected && value.toLowerCase() === expected.toLowerCase());
}
