export type TrendGranularity = 'Harian' | 'Mingguan' | 'Bulanan';

export interface DailyTrendPresentation {
  title: string;
  subtitle: string;
  domain: [number, number];
  ticks: number[];
  xAxisTicks: string[] | undefined;
}

export function getDailyTrendPresentation(granularity: TrendGranularity): DailyTrendPresentation {
  if (granularity === 'Bulanan') {
    return {
      title: 'Tren Pasien per Bulan',
      subtitle: 'Jumlah kunjungan dan pasien setiap bulan selama 1 tahun (2026).',
      domain: [0, 3500],
      ticks: [0, 700, 1400, 2100, 2800, 3500],
      xAxisTicks: undefined
    };
  }

  if (granularity === 'Mingguan') {
    return {
      title: 'Tren Pasien per Minggu',
      subtitle: 'Jumlah pasien per minggu selama periode 1 tahun.',
      domain: [0, 900],
      ticks: [0, 180, 360, 540, 720, 900],
      xAxisTicks: undefined
    };
  }

  return {
    title: 'Tren Pasien per Hari',
    subtitle: 'Jumlah pasien yang datang per hari selama periode pilihan.',
    domain: [0, 200],
    ticks: [0, 40, 80, 120, 160, 200],
    xAxisTicks: undefined
  };
}
