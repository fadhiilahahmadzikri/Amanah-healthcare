import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Amanah Admin',
    items: [
      {
        title: 'Pelayanan Pasien',
        url: '#',
        icon: 'stethoscope',
        isActive: true,
        access: { role: 'admin' },
        items: [
          {
            title: 'Appointment Pasien',
            url: '/admin/appointment-pasien',
            icon: 'calendar',
            shortcut: ['a', 'p'],
            access: { role: 'admin' }
          },
          {
            title: 'Data Pasien',
            url: '/admin/data-pasien',
            icon: 'teams',
            shortcut: ['d', 'p'],
            access: { role: 'admin' }
          },
          {
            title: 'Chat Pasien',
            url: '/admin/chat',
            icon: 'chat',
            shortcut: ['c', 'p'],
            access: { role: 'admin' }
          },
          {
            title: 'Riwayat Medis',
            url: '/admin/riwayat-medis',
            icon: 'history',
            shortcut: ['r', 'm'],
            access: { role: 'admin' }
          }
        ]
      },
      {
        title: 'Manajemen SDM',
        url: '#',
        icon: 'userPen',
        isActive: true,
        access: { role: 'admin' },
        items: [
          {
            title: 'Jadwal Dokter',
            url: '/admin/jadwal-dokter',
            icon: 'clock',
            shortcut: ['j', 'd'],
            access: { role: 'admin' }
          },
          {
            title: 'Manajemen Staf',
            url: '/admin/staff',
            icon: 'teams',
            shortcut: ['m', 's'],
            access: { role: 'admin' }
          },
          {
            title: 'Kehadiran Pegawai',
            url: '/admin/kehadiran-pegawai',
            icon: 'badgeCheck',
            shortcut: ['k', 'p'],
            access: { role: 'admin' }
          },
          {
            title: 'Manajemen Perizinan',
            url: '/admin/manajemen-perizinan',
            icon: 'calendar',
            shortcut: ['m', 'p'],
            access: { role: 'admin' }
          },
          {
            title: 'Peluang Pengganti',
            url: '/admin/peluang-pengganti',
            icon: 'userCheck',
            shortcut: ['p', 'p'],
            access: { role: 'admin' }
          }
        ]
      },
      {
        title: 'Keuangan & Penggajian',
        url: '#',
        icon: 'receipt',
        isActive: true,
        access: { role: 'admin' },
        items: [
          {
            title: 'Manajemen Penggajian',
            url: '/admin/payroll',
            icon: 'receipt',
            shortcut: ['m', 'y'],
            access: { role: 'admin' }
          }
        ]
      },
      {
        title: 'Notifikasi',
        url: '/admin/notifications',
        icon: 'notification',
        shortcut: ['n', 'a'],
        access: { role: 'admin' }
      }
    ]
  },
  {
    label: 'Klinik',
    items: [
      {
        title: 'Klinik',
        url: '#',
        icon: 'calendar',
        isActive: true,
        access: { role: 'patient' },
        items: [
          {
            title: 'Cek Antrean',
            url: '/klinik/antrean',
            icon: 'listOrdered',
            shortcut: ['c', 'a'],
            access: { role: 'patient' }
          },
          {
            title: 'Janji Temu',
            url: '/klinik/janji-temu',
            icon: 'calendar',
            shortcut: ['j', 't'],
            access: { role: 'patient' }
          },
          {
            title: 'Riwayat Medis',
            url: '/klinik/history',
            icon: 'history',
            shortcut: ['r', 'm'],
            access: { role: 'patient' }
          },
          {
            title: 'Chat Konsultasi',
            url: '/klinik/chat',
            icon: 'chat',
            shortcut: ['c', 'k'],
            access: { role: 'patient' }
          },
          {
            title: 'Notifikasi',
            url: '/klinik/notifications',
            icon: 'notification',
            shortcut: ['n', 'k'],
            access: { role: 'patient' }
          },
          {
            title: 'Panduan Penggunaan',
            url: '/klinik/panduan',
            icon: 'help',
            shortcut: ['p', 'd'],
            access: { role: 'patient' }
          }
        ]
      }
    ]
  }
];
