export type ClinicNotificationCategory =
  | 'Janji Temu'
  | 'Promo'
  | 'Hasil Lab'
  | 'Antrean'
  | 'Farmasi'
  | 'Telemedisin';

export type ClinicNotificationStatus = 'unread' | 'read';

export interface NotificationActionItem {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'warning' | 'info';
  icon?: string;
  actionKey: string;
}

export interface ClinicNotification {
  id: string;
  sender: string;
  roleSubtitle: string;
  avatar: string;
  badgeIcon: string;
  timeAgo: string;
  dateFull: string;
  body: string;
  category: ClinicNotificationCategory;
  status: ClinicNotificationStatus;
  metaIcon: string;
  createdAt: string;
  actions?: NotificationActionItem[];
}
