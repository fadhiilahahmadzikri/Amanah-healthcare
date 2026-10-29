import { redirect } from 'next/navigation';
import { ROUTES } from '@/core/routes';

export default function AdminRootPage() {
  redirect(ROUTES.adminAppointmentPasien);
}
