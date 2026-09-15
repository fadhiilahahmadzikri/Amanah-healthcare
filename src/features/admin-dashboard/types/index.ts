export interface OperationalMetric {
  value: number;
  displayValue: string;
  changePercentage: number;
  sparkline: { label: string; value: number }[];
}

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
    totalPatients: OperationalMetric;
    newPatients: OperationalMetric;
    totalVisits: OperationalMetric;
    noShowRate: OperationalMetric;
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
