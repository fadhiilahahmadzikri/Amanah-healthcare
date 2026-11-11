'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, HelpCircle, Tag } from 'lucide-react';
import { Icons } from '@/components/icons';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import type { SearchEngineResultItem } from '@/components/search-engine';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import type { FacilityResource } from '../types/clinic-essentials.types';
import { buildClinicEssentialsSearchIndex } from '../utils/clinic-essentials-search-index';
import { promotionsApi } from '@/features/promotions';
import {
  CLINIC_ESSENTIALS_TOOLBAR_REGISTRY,
  type ResourceToolbarConfig
} from '../config/clinic-essentials-toolbar.config';

export interface TabFilterState {
  searchQuery: string;
  unitFilter: string;
  statusFilter: string;
  categoryFilter: string;
}

const DEFAULT_TAB_FILTER_STATE: TabFilterState = {
  searchQuery: '',
  unitFilter: 'all',
  statusFilter: 'all',
  categoryFilter: 'all',
};

function filterDemographicMaster<
  T extends { name: string; description?: string | null; isActive: boolean }
>(items: T[], statusFilter: string, query: string): T[] {
  return (Array.isArray(items) ? items : []).filter((item) => {
    if (statusFilter === 'active' && !item.isActive) return false;
    if (statusFilter === 'inactive' && item.isActive) return false;
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      Boolean(item.description?.toLowerCase().includes(query))
    );
  });
}

export function useClinicEssentialsData(
  activeTab: FacilityResource,
  setActiveTab: (tab: FacilityResource) => void,
  isCompact: boolean
) {
  const queryClient = useQueryClient();

  // Master & Entity Queries cached via TanStack Query
  const { data: unitTypes = [], isLoading: isLoadingUnitTypes, isRefetching: isRefetchingUnitTypes } = useQuery({
    queryKey: clinicEssentialsKeys.unitTypes(),
    queryFn: () => clinicEssentialsApi.getUnitTypes(),
    staleTime: 300_000,
  });
  const { data: units = [], isLoading: isLoadingUnits, isRefetching: isRefetchingUnits } = useQuery({
    queryKey: clinicEssentialsKeys.units(),
    queryFn: () => clinicEssentialsApi.getUnits(),
    staleTime: 300_000,
  });
  const { data: rooms = [], isLoading: isLoadingRooms, isRefetching: isRefetchingRooms } = useQuery({
    queryKey: clinicEssentialsKeys.rooms(),
    queryFn: () => clinicEssentialsApi.getRooms(),
    staleTime: 300_000,
  });
  const { data: categories = [], isLoading: isLoadingCategories, isRefetching: isRefetchingCategories } = useQuery({
    queryKey: clinicEssentialsKeys.categories(),
    queryFn: () => clinicEssentialsApi.getCategories(),
    staleTime: 300_000,
  });
  const { data: services = [], isLoading: isLoadingServices, isRefetching: isRefetchingServices } = useQuery({
    queryKey: clinicEssentialsKeys.services(),
    queryFn: () => clinicEssentialsApi.getServices(),
    staleTime: 300_000,
  });
  const { data: facilities = [], isLoading: isLoadingFacilities, isRefetching: isRefetchingFacilities } = useQuery({
    queryKey: clinicEssentialsKeys.facilities(),
    queryFn: () => clinicEssentialsApi.getFacilities(),
    staleTime: 300_000,
  });
  const { data: faqs = [], isLoading: isLoadingFaqs, isRefetching: isRefetchingFaqs } = useQuery({
    queryKey: clinicEssentialsKeys.faqs(),
    queryFn: () => clinicEssentialsApi.getFaqs(),
    staleTime: 300_000,
  });
  const { data: forms = [], isRefetching: isRefetchingForms } = useQuery({
    queryKey: clinicEssentialsKeys.forms(),
    queryFn: () => clinicEssentialsApi.getForms(),
    staleTime: 300_000,
  });
  const { data: relationships = [], isLoading: isLoadingRelationships, isRefetching: isRefetchingRelationships } = useQuery({
    queryKey: clinicEssentialsKeys.relationships(),
    queryFn: () => clinicEssentialsApi.getRelationships(),
    staleTime: 300_000,
  });
  const { data: bloodTypes = [], isLoading: isLoadingBloodTypes, isRefetching: isRefetchingBloodTypes } = useQuery({
    queryKey: clinicEssentialsKeys.bloodTypes(),
    queryFn: () => clinicEssentialsApi.getBloodTypes(),
    staleTime: 300_000,
  });
  const { data: educationLevels = [], isLoading: isLoadingEducationLevels, isRefetching: isRefetchingEducationLevels } = useQuery({
    queryKey: clinicEssentialsKeys.educationLevels(),
    queryFn: () => clinicEssentialsApi.getEducationLevels(),
    staleTime: 300_000,
  });
  const { data: religions = [], isLoading: isLoadingReligions, isRefetching: isRefetchingReligions } = useQuery({
    queryKey: clinicEssentialsKeys.religions(),
    queryFn: () => clinicEssentialsApi.getReligions(),
    staleTime: 300_000,
  });
  const { data: occupations = [], isLoading: isLoadingOccupations, isRefetching: isRefetchingOccupations } = useQuery({
    queryKey: clinicEssentialsKeys.occupations(),
    queryFn: () => clinicEssentialsApi.getOccupations(),
    staleTime: 300_000,
  });
  const { data: promotions = [], isLoading: isLoadingPromotions, isRefetching: isRefetchingPromotions } = useQuery({
    queryKey: clinicEssentialsKeys.promotions(),
    queryFn: () => promotionsApi.getAdminPromotions(),
    staleTime: 300_000,
  });

  const isAnyRefetching = [
    isRefetchingUnitTypes, isRefetchingUnits, isRefetchingRooms, isRefetchingCategories,
    isRefetchingServices, isRefetchingFacilities, isRefetchingFaqs, isRefetchingPromotions,
    isRefetchingForms, isRefetchingRelationships, isRefetchingBloodTypes, isRefetchingEducationLevels,
    isRefetchingReligions, isRefetchingOccupations
  ].some(Boolean);

  const handleRefreshAll = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.promotions() });
    toast.info('Memperbarui data fasilitas...');
  }, [queryClient]);

  // Contextual per-tab search and filter state
  const [tabFilterStates, setTabFilterStates] = React.useState<Record<FacilityResource, TabFilterState>>({
    'unit-types': { ...DEFAULT_TAB_FILTER_STATE },
    'units': { ...DEFAULT_TAB_FILTER_STATE },
    'rooms': { ...DEFAULT_TAB_FILTER_STATE },
    'categories': { ...DEFAULT_TAB_FILTER_STATE },
    'services': { ...DEFAULT_TAB_FILTER_STATE },
    'facilities': { ...DEFAULT_TAB_FILTER_STATE },
    'faqs': { ...DEFAULT_TAB_FILTER_STATE },
    'promotions': { ...DEFAULT_TAB_FILTER_STATE },
    'relationships': { ...DEFAULT_TAB_FILTER_STATE },
    'blood-types': { ...DEFAULT_TAB_FILTER_STATE },
    'education-levels': { ...DEFAULT_TAB_FILTER_STATE },
    'religions': { ...DEFAULT_TAB_FILTER_STATE },
    'occupations': { ...DEFAULT_TAB_FILTER_STATE },
  });

  const activeFilter = tabFilterStates[activeTab] || DEFAULT_TAB_FILTER_STATE;
  const currentConfig: ResourceToolbarConfig = CLINIC_ESSENTIALS_TOOLBAR_REGISTRY[activeTab];

  const setSearchQuery = React.useCallback((query: string) => {
    setTabFilterStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || DEFAULT_TAB_FILTER_STATE),
        searchQuery: query,
      },
    }));
  }, [activeTab]);

  const setUnitFilter = React.useCallback((unit: string) => {
    setTabFilterStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || DEFAULT_TAB_FILTER_STATE),
        unitFilter: unit,
      },
    }));
  }, [activeTab]);

  const setStatusFilter = React.useCallback((status: string) => {
    setTabFilterStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || DEFAULT_TAB_FILTER_STATE),
        statusFilter: status,
      },
    }));
  }, [activeTab]);

  const setCategoryFilter = React.useCallback((category: string) => {
    setTabFilterStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || DEFAULT_TAB_FILTER_STATE),
        categoryFilter: category,
      },
    }));
  }, [activeTab]);

  const handleResetAll = React.useCallback(() => {
    setTabFilterStates((prev) => ({
      ...prev,
      [activeTab]: { ...DEFAULT_TAB_FILTER_STATE },
    }));
  }, [activeTab]);

  // Tab-specific filtered data
  const filteredUnitTypes = React.useMemo(() => {
    const { searchQuery, statusFilter } = tabFilterStates['unit-types'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(unitTypes) ? unitTypes : []).filter((ut) => {
      if (statusFilter === 'active' && !ut.isActive) return false;
      if (statusFilter === 'inactive' && ut.isActive) return false;
      if (!q) return true;
      return (
        ut.name.toLowerCase().includes(q) ||
        ut.code.toLowerCase().includes(q) ||
        Boolean(ut.description?.toLowerCase().includes(q))
      );
    });
  }, [unitTypes, tabFilterStates]);

  const filteredUnits = React.useMemo(() => {
    const { searchQuery, statusFilter } = tabFilterStates['units'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(units) ? units : []).filter((u) => {
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        Boolean(u.location?.toLowerCase().includes(q)) ||
        Boolean(u.floor?.toLowerCase().includes(q)) ||
        Boolean(u.queuePrefix?.toLowerCase().includes(q))
      );
    });
  }, [units, tabFilterStates]);

  const filteredRooms = React.useMemo(() => {
    const { searchQuery, statusFilter, unitFilter } = tabFilterStates['rooms'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(rooms) ? rooms : []).filter((r) => {
      if (unitFilter !== 'all' && r.unitId !== unitFilter) return false;
      if (statusFilter === 'active' && !r.isActive) return false;
      if (statusFilter === 'inactive' && r.isActive) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        Boolean(r.location?.toLowerCase().includes(q)) ||
        Boolean(r.floor?.toLowerCase().includes(q))
      );
    });
  }, [rooms, tabFilterStates]);

  const filteredCategories = React.useMemo(() => {
    const { searchQuery, statusFilter, unitFilter } = tabFilterStates['categories'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(categories) ? categories : []).filter((c) => {
      if (unitFilter !== 'all' && c.unitId && c.unitId !== unitFilter) return false;
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        Boolean(c.codePrefix?.toLowerCase().includes(q)) ||
        Boolean(c.description?.toLowerCase().includes(q))
      );
    });
  }, [categories, tabFilterStates]);

  const filteredServices = React.useMemo(() => {
    const { searchQuery, statusFilter, unitFilter } = tabFilterStates['services'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(services) ? services : []).filter((s) => {
      const parentCat = categories.find((c) => c.id === s.serviceCategoryId);
      if (unitFilter !== 'all' && parentCat?.unitId && parentCat.unitId !== unitFilter) {
        return false;
      }
      if (statusFilter === 'active' && !s.isActive) return false;
      if (statusFilter === 'inactive' && s.isActive) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        Boolean(s.codePrefix?.toLowerCase().includes(q)) ||
        Boolean(s.shortName?.toLowerCase().includes(q)) ||
        Boolean(s.description?.toLowerCase().includes(q))
      );
    });
  }, [services, categories, tabFilterStates]);

  const filteredFacilities = React.useMemo(() => {
    const { searchQuery, statusFilter } = tabFilterStates['facilities'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(facilities) ? facilities : []).filter((f) => {
      if (statusFilter === 'active' && !f.isPublished) return false;
      if (statusFilter === 'inactive' && f.isPublished) return false;
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        f.slug.toLowerCase().includes(q) ||
        Boolean(f.summary?.toLowerCase().includes(q)) ||
        Boolean(f.serviceName?.toLowerCase().includes(q))
      );
    });
  }, [facilities, tabFilterStates]);

  const filteredFaqs = React.useMemo(() => {
    const { searchQuery, statusFilter, categoryFilter } = tabFilterStates['faqs'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(faqs) ? faqs : []).filter((f) => {
      if (statusFilter === 'active' && !f.isPublished) return false;
      if (statusFilter === 'inactive' && f.isPublished) return false;
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
      if (!q) return true;
      const matchTitle = f.title.toLowerCase().includes(q);
      const matchCategory = f.category.toLowerCase().includes(q);
      const matchSteps = Array.isArray(f.solutionSteps)
        ? f.solutionSteps.some((s) => s.toLowerCase().includes(q))
        : String(f.solutionSteps).toLowerCase().includes(q);
      return matchTitle || matchCategory || matchSteps;
    });
  }, [faqs, tabFilterStates]);

  const filteredPromotions = React.useMemo(() => {
    const { searchQuery, statusFilter } = tabFilterStates['promotions'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(promotions) ? promotions : []).filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.summary && p.summary.toLowerCase().includes(q)) ||
        Boolean(p.serviceName?.toLowerCase().includes(q))
      );
    });
  }, [promotions, tabFilterStates]);

  const filteredRelationships = React.useMemo(() => {
    const { searchQuery, statusFilter } = tabFilterStates['relationships'];
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(relationships) ? relationships : []).filter((r) => {
      if (statusFilter === 'active' && !r.isActive) return false;
      if (statusFilter === 'inactive' && r.isActive) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        Boolean(r.description?.toLowerCase().includes(q))
      );
    });
  }, [relationships, tabFilterStates]);

  const filteredBloodTypes = React.useMemo(
    () => filterDemographicMaster(bloodTypes, tabFilterStates['blood-types'].statusFilter, tabFilterStates['blood-types'].searchQuery.trim().toLowerCase()),
    [bloodTypes, tabFilterStates]
  );

  const filteredEducationLevels = React.useMemo(
    () => filterDemographicMaster(educationLevels, tabFilterStates['education-levels'].statusFilter, tabFilterStates['education-levels'].searchQuery.trim().toLowerCase()),
    [educationLevels, tabFilterStates]
  );

  const filteredReligions = React.useMemo(
    () => filterDemographicMaster(religions, tabFilterStates['religions'].statusFilter, tabFilterStates['religions'].searchQuery.trim().toLowerCase()),
    [religions, tabFilterStates]
  );

  const filteredOccupations = React.useMemo(
    () => filterDemographicMaster(occupations, tabFilterStates['occupations'].statusFilter, tabFilterStates['occupations'].searchQuery.trim().toLowerCase()),
    [occupations, tabFilterStates]
  );

  // Hierarchical Lock Logic
  const isUnitsLocked = unitTypes.length === 0;
  const isRoomsLocked = units.length === 0;
  const isCategoriesLocked = units.length === 0;
  const isServicesLocked = categories.length === 0;

  // Auto-redirect if active tab is locked
  React.useEffect(() => {
    if (activeTab === 'units' && isUnitsLocked) {
      setActiveTab('unit-types');
    } else if (activeTab === 'rooms' && isRoomsLocked) {
      setActiveTab('unit-types');
    } else if (activeTab === 'categories' && isCategoriesLocked) {
      setActiveTab('unit-types');
    } else if (activeTab === 'services' && isServicesLocked) {
      setActiveTab(isCategoriesLocked ? 'unit-types' : 'categories');
    }
  }, [activeTab, isUnitsLocked, isRoomsLocked, isCategoriesLocked, isServicesLocked, setActiveTab]);

  // Contextual Dynamic Facets for Active Tab
  const dynamicFacets = React.useMemo<FacetGroupDefinition[]>(() => {
    const facets: FacetGroupDefinition[] = [];
    const supported = currentConfig.supportedFacets;

    // 1. Unit Induk Facet (Only if supported by activeTab, e.g. rooms, categories, services)
    if (supported.includes('unit')) {
      const unitOptions = units.map((u) => ({
        label: u.name,
        value: u.id,
      }));

      facets.push({
        id: 'unit',
        title: 'Unit Induk',
        icon: Building2,
        mode: 'single',
        options: unitOptions,
        selectedValues: activeFilter.unitFilter !== 'all' ? [activeFilter.unitFilter] : [],
        onSelect: (val) => setUnitFilter(val === activeFilter.unitFilter ? 'all' : val),
        onReset: () => setUnitFilter('all'),
        popoverWidth: 'w-56',
        resetLabel: 'Semua Unit',
      });
    }

    // 2. Promotion Status Facet (Only for promotions tab)
    if (supported.includes('promo-status')) {
      facets.push({
        id: 'promo-status',
        title: 'Status Promosi',
        icon: Tag,
        mode: 'single',
        options: [
          { label: 'Live', value: 'live', dotColor: '#10b981' },
          { label: 'Terjadwal', value: 'scheduled', dotColor: '#3b82f6' },
          { label: 'Draf', value: 'draft', dotColor: '#f59e0b' },
          { label: 'Kedaluwarsa', value: 'expired', dotColor: '#64748b' },
          { label: 'Diarsipkan', value: 'archived', dotColor: '#ef4444' },
        ],
        selectedValues: activeFilter.statusFilter !== 'all' ? [activeFilter.statusFilter] : [],
        onSelect: (val) => setStatusFilter(val === activeFilter.statusFilter ? 'all' : val),
        onReset: () => setStatusFilter('all'),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Status',
      });
    }

    // 3. FAQ Category Facet (Only for faqs tab)
    if (supported.includes('faq-category')) {
      facets.push({
        id: 'faq-category',
        title: 'Kategori FAQ',
        icon: HelpCircle,
        mode: 'single',
        options: [
          { label: 'Umum', value: 'general' },
          { label: 'Pendaftaran', value: 'registration' },
          { label: 'Pelayanan Medis', value: 'medical' },
          { label: 'Fasilitas', value: 'facility' },
        ],
        selectedValues: activeFilter.categoryFilter !== 'all' ? [activeFilter.categoryFilter] : [],
        onSelect: (val) => setCategoryFilter(val === activeFilter.categoryFilter ? 'all' : val),
        onReset: () => setCategoryFilter('all'),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Kategori',
      });
    }

    // 4. Standard Status Facet (Active/Inactive or Published/Draft)
    if (supported.includes('status')) {
      const isContentTab = activeTab === 'facilities' || activeTab === 'faqs';
      facets.push({
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'single',
        options: [
          { label: isContentTab ? 'Tayang' : 'Aktif', value: 'active', dotColor: '#10b981' },
          { label: isContentTab ? 'Draf' : 'Nonaktif', value: 'inactive', dotColor: '#64748b' },
        ],
        selectedValues: activeFilter.statusFilter !== 'all' ? [activeFilter.statusFilter] : [],
        onSelect: (val) => setStatusFilter(val === activeFilter.statusFilter ? 'all' : val),
        onReset: () => setStatusFilter('all'),
        popoverWidth: 'w-44',
        resetLabel: 'Semua Status',
      });
    }

    return facets;
  }, [
    currentConfig,
    activeTab,
    units,
    activeFilter.unitFilter,
    activeFilter.statusFilter,
    activeFilter.categoryFilter,
    setUnitFilter,
    setStatusFilter,
    setCategoryFilter
  ]);

  const isFiltered = Boolean(activeFilter.searchQuery.trim()) ||
    activeFilter.unitFilter !== 'all' ||
    activeFilter.statusFilter !== 'all' ||
    activeFilter.categoryFilter !== 'all';

  const activeFilterCount = [
    activeFilter.unitFilter !== 'all',
    activeFilter.statusFilter !== 'all',
    activeFilter.categoryFilter !== 'all',
  ].filter(Boolean).length;

  const indexItems = React.useMemo<SearchEngineResultItem[]>(() => {
    return buildClinicEssentialsSearchIndex({
      unitTypes,
      units,
      rooms,
      categories,
      services,
      relationships,
      facilities,
      faqs,
      setActiveTab,
      setSearchQuery,
    });
  }, [unitTypes, units, rooms, categories, services, relationships, facilities, faqs, setActiveTab, setSearchQuery]);

  const effectiveFacetGroups = React.useMemo<FacetGroupDefinition[]>(() => {
    if (!isCompact) return dynamicFacets;

    const entityFacet: FacetGroupDefinition = {
      id: 'entityTab',
      title: 'Bagian Fasilitas',
      icon: Building2,
      mode: 'single',
      options: [
        { label: 'Klasifikasi Fasilitas', value: 'unit-types', count: filteredUnitTypes.length },
        { label: 'Poliklinik & Departemen', value: 'units', count: filteredUnits.length },
        { label: 'Ruang Periksa', value: 'rooms', count: filteredRooms.length },
        { label: 'Kelompok Layanan', value: 'categories', count: filteredCategories.length },
        { label: 'Service Medis', value: 'services', count: filteredServices.length },
        { label: 'Fasilitas Unggulan', value: 'facilities', count: filteredFacilities.length },
        { label: 'FAQ Landing Page', value: 'faqs', count: filteredFaqs.length },
        { label: 'Promo & Pengumuman', value: 'promotions', count: filteredPromotions.length },
        { label: 'Relasi Pasien', value: 'relationships', count: filteredRelationships.length },
        { label: 'Golongan Darah', value: 'blood-types', count: filteredBloodTypes.length },
        { label: 'Pendidikan', value: 'education-levels', count: filteredEducationLevels.length },
        { label: 'Agama', value: 'religions', count: filteredReligions.length },
        { label: 'Pekerjaan', value: 'occupations', count: filteredOccupations.length },
      ],
      selectedValues: [activeTab],
      onSelect: (val) => {
        if (val) {
          setActiveTab(val as FacilityResource);
        }
      },
      onReset: () => {
        setActiveTab('units');
      },
      popoverWidth: 'w-60',
      resetLabel: 'Poliklinik & Departemen',
    };

    return [entityFacet, ...dynamicFacets];
  }, [
    isCompact,
    dynamicFacets,
    activeTab,
    filteredUnitTypes.length,
    filteredUnits.length,
    filteredRooms.length,
    filteredCategories.length,
    filteredServices.length,
    filteredFacilities.length,
    filteredFaqs.length,
    filteredPromotions.length,
    filteredRelationships.length,
    filteredBloodTypes.length,
    filteredEducationLevels.length,
    filteredReligions.length,
    filteredOccupations.length,
    setActiveTab,
  ]);

  return {
    unitTypes,
    units,
    rooms,
    categories,
    services,
    facilities,
    faqs,
    promotions,
    forms,
    relationships,
    bloodTypes,
    educationLevels,
    religions,
    occupations,
    isLoadingUnitTypes,
    isLoadingUnits,
    isLoadingRooms,
    isLoadingCategories,
    isLoadingServices,
    isLoadingFacilities,
    isLoadingFaqs,
    isLoadingPromotions,
    isLoadingRelationships,
    isLoadingBloodTypes,
    isLoadingEducationLevels,
    isLoadingReligions,
    isLoadingOccupations,
    filteredUnitTypes,
    filteredUnits,
    filteredRooms,
    filteredCategories,
    filteredServices,
    filteredFacilities,
    filteredFaqs,
    filteredPromotions,
    filteredRelationships,
    filteredBloodTypes,
    filteredEducationLevels,
    filteredReligions,
    filteredOccupations,
    isUnitsLocked,
    isRoomsLocked,
    isCategoriesLocked,
    isServicesLocked,
    searchQuery: activeFilter.searchQuery,
    setSearchQuery,
    unitFilter: activeFilter.unitFilter,
    setUnitFilter,
    statusFilter: activeFilter.statusFilter,
    setStatusFilter,
    categoryFilter: activeFilter.categoryFilter,
    setCategoryFilter,
    currentConfig,
    isFiltered,
    activeFilterCount,
    handleResetAll,
    effectiveFacetGroups,
    indexItems,
    isAnyRefetching,
    handleRefreshAll,
  };
}
