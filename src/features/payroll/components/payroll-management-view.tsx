'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PayrollPeriodSelector } from './payroll-period-selector';
import { PayrollOverviewStats } from './payroll-overview-stats';
import { PayrollFilters } from './payroll-filters';
import { PayrollTable } from './payroll-tables';
import { PayrollMobileCards } from './payroll-mobile-cards';
import { PayrollSlipDetailModal } from './payroll-slip-detail-modal';
import { PayrollCalculateModal } from './payroll-calculate-modal';
import { PayrollRatesConfigModal } from './payroll-rates-config-modal';
import { PayrollAuditMutationModal } from './payroll-audit-mutation-modal';
import { ExportDialog } from '@/features/export';
import { usePayrollPeriodsQuery, usePayrollPeriodDetailQuery } from '../api/queries';
import { useFinalizePayrollPeriodMutation, useReconcileDailyLeaveMutation } from '../api/mutations';
import { usePayrollTable } from '../model/usePayrollTable';
import { getPayrollColumns } from './payroll-tables/columns';

export function PayrollManagementView() {
  const { data: periods = [], isLoading: isPeriodsLoading } = usePayrollPeriodsQuery();
  const finalizeMutation = useFinalizePayrollPeriodMutation();
  const reconcileMutation = useReconcileDailyLeaveMutation();

  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  // Sync selectedPeriodId to latest period once loaded
  useEffect(() => {
    if (!selectedPeriodId && periods.length > 0) {
      setSelectedPeriodId(periods[0].id);
    }
  }, [periods, selectedPeriodId]);

  const { data: periodDetail, isLoading: isDetailLoading } =
    usePayrollPeriodDetailQuery(selectedPeriodId);

  const currentPeriod = periodDetail?.period || periods.find((p) => p.id === selectedPeriodId);
  const summaries = periodDetail?.summaries || [];

  // TanStack columns
  const columns = useMemo(() => getPayrollColumns(), []);

  // Integrated Payroll Table Hook
  const {
    table,
    filteredSummaries,
    selectedStaff,
    exportStaffTarget,
    isDetailOpen,
    isCalculateOpen,
    isRatesOpen,
    isAuditOpen,
    isExportPeriodOpen,
    searchQuery,
    categoryFilter,
    hasFilters,
    actions
  } = usePayrollTable({
    data: summaries,
    columns
  });

  return (
    <>
      {/* 1. Modal Detail Slip Gaji Staf */}
      <PayrollSlipDetailModal
        isOpen={isDetailOpen}
        onClose={actions.closeDetail}
        staffSummary={selectedStaff}
        period={currentPeriod}
      />

      {/* 2. Modal Kalkulasi Payroll Periode Baru */}
      <PayrollCalculateModal
        isOpen={isCalculateOpen}
        onClose={actions.closeCalculate}
        onSuccess={(newId) => setSelectedPeriodId(newId)}
      />

      {/* 3. Modal Konfigurasi Standar Tarif Payroll */}
      <PayrollRatesConfigModal isOpen={isRatesOpen} onClose={actions.closeRates} />

      {/* 4. Modal Audit Mutasi Periode */}
      <PayrollAuditMutationModal
        isOpen={isAuditOpen}
        onClose={actions.closeAudit}
        period={currentPeriod}
        summaries={summaries}
      />

      {/* 5. Modal Unduh Laporan Slip Gaji Individu (Per-Record) */}
      <ExportDialog
        open={Boolean(exportStaffTarget)}
        onOpenChange={(open) => !open && actions.closeExportStaff()}
        exportType='payroll'
        entityName={exportStaffTarget?.fullName}
        parameters={{
          periodId: exportStaffTarget?.periodId || currentPeriod?.id,
          staffProfileId: exportStaffTarget?.staffId
        }}
        availablePeriods={periods}
        selectedPeriodId={exportStaffTarget?.periodId || currentPeriod?.id}
      />

      {/* 6. Modal Unduh Rekapitulasi Gaji Seluruh Periode (Toolbar Header) */}
      <ExportDialog
        open={isExportPeriodOpen}
        onOpenChange={(open) => !open && actions.closeExportPeriod()}
        exportType='payroll'
        title='Unduh Rekapitulasi Penggajian Periode'
        subtitle={`Rekap gaji seluruh staf untuk ${currentPeriod?.periodName || 'periode terpilih'}`}
        parameters={{
          periodId: currentPeriod?.id,
          periodName: currentPeriod?.periodName
        }}
        availablePeriods={periods}
        selectedPeriodId={currentPeriod?.id}
      />

      {/* Main View Shell */}
      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5 select-none'>
        {/* Top: Period Selector & Consolidated Action Context Menu */}
        <PayrollPeriodSelector
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          onSelectPeriod={(id) => setSelectedPeriodId(id)}
          onOpenCalculateModal={actions.openCalculate}
          onOpenRatesModal={actions.openRates}
          onOpenAuditModal={actions.openAudit}
          onOpenExportModal={actions.openExportPeriod}
          onFinalizePeriod={(id) => finalizeMutation.mutate(id)}
          onReconcileDailyLeave={() => reconcileMutation.mutate()}
          isFinalizing={finalizeMutation.isPending}
          isReconciling={reconcileMutation.isPending}
          isLoading={isPeriodsLoading || isDetailLoading}
        />

        {/* Overview Stats: Signature MetricChartCard with Real Sparklines */}
        <PayrollOverviewStats period={currentPeriod} summaries={summaries} />

        {/* Filter Bar: Debounced Search & Backend-Driven Category Facet */}
        <PayrollFilters
          searchQuery={searchQuery}
          onSearchChange={actions.setSearch}
          selectedCategory={categoryFilter}
          onCategoryChange={actions.setCategory}
          onResetAll={actions.resetFilters}
          totalFiltered={filteredSummaries.length}
          totalCount={summaries.length}
        />

        {/* Desktop View: Signature TanStack DataTable (hidePagination=true) */}
        <div className='hidden md:flex min-h-0 flex-1 flex-col overflow-hidden'>
          <PayrollTable
            table={table}
            isLoading={isDetailLoading}
            hasFilters={hasFilters}
            onSelectStaff={actions.openDetail}
          />
        </div>

        {/* Mobile View: Minimalist Surface Cards */}
        <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
          <PayrollMobileCards
            summaries={filteredSummaries}
            hasFilters={hasFilters}
            onSelectStaff={actions.openDetail}
            isLoading={isDetailLoading}
          />
        </div>
      </div>
    </>
  );
}
