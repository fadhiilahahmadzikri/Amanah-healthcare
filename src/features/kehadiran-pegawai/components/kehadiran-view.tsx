'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
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

  // Collapsible Header states when QR code is active
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isHeaderPinned, setIsHeaderPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isHeaderCollapsed = isQRVisible && !isHeaderHovered && !isHeaderPinned;

  const handleHeaderMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (isQRVisible) {
      setIsHeaderHovered(true);
    }
  };

  const handleHeaderMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHeaderHovered(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const { data, refetch } = useQuery(attendanceQueries.list(params));

  if (!data) {
    return (
      <PageContainer scrollable={false} pageTitle='Kehadiran Pegawai'>
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
    setIsHeaderPinned(false); // Default to collapsed for maximum spaciousness
    setActiveTab('operational'); // Auto-switch to operational tab so admin immediately sees QR code
    toast.success('Sesi presensi kehadiran dan QR Code berhasil diaktifkan.');
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col h-full min-h-0 font-sans select-none overflow-hidden'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex flex-1 flex-col h-full min-h-0 gap-0 overflow-hidden'
        >
          {/* 1. Dynamic Collapsible Header & Accordion Banner */}
          <div
            onMouseEnter={handleHeaderMouseEnter}
            onMouseLeave={handleHeaderMouseLeave}
            className='shrink-0 select-none mb-2.5 pt-0.5'
          >
            {isHeaderCollapsed ? (
              /* Collapsed Minimalist Strip Banner */
              <div className='flex items-center justify-between gap-3 py-1 animate-in fade-in duration-150'>
                {/* Left: Compact Title & Live State Badges */}
                <div className='flex items-center gap-2.5 flex-wrap min-w-0'>
                  <div className='flex items-center gap-2'>
                    <div className='size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                      <Icons.badgeCheck className='size-3.5' />
                    </div>
                    <h2 className='text-xs sm:text-sm font-bold text-foreground truncate'>
                      Kehadiran Pegawai
                    </h2>
                  </div>

                  <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'>
                    <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
                    <span>Sesi QR Aktif</span>
                  </span>

                  <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-muted text-muted-foreground border border-border/50'>
                    <Icons.page className='size-3 text-primary' />
                    <span>{activeTab === 'operational' ? 'Operasional' : 'Ringkasan'}</span>
                  </span>
                </div>

                {/* Right: Explicit Bentangkan (Extend) Button */}
                <div className='flex items-center gap-2 shrink-0'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setIsHeaderPinned(true)}
                    className='h-8 text-xs font-semibold px-3 rounded-lg border-border/70 bg-background hover:bg-muted text-foreground transition-all shadow-2xs gap-1.5 cursor-pointer'
                    title='Bentangkan Header (Extend)'
                  >
                    <span>Bentangkan</span>
                    <Icons.chevronDown className='size-3.5 text-muted-foreground' />
                  </Button>
                </div>
              </div>
            ) : (
              /* Fully Expanded Header with Title, Actions & Tabs */
              <div className='space-y-3 animate-in fade-in duration-150'>
                {/* Top Row: Title, Description & Action Buttons */}
                <div className='flex flex-wrap items-start justify-between gap-4'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
                        Kehadiran Pegawai
                      </h1>
                      {isQRVisible && (
                        <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'>
                          <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
                          <span>Sesi QR Aktif</span>
                        </span>
                      )}
                    </div>
                    <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
                      Kelola dan pantau presensi kehadiran dokter dan staf secara real-time.
                    </p>
                  </div>

                  <div className='flex items-center gap-2 flex-wrap'>
                    <AttendanceHeaderActions
                      activeTab={activeTab}
                      data={data.records}
                      onOpenGenerateQR={handleOpenGenerateQR}
                      onOpenManualAttendance={() => setIsManualAttendanceModalOpen(true)}
                      onRefresh={handleRefreshData}
                      isQRVisible={isQRVisible}
                    />

                    {isQRVisible && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setIsHeaderPinned(false);
                          setIsHeaderHovered(false);
                        }}
                        className='h-9 text-xs font-medium px-3 bg-background border-border/70 text-muted-foreground hover:text-foreground shadow-2xs gap-1.5 cursor-pointer'
                        title='Ciutkan Header (Collapse)'
                      >
                        <Icons.chevronUp className='size-3.5' />
                        <span>Ciutkan</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Tab Selector */}
                <div className='flex items-center justify-between pt-0.5'>
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
                </div>
              </div>
            )}
          </div>

          {/* Tab 1: Ringkasan (Summary) - Scrollable Content */}
          <TabsContent
            value='summary'
            className='flex-1 overflow-y-auto min-h-0 space-y-4 focus-visible:outline-none m-0 pr-1 pb-4'
          >
            {/* Top 4 KPI Summary Metric Cards with Wave Sparklines */}
            <AttendanceSummaryCards summary={data.summary} />

            {/* Visual Analytics Charts Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch'>
              <AttendanceTrendChart />
              <AttendanceDistributionCard />
            </div>
          </TabsContent>

          {/* Tab 2: Operasional (Operational) - Full Height Viewport Fixed Pagination */}
          <TabsContent
            value='operational'
            className='flex-1 flex flex-col min-h-0 h-full overflow-hidden focus-visible:outline-none m-0 pb-0'
          >
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 h-full overflow-hidden'>
              {/* Left Column: QR Presensi Slider */}
              <AnimatePresence mode='popLayout'>
                {isQRVisible && (
                  <motion.div
                    key='qr-presence-sidebar'
                    initial={{ opacity: 0, x: -40, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -40, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className='lg:col-span-4 xl:col-span-4 w-full h-full flex flex-col min-h-0 overflow-hidden'
                  >
                    <QRPresenceCard
                      config={data.qrConfig}
                      onGenerateNewToken={() => refetch()}
                      onOpenManualAttendance={() => setIsManualAttendanceModalOpen(true)}
                      onCloseCard={() => {
                        setIsQRVisible(false);
                        setIsHeaderPinned(false);
                        setIsHeaderHovered(false);
                        toast.info('Presensi QR code disembunyikan.');
                      }}
                      className='h-full overflow-y-auto'
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Column: Data Presensi Table with Bottom Viewport Pagination */}
              <div
                className={
                  isQRVisible
                    ? 'lg:col-span-8 xl:col-span-8 w-full h-full flex flex-col min-h-0 overflow-hidden transition-all duration-300'
                    : 'lg:col-span-12 xl:col-span-12 w-full h-full flex flex-col min-h-0 overflow-hidden transition-all duration-300'
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
              </div>
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
