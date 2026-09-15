'use client';

import { useMemo, useState } from 'react';
import { defaultMonthKey, getTrendData } from '../api/report-service';
import type { MonthReportData } from '../types';
import {
  type DailyTrendPresentation,
  type TrendGranularity,
  getDailyTrendPresentation
} from './dailyTrendViewModel';

export interface UseDailyTrendChartResult extends DailyTrendPresentation {
  chartData: MonthReportData['dailyTrend'];
  granularity: TrendGranularity;
  actions: {
    changeGranularity: (granularity: TrendGranularity) => void;
  };
}

export function useDailyTrendChart(monthKey?: string): UseDailyTrendChartResult {
  const [granularity, setGranularity] = useState<TrendGranularity>('Harian');
  const activeMonthKey = monthKey ?? defaultMonthKey;

  const chartData = useMemo(
    () => getTrendData(granularity, activeMonthKey),
    [activeMonthKey, granularity]
  );

  const presentation = useMemo(() => getDailyTrendPresentation(granularity), [granularity]);

  return {
    ...presentation,
    chartData,
    granularity,
    actions: {
      changeGranularity: setGranularity
    }
  };
}
