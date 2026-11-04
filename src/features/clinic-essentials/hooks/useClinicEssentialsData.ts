'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Building2,
  ClipboardList,
  DoorOpen,
  Folder,
  Layers,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import type { SearchEngineResultItem } from '@/components/search-engine';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import type { FacilityResource } from '../types/clinic-essentials.types';

export function useClinicEssentialsData(
  activeTab: FacilityResource,
  setActiveTab: (tab: FacilityResource) => void,
  isCompact: boolean
) {
  const queryClient = useQueryClient();

  // 0. Fetch Unit Types
  const {
    data: unitTypes = [],
    isLoading: isLoadingUnitTypes,
    isRefetching: isRefetchingUnitTypes,
  } = useQuery({
    queryKey: clinicEssentialsKeys.unitTypes(),
    queryFn: () => clinicEssentialsApi.getUnitTypes(),
  });

  // 1. Fetch Units
  const {
    data: units = [],
    isLoading: isLoadingUnits,
    isRefetching: isRefetchingUnits,
  } = useQuery({
    queryKey: clinicEssentialsKeys.units(),
    queryFn: () => clinicEssentialsApi.getUnits(),
  });

  // 2. Fetch Rooms
  const {
    data: rooms = [],
    isLoading: isLoadingRooms,
    isRefetching: isRefetchingRooms,
  } = useQuery({
    queryKey: clinicEssentialsKeys.rooms(),
    queryFn: () => clinicEssentialsApi.getRooms(),
  });

  // 3. Fetch Categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isRefetching: isRefetchingCategories,
  } = useQuery({
    queryKey: clinicEssentialsKeys.categories(),
    queryFn: () => clinicEssentialsApi.getCategories(),
  });

  // 4. Fetch Services
  const {
    data: services = [],
    isLoading: isLoadingServices,
    isRefetching: isRefetchingServices,
  } = useQuery({
    queryKey: clinicEssentialsKeys.services(),
    queryFn: () => clinicEssentialsApi.getServices(),
  });

  // 5. Fetch Forms
  const {
    data: forms = [],
    isLoading: isLoadingForms,
    isRefetching: isRefetchingForms,
  } = useQuery({
    queryKey: clinicEssentialsKeys.forms(),
    queryFn: () => clinicEssentialsApi.getForms(),
  });

  // 6. Fetch Relationships
  const {
    data: relationships = [],
    isLoading: isLoadingRelationships,
    isRefetching: isRefetchingRelationships,
  } = useQuery({
    queryKey: clinicEssentialsKeys.relationships(),
    queryFn: () => clinicEssentialsApi.getRelationships(),
  });

  const isAnyRefetching =
    isRefetchingUnitTypes ||
    isRefetchingUnits ||
    isRefetchingRooms ||
    isRefetchingCategories ||
    isRefetchingServices ||
    isRefetchingForms ||
    isRefetchingRelationships;

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
    return unitTypes.filter((ut) => {
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
    return units.filter((u) => {
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
    return rooms.filter((r) => {
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
    return categories.filter((c) => {
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
    return services.filter((s) => {
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

  const filteredRelationships = React.useMemo(() => {
    return relationships.filter((r) => {
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
    const items: SearchEngineResultItem[] = [];

    unitTypes.forEach((ut) => {
      items.push({
        id: `unit-type-${ut.id}`,
        title: ut.name,
        subtitle: 'Klasifikasi Tipe Unit',
        category: 'Tipe Unit',
        icon: Layers,
        queryValue: ut.name,
        onSelect: () => {
          setActiveTab('unit-types');
          setSearchQuery(ut.name);
        },
      });
    });

    units.forEach((u) => {
      items.push({
        id: `unit-${u.id}`,
        title: u.name,
        subtitle: u.location ? `Unit Poliklinik • ${u.location}` : 'Unit Poliklinik',
        category: 'Unit Poliklinik',
        icon: Building2,
        queryValue: u.name,
        onSelect: () => {
          setActiveTab('units');
          setSearchQuery(u.name);
        },
      });
    });

    rooms.forEach((r) => {
      const parentUnit = units.find((u) => u.id === r.unitId);
      const parentName = r.unitName || parentUnit?.name;
      items.push({
        id: `room-${r.id}`,
        title: r.name,
        subtitle: parentName ? `Ruang Periksa • ${parentName}` : 'Ruang Periksa',
        category: 'Ruang Periksa',
        icon: DoorOpen,
        queryValue: r.name,
        onSelect: () => {
          setActiveTab('rooms');
          setSearchQuery(r.name);
        },
      });
    });

    categories.forEach((c) => {
      const parentUnit = units.find((u) => u.id === c.unitId);
      const parentName = c.unitName || parentUnit?.name;
      items.push({
        id: `cat-${c.id}`,
        title: c.name,
        subtitle: parentName ? `Kelompok Layanan • ${parentName}` : 'Kelompok Layanan',
        category: 'Kategori Layanan',
        icon: Folder,
        queryValue: c.name,
        onSelect: () => {
          setActiveTab('categories');
          setSearchQuery(c.name);
        },
      });
    });

    services.forEach((s) => {
      const parentCat = categories.find((c) => c.id === s.serviceCategoryId);
      const parentName = s.categoryName || parentCat?.name;
      items.push({
        id: `svc-${s.id}`,
        title: s.name,
        subtitle: parentName ? `Layanan Medis • ${parentName}` : 'Layanan Medis',
        category: 'Layanan Medis',
        icon: Stethoscope,
        queryValue: `${s.name} ${s.shortName || ''}`,
        onSelect: () => {
          setActiveTab('services');
          setSearchQuery(s.name);
        },
      });
    });

    relationships.forEach((rel) => {
      items.push({
        id: `rel-${rel.id}`,
        title: rel.name,
        subtitle: `Relasi Pasien • ${rel.code}`,
        category: 'Relasi Pasien',
        icon: Users,
        queryValue: `${rel.name} ${rel.code}`,
        onSelect: () => {
          setActiveTab('relationships');
          setSearchQuery(rel.name);
        },
      });
    });

    return items;
  }, [unitTypes, units, rooms, categories, services, relationships, setActiveTab]);

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
    filteredRelationships.length,
    setActiveTab,
  ]);

  return {
    unitTypes,
    units,
    rooms,
    categories,
    services,
    forms,
    relationships,
    isLoadingUnitTypes,
    isLoadingUnits,
    isLoadingRooms,
    isLoadingCategories,
    isLoadingServices,
    isLoadingRelationships,
    filteredUnitTypes,
    filteredUnits,
    filteredRooms,
    filteredCategories,
    filteredServices,
    filteredRelationships,
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
