'use client';

import { AnimatePresence, motion } from 'motion/react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AttendanceSummaryCards } from './attendance-summary-cards';
import { AttendanceTrendChart } from './attendance-trend-chart';
import { AttendanceDistributionCard } from './attendance-distribution-card';
import { QRPresenceCard } from './qr-presence-card';
import { AttendanceTableCard } from './attendance-table-card';
import { AttendanceHeaderActions } from './attendance-export-button';
import { GenerateQRModal } from './generate-qr-modal';
import { ManualAttendanceModal } from './manual-attendance-modal';
import { Icons } from '@/components/icons';
import { useAttendanceDashboard } from '../model/useAttendanceDashboard';

export default function KehadiranPegawaiView() {
  const attendanceDashboard = useAttendanceDashboard();
  const { data } = attendanceDashboard;

  if (!data) {
    return (
      <PageContainer scrollable={false} pageTitle='Kehadiran Pegawai'>
        <div className='flex h-64 items-center justify-center'>
          <Icons.spinner className='size-8 animate-spin text-primary' />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col h-full min-h-0 font-sans select-none overflow-hidden'>
        <Tabs
          value={attendanceDashboard.activeTab}
          onValueChange={attendanceDashboard.actions.changeTab}
          className='flex flex-1 flex-col h-full min-h-0 gap-0 overflow-hidden'
        >
          {/* 1. Dynamic Collapsible Header & Accordion Banner */}
          <div
            onMouseEnter={attendanceDashboard.actions.handleHeaderMouseEnter}
            onMouseLeave={attendanceDashboard.actions.handleHeaderMouseLeave}
            className='shrink-0 select-none mb-2.5 pt-0.5'
          >
            {attendanceDashboard.isHeaderCollapsed ? (
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
                    <span>
                      {attendanceDashboard.activeTab === 'operational'
                        ? 'Operasional'
                        : 'Ringkasan'}
                    </span>
                  </span>
                </div>

                {/* Right: Explicit Bentangkan (Extend) Button */}
                <div className='flex items-center gap-2 shrink-0'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={attendanceDashboard.actions.expandHeader}
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
                      {attendanceDashboard.isQRVisible && (
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
                      activeTab={attendanceDashboard.activeTab}
                      data={data.records}
                      onOpenGenerateQR={attendanceDashboard.actions.openGenerateQR}
                      onOpenManualAttendance={attendanceDashboard.actions.openManualAttendance}
                      onRefresh={attendanceDashboard.actions.refreshData}
                      isQRVisible={attendanceDashboard.isQRVisible}
                    />

                    {attendanceDashboard.isQRVisible && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={attendanceDashboard.actions.collapseHeader}
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
                {attendanceDashboard.isQRVisible && (
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
                      onGenerateNewToken={attendanceDashboard.actions.refreshData}
                      onOpenManualAttendance={attendanceDashboard.actions.openManualAttendance}
                      onCloseCard={attendanceDashboard.actions.hideQR}
                      className='h-full overflow-y-auto'
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Column: Data Presensi Table with Bottom Viewport Pagination */}
              <div
                className={
                  attendanceDashboard.isQRVisible
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
                  params={attendanceDashboard.params}
                  onFilterChange={attendanceDashboard.actions.changeFilter}
                  onResetFilter={attendanceDashboard.actions.resetFilter}
                  className='h-full'
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Generate QR Modal */}
      <GenerateQRModal
        isOpen={attendanceDashboard.isGenerateQRModalOpen}
        onClose={attendanceDashboard.actions.closeGenerateQR}
        config={data.qrConfig}
        onActivated={attendanceDashboard.actions.activateQR}
      />

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={attendanceDashboard.isManualAttendanceModalOpen}
        onClose={attendanceDashboard.actions.closeManualAttendance}
      />
    </PageContainer>
  );
}
