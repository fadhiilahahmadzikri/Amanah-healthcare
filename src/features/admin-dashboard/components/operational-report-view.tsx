'use client';

import React, { useState } from 'react';
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
import { adminYearlyReport, getMonthReport } from '@/constants/mock-api-operational-report';
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
  const [selectedMonthKey, setSelectedMonthKey] = useState('2026-05');
  const data = getMonthReport(selectedMonthKey);

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
                className='h-9 text-xs font-medium gap-2 px-3.5 bg-card shadow-2xs border-border/70'
              >
                <Icons.calendar className='size-3.5 text-muted-foreground' />
                <span>
                  {data.period.start} - {data.period.end}
                </span>
                <Icons.chevronDown className='size-3.5 text-muted-foreground' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64 max-h-80 overflow-y-auto'>
              <div className='px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                Pilih Periode Bulan (Tahun 2026)
              </div>
              {adminYearlyReport.months.map((m) => (
                <DropdownMenuItem
                  key={m.monthKey}
                  onClick={() => setSelectedMonthKey(m.monthKey)}
                  className='text-xs font-medium flex items-center justify-between cursor-pointer'
                >
                  <span>{m.monthName}</span>
                  {selectedMonthKey === m.monthKey && (
                    <Icons.check className='size-3.5 text-primary' />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Download PDF Button */}
          <PDFDownloadButton
            document={<OperationalReportPDF data={data} />}
            fileName={`Laporan_Operasional_Klinik_${data.shortName}_2026.pdf`}
            buttonText='Download PDF'
            variant='default'
            size='default'
            className='h-9 text-xs font-semibold px-4 shadow-xs'
          />
        </div>
      }
    >
      <div className='space-y-4 font-sans pb-8'>
        {/* 1. Top 4 Metric KPI Cards with Wave Sparklines (Identical #2563eb Blue Wave Styling) */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Total Pasien */}
          <MetricChartCard
            title='Total Pasien'
            value={data.metrics.totalPatients.displayValue}
            description={`vs ${data.period.compareStart} - ${data.period.compareEnd}`}
            data={data.metrics.totalPatients.sparkline}
            trendLabel={`↑ ${data.metrics.totalPatients.changePercentage}%`}
            trendDirection='up'
            tone='primary'
            strokeColor='#2563eb'
            icon={<Icons.teams className='size-5 text-blue-600' />}
          />

          {/* Pasien Baru */}
          <MetricChartCard
            title='Pasien Baru'
            value={data.metrics.newPatients.displayValue}
            description={`vs ${data.period.compareStart} - ${data.period.compareEnd}`}
            data={data.metrics.newPatients.sparkline}
            trendLabel={`↑ ${data.metrics.newPatients.changePercentage}%`}
            trendDirection='up'
            tone='primary'
            strokeColor='#2563eb'
            icon={<Icons.user className='size-5 text-blue-600' />}
          />

          {/* Total Kunjungan */}
          <MetricChartCard
            title='Total Kunjungan'
            value={data.metrics.totalVisits.displayValue}
            description={`vs ${data.period.compareStart} - ${data.period.compareEnd}`}
            data={data.metrics.totalVisits.sparkline}
            trendLabel={`↑ ${data.metrics.totalVisits.changePercentage}%`}
            trendDirection='up'
            tone='primary'
            strokeColor='#2563eb'
            icon={<Icons.calendar className='size-5 text-blue-600' />}
          />

          {/* No Show Rate */}
          <MetricChartCard
            title='No Show Rate'
            value={data.metrics.noShowRate.displayValue}
            description={`vs ${data.period.compareStart} - ${data.period.compareEnd}`}
            data={data.metrics.noShowRate.sparkline}
            trendLabel={`↓ ${Math.abs(data.metrics.noShowRate.changePercentage)}%`}
            trendDirection='down'
            tone='primary'
            strokeColor='#2563eb'
            icon={<Icons.clock className='size-5 text-blue-600' />}
          />
        </div>

        {/* 2. Middle Section: Tren Pasien per Hari & Pasien Berdasarkan Layanan */}
        <div className='grid grid-cols-12 gap-4'>
          <DailyTrendChart monthKey={selectedMonthKey} />
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
    </PageContainer>
  );
}
