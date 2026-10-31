'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  Folder,
  Plus,
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
import { CreateCategoryDialog } from './dialogs/create-category-dialog';
import { CreateFormDialog } from './dialogs/create-form-dialog';
import { CreateRoomDialog } from './dialogs/create-room-dialog';
import { CreateServiceDialog } from './dialogs/create-service-dialog';
import { CreateUnitDialog } from './dialogs/create-unit-dialog';

interface DeletingState {
  type: 'unit' | 'room' | 'category' | 'service' | 'form';
  id: string;
  name: string;
}

export function ClinicEssentialsView() {
  const queryClient = useQueryClient();
  const { can } = useAuthContext();
  const canManage = can(PERMISSIONS.CLINICS.MANAGE);

  // Dialog visibility states
  const [isCreateUnitOpen, setIsCreateUnitOpen] = React.useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = React.useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = React.useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = React.useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

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

  return (
    <div className='space-y-6'>
      {/* Header Toolbar */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b'>
        <div className='flex items-center gap-2 self-stretch sm:self-auto'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefreshAll}
            disabled={isAnyRefetching}
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
                  onClick={() => setIsCreateUnitOpen(true)}
                  className='cursor-pointer gap-2'
                >
                  <Building2 className='size-4 text-primary' />
                  <span>Tambah Unit / Poliklinik</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsCreateRoomOpen(true)}
                  className='cursor-pointer gap-2'
                >
                  <DoorOpen className='size-4 text-primary' />
                  <span>Tambah Ruang Periksa</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setIsCreateCategoryOpen(true)}
                  className='cursor-pointer gap-2'
                >
                  <Folder className='size-4 text-primary' />
                  <span>Tambah Kategori Layanan</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsCreateServiceOpen(true)}
                  className='cursor-pointer gap-2'
                >
                  <Stethoscope className='size-4 text-primary' />
                  <span>Tambah Layanan Medis</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setIsCreateFormOpen(true)}
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
      <Tabs defaultValue='units' className='w-full space-y-4'>
        <TabsList className='grid grid-cols-2 sm:grid-cols-5 w-full h-auto p-1 bg-muted/60'>
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
                    onClick={() => setIsCreateUnitOpen(true)}
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
                      onClick={() => setIsCreateUnitOpen(true)}
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
                        <TableHead>Nama Unit</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Prefix Antrean</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead className='w-[80px] text-right'>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {units.map((u) => (
                        <TableRow key={u.id}>
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
                          <TableCell className='text-xs capitalize'>
                            {u.unitType || 'polyclinic'}
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
                          <TableCell className='text-right'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='size-7 text-destructive hover:bg-destructive/10'
                              onClick={() =>
                                setDeletingItem({ type: 'unit', id: u.id, name: u.name })
                              }
                            >
                              <Trash2 className='size-3.5' />
                            </Button>
                          </TableCell>
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
                    onClick={() => setIsCreateRoomOpen(true)}
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
                      onClick={() => setIsCreateRoomOpen(true)}
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
                        <TableHead>Nama Ruangan</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Unit Induk</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead className='w-[80px] text-right'>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((r) => {
                        const parentUnit = units.find((u) => u.id === r.unitId);
                        return (
                          <TableRow key={r.id}>
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
                            <TableCell className='text-right'>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='size-7 text-destructive hover:bg-destructive/10'
                                onClick={() =>
                                  setDeletingItem({ type: 'room', id: r.id, name: r.name })
                                }
                              >
                                <Trash2 className='size-3.5' />
                              </Button>
                            </TableCell>
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
                    onClick={() => setIsCreateCategoryOpen(true)}
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
                      onClick={() => setIsCreateCategoryOpen(true)}
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
                        <TableHead>Nama Kategori</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Prefix</TableHead>
                        <TableHead>Unit Terafiliasi</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead className='w-[80px] text-right'>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((c) => {
                        const parentUnit = units.find((u) => u.id === c.unitId);
                        return (
                          <TableRow key={c.id}>
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
                            <TableCell className='text-right'>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='size-7 text-destructive hover:bg-destructive/10'
                                onClick={() =>
                                  setDeletingItem({ type: 'category', id: c.id, name: c.name })
                                }
                              >
                                <Trash2 className='size-3.5' />
                              </Button>
                            </TableCell>
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
                    onClick={() => setIsCreateServiceOpen(true)}
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
                      onClick={() => setIsCreateServiceOpen(true)}
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
                        <TableHead>Nama Layanan</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Prefix</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Formulir Intake Terhubung</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead className='w-[80px] text-right'>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((s) => {
                        const parentCat = categories.find((c) => c.id === s.serviceCategoryId);
                        const linkedForm = forms.find((f) => f.id === s.intakeFormId);
                        return (
                          <TableRow key={s.id}>
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
                            <TableCell className='text-right'>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='size-7 text-destructive hover:bg-destructive/10'
                                onClick={() =>
                                  setDeletingItem({ type: 'service', id: s.id, name: s.name })
                                }
                              >
                                <Trash2 className='size-3.5' />
                              </Button>
                            </TableCell>
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
                    onClick={() => setIsCreateFormOpen(true)}
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
                      onClick={() => setIsCreateFormOpen(true)}
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
                        <TableHead>Nama Formulir</TableHead>
                        <TableHead>Kode (SSOT)</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead className='w-[80px] text-right'>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forms.map((f) => (
                        <TableRow key={f.id}>
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
                          <TableCell className='text-right'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='size-7 text-destructive hover:bg-destructive/10'
                              onClick={() =>
                                setDeletingItem({ type: 'form', id: f.id, name: f.name })
                              }
                            >
                              <Trash2 className='size-3.5' />
                            </Button>
                          </TableCell>
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

      {/* Creation Dialogs */}
      <CreateUnitDialog open={isCreateUnitOpen} onOpenChange={setIsCreateUnitOpen} />

      <CreateRoomDialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen} units={units} />

      <CreateCategoryDialog
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
        units={units}
      />

      <CreateServiceDialog
        open={isCreateServiceOpen}
        onOpenChange={setIsCreateServiceOpen}
        categories={categories}
        forms={forms}
      />

      <CreateFormDialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen} />

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
