'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { attendanceQueries } from '../api/queries';
import { useAttendanceRealtimeSync } from '../hooks/useAttendanceRealtimeSync';
import { useAttendanceFilterState } from './useAttendanceFilterState';
import { useAttendanceDynamicOptions } from './useAttendanceDynamicOptions';
import { useQrTerminalController } from './useQrTerminalController';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';

export function useAttendanceDashboard() {
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState(false);

  // 1. Filter State (Unified, unpaginated)
  const filterState = useAttendanceFilterState([]);

  // 2. Query Authoritative Attendance Data
  const { data, refetch, isLoading, isFetching } = useQuery(
    attendanceQueries.list(filterState.params)
  );

  // 3. Realtime Sync via WebSocket / RabbitMQ events
  useAttendanceRealtimeSync({ refetch });

  // 4. Authoritative records
  const records = useMemo(() => data?.records ?? [], [data?.records]);

  // 5. Computed displayed records & counts from single state of truth
  const activeTab = filterState.activeTab;
  const displayedRecords = useMemo(() => {
    if (activeTab === 'active') return records.filter((r) => !r.checkOutAt);
    if (activeTab === 'completed') return records.filter((r) => Boolean(r.checkOutAt));
    return records;
  }, [records, activeTab]);

  const counts = useMemo(() => {
    const active = records.filter((r) => !r.checkOutAt).length;
    const completed = records.filter((r) => Boolean(r.checkOutAt)).length;
    return { all: records.length, active, completed };
  }, [records]);

  // Keep filter reset toast notification
  const resetFilter = useCallback(() => {
    filterState.resetFilter();
    toast.info('Filter presensi telah direset.');
  }, [filterState]);

  // 6. Dynamic Options from DB SSOT (with Dinas facet included)
  const dynamicOptions = useAttendanceDynamicOptions({
    availableFilters: data?.availableFilters,
    records,
    params: filterState.params,
    onFilterChange: filterState.changeFilter,
    activeTab: filterState.activeTab,
    onTabChange: filterState.setActiveTab,
    counts
  });

  // 7. QR Terminal Controller
  const qrController = useQrTerminalController({ params: filterState.params });

  // 8. Search Engine Integration (Standardized across clinic modules)
  const searchIndexItems = useMemo<SearchEngineResultItem[]>(() => {
    return records.map((r) => {
      const shiftLabel = r.shiftLabel || '-';
      const roleLabel = r.roleName ?? '';
      const subtitleParts = [r.id_staf];
      if (roleLabel) subtitleParts.push(roleLabel);
      subtitleParts.push(`Shift ${shiftLabel}`);

      return {
        id: `staff-${r.id}`,
        title: r.nama_staf,
        subtitle: subtitleParts.join(' • '),
        category: roleLabel,
        icon: Icons.user,
        queryValue: r.nama_staf
      };
    });
  }, [records]);

  const searchEngine = useStateSearchEngine({
    query: filterState.params.search || '',
    onQueryChange: (q) => filterState.changeFilter({ search: q }),
    id: 'attendance-search-engine',
    title: 'Pencarian Presensi Pegawai',
    description: 'Cari riwayat kehadiran berdasarkan nama, ID staf, peran, atau shift',
    placeholder: 'Ketik nama staf atau ID pegawai...',
    indexItems: searchIndexItems
  });

  const refreshData = useCallback(() => {
    void refetch();
    toast.success('Data presensi berhasil diperbarui.');
  }, [refetch]);

  return {
    data,
    records,
    isLoading,
    isFetching,
    filterState: {
      ...filterState,
      displayedRecords,
      counts,
      resetFilter
    },
    dynamicOptions,
    qrController,
    searchEngine,
    isManualAttendanceModalOpen,
    actions: {
      refreshData,
      openManualAttendance: () => setIsManualAttendanceModalOpen(true),
      closeManualAttendance: () => setIsManualAttendanceModalOpen(false)
    }
  };
}
