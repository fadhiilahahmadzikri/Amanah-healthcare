import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/client-fetch';
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

      const isProposalAction =
        actionItem?.actionKey === 'ACCEPT_RESCHEDULE' ||
        actionItem?.actionKey === 'DECLINE_RESCHEDULE' ||
        actionItem?.actionKey === 'ACCEPT_CANCELLATION' ||
        actionItem?.actionKey === 'DECLINE_CANCELLATION';

      if (isProposalAction) {
        const proposalId =
          (notification?.metadata?.proposalId as string) ||
          ((actionItem as unknown as { metadata?: { proposalId?: string } })?.metadata
            ?.proposalId as string);
        const isAccept = actionItem?.actionKey?.startsWith('ACCEPT_');
        const decision = isAccept ? 'accepted' : 'declined';

        if (proposalId) {
          try {
            const res = await clientFetch<{ success: boolean; message: string }>(
              `/api/v1/appointments/proposals/${proposalId}/respond`,
              {
                method: 'POST',
                body: JSON.stringify({ decision })
              }
            );
            toast.success(res.message || 'Tanggapan Anda telah berhasil diproses.');
          } catch (err: unknown) {
            const msg =
              err instanceof Error
                ? err.message
                : typeof err === 'object' && err !== null && 'message' in err
                  ? String((err as { message: unknown }).message)
                  : 'Gagal memproses tanggapan pengajuan.';
            toast.error(msg);
          }
        }
      } else if (actionItem) {
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
