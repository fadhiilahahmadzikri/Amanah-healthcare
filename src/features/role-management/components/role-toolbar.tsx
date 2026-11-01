'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  ResponsiveFacetToolbox,
  type FacetGroupDefinition
} from '@/shared/ui/responsive-facet-toolbox';
import {
  AUDIENCE,
  ROLE_TIER,
  type AudienceType,
  type RoleTierType
} from '@/core/auth/permissions.constants';

export interface RoleToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenSearchDialog?: () => void;
  tierFilter: 'all' | RoleTierType;
  onTierFilterChange: (value: 'all' | RoleTierType) => void;
  audienceFilter: 'all' | AudienceType;
  onAudienceFilterChange: (value: 'all' | AudienceType) => void;
  clinicalFilter: 'all' | 'clinical' | 'operational';
  onClinicalFilterChange: (value: 'all' | 'clinical' | 'operational') => void;
  onRefresh: () => void;
  isRefetching: boolean;
  onAddClick?: () => void;
  isCompact?: boolean;
}

export function RoleToolbar({
  searchQuery,
  onSearchChange,
  onOpenSearchDialog,
  tierFilter,
  onTierFilterChange,
  audienceFilter,
  onAudienceFilterChange,
  clinicalFilter,
  onClinicalFilterChange,
  onRefresh,
  isRefetching,
  onAddClick,
  isCompact: isCompactProp
}: RoleToolbarProps) {
  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');
  const isCompact = isCompactProp ?? (isUnder1024 || (isUnder1280 && isSidebarExpanded));

  const facetGroups = React.useMemo<FacetGroupDefinition[]>(() => {
    return [
      {
        id: 'tier',
        title: 'Tier',
        icon: Icons.layers,
        mode: 'single',
        options: [
          { label: 'Macro', value: ROLE_TIER.MACRO },
          { label: 'Micro', value: ROLE_TIER.MICRO }
        ],
        selectedValues: tierFilter !== 'all' ? [tierFilter] : [],
        onSelect: (val) => onTierFilterChange(val === tierFilter ? 'all' : (val as RoleTierType)),
        onReset: () => onTierFilterChange('all'),
        popoverWidth: 'w-44',
        resetLabel: 'Semua Tier'
      },
      {
        id: 'audience',
        title: 'Audience',
        icon: Icons.users,
        mode: 'single',
        options: [
          { label: 'Internal', value: AUDIENCE.INTERNAL },
          { label: 'Eksternal', value: AUDIENCE.EXTERNAL }
        ],
        selectedValues: audienceFilter !== 'all' ? [audienceFilter] : [],
        onSelect: (val) =>
          onAudienceFilterChange(val === audienceFilter ? 'all' : (val as AudienceType)),
        onReset: () => onAudienceFilterChange('all'),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Audience'
      },
      {
        id: 'clinical',
        title: 'Sifat',
        icon: Icons.activity,
        mode: 'single',
        options: [
          { label: 'Klinis', value: 'clinical' },
          { label: 'Operasional', value: 'operational' }
        ],
        selectedValues: clinicalFilter !== 'all' ? [clinicalFilter] : [],
        onSelect: (val) =>
          onClinicalFilterChange(
            val === clinicalFilter ? 'all' : (val as 'clinical' | 'operational')
          ),
        onReset: () => onClinicalFilterChange('all'),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Sifat'
      }
    ];
  }, [
    tierFilter,
    audienceFilter,
    clinicalFilter,
    onTierFilterChange,
    onAudienceFilterChange,
    onClinicalFilterChange
  ]);

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    tierFilter !== 'all' ||
    audienceFilter !== 'all' ||
    clinicalFilter !== 'all';

  const activeFilterCount = [
    tierFilter !== 'all',
    audienceFilter !== 'all',
    clinicalFilter !== 'all'
  ].filter(Boolean).length;

  const handleResetAll = React.useCallback(() => {
    onSearchChange('');
    onTierFilterChange('all');
    onAudienceFilterChange('all');
    onClinicalFilterChange('all');
  }, [onSearchChange, onTierFilterChange, onAudienceFilterChange, onClinicalFilterChange]);

  return (
    <ResponsiveFacetToolbox
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onOpenSearchDialog={onOpenSearchDialog}
      searchPlaceholder='Pencarian Peran...'
      facets={facetGroups}
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
            onClick={onRefresh}
            disabled={isRefetching}
            className={isCompact ? 'size-8 rounded-md shrink-0' : 'h-8 text-xs font-medium gap-1.5'}
            title='Segarkan data peran'
          >
            <Icons.refresh className={`size-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            {!isCompact && <span>Segarkan</span>}
          </Button>

          {onAddClick && (
            <Button
              type='button'
              size={isCompact ? 'icon' : 'sm'}
              onClick={onAddClick}
              className={
                isCompact ? 'size-8 rounded-md shrink-0' : 'h-8 text-xs font-medium gap-1.5'
              }
              title='Tambah Peran'
            >
              <Icons.plus className='size-3.5' />
              {!isCompact && <span>Tambah Peran</span>}
            </Button>
          )}
        </div>
      }
    />
  );
}
