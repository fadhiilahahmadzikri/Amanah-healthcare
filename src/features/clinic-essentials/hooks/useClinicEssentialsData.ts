'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import type { SearchEngineResultItem } from '@/components/search-engine';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import type { FacilityResource } from '../types/clinic-essentials.types';
import { buildClinicEssentialsSearchIndex } from '../utils/clinic-essentials-search-index';
import { promotionsApi } from '@/features/promotions';

function filterDemographicMaster<
  T extends { name: string; description?: string | null; isActive: boolean }
>(items: T[], statusFilter: 'all' | 'active' | 'inactive', query: string): T[] {
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

  // Master & Entity Queries
  const { data: unitTypes = [], isLoading: isLoadingUnitTypes, isRefetching: isRefetchingUnitTypes } = useQuery({
    queryKey: clinicEssentialsKeys.unitTypes(),
    queryFn: () => clinicEssentialsApi.getUnitTypes(),
  });
  const { data: units = [], isLoading: isLoadingUnits, isRefetching: isRefetchingUnits } = useQuery({
    queryKey: clinicEssentialsKeys.units(),
    queryFn: () => clinicEssentialsApi.getUnits(),
  });
  const { data: rooms = [], isLoading: isLoadingRooms, isRefetching: isRefetchingRooms } = useQuery({
    queryKey: clinicEssentialsKeys.rooms(),
    queryFn: () => clinicEssentialsApi.getRooms(),
  });
  const { data: categories = [], isLoading: isLoadingCategories, isRefetching: isRefetchingCategories } = useQuery({
    queryKey: clinicEssentialsKeys.categories(),
    queryFn: () => clinicEssentialsApi.getCategories(),
  });
  const { data: services = [], isLoading: isLoadingServices, isRefetching: isRefetchingServices } = useQuery({
    queryKey: clinicEssentialsKeys.services(),
    queryFn: () => clinicEssentialsApi.getServices(),
  });
  const { data: facilities = [], isLoading: isLoadingFacilities, isRefetching: isRefetchingFacilities } = useQuery({
    queryKey: clinicEssentialsKeys.facilities(),
    queryFn: () => clinicEssentialsApi.getFacilities(),
  });
  const { data: faqs = [], isLoading: isLoadingFaqs, isRefetching: isRefetchingFaqs } = useQuery({
    queryKey: clinicEssentialsKeys.faqs(),
    queryFn: () => clinicEssentialsApi.getFaqs(),
  });
  const { data: forms = [], isLoading: isLoadingForms, isRefetching: isRefetchingForms } = useQuery({
    queryKey: clinicEssentialsKeys.forms(),
    queryFn: () => clinicEssentialsApi.getForms(),
  });
  const { data: relationships = [], isLoading: isLoadingRelationships, isRefetching: isRefetchingRelationships } = useQuery({
    queryKey: clinicEssentialsKeys.relationships(),
    queryFn: () => clinicEssentialsApi.getRelationships(),
  });
  const { data: bloodTypes = [], isLoading: isLoadingBloodTypes, isRefetching: isRefetchingBloodTypes } = useQuery({
    queryKey: clinicEssentialsKeys.bloodTypes(),
    queryFn: () => clinicEssentialsApi.getBloodTypes(),
  });
  const { data: educationLevels = [], isLoading: isLoadingEducationLevels, isRefetching: isRefetchingEducationLevels } = useQuery({
    queryKey: clinicEssentialsKeys.educationLevels(),
    queryFn: () => clinicEssentialsApi.getEducationLevels(),
  });
  const { data: religions = [], isLoading: isLoadingReligions, isRefetching: isRefetchingReligions } = useQuery({
    queryKey: clinicEssentialsKeys.religions(),
    queryFn: () => clinicEssentialsApi.getReligions(),
  });
  const { data: occupations = [], isLoading: isLoadingOccupations, isRefetching: isRefetchingOccupations } = useQuery({
    queryKey: clinicEssentialsKeys.occupations(),
    queryFn: () => clinicEssentialsApi.getOccupations(),
  });
  const { data: promotions = [], isLoading: isLoadingPromotions, isRefetching: isRefetchingPromotions } = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: () => promotionsApi.getAdminPromotions(),
  });

  const isAnyRefetching = [
    isRefetchingUnitTypes, isRefetchingUnits, isRefetchingRooms, isRefetchingCategories,
    isRefetchingServices, isRefetchingFacilities, isRefetchingFaqs, isRefetchingPromotions,
    isRefetchingForms, isRefetchingRelationships, isRefetchingBloodTypes, isRefetchingEducationLevels,
    isRefetchingReligions, isRefetchingOccupations
  ].some(Boolean);

  const handleRefreshAll = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    toast.info('Memperbarui data fasilitas...');
  }, [queryClient]);

  // Filter and search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [unitFilter, setUnitFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const query = searchQuery.trim().toLowerCase();

  const filteredUnitTypes = React.useMemo(() => {
    return (Array.isArray(unitTypes) ? unitTypes : []).filter((ut) => {
      if (statusFilter === 'active' && !ut.isActive) return false;
      if (statusFilter === 'inactive' && ut.isActive) return false;
      if (!query) return true;
      return (
        ut.name.toLowerCase().includes(query) ||
        ut.code.toLowerCase().includes(query) ||
        Boolean(ut.description?.toLowerCase().includes(query))
      );
    });
  }, [unitTypes, statusFilter, query]);

  const filteredUnits = React.useMemo(() => {
    return (Array.isArray(units) ? units : []).filter((u) => {
      if (unitFilter !== 'all' && u.id !== unitFilter) return false;
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;
      if (!query) return true;
      return (
        u.name.toLowerCase().includes(query) ||
        u.code.toLowerCase().includes(query) ||
        Boolean(u.location?.toLowerCase().includes(query)) ||
        Boolean(u.floor?.toLowerCase().includes(query)) ||
        Boolean(u.queuePrefix?.toLowerCase().includes(query))
      );
    });
  }, [units, unitFilter, statusFilter, query]);

  const filteredRooms = React.useMemo(() => {
    return (Array.isArray(rooms) ? rooms : []).filter((r) => {
      if (unitFilter !== 'all' && r.unitId !== unitFilter) return false;
      if (statusFilter === 'active' && !r.isActive) return false;
      if (statusFilter === 'inactive' && r.isActive) return false;
      if (!query) return true;
      return (
        r.name.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        Boolean(r.location?.toLowerCase().includes(query)) ||
        Boolean(r.floor?.toLowerCase().includes(query))
      );
    });
  }, [rooms, unitFilter, statusFilter, query]);

  const filteredCategories = React.useMemo(() => {
    return (Array.isArray(categories) ? categories : []).filter((c) => {
      if (unitFilter !== 'all' && c.unitId && c.unitId !== unitFilter) return false;
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        Boolean(c.codePrefix?.toLowerCase().includes(query)) ||
        Boolean(c.description?.toLowerCase().includes(query))
      );
    });
  }, [categories, unitFilter, statusFilter, query]);

  const filteredServices = React.useMemo(() => {
    return (Array.isArray(services) ? services : []).filter((s) => {
      const parentCat = categories.find((c) => c.id === s.serviceCategoryId);
      if (unitFilter !== 'all' && parentCat?.unitId && parentCat.unitId !== unitFilter) {
        return false;
      }
      if (statusFilter === 'active' && !s.isActive) return false;
      if (statusFilter === 'inactive' && s.isActive) return false;
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query) ||
        Boolean(s.codePrefix?.toLowerCase().includes(query)) ||
        Boolean(s.shortName?.toLowerCase().includes(query)) ||
        Boolean(s.description?.toLowerCase().includes(query))
      );
    });
  }, [services, categories, unitFilter, statusFilter, query]);

  const filteredFacilities = React.useMemo(() => {
    return (Array.isArray(facilities) ? facilities : []).filter((f) => {
      if (statusFilter === 'active' && !f.isPublished) return false;
      if (statusFilter === 'inactive' && f.isPublished) return false;
      if (!query) return true;
      return (
        f.title.toLowerCase().includes(query) ||
        f.slug.toLowerCase().includes(query) ||
        Boolean(f.summary?.toLowerCase().includes(query)) ||
        Boolean(f.serviceName?.toLowerCase().includes(query))
      );
    });
  }, [facilities, statusFilter, query]);

  const filteredFaqs = React.useMemo(() => {
    return (Array.isArray(faqs) ? faqs : []).filter((f) => {
      if (statusFilter === 'active' && !f.isPublished) return false;
      if (statusFilter === 'inactive' && f.isPublished) return false;
      if (!query) return true;
      const matchTitle = f.title.toLowerCase().includes(query);
      const matchCategory = f.category.toLowerCase().includes(query);
      const matchSteps = Array.isArray(f.solutionSteps)
        ? f.solutionSteps.some((s) => s.toLowerCase().includes(query))
        : String(f.solutionSteps).toLowerCase().includes(query);
      return matchTitle || matchCategory || matchSteps;
    });
  }, [faqs, statusFilter, query]);

  const filteredPromotions = React.useMemo(() => {
    return (Array.isArray(promotions) ? promotions : []).filter((p) => {
      if (statusFilter === 'active' && !p.isPublished) return false;
      if (statusFilter === 'inactive' && p.isPublished) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        Boolean(p.serviceName?.toLowerCase().includes(query))
      );
    });
  }, [promotions, statusFilter, query]);

  const filteredRelationships = React.useMemo(() => {
    return (Array.isArray(relationships) ? relationships : []).filter((r) => {
      if (statusFilter === 'active' && !r.isActive) return false;
      if (statusFilter === 'inactive' && r.isActive) return false;
      if (!query) return true;
      return (
        r.name.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        Boolean(r.description?.toLowerCase().includes(query))
      );
    });
  }, [relationships, statusFilter, query]);

  const filteredBloodTypes = React.useMemo(
    () => filterDemographicMaster(bloodTypes, statusFilter, query),
    [bloodTypes, statusFilter, query]
  );

  const filteredEducationLevels = React.useMemo(
    () => filterDemographicMaster(educationLevels, statusFilter, query),
    [educationLevels, statusFilter, query]
  );

  const filteredReligions = React.useMemo(
    () => filterDemographicMaster(religions, statusFilter, query),
    [religions, statusFilter, query]
  );

  const filteredOccupations = React.useMemo(
    () => filterDemographicMaster(occupations, statusFilter, query),
    [occupations, statusFilter, query]
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

  const facetGroups = React.useMemo<FacetGroupDefinition[]>(() => {
    const unitOptions = units.map((u) => ({
      label: u.name,
      value: u.id,
    }));

    return [
      {
        id: 'unit',
        title: 'Unit Induk',
        icon: Building2,
        mode: 'single',
        options: unitOptions,
        selectedValues: unitFilter !== 'all' ? [unitFilter] : [],
        onSelect: (val) => setUnitFilter(val === unitFilter ? 'all' : val),
        onReset: () => setUnitFilter('all'),
        popoverWidth: 'w-56',
        resetLabel: 'Semua Unit',
      },
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'single',
        options: [
          { label: 'Aktif', value: 'active', dotColor: '#10b981' },
          { label: 'Nonaktif', value: 'inactive', dotColor: '#64748b' },
        ],
        selectedValues: statusFilter !== 'all' ? [statusFilter] : [],
        onSelect: (val) =>
          setStatusFilter(val === statusFilter ? 'all' : (val as 'active' | 'inactive')),
        onReset: () => setStatusFilter('all'),
        popoverWidth: 'w-44',
        resetLabel: 'Semua Status',
      },
    ];
  }, [units, unitFilter, statusFilter]);

  const isFiltered = Boolean(searchQuery.trim()) || unitFilter !== 'all' || statusFilter !== 'all';
  const activeFilterCount = [unitFilter !== 'all', statusFilter !== 'all'].filter(Boolean).length;

  const handleResetAll = React.useCallback(() => {
    setSearchQuery('');
    setUnitFilter('all');
    setStatusFilter('all');
  }, []);

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
  }, [unitTypes, units, rooms, categories, services, relationships, facilities, faqs, setActiveTab]);

  const effectiveFacetGroups = React.useMemo<FacetGroupDefinition[]>(() => {
    if (!isCompact) return facetGroups;

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
        { label: 'Relasi Pasien', value: 'relationships', count: filteredRelationships.length },
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

    return [entityFacet, ...facetGroups];
  }, [
    isCompact,
    facetGroups,
    activeTab,
    filteredUnitTypes.length,
    filteredUnits.length,
    filteredRooms.length,
    filteredCategories.length,
    filteredServices.length,
    filteredFacilities.length,
    filteredFaqs.length,
    filteredRelationships.length,
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
    searchQuery,
    setSearchQuery,
    unitFilter,
    setUnitFilter,
    statusFilter,
    setStatusFilter,
    isFiltered,
    activeFilterCount,
    handleResetAll,
    effectiveFacetGroups,
    indexItems,
    isAnyRefetching,
    handleRefreshAll,
  };
}
