'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import PageContainer from '@/components/layout/page-container';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useSidebar } from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { FacetSidebarSheet } from '@/shared/ui/responsive-facet-toolbox';
import { QRPresenceCard } from './qr-presence-card';
import { AttendanceTableCard } from './attendance-table-card';
import { AttendanceHeaderActions } from './attendance-export-button';
import { AttendanceQrMobileModal } from './attendance-qr-mobile-modal';
import { ManualAttendanceModal } from './manual-attendance-modal';
import { useAttendanceDashboard } from '../model/useAttendanceDashboard';

export default function KehadiranPegawaiView() {
  const attendanceDashboard = useAttendanceDashboard();
  const { data, qrController, filterState, dynamicOptions, searchEngine, actions } =
    attendanceDashboard;
  const [isFacetSheetOpen, setIsFacetSheetOpen] = useState(false);

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  const isDesktopQRVisible = !isMobile && qrController.isQRVisible;

  // Responsively triggers facet sidebar mode (Sheet on right):
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. When QR terminal dock is open (isDesktopQRVisible)
  // 3. When app sidebar is expanded on standard desktop viewports <= 1280px (isSidebarExpanded)
  // 4. Combo mode (both QR terminal dock & expanded sidebar active)
  const isCompact = [
    isMobile,
    isUnder1024,
    isDesktopQRVisible,
    isUnder1280 && isSidebarExpanded
  ].some(Boolean);

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
              <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
                Kehadiran Pegawai
              </h1>
              <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
                Kelola dan pantau presensi kehadiran dokter dan staf secara real-time.
              </p>
            </div>

            <div className='flex items-center gap-2 flex-wrap w-full sm:w-auto'>
              <AttendanceHeaderActions
                data={data.records}
                onToggleQR={() => qrController.toggleQR(isMobile)}
                onOpenManualAttendance={actions.openManualAttendance}
                onRefresh={actions.refreshData}
                isQRVisible={isMobile ? qrController.isMobileModalOpen : qrController.isQRVisible}
                isCompact={isCompact}
                onOpenSearch={searchEngine.open}
                isSearchActive={Boolean(filterState.params.search)}
                onOpenFilter={() => setIsFacetSheetOpen(true)}
                onResetFilter={filterState.resetFilter}
                activeFilterCount={filterState.activeFilterCount}
              />
            </div>
          </div>
        </div>

        {/* Main Workspace Grid: QR Presensi Terminal Dock + Attendance Table */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 h-full overflow-hidden'>
          {/* Left Column: QR Presensi Dock (Desktop only when visible) */}
          <AnimatePresence mode='popLayout'>
            {isDesktopQRVisible && (
              <motion.div
                key='qr-presence-sidebar'
                initial={{ opacity: 0, x: -30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className='lg:col-span-4 xl:col-span-4 w-full h-full flex flex-col min-h-0 overflow-hidden'
              >
                <QRPresenceCard
                  config={data.qrConfig}
                  onGenerateNewToken={qrController.rotateQR}
                  onOpenManualAttendance={actions.openManualAttendance}
                  onCloseCard={() => qrController.closeQR(false)}
                  className='h-full'
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Column: Attendance Records Table */}
          <div
            className={
              isDesktopQRVisible
                ? 'lg:col-span-8 xl:col-span-8 w-full h-full flex flex-col min-h-0 overflow-hidden transition-all duration-300'
                : 'lg:col-span-12 xl:col-span-12 w-full h-full flex flex-col min-h-0 overflow-hidden transition-all duration-300'
            }
          >
            <AttendanceTableCard
              records={data.records}
              total={data.total}
              filterState={filterState}
              dynamicOptions={dynamicOptions}
              searchEngine={searchEngine}
              isCompact={isCompact}
              className='h-full'
            />
          </div>
        </div>
      </div>

      {/* Mobile QR Presence Modal (Full-Screen on Mobile) */}
      <AttendanceQrMobileModal
        isOpen={qrController.isMobileModalOpen}
        onClose={() => qrController.closeQR(true)}
        config={data.qrConfig}
        onGenerateNewToken={qrController.rotateQR}
        onOpenManualAttendance={actions.openManualAttendance}
      />

      {/* Facet Sidebar Sheet (Dibuka dari Tombol Filter Header di Mode Compact) */}
      <FacetSidebarSheet
        isOpen={isFacetSheetOpen}
        onClose={() => setIsFacetSheetOpen(false)}
        dateFilter={{
          label: 'Tanggal',
          selectedDate: filterState.dateFilterObj,
          onSelectDate: filterState.setDateFilterObj,
          resetLabel: 'Hari Ini'
        }}
        facets={dynamicOptions.facetGroups}
        isFiltered={filterState.isFiltered}
        onResetAll={filterState.resetFilter}
        activeCount={filterState.activeFilterCount}
      />

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={attendanceDashboard.isManualAttendanceModalOpen}
        onClose={actions.closeManualAttendance}
      />
    </PageContainer>
  );
}
