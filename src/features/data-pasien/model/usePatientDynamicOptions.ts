'use client';

import { useMemo, useCallback } from 'react';
import type { Table } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import type { FacetGroupDefinition, FacetOption } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import { GENDER_OPTIONS } from '@/constants/gender.constants';
import { DEFAULT_STATUS_OPTIONS } from '../components/patient-tables/columns';
import type { Patient } from '../api/types';
import type { ReferenceOptionItem } from '../api/patient-reference-service';
import type { Option } from '@/types/data-table';

export interface UsePatientDynamicOptionsProps {
  table: Table<Patient>;
  genders?: ReferenceOptionItem[];
  statuses?: ReferenceOptionItem[];
  bloodTypes?: ReferenceOptionItem[];
  onReset?: () => void;
}

export function usePatientDynamicOptions({
  table,
  genders: explicitGenders,
  statuses: explicitStatuses,
  bloodTypes: explicitBloodTypes,
  onReset
}: UsePatientDynamicOptionsProps) {
  const nameCol = table.getColumn('name');
  const profileCol = table.getColumn('profile_type');
  const genderCol = table.getColumn('gender');
  const statusCol = table.getColumn('status');
  const bloodCol = table.getColumn('blood_type');

  // 1. Search Query & Engine
  const searchQuery = (nameCol?.getFilterValue() as string) ?? '';
  const handleSearchChange = useCallback(
    (q: string) => {
      nameCol?.setFilterValue(q ? q : undefined);
    },
    [nameCol]
  );

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];
    const rows = table.getCoreRowModel().rows;
    const seenPatients = new Set<string>();
    const seenRm = new Set<string>();
    const seenNik = new Set<string>();

    rows.forEach((row) => {
      const p = row.original;
      if (p.name && !seenPatients.has(p.name)) {
        seenPatients.add(p.name);
        const sub = `No. RM: ${p.patient_id || '-'} • NIK: ${p.masked_nik || p.nik || '-'}`;
        items.push({
          id: `pat-${p.id}`,
          title: p.name,
          subtitle: sub,
          category: 'Pasien',
          icon: Icons.user,
          queryValue: p.name,
          badge: p.is_master ? 'Akun Utama' : 'Afiliasi'
        });
      }
      if (p.patient_id && !seenRm.has(p.patient_id)) {
        seenRm.add(p.patient_id);
        items.push({
          id: `rm-${p.id}`,
          title: `No. RM: ${p.patient_id}`,
          subtitle: p.name,
          category: 'Nomor Rekam Medis',
          icon: Icons.forms,
          queryValue: p.patient_id
        });
      }
      if (p.nik && !seenNik.has(p.nik)) {
        seenNik.add(p.nik);
        items.push({
          id: `nik-${p.id}`,
          title: `NIK: ${p.masked_nik || p.nik}`,
          subtitle: p.name,
          category: 'Nomor Identitas (NIK)',
          icon: Icons.text,
          queryValue: p.nik
        });
      }
    });

    return items;
  }, [table]);

  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: handleSearchChange,
    id: 'data-pasien-search',
    title: 'Pencarian Pasien',
    description: 'Cari pasien berdasarkan nama, nomor RM, atau NIK',
    placeholder: 'Ketik nama pasien, no RM, NIK...',
    indexItems
  });

  // 2. Profile Type Facet (Akun Utama vs Afiliasi)
  const rawProfile = profileCol?.getFilterValue();
  const profileValue = useMemo<string[]>(() => {
    if (Array.isArray(rawProfile)) return rawProfile as string[];
    if (typeof rawProfile === 'string' && rawProfile.trim()) return [rawProfile];
    return [];
  }, [rawProfile]);

  const profileCounts = useMemo(() => {
    const counts: Record<string, number> = { master: 0, affiliate: 0 };
    table.getCoreRowModel().rows.forEach((row) => {
      if (row.original.is_master) {
        counts.master = (counts.master || 0) + 1;
      } else {
        counts.affiliate = (counts.affiliate || 0) + 1;
      }
    });
    return counts;
  }, [table]);

  const profileFacetOptions: FacetOption[] = useMemo(
    () => [
      {
        label: 'Akun Utama',
        value: 'master',
        count: profileCounts.master,
        icon: Icons.crown
      },
      {
        label: 'Afiliasi',
        value: 'affiliate',
        count: profileCounts.affiliate,
        icon: Icons.users
      }
    ],
    [profileCounts]
  );

  const handleProfileSelect = useCallback(
    (val: string) => {
      const next = toggleItem(profileValue, val);
      profileCol?.setFilterValue(next.length > 0 ? next : undefined);
    },
    [profileCol, profileValue]
  );

  const handleProfileReset = useCallback(() => {
    profileCol?.setFilterValue(undefined);
  }, [profileCol]);

  // 3. Gender Facet
  const genderOptions = useMemo<Option[]>(() => {
    if (explicitGenders && explicitGenders.length > 0) {
      return explicitGenders;
    }
    return (
      (genderCol?.columnDef.meta as { options?: Option[] } | undefined)?.options ?? GENDER_OPTIONS
    );
  }, [explicitGenders, genderCol]);

  const rawGender = genderCol?.getFilterValue();
  const genderValue = useMemo<string[]>(() => {
    if (Array.isArray(rawGender)) return rawGender as string[];
    if (typeof rawGender === 'string' && rawGender.trim()) return [rawGender];
    return [];
  }, [rawGender]);

  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    table.getCoreRowModel().rows.forEach((row) => {
      const g = row.original.gender;
      if (g) {
        counts[g] = (counts[g] || 0) + 1;
      }
    });
    return counts;
  }, [table]);

  const genderFacetOptions: FacetOption[] = useMemo(() => {
    return genderOptions.map((g) => ({
      label: g.label,
      value: g.value,
      count: genderCounts[g.value] || 0,
      icon: Icons.user
    }));
  }, [genderOptions, genderCounts]);

  const handleGenderSelect = useCallback(
    (val: string) => {
      const next = toggleItem(genderValue, val);
      genderCol?.setFilterValue(next.length > 0 ? next : undefined);
    },
    [genderCol, genderValue]
  );

  const handleGenderReset = useCallback(() => {
    genderCol?.setFilterValue(undefined);
  }, [genderCol]);

  // 4. Status Akun Facet
  const statusOptions = useMemo<Option[]>(() => {
    if (explicitStatuses && explicitStatuses.length > 0) {
      return explicitStatuses;
    }
    return (
      (statusCol?.columnDef.meta as { options?: Option[] } | undefined)?.options ??
      DEFAULT_STATUS_OPTIONS
    );
  }, [explicitStatuses, statusCol]);

  const rawStatus = statusCol?.getFilterValue();
  const statusValue = useMemo<string[]>(() => {
    if (Array.isArray(rawStatus)) return rawStatus as string[];
    if (typeof rawStatus === 'string' && rawStatus.trim()) return [rawStatus];
    return [];
  }, [rawStatus]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    table.getCoreRowModel().rows.forEach((row) => {
      const s = row.original.status;
      if (s) {
        counts[s] = (counts[s] || 0) + 1;
      }
    });
    return counts;
  }, [table]);

  const statusFacetOptions: FacetOption[] = useMemo(() => {
    return statusOptions.map((s) => ({
      label: s.label,
      value: s.value,
      count: statusCounts[s.value] || 0,
      dotColor: s.value === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'
    }));
  }, [statusOptions, statusCounts]);

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

  // 5. Blood Type Facet
  const bloodOptions = useMemo<Option[]>(() => {
    if (explicitBloodTypes && explicitBloodTypes.length > 0) {
      return explicitBloodTypes;
    }
    return (bloodCol?.columnDef.meta as { options?: Option[] } | undefined)?.options ?? [];
  }, [explicitBloodTypes, bloodCol]);

  const rawBlood = bloodCol?.getFilterValue();
  const bloodValue = useMemo<string[]>(() => {
    if (Array.isArray(rawBlood)) return rawBlood as string[];
    if (typeof rawBlood === 'string' && rawBlood.trim()) return [rawBlood];
    return [];
  }, [rawBlood]);

  const bloodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    table.getCoreRowModel().rows.forEach((row) => {
      const b = row.original.blood_type;
      if (b) {
        counts[b] = (counts[b] || 0) + 1;
      }
    });
    return counts;
  }, [table]);

  const bloodFacetOptions: FacetOption[] = useMemo(() => {
    return bloodOptions.map((b) => ({
      label: b.label,
      value: b.value,
      count: bloodCounts[b.label] || 0
    }));
  }, [bloodOptions, bloodCounts]);

  const handleBloodSelect = useCallback(
    (val: string) => {
      const next = toggleItem(bloodValue, val);
      bloodCol?.setFilterValue(next.length > 0 ? next : undefined);
    },
    [bloodCol, bloodValue]
  );

  const handleBloodReset = useCallback(() => {
    bloodCol?.setFilterValue(undefined);
  }, [bloodCol]);

  // 6. Assemble Facet Groups
  const facetGroups: FacetGroupDefinition[] = useMemo(() => {
    const groups: FacetGroupDefinition[] = [
      {
        id: 'profile',
        title: 'Status Profil',
        icon: Icons.crown,
        mode: 'multi',
        options: profileFacetOptions,
        selectedValues: profileValue,
        onSelect: handleProfileSelect,
        onReset: handleProfileReset,
        popoverWidth: 'w-48',
        resetLabel: 'Reset Profil'
      },
      {
        id: 'gender',
        title: 'Gender',
        icon: Icons.user,
        mode: 'multi',
        options: genderFacetOptions,
        selectedValues: genderValue,
        onSelect: handleGenderSelect,
        onReset: handleGenderReset,
        popoverWidth: 'w-48',
        resetLabel: 'Reset Gender'
      },
      {
        id: 'status',
        title: 'Status Akun',
        icon: Icons.activity,
        mode: 'multi',
        options: statusFacetOptions,
        selectedValues: statusValue,
        onSelect: handleStatusSelect,
        onReset: handleStatusReset,
        popoverWidth: 'w-48',
        resetLabel: 'Reset Status'
      }
    ];

    if (bloodFacetOptions.length > 0) {
      groups.push({
        id: 'blood',
        title: 'Gol. Darah',
        icon: Icons.activity,
        mode: 'multi',
        options: bloodFacetOptions,
        selectedValues: bloodValue,
        onSelect: handleBloodSelect,
        onReset: handleBloodReset,
        popoverWidth: 'w-48',
        resetLabel: 'Reset Gol. Darah'
      });
    }

    return groups;
  }, [
    profileFacetOptions,
    profileValue,
    handleProfileSelect,
    handleProfileReset,
    genderFacetOptions,
    genderValue,
    handleGenderSelect,
    handleGenderReset,
    statusFacetOptions,
    statusValue,
    handleStatusSelect,
    handleStatusReset,
    bloodFacetOptions,
    bloodValue,
    handleBloodSelect,
    handleBloodReset
  ]);

  // 7. Filter Counts & State
  const hasSearchFilter = Boolean(searchQuery && searchQuery.trim().length > 0);
  const hasProfileFilter = profileValue.length > 0;
  const hasGenderFilter = genderValue.length > 0;
  const hasStatusFilter = statusValue.length > 0;
  const hasBloodFilter = bloodValue.length > 0;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (hasSearchFilter) count++;
    if (hasProfileFilter) count += profileValue.length;
    if (hasGenderFilter) count += genderValue.length;
    if (hasStatusFilter) count += statusValue.length;
    if (hasBloodFilter) count += bloodValue.length;
    return count;
  }, [
    hasSearchFilter,
    hasProfileFilter,
    hasGenderFilter,
    hasStatusFilter,
    hasBloodFilter,
    profileValue.length,
    genderValue.length,
    statusValue.length,
    bloodValue.length
  ]);

  const isFiltered = useMemo(() => {
    return activeFilterCount > 0 || table.getState().columnFilters.length > 0;
  }, [activeFilterCount, table]);

  // 8. Reset All Filters
  const resetAllFilters = useCallback(() => {
    searchEngine.clearQuery();
    nameCol?.setFilterValue(undefined);
    profileCol?.setFilterValue(undefined);
    genderCol?.setFilterValue(undefined);
    statusCol?.setFilterValue(undefined);
    bloodCol?.setFilterValue(undefined);
    table.resetColumnFilters();
    table.resetSorting();
    onReset?.();
  }, [searchEngine, nameCol, profileCol, genderCol, statusCol, bloodCol, table, onReset]);

  return {
    searchQuery,
    handleSearchChange,
    facetGroups,
    activeFilterCount,
    isFiltered,
    resetAllFilters,
    searchEngine
  };
}
