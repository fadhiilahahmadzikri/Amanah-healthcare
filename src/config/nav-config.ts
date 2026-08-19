import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Manage',
    items: [
      {
        title: 'Klinik',
        url: '#',
        icon: 'calendar',
        isActive: true,
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
      },
      {
        title: 'Commerce',
        url: '#',
        icon: 'receipt',
        isActive: false,
        items: [
          {
            title: 'Orders',
            url: '/dashboard/orders',
            icon: 'billing'
          },
          {
            title: 'Customers',
            url: '/dashboard/customers',
            icon: 'teams'
          },
          {
            title: 'Invoices',
            url: '/dashboard/invoices',
            icon: 'fileTypeDoc'
          },
          {
            title: 'Reports',
            url: '/dashboard/reports',
            icon: 'barChart'
          }
        ]
      },
      {
        title: 'Inventory',
        url: '#',
        icon: 'warehouse',
        isActive: false,
        items: [
          {
            title: 'Products',
            url: '/dashboard/products',
            icon: 'product',
            shortcut: ['p', 'p']
          },
          {
            title: 'Catalog',
            url: '/dashboard/catalog',
            icon: 'catalog'
          },
          {
            title: 'Categories',
            url: '/dashboard/categories',
            icon: 'forms'
          }
        ]
      },
      {
        title: 'Shipping',
        url: '#',
        icon: 'truck',
        isActive: false,
        items: [
          {
            title: 'Onboarding',
            url: '/dashboard/shipping/onboarding',
            icon: 'package'
          },
          {
            title: 'Tracker',
            url: '/dashboard/shipping/tracker',
            icon: 'mapPin'
          }
        ]
      },
      {
        title: 'Engagement',
        url: '#',
        icon: 'notification',
        isActive: false,
        items: [
          {
            title: 'Notifications',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'n']
          },
          {
            title: 'Chat',
            url: '/dashboard/chat',
            icon: 'chat',
            shortcut: ['c', 'c']
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
