'use client';

import { useEffect, useState } from 'react';
import { QUEUE_STATUS } from '../api/types';
import {
  computeConsultationElapsedSeconds,
  formatConsultationTimer,
  isConsultationOvertime
} from '../utils/queue-timer.utils';

export interface UseConsultationTimerParams {
  startedAt?: string | null;
  completedAt?: string | null;
  status?: string;
  policyMinutes?: number;
}

export interface UseConsultationTimerResult {
  elapsedSeconds: number;
  formattedDuration: string;
  isOvertime: boolean;
  isRunning: boolean;
}

export function useConsultationTimer({
  startedAt,
  completedAt,
  status,
  policyMinutes
}: UseConsultationTimerParams): UseConsultationTimerResult {
  const isFinished = status === QUEUE_STATUS.COMPLETED || Boolean(completedAt);
  const isActive = status === QUEUE_STATUS.IN_SERVICE && Boolean(startedAt) && !isFinished;

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!isActive || !startedAt) return;

    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startedAt]);

  if (!startedAt) {
    return {
      elapsedSeconds: 0,
      formattedDuration: '-',
      isOvertime: false,
      isRunning: false
    };
  }

  const elapsedSeconds = computeConsultationElapsedSeconds(
    startedAt,
    isFinished ? completedAt : null,
    now
  );
  const isOvertime = isConsultationOvertime(elapsedSeconds, policyMinutes);
  const formattedDuration = formatConsultationTimer(elapsedSeconds);

  return {
    elapsedSeconds,
    formattedDuration,
    isOvertime,
    isRunning: isActive
  };
}
