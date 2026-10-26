import 'server-only';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import { getAccessTokenCookie } from '@/server/auth/token-store';
import { AppError } from '@/core/errors/app-error';
import {
  patientProfileDtoSchema,
  type PatientProfileDto,
  type UpdatePatientProfileRequestDto
} from '@/server/contracts/patients/patient-profile.dto';

export type UpdatePatientProfileResult =
  | {
      success: true;
      data: PatientProfileDto;
      message: string;
    }
  | {
      success: false;
      message: string;
      code?: string;
    };

async function resolveActiveToken(): Promise<string | null> {
  let token = await getAccessTokenCookie();

  if (!token) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.session?.token) {
        token = session.session.token;
      }
    } catch {
      // Ignore fallback error
    }
  }

  return token;
}

/**
 * Fetches the complete patient profile for the currently authenticated patient.
 * Exposes all 17 demographic attributes, structured address, and emergency contact.
 */
export async function getPatientProfileMe(): Promise<PatientProfileDto | null> {
  const token = await resolveActiveToken();

  if (!token) {
    return null;
  }

  try {
    const profile = await httpClient.request(paths.patients.me(), patientProfileDtoSchema, {
      method: 'GET',
      tokenOverride: token,
      cache: 'no-store'
    });

    return profile;
  } catch (error: unknown) {
    if (error instanceof AppError && (error.status === 401 || error.status === 404)) {
      return null;
    }
    return null;
  }
}

/**
 * Updates the demographic, address, emergency contact, or medical info
 * of the currently authenticated patient.
 */
export async function updatePatientProfileMe(
  payload: UpdatePatientProfileRequestDto
): Promise<UpdatePatientProfileResult> {
  const token = await resolveActiveToken();

  if (!token) {
    return {
      success: false,
      message: 'Sesi masuk tidak valid atau telah kedaluwarsa. Silakan masuk kembali.'
    };
  }

  try {
    const updatedProfile = await httpClient.request(paths.patients.me(), patientProfileDtoSchema, {
      method: 'PATCH',
      body: payload,
      tokenOverride: token,
      cache: 'no-store'
    });

    try {
      revalidatePath('/dashboard/profile', 'layout');
      revalidatePath('/dashboard/klinik/profile', 'layout');
      revalidatePath('/dashboard', 'layout');
    } catch {
      // Ignore revalidation errors outside request context
    }

    return {
      success: true,
      data: updatedProfile,
      message: 'Profil pasien berhasil diperbarui.'
    };
  } catch (error: unknown) {
    if (error instanceof AppError) {
      let message = error.message;

      if (error.status === 401) {
        message = 'Sesi masuk Anda telah berakhir. Silakan masuk kembali.';
      } else if (error.status === 403) {
        message = 'Anda tidak memiliki hak untuk mengubah data pasien ini.';
      } else if (error.invalidParams?.length) {
        message = error.invalidParams.map((p) => p.reason).join(', ');
      }

      return {
        success: false,
        message: message || 'Gagal memperbarui profil pasien',
        code: error.code
      };
    }

    return {
      success: false,
      message: 'Terjadi kesalahan sistem saat memperbarui profil pasien'
    };
  }
}
