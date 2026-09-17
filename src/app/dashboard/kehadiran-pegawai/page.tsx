import { requireAdmin } from '@/lib/guard';
import { KehadiranPegawaiView } from '@/features/kehadiran-pegawai';

export const metadata = {
  title: 'Dashboard: Kehadiran Pegawai'
};

export default async function KehadiranPegawaiPage() {
  await requireAdmin();
  return <KehadiranPegawaiView />;
}
