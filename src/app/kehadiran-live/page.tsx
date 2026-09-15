import { KehadiranLiveView } from '@/features/kehadiran-pegawai';

export const metadata = {
  title: 'Live Presensi Kiosk - Amanah Healthcare',
  description: 'Panel independen live presensi kehadiran pegawai'
};

export default function KehadiranLivePage() {
  return <KehadiranLiveView />;
}
