'use client';

import * as React from 'react';
import {
  Bookmark,
  Briefcase,
  Building2,
  ChevronDown,
  DoorOpen,
  Droplet,
  Folder,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Settings2,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResponsiveFacetToolbox,
  type FacetGroupDefinition,
} from '@/shared/ui/responsive-facet-toolbox';
import { cn } from '@/lib/utils';
import type { FacilityResource } from '../../types/clinic-essentials.types';
import type { ClinicEssentialEntityType } from '../../model/useClinicEssentialFormModal';

export interface ClinicEssentialsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSearchDialog: () => void;
  facets: FacetGroupDefinition[];
  isFiltered: boolean;
  onResetAll: () => void;
  activeFilterCount: number;
  isCompact: boolean;
  canManage: boolean;
  hasTabItems: boolean;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onRefreshAll: () => void;
  isAnyRefetching: boolean;
  isPerformingAction: boolean;
  activeTab: FacilityResource;
  unitsCount: number;
  categoriesCount: number;
  onOpenModal: (type: ClinicEssentialEntityType) => void;
  onOpenDemographicModal: (
    type: 'blood-types' | 'education-levels' | 'religions' | 'occupations',
    label: string
  ) => void;
}

export function ClinicEssentialsHeader({
  searchQuery,
  onSearchChange,
  onOpenSearchDialog,
  facets,
  isFiltered,
  onResetAll,
  activeFilterCount,
  isCompact,
  canManage,
  hasTabItems,
  isAllSelected,
  onSelectAll,
  onRefreshAll,
  isAnyRefetching,
  isPerformingAction,
  activeTab,
  unitsCount,
  categoriesCount,
  onOpenModal,
  onOpenDemographicModal,
}: ClinicEssentialsHeaderProps) {
  return (
    <div className='shrink-0'>
      <ResponsiveFacetToolbox
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onOpenSearchDialog={onOpenSearchDialog}
        searchPlaceholder='Pencarian Fasilitas...'
        facets={facets}
        isFiltered={isFiltered}
        onResetAll={onResetAll}
        activeFilterCount={activeFilterCount}
        isCompact={isCompact}
        extraRightSlot={
          <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
            {/* Select All Checkbox Shortcut for active tab */}
            {canManage && hasTabItems && (
              <Button
                type='button'
                variant='outline'
                size={isCompact ? 'icon' : 'sm'}
                onClick={() => onSelectAll(!isAllSelected)}
                className={
                  isCompact ? 'size-8 rounded-md shrink-0' : 'h-8 text-xs font-medium gap-1.5'
                }
                title={isAllSelected ? 'Batalkan pilihan semua' : 'Pilih semua di tab ini'}
              >
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  className='pointer-events-none'
                />
                {!isCompact && <span>{isAllSelected ? 'Lepas Semua' : 'Pilih Semua'}</span>}
              </Button>
            )}

            <Button
              type='button'
              variant='outline'
              size={isCompact ? 'icon' : 'sm'}
              onClick={onRefreshAll}
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
                    onClick={() => onOpenModal('unit-type')}
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
                    onClick={() => onOpenModal('unit')}
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
                    onClick={() => onOpenModal('room')}
                    disabled={unitsCount === 0}
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
                    onClick={() => onOpenModal('category')}
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
                    onClick={() => onOpenModal('service')}
                    disabled={categoriesCount === 0}
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

                {activeTab === 'relationships' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => onOpenModal('relationship')}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Relasi Pasien'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Relasi</span>}
                  </Button>
                )}

                {activeTab === 'blood-types' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => onOpenDemographicModal('blood-types', 'Golongan Darah')}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Golongan Darah'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Golongan Darah</span>}
                  </Button>
                )}

                {activeTab === 'education-levels' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => onOpenDemographicModal('education-levels', 'Pendidikan')}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Jenjang Pendidikan'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Pendidikan</span>}
                  </Button>
                )}

                {activeTab === 'religions' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => onOpenDemographicModal('religions', 'Agama')}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Agama'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Agama</span>}
                  </Button>
                )}

                {activeTab === 'occupations' && (
                  <Button
                    type='button'
                    size={isCompact ? 'icon' : 'sm'}
                    onClick={() => onOpenDemographicModal('occupations', 'Pekerjaan')}
                    className={
                      isCompact
                        ? 'size-8 rounded-md shrink-0 shadow-xs'
                        : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                    }
                    title='Tambah Pekerjaan'
                  >
                    <Plus className='size-3.5' />
                    {!isCompact && <span>Tambah Pekerjaan</span>}
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
                      onClick={() => onOpenModal('unit-type')}
                      className='cursor-pointer gap-2'
                    >
                      <Layers className='size-4 text-primary' />
                      <span>Tambah Klasifikasi Fasilitas</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onOpenModal('unit')}
                      className='cursor-pointer gap-2'
                    >
                      <Building2 className='size-4 text-primary' />
                      <span>Tambah Poliklinik & Departemen</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onOpenModal('room')}
                      disabled={unitsCount === 0}
                      className='cursor-pointer gap-2'
                    >
                      <DoorOpen className='size-4 text-primary' />
                      <span>Tambah Ruang Periksa</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onOpenModal('category')}
                      className='cursor-pointer gap-2'
                    >
                      <Folder className='size-4 text-primary' />
                      <span>Tambah Kelompok Layanan</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onOpenModal('service')}
                      disabled={categoriesCount === 0}
                      className='cursor-pointer gap-2'
                    >
                      <Stethoscope className='size-4 text-primary' />
                      <span>Tambah Service Medis</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onOpenModal('relationship')}
                      className='cursor-pointer gap-2'
                    >
                      <Users className='size-4 text-primary' />
                      <span>Tambah Relasi Pasien</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onOpenDemographicModal('blood-types', 'Golongan Darah')}
                      className='cursor-pointer gap-2'
                    >
                      <Droplet className='size-4 text-primary' />
                      <span>Tambah Golongan Darah</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onOpenDemographicModal('education-levels', 'Pendidikan')}
                      className='cursor-pointer gap-2'
                    >
                      <GraduationCap className='size-4 text-primary' />
                      <span>Tambah Jenjang Pendidikan</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onOpenDemographicModal('religions', 'Agama')}
                      className='cursor-pointer gap-2'
                    >
                      <Bookmark className='size-4 text-primary' />
                      <span>Tambah Master Agama</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onOpenDemographicModal('occupations', 'Pekerjaan')}
                      className='cursor-pointer gap-2'
                    >
                      <Briefcase className='size-4 text-primary' />
                      <span>Tambah Master Pekerjaan</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        }
      />
    </div>
  );
}
