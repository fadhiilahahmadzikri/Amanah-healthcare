'use client';

import dynamic from 'next/dynamic';
import PageContainer from '@/components/layout/page-container';
import { MetricChartCard } from '@/components/charts/metric-chart-card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { useOperationalReport } from '../model/useOperationalReport';
import { DailyTrendChart } from './daily-trend-chart';
import { ServiceDistributionChart } from './service-distribution-chart';
import { TopDoctorsCard } from './top-doctors-card';
import { RescheduleSummaryCard } from './reschedule-summary-card';
import { StaffAttendanceCard } from './staff-attendance-card';
import { TopServicesTable } from './top-services-table';
import { OperationalReportPDF } from './operational-report-pdf';

const PDFDownloadButton = dynamic(() => import('@/components/pdf/pdf-download-button'), {
  ssr: false
});

export default function OperationalReportView() {
  const report = useOperationalReport();
  const { data } = report;
  const periodLabel =
    data.period.start && data.period.end
      ? `${data.period.start} - ${data.period.end}`
      : 'Belum ada periode';
  const comparisonLabel =
    data.period.compareStart && data.period.compareEnd
      ? `vs ${data.period.compareStart} - ${data.period.compareEnd}`
      : 'Belum ada data pembanding';

  return (
    <PageContainer
      scrollable={true}
      pageTitle='Laporan Operational Klinik'
      pageDescription='Ringkasan performa operasional klinik dalam periode yang dipilih.'
      pageHeaderAction={
        <div className='flex flex-wrap items-center gap-2.5'>
          {/* 1. Date Range Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='default'
                disabled={!report.hasReportPeriods}
                className='h-9 text-xs font-medium gap-2 px-3.5 bg-card shadow-2xs border-border/70'
              >
                <Icons.calendar className='size-3.5 text-muted-foreground' />
                <span>{periodLabel}</span>
                <Icons.chevronDown className='size-3.5 text-muted-foreground' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64 max-h-80 overflow-y-auto'>
              <div className='px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                Pilih Periode Bulan
              </div>
              {report.reportPeriods.map((m) => (
                <DropdownMenuItem
                  key={m.monthKey}
                  onClick={() => report.actions.changeMonth(m.monthKey)}
                  className='text-xs font-medium flex items-center justify-between cursor-pointer'
                >
                  <span>{m.monthName}</span>
                  {report.selectedMonthKey === m.monthKey && (
                    <Icons.check className='size-3.5 text-primary' />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Download PDF Button */}
          {report.hasReportPeriods ? (
            <PDFDownloadButton
              document={<OperationalReportPDF data={data} />}
              fileName={`Laporan_Operasional_Klinik_${data.shortName}.pdf`}
              buttonText='Download PDF'
              variant='default'
              size='default'
              className='h-9 text-xs font-semibold px-4 shadow-xs'
            />
          ) : null}
        </div>
      }
    >
      {!report.hasReportPeriods ? (
        <EmptyState
          icon={Icons.barChart}
          title='Belum Ada Laporan Operasional'
          description='Data rekapitulasi operasional klinik untuk periode ini belum tersedia.'
          className='min-h-[420px]'
        />
      ) : (
        <div className='space-y-4 font-sans pb-8'>
          {/* 1. Top 4 Metric KPI Cards with Wave Sparklines */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Total Pasien */}
            <MetricChartCard
              title='Total Pasien'
              value={data.metrics.totalPatients.displayValue}
              description={comparisonLabel}
              data={data.metrics.totalPatients.sparkline}
              trendLabel={`↑ ${data.metrics.totalPatients.changePercentage}%`}
              trendDirection='up'
              tone='primary'
              icon={<Icons.teams className='size-5 text-chart-1' />}
            />

            {/* Pasien Baru */}
            <MetricChartCard
              title='Pasien Baru'
              value={data.metrics.newPatients.displayValue}
              description={comparisonLabel}
              data={data.metrics.newPatients.sparkline}
              trendLabel={`↑ ${data.metrics.newPatients.changePercentage}%`}
              trendDirection='up'
              tone='success'
              icon={<Icons.user className='size-5 text-chart-2' />}
            />

            {/* Total Kunjungan */}
            <MetricChartCard
              title='Total Kunjungan'
              value={data.metrics.totalVisits.displayValue}
              description={comparisonLabel}
              data={data.metrics.totalVisits.sparkline}
              trendLabel={`↑ ${data.metrics.totalVisits.changePercentage}%`}
              trendDirection='up'
              tone='info'
              icon={<Icons.calendar className='size-5 text-chart-3' />}
            />

            {/* No Show Rate */}
            <MetricChartCard
              title='No Show Rate'
              value={data.metrics.noShowRate.displayValue}
              description={comparisonLabel}
              data={data.metrics.noShowRate.sparkline}
              trendLabel={`↓ ${Math.abs(data.metrics.noShowRate.changePercentage)}%`}
              trendDirection='down'
              tone='warning'
              icon={<Icons.clock className='size-5 text-chart-4' />}
            />
          </div>

          {/* 2. Middle Section: Tren Pasien per Hari & Pasien Berdasarkan Layanan */}
          <div className='grid grid-cols-12 gap-4'>
            <DailyTrendChart monthKey={report.selectedMonthKey} />
            <ServiceDistributionChart
              data={data.servicesDistribution}
              totalPatients={data.metrics.totalPatients.value}
            />
          </div>

          {/* 3. Bottom Grid: Top Dokter, Reschedule, Kehadiran Staff */}
          <div className='grid grid-cols-12 gap-4'>
            <TopDoctorsCard doctors={data.topDoctors} />
            <RescheduleSummaryCard data={data.rescheduleStats} />
            <StaffAttendanceCard data={data.staffAttendance} />
          </div>

          {/* 4. Bottom Table: Top Layanan yang Dipesan */}
          <div className='grid grid-cols-12 gap-4'>
            <TopServicesTable data={data.topOrderedServices} />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
