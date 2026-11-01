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
  Pencil,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';

import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
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

  // Tab state
  const [activeTab, setActiveTab] = React.useState<FacilityResource>('units');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  // Dialog visibility states
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

  // Deletion confirmation state
  const [deletingItem, setDeletingItem] = React.useState<DeletingState | null>(null);

  // 0. Fetch Unit Types (Master Tipe Unit)
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

  // Current tab items computation
  const currentItems = React.useMemo(() => {
    switch (activeTab) {
      case 'unit-types':
        return unitTypes;
      case 'units':
        return units;
      case 'rooms':
        return rooms;
      case 'categories':
        return categories;
      case 'services':
        return services;
      case 'forms':
        return forms;
    }
  }, [activeTab, unitTypes, units, rooms, categories, services, forms]);

  const isAllSelected =
    currentItems.length > 0 && currentItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

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
      toast.success(`${item.name} berhasil dihapus/dinonaktifkan.`);
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

  return (
    <div className='space-y-6'>
      {/* Header Toolbar */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b'>
        <div className='flex items-center gap-2 self-stretch sm:self-auto'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefreshAll}
            disabled={isAnyRefetching || isPerformingAction}
            className='gap-1.5 text-xs'
          >
            <RefreshCw className={`size-3.5 ${isAnyRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Config Context Menu Button */}
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size='sm' className='gap-1.5 text-xs font-medium shadow-xs'>
                  <Settings2 className='size-3.5' />
                  Config
                  <ChevronDown className='size-3 opacity-60' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
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
                  onClick={() => {
                    setEditingUnit(null);
                    setIsCreateUnitOpen(true);
                  }}
                  className='cursor-pointer gap-2'
                >
                  <Building2 className='size-4 text-primary' />
                  <span>Tambah Unit / Poliklinik</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setEditingRoom(null);
                    setIsCreateRoomOpen(true);
                  }}
                  className='cursor-pointer gap-2'
                >
                  <DoorOpen className='size-4 text-primary' />
                  <span>Tambah Ruang Periksa</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCreateCategoryOpen(true);
                  }}
                  className='cursor-pointer gap-2'
                >
                  <Folder className='size-4 text-primary' />
                  <span>Tambah Kategori Layanan</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setEditingService(null);
                    setIsCreateServiceOpen(true);
                  }}
                  className='cursor-pointer gap-2'
                >
                  <Stethoscope className='size-4 text-primary' />
                  <span>Tambah Layanan Medis</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    setEditingForm(null);
                    setIsCreateFormOpen(true);
                  }}
                  className='cursor-pointer gap-2'
                >
                  <ClipboardList className='size-4 text-primary' />
                  <span>Tambah Formulir Intake</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as FacilityResource);
          setSelectedIds([]);
        }}
        className='w-full space-y-4'
      >
        <TabsList className='grid grid-cols-2 sm:grid-cols-6 w-full h-auto p-1 bg-muted/60'>
          <TabsTrigger value='unit-types' className='text-xs py-1.5 gap-1.5'>
            <Layers className='size-3.5' />
            <span>Tipe Unit ({unitTypes.length})</span>
          </TabsTrigger>
          <TabsTrigger value='units' className='text-xs py-1.5 gap-1.5'>
            <Building2 className='size-3.5' />
            <span>Unit ({units.length})</span>
          </TabsTrigger>
          <TabsTrigger value='rooms' className='text-xs py-1.5 gap-1.5'>
            <DoorOpen className='size-3.5' />
            <span>Ruangan ({rooms.length})</span>
          </TabsTrigger>
          <TabsTrigger value='categories' className='text-xs py-1.5 gap-1.5'>
            <Folder className='size-3.5' />
            <span>Kategori ({categories.length})</span>
          </TabsTrigger>
          <TabsTrigger value='services' className='text-xs py-1.5 gap-1.5'>
            <Stethoscope className='size-3.5' />
            <span>Layanan ({services.length})</span>
          </TabsTrigger>
          <TabsTrigger value='forms' className='text-xs py-1.5 gap-1.5'>
            <ClipboardList className='size-3.5' />
            <span>Formulir ({forms.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* 0. Tab Unit Types */}
        <TabsContent value='unit-types'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-base font-semibold'>Tipe Unit Fasilitas</CardTitle>
                  <CardDescription className='text-xs'>
                    Daftar master klasifikasi tipe unit fasilitas (misal: Poliklinik Rawat Jalan,
                    Ruang Rawat Inap, Departemen Medis).
                  </CardDescription>
                </div>
                {canManage && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setEditingUnitType(null);
                      setIsCreateUnitTypeOpen(true);
                    }}
                    className='text-xs gap-1 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Tipe Unit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUnitTypes ? (
                <div className='space-y-2 py-4'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ) : unitTypes.length === 0 ? (
                <div className='text-center py-10 border border-dashed rounded-lg bg-muted/20'>
                  <Layers className='size-8 mx-auto text-muted-foreground/50 mb-2' />
                  <p className='text-sm font-medium'>Belum ada tipe unit terdaftar</p>
                  <p className='text-xs text-muted-foreground mt-1 mb-4'>
                    Daftarkan tipe unit fasilitas pertama (misal: Poliklinik Rawat Jalan, Ruang
                    Rawat Inap, Departemen Medis).
                  </p>
                  {canManage && (
                    <Button
                      size='sm'
                      onClick={() => {
                        setEditingUnitType(null);
                        setIsCreateUnitTypeOpen(true);
                      }}
                      className='text-xs gap-1'
                    >
                      <Plus className='size-3.5' /> Tambah Tipe Unit
                    </Button>
                  )}
                </div>
              ) : (
                <div className='overflow-x-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {canManage && (
                          <TableHead className='w-[40px]'>
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label='Pilih semua'
                            />
                          </TableHead>
                        )}
                        <TableHead>Nama Tipe Unit</TableHead>
                        <TableHead>Kode (SSOT)</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Unit Terhubung</TableHead>
                        {canManage && <TableHead className='w-[110px] text-right'>Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unitTypes.map((t) => (
                        <TableRow
                          key={t.id}
                          data-state={selectedIds.includes(t.id) ? 'selected' : undefined}
                        >
                          {canManage && (
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(t.id)}
                                onCheckedChange={() => handleToggleSelect(t.id)}
                                aria-label={`Pilih ${t.name}`}
                              />
                            </TableCell>
                          )}
                          <TableCell className='font-medium text-xs sm:text-sm'>{t.name}</TableCell>
                          <TableCell className='font-mono text-xs font-semibold text-primary'>
                            {t.code}
                          </TableCell>
                          <TableCell className='text-xs text-muted-foreground max-w-xs truncate'>
                            {t.description || '-'}
                          </TableCell>
                          <TableCell className='text-xs font-mono text-muted-foreground'>
                            <div className='flex items-center gap-1.5'>
                              <ShiftIconDisplay icon={t.iconName || 'building-2'} size='sm' />
                              <span className='truncate'>{t.iconName || 'building-2'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={t.isActive ? 'outline' : 'secondary'}
                              className={`text-[10px] ${t.isActive ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'text-muted-foreground'}`}
                            >
                              {t.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant='secondary' className='text-[10px] font-mono'>
                              {t.unitCount || 0} unit
                            </Badge>
                          </TableCell>
                          {canManage && (
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-1'>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className={`size-7 ${t.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'}`}
                                  title={t.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                  onClick={() =>
                                    toggleActiveMutation.mutate({
                                      resource: 'unit-types',
                                      id: t.id,
                                      isActive: !t.isActive
                                    })
                                  }
                                  disabled={isPerformingAction}
                                >
                                  <Power className='size-3.5' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-7 text-muted-foreground hover:text-foreground'
                                  title='Edit'
                                  onClick={() => {
                                    setEditingUnitType(t);
                                    setIsCreateUnitTypeOpen(true);
                                  }}
                                  disabled={isPerformingAction}
                                >
                                  <Pencil className='size-3.5' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-7 text-destructive hover:bg-destructive/10'
                                  title='Hapus'
                                  onClick={() =>
                                    setDeletingItem({ type: 'unit-types', id: t.id, name: t.name })
                                  }
                                  disabled={isPerformingAction}
                                >
                                  <Trash2 className='size-3.5' />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 1. Tab Units */}
        <TabsContent value='units'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-base font-semibold'>Unit & Poliklinik</CardTitle>
                  <CardDescription className='text-xs'>
                    Daftar unit poliklinik atau departemen tempat dilaksanakannya layanan kesehatan.
                  </CardDescription>
                </div>
                {canManage && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setEditingUnit(null);
                      setIsCreateUnitOpen(true);
                    }}
                    className='text-xs gap-1 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Unit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUnits ? (
                <div className='space-y-2 py-4'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ) : units.length === 0 ? (
                <div className='text-center py-10 border border-dashed rounded-lg bg-muted/20'>
                  <Building2 className='size-8 mx-auto text-muted-foreground/50 mb-2' />
                  <p className='text-sm font-medium'>Belum ada unit fasilitas terdaftar</p>
                  <p className='text-xs text-muted-foreground mt-1 mb-4'>
                    Mulai dengan menambahkan unit poliklinik pertama (misal: Rawat Jalan atau
                    Layanan Spesialis).
                  </p>
                  {canManage && (
                    <Button
                      size='sm'
                      onClick={() => {
                        setEditingUnit(null);
                        setIsCreateUnitOpen(true);
                      }}
                      className='text-xs gap-1'
                    >
                      <Plus className='size-3.5' /> Tambah Unit
                    </Button>
                  )}
                </div>
              ) : (
                <div className='overflow-x-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {canManage && (
                          <TableHead className='w-[40px]'>
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label='Pilih semua'
                            />
                          </TableHead>
                        )}
                        <TableHead>Nama Unit</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Prefix Antrean</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead>Status</TableHead>
                        {canManage && <TableHead className='w-[110px] text-right'>Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {units.map((u) => (
                        <TableRow
                          key={u.id}
                          data-state={selectedIds.includes(u.id) ? 'selected' : undefined}
                        >
                          {canManage && (
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(u.id)}
                                onCheckedChange={() => handleToggleSelect(u.id)}
                                aria-label={`Pilih ${u.name}`}
                              />
                            </TableCell>
                          )}
                          <TableCell className='font-medium text-xs sm:text-sm'>{u.name}</TableCell>
                          <TableCell className='font-mono text-xs text-muted-foreground'>
                            {u.code}
                          </TableCell>
                          <TableCell>
                            {u.queuePrefix ? (
                              <Badge variant='secondary' className='text-[10px] font-mono'>
                                {u.queuePrefix}
                              </Badge>
                            ) : (
                              <span className='text-xs text-muted-foreground'>-</span>
                            )}
                          </TableCell>
                          <TableCell className='text-xs'>
                            {u.unitTypeName || u.unitType?.name || '-'}
                          </TableCell>
                          <TableCell className='text-xs text-muted-foreground'>
                            {u.floor ? `Lt. ${u.floor}` : ''} {u.location ? `(${u.location})` : ''}
                            {!u.floor && !u.location && '-'}
                          </TableCell>
                          <TableCell className='text-xs font-mono text-muted-foreground'>
                            <div className='flex items-center gap-1.5'>
                              <ShiftIconDisplay icon={u.iconName || 'building-2'} size='sm' />
                              <span className='truncate'>{u.iconName || 'building-2'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.isActive ? 'outline' : 'secondary'}
                              className={`text-[10px] ${u.isActive ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'text-muted-foreground'}`}
                            >
                              {u.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </TableCell>
                          {canManage && (
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-1'>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className={`size-7 ${u.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'}`}
                                  title={u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                  onClick={() =>
                                    toggleActiveMutation.mutate({
                                      resource: 'units',
                                      id: u.id,
                                      isActive: !u.isActive
                                    })
                                  }
                                  disabled={isPerformingAction}
                                >
                                  <Power className='size-3.5' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-7 text-muted-foreground hover:text-foreground'
                                  title='Edit'
                                  onClick={() => {
                                    setEditingUnit(u);
                                    setIsCreateUnitOpen(true);
                                  }}
                                  disabled={isPerformingAction}
                                >
                                  <Pencil className='size-3.5' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-7 text-destructive hover:bg-destructive/10'
                                  title='Hapus'
                                  onClick={() =>
                                    setDeletingItem({ type: 'units', id: u.id, name: u.name })
                                  }
                                  disabled={isPerformingAction}
                                >
                                  <Trash2 className='size-3.5' />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Tab Rooms */}
        <TabsContent value='rooms'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-base font-semibold'>Ruang Periksa</CardTitle>
                  <CardDescription className='text-xs'>
                    Ruangan pemeriksaan fisik tempat sesi antrean dokter dan perawat berlangsung.
                  </CardDescription>
                </div>
                {canManage && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setEditingRoom(null);
                      setIsCreateRoomOpen(true);
                    }}
                    disabled={units.length === 0}
                    className='text-xs gap-1 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Ruangan
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRooms ? (
                <div className='space-y-2 py-4'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ) : rooms.length === 0 ? (
                <div className='text-center py-10 border border-dashed rounded-lg bg-muted/20'>
                  <DoorOpen className='size-8 mx-auto text-muted-foreground/50 mb-2' />
                  <p className='text-sm font-medium'>Belum ada ruangan periksa</p>
                  <p className='text-xs text-muted-foreground mt-1 mb-4'>
                    Tambahkan ruangan dan hubungkan ke unit poliklinik induk.
                  </p>
                  {canManage && (
                    <Button
                      size='sm'
                      onClick={() => {
                        setEditingRoom(null);
                        setIsCreateRoomOpen(true);
                      }}
                      disabled={units.length === 0}
                      className='text-xs gap-1'
                    >
                      <Plus className='size-3.5' /> Tambah Ruangan
                    </Button>
                  )}
                </div>
              ) : (
                <div className='overflow-x-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {canManage && (
                          <TableHead className='w-[40px]'>
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label='Pilih semua'
                            />
                          </TableHead>
                        )}
                        <TableHead>Nama Ruangan</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Unit Induk</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Status</TableHead>
                        {canManage && <TableHead className='w-[110px] text-right'>Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((r) => {
                        const parentUnit = units.find((u) => u.id === r.unitId);
                        return (
                          <TableRow
                            key={r.id}
                            data-state={selectedIds.includes(r.id) ? 'selected' : undefined}
                          >
                            {canManage && (
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.includes(r.id)}
                                  onCheckedChange={() => handleToggleSelect(r.id)}
                                  aria-label={`Pilih ${r.name}`}
                                />
                              </TableCell>
                            )}
                            <TableCell className='font-medium text-xs sm:text-sm'>
                              {r.name}
                            </TableCell>
                            <TableCell className='font-mono text-xs text-muted-foreground'>
                              {r.code}
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline' className='text-[10px]'>
                                {parentUnit?.name || r.unitId}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-xs text-muted-foreground'>
                              {r.floor ? `Lt. ${r.floor}` : ''}{' '}
                              {r.location ? `(${r.location})` : ''}
                              {!r.floor && !r.location && '-'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={r.isActive ? 'outline' : 'secondary'}
                                className={`text-[10px] ${r.isActive ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'text-muted-foreground'}`}
                              >
                                {r.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </TableCell>
                            {canManage && (
                              <TableCell className='text-right'>
                                <div className='flex items-center justify-end gap-1'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className={`size-7 ${r.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'}`}
                                    title={r.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                    onClick={() =>
                                      toggleActiveMutation.mutate({
                                        resource: 'rooms',
                                        id: r.id,
                                        isActive: !r.isActive
                                      })
                                    }
                                    disabled={isPerformingAction}
                                  >
                                    <Power className='size-3.5' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='size-7 text-muted-foreground hover:text-foreground'
                                    title='Edit'
                                    onClick={() => {
                                      setEditingRoom(r);
                                      setIsCreateRoomOpen(true);
                                    }}
                                    disabled={isPerformingAction}
                                  >
                                    <Pencil className='size-3.5' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='size-7 text-destructive hover:bg-destructive/10'
                                    title='Hapus'
                                    onClick={() =>
                                      setDeletingItem({ type: 'rooms', id: r.id, name: r.name })
                                    }
                                    disabled={isPerformingAction}
                                  >
                                    <Trash2 className='size-3.5' />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Tab Categories */}
        <TabsContent value='categories'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-base font-semibold'>Kategori Layanan Medis</CardTitle>
                  <CardDescription className='text-xs'>
                    Pengelompokan jenis layanan medis untuk memudahkan navigasi pasien dan jadwal
                    dokter.
                  </CardDescription>
                </div>
                {canManage && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setEditingCategory(null);
                      setIsCreateCategoryOpen(true);
                    }}
                    className='text-xs gap-1 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Kategori
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className='space-y-2 py-4'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ) : categories.length === 0 ? (
                <div className='text-center py-10 border border-dashed rounded-lg bg-muted/20'>
                  <Folder className='size-8 mx-auto text-muted-foreground/50 mb-2' />
                  <p className='text-sm font-medium'>Belum ada kategori layanan</p>
                  <p className='text-xs text-muted-foreground mt-1 mb-4'>
                    Tambahkan kelompok kategori layanan medis (misal: Layanan Rawat Jalan, Layanan
                    Spesialis).
                  </p>
                  {canManage && (
                    <Button
                      size='sm'
                      onClick={() => {
                        setEditingCategory(null);
                        setIsCreateCategoryOpen(true);
                      }}
                      className='text-xs gap-1'
                    >
                      <Plus className='size-3.5' /> Tambah Kategori
                    </Button>
                  )}
                </div>
              ) : (
                <div className='overflow-x-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {canManage && (
                          <TableHead className='w-[40px]'>
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label='Pilih semua'
                            />
                          </TableHead>
                        )}
                        <TableHead>Nama Kategori</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Prefix</TableHead>
                        <TableHead>Unit Terafiliasi</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead>Status</TableHead>
                        {canManage && <TableHead className='w-[110px] text-right'>Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((c) => {
                        const parentUnit = units.find((u) => u.id === c.unitId);
                        return (
                          <TableRow
                            key={c.id}
                            data-state={selectedIds.includes(c.id) ? 'selected' : undefined}
                          >
                            {canManage && (
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.includes(c.id)}
                                  onCheckedChange={() => handleToggleSelect(c.id)}
                                  aria-label={`Pilih ${c.name}`}
                                />
                              </TableCell>
                            )}
                            <TableCell className='font-medium text-xs sm:text-sm'>
                              {c.name}
                            </TableCell>
                            <TableCell className='font-mono text-xs text-muted-foreground'>
                              {c.code}
                            </TableCell>
                            <TableCell>
                              {c.codePrefix ? (
                                <Badge variant='secondary' className='text-[10px] font-mono'>
                                  {c.codePrefix}
                                </Badge>
                              ) : (
                                <span className='text-xs text-muted-foreground'>-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {parentUnit ? (
                                <Badge variant='outline' className='text-[10px]'>
                                  {parentUnit.name}
                                </Badge>
                              ) : (
                                <span className='text-xs text-muted-foreground'>Global</span>
                              )}
                            </TableCell>
                            <TableCell className='text-xs font-mono text-muted-foreground'>
                              <div className='flex items-center gap-1.5'>
                                <ShiftIconDisplay icon={c.iconName || 'folder'} size='sm' />
                                <span className='truncate'>{c.iconName || 'folder'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={c.isActive ? 'outline' : 'secondary'}
                                className={`text-[10px] ${c.isActive ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'text-muted-foreground'}`}
                              >
                                {c.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </TableCell>
                            {canManage && (
                              <TableCell className='text-right'>
                                <div className='flex items-center justify-end gap-1'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className={`size-7 ${c.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'}`}
                                    title={c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                    onClick={() =>
                                      toggleActiveMutation.mutate({
                                        resource: 'categories',
                                        id: c.id,
                                        isActive: !c.isActive
                                      })
                                    }
                                    disabled={isPerformingAction}
                                  >
                                    <Power className='size-3.5' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='size-7 text-muted-foreground hover:text-foreground'
                                    title='Edit'
                                    onClick={() => {
                                      setEditingCategory(c);
                                      setIsCreateCategoryOpen(true);
                                    }}
                                    disabled={isPerformingAction}
                                  >
                                    <Pencil className='size-3.5' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='size-7 text-destructive hover:bg-destructive/10'
                                    title='Hapus'
                                    onClick={() =>
                                      setDeletingItem({
                                        type: 'categories',
                                        id: c.id,
                                        name: c.name
                                      })
                                    }
                                    disabled={isPerformingAction}
                                  >
                                    <Trash2 className='size-3.5' />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Tab Services */}
        <TabsContent value='services'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-base font-semibold'>Layanan Tindakan Medis</CardTitle>
                  <CardDescription className='text-xs'>
                    Tindakan medis yang dapat dipilih pasien, lengkap dengan koneksi ke formulir
                    klinis intake.
                  </CardDescription>
                </div>
                {canManage && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setEditingService(null);
                      setIsCreateServiceOpen(true);
                    }}
                    disabled={categories.length === 0}
                    className='text-xs gap-1 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Layanan
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingServices ? (
                <div className='space-y-2 py-4'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ) : services.length === 0 ? (
                <div className='text-center py-10 border border-dashed rounded-lg bg-muted/20'>
                  <Stethoscope className='size-8 mx-auto text-muted-foreground/50 mb-2' />
                  <p className='text-sm font-medium'>Belum ada layanan medis terdaftar</p>
                  <p className='text-xs text-muted-foreground mt-1 mb-4'>
                    Buat tindakan medis dan hubungkan ke formulir intake yang sesuai.
                  </p>
                  {canManage && (
                    <Button
                      size='sm'
                      onClick={() => {
                        setEditingService(null);
                        setIsCreateServiceOpen(true);
                      }}
                      disabled={categories.length === 0}
                      className='text-xs gap-1'
                    >
                      <Plus className='size-3.5' /> Tambah Layanan
                    </Button>
                  )}
                </div>
              ) : (
                <div className='overflow-x-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {canManage && (
                          <TableHead className='w-[40px]'>
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label='Pilih semua'
                            />
                          </TableHead>
                        )}
                        <TableHead>Nama Layanan</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Prefix</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Formulir Intake Terhubung</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead>Status</TableHead>
                        {canManage && <TableHead className='w-[110px] text-right'>Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((s) => {
                        const parentCat = categories.find((c) => c.id === s.serviceCategoryId);
                        const linkedForm = forms.find((f) => f.id === s.intakeFormId);
                        return (
                          <TableRow
                            key={s.id}
                            data-state={selectedIds.includes(s.id) ? 'selected' : undefined}
                          >
                            {canManage && (
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.includes(s.id)}
                                  onCheckedChange={() => handleToggleSelect(s.id)}
                                  aria-label={`Pilih ${s.name}`}
                                />
                              </TableCell>
                            )}
                            <TableCell className='font-medium text-xs sm:text-sm'>
                              {s.name}
                            </TableCell>
                            <TableCell className='font-mono text-xs text-muted-foreground'>
                              {s.code}
                            </TableCell>
                            <TableCell>
                              <Badge variant='secondary' className='text-[10px] font-mono'>
                                {s.codePrefix}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline' className='text-[10px]'>
                                {parentCat?.name || s.serviceCategoryId}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {linkedForm ? (
                                <Badge className='text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'>
                                  {linkedForm.name} ({linkedForm.code})
                                </Badge>
                              ) : (
                                <span className='text-xs text-muted-foreground italic'>
                                  Standar / Umum
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-xs font-mono text-muted-foreground'>
                              <div className='flex items-center gap-1.5'>
                                <ShiftIconDisplay icon={s.iconName || 'stethoscope'} size='sm' />
                                <span className='truncate'>{s.iconName || 'stethoscope'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={s.isActive ? 'outline' : 'secondary'}
                                className={`text-[10px] ${s.isActive ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'text-muted-foreground'}`}
                              >
                                {s.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </TableCell>
                            {canManage && (
                              <TableCell className='text-right'>
                                <div className='flex items-center justify-end gap-1'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className={`size-7 ${s.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'}`}
                                    title={s.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                    onClick={() =>
                                      toggleActiveMutation.mutate({
                                        resource: 'services',
                                        id: s.id,
                                        isActive: !s.isActive
                                      })
                                    }
                                    disabled={isPerformingAction}
                                  >
                                    <Power className='size-3.5' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='size-7 text-muted-foreground hover:text-foreground'
                                    title='Edit'
                                    onClick={() => {
                                      setEditingService(s);
                                      setIsCreateServiceOpen(true);
                                    }}
                                    disabled={isPerformingAction}
                                  >
                                    <Pencil className='size-3.5' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='size-7 text-destructive hover:bg-destructive/10'
                                    title='Hapus'
                                    onClick={() =>
                                      setDeletingItem({ type: 'services', id: s.id, name: s.name })
                                    }
                                    disabled={isPerformingAction}
                                  >
                                    <Trash2 className='size-3.5' />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Tab Intake Forms */}
        <TabsContent value='forms'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    Registri Formulir Intake Klinis
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Definisi kode master formulir khusus (general, pregnancy, immunization, dll.)
                    yang dapat dihubungkan ke layanan medis secara dinamis.
                  </CardDescription>
                </div>
                {canManage && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setEditingForm(null);
                      setIsCreateFormOpen(true);
                    }}
                    className='text-xs gap-1 h-8'
                  >
                    <Plus className='size-3.5' /> Tambah Formulir
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingForms ? (
                <div className='space-y-2 py-4'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ) : forms.length === 0 ? (
                <div className='text-center py-10 border border-dashed rounded-lg bg-muted/20'>
                  <ClipboardList className='size-8 mx-auto text-muted-foreground/50 mb-2' />
                  <p className='text-sm font-medium'>Belum ada formulir intake terdaftar</p>
                  <p className='text-xs text-muted-foreground mt-1 mb-4'>
                    Daftarkan kode formulir klinis agar layanan dapat dikoneksikan ke lembar
                    anamnesis yang tepat.
                  </p>
                  {canManage && (
                    <Button
                      size='sm'
                      onClick={() => {
                        setEditingForm(null);
                        setIsCreateFormOpen(true);
                      }}
                      className='text-xs gap-1'
                    >
                      <Plus className='size-3.5' /> Tambah Formulir
                    </Button>
                  )}
                </div>
              ) : (
                <div className='overflow-x-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {canManage && (
                          <TableHead className='w-[40px]'>
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label='Pilih semua'
                            />
                          </TableHead>
                        )}
                        <TableHead>Nama Formulir</TableHead>
                        <TableHead>Kode (SSOT)</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead>Status</TableHead>
                        {canManage && <TableHead className='w-[110px] text-right'>Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forms.map((f) => (
                        <TableRow
                          key={f.id}
                          data-state={selectedIds.includes(f.id) ? 'selected' : undefined}
                        >
                          {canManage && (
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(f.id)}
                                onCheckedChange={() => handleToggleSelect(f.id)}
                                aria-label={`Pilih ${f.name}`}
                              />
                            </TableCell>
                          )}
                          <TableCell className='font-medium text-xs sm:text-sm'>{f.name}</TableCell>
                          <TableCell className='font-mono text-xs font-semibold text-primary'>
                            {f.code}
                          </TableCell>
                          <TableCell className='text-xs text-muted-foreground max-w-xs truncate'>
                            {f.description || '-'}
                          </TableCell>
                          <TableCell className='text-xs font-mono text-muted-foreground'>
                            <div className='flex items-center gap-1.5'>
                              <ShiftIconDisplay icon={f.iconName || 'clipboard-list'} size='sm' />
                              <span className='truncate'>{f.iconName || 'clipboard-list'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={f.isActive ? 'outline' : 'secondary'}
                              className={`text-[10px] ${f.isActive ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'text-muted-foreground'}`}
                            >
                              {f.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </TableCell>
                          {canManage && (
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-1'>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className={`size-7 ${f.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'}`}
                                  title={f.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                  onClick={() =>
                                    toggleActiveMutation.mutate({
                                      resource: 'forms',
                                      id: f.id,
                                      isActive: !f.isActive
                                    })
                                  }
                                  disabled={isPerformingAction}
                                >
                                  <Power className='size-3.5' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-7 text-muted-foreground hover:text-foreground'
                                  title='Edit'
                                  onClick={() => {
                                    setEditingForm(f);
                                    setIsCreateFormOpen(true);
                                  }}
                                  disabled={isPerformingAction}
                                >
                                  <Pencil className='size-3.5' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-7 text-destructive hover:bg-destructive/10'
                                  title='Hapus'
                                  onClick={() =>
                                    setDeletingItem({ type: 'forms', id: f.id, name: f.name })
                                  }
                                  disabled={isPerformingAction}
                                >
                                  <Trash2 className='size-3.5' />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Bulk Action Toolbar */}
      {selectedIds.length > 0 && canManage && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-background/95 backdrop-blur-md border shadow-lg rounded-full animate-in fade-in slide-in-from-bottom-4'>
          <span className='text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full'>
            {selectedIds.length} item terpilih
          </span>
          <div className='h-4 w-px bg-border' />
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
            onClick={() =>
              bulkMutation.mutate({ resource: activeTab, action: 'activate', ids: selectedIds })
            }
            disabled={bulkMutation.isPending}
          >
            <CheckCircle2 className='size-3.5' />
            Aktifkan
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50'
            onClick={() =>
              bulkMutation.mutate({ resource: activeTab, action: 'deactivate', ids: selectedIds })
            }
            disabled={bulkMutation.isPending}
          >
            <Power className='size-3.5' />
            Nonaktifkan
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs gap-1 text-destructive hover:bg-destructive/10'
            onClick={() => setIsBulkDeleteConfirmOpen(true)}
            disabled={bulkMutation.isPending}
          >
            <Trash2 className='size-3.5' />
            Hapus
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='h-7 text-xs text-muted-foreground'
            onClick={() => setSelectedIds([])}
            disabled={bulkMutation.isPending}
          >
            Batal
          </Button>
        </div>
      )}

      {/* Reused Creation / Edit Dialogs */}
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
