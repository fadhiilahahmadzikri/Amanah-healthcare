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
        items: [
          {
            title: 'Dashboard',
            url: '/dashboard/admin',
            icon: 'dashboard',
            shortcut: ['a', 'd']
          },
          {
            title: 'Appointment Pasien',
            url: '/dashboard/appointment-pasien',
            icon: 'calendar',
            shortcut: ['a', 'p']
          },
          {
            title: 'Data Pasien',
            url: '/dashboard/data-pasien',
            icon: 'teams',
            shortcut: ['d', 'p']
          },
          {
            title: 'Jadwal Dokter',
            url: '/dashboard/jadwal-dokter',
            icon: 'clock',
            shortcut: ['j', 'd']
          },
          {
            title: 'Chat Pasien',
            url: '/dashboard/chat',
            icon: 'chat',
            shortcut: ['c', 'p']
          },
          {
            title: 'Kehadiran Pegawai',
            url: '/dashboard/kehadiran-pegawai',
            icon: 'badgeCheck',
            shortcut: ['k', 'p']
          }
        ]
      },
      {
        title: 'Klinik',
        url: '#',
        icon: 'calendar',
        isActive: false,
        items: [
          {
            title: 'Janji Temu',
            url: '/dashboard/klinik/janji-temu',
            icon: 'calendar',
            shortcut: ['j', 't']
          },
          {
            title: 'Cek Antrean',
            url: '/dashboard/klinik/antrean',
            icon: 'listOrdered',
            shortcut: ['c', 'a']
          },
          {
            title: 'Notifikasi',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'k']
          },
          {
            title: 'Profil Pasien',
            url: '/dashboard/klinik/profile',
            icon: 'profile',
            shortcut: ['p', 'k']
          },
          {
            title: 'Panduan Penggunaan',
            url: '/dashboard/klinik/panduan',
            icon: 'help',
            shortcut: ['p', 'd']
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
            icon: 'workspace'
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
            shortcut: ['s', 's']
          },
          {
            title: 'Billing',
            url: '/dashboard/billing',
            icon: 'billing',
            shortcut: ['b', 'b'],
            access: { requireOrg: true }
          }
        ]
      }
    ]
  }
];
