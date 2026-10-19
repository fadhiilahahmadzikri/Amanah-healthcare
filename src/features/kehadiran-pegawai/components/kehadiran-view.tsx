'use client';

import { AnimatePresence, motion } from 'motion/react';
import PageContainer from '@/components/layout/page-container';
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
      <div className='flex flex-1 flex-col h-full min-h-0 font-sans select-none overflow-hidden gap-3'>
        {/* Header Section */}
        <div className='shrink-0 select-none pt-0.5'>
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
                data={data.records}
                onOpenGenerateQR={attendanceDashboard.actions.openGenerateQR}
                onOpenManualAttendance={attendanceDashboard.actions.openManualAttendance}
                onRefresh={attendanceDashboard.actions.refreshData}
                isQRVisible={attendanceDashboard.isQRVisible}
              />
            </div>
          </div>
        </div>

        {/* Main Unified Workspace Grid: QR Presensi Terminal Dock + Attendance Table */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 h-full overflow-hidden'>
          {/* Left Column: QR Presensi Dock */}
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
                  onGenerateNewToken={attendanceDashboard.actions.rotateQR}
                  onOpenManualAttendance={attendanceDashboard.actions.openManualAttendance}
                  onCloseCard={attendanceDashboard.actions.hideQR}
                  className='h-full overflow-y-auto'
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Column: Attendance Records Table */}
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
              availableFilters={data.availableFilters}
              className='h-full'
            />
          </div>
        </div>
      </div>

      {/* Generate QR Modal (Terminal Presensi Hub) */}
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
