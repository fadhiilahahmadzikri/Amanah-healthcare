import 'server-only';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

import { createPatient, getPatients } from './service';
import {
  buildPatientMutationPayload,
  hasCompletedPatientRegistration,
  PATIENT_REGISTRATION_COMPLETED_COOKIE,
  PATIENT_REGISTRATION_COMPLETED_METADATA_KEY
} from './registration-mapper';
import type { PatientRegistrationFormValues } from '../schemas/patient-registration-schema';

const COMPLETION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type CurrentRegistrationContext = {
  isComplete: boolean;
  initialName: string;
};

type CompletePatientRegistrationInput = {
  userId: string;
  values: PatientRegistrationFormValues;
};

type CompletePatientRegistrationResult =
  | {
      success: true;
      patientRecordId: string;
    }
  | {
      success: false;
      message: string;
    };

export async function getCurrentPatientRegistrationStatus(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const completionCookie = cookieStore.get(PATIENT_REGISTRATION_COMPLETED_COOKIE)?.value ?? null;

  if (completionCookie === 'true') {
    return true;
  }

  const user = await getCurrentUserSafely(userId);

  return hasCompletedPatientRegistration({
    unsafeMetadata: user?.unsafeMetadata ?? null,
    publicMetadata: user?.publicMetadata ?? null,
    completionCookie
  });
}

export async function getCurrentPatientRegistrationContext(
  userId: string
): Promise<CurrentRegistrationContext> {
  const cookieStore = await cookies();
  const completionCookie = cookieStore.get(PATIENT_REGISTRATION_COMPLETED_COOKIE)?.value ?? null;
  const user = await getCurrentUserSafely(userId);

  return {
    isComplete: hasCompletedPatientRegistration({
      unsafeMetadata: user?.unsafeMetadata ?? null,
      publicMetadata: user?.publicMetadata ?? null,
      completionCookie
    }),
    initialName: user?.fullName ?? ''
  };
}

export async function completePatientRegistration({
  userId,
  values
}: CompletePatientRegistrationInput): Promise<CompletePatientRegistrationResult> {
  const now = new Date();
  const user = await getCurrentUserSafely(userId);
  const nextRecordNumber = await getNextPatientRecordNumber();
  const payload = buildPatientMutationPayload({
    values,
    user: {
      email: user?.primaryEmailAddress?.emailAddress ?? '',
      imageUrl: user?.imageUrl ?? '',
      phone: user?.primaryPhoneNumber?.phoneNumber ?? ''
    },
    now,
    nextRecordNumber
  });

  const result = await createPatient(payload);

  if (!result.success || !result.patient) {
    return {
      success: false,
      message: result.message || 'Data pasien gagal disimpan'
    };
  }

  await markPatientRegistrationComplete(userId, result.patient.patient_id, now);

  return {
    success: true,
    patientRecordId: result.patient.patient_id
  };
}

async function getCurrentUserSafely(userId: string) {
  try {
    const user = await currentUser();
    return user?.id === userId ? user : null;
  } catch {
    return null;
  }
}

async function getNextPatientRecordNumber(): Promise<number> {
  try {
    const response = await getPatients({ page: 1, limit: 1 });
    return response.total_patients + 1;
  } catch {
    return 1;
  }
}

async function markPatientRegistrationComplete(
  userId: string,
  patientRecordId: string,
  now: Date
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(PATIENT_REGISTRATION_COMPLETED_COOKIE, 'true', {
    httpOnly: true,
    maxAge: COMPLETION_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        [PATIENT_REGISTRATION_COMPLETED_METADATA_KEY]: true,
        patientRegistrationCompletedAt: now.toISOString(),
        patientRecordId
      }
    });
  } catch {}
}
