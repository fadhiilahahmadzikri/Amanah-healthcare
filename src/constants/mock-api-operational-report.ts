import yearlyData from './mock-data/admin-dashboard-yearly.json';

export interface MonthReportData {
  monthKey: string;
  monthName: string;
  shortName: string;
  period: {
    start: string;
    end: string;
    compareStart: string;
    compareEnd: string;
  };
  metrics: {
    totalPatients: {
      value: number;
      displayValue: string;
      changePercentage: number;
      sparkline: { label: string; value: number }[];
    };
    newPatients: {
      value: number;
      displayValue: string;
      changePercentage: number;
      sparkline: { label: string; value: number }[];
    };
    totalVisits: {
      value: number;
      displayValue: string;
      changePercentage: number;
      sparkline: { label: string; value: number }[];
    };
    noShowRate: {
      value: number;
      displayValue: string;
      changePercentage: number;
      sparkline: { label: string; value: number }[];
    };
  };
  dailyTrend: {
    date: string;
    dayNumber: number;
    dayLabel: string;
    patients: number;
  }[];
  servicesDistribution: {
    serviceName: string;
    patientsCount: number;
    percentage: number;
    color: string;
  }[];
  topDoctors: {
    id: number;
    name: string;
    specialty: string;
    totalPatients: number;
    avatar: string;
  }[];
  rescheduleStats: {
    totalReschedule: number;
    patientsCount: number;
    topDoctor: string;
    topService: string;
    topReason: string;
    topReasonPercentage: number;
  };
  staffAttendance: {
    status: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  topOrderedServices: {
    id: number;
    serviceName: string;
    totalOrders: number;
    percentage: number;
    trendPercentage: number;
    trendDirection: string;
    sparkline: number[];
  }[];
}

export type OperationalSummary = MonthReportData;

export const adminYearlyReport = yearlyData;

export const defaultMonthKey = '2026-05';

export function getMonthReport(monthKey: string = defaultMonthKey): MonthReportData {
  const found = yearlyData.months.find((m) => m.monthKey === monthKey);
  return (found || yearlyData.months[4]) as unknown as MonthReportData;
}

export function getTrendData(
  granularity: 'Harian' | 'Mingguan' | 'Bulanan',
  monthKey: string = defaultMonthKey
) {
  if (granularity === 'Bulanan') {
    return yearlyData.monthlyTrend.map((m) => ({
      dayLabel: m.label,
      patients: m.patients
    }));
  }

  if (granularity === 'Mingguan') {
    return yearlyData.weeklyTrend.map((w) => ({
      dayLabel: w.label,
      patients: w.patients
    }));
  }

  // Harian: returns daily points for selected month
  const monthData = getMonthReport(monthKey);
  return monthData.dailyTrend;
}

export const operationalReportData: OperationalSummary = getMonthReport('2026-05');
