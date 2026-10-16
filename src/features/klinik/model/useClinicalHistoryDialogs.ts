'use client';

import { useState, useCallback } from 'react';
import type { ClinicalHistoryTabType } from '../api/history-queries';

export interface UseClinicalHistoryDialogsResult {
  isOpen: boolean;
  recordType: ClinicalHistoryTabType | null;
  recordId: string | null;
  actions: {
    openDetail: (type: ClinicalHistoryTabType, id: string) => void;
    closeDetail: () => void;
  };
}

export function useClinicalHistoryDialogs(): UseClinicalHistoryDialogsResult {
  const [recordType, setRecordType] = useState<ClinicalHistoryTabType | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);

  const openDetail = useCallback((type: ClinicalHistoryTabType, id: string) => {
    setRecordType(type);
    setRecordId(id);
  }, []);

  const closeDetail = useCallback(() => {
    setRecordType(null);
    setRecordId(null);
  }, []);

  return {
    isOpen: Boolean(recordId && recordType),
    recordType,
    recordId,
    actions: {
      openDetail,
      closeDetail
    }
  };
}
