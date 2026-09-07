'use server';

import { auth } from '@clerk/nextjs/server';

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
  const { userId } = await auth();

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
