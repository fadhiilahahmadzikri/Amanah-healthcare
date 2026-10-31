'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ClipboardList,
  DoorOpen,
  Folder,
  Plus,
  RefreshCw,
  Stethoscope
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
  FacilityUnitCard,
  FacilityRoomCard,
  ServiceCategoryCard,
  ClinicServiceCard,
  ClinicalIntakeFormCard
} from './cards';

interface DeletingState {
  type: 'unit' | 'room' | 'category' | 'service' | 'form';
  id: string;
  name: string;
}

export function ClinicEssentialsView() {
  const queryClient = useQueryClient();
  const { can } = useAuthContext();
  const canManage = can(PERMISSIONS.CLINICS.MANAGE);

  // Stepped Multi-Stage Creation Modal state
  const [createModalType, setCreateModalType] = React.useState<ClinicEssentialEntityType | null>(
    null
  );

  // Deletion confirmation state
  const [deletingItem, setDeletingItem] = React.useState<DeletingState | null>(null);

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
    isRefetchingUnits ||
    isRefetchingRooms ||
    isRefetchingCategories ||
    isRefetchingServices ||
    isRefetchingForms;

  const handleRefreshAll = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    toast.info('Memperbarui data fasilitas...');
  }, [queryClient]);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (item: DeletingState) => {
      switch (item.type) {
        case 'unit':
          await clinicEssentialsApi.deleteUnit(item.id);
          break;
        case 'room':
          await clinicEssentialsApi.deleteRoom(item.id);
          break;
        case 'category':
          await clinicEssentialsApi.deleteCategory(item.id);
          break;
        case 'service':
          await clinicEssentialsApi.deleteService(item.id);
          break;
        case 'form':
          await clinicEssentialsApi.deleteForm(item.id);
          break;
      }
    },
    onSuccess: (_, item) => {
      toast.success(`${item.name} berhasil dihapus/dinonaktifkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      setDeletingItem(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menonaktifkan item';
      toast.error(msg);
    }
  });

  // Responsive compact state (standard across portal: <= 1024px or <= 1280px with expanded sidebar)
  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  // Active Tab state for dynamic header actions
  const [activeTab, setActiveTab] = React.useState<
    'units' | 'rooms' | 'categories' | 'services' | 'forms'
  >('units');

  // Filter and search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [unitFilter, setUnitFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

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
  }, [units, rooms, categories, services, forms]);

  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: setSearchQuery,
    id: 'clinic-essentials-search',
    placeholder: 'Pencarian Fasilitas...',
    indexItems
  });

  const query = searchQuery.trim().toLowerCase();

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

  // On compact/mobile viewport, inject "Bagian Fasilitas" into the facet groups
  // so the user can filter via the right-side FacetSidebarSheet instead of a cramped horizontal tab.
  const effectiveFacetGroups = React.useMemo<FacetGroupDefinition[]>(() => {
    if (!isCompact) return facetGroups;

    const entityFacet: FacetGroupDefinition = {
      id: 'entityTab',
      title: 'Bagian Fasilitas',
      icon: Building2,
      mode: 'single',
      options: [
        { label: 'Unit & Poliklinik', value: 'units', count: filteredUnits.length },
        { label: 'Ruang Periksa', value: 'rooms', count: filteredRooms.length },
        { label: 'Kategori Layanan', value: 'categories', count: filteredCategories.length },
        { label: 'Layanan Medis', value: 'services', count: filteredServices.length },
        { label: 'Formulir Intake', value: 'forms', count: filteredForms.length }
      ],
      selectedValues: [activeTab],
      onSelect: (val) => {
        if (val) setActiveTab(val as typeof activeTab);
      },
      onReset: () => setActiveTab('units'),
      popoverWidth: 'w-56',
      resetLabel: 'Unit & Poliklinik'
    };

    return [entityFacet, ...facetGroups];
  }, [
    isCompact,
    facetGroups,
    activeTab,
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
            <Button
              type='button'
              variant='outline'
              size={isCompact ? 'icon' : 'sm'}
              onClick={handleRefreshAll}
              disabled={isAnyRefetching}
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
              </>
            )}
          </div>
        }
      />

      {/* Tabs Layout */}
      <Tabs
        value={activeTab}
        onValueChange={(val) =>
          setActiveTab(val as 'units' | 'rooms' | 'categories' | 'services' | 'forms')
        }
        className='w-full space-y-4'
      >
        {!isCompact && (
          <TabsList className='grid grid-cols-2 sm:grid-cols-5 w-full h-auto p-1 bg-muted/60'>
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
                  onDelete={(unit) =>
                    setDeletingItem({ type: 'unit', id: unit.id, name: unit.name })
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
                  onDelete={(room) =>
                    setDeletingItem({ type: 'room', id: room.id, name: room.name })
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
                  onDelete={(category) =>
                    setDeletingItem({ type: 'category', id: category.id, name: category.name })
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
                  onDelete={(service) =>
                    setDeletingItem({ type: 'service', id: service.id, name: service.name })
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
                  onDelete={(form) =>
                    setDeletingItem({ type: 'form', id: form.id, name: form.name })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Stepped Multi-Stage Creation Modal */}
      {createModalType && (
        <ClinicEssentialFormModal
          open={Boolean(createModalType)}
          onOpenChange={(open) => !open && setCreateModalType(null)}
          type={createModalType}
          units={units}
          categories={categories}
          forms={forms}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
          }}
        />
      )}

      {/* Deletion Confirmation Alert Dialog */}
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
    </div>
  );
}
