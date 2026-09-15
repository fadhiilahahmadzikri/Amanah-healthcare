'use client';

import { useState } from 'react';
import { adminReportPeriods, defaultMonthKey, getMonthReport } from '../api/report-service';
import type { MonthReportData } from '../types';

interface UseOperationalReportResult {
  data: MonthReportData;
  reportPeriods: MonthReportData[];
  selectedMonthKey: string;
  hasReportPeriods: boolean;
  actions: {
    changeMonth: (monthKey: string) => void;
  };
}

export function useOperationalReport(): UseOperationalReportResult {
  const [selectedMonthKey, setSelectedMonthKey] = useState(defaultMonthKey);

  return {
    data: getMonthReport(selectedMonthKey),
    reportPeriods: adminReportPeriods,
    selectedMonthKey,
    hasReportPeriods: adminReportPeriods.length > 0,
    actions: {
      changeMonth: setSelectedMonthKey
    }
  };
}
