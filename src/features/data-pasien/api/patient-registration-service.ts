import 'server-only';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { loadCurrentUser } from '@/server/loaders/auth.loader';
import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import { getAccessTokenCookie } from '@/server/auth/token-store';
import { AppError } from '@/core/errors/app-error';
import {
  patientRegistrationResponseDtoSchema,
  type PatientRegistrationRequestDto
} from '@/server/contracts/patients/patient-registration.dto';
import type { PatientRegistrationFormValues } from '../schemas/patient-registration-schema';

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

export async function getCurrentPatientRegistrationStatus(_userId: string): Promise<boolean> {
  const currentUser = await loadCurrentUser();
  return Boolean(currentUser?.patient);
}

export async function getCurrentPatientRegistrationContext(
  userId: string
): Promise<CurrentRegistrationContext> {
  const currentUser = await loadCurrentUser();

  if (currentUser) {
    const isComplete = Boolean(currentUser.patient);
    const initialName =
      currentUser.patient?.fullName || currentUser.staff?.fullName || currentUser.email || '';

    return {
      isComplete,
      initialName
    };
  }

  // Fallback for Better Auth session if canonical user not resolved
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user && session.user.id === userId) {
      return {
        isComplete: false,
        initialName: session.user.name || session.user.email || ''
      };
    }
  } catch {
    // Ignore fallback error
  }

  return {
    isComplete: false,
    initialName: ''
  };
}

export async function completePatientRegistration({
  userId: _userId,
  values
}: CompletePatientRegistrationInput): Promise<CompletePatientRegistrationResult> {
  let accessToken = await getAccessTokenCookie();

  if (!accessToken) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.session?.token) {
        accessToken = session.session.token;
      }
    } catch {
      // Ignore
    }
  }

  if (!accessToken) {
    return {
      success: false,
      message: 'Sesi masuk tidak valid atau telah kedaluwarsa. Silakan masuk kembali.'
    };
  }

  const payload: PatientRegistrationRequestDto = {
    name: values.name,
    nik: values.nik,
    nama_ibu_kandung: values.nama_ibu_kandung,
    tempat_lahir: values.tempat_lahir,
    birth_date: values.birth_date,
    gender: values.gender,
    blood_type: values.blood_type,
    provinsi: values.provinsi,
    provinsi_id: values.provinsi_id,
    kabupaten: values.kabupaten,
    kabupaten_id: values.kabupaten_id,
    kecamatan: values.kecamatan,
    kecamatan_id: values.kecamatan_id,
    kelurahan: values.kelurahan,
    kelurahan_id: values.kelurahan_id,
    alamat_detail: values.alamat_detail,
    pekerjaan: values.pekerjaan
  };

  try {
    const response = await httpClient.request(
      paths.patients.registration(),
      patientRegistrationResponseDtoSchema,
      {
        method: 'POST',
        body: payload,
        tokenOverride: accessToken,
        cache: 'no-store'
      }
    );

    try {
      revalidatePath('/dashboard', 'layout');
    } catch {
      // Ignore in environments where revalidation is no-op
    }

    return {
      success: true,
      patientRecordId: response.id
    };
  } catch (error: unknown) {
    if (error instanceof AppError) {
      const code = error.problemDetails?.code;
      let message = error.problemDetails?.message || error.problemDetails?.detail || error.message;

      if (error.status === 401 || code === 'UNAUTHORIZED' || code === 'UNAUTHENTICATED') {
        message = 'Sesi masuk Anda telah berakhir. Silakan masuk kembali.';
      } else if (code === 'PATIENT_ALREADY_REGISTERED') {
        message =
          error.problemDetails?.message || 'Akun Anda sudah memiliki profil pasien terdaftar.';
        try {
          revalidatePath('/dashboard', 'layout');
        } catch {
          // Ignore
        }
      } else if (code === 'DUPLICATE_NIK') {
        message =
          error.problemDetails?.message ||
          'NIK ini sudah terdaftar pada rekam medis pasien lain. Periksa kembali NIK KTP Anda.';
      } else if (code === 'VALIDATION_FAILED' && error.invalidParams?.length) {
        message = error.invalidParams.map((p) => p.reason).join(', ');
      }

      return {
        success: false,
        message: message || 'Gagal menyimpan data pendaftaran pasien'
      };
    }

    return {
      success: false,
      message: 'Terjadi kesalahan sistem saat menyimpan data pasien'
    };
  }
}
