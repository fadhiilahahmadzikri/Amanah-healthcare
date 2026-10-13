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
  const poliQueues = queues.filter(
    (queue) => (queue.poli || '').toLowerCase() === activePoli.toLowerCase()
  );
  return (
    poliQueues.find((queue) => queue.status === QUEUE_STATUS.IN_SERVICE) ||
    poliQueues.find((queue) => queue.status === QUEUE_STATUS.CALLED)
  );
}

export function filterWaitingQueues(
  queues: QueueItem[],
  activePoli: string,
  searchQuery: string
): QueueItem[] {
  const query = searchQuery.trim().toLowerCase();

  return queues.filter((item) => {
    const matchesPoli = (item.poli || '').toLowerCase() === activePoli.toLowerCase();
    if (!matchesPoli) return false;

    const matchesSearch =
      !query ||
      item.patient_name.toLowerCase().includes(query) ||
      item.queue_number.toLowerCase().includes(query) ||
      item.doctor_name.toLowerCase().includes(query);

    return item.status === QUEUE_STATUS.WAITING && matchesSearch;
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
  operationalHours = '-'
): QueuePoliStats {
  const allInPoli = queues.filter(
    (queue) => (queue.poli || '').toLowerCase() === activePoli.toLowerCase()
  );

  return {
    totalToday: `${allInPoli.length} Pasien`,
    timeRemaining: waitingCount > 0 ? `${waitingCount} Antrean Menunggu` : 'Tidak Ada Antrean',
    operationalHours
  };
}

export function getCurrentQueueCalledTime(): string {
  return formatClinicTime(new Date());
}
