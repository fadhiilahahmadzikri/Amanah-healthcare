'use client';

import React, { useState, useEffect } from 'react';
import { PayrollPeriodSelector } from './payroll-period-selector';
import { PayrollOverviewStats } from './payroll-overview-stats';
import { PayrollTable } from './payroll-table';
import { PayrollSlipDetailModal } from './payroll-slip-detail-modal';
import { PayrollCalculateModal } from './payroll-calculate-modal';
import { PayrollRatesConfigModal } from './payroll-rates-config-modal';
import { usePayrollPeriodsQuery, usePayrollPeriodDetailQuery } from '../api/queries';
import { useFinalizePayrollPeriodMutation, useReconcileDailyLeaveMutation } from '../api/mutations';
import type { PayrollFilterState, PayrollSummaryItem } from '../api/types';

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

  // Filter state
  const [filterState, setFilterState] = useState<PayrollFilterState>({
    category: 'all',
    search: ''
  });

  const handleFilterChange = (newFilter: Partial<PayrollFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...newFilter }));
  };

  const handleResetFilter = () => {
    setFilterState({ category: 'all', search: '' });
  };

  // Modals state
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<PayrollSummaryItem | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);

  const handleSelectStaff = (summary: PayrollSummaryItem) => {
    setSelectedStaffForDetail(summary);
    setIsDetailModalOpen(true);
  };

  const currentPeriod = periodDetail?.period || periods.find((p) => p.id === selectedPeriodId);
  const summaries = periodDetail?.summaries || [];

  return (
    <>
      {/* 1. Modal Detail Slip Gaji */}
      <PayrollSlipDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStaffForDetail(null);
        }}
        staffSummary={selectedStaffForDetail}
        period={currentPeriod}
      />

      {/* 2. Modal Kalkulasi Payroll Baru */}
      <PayrollCalculateModal
        isOpen={isCalculateModalOpen}
        onClose={() => setIsCalculateModalOpen(false)}
        onSuccess={(newId) => setSelectedPeriodId(newId)}
      />

      {/* 3. Modal Konfigurasi Standar Tarif Payroll (Dedicated & Modular) */}
      <PayrollRatesConfigModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
      />

      {/* Main View Shell */}
      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5 select-none'>
        {/* Top: Period Selector & Action */}
        <PayrollPeriodSelector
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          onSelectPeriod={(id) => setSelectedPeriodId(id)}
          onOpenCalculateModal={() => setIsCalculateModalOpen(true)}
          onOpenRatesModal={() => setIsRatesModalOpen(true)}
          onFinalizePeriod={(id) => finalizeMutation.mutate(id)}
          onReconcileDailyLeave={() => reconcileMutation.mutate()}
          isFinalizing={finalizeMutation.isPending}
          isReconciling={reconcileMutation.isPending}
          isLoading={isPeriodsLoading || isDetailLoading}
        />

        {/* Overview Stats */}
        <PayrollOverviewStats period={currentPeriod} summaries={summaries} />

        {/* Data Table */}
        <PayrollTable
          summaries={summaries}
          isLoading={isDetailLoading}
          onSelectStaff={handleSelectStaff}
          filterState={filterState}
          onFilterChange={handleFilterChange}
          onResetFilter={handleResetFilter}
        />
      </div>
    </>
  );
}
