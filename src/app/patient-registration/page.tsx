import { requireSession } from '@/lib/guard';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Lengkapi Data Pasien',
  description: 'Formulir data pasien setelah autentikasi'
};

export default async function PatientRegistrationPage() {
  const session = await requireSession();

  if (session.user.role === 'admin') {
    redirect('/dashboard/admin');
  } else {
    redirect('/dashboard/klinik/antrean');
  }
}
