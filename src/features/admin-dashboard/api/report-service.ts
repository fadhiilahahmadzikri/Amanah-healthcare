import type { MonthReportData, OperationalMetric, OperationalSummary } from '../types';

type TrendGranularity = 'Harian' | 'Mingguan' | 'Bulanan';

function createEmptyMetric(): OperationalMetric {
  return {
    value: 0,
    displayValue: '0',
    changePercentage: 0,
    sparkline: []
  };
}

export const adminReportPeriods: MonthReportData[] = [];

export const defaultMonthKey = '';

export const emptyOperationalReport: OperationalSummary = {
  monthKey: '',
  monthName: '',
  shortName: '',
  period: {
    start: '',
    end: '',
    compareStart: '',
    compareEnd: ''
  },
  metrics: {
    totalPatients: createEmptyMetric(),
    newPatients: createEmptyMetric(),
    totalVisits: createEmptyMetric(),
    noShowRate: createEmptyMetric()
  },
  dailyTrend: [],
  servicesDistribution: [],
  topDoctors: [],
  rescheduleStats: {
    totalReschedule: 0,
    patientsCount: 0,
    topDoctor: '',
    topService: '',
    topReason: '',
    topReasonPercentage: 0
  },
  staffAttendance: [],
  topOrderedServices: []
};

export function getMonthReport(monthKey: string = defaultMonthKey): MonthReportData {
  return (
    adminReportPeriods.find((report) => report.monthKey === monthKey) || emptyOperationalReport
  );
}

export function getTrendData(
  granularity: TrendGranularity,
  monthKey: string = defaultMonthKey
): MonthReportData['dailyTrend'] {
  void granularity;
  return getMonthReport(monthKey).dailyTrend;
}

export const operationalReportData: OperationalSummary = getMonthReport();
