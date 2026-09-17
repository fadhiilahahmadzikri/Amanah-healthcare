import { auth } from '@/lib/auth';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Lengkapi Data Pasien',
  description: 'Formulir data pasien setelah autentikasi'
};

export default async function PatientRegistrationPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  if (session.user.role === 'admin') {
    redirect('/dashboard/admin');
  } else {
    redirect('/dashboard/klinik/antrean');
  }
}
