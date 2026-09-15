'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadStoredQueues, saveQueuesToStorage } from '../api/service';
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
  currentCalling?: QueueItem;
  waitingList: QueueItem[];
  paginatedSeats: QueueItem[];
  poliStats: QueuePoliStats;
  poliList: readonly string[];
  totalItems: number;
  actions: {
    changePoli: (poli: string) => void;
    changeSearch: (value: string) => void;
    changePageSize: (value: number) => void;
    previousPage: () => void;
    nextPage: () => void;
  };
}

export function useQueueView(): UseQueueViewResult {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activePoli, setActivePoli] = useState('Poli Umum');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setQueues(loadStoredQueues());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveQueuesToStorage(queues);
    }
  }, [queues, isInitialized]);

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
    currentCalling,
    waitingList,
    paginatedSeats,
    poliStats,
    poliList: QUEUE_POLI_LIST,
    totalItems,
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
      nextPage: () => setCurrentPage((page) => Math.min(pageCount, page + 1))
    }
  };
}
