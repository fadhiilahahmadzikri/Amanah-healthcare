import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Manage',
    items: [
      {
        title: 'Amanah Admin',
        url: '#',
        icon: 'stethoscope',
        isActive: true,
        access: { role: 'admin' },
        items: [
          {
            title: 'Dashboard',
            url: '/dashboard/admin',
            icon: 'dashboard',
            shortcut: ['a', 'd'],
            access: { role: 'admin' }
          },
          {
            title: 'Appointment Pasien',
            url: '/dashboard/appointment-pasien',
            icon: 'calendar',
            shortcut: ['a', 'p'],
            access: { role: 'admin' }
          },
          {
            title: 'Data Pasien',
            url: '/dashboard/data-pasien',
            icon: 'teams',
            shortcut: ['d', 'p'],
            access: { role: 'admin' }
          },
          {
            title: 'Jadwal Dokter',
            url: '/dashboard/jadwal-dokter',
            icon: 'clock',
            shortcut: ['j', 'd'],
            access: { role: 'admin' }
          },
          {
            title: 'Chat Pasien',
            url: '/dashboard/chat',
            icon: 'chat',
            shortcut: ['c', 'p'],
            access: { role: 'admin' }
          },
          {
            title: 'Kehadiran Pegawai',
            url: '/dashboard/kehadiran-pegawai',
            icon: 'badgeCheck',
            shortcut: ['k', 'p'],
            access: { role: 'admin' }
          }
        ]
      },
      {
        title: 'Klinik',
        url: '#',
        icon: 'calendar',
        isActive: true,
        access: { role: 'patient' },
        items: [
          {
            title: 'Cek Antrean',
            url: '/dashboard/klinik/antrean',
            icon: 'listOrdered',
            shortcut: ['c', 'a'],
            access: { role: 'patient' }
          },
          {
            title: 'Janji Temu',
            url: '/dashboard/klinik/janji-temu',
            icon: 'calendar',
            shortcut: ['j', 't'],
            access: { role: 'patient' }
          },
          {
            title: 'Notifikasi',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'k'],
            access: { role: 'patient' }
          },
          {
            title: 'Profil Pasien',
            url: '/dashboard/klinik/profile',
            icon: 'profile',
            shortcut: ['p', 'k'],
            access: { role: 'patient' }
          },
          {
            title: 'Panduan Penggunaan',
            url: '/dashboard/klinik/panduan',
            icon: 'help',
            shortcut: ['p', 'd'],
            access: { role: 'patient' }
          }
        ]
      }
    ]
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Account',
        url: '#',
        icon: 'account',
        isActive: true,
        items: [
          {
            title: 'Workspaces',
            url: '/dashboard/workspaces',
            icon: 'workspace',
            access: { role: 'admin' }
          },
          {
            title: 'Profile',
            url: '/dashboard/profile',
            icon: 'profile',
            shortcut: ['m', 'm']
          },
          {
            title: 'Settings',
            url: '/dashboard/settings',
            icon: 'settings',
            shortcut: ['s', 's'],
            access: { role: 'admin' }
          },
          {
            title: 'Billing',
            url: '/dashboard/billing',
            icon: 'billing',
            shortcut: ['b', 'b'],
            access: { role: 'admin' }
          }
        ]
      }
    ]
  }
];
