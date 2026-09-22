'use server';

import {
  getPatientProfileMe,
  updatePatientProfileMe,
  type UpdatePatientProfileResult
} from './patient-profile-service';
import type {
  PatientProfileDto,
  UpdatePatientProfileRequestDto
} from '@/server/contracts/patients/patient-profile.dto';

export async function getPatientProfileAction(): Promise<PatientProfileDto | null> {
  return getPatientProfileMe();
}

export async function updatePatientProfileAction(
  payload: UpdatePatientProfileRequestDto
): Promise<UpdatePatientProfileResult> {
  return updatePatientProfileMe(payload);
}
