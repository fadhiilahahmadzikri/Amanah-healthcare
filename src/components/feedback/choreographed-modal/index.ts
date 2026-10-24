export { ChoreographedNotificationModal } from './organisms/choreographed-modal-card';
export {
  useNotificationModalStore,
  openNotificationModal,
  closeNotificationModal
} from './model/notification-modal-store';
export {
  presentAttendanceModal,
  type PresentAttendanceModalParams
} from './model/attendance-modal-presenter';
export { useConfettiCannon, type ConfettiParticle } from './use-confetti-cannon';
export type {
  NotificationModalPayload,
  ModalVariantKey,
  ChoreographyType,
  ModalIdentityDto
} from './types';

