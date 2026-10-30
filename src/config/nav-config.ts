import { NavGroup } from '@/types';
import { PERMISSIONS, AUDIENCE } from '@/core/auth/permissions.constants';

export const navGroups: NavGroup[] = [
  {
    label: 'Amanah Admin',
    items: [
      {
        title: 'Pelayanan Pasien',
        url: '#',
        icon: 'stethoscope',
        isActive: true,
        access: { audience: AUDIENCE.INTERNAL },
        items: [
          {
            title: 'Appointment Pasien',
            url: '/admin/appointment-pasien',
            icon: 'calendar',
            shortcut: ['a', 'p'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.APPOINTMENTS.READ }
          },
          {
            title: 'Data Pasien',
            url: '/admin/data-pasien',
            icon: 'teams',
            shortcut: ['d', 'p'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.PATIENTS.READ }
          },
          {
            title: 'Chat Pasien',
            url: '/admin/chat',
            icon: 'chat',
            shortcut: ['c', 'p'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.APP.ACCESS }
          },
          {
            title: 'Riwayat Medis',
            url: '/admin/riwayat-medis',
            icon: 'history',
            shortcut: ['r', 'm'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.RECORDS.READ }
          }
        ]
      },
      {
        title: 'Manajemen SDM',
        url: '#',
        icon: 'userPen',
        isActive: true,
        access: { audience: AUDIENCE.INTERNAL },
        items: [
          {
            title: 'Jadwal Praktisi',
            url: '/admin/jadwal-dokter',
            icon: 'clock',
            shortcut: ['j', 'p'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.SCHEDULES.READ }
          },
          {
            title: 'Manajemen Staf',
            url: '/admin/staff',
            icon: 'teams',
            shortcut: ['m', 's'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.STAFF.READ }
          },
          {
            title: 'Management Role',
            url: '/admin/management-role',
            icon: 'lock',
            shortcut: ['m', 'r'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.ROLES.READ }
          },
          {
            title: 'Clinic Essentials',
            url: '/admin/clinic-essentials',
            icon: 'workspace',
            shortcut: ['c', 'e'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.CLINICS.MANAGE }
          },
          {
            title: 'Kehadiran Pegawai',
            url: '/admin/kehadiran-pegawai',
            icon: 'badgeCheck',
            shortcut: ['k', 'p'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.ATTENDANCE.REVIEW }
          },
          {
            title: 'Manajemen Perizinan',
            url: '/admin/manajemen-perizinan',
            icon: 'calendar',
            shortcut: ['m', 'p'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.ATTENDANCE.APPROVE }
          },
          {
            title: 'Peluang Pengganti',
            url: '/admin/peluang-pengganti',
            icon: 'userCheck',
            shortcut: ['p', 'p'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.ATTENDANCE.MANAGE }
          }
        ]
      },
      {
        title: 'Keuangan & Penggajian',
        url: '#',
        icon: 'receipt',
        isActive: true,
        access: { audience: AUDIENCE.INTERNAL },
        items: [
          {
            title: 'Manajemen Penggajian',
            url: '/admin/payroll',
            icon: 'receipt',
            shortcut: ['m', 'y'],
            access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.PAYROLL.READ }
          }
        ]
      },
      {
        title: 'Notifikasi',
        url: '/admin/notifications',
        icon: 'notification',
        shortcut: ['n', 'a'],
        access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.NOTIFICATIONS.READ }
      },
      {
        title: 'Pengaturan Sistem',
        url: '/admin/settings',
        icon: 'settings',
        shortcut: ['s', 't'],
        access: { audience: AUDIENCE.INTERNAL, permission: PERMISSIONS.CLINICS.MANAGE }
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
        access: { audience: AUDIENCE.EXTERNAL },
        items: [
          {
            title: 'Cek Antrean',
            url: '/klinik/antrean',
            icon: 'listOrdered',
            shortcut: ['c', 'a'],
            access: { audience: AUDIENCE.EXTERNAL, permission: PERMISSIONS.QUEUE.READ }
          },
          {
            title: 'Janji Temu',
            url: '/klinik/janji-temu',
            icon: 'calendar',
            shortcut: ['j', 't'],
            access: { audience: AUDIENCE.EXTERNAL, permission: PERMISSIONS.APPOINTMENTS.BOOK }
          },
          {
            title: 'Riwayat Medis',
            url: '/klinik/history',
            icon: 'history',
            shortcut: ['r', 'm'],
            access: { audience: AUDIENCE.EXTERNAL, permission: PERMISSIONS.RECORDS.READ }
          },
          {
            title: 'Chat Konsultasi',
            url: '/klinik/chat',
            icon: 'chat',
            shortcut: ['c', 'k'],
            access: { audience: AUDIENCE.EXTERNAL, permission: PERMISSIONS.APP.ACCESS }
          },
          {
            title: 'Notifikasi',
            url: '/klinik/notifications',
            icon: 'notification',
            shortcut: ['n', 'k'],
            access: { audience: AUDIENCE.EXTERNAL, permission: PERMISSIONS.NOTIFICATIONS.READ }
          },
          {
            title: 'Panduan Penggunaan',
            url: '/klinik/panduan',
            icon: 'help',
            shortcut: ['p', 'd'],
            access: { audience: AUDIENCE.EXTERNAL, permission: PERMISSIONS.APP.ACCESS }
          }
        ]
      }
    ]
  }
];
