'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  Folder,
  Layers,
  Lock,
  Plus,
  Power,
  RefreshCw,
  Settings2,
  Stethoscope,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SideTray, SideTrayLayout, type SideTrayItem } from '@/components/ui/side-tray';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';
import { Icons } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import {
  ResponsiveFacetToolbox,
  type FacetGroupDefinition
} from '@/shared/ui/responsive-facet-toolbox';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  SearchEngineDialog,
  useStateSearchEngine,
  type SearchEngineResultItem
} from '@/components/search-engine';

import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import { ClinicEssentialFormModal } from './clinic-essential-form-modal';
import { CategoryServicesDialog } from './dialogs/category-services-dialog';
import { UnitCategoriesDialog } from './dialogs/unit-categories-dialog';
import type { ClinicEssentialEntityType } from '../model/useClinicEssentialFormModal';
import {
  FacilityUnitTypeCard,
  FacilityUnitCard,
  FacilityRoomCard,
  ServiceCategoryCard,
  ClinicServiceCard,
  ClinicalIntakeFormCard
} from './cards';
import type { BulkFacilityActionPayload, FacilityResource } from '../types/clinic-essentials.types';
import type { ClinicEssentialEditItem } from '../model/useClinicEssentialFormModal';
import { getEssentialFirstIcon, renderEssentialIcon } from '../utils/essential-icon-resolver';

interface DeletingState {
  type: FacilityResource;
  id: string;
  name: string;
}

export function ClinicEssentialsView() {
  const queryClient = useQueryClient();
  const { can } = useAuthContext();
  const canManage = can(PERMISSIONS.CLINICS.MANAGE);

  // Active Tab state
  const [activeTab, setActiveTab] = React.useState<FacilityResource>('units');
  const [isTrayActive, setIsTrayActive] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  // Unified Stepped Modal state (Add & Edit across all 6 facility entities)
  const [activeModal, setActiveModal] = React.useState<{
    type: ClinicEssentialEntityType;
    editItem?: ClinicEssentialEditItem | null;
  } | null>(null);

  // Selected IDs for detail modals
  const [viewingUnitId, setViewingUnitId] = React.useState<string | null>(null);
  const [viewingCategoryId, setViewingCategoryId] = React.useState<string | null>(null);

  // Single item deletion confirmation state
  const [deletingItem, setDeletingItem] = React.useState<DeletingState | null>(null);

  // 0. Fetch Unit Types
  const {
    data: unitTypes = [],
    isLoading: isLoadingUnitTypes,
    isRefetching: isRefetchingUnitTypes
  } = useQuery({
    queryKey: clinicEssentialsKeys.unitTypes(),
    queryFn: () => clinicEssentialsApi.getUnitTypes()
  });

  // 1. Fetch Units
  const {
    data: units = [],
    isLoading: isLoadingUnits,
    isRefetching: isRefetchingUnits
  } = useQuery({
    queryKey: clinicEssentialsKeys.units(),
    queryFn: () => clinicEssentialsApi.getUnits()
  });

  // 2. Fetch Rooms
  const {
    data: rooms = [],
    isLoading: isLoadingRooms,
    isRefetching: isRefetchingRooms
  } = useQuery({
    queryKey: clinicEssentialsKeys.rooms(),
    queryFn: () => clinicEssentialsApi.getRooms()
  });

  // 3. Fetch Categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isRefetching: isRefetchingCategories
  } = useQuery({
    queryKey: clinicEssentialsKeys.categories(),
    queryFn: () => clinicEssentialsApi.getCategories()
  });

  // 4. Fetch Services
  const {
    data: services = [],
    isLoading: isLoadingServices,
    isRefetching: isRefetchingServices
  } = useQuery({
    queryKey: clinicEssentialsKeys.services(),
    queryFn: () => clinicEssentialsApi.getServices()
  });

  // 5. Fetch Forms
  const {
    data: forms = [],
    isLoading: isLoadingForms,
    isRefetching: isRefetchingForms
  } = useQuery({
    queryKey: clinicEssentialsKeys.forms(),
    queryFn: () => clinicEssentialsApi.getForms()
  });

  const viewingUnit = React.useMemo(() => {
    if (!viewingUnitId) return null;
    return units.find((u) => u.id === viewingUnitId) ?? null;
  }, [units, viewingUnitId]);

  const viewingCategory = React.useMemo(() => {
    if (!viewingCategoryId) return null;
    return categories.find((c) => c.id === viewingCategoryId) ?? null;
  }, [categories, viewingCategoryId]);

  const isAnyRefetching =
    isRefetchingUnitTypes ||
    isRefetchingUnits ||
    isRefetchingRooms ||
    isRefetchingCategories ||
    isRefetchingServices ||
    isRefetchingForms;

  const handleRefreshAll = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    toast.info('Memperbarui data fasilitas...');
  }, [queryClient]);

  // Single Item Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (item: DeletingState) => {
      switch (item.type) {
        case 'unit-types':
          await clinicEssentialsApi.deleteUnitType(item.id);
          break;
        case 'units':
          await clinicEssentialsApi.deleteUnit(item.id);
          break;
        case 'rooms':
          await clinicEssentialsApi.deleteRoom(item.id);
          break;
        case 'categories':
          await clinicEssentialsApi.deleteCategory(item.id);
          break;
        case 'services':
          await clinicEssentialsApi.deleteService(item.id);
          break;
        case 'forms':
          await clinicEssentialsApi.deleteForm(item.id);
          break;
      }
    },
    onSuccess: (_, item) => {
      toast.success(`${item.name} berhasil dihapus permanen.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      setDeletingItem(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus item';
      toast.error(msg);
    }
  });

  // Single Item Toggle Active Status Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      resource,
      id,
      isActive
    }: {
      resource: FacilityResource;
      id: string;
      isActive: boolean;
    }) => {
      switch (resource) {
        case 'unit-types':
          return clinicEssentialsApi.updateUnitType(id, { isActive });
        case 'units':
          return clinicEssentialsApi.updateUnit(id, { isActive });
        case 'rooms':
          return clinicEssentialsApi.updateRoom(id, { isActive });
        case 'categories':
          return clinicEssentialsApi.updateCategory(id, { isActive });
        case 'services':
          return clinicEssentialsApi.updateService(id, { isActive });
        case 'forms':
          return clinicEssentialsApi.updateForm(id, { isActive });
      }
    },
    onSuccess: (_, vars) => {
      toast.success(`Status berhasil diubah menjadi ${vars.isActive ? 'Aktif' : 'Nonaktif'}.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status item';
      toast.error(msg);
    }
  });

  // Bulk Action Mutation
  const bulkMutation = useMutation({
    mutationFn: (payload: BulkFacilityActionPayload) => clinicEssentialsApi.bulkAction(payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Operasi massal berhasil dijalankan.');
      setSelectedIds([]);
      setIsBulkDeleteConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menjalankan operasi massal';
      toast.error(msg);
    }
  });

  const isPerformingAction =
    deleteMutation.isPending || toggleActiveMutation.isPending || bulkMutation.isPending;

  // Responsive compact state
  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

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

  const filteredForms = React.useMemo(() => {
    return forms.filter((f) => {
      if (statusFilter === 'active' && !f.isActive) return false;
      if (statusFilter === 'inactive' && f.isActive) return false;
      if (!query) return true;
      return (
        f.name.toLowerCase().includes(query) ||
        f.code.toLowerCase().includes(query) ||
        Boolean(f.description?.toLowerCase().includes(query))
      );
    });
  }, [forms, statusFilter, query]);

  // Current tab items computation for bulk select
  const currentTabItems = React.useMemo(() => {
    switch (activeTab) {
      case 'unit-types':
        return filteredUnitTypes;
      case 'units':
        return filteredUnits;
      case 'rooms':
        return filteredRooms;
      case 'categories':
        return filteredCategories;
      case 'services':
        return filteredServices;
      case 'forms':
        return filteredForms;
    }
  }, [
    activeTab,
    filteredUnitTypes,
    filteredUnits,
    filteredRooms,
    filteredCategories,
    filteredServices,
    filteredForms
  ]);

  const isAllSelected =
    currentTabItems.length > 0 && currentTabItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentTabItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Facet definition
  const facetGroups = React.useMemo<FacetGroupDefinition[]>(() => {
    const unitOptions = units.map((u) => ({
      label: u.name,
      value: u.id
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
        resetLabel: 'Semua Unit'
      },
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'single',
        options: [
          { label: 'Aktif', value: 'active', dotColor: '#10b981' },
          { label: 'Nonaktif', value: 'inactive', dotColor: '#64748b' }
        ],
        selectedValues: statusFilter !== 'all' ? [statusFilter] : [],
        onSelect: (val) =>
          setStatusFilter(val === statusFilter ? 'all' : (val as 'active' | 'inactive')),
        onReset: () => setStatusFilter('all'),
        popoverWidth: 'w-44',
        resetLabel: 'Semua Status'
      }
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
        }
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
        }
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
        }
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
        }
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
        }
      });
    });

    forms.forEach((f) => {
      items.push({
        id: `form-${f.id}`,
        title: f.name,
        subtitle: 'Formulir Intake',
        category: 'Formulir Intake',
        icon: ClipboardList,
        queryValue: f.name,
        onSelect: () => {
          setActiveTab('forms');
          setSearchQuery(f.name);
        }
      });
    });

    return items;
  }, [unitTypes, units, rooms, categories, services, forms]);

  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: setSearchQuery,
    id: 'clinic-essentials-search',
    placeholder: 'Pencarian Fasilitas...',
    indexItems
  });

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
        { label: 'Formulir Pengkajian', value: 'forms', count: filteredForms.length }
      ],
      selectedValues: [activeTab],
      onSelect: (val) => {
        if (val) {
          setActiveTab(val as FacilityResource);
          setSelectedIds([]);
        }
      },
      onReset: () => {
        setActiveTab('units');
        setSelectedIds([]);
      },
      popoverWidth: 'w-60',
      resetLabel: 'Poliklinik & Departemen'
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
    filteredForms.length
  ]);

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
  }, [activeTab, isUnitsLocked, isRoomsLocked, isCategoriesLocked, isServicesLocked]);

  const trayItems = React.useMemo<SideTrayItem<FacilityResource>[]>(
    () => [
      {
        key: 'unit-types',
        label: 'Klasifikasi Fasilitas',
        icon: renderEssentialIcon(getEssentialFirstIcon('unit-types', { unitTypes })),
        count: filteredUnitTypes.length,
        description: 'Tipe kategori bangunan & operasional'
      },
      {
        key: 'units',
        label: 'Poliklinik & Departemen',
        icon: isUnitsLocked ? (
          <Lock className='size-4 text-muted-foreground' />
        ) : (
          renderEssentialIcon(getEssentialFirstIcon('units', { units }))
        ),
        count: filteredUnits.length,
        description: isUnitsLocked
          ? 'Terkunci: Tambah klasifikasi terlebih dahulu'
          : 'Instalasi & unit pelayanan medis',
        disabled: isUnitsLocked
      },
      {
        key: 'rooms',
        label: 'Ruang Periksa',
        icon: isRoomsLocked ? (
          <Lock className='size-4 text-muted-foreground' />
        ) : (
          renderEssentialIcon(getEssentialFirstIcon('rooms', { rooms, units }))
        ),
        count: filteredRooms.length,
        description: isRoomsLocked
          ? 'Terkunci: Tambah poliklinik terlebih dahulu'
          : 'Kamar konsultasi & pemeriksaan fisik',
        disabled: isRoomsLocked
      },
      {
        key: 'categories',
        label: 'Kelompok Layanan',
        icon: isCategoriesLocked ? (
          <Lock className='size-4 text-muted-foreground' />
        ) : (
          renderEssentialIcon(getEssentialFirstIcon('categories', { categories }))
        ),
        count: filteredCategories.length,
        description: isCategoriesLocked
          ? 'Terkunci: Tambah poliklinik terlebih dahulu'
          : 'Rumpun klasifikasi tarif & paket',
        disabled: isCategoriesLocked
      },
      {
        key: 'services',
        label: 'Service Medis',
        icon: isServicesLocked ? (
          <Lock className='size-4 text-muted-foreground' />
        ) : (
          renderEssentialIcon(getEssentialFirstIcon('services', { services }))
        ),
        count: filteredServices.length,
        description: isServicesLocked
          ? 'Terkunci: Tambah kelompok layanan terlebih dahulu'
          : 'Daftar prosedur & layanan medis',
        disabled: isServicesLocked
      },
      {
        key: 'forms',
        label: 'Formulir Pengkajian',
        icon: renderEssentialIcon(getEssentialFirstIcon('forms', { forms })),
        count: filteredForms.length,
        description: 'Template anamnesis klinis pasien'
      }
    ],
    [
      unitTypes,
      units,
      rooms,
      categories,
      services,
      forms,
      isUnitsLocked,
      isRoomsLocked,
      isCategoriesLocked,
      isServicesLocked,
      filteredUnitTypes.length,
      filteredUnits.length,
      filteredRooms.length,
      filteredCategories.length,
      filteredServices.length,
      filteredForms.length
    ]
  );

  const cardGridClassName = cn(
    'grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 transition-all duration-300',
    isTrayActive
      ? 'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3'
      : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4'
  );

  return (
    <div className='flex flex-1 min-h-0 flex-col gap-3 font-sans h-full overflow-hidden select-none'>
      {/* Centralized Search Engine Dialog */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Unified Responsive Filter Toolbar (Pinned Header Section) */}
      <div className='shrink-0'>
        <ResponsiveFacetToolbox
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSearchDialog={searchEngine.open}
          searchPlaceholder='Pencarian Fasilitas...'
          facets={effectiveFacetGroups}
          isFiltered={isFiltered}
          onResetAll={handleResetAll}
          activeFilterCount={activeFilterCount}
          isCompact={isCompact}
          extraRightSlot={
            <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
              {/* Select All Checkbox Shortcut for active tab */}
              {canManage && currentTabItems.length > 0 && (
                <Button
                  type='button'
                  variant='outline'
                  size={isCompact ? 'icon' : 'sm'}
                  onClick={() => handleSelectAll(!isAllSelected)}
                  className={
                    isCompact ? 'size-8 rounded-md shrink-0' : 'h-8 text-xs font-medium gap-1.5'
                  }
                  title={isAllSelected ? 'Batalkan pilihan semua' : 'Pilih semua di tab ini'}
                >
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className='pointer-events-none'
                  />
                  {!isCompact && <span>{isAllSelected ? 'Lepas Semua' : 'Pilih Semua'}</span>}
                </Button>
              )}

              <Button
                type='button'
                variant='outline'
                size={isCompact ? 'icon' : 'sm'}
                onClick={handleRefreshAll}
                disabled={isAnyRefetching || isPerformingAction}
                className={
                  isCompact ? 'size-8 rounded-md shrink-0' : 'h-8 text-xs font-medium gap-1.5'
                }
                title='Segarkan data fasilitas'
              >
                <RefreshCw className={cn('size-3.5', isAnyRefetching && 'animate-spin')} />
                {!isCompact && <span>Refresh</span>}
              </Button>

              {canManage && (
                <>
                  {/* Active Tab Direct Add Button */}
                  {activeTab === 'unit-types' && (
                    <Button
                      type='button'
                      size={isCompact ? 'icon' : 'sm'}
                      onClick={() => setActiveModal({ type: 'unit-type' })}
                      className={
                        isCompact
                          ? 'size-8 rounded-md shrink-0 shadow-xs'
                          : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                      }
                      title='Tambah Klasifikasi Fasilitas'
                    >
                      <Plus className='size-3.5' />
                      {!isCompact && <span>Tambah Klasifikasi</span>}
                    </Button>
                  )}

                  {activeTab === 'units' && (
                    <Button
                      type='button'
                      size={isCompact ? 'icon' : 'sm'}
                      onClick={() => setActiveModal({ type: 'unit' })}
                      className={
                        isCompact
                          ? 'size-8 rounded-md shrink-0 shadow-xs'
                          : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                      }
                      title='Tambah Poliklinik & Departemen'
                    >
                      <Plus className='size-3.5' />
                      {!isCompact && <span>Tambah Poliklinik</span>}
                    </Button>
                  )}

                  {activeTab === 'rooms' && (
                    <Button
                      type='button'
                      size={isCompact ? 'icon' : 'sm'}
                      onClick={() => setActiveModal({ type: 'room' })}
                      disabled={units.length === 0}
                      className={
                        isCompact
                          ? 'size-8 rounded-md shrink-0 shadow-xs'
                          : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                      }
                      title='Tambah Ruang Periksa'
                    >
                      <Plus className='size-3.5' />
                      {!isCompact && <span>Tambah Ruang Periksa</span>}
                    </Button>
                  )}

                  {activeTab === 'categories' && (
                    <Button
                      type='button'
                      size={isCompact ? 'icon' : 'sm'}
                      onClick={() => setActiveModal({ type: 'category' })}
                      className={
                        isCompact
                          ? 'size-8 rounded-md shrink-0 shadow-xs'
                          : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                      }
                      title='Tambah Kelompok Layanan'
                    >
                      <Plus className='size-3.5' />
                      {!isCompact && <span>Tambah Kelompok</span>}
                    </Button>
                  )}

                  {activeTab === 'services' && (
                    <Button
                      type='button'
                      size={isCompact ? 'icon' : 'sm'}
                      onClick={() => setActiveModal({ type: 'service' })}
                      disabled={categories.length === 0}
                      className={
                        isCompact
                          ? 'size-8 rounded-md shrink-0 shadow-xs'
                          : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                      }
                      title='Tambah Service Medis'
                    >
                      <Plus className='size-3.5' />
                      {!isCompact && <span>Tambah Service</span>}
                    </Button>
                  )}

                  {activeTab === 'forms' && (
                    <Button
                      type='button'
                      size={isCompact ? 'icon' : 'sm'}
                      onClick={() => setActiveModal({ type: 'form' })}
                      className={
                        isCompact
                          ? 'size-8 rounded-md shrink-0 shadow-xs'
                          : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                      }
                      title='Tambah Formulir Pengkajian'
                    >
                      <Plus className='size-3.5' />
                      {!isCompact && <span>Tambah Formulir</span>}
                    </Button>
                  )}

                  {/* Quick Master Config Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size={isCompact ? 'icon' : 'sm'}
                        variant='outline'
                        className={
                          isCompact
                            ? 'size-8 rounded-md shrink-0'
                            : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                        }
                        title='Menu Konfigurasi Cepat'
                      >
                        <Settings2 className='size-3.5' />
                        {!isCompact && <span>Config</span>}
                        {!isCompact && <ChevronDown className='size-3 opacity-60' />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-64 font-sans'>
                      <DropdownMenuItem
                        onClick={() => setActiveModal({ type: 'unit-type' })}
                        className='cursor-pointer gap-2'
                      >
                        <Layers className='size-4 text-primary' />
                        <span>Tambah Klasifikasi Fasilitas</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setActiveModal({ type: 'unit' })}
                        className='cursor-pointer gap-2'
                      >
                        <Building2 className='size-4 text-primary' />
                        <span>Tambah Poliklinik & Departemen</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setActiveModal({ type: 'room' })}
                        disabled={units.length === 0}
                        className='cursor-pointer gap-2'
                      >
                        <DoorOpen className='size-4 text-primary' />
                        <span>Tambah Ruang Periksa</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => setActiveModal({ type: 'category' })}
                        className='cursor-pointer gap-2'
                      >
                        <Folder className='size-4 text-primary' />
                        <span>Tambah Kelompok Layanan</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setActiveModal({ type: 'service' })}
                        disabled={categories.length === 0}
                        className='cursor-pointer gap-2'
                      >
                        <Stethoscope className='size-4 text-primary' />
                        <span>Tambah Service Medis</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => setActiveModal({ type: 'form' })}
                        className='cursor-pointer gap-2'
                      >
                        <ClipboardList className='size-4 text-primary' />
                        <span>Tambah Formulir Pengkajian</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Tabs Layout with Master SideTray Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as FacilityResource);
          setSelectedIds([]);
        }}
        className='flex flex-1 min-h-0 flex-col w-full m-0'
      >
        <SideTrayLayout
          tray={
            <SideTray
              items={trayItems}
              activeKey={activeTab}
              onSelect={(val) => {
                setActiveTab(val);
                setSelectedIds([]);
              }}
              title='Bagian Fasilitas'
              isExpanded={isTrayActive}
              onExpandedChange={setIsTrayActive}
            />
          }
          className='flex-1 min-h-0 h-full'
        >
          {/* 0. Tab Unit Types */}
          <TabsContent value='unit-types' className='mt-0'>
            {isLoadingUnitTypes ? (
              <EntityCardGridSkeleton count={8} className={cardGridClassName} />
            ) : unitTypes.length === 0 ? (
              <EmptyState
                title='Belum ada klasifikasi fasilitas terdaftar'
                description='Mulai dengan menambahkan klasifikasi tipe fasilitas (misal: Poliklinik Rawat Jalan, Ruang Rawat Inap, Departemen Medis).'
                action={
                  canManage ? (
                    <Button
                      size='sm'
                      onClick={() => setActiveModal({ type: 'unit-type' })}
                      className='text-xs gap-1.5 h-8'
                    >
                      <Plus className='size-3.5' /> Tambah Klasifikasi
                    </Button>
                  ) : undefined
                }
              />
            ) : filteredUnitTypes.length === 0 ? (
              <EmptyState
                title='Tidak ada klasifikasi yang cocok'
                description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
                resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
              />
            ) : (
              <div className={cardGridClassName}>
                {filteredUnitTypes.map((ut) => (
                  <FacilityUnitTypeCard
                    key={ut.id}
                    unitType={ut}
                    canManage={canManage}
                    selected={selectedIds.includes(ut.id)}
                    isBulkingActive={selectedIds.length > 0}
                    onToggleSelect={() => handleToggleSelect(ut.id)}
                    onToggleActive={(newActive) =>
                      toggleActiveMutation.mutate({
                        resource: 'unit-types',
                        id: ut.id,
                        isActive: newActive
                      })
                    }
                    isTogglingActive={
                      toggleActiveMutation.isPending &&
                      toggleActiveMutation.variables?.resource === 'unit-types' &&
                      toggleActiveMutation.variables?.id === ut.id
                    }
                    onEdit={(item) => setActiveModal({ type: 'unit-type', editItem: item })}
                    onDelete={(item) =>
                      setDeletingItem({ type: 'unit-types', id: item.id, name: item.name })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* 1. Tab Units */}
          <TabsContent value='units' className='mt-0'>
            {isLoadingUnits ? (
              <EntityCardGridSkeleton count={8} className={cardGridClassName} />
            ) : units.length === 0 ? (
              <EmptyState
                title='Belum ada poliklinik atau departemen'
                description='Mulai dengan menambahkan unit poliklinik pertama untuk operasional pelayanan kesehatan.'
                action={
                  canManage ? (
                    <Button
                      size='sm'
                      onClick={() => setActiveModal({ type: 'unit' })}
                      className='text-xs gap-1.5 h-8'
                    >
                      <Plus className='size-3.5' /> Tambah Poliklinik
                    </Button>
                  ) : undefined
                }
              />
            ) : filteredUnits.length === 0 ? (
              <EmptyState
                title='Tidak ada poliklinik yang cocok'
                description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
                resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
              />
            ) : (
              <div className={cardGridClassName}>
                {filteredUnits.map((u) => (
                  <FacilityUnitCard
                    key={u.id}
                    unit={u}
                    canManage={canManage}
                    selected={selectedIds.includes(u.id)}
                    isBulkingActive={selectedIds.length > 0}
                    onToggleSelect={() => handleToggleSelect(u.id)}
                    onToggleActive={(newActive) =>
                      toggleActiveMutation.mutate({
                        resource: 'units',
                        id: u.id,
                        isActive: newActive
                      })
                    }
                    isTogglingActive={
                      toggleActiveMutation.isPending &&
                      toggleActiveMutation.variables?.resource === 'units' &&
                      toggleActiveMutation.variables?.id === u.id
                    }
                    onCardClick={(item) => setViewingUnitId(item.id)}
                    onEdit={(item) => setActiveModal({ type: 'unit', editItem: item })}
                    onDelete={(item) =>
                      setDeletingItem({ type: 'units', id: item.id, name: item.name })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* 2. Tab Rooms */}
          <TabsContent value='rooms' className='mt-0'>
            {isLoadingRooms ? (
              <EntityCardGridSkeleton count={8} className={cardGridClassName} />
            ) : rooms.length === 0 ? (
              <EmptyState
                title='Belum ada ruang periksa'
                description='Tambahkan ruangan periksa atau konsultasi dan hubungkan ke unit poliklinik induk.'
                action={
                  canManage ? (
                    <Button
                      size='sm'
                      onClick={() => setActiveModal({ type: 'room' })}
                      disabled={units.length === 0}
                      className='text-xs gap-1.5 h-8'
                    >
                      <Plus className='size-3.5' /> Tambah Ruang Periksa
                    </Button>
                  ) : undefined
                }
              />
            ) : filteredRooms.length === 0 ? (
              <EmptyState
                title='Tidak ada ruang periksa yang cocok'
                description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
                resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
              />
            ) : (
              <div className={cardGridClassName}>
                {filteredRooms.map((r) => (
                  <FacilityRoomCard
                    key={r.id}
                    room={r}
                    units={units}
                    canManage={canManage}
                    selected={selectedIds.includes(r.id)}
                    isBulkingActive={selectedIds.length > 0}
                    onToggleSelect={() => handleToggleSelect(r.id)}
                    onToggleActive={(newActive) =>
                      toggleActiveMutation.mutate({
                        resource: 'rooms',
                        id: r.id,
                        isActive: newActive
                      })
                    }
                    isTogglingActive={
                      toggleActiveMutation.isPending &&
                      toggleActiveMutation.variables?.resource === 'rooms' &&
                      toggleActiveMutation.variables?.id === r.id
                    }
                    onEdit={(item) => setActiveModal({ type: 'room', editItem: item })}
                    onDelete={(item) =>
                      setDeletingItem({ type: 'rooms', id: item.id, name: item.name })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* 3. Tab Categories */}
          <TabsContent value='categories' className='mt-0'>
            {isLoadingCategories ? (
              <EntityCardGridSkeleton count={8} className={cardGridClassName} />
            ) : categories.length === 0 ? (
              <EmptyState
                title='Belum ada kelompok layanan'
                description='Tambahkan kelompok kategori pelayanan medis untuk mempermudah pendaftaran dan penjadwalan dokter.'
                action={
                  canManage ? (
                    <Button
                      size='sm'
                      onClick={() => setActiveModal({ type: 'category' })}
                      className='text-xs gap-1.5 h-8'
                    >
                      <Plus className='size-3.5' /> Tambah Kelompok
                    </Button>
                  ) : undefined
                }
              />
            ) : filteredCategories.length === 0 ? (
              <EmptyState
                title='Tidak ada kelompok layanan yang cocok'
                description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
                resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
              />
            ) : (
              <div className={cardGridClassName}>
                {filteredCategories.map((c) => (
                  <ServiceCategoryCard
                    key={c.id}
                    category={c}
                    units={units}
                    canManage={canManage}
                    selected={selectedIds.includes(c.id)}
                    isBulkingActive={selectedIds.length > 0}
                    onToggleSelect={() => handleToggleSelect(c.id)}
                    onToggleActive={(newActive) =>
                      toggleActiveMutation.mutate({
                        resource: 'categories',
                        id: c.id,
                        isActive: newActive
                      })
                    }
                    isTogglingActive={
                      toggleActiveMutation.isPending &&
                      toggleActiveMutation.variables?.resource === 'categories' &&
                      toggleActiveMutation.variables?.id === c.id
                    }
                    onCardClick={(item) => setViewingCategoryId(item.id)}
                    onEdit={(item) => setActiveModal({ type: 'category', editItem: item })}
                    onDelete={(item) =>
                      setDeletingItem({ type: 'categories', id: item.id, name: item.name })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* 4. Tab Services */}
          <TabsContent value='services' className='mt-0'>
            {isLoadingServices ? (
              <EntityCardGridSkeleton count={8} className={cardGridClassName} />
            ) : services.length === 0 ? (
              <EmptyState
                title='Belum ada service medis'
                description='Daftarkan service medis klinik, lalu hubungkan dengan formulir pengkajian yang sesuai.'
                action={
                  canManage ? (
                    <Button
                      size='sm'
                      onClick={() => setActiveModal({ type: 'service' })}
                      disabled={categories.length === 0}
                      className='text-xs gap-1.5 h-8'
                    >
                      <Plus className='size-3.5' /> Tambah Service Medis
                    </Button>
                  ) : undefined
                }
              />
            ) : filteredServices.length === 0 ? (
              <EmptyState
                title='Tidak ada service medis yang cocok'
                description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
                resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
              />
            ) : (
              <div className={cardGridClassName}>
                {filteredServices.map((s) => (
                  <ClinicServiceCard
                    key={s.id}
                    service={s}
                    categories={categories}
                    forms={forms}
                    canManage={canManage}
                    selected={selectedIds.includes(s.id)}
                    isBulkingActive={selectedIds.length > 0}
                    onToggleSelect={() => handleToggleSelect(s.id)}
                    onToggleActive={(newActive) =>
                      toggleActiveMutation.mutate({
                        resource: 'services',
                        id: s.id,
                        isActive: newActive
                      })
                    }
                    isTogglingActive={
                      toggleActiveMutation.isPending &&
                      toggleActiveMutation.variables?.resource === 'services' &&
                      toggleActiveMutation.variables?.id === s.id
                    }
                    onEdit={(item) => setActiveModal({ type: 'service', editItem: item })}
                    onDelete={(item) =>
                      setDeletingItem({ type: 'services', id: item.id, name: item.name })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* 5. Tab Intake Forms */}
          <TabsContent value='forms' className='mt-0'>
            {isLoadingForms ? (
              <EntityCardGridSkeleton count={8} className={cardGridClassName} />
            ) : forms.length === 0 ? (
              <EmptyState
                title='Belum ada formulir pengkajian'
                description='Daftarkan formulir pengkajian klinis agar service dapat terhubung ke lembar intake pasien.'
                action={
                  canManage ? (
                    <Button
                      size='sm'
                      onClick={() => setActiveModal({ type: 'form' })}
                      className='text-xs gap-1.5 h-8'
                    >
                      <Plus className='size-3.5' /> Tambah Formulir
                    </Button>
                  ) : undefined
                }
              />
            ) : filteredForms.length === 0 ? (
              <EmptyState
                title='Tidak ada formulir yang cocok'
                description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
                resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
              />
            ) : (
              <div className={cardGridClassName}>
                {filteredForms.map((f) => (
                  <ClinicalIntakeFormCard
                    key={f.id}
                    form={f}
                    canManage={canManage}
                    selected={selectedIds.includes(f.id)}
                    isBulkingActive={selectedIds.length > 0}
                    onToggleSelect={() => handleToggleSelect(f.id)}
                    onToggleActive={(newActive) =>
                      toggleActiveMutation.mutate({
                        resource: 'forms',
                        id: f.id,
                        isActive: newActive
                      })
                    }
                    isTogglingActive={
                      toggleActiveMutation.isPending &&
                      toggleActiveMutation.variables?.resource === 'forms' &&
                      toggleActiveMutation.variables?.id === f.id
                    }
                    onEdit={(item) => setActiveModal({ type: 'form', editItem: item })}
                    onDelete={(item) =>
                      setDeletingItem({ type: 'forms', id: item.id, name: item.name })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </SideTrayLayout>
      </Tabs>

      {/* Floating Bulk Action Toolbar */}
      {selectedIds.length > 0 && canManage && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-background/95 backdrop-blur-md border shadow-lg rounded-full animate-in fade-in slide-in-from-bottom-4'>
          <span className='text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full shrink-0'>
            {selectedIds.length} item terpilih
          </span>
          <div className='h-4 w-px bg-border shrink-0' />
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shrink-0'
            onClick={() =>
              bulkMutation.mutate({ resource: activeTab, action: 'activate', ids: selectedIds })
            }
            disabled={bulkMutation.isPending}
          >
            <CheckCircle2 className='size-3.5' />
            <span className='hidden sm:inline'>Aktifkan</span>
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 shrink-0'
            onClick={() =>
              bulkMutation.mutate({ resource: activeTab, action: 'deactivate', ids: selectedIds })
            }
            disabled={bulkMutation.isPending}
          >
            <Power className='size-3.5' />
            <span className='hidden sm:inline'>Nonaktifkan</span>
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs gap-1 text-destructive hover:bg-destructive/10 shrink-0'
            onClick={() => setIsBulkDeleteConfirmOpen(true)}
            disabled={bulkMutation.isPending}
          >
            <Trash2 className='size-3.5' />
            <span className='hidden sm:inline'>Hapus</span>
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='h-7 text-xs text-muted-foreground shrink-0'
            onClick={() => setSelectedIds([])}
            disabled={bulkMutation.isPending}
          >
            Batal
          </Button>
        </div>
      )}

      {/* Unified Stepped Modal (Handles both Add & Edit for all 6 entities) */}
      {activeModal && (
        <ClinicEssentialFormModal
          open={Boolean(activeModal)}
          onOpenChange={(open) => !open && setActiveModal(null)}
          type={activeModal.type}
          editItem={activeModal.editItem}
          unitTypes={unitTypes}
          units={units}
          categories={categories}
          forms={forms}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
          }}
        />
      )}

      {/* Unit Categories Detail Modal */}
      {viewingUnit && (
        <UnitCategoriesDialog
          unit={viewingUnit}
          open={Boolean(viewingUnit)}
          onOpenChange={(open) => {
            if (!open) setViewingUnitId(null);
          }}
          categories={categories}
          units={units}
          canManage={canManage}
          onEditCategory={(item) => setActiveModal({ type: 'category', editItem: item })}
          onDeleteCategory={(item) =>
            setDeletingItem({ type: 'categories', id: item.id, name: item.name })
          }
          onToggleCategoryActive={(category, newActive) =>
            toggleActiveMutation.mutate({
              resource: 'categories',
              id: category.id,
              isActive: newActive
            })
          }
          isTogglingActive={
            toggleActiveMutation.isPending &&
            toggleActiveMutation.variables?.resource === 'categories'
          }
          onViewCategoryServices={(category) => setViewingCategoryId(category.id)}
        />
      )}

      {/* Category Services Detail Modal */}
      {viewingCategory && (
        <CategoryServicesDialog
          category={viewingCategory}
          open={Boolean(viewingCategory)}
          onOpenChange={(open) => {
            if (!open) setViewingCategoryId(null);
          }}
          services={services}
          categories={categories}
          forms={forms}
          units={units}
          canManage={canManage}
          onAddServiceToCategory={(_cat) => {
            setViewingCategoryId(null);
            setActiveModal({
              type: 'service',
              editItem: null
            });
          }}
          onEditService={(service) => {
            setViewingCategoryId(null);
            setActiveModal({ type: 'service', editItem: service });
          }}
          onDeleteService={(service) => {
            setDeletingItem({ type: 'services', id: service.id, name: service.name });
          }}
          onToggleServiceActive={(service, newActive) => {
            toggleActiveMutation.mutate({
              resource: 'services',
              id: service.id,
              isActive: newActive
            });
          }}
          isTogglingActive={toggleActiveMutation.isPending}
        />
      )}

      {/* Single Item Deletion Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Permanen {deletingItem?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data tersebut secara fisik dan permanen dari basis data
              klinik. Data yang sudah dihapus tidak dapat dipulihkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem)}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Permanen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={(open) => !open && setIsBulkDeleteConfirmOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Permanen {selectedIds.length} Data Terpilih?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua item yang dipilih akan dihapus secara fisik dan permanen dari basis data klinik
              jika tidak memiliki data relasi aktif. Data yang terhapus tidak dapat dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                bulkMutation.mutate({
                  resource: activeTab,
                  action: 'delete',
                  ids: selectedIds
                })
              }
              disabled={bulkMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {bulkMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Permanen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
