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
  HelpCircle,
  Layers,
  Megaphone,
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
import type { ResourceToolbarConfig } from '../../config/clinic-essentials-toolbar.config';

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
  currentConfig: ResourceToolbarConfig;
  unitsCount: number;
  categoriesCount: number;
  unitTypesCount?: number;
  onPrimaryAction: () => void;
  onOpenModal: (type: ClinicEssentialEntityType) => void;
  onOpenDemographicModal: (
    type: 'blood-types' | 'education-levels' | 'religions' | 'occupations',
    label: string
  ) => void;
  onOpenFacilityModal?: () => void;
  onOpenFaqModal?: () => void;
  onOpenPromotionModal?: () => void;
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
  activeTab: _activeTab,
  currentConfig,
  unitsCount,
  categoriesCount,
  unitTypesCount = 0,
  onPrimaryAction,
  onOpenModal,
  onOpenDemographicModal,
  onOpenFacilityModal,
  onOpenFaqModal,
  onOpenPromotionModal,
}: ClinicEssentialsHeaderProps) {
  // Check if primary action button should be disabled (e.g. rooms need units, services need categories)
  const disabledState = React.useMemo(() => {
    if (!currentConfig.getDisabledState) {
      return { isDisabled: false };
    }
    return currentConfig.getDisabledState({
      unitTypesCount,
      unitsCount,
      categoriesCount,
    });
  }, [currentConfig, unitTypesCount, unitsCount, categoriesCount]);

  return (
    <div className='shrink-0'>
      <ResponsiveFacetToolbox
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onOpenSearchDialog={onOpenSearchDialog}
        searchPlaceholder={currentConfig.searchPlaceholder}
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
                {/* Dynamic Primary Action Button according to active tab */}
                <Button
                  type='button'
                  size={isCompact ? 'icon' : 'sm'}
                  onClick={onPrimaryAction}
                  disabled={disabledState.isDisabled}
                  className={
                    isCompact
                      ? 'size-8 rounded-md shrink-0 shadow-xs'
                      : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                  }
                  title={disabledState.isDisabled ? disabledState.reason : currentConfig.createButtonTitle}
                >
                  <Plus className='size-3.5' />
                  {!isCompact && <span>{currentConfig.createButtonLabel}</span>}
                </Button>

                {/* Quick Master Config Dropdown for jumping across entities */}
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

                    <DropdownMenuItem
                      onClick={() => onOpenFacilityModal?.()}
                      className='cursor-pointer gap-2'
                    >
                      <Building2 className='size-4 text-primary' />
                      <span>Tambah Fasilitas Unggulan</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onOpenFaqModal?.()}
                      className='cursor-pointer gap-2'
                    >
                      <HelpCircle className='size-4 text-primary' />
                      <span>Tambah Pertanyaan FAQ</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onOpenPromotionModal?.()}
                      className='cursor-pointer gap-2'
                    >
                      <Megaphone className='size-4 text-primary' />
                      <span>Tambah Promosi & Pengumuman</span>
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
