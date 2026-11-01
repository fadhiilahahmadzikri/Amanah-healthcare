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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import type { ClinicEssentialEntityType } from '../model/useClinicEssentialFormModal';
import {
  FacilityUnitTypeCard,
  FacilityUnitCard,
  FacilityRoomCard,
  ServiceCategoryCard,
  ClinicServiceCard,
  ClinicalIntakeFormCard
} from './cards';
import type {
  BulkFacilityActionPayload,
  ClinicService,
  ClinicalIntakeForm,
  FacilityResource,
  FacilityRoom,
  FacilityUnit,
  FacilityUnitType,
  ServiceCategory
} from '../types/clinic-essentials.types';
import { CreateCategoryDialog } from './dialogs/create-category-dialog';
import { CreateFormDialog } from './dialogs/create-form-dialog';
import { CreateRoomDialog } from './dialogs/create-room-dialog';
import { CreateServiceDialog } from './dialogs/create-service-dialog';
import { CreateUnitDialog } from './dialogs/create-unit-dialog';
import { CreateUnitTypeDialog } from './dialogs/create-unit-type-dialog';

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
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  // Stepped Multi-Stage Creation Modal state
  const [createModalType, setCreateModalType] = React.useState<ClinicEssentialEntityType | null>(
    null
  );

  // Dialog visibility states for manual edit & unit-type creation
  const [isCreateUnitTypeOpen, setIsCreateUnitTypeOpen] = React.useState(false);
  const [isCreateUnitOpen, setIsCreateUnitOpen] = React.useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = React.useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = React.useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = React.useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  // Editing items state
  const [editingUnitType, setEditingUnitType] = React.useState<FacilityUnitType | null>(null);
  const [editingUnit, setEditingUnit] = React.useState<FacilityUnit | null>(null);
  const [editingRoom, setEditingRoom] = React.useState<FacilityRoom | null>(null);
  const [editingCategory, setEditingCategory] = React.useState<ServiceCategory | null>(null);
  const [editingService, setEditingService] = React.useState<ClinicService | null>(null);
  const [editingForm, setEditingForm] = React.useState<ClinicalIntakeForm | null>(null);

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
      toast.success(`${item.name} berhasil dinonaktifkan/dihapus.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      setDeletingItem(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menonaktifkan item';
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
        subtitle: `Tipe Unit • ${ut.code}`,
        category: 'Tipe Unit',
        icon: Layers,
        queryValue: `${ut.name} ${ut.code}`,
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
        subtitle: `Unit • ${u.code}${u.location ? ` • ${u.location}` : ''}`,
        category: 'Unit Poliklinik',
        icon: Building2,
        queryValue: `${u.name} ${u.code}`,
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
        subtitle: `Ruangan • ${r.code}${parentName ? ` • ${parentName}` : ''}`,
        category: 'Ruang Periksa',
        icon: DoorOpen,
        queryValue: `${r.name} ${r.code}`,
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
        subtitle: `Kategori • ${c.code}${parentName ? ` • ${parentName}` : ''}`,
        category: 'Kategori Layanan',
        icon: Folder,
        queryValue: `${c.name} ${c.code}`,
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
        subtitle: `Layanan • ${s.code}${parentName ? ` • ${parentName}` : ''}`,
        category: 'Layanan Medis',
        icon: Stethoscope,
        queryValue: `${s.name} ${s.code} ${s.shortName || ''}`,
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
        subtitle: `Formulir Intake • ${f.code}`,
        category: 'Formulir Intake',
        icon: ClipboardList,
        queryValue: `${f.name} ${f.code}`,
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
        { label: 'Tipe Unit', value: 'unit-types', count: filteredUnitTypes.length },
        { label: 'Unit & Poliklinik', value: 'units', count: filteredUnits.length },
        { label: 'Ruang Periksa', value: 'rooms', count: filteredRooms.length },
        { label: 'Kategori Layanan', value: 'categories', count: filteredCategories.length },
        { label: 'Layanan Medis', value: 'services', count: filteredServices.length },
        { label: 'Formulir Intake', value: 'forms', count: filteredForms.length }
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
      popoverWidth: 'w-56',
      resetLabel: 'Unit & Poliklinik'
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

  return (
    <div className='space-y-4 font-sans'>
      {/* Centralized Search Engine Dialog */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Unified Responsive Filter Toolbar */}
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
                    onClick={() => {
                      setEditingUnitType(null);
                      setIsCreateUnitTypeOpen(true);
                    }}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Tipe Unit'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Tipe Unit</span>}
                  </Button>
                )}

                {activeTab === 'units' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => setCreateModalType('unit')}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Unit / Poliklinik'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Unit</span>}
                  </Button>
                )}

                {activeTab === 'rooms' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => setCreateModalType('room')}
                    disabled={units.length === 0}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Ruang Periksa'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Ruangan</span>}
                  </Button>
                )}

                {activeTab === 'categories' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => setCreateModalType('category')}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Kategori Layanan'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Kategori</span>}
                  </Button>
                )}

                {activeTab === 'services' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => setCreateModalType('service')}
                    disabled={categories.length === 0}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Layanan Medis'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Layanan</span>}
                  </Button>
                )}

                {activeTab === 'forms' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => setCreateModalType('form')}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Formulir Intake'
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
                  <DropdownMenuContent align='end' className='w-56 font-sans'>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingUnitType(null);
                        setIsCreateUnitTypeOpen(true);
                      }}
                      className='cursor-pointer gap-2'
                    >
                      <Layers className='size-4 text-primary' />
                      <span>Tambah Tipe Unit</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setCreateModalType('unit')}
                      className='cursor-pointer gap-2'
                    >
                      <Building2 className='size-4 text-primary' />
                      <span>Tambah Unit / Poliklinik</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setCreateModalType('room')}
                      disabled={units.length === 0}
                      className='cursor-pointer gap-2'
                    >
                      <DoorOpen className='size-4 text-primary' />
                      <span>Tambah Ruang Periksa</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => setCreateModalType('category')}
                      className='cursor-pointer gap-2'
                    >
                      <Folder className='size-4 text-primary' />
                      <span>Tambah Kategori Layanan</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setCreateModalType('service')}
                      disabled={categories.length === 0}
                      className='cursor-pointer gap-2'
                    >
                      <Stethoscope className='size-4 text-primary' />
                      <span>Tambah Layanan Medis</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => setCreateModalType('form')}
                      className='cursor-pointer gap-2'
                    >
                      <ClipboardList className='size-4 text-primary' />
                      <span>Tambah Formulir Intake</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        }
      />

      {/* Tabs Layout */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as FacilityResource);
          setSelectedIds([]);
        }}
        className='w-full space-y-4'
      >
        {!isCompact && (
          <TabsList className='grid grid-cols-2 sm:grid-cols-6 w-full h-auto p-1 bg-muted/60'>
            <TabsTrigger value='unit-types' className='text-xs py-1.5 gap-1.5'>
              <Layers className='size-3.5' />
              <span>Tipe Unit ({filteredUnitTypes.length})</span>
            </TabsTrigger>
            <TabsTrigger value='units' className='text-xs py-1.5 gap-1.5'>
              <Building2 className='size-3.5' />
              <span>Unit ({filteredUnits.length})</span>
            </TabsTrigger>
            <TabsTrigger value='rooms' className='text-xs py-1.5 gap-1.5'>
              <DoorOpen className='size-3.5' />
              <span>Ruangan ({filteredRooms.length})</span>
            </TabsTrigger>
            <TabsTrigger value='categories' className='text-xs py-1.5 gap-1.5'>
              <Folder className='size-3.5' />
              <span>Kategori ({filteredCategories.length})</span>
            </TabsTrigger>
            <TabsTrigger value='services' className='text-xs py-1.5 gap-1.5'>
              <Stethoscope className='size-3.5' />
              <span>Layanan ({filteredServices.length})</span>
            </TabsTrigger>
            <TabsTrigger value='forms' className='text-xs py-1.5 gap-1.5'>
              <ClipboardList className='size-3.5' />
              <span>Formulir ({filteredForms.length})</span>
            </TabsTrigger>
          </TabsList>
        )}

        {/* 0. Tab Unit Types */}
        <TabsContent value='unit-types' className='mt-0'>
          {isLoadingUnitTypes ? (
            <EntityCardGridSkeleton count={8} />
          ) : unitTypes.length === 0 ? (
            <EmptyState
              title='Belum ada tipe unit terdaftar'
              description='Mulai dengan menambahkan master klasifikasi tipe unit fasilitas (misal: Poliklinik Rawat Jalan, Ruang Rawat Inap, Departemen Medis).'
              action={
                canManage ? (
                  <Button
                    size='sm'
                    onClick={() => {
                      setEditingUnitType(null);
                      setIsCreateUnitTypeOpen(true);
                    }}
                    className='text-xs gap-1.5 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Tipe Unit
                  </Button>
                ) : undefined
              }
            />
          ) : filteredUnitTypes.length === 0 ? (
            <EmptyState
              title='Tidak ada tipe unit yang cocok'
              description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
              resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
            />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'>
              {filteredUnitTypes.map((ut) => (
                <FacilityUnitTypeCard
                  key={ut.id}
                  unitType={ut}
                  canManage={canManage}
                  selected={selectedIds.includes(ut.id)}
                  onToggleSelect={() => handleToggleSelect(ut.id)}
                  onEdit={(item) => {
                    setEditingUnitType(item);
                    setIsCreateUnitTypeOpen(true);
                  }}
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
            <EntityCardGridSkeleton count={8} />
          ) : units.length === 0 ? (
            <EmptyState
              title='Belum ada unit poliklinik'
              description='Mulai dengan menambahkan unit fasilitas pertama untuk layanan kesehatan.'
              action={
                canManage ? (
                  <Button
                    size='sm'
                    onClick={() => setCreateModalType('unit')}
                    className='text-xs gap-1.5 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Unit
                  </Button>
                ) : undefined
              }
            />
          ) : filteredUnits.length === 0 ? (
            <EmptyState
              title='Tidak ada unit yang cocok'
              description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
              resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
            />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'>
              {filteredUnits.map((u) => (
                <FacilityUnitCard
                  key={u.id}
                  unit={u}
                  canManage={canManage}
                  selected={selectedIds.includes(u.id)}
                  onToggleSelect={() => handleToggleSelect(u.id)}
                  onEdit={(item) => {
                    setEditingUnit(item);
                    setIsCreateUnitOpen(true);
                  }}
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
            <EntityCardGridSkeleton count={8} />
          ) : rooms.length === 0 ? (
            <EmptyState
              title='Belum ada ruangan periksa'
              description='Tambahkan ruangan dan hubungkan ke unit poliklinik induk.'
              action={
                canManage ? (
                  <Button
                    size='sm'
                    onClick={() => setCreateModalType('room')}
                    disabled={units.length === 0}
                    className='text-xs gap-1.5 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Ruangan
                  </Button>
                ) : undefined
              }
            />
          ) : filteredRooms.length === 0 ? (
            <EmptyState
              title='Tidak ada ruangan yang cocok'
              description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
              resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
            />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'>
              {filteredRooms.map((r) => (
                <FacilityRoomCard
                  key={r.id}
                  room={r}
                  units={units}
                  canManage={canManage}
                  selected={selectedIds.includes(r.id)}
                  onToggleSelect={() => handleToggleSelect(r.id)}
                  onEdit={(item) => {
                    setEditingRoom(item);
                    setIsCreateRoomOpen(true);
                  }}
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
            <EntityCardGridSkeleton count={8} />
          ) : categories.length === 0 ? (
            <EmptyState
              title='Belum ada kategori layanan'
              description='Tambahkan kelompok kategori layanan medis untuk navigasi pasien dan jadwal dokter.'
              action={
                canManage ? (
                  <Button
                    size='sm'
                    onClick={() => setCreateModalType('category')}
                    className='text-xs gap-1.5 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Kategori
                  </Button>
                ) : undefined
              }
            />
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              title='Tidak ada kategori yang cocok'
              description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
              resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
            />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'>
              {filteredCategories.map((c) => (
                <ServiceCategoryCard
                  key={c.id}
                  category={c}
                  units={units}
                  canManage={canManage}
                  selected={selectedIds.includes(c.id)}
                  onToggleSelect={() => handleToggleSelect(c.id)}
                  onEdit={(item) => {
                    setEditingCategory(item);
                    setIsCreateCategoryOpen(true);
                  }}
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
            <EntityCardGridSkeleton count={8} />
          ) : services.length === 0 ? (
            <EmptyState
              title='Belum ada layanan medis'
              description='Buat tindakan medis dan hubungkan ke formulir intake yang sesuai.'
              action={
                canManage ? (
                  <Button
                    size='sm'
                    onClick={() => setCreateModalType('service')}
                    disabled={categories.length === 0}
                    className='text-xs gap-1.5 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Layanan
                  </Button>
                ) : undefined
              }
            />
          ) : filteredServices.length === 0 ? (
            <EmptyState
              title='Tidak ada layanan yang cocok'
              description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
              resetAction={{ label: 'Reset Filter', onReset: handleResetAll }}
            />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'>
              {filteredServices.map((s) => (
                <ClinicServiceCard
                  key={s.id}
                  service={s}
                  categories={categories}
                  forms={forms}
                  canManage={canManage}
                  selected={selectedIds.includes(s.id)}
                  onToggleSelect={() => handleToggleSelect(s.id)}
                  onEdit={(item) => {
                    setEditingService(item);
                    setIsCreateServiceOpen(true);
                  }}
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
            <EntityCardGridSkeleton count={8} />
          ) : forms.length === 0 ? (
            <EmptyState
              title='Belum ada formulir intake'
              description='Daftarkan kode formulir klinis agar layanan dapat terhubung ke lembar intake.'
              action={
                canManage ? (
                  <Button
                    size='sm'
                    onClick={() => setCreateModalType('form')}
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
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'>
              {filteredForms.map((f) => (
                <ClinicalIntakeFormCard
                  key={f.id}
                  form={f}
                  canManage={canManage}
                  selected={selectedIds.includes(f.id)}
                  onToggleSelect={() => handleToggleSelect(f.id)}
                  onEdit={(item) => {
                    setEditingForm(item);
                    setIsCreateFormOpen(true);
                  }}
                  onDelete={(item) =>
                    setDeletingItem({ type: 'forms', id: item.id, name: item.name })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
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

      {/* Stepped Multi-Stage Creation Modal */}
      {createModalType && (
        <ClinicEssentialFormModal
          open={Boolean(createModalType)}
          onOpenChange={(open) => !open && setCreateModalType(null)}
          type={createModalType}
          unitTypes={unitTypes}
          units={units}
          categories={categories}
          forms={forms}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
          }}
        />
      )}

      {/* Reused Edit Dialogs & Unit-Type Creator */}
      <CreateUnitTypeDialog
        open={isCreateUnitTypeOpen}
        onOpenChange={(open) => {
          setIsCreateUnitTypeOpen(open);
          if (!open) setEditingUnitType(null);
        }}
        editItem={editingUnitType}
      />

      <CreateUnitDialog
        open={isCreateUnitOpen}
        onOpenChange={(open) => {
          setIsCreateUnitOpen(open);
          if (!open) setEditingUnit(null);
        }}
        editItem={editingUnit}
      />

      <CreateRoomDialog
        open={isCreateRoomOpen}
        onOpenChange={(open) => {
          setIsCreateRoomOpen(open);
          if (!open) setEditingRoom(null);
        }}
        units={units}
        editItem={editingRoom}
      />

      <CreateCategoryDialog
        open={isCreateCategoryOpen}
        onOpenChange={(open) => {
          setIsCreateCategoryOpen(open);
          if (!open) setEditingCategory(null);
        }}
        units={units}
        editItem={editingCategory}
      />

      <CreateServiceDialog
        open={isCreateServiceOpen}
        onOpenChange={(open) => {
          setIsCreateServiceOpen(open);
          if (!open) setEditingService(null);
        }}
        categories={categories}
        forms={forms}
        editItem={editingService}
      />

      <CreateFormDialog
        open={isCreateFormOpen}
        onOpenChange={(open) => {
          setIsCreateFormOpen(open);
          if (!open) setEditingForm(null);
        }}
        editItem={editingForm}
      />

      {/* Single Item Deletion Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan {deletingItem?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menonaktifkan data kanonik tersebut dari operasional aktif klinik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem)}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending ? 'Menonaktifkan...' : 'Ya, Nonaktifkan'}
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
            <AlertDialogTitle>Hapus / Nonaktifkan {selectedIds.length} item?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menonaktifkan semua item yang dipilih dari operasional aktif klinik.
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
              {bulkMutation.isPending ? 'Memproses...' : 'Ya, Hapus Terpilih'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
