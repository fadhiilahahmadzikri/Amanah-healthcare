'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppointmentStatusDescriptor } from '@/constants/appointment-status.constants';
import {
  getDailyQueuesFromApi,
  callPatientQueue,
  respondPatientQueue,
  noShowPatientQueue,
  completePatientQueue
} from '../api/service';
import type { QueueItem } from '../api/types';
import {
  QUEUE_POLI_LIST,
  buildQueuePoliStats,
  filterWaitingQueues,
  findCurrentCallingQueue,
  paginateQueues,
  type QueuePoliStats
} from './queueViewModel';

export interface UseQueueViewResult {
  activePoli: string;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  isLoading: boolean;
  currentCalling?: QueueItem;
  waitingList: QueueItem[];
  paginatedSeats: QueueItem[];
  poliStats: QueuePoliStats;
  poliList: readonly string[];
  totalItems: number;
  isActionLoading: boolean;
  actions: {
    changePoli: (poli: string) => void;
    changeSearch: (value: string) => void;
    changePageSize: (value: number) => void;
    previousPage: () => void;
    nextPage: () => void;
    callPatient: (appointmentId: string) => Promise<void>;
    respondPatient: (appointmentId: string) => Promise<void>;
    noShowPatient: (appointmentId: string) => Promise<void>;
    completePatient: (appointmentId: string) => Promise<void>;
    refreshQueues: () => Promise<void>;
  };
}

export function useQueueView(): UseQueueViewResult {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [activePoli, setActivePoli] = useState('Poli Umum');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const refreshQueues = useCallback(async () => {
    const items = await getDailyQueuesFromApi();
    setQueues(items);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getDailyQueuesFromApi()
      .then((items) => {
        if (isMounted) {
          setQueues(items);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [activePoli]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdate = (e?: Event) => {
      const customEvt = e as CustomEvent<Record<string, unknown>> | undefined;
      const detail = customEvt?.detail;

      if (detail && (detail.appointmentId || detail.queueNumber)) {
        const aptId = String(detail.appointmentId || '');
        const qNum = String(detail.queueNumber || '');
        const rawStatus = detail.status ? String(detail.status) : undefined;
        const actualStartedAt = detail.actualStartedAt ? String(detail.actualStartedAt) : undefined;
        const actualCompletedAt = detail.actualCompletedAt ? String(detail.actualCompletedAt) : undefined;

        setQueues((prev) =>
          prev.map((item) => {
            const matches =
              (aptId && (item.id === aptId || item.appointment_id === aptId)) ||
              (qNum && item.queue_number === qNum);

            if (!matches) return item;

            const nextStatusDesc = rawStatus
              ? AppointmentStatusDescriptor.from(rawStatus)
              : undefined;

            return {
              ...item,
              ...(nextStatusDesc && { status: nextStatusDesc.queueDisplayStatus }),
              ...(actualStartedAt !== undefined && { actual_started_at: actualStartedAt }),
              ...(actualCompletedAt !== undefined && { actual_completed_at: actualCompletedAt }),
              ...(nextStatusDesc?.queueDisplayStatus === 'DIPANGGIL' && !item.called_at && {
                called_at: actualStartedAt || new Date().toISOString(),
                called_time: new Date().toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              })
            };
          })
        );
      }

      void refreshQueues();
    };

    window.addEventListener('clinic:appointment_updated', handleUpdate as EventListener);
    window.addEventListener('clinic:notification_received', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('clinic:appointment_updated', handleUpdate as EventListener);
      window.removeEventListener('clinic:notification_received', handleUpdate as EventListener);
    };
  }, [refreshQueues]);

  const callPatient = useCallback(
    async (appointmentId: string) => {
      if (!appointmentId) return;
      setIsActionLoading(true);
      try {
        const res = (await callPatientQueue(appointmentId)) as {
          attemptNumber?: number;
          maxAttempts?: number;
        };
        const attempt = res?.attemptNumber ?? 1;
        toast.success(`Pasien berhasil dipanggil ke ruang periksa (Panggilan ${attempt}/3).`);
        await refreshQueues();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memanggil pasien';
        toast.error(msg);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshQueues]
  );

  const respondPatient = useCallback(
    async (appointmentId: string) => {
      if (!appointmentId) return;
      setIsActionLoading(true);
      try {
        await respondPatientQueue(appointmentId);
        toast.success('Pasien telah hadir. Pemeriksaan konsultasi dimulai.');
        await refreshQueues();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal konfirmasi kehadiran pasien';
        toast.error(msg);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshQueues]
  );

  const noShowPatient = useCallback(
    async (appointmentId: string) => {
      if (!appointmentId) return;
      setIsActionLoading(true);
      try {
        const res = (await noShowPatientQueue(appointmentId)) as {
          requeued?: boolean;
          noShow?: boolean;
          attemptNumber?: number;
          remainingAttempts?: number;
        };
        if (res?.requeued) {
          toast.warning(
            `Pasien tidak merespons (Panggilan ke-${res.attemptNumber || 1}). Antrean digeser 3 posisi ke belakang. Sisa kesempatan: ${res.remainingAttempts || 0} kali.`
          );
        } else if (res?.noShow) {
          toast.error(
            'Pasien tidak hadir setelah 3 kali panggilan. Status antrean dialihkan ke NO_SHOW secara permanen.'
          );
        } else {
          toast.info('Status panggilan pasien berhasil diperbarui.');
        }
        await refreshQueues();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memproses ketidakhadiran pasien';
        toast.error(msg);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshQueues]
  );

  const completePatient = useCallback(
    async (appointmentId: string) => {
      if (!appointmentId) return;
      setIsActionLoading(true);
      try {
        await completePatientQueue(appointmentId);
        toast.success('Pemeriksaan pasien selesai. Status antrean diperbarui.');
        await refreshQueues();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menyelesaikan pemeriksaan';
        toast.error(msg);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshQueues]
  );

  const currentCalling = useMemo(
    () => findCurrentCallingQueue(queues, activePoli),
    [queues, activePoli]
  );

  const waitingList = useMemo(
    () => filterWaitingQueues(queues, activePoli, searchQuery),
    [queues, activePoli, searchQuery]
  );

  const totalItems = waitingList.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedSeats = useMemo(
    () => paginateQueues(waitingList, currentPage, pageSize),
    [waitingList, currentPage, pageSize]
  );

  const poliStats = useMemo(
    () => buildQueuePoliStats(queues, activePoli, waitingList.length),
    [queues, activePoli, waitingList.length]
  );

  return {
    activePoli,
    searchQuery,
    currentPage,
    pageSize,
    pageCount,
    canPrevious: currentPage > 1,
    canNext: currentPage < pageCount,
    isLoading,
    currentCalling,
    waitingList,
    paginatedSeats,
    poliStats,
    poliList: QUEUE_POLI_LIST,
    totalItems,
    isActionLoading,
    actions: {
      changePoli: (poli) => {
        setActivePoli(poli);
        setSearchQuery('');
        setCurrentPage(1);
      },
      changeSearch: (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
      },
      changePageSize: (value) => {
        setPageSize(value);
        setCurrentPage(1);
      },
      previousPage: () => setCurrentPage((page) => Math.max(1, page - 1)),
      nextPage: () => setCurrentPage((page) => Math.min(pageCount, page + 1)),
      callPatient,
      respondPatient,
      noShowPatient,
      completePatient,
      refreshQueues
    }
  };
}
