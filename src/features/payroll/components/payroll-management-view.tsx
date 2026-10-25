'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { usePayrollPresenter } from '../model/usePayrollPresenter';
import { usePayrollTable } from '../model/usePayrollTable';
import { usePayrollDynamicOptions } from '../model/usePayrollDynamicOptions';
import { getPayrollColumns } from './payroll-tables/columns';
import { PayrollExportButton } from './payroll-export-button';
import { PayrollSettingsButton } from './payroll-settings-button';
import { PayrollTable } from './payroll-tables';
import { PayrollMobileCards } from './payroll-mobile-cards';
import { PayrollOverviewStats } from './payroll-overview-stats';
import { PayrollSlipDetailModal } from './payroll-slip-detail-modal';
import { PayrollCalculateModal } from './payroll-calculate-modal';
import { PayrollRatesConfigModal } from './payroll-rates-config-modal';
import { PayrollAuditMutationModal } from './payroll-audit-mutation-modal';
import { PayrollReconcileLeaveModal } from './payroll-reconcile-leave-modal';

export function PayrollManagementView() {
  const presenter = usePayrollPresenter();
  const { payrollView, modals, mutations, actions, report } = presenter;

  const isCalculated = payrollView.currentPeriod?.status === 'calculated';
  const isFinalized = payrollView.currentPeriod?.status === 'finalized';
  const isCalculatedOrFinalized = isCalculated || isFinalized;

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  // Canonical responsive breakpoint formula from Kehadiran Pegawai:
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. Expanded sidebar collisions on standard viewports (<= 1280px)
  const isCompact = isMobile || isUnder1024 || (isUnder1280 && isSidebarExpanded);

  const { facetGroups, activeFilterCount, searchEngine } = usePayrollDynamicOptions({
    payrollView
  });

  // Memoized TanStack Columns
  const columns = useMemo(() => getPayrollColumns(), []);

  // TanStack Table Instance
  const { table } = usePayrollTable({
    data: payrollView.filteredSummaries,
    columns,
    onSelectStaff: payrollView.actions.openDetail,
    onGenerateReport: report.generateReport,
    isCalculatedOrFinalized,
    exportingStaffId: report.exportingStaffId
  });

  return (
    <>
      {/* Centralized Search Engine Modal */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* 1. Modal Detail Slip Gaji Staf (Wide ModalWrapper max-w-5xl) */}
      <PayrollSlipDetailModal
        isOpen={payrollView.isDetailOpen}
        onClose={payrollView.actions.closeDetail}
        staffSummary={payrollView.selectedStaff}
        period={payrollView.currentPeriod}
      />

      {/* 2. Modal Kalkulasi Payroll Periode Baru */}
      <PayrollCalculateModal
        isOpen={modals.isCalculateOpen}
        onClose={actions.closeCalculate}
        onSuccess={actions.onCalculateSuccess}
      />

      {/* 3. Modal Konfigurasi Standar Tarif Payroll (Wide ModalWrapper max-w-5xl) */}
      <PayrollRatesConfigModal isOpen={modals.isRatesOpen} onClose={actions.closeRates} />

      {/* 4. Modal Audit Mutasi Periode (Wide ModalWrapper max-w-6xl) */}
      <PayrollAuditMutationModal
        isOpen={modals.isAuditOpen}
        onClose={actions.closeAudit}
        period={payrollView.currentPeriod}
        summaries={payrollView.summaries}
      />

      {/* 5. Modal Rekonsiliasi Cuti Harian Staf (Wide ModalWrapper max-w-3xl) */}
      <PayrollReconcileLeaveModal
        isOpen={modals.isReconcileOpen}
        onClose={actions.closeReconcile}
        onReconcile={actions.reconcileDailyLeave}
        isReconciling={mutations.isReconciling}
        period={payrollView.currentPeriod}
      />

      {/* 6. Dialog Konfirmasi Tutup Buku Periode */}
      <AlertDialog
        open={modals.isConfirmFinalizeOpen}
        onOpenChange={(isOpen) => !isOpen && actions.closeConfirmFinalize()}
      >
        <AlertDialogContent className='max-w-md rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-base font-bold'>
              Tutup Buku Periode Penggajian?
            </AlertDialogTitle>
            <AlertDialogDescription className='text-xs text-muted-foreground mt-2 leading-relaxed'>
              Setelah periode <strong>&quot;{payrollView.currentPeriod?.periodName}&quot;</strong>{' '}
              resmi ditutup buku (<strong>FINALIZED</strong>), seluruh nominal mutasi, jam kerja,
              dan slip gaji staf akan dikunci permanen.
              <br />
              <br />
              <span className='font-semibold text-foreground'>Integritas Akuntansi:</span> Periode
              ini tidak akan dapat dikalkulasi ulang dan tidak akan terpengaruh jika tarif
              kompensasi diubah di masa mendatang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 mt-2'>
            <AlertDialogCancel className='text-xs h-8.5 px-3 text-muted-foreground hover:text-foreground font-semibold'>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.confirmFinalizePeriod}
              disabled={mutations.isFinalizing}
              className='text-xs h-8.5 px-3.5 font-medium'
            >
              {mutations.isFinalizing ? 'Memproses...' : 'Konfirmasi Tutup Buku'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main View Shell */}
      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5 select-none'>
        {/* ROW 1 (Toolbox Bar): Unified Master Responsive Facet Toolbox */}
        <ResponsiveFacetToolbox
          searchQuery={payrollView.searchQuery}
          onSearchChange={payrollView.actions.changeSearch}
          searchPlaceholder='Pencarian Karyawan...'
          onOpenSearchDialog={searchEngine.open}
          facets={facetGroups}
          isFiltered={payrollView.hasActiveFilters}
          onResetAll={() => {
            searchEngine.clearQuery();
            payrollView.actions.resetFilters();
          }}
          activeFilterCount={activeFilterCount}
          isCompact={isCompact}
          actionsSlot={
            <Button
              onClick={actions.openCalculate}
              size={isCompact ? 'icon' : 'sm'}
              className={cn(
                isCompact
                  ? 'size-8 rounded-md shrink-0 cursor-pointer'
                  : 'h-8 text-xs font-medium gap-1.5 shrink-0 cursor-pointer'
              )}
              title='Kalkulasi Periode Baru'
              aria-label='Kalkulasi Baru'
            >
              <Icons.plus className={cn(isCompact ? 'size-3.5' : 'size-3.5 mr-0.5')} />
              {!isCompact && <span>Kalkulasi Baru</span>}
            </Button>
          }
          extraRightSlot={
            <div className='flex items-center gap-1.5 shrink-0'>
              {/* Morphed Settings Button placed immediately to the left of Export */}
              <PayrollSettingsButton
                onOpenRates={actions.openRates}
                onReconcileDailyLeave={actions.openReconcile}
                onOpenAudit={actions.openAudit}
                onOpenConfirmFinalize={actions.openConfirmFinalize}
                canFinalize={isCalculated}
                isFinalizing={mutations.isFinalizing}
                isReconciling={mutations.isReconciling}
                disabled={payrollView.isLoading}
                forceMode={isCompact ? 'drawer' : undefined}
                className={isCompact ? 'size-8 rounded-md' : 'size-8'}
              />

              {/* Export Button anchored to the far right */}
              <PayrollExportButton
                data={payrollView.filteredSummaries}
                periodName={payrollView.currentPeriod?.periodName}
                variant={isCompact ? 'icon' : 'full'}
                className={isCompact ? 'size-8 rounded-md' : undefined}
              />
            </div>
          }
        />

        {/* ROW 2 (Main Content Split): Table di Kiri & KPI Vertikal di Kanan */}
        <div className='flex flex-1 min-h-0 gap-4 overflow-hidden'>
          {/* Kolom Kiri: Tabel Data (Desktop) / Kartu Staf (Mobile) */}
          <div className='flex flex-1 min-h-0 flex-col overflow-hidden'>
            {/* Desktop View: TanStack DataTable */}
            <div className='hidden md:flex min-h-0 flex-1 flex-col overflow-hidden'>
              <PayrollTable
                table={table}
                isLoading={payrollView.isLoading}
                hasFilters={payrollView.hasActiveFilters}
                onSelectStaff={payrollView.actions.openDetail}
                onResetFilters={payrollView.actions.resetFilters}
              />
            </div>

            {/* Mobile View: Minimalist Surface Cards */}
            <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
              <PayrollMobileCards
                summaries={payrollView.filteredSummaries}
                hasFilters={payrollView.hasActiveFilters}
                onSelectStaff={payrollView.actions.openDetail}
                onGenerateReport={report.generateReport}
                isCalculatedOrFinalized={isCalculatedOrFinalized}
                exportingStaffId={report.exportingStaffId}
                isLoading={payrollView.isLoading}
              />
            </div>
          </div>

          {/* Kolom Kanan: 4 Kartu KPI Disusun Vertikal (Desktop Only sesuai wireframe) */}
          <div className='hidden lg:flex w-72 xl:w-80 flex-col gap-3.5 shrink-0 overflow-y-auto pr-1'>
            <PayrollOverviewStats
              period={payrollView.currentPeriod}
              summaries={payrollView.summaries}
              layout='vertical'
            />
          </div>
        </div>
      </div>
    </>
  );
}
