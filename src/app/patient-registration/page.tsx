import { requireSession } from '@/lib/guard';
import { getRoleLandingPath } from '@/core/routes';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Lengkapi Data Pasien',
  description: 'Formulir data pasien setelah autentikasi'
};

export default async function PatientRegistrationPage() {
  const session = await requireSession();
  const audience = (session.user as { audience?: string }).audience;
  redirect(getRoleLandingPath(audience));
}
