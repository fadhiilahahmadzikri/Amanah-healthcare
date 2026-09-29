import { Icons } from '@/components/icons';

export interface ConsultationSessionItem {
  id: string;
  label: string;
  timeRange: string;
  value: 'PAGI' | 'SIANG' | 'MALAM' | string;
  desc: string;
  icon: typeof Icons.sun;
}

export const CONSULTATION_SESSIONS: ConsultationSessionItem[] = [
  {
    id: 'dini_hari',
    label: 'Sesi Dini Hari',
    timeRange: '00:00 - 06:00 WIB',
    value: 'DINI_HARI',
    desc: 'Kunjungan poliklinik dini hari',
    icon: Icons.moon
  },
  {
    id: 'pagi',
    label: 'Sesi Pagi',
    timeRange: '06:00 - 12:00 WIB',
    value: 'PAGI',
    desc: 'Kunjungan poliklinik pagi hari',
    icon: Icons.sun
  },
  {
    id: 'siang',
    label: 'Sesi Siang',
    timeRange: '13:00 - 16:00 WIB',
    value: 'SIANG',
    desc: 'Kunjungan poliklinik siang / sore',
    icon: Icons.clock
  },
  {
    id: 'malam',
    label: 'Sesi Malam',
    timeRange: '18:30 - 21:00 WIB',
    value: 'MALAM',
    desc: 'Kunjungan poliklinik malam hari',
    icon: Icons.moon
  }
];
