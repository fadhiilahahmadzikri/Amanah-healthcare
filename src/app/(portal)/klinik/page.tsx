import { redirect } from 'next/navigation';
import { ROUTES } from '@/core/routes';

export default function ClinicRootPage() {
  redirect(ROUTES.clinicQueue);
}
