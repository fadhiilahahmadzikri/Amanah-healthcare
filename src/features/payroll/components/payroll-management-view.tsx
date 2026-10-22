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
import { usePayrollPresenter } from '../model/usePayrollPresenter';
import { usePayrollTable } from '../model/usePayrollTable';
import { getPayrollColumns } from './payroll-tables/columns';
import { PayrollFilters } from './payroll-filters';
import { PayrollExportButton } from './payroll-export-button';
import { PayrollSettingsButton } from './payroll-settings-button';
import { PayrollMobileFilterToolbar } from './payroll-mobile-filter-toolbar';
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
            <div className='flex items-center gap-2.5'>
              <div className='size-9 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0'>
                <Icons.lock className='size-5' />
              </div>
              <AlertDialogTitle className='text-base font-bold'>
                Tutup Buku Periode Penggajian?
              </AlertDialogTitle>
            </div>
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
              className='text-xs h-8.5 px-3.5 font-medium gap-1.5'
            >
              <Icons.checks className='size-3.5' />
              {mutations.isFinalizing ? 'Memproses...' : 'Konfirmasi Tutup Buku'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main View Shell */}
      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5 select-none'>
        {/* ROW 1 (Toolbox Bar): Desktop Toolbar Row */}
        <div className='hidden md:flex items-center justify-between gap-3 shrink-0'>
          <PayrollFilters
            searchQuery={payrollView.searchQuery}
            onSearchChange={payrollView.actions.changeSearch}
            selectedPeriodId={payrollView.selectedPeriodId}
            onPeriodChange={payrollView.actions.changePeriod}
            periods={payrollView.periods}
            selectedCategory={payrollView.selectedCategory}
            onCategoryChange={payrollView.actions.changeCategory}
            selectedStatus={payrollView.selectedStatus}
            onStatusChange={payrollView.actions.changeStatus}
            onResetAll={payrollView.actions.resetFilters}
            filterOptions={payrollView.filterOptions}
            className='flex-1'
          />

          <div className='flex items-center gap-2 shrink-0'>
            {/* Primary Action: Kalkulasi Periode */}
            <Button onClick={actions.openCalculate} size='sm' className='h-9 gap-1.5'>
              <Icons.plus className='h-4 w-4' />
              Kalkulasi Baru
            </Button>

            {/* Export Action (Rekap CSV) */}
            <PayrollExportButton
              data={payrollView.filteredSummaries}
              periodName={payrollView.currentPeriod?.periodName}
            />

            {/* Morphed Settings Button (Dropdown on desktop, Drawer on mobile) */}
            <PayrollSettingsButton
              onOpenRates={actions.openRates}
              onReconcileDailyLeave={actions.openReconcile}
              onOpenAudit={actions.openAudit}
              onOpenConfirmFinalize={actions.openConfirmFinalize}
              canFinalize={isCalculated}
              isFinalizing={mutations.isFinalizing}
              isReconciling={mutations.isReconciling}
              disabled={payrollView.isLoading}
            />
          </div>
        </div>

        {/* ROW 1 (Toolbox Bar): Mobile Filter Toolbar Dock */}
        <div className='block md:hidden shrink-0'>
          <PayrollMobileFilterToolbar presenter={presenter} />
        </div>

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
