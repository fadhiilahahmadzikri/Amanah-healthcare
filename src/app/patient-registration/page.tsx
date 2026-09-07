import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PatientRegistrationView } from '@/features/data-pasien/components/registration/patient-registration-view';
import { getCurrentPatientRegistrationContext } from '@/features/data-pasien/api/patient-registration-service';
import { getPatientRegistrationRedirectPath } from '@/features/data-pasien/api/registration-mapper';

export const metadata: Metadata = {
  title: 'Lengkapi Data Pasien',
  description: 'Formulir data pasien setelah autentikasi'
};

export default async function PatientRegistrationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/sign-in');
  }

  const context = await getCurrentPatientRegistrationContext(userId);
  const redirectPath = getPatientRegistrationRedirectPath({
    isAuthenticated: true,
    isRegistrationComplete: context.isComplete,
    pathname: '/patient-registration'
  });

  if (redirectPath) {
    redirect(redirectPath);
  }

  return <PatientRegistrationView initialName={context.initialName} />;
}
