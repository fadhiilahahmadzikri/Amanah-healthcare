'use client';

import { useMemo, useCallback } from 'react';
import type { Table } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import type {
  FacetGroupDefinition,
  DateFilterConfig,
  FacetOption
} from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import { APPOINTMENT_STATUS_OPTIONS } from '../constants/appointment-status.dictionary';
import type { AdminAppointment, QueueNavigationResponse } from '../api/types';
import type { Option } from '@/types/data-table';

export const STATUS_DOT_COLORS: Record<string, string> = {
  BOOKED: 'bg-sky-500',
  WAITING: 'bg-amber-500',
  IN_SERVICE: 'bg-indigo-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500',
  LATE: 'bg-amber-600'
};

export interface UseAppointmentDynamicOptionsProps {
  table: Table<AdminAppointment>;
  searchQuery?: string;
  onSearchChange?: (q: string | null) => void;
  doctorOptions?: Option[];
  roomOptions?: Option[];
  serviceOptions?: Option[];
  units?: QueueNavigationResponse['units'];
  currentUnitId?: string | null;
  onSelectUnit?: (unitId: string | null) => void;
  onReset?: () => void;
}

export function useAppointmentDynamicOptions({
  table,
  searchQuery: propSearchQuery,
  onSearchChange: propOnSearchChange,
  doctorOptions: explicitDoctorOptions,
  roomOptions: explicitRoomOptions,
  serviceOptions: explicitServiceOptions,
  units,
  currentUnitId,
  onSelectUnit,
  onReset
}: UseAppointmentDynamicOptionsProps) {
  const patientCol = table.getColumn('patientName');
  const dateCol = table.getColumn('scheduledDate');
  const statusCol = table.getColumn('status');
  const doctorCol = table.getColumn('doctorId');
  const roomCol = table.getColumn('roomName');
  const serviceCol = table.getColumn('layananName');

  // 1. Search Query & Engine
  const searchQuery = propSearchQuery ?? (patientCol?.getFilterValue() as string) ?? '';
  const handleSearchChange = useCallback(
    (q: string) => {
      if (propOnSearchChange) {
        propOnSearchChange(q ? q : null);
      } else {
        patientCol?.setFilterValue(q ? q : undefined);
      }
    },
    [propOnSearchChange, patientCol]
  );

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];
    const rows = table.getCoreRowModel().rows;
    const seenPatients = new Set<string>();
    const seenQueues = new Set<string>();
    const seenDoctors = new Set<string>();

    rows.forEach((row) => {
      const apt = row.original;
      if (apt.patientName && !seenPatients.has(apt.patientName)) {
        seenPatients.add(apt.patientName);
        items.push({
          id: `pat-${apt.id}`,
          title: apt.patientName,
          subtitle: `Antrean ${apt.queueNumber || '-'} • ${apt.poliklinikName || '-'}`,
          category: 'Pasien',
          icon: Icons.user,
          queryValue: apt.patientName
        });
      }
      if (apt.queueNumber && !seenQueues.has(apt.queueNumber)) {
        seenQueues.add(apt.queueNumber);
        items.push({
          id: `q-${apt.id}`,
          title: `Antrean ${apt.queueNumber}`,
          subtitle: apt.patientName,
          category: 'Nomor Antrean',
          icon: Icons.ticket,
          queryValue: apt.queueNumber
        });
      }
      if (apt.doctorName && !seenDoctors.has(apt.doctorName)) {
        seenDoctors.add(apt.doctorName);
        items.push({
          id: `doc-${apt.id}`,
          title: apt.doctorName,
          subtitle: apt.doctorSpecialty ?? 'Dokter',
          category: 'Dokter',
          icon: Icons.stethoscope,
          queryValue: apt.doctorName
        });
      }
    });

    return items;
  }, [table]);

  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: handleSearchChange,
    id: 'appointment-pasien-search',
    title: 'Pencarian Antrean Pasien',
    description: 'Cari antrean berdasarkan nama pasien, nomor antrean, atau dokter',
    placeholder: 'Ketik nama pasien, no antrean, atau dokter...',
    indexItems
  });

  // 2. Date Filter
  const dateValue = (dateCol?.getFilterValue() as string) ?? '';

  const dateFilterObj = useMemo(() => {
    if (!dateValue || !dateValue.trim()) return undefined;
    const parts = dateValue.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateValue);
  }, [dateValue]);

  const handleSelectDate = useCallback(
    (d: Date | undefined) => {
      if (!d) {
        dateCol?.setFilterValue(undefined);
        return;
      }
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateCol?.setFilterValue(`${y}-${m}-${day}`);
    },
    [dateCol]
  );

  const dateFilterConfig: DateFilterConfig = useMemo(
    () => ({
      label: 'Tanggal Booking',
      selectedDate: dateFilterObj,
      onSelectDate: handleSelectDate,
      resetLabel: 'Hari Ini'
    }),
    [dateFilterObj, handleSelectDate]
  );

  // 3. Status Facet
  const statusValue = useMemo<string[]>(() => {
    const raw = statusCol?.getFilterValue();
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim()) return [raw];
    return [];
  }, [statusCol]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    table.getCoreRowModel().rows.forEach((row) => {
      const st = row.original.status;
      if (st) {
        counts[st] = (counts[st] || 0) + 1;
      }
    });
    return counts;
  }, [table]);

  const statusFacetOptions = useMemo<FacetOption[]>(() => {
    return APPOINTMENT_STATUS_OPTIONS.map((opt) => ({
      label: opt.label,
      value: opt.value,
      count: statusCounts[opt.value] || 0,
      dotColor: STATUS_DOT_COLORS[opt.value] || 'bg-muted-foreground'
    }));
  }, [statusCounts]);

  const handleStatusSelect = useCallback(
    (val: string) => {
      const next = toggleItem(statusValue, val);
      statusCol?.setFilterValue(next.length > 0 ? next : undefined);
    },
    [statusCol, statusValue]
  );

  const handleStatusReset = useCallback(() => {
    statusCol?.setFilterValue(undefined);
  }, [statusCol]);

  // 4. Doctor Facet
  const doctorOptions = useMemo<Option[]>(() => {
    if (explicitDoctorOptions && explicitDoctorOptions.length > 0) {
      return explicitDoctorOptions;
    }
    return (doctorCol?.columnDef.meta as { options?: Option[] } | undefined)?.options ?? [];
  }, [explicitDoctorOptions, doctorCol]);

  const doctorValue = doctorCol?.getFilterValue() as string | string[] | undefined;
  const selectedDoctorValues = useMemo<string[]>(() => {
    if (!doctorValue) return [];
    return Array.isArray(doctorValue) ? doctorValue : [String(doctorValue)];
  }, [doctorValue]);

  const doctorFacetOptions = useMemo<FacetOption[]>(() => {
    return doctorOptions.map((doc) => ({
      label: doc.label,
      value: doc.value,
      count: doc.count,
      icon: doc.icon
    }));
  }, [doctorOptions]);

  const handleDoctorSelect = useCallback(
    (val: string) => {
      const next = selectedDoctorValues.includes(val) ? undefined : val;
      doctorCol?.setFilterValue(next);
    },
    [doctorCol, selectedDoctorValues]
  );

  const handleDoctorReset = useCallback(() => {
    doctorCol?.setFilterValue(undefined);
  }, [doctorCol]);

  // 5. Room Facet
  const roomOptions = useMemo<Option[]>(() => {
    if (explicitRoomOptions && explicitRoomOptions.length > 0) {
      return explicitRoomOptions;
    }
    return (roomCol?.columnDef.meta as { options?: Option[] } | undefined)?.options ?? [];
  }, [explicitRoomOptions, roomCol]);

  const roomValue = useMemo<string[]>(() => {
    const raw = roomCol?.getFilterValue();
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim()) return [raw];
    return [];
  }, [roomCol]);

  const roomFacetOptions = useMemo<FacetOption[]>(() => {
    return roomOptions.map((r) => ({
      label: r.label,
      value: r.value,
      count: r.count
    }));
  }, [roomOptions]);

  const handleRoomSelect = useCallback(
    (val: string) => {
      const next = toggleItem(roomValue, val);
      roomCol?.setFilterValue(next.length > 0 ? next : undefined);
    },
    [roomCol, roomValue]
  );

  const handleRoomReset = useCallback(() => {
    roomCol?.setFilterValue(undefined);
  }, [roomCol]);

  // 6. Service / Layanan Facet
  const serviceOptions = useMemo<Option[]>(() => {
    if (explicitServiceOptions && explicitServiceOptions.length > 0) {
      return explicitServiceOptions;
    }
    return (serviceCol?.columnDef.meta as { options?: Option[] } | undefined)?.options ?? [];
  }, [explicitServiceOptions, serviceCol]);

  const serviceValue = useMemo<string[]>(() => {
    const raw = serviceCol?.getFilterValue();
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim()) return [raw];
    return [];
  }, [serviceCol]);

  const serviceFacetOptions = useMemo<FacetOption[]>(() => {
    return serviceOptions.map((s) => ({
      label: s.label,
      value: s.value,
      count: s.count
    }));
  }, [serviceOptions]);

  const handleServiceSelect = useCallback(
    (val: string) => {
      const next = toggleItem(serviceValue, val);
      serviceCol?.setFilterValue(next.length > 0 ? next : undefined);
    },
    [serviceCol, serviceValue]
  );

  const handleServiceReset = useCallback(() => {
    serviceCol?.setFilterValue(undefined);
  }, [serviceCol]);

  // 7. Assemble Facet Groups
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
    const groups: FacetGroupDefinition[] = [];

    // Optional Unit / Poliklinik Facet (di mobile menggantikan ClinicCategoryTabs)
    if (units && units.length > 0) {
      const allCount = units.reduce((acc, u) => acc + (u.totalAppointments || 0), 0);

      groups.push({
        id: 'unit',
        title: 'Poliklinik',
        icon: Icons.plusCircle,
        mode: 'single',
        options: [
          {
            label: 'Semua Poliklinik',
            value: 'all',
            count: allCount
          },
          ...units.map((u) => ({
            label: u.name,
            value: u.id,
            count: u.totalAppointments
          }))
        ],
        selectedValues: currentUnitId ? [currentUnitId] : ['all'],
        onSelect: (val: string) => {
          onSelectUnit?.(val === 'all' ? null : val);
        },
        onReset: () => {
          onSelectUnit?.(null);
        },
        popoverWidth: 'w-52',
        resetLabel: 'Semua Poliklinik'
      });
    }

    groups.push({
      id: 'status',
      title: 'Status Antrean',
      icon: Icons.activity,
      mode: 'multi',
      options: statusFacetOptions,
      selectedValues: statusValue,
      onSelect: handleStatusSelect,
      onReset: handleStatusReset,
      popoverWidth: 'w-52',
      resetLabel: 'Reset Status'
    });

    if (doctorFacetOptions.length > 0) {
      groups.push({
        id: 'doctor',
        title: 'Dokter',
        icon: Icons.stethoscope,
        mode: 'single',
        options: doctorFacetOptions,
        selectedValues: selectedDoctorValues,
        onSelect: handleDoctorSelect,
        onReset: handleDoctorReset,
        popoverWidth: 'w-56',
        resetLabel: 'Semua Dokter'
      });
    }

    if (roomFacetOptions.length > 0) {
      groups.push({
        id: 'room',
        title: 'Ruangan',
        icon: Icons.mapPin,
        mode: 'multi',
        options: roomFacetOptions,
        selectedValues: roomValue,
        onSelect: handleRoomSelect,
        onReset: handleRoomReset,
        popoverWidth: 'w-48',
        resetLabel: 'Reset Ruangan'
      });
    }

    if (serviceFacetOptions.length > 0) {
      groups.push({
        id: 'service',
        title: 'Layanan',
        icon: Icons.layers,
        mode: 'multi',
        options: serviceFacetOptions,
        selectedValues: serviceValue,
        onSelect: handleServiceSelect,
        onReset: handleServiceReset,
        popoverWidth: 'w-52',
        resetLabel: 'Reset Layanan'
      });
    }

    return groups;
  }, [
    units,
    currentUnitId,
    onSelectUnit,
    statusFacetOptions,
    statusValue,
    handleStatusSelect,
    handleStatusReset,
    doctorFacetOptions,
    selectedDoctorValues,
    handleDoctorSelect,
    handleDoctorReset,
    roomFacetOptions,
    roomValue,
    handleRoomSelect,
    handleRoomReset,
    serviceFacetOptions,
    serviceValue,
    handleServiceSelect,
    handleServiceReset
  ]);

  // 8. Filter Counts & State
  const hasUnitFilter = Boolean(units && units.length > 0 && currentUnitId);
  const hasDateFilter = Boolean(dateValue && String(dateValue).trim().length > 0);
  const hasStatusFilter = statusValue.length > 0;
  const hasDoctorFilter = selectedDoctorValues.length > 0;
  const hasRoomFilter = roomValue.length > 0;
  const hasServiceFilter = serviceValue.length > 0;
  const hasSearchFilter = Boolean(searchQuery && searchQuery.trim().length > 0);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (hasSearchFilter) count++;
    if (hasUnitFilter) count++;
    if (hasDateFilter) count++;
    if (hasStatusFilter) count += statusValue.length;
    if (hasDoctorFilter) count += selectedDoctorValues.length;
    if (hasRoomFilter) count += roomValue.length;
    if (hasServiceFilter) count += serviceValue.length;
    return count;
  }, [
    hasSearchFilter,
    hasUnitFilter,
    hasDateFilter,
    hasStatusFilter,
    hasDoctorFilter,
    hasRoomFilter,
    hasServiceFilter,
    statusValue.length,
    selectedDoctorValues.length,
    roomValue.length,
    serviceValue.length
  ]);

  const isFiltered = useMemo(() => {
    return activeFilterCount > 0 || table.getState().columnFilters.length > 0;
  }, [activeFilterCount, table]);

  // 9. Reset All Filters
  const resetAllFilters = useCallback(() => {
    searchEngine.clearQuery();
    if (propOnSearchChange) {
      propOnSearchChange(null);
    }
    patientCol?.setFilterValue(undefined);
    dateCol?.setFilterValue(undefined);
    statusCol?.setFilterValue(undefined);
    doctorCol?.setFilterValue(undefined);
    roomCol?.setFilterValue(undefined);
    serviceCol?.setFilterValue(undefined);
    table.resetColumnFilters();
    onSelectUnit?.(null);
    onReset?.();
  }, [
    searchEngine,
    propOnSearchChange,
    patientCol,
    dateCol,
    statusCol,
    doctorCol,
    roomCol,
    serviceCol,
    table,
    onSelectUnit,
    onReset
  ]);

  return {
    searchQuery,
    handleSearchChange,
    dateFilterConfig,
    facetGroups,
    activeFilterCount,
    isFiltered,
    resetAllFilters,
    searchEngine
  };
}
