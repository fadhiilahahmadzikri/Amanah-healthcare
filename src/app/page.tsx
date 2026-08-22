import type { Metadata } from 'next';
import { LandingView } from '@/features/landing/components/landing-view';

export const metadata: Metadata = {
  title: 'Klinik Pratama Amanah HealthCare — Pelayanan Medis Profesional & Terpercaya',
  description:
    'Layanan kesehatan terpercaya untuk Anda dan keluarga di Yogyakarta. Menyediakan Poli Umum, USG Kandungan, Poli Gigi, Persalinan 24 Jam, Khitan Modern, dan Farmasi.'
};

export default function Page() {
  return <LandingView />;
}
