import { type QueueItem, QUEUE_STATUS, type QueueStatus } from '../api/types';
import { formatClinicTime } from '@/lib/date-format';

export interface QueuePoliStats {
  totalToday: string;
  timeRemaining: string;
  operationalHours: string;
}

export function isQueueActive(status: QueueStatus): boolean {
  return status === QUEUE_STATUS.IN_SERVICE || status === QUEUE_STATUS.CALLED;
}

export function findCurrentCallingQueue(
  queues: QueueItem[],
  activePoli: string
): QueueItem | undefined {
  return queues.find((queue) => queue.poli === activePoli && isQueueActive(queue.status));
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

    return item.status === QUEUE_STATUS.WAITING && item.poli === activePoli && matchesSearch;
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
  waitingCount: number,
  operationalHours = '08:00 - 21:00'
): QueuePoliStats {
  const allInPoli = queues.filter((queue) => queue.poli === activePoli);

  return {
    totalToday: `${allInPoli.length} Pasien`,
    timeRemaining: waitingCount > 0 ? `${waitingCount} Antrean Menunggu` : 'Tidak Ada Antrean',
    operationalHours
  };
}

export function getCurrentQueueCalledTime(): string {
  return formatClinicTime(new Date());
}
