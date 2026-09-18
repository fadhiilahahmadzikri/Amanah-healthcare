import { requireSession } from '@/lib/guard';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await requireSession();

  if (session.user.role === 'admin') {
    redirect('/dashboard/admin');
  } else {
    redirect('/dashboard/klinik/antrean');
  }
}
