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

  if (currentUser?.patient) {
    return {
      isComplete: true,
      initialName: currentUser.patient.fullName
    };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user && session.user.id === userId) {
      return {
        isComplete: false,
        initialName: session.user.name ?? ''
      };
    }
  } catch {
    // Ignore session error
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
    motherName: values.nama_ibu_kandung,
    birthPlace: values.tempat_lahir,
    birthDate: values.birth_date,
    gender: values.gender,
    bloodType: values.blood_type,
    provinceName: values.provinsi,
    provinceCode: values.provinsi_id,
    regencyName: values.kabupaten,
    regencyCode: values.kabupaten_id,
    districtName: values.kecamatan,
    districtCode: values.kecamatan_id,
    villageName: values.kelurahan,
    villageCode: values.kelurahan_id,
    line1: values.alamat_detail,
    occupation: values.pekerjaan
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
      revalidatePath('/admin', 'layout');
      revalidatePath('/klinik', 'layout');
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
      let message = error.message;

      if (error.status === 401 || code === 'UNAUTHORIZED' || code === 'UNAUTHENTICATED') {
        message = 'Sesi masuk Anda telah berakhir. Silakan masuk kembali.';
      } else if (code === 'PATIENT_ALREADY_REGISTERED') {
        message = 'Akun Anda sudah memiliki profil pasien terdaftar.';
        try {
          revalidatePath('/admin', 'layout');
          revalidatePath('/klinik', 'layout');
        } catch {
          // Ignore
        }
      } else if (code === 'DUPLICATE_NIK') {
        message =
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
