import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '../utils/store';
import type { ActionType } from '@/components/ui/notification-card';
import { executeNotificationAction } from '../utils/notification-action-dispatcher';
import type { ClinicNotification, NotificationActionItem } from '../types';
import { useViewer } from './use-viewer';

export function useNotificationAction() {
  const router = useRouter();
  const { roleCode: userRole } = useViewer();
  const { markAsRead } = useNotificationStore();
  const [loadingActionId, setLoadingActionId] = useState<string>();

  const handleAction = async (
    notificationId: string,
    actionId: string,
    actionType: ActionType,
    postActionCallback?: () => void,
    notification?: ClinicNotification
  ) => {
    setLoadingActionId(actionId);

    try {
      // Find matching action item from notification if present
      const actionItem: NotificationActionItem | undefined = notification?.actions?.find(
        (a) => a.id === actionId || a.actionKey === actionId
      );

      if (actionItem) {
        executeNotificationAction(router, actionItem, notification, userRole);
      } else if (notification?.actionUrl) {
        router.push(notification.actionUrl);
      }

      markAsRead(notificationId);
      if (postActionCallback) postActionCallback();
    } finally {
      setLoadingActionId(undefined);
    }
  };

  return { handleAction, loadingActionId };
}
