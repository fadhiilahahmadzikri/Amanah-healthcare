import type { QueueItem } from '../api/types';
import { QUEUE_POLI_LIST, CLINIC_OPERATIONAL_HOURS } from '../constants/queue-policy';

export { QUEUE_POLI_LIST };

export const QUEUE_AUTOPLAY_INTERVAL_MS = 3500;

export interface QueuePoliStats {
  totalToday: string;
  timeRemaining: string;
  operationalHours: string;
}

export function findCurrentCallingQueue(
  queues: QueueItem[],
  activePoli: string
): QueueItem | undefined {
  return queues.find((queue) => queue.status === 'DIPANGGIL' && queue.poli === activePoli);
}

export function filterWaitingQueues(
  queues: QueueItem[],
  activePoli: string,
  searchQuery: string
): QueueItem[] {
  const query = searchQuery.trim().toLowerCase();

  return queues.filter((item) => {
    const matchesSearch =
      !query ||
      item.patient_name.toLowerCase().includes(query) ||
      item.queue_number.toLowerCase().includes(query) ||
      item.doctor_name.toLowerCase().includes(query);

    return item.status === 'MENUNGGU' && item.poli === activePoli && matchesSearch;
  });
}

export function paginateQueues(
  queues: QueueItem[],
  currentPage: number,
  pageSize: number
): QueueItem[] {
  const start = (currentPage - 1) * pageSize;
  return queues.slice(start, start + pageSize);
}

export function buildQueuePoliStats(
  queues: QueueItem[],
  activePoli: string,
  waitingCount: number
): QueuePoliStats {
  const allInPoli = queues.filter((queue) => queue.poli === activePoli);

  return {
    totalToday: `${allInPoli.length} Pasien`,
    timeRemaining: waitingCount > 0 ? `${waitingCount} Antrean Menunggu` : 'Tidak Ada Antrean',
    operationalHours: CLINIC_OPERATIONAL_HOURS
  };
}

export function canRotateQueue(queues: QueueItem[], activePoli: string): boolean {
  return queues.some(
    (queue) =>
      queue.poli === activePoli && (queue.status === 'MENUNGGU' || queue.status === 'DIPANGGIL')
  );
}

export function advanceQueue(
  queues: QueueItem[],
  activePoli: string,
  calledTime: string
): QueueItem[] {
  const list = queues.filter((queue) => queue.poli === activePoli);
  const activeCall = list.find((queue) => queue.status === 'DIPANGGIL');
  const nextWaiting = list.find((queue) => queue.status === 'MENUNGGU');

  if (!nextWaiting && activeCall) {
    return queues.map((item) =>
      item.queue_number === activeCall.queue_number ? { ...item, status: 'SELESAI' } : item
    );
  }

  if (!nextWaiting) return queues;

  return queues.map((item) => {
    if (item.queue_number === nextWaiting.queue_number) {
      return { ...item, status: 'DIPANGGIL', called_time: calledTime };
    }

    if (activeCall && item.queue_number === activeCall.queue_number) {
      return { ...item, status: 'SELESAI' };
    }

    return item;
  });
}

export function getCurrentQueueCalledTime(): string {
  return (
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB'
  );
}
