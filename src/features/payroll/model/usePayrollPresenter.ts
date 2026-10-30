'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePayrollView, type UsePayrollViewResult } from './usePayrollView';
import { useFinalizePayrollPeriodMutation, useReconcileDailyLeaveMutation } from '../api/mutations';
import { useStaffPayrollReport } from './useStaffPayrollReport';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import { Icons } from '@/components/icons';
import type { PayrollSummaryItem, ReconcileLeaveResult } from '../api/types';

export interface UsePayrollPresenterResult {
  payrollView: UsePayrollViewResult;
  searchEngine: ReturnType<typeof useStateSearchEngine>;
  report: {
    exportingStaffId: string | null;
    isExporting: boolean;
    generateReport: (staff: PayrollSummaryItem) => Promise<boolean>;
  };
  modals: {
    isCalculateOpen: boolean;
    isRatesOpen: boolean;
    isTimingOpen: boolean;
    isAuditOpen: boolean;
    isReconcileOpen: boolean;
    isConfirmFinalizeOpen: boolean;
  };
  mutations: {
    isFinalizing: boolean;
    isReconciling: boolean;
  };
  actions: {
    openCalculate: () => void;
    closeCalculate: () => void;
    openRates: () => void;
    closeRates: () => void;
    openTiming: () => void;
    closeTiming: () => void;
    openAudit: () => void;
    closeAudit: () => void;
    openReconcile: () => void;
    closeReconcile: () => void;
    openConfirmFinalize: () => void;
    closeConfirmFinalize: () => void;
    confirmFinalizePeriod: () => void;
    reconcileDailyLeave: (targetDate?: string) => Promise<ReconcileLeaveResult | undefined>;
    onCalculateSuccess: (newPeriodId: string) => void;
  };
}

export function usePayrollPresenter(): UsePayrollPresenterResult {
  const payrollView = usePayrollView();

  const finalizeMutation = useFinalizePayrollPeriodMutation();
  const reconcileMutation = useReconcileDailyLeaveMutation();
  const { exportingStaffId, isExporting, generateStaffReport } = useStaffPayrollReport();

  // Local Modal States
  const [isCalculateOpen, setIsCalculateOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [isTimingOpen, setIsTimingOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);

  // Search Engine Indexing (Staff, Periods, Categories)
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];

    // 1. Loaded Staff in Payroll
    payrollView.summaries.forEach((staff) => {
      items.push({
        id: `staff-${staff.staffId}`,
        title: staff.fullName,
        subtitle: staff.roleName ?? '',
        category: 'Karyawan',
        icon: Icons.user,
        queryValue: staff.fullName
      });
    });

    // 2. Available Payroll Periods
    payrollView.periods.forEach((period) => {
      items.push({
        id: `period-${period.id}`,
        title: period.periodName,
        subtitle: `Status: ${period.status.toUpperCase()} • ${period.periodStart} s/d ${period.periodEnd}`,
        category: 'Periode Penggajian',
        icon: Icons.calendar,
        queryValue: period.periodName
      });
    });

    // 3. Dynamic Roles from Staff Summaries
    const roleMap = new Map<string, string>();
    payrollView.summaries.forEach((staff) => {
      if (staff.roleCode && staff.roleName && !roleMap.has(staff.roleCode)) {
        roleMap.set(staff.roleCode, staff.roleName);
      }
    });

    roleMap.forEach((roleName, roleCode) => {
      items.push({
        id: `role-${roleCode}`,
        title: roleName,
        subtitle: 'Peran Pegawai',
        category: 'Peran',
        icon: Icons.users,
        queryValue: roleName
      });
    });

    return items;
  }, [payrollView.summaries, payrollView.periods]);

  // Centralized search engine hook
  const searchEngine = useStateSearchEngine({
    query: payrollView.searchQuery,
    onQueryChange: payrollView.actions.changeSearch,
    id: 'payroll-search-engine',
    title: 'Pencarian Penggajian Staf',
    description: 'Cari berdasarkan nama karyawan, NIP, jabatan, atau periode penggajian',
    placeholder: 'Ketik nama karyawan, NIP, atau periode...',
    indexItems
  });

  // Modal Handlers
  const openCalculate = useCallback(() => setIsCalculateOpen(true), []);
  const closeCalculate = useCallback(() => setIsCalculateOpen(false), []);

  const openRates = useCallback(() => setIsRatesOpen(true), []);
  const closeRates = useCallback(() => setIsRatesOpen(false), []);

  const openTiming = useCallback(() => setIsTimingOpen(true), []);
  const closeTiming = useCallback(() => setIsTimingOpen(false), []);

  const openAudit = useCallback(() => setIsAuditOpen(true), []);
  const closeAudit = useCallback(() => setIsAuditOpen(false), []);

  const openReconcile = useCallback(() => setIsReconcileOpen(true), []);
  const closeReconcile = useCallback(() => setIsReconcileOpen(false), []);

  const openConfirmFinalize = useCallback(() => setIsConfirmFinalizeOpen(true), []);
  const closeConfirmFinalize = useCallback(() => setIsConfirmFinalizeOpen(false), []);

  const confirmFinalizePeriod = useCallback(() => {
    if (payrollView.currentPeriod?.id) {
      finalizeMutation.mutate(payrollView.currentPeriod.id, {
        onSuccess: () => {
          setIsConfirmFinalizeOpen(false);
        }
      });
    }
  }, [payrollView.currentPeriod?.id, finalizeMutation]);

  const reconcileDailyLeave = useCallback(
    async (targetDate?: string) => {
      return reconcileMutation.mutateAsync(targetDate);
    },
    [reconcileMutation]
  );

  const onCalculateSuccess = useCallback(
    (newPeriodId: string) => {
      payrollView.actions.changePeriod(newPeriodId);
      setIsCalculateOpen(false);
    },
    [payrollView.actions]
  );

  const generateReport = useCallback(
    async (staff: PayrollSummaryItem) => {
      const periodId = payrollView.currentPeriod?.id || staff.periodId;
      if (!periodId) return false;

      return generateStaffReport({
        periodId,
        staffId: staff.staffId,
        staffName: staff.fullName,
        periodName: payrollView.currentPeriod?.periodName || staff.periodName,
        format: 'pdf'
      });
    },
    [payrollView.currentPeriod, generateStaffReport]
  );

  return {
    payrollView,
    searchEngine,
    report: {
      exportingStaffId,
      isExporting,
      generateReport
    },
    modals: {
      isCalculateOpen,
      isRatesOpen,
      isTimingOpen,
      isAuditOpen,
      isReconcileOpen,
      isConfirmFinalizeOpen
    },
    mutations: {
      isFinalizing: finalizeMutation.isPending,
      isReconciling: reconcileMutation.isPending
    },
    actions: {
      openCalculate,
      closeCalculate,
      openRates,
      closeRates,
      openTiming,
      closeTiming,
      openAudit,
      closeAudit,
      openReconcile,
      closeReconcile,
      openConfirmFinalize,
      closeConfirmFinalize,
      confirmFinalizePeriod,
      reconcileDailyLeave,
      onCalculateSuccess
    }
  };
}
