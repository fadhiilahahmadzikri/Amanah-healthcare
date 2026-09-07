import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Lengkapi Data Pasien',
  description: 'Formulir data pasien setelah autentikasi'
};

export default async function PatientRegistrationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/sign-in');
  }

  redirect('/dashboard/overview');
}
