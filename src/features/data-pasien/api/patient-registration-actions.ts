'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { completePatientRegistration } from './patient-registration-service';
import {
  patientRegistrationSchema,
  type PatientRegistrationFormValues
} from '../schemas/patient-registration-schema';

export type PatientRegistrationActionResult = {
  success: boolean;
  message: string;
};

export async function completePatientRegistrationAction(
  values: PatientRegistrationFormValues
): Promise<PatientRegistrationActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      message: 'Sesi masuk tidak valid. Silakan masuk kembali.'
    };
  }

  const parsedValues = patientRegistrationSchema.safeParse(values);

  if (!parsedValues.success) {
    return {
      success: false,
      message: 'Lengkapi data pasien sebelum melanjutkan.'
    };
  }

  const result = await completePatientRegistration({
    userId,
    values: parsedValues.data
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message
    };
  }

  return {
    success: true,
    message: 'Data pasien berhasil disimpan'
  };
}
