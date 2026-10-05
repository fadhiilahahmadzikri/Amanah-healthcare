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
  url?: string;
}

export interface ClinicNotification {
  id: string;
  title: string;
  sender: string;
  roleSubtitle: string;
  avatar: string;
  badgeIcon?: string | null;
  timeAgo: string;
  dateFull: string;
  body: string;
  category: ClinicNotificationCategory;
  status: ClinicNotificationStatus;
  metaIcon?: string | null;
  createdAt: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  actions?: NotificationActionItem[];
}

export type NotificationAudience = 'patient' | 'clinic';

export interface NotificationSemanticAction {
  type: string;
  params: Record<string, string>;
  label?: string;
}

export interface NotificationEnvelopeV2 {
  schemaVersion: 2;
  id: string;
  eventId: string;
  correlationId?: string;
  audience: NotificationAudience;
  recipientUserId: string;
  type: string;
  title: string;
  body: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  action?: NotificationSemanticAction;
  actions?: Array<{
    label: string;
    actionKey: string;
    actionType?: string | null;
    url?: string | null;
  }>;
  presentation: {
    toast: boolean;
  };
  createdAt: string;
  badgeIcon?: string | null;
  metaIcon?: string | null;
  visualKey?: string | null;
  senderName?: string | null;
  senderRole?: string | null;
}
