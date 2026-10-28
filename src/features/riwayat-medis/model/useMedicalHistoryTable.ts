'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { Icons } from '@/components/icons';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import type { FacetGroupDefinition, FacetOption } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import { patientInfiniteQueryOptions } from '@/features/data-pasien/api/queries';
import type { Patient, PatientFilters } from '@/features/data-pasien/api/types';
import {
  medicalHistoryColumns,
  type MedicalHistoryTableMeta
} from '../components/medical-history-table/columns';

export function useMedicalHistoryTable() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState<boolean>(false);

  const columnIds = useMemo(
    () => medicalHistoryColumns.map((c) => c.id).filter(Boolean) as string[],
    []
  );

  const [params, setParams] = useQueryStates({
    name: parseAsString,
    gender: parseAsArrayOf(parseAsString, ','),
    status: parseAsArrayOf(parseAsString, ','),
    profile_type: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser<Patient>(columnIds).withDefault([])
  });

  const querySearch = params.name ?? '';
  const queryGender = params.gender?.[0] || null;
  const queryStatus = params.status?.[0] || null;
  const queryProfileType = params.profile_type?.[0] || null;
  const querySort =
    params.sort && params.sort.length > 0
      ? `${params.sort[0].id}:${params.sort[0].desc ? 'desc' : 'asc'}`
      : null;

  const activeFilters = [querySearch, queryGender, queryStatus, queryProfileType, querySort].filter(
    Boolean
  );
  const hasActiveFilters = activeFilters.length > 0;

  // Unified Infinite Query fetching from backend directory endpoint
  const filters: PatientFilters = {
    limit: 30,
    ...(querySearch && { search: querySearch }),
    ...(queryGender && { gender: queryGender }),
    ...(queryStatus && { status: queryStatus }),
    ...(queryProfileType && { profileType: queryProfileType }),
    ...(querySort && { sort: querySort })
  };

  const infiniteQuery = useInfiniteQuery(patientInfiniteQueryOptions(filters));

  const patients = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.patients || []);
  }, [infiniteQuery.data?.pages]);

  const totalPatients = useMemo(() => {
    return infiniteQuery.data?.pages[0]?.total_patients ?? patients.length;
  }, [infiniteQuery.data?.pages, patients.length]);

  const openPatientHistory = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setIsGridModalOpen(true);
  }, []);

  const closePatientHistory = useCallback(() => {
    setIsGridModalOpen(false);
    setSelectedPatient(null);
  }, []);

  // Sentinel intersection observer for continuous infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (
        target?.isIntersecting &&
        infiniteQuery.hasNextPage &&
        !infiniteQuery.isFetchingNextPage
      ) {
        void infiniteQuery.fetchNextPage();
      }
    },
    [infiniteQuery]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !infiniteQuery.hasNextPage) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
      threshold: 0.1
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, infiniteQuery.hasNextPage]);

  const meta = useMemo<MedicalHistoryTableMeta>(
    () => ({
      onViewPatientHistory: openPatientHistory
    }),
    [openPatientHistory]
  );

  const { table } = useDataTable({
    data: patients,
    columns: medicalHistoryColumns,
    pageCount: 1,
    shallow: true,
    debounceMs: 300,
    meta,
    manualFiltering: true,
    manualSorting: false,
    manualPagination: true,
    getSubRows: hasActiveFilters
      ? undefined
      : (row) => (row.affiliates && row.affiliates.length > 0 ? row.affiliates : undefined),
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] },
      expanded: true,
      pagination: {
        pageSize: 10000,
        pageIndex: 0
      }
    }
  });

  // Search Engine Dialog Indexing
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];
    const seenPatients = new Set<string>();
    const seenRm = new Set<string>();
    const seenNik = new Set<string>();

    patients.forEach((p) => {
      if (p.name && !seenPatients.has(p.name)) {
        seenPatients.add(p.name);
        items.push({
          id: `pat-${p.id}`,
          title: p.name,
          subtitle: `No. RM: ${p.patient_id || '-'} • NIK: ${p.masked_nik || '-'}`,
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
          title: `NIK: ${p.masked_nik}`,
          subtitle: p.name,
          category: 'Nomor Identitas (NIK)',
          icon: Icons.text,
          queryValue: p.nik
        });
      }
    });

    return items;
  }, [patients]);

  const handleSearchChange = useCallback(
    (q: string) => {
      void setParams({ name: q ? q : null });
    },
    [setParams]
  );

  const searchEngine = useStateSearchEngine({
    query: querySearch,
    onQueryChange: handleSearchChange,
    id: 'riwayat-medis-search',
    title: 'Pencarian Riwayat Medis',
    description: 'Cari pasien berdasarkan nama, nomor RM, atau NIK',
    placeholder: 'Ketik nama pasien, no RM, NIK...',
    indexItems
  });

  // Dynamic Facets for ResponsiveFacetToolbox
  const profileCounts = useMemo(() => {
    const counts: Record<string, number> = { master: 0, affiliate: 0 };
    patients.forEach((p) => {
      if (p.is_master) {
        counts.master++;
      } else {
        counts.affiliate++;
      }
    });
    return counts;
  }, [patients]);

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

  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = { female: 0, male: 0 };
    patients.forEach((p) => {
      if (p.gender === 'female') counts.female++;
      else if (p.gender === 'male') counts.male++;
    });
    return counts;
  }, [patients]);

  const genderFacetOptions: FacetOption[] = useMemo(
    () => [
      {
        label: 'Perempuan',
        value: 'female',
        count: genderCounts.female,
        icon: Icons.user
      },
      {
        label: 'Laki-laki',
        value: 'male',
        count: genderCounts.male,
        icon: Icons.user
      }
    ],
    [genderCounts]
  );

  const handleProfileSelect = useCallback(
    (val: string) => {
      const current = params.profile_type ?? [];
      const next = toggleItem(current, val);
      void setParams({ profile_type: next.length > 0 ? next : null });
    },
    [params.profile_type, setParams]
  );

  const handleProfileReset = useCallback(() => {
    void setParams({ profile_type: null });
  }, [setParams]);

  const handleGenderSelect = useCallback(
    (val: string) => {
      const current = params.gender ?? [];
      const next = toggleItem(current, val);
      void setParams({ gender: next.length > 0 ? next : null });
    },
    [params.gender, setParams]
  );

  const handleGenderReset = useCallback(() => {
    void setParams({ gender: null });
  }, [setParams]);

  const facetGroups = useMemo<FacetGroupDefinition[]>(
    () => [
      {
        id: 'profile_type',
        title: 'Status Profil',
        icon: Icons.users,
        options: profileFacetOptions,
        selectedValues: params.profile_type ?? [],
        onSelect: handleProfileSelect,
        onReset: handleProfileReset
      },
      {
        id: 'gender',
        title: 'Gender',
        icon: Icons.user,
        options: genderFacetOptions,
        selectedValues: params.gender ?? [],
        onSelect: handleGenderSelect,
        onReset: handleGenderReset
      }
    ],
    [
      profileFacetOptions,
      params.profile_type,
      handleProfileSelect,
      handleProfileReset,
      genderFacetOptions,
      params.gender,
      handleGenderSelect,
      handleGenderReset
    ]
  );

  const resetAllFilters = useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
    void setParams({
      name: null,
      gender: null,
      status: null,
      profile_type: null,
      sort: []
    });
  }, [setParams, table]);

  return {
    table,
    patients,
    searchQuery: querySearch,
    handleSearchChange,
    searchEngine,
    facetGroups,
    activeFilterCount: activeFilters.length,
    isFiltered: hasActiveFilters,
    resetAllFilters,
    selectedPatient,
    isGridModalOpen,
    openPatientHistory,
    closePatientHistory,
    isLoading: infiniteQuery.isLoading,
    isFetching: infiniteQuery.isFetching,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: Boolean(infiniteQuery.hasNextPage),
    fetchNextPage: infiniteQuery.fetchNextPage,
    totalPatients,
    sentinelRef
  };
}
