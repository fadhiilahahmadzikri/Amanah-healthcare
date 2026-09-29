import { requireSession } from '@/server/auth/session.dal';
import { getRoleLandingPath } from '@/core/routes';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { role } = await requireSession();
  redirect(getRoleLandingPath(role));
}
