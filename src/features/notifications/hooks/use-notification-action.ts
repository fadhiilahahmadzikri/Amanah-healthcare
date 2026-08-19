import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '../utils/store';
import type { ActionType } from '@/components/ui/notification-card';

export function useNotificationAction() {
  const router = useRouter();
  const { markAsRead } = useNotificationStore();
  const [loadingActionId, setLoadingActionId] = useState<string>();

  const handleAction = async (
    notificationId: string,
    actionId: string,
    actionType: ActionType,
    postActionCallback?: () => void
  ) => {
    setLoadingActionId(actionId);

    try {
      if (actionType === 'redirect') {
        const actionRoutes: Record<string, string> = {
          'view-orders': '/dashboard/orders',
          'view-products': '/dashboard/products',
          'view-stock': '/dashboard/stock',
          view: '/dashboard/workspaces',
          billing: '/dashboard/billing',
          open: '/dashboard/kanban',
          'open-chat': '/dashboard/chat'
        };

        const route = actionRoutes[actionId];
        if (route) {
          router.push(route);
        }
      } else if (actionType === 'api_call') {
        // Simulate API call delay for approve/decline/download
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      markAsRead(notificationId);
      if (postActionCallback) postActionCallback();
    } finally {
      setLoadingActionId(undefined);
    }
  };

  return { handleAction, loadingActionId };
}
