'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { attendanceQueries } from '../api/queries';
import { AttendanceSummaryCards } from './attendance-summary-cards';
import { AttendanceTrendChart } from './attendance-trend-chart';
import { AttendanceDistributionCard } from './attendance-distribution-card';
import { QRPresenceCard } from './qr-presence-card';
import { AttendanceTableCard } from './attendance-table-card';
import { AttendanceHeaderActions } from './attendance-export-button';
import { GenerateQRModal } from './generate-qr-modal';
import { ManualAttendanceModal } from './manual-attendance-modal';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import type { AttendanceFilterParams } from '../api/types';

export default function KehadiranPegawaiView() {
  const [activeTab, setActiveTab] = useState('summary');

  const [params, setParams] = useState<AttendanceFilterParams>({
    date: '23/08/2026',
    shift: 'all',
    status: 'all',
    category: 'all',
    search: '',
    page: 1,
    limit: 8
  });

  const [isQRVisible, setIsQRVisible] = useState(false);
  const [isGenerateQRModalOpen, setIsGenerateQRModalOpen] = useState(false);
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState(false);

  const { data, refetch } = useQuery(attendanceQueries.list(params));

  if (!data) {
    return (
      <PageContainer scrollable={true} pageTitle='Kehadiran Pegawai'>
        <div className='flex h-64 items-center justify-center'>
          <Icons.spinner className='size-8 animate-spin text-primary' />
        </div>
      </PageContainer>
    );
  }

  const handleFilterChange = (newParams: Partial<AttendanceFilterParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleResetFilter = () => {
    setParams({
      date: '23/08/2026',
      shift: 'all',
      status: 'all',
      category: 'all',
      search: '',
      page: 1,
      limit: 8
    });
    toast.info('Filter presensi telah direset.');
  };

  const handleRefreshData = () => {
    refetch();
    toast.success('Data presensi berhasil diperbarui.');
  };

  const handleOpenGenerateQR = () => {
    setIsGenerateQRModalOpen(true);
  };

  const handleQRActivated = () => {
    setIsQRVisible(true);
    setActiveTab('operational'); // Auto-switch to operational tab so admin immediately sees QR code
    toast.success('Sesi presensi kehadiran dan QR Code berhasil diaktifkan.');
  };

  return (
    <PageContainer
      scrollable={true}
      pageTitle='Kehadiran Pegawai'
      pageDescription='Kelola dan pantau presensi kehadiran dokter dan staf secara real-time.'
      pageHeaderAction={
        <AttendanceHeaderActions
          activeTab={activeTab}
          data={data.records}
          onOpenGenerateQR={handleOpenGenerateQR}
          onOpenManualAttendance={() => setIsManualAttendanceModalOpen(true)}
          onRefresh={handleRefreshData}
          isQRVisible={isQRVisible}
        />
      }
    >
      <div className='space-y-4 font-sans pb-8 select-none'>
        {/* 1. Tab System (Mengikuti Paradigma Report Page) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-col gap-4'>
          <TabsList className='bg-muted/50 p-1 rounded-xl w-fit'>
            <TabsTrigger
              value='summary'
              className='rounded-lg text-xs font-semibold px-4 py-2 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs'
            >
              <Icons.barChart className='size-3.5 text-primary' />
              <span>Ringkasan</span>
            </TabsTrigger>
            <TabsTrigger
              value='operational'
              className='rounded-lg text-xs font-semibold px-4 py-2 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs'
            >
              <Icons.page className='size-3.5 text-primary' />
              <span>Operasional</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Ringkasan (Summary) - Dedicated khusus untuk KPI dan visualisasi analitik */}
          <TabsContent value='summary' className='space-y-4 focus-visible:outline-none'>
            {/* Top 4 KPI Summary Metric Cards with Wave Sparklines */}
            <AttendanceSummaryCards summary={data.summary} />

            {/* Visual Analytics Charts Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch'>
              <AttendanceTrendChart />
              <AttendanceDistributionCard />
            </div>
          </TabsContent>

          {/* Tab 2: Operasional (Operational) - Dedicated khusus untuk Data Tabel Presensi & QR Code Panel */}
          <TabsContent value='operational' className='space-y-4 focus-visible:outline-none'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch'>
              {/* Left Column: QR Presensi Slider */}
              <AnimatePresence mode='popLayout'>
                {isQRVisible && (
                  <motion.div
                    key='qr-presence-sidebar'
                    initial={{ opacity: 0, x: -40, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -40, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className='lg:col-span-4 xl:col-span-4 w-full h-full flex flex-col'
                  >
                    <QRPresenceCard
                      config={data.qrConfig}
                      onGenerateNewToken={() => refetch()}
                      onCloseCard={() => {
                        setIsQRVisible(false);
                        toast.info('Presensi QR code disembunyikan.');
                      }}
                      className='h-full'
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Column: Data Presensi Table (Harmonis dengan Data Pasien) */}
              <motion.div
                layout
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={
                  isQRVisible
                    ? 'lg:col-span-8 xl:col-span-8 w-full h-full flex flex-col'
                    : 'lg:col-span-12 xl:col-span-12 w-full h-full flex flex-col'
                }
              >
                <AttendanceTableCard
                  records={data.records}
                  total={data.total}
                  page={data.page}
                  limit={data.limit}
                  totalPages={data.totalPages}
                  params={params}
                  onFilterChange={handleFilterChange}
                  onResetFilter={handleResetFilter}
                  className='h-full'
                />
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Generate QR Modal */}
      <GenerateQRModal
        isOpen={isGenerateQRModalOpen}
        onClose={() => setIsGenerateQRModalOpen(false)}
        config={data.qrConfig}
        onActivated={handleQRActivated}
      />

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={isManualAttendanceModalOpen}
        onClose={() => setIsManualAttendanceModalOpen(false)}
      />
    </PageContainer>
  );
}
