'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import { cn } from '@/lib/utils';
import type { StaffViewMode } from '../model/useStaffManagementView';

export interface StaffManagementToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenSearchDialog: () => void;
  facets: FacetGroupDefinition[];
  isFiltered: boolean;
  onResetAll: () => void;
  activeFilterCount: number;
  isCompact?: boolean;
  staffsCount: number;
  invitationsCount: number;
  viewMode: StaffViewMode;
  onViewModeChange: (mode: StaffViewMode) => void;
  onInviteStaff?: () => void;
  onRefresh?: () => void;
  activeTab?: 'members' | 'invitations';
  onActiveTabChange?: (tab: 'members' | 'invitations') => void;
}

export function StaffManagementToolbar({
  searchQuery,
  onSearchChange,
  onOpenSearchDialog,
  facets,
  isFiltered,
  onResetAll,
  activeFilterCount,
  isCompact = false,
  staffsCount,
  invitationsCount,
  viewMode,
  onViewModeChange,
  onInviteStaff,
  onRefresh,
  activeTab = 'members',
  onActiveTabChange
}: StaffManagementToolbarProps) {
  const effectiveFacets = React.useMemo(() => {
    if (isCompact) {
      const categoryFacet: FacetGroupDefinition = {
        id: 'category',
        title: 'Kategori',
        icon: Icons.users,
        mode: 'single',
        options: [
          { label: `Staf (${staffsCount})`, value: 'members' },
          { label: `Undangan (${invitationsCount})`, value: 'invitations' }
        ],
        selectedValues: [activeTab],
        onSelect: (val) => onActiveTabChange?.(val as 'members' | 'invitations'),
        onReset: () => onActiveTabChange?.('members'),
        popoverWidth: 'w-48',
        resetLabel: 'Staf'
      };
      return [categoryFacet, ...facets];
    }
    return facets;
  }, [isCompact, facets, staffsCount, invitationsCount, activeTab, onActiveTabChange]);

  return (
    <div className='flex flex-col gap-2.5 w-full shrink-0 select-none'>
      <ResponsiveFacetToolbox
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder='Cari nama staf, peran, email, atau poliklinik...'
        onOpenSearchDialog={onOpenSearchDialog}
        facets={effectiveFacets}
        isFiltered={isFiltered}
        onResetAll={onResetAll}
        activeFilterCount={activeFilterCount}
        isCompact={isCompact}
        actionsSlot={
          !isCompact ? (
            <div className='flex items-center gap-2 shrink-0'>
              {/* Tabs List (Staf vs Undangan) */}
              <TabsList className='inline-flex h-9 w-fit shrink-0 p-1 bg-muted/60'>
                <TabsTrigger value='members' className='text-xs gap-1.5 px-2.5 sm:px-3'>
                  <Icons.users className='h-3.5 w-3.5' />
                  <span>Staf ({staffsCount})</span>
                </TabsTrigger>
                <TabsTrigger value='invitations' className='text-xs gap-1.5 px-2.5 sm:px-3'>
                  <Icons.mail className='h-3.5 w-3.5' />
                  <span>Undangan ({invitationsCount})</span>
                </TabsTrigger>
              </TabsList>

              {/* Invite Staff Button */}
              {onInviteStaff && (
                <Button
                  type='button'
                  onClick={onInviteStaff}
                  size='sm'
                  className='h-9 px-2.5 sm:px-3 gap-1.5 shrink-0 cursor-pointer'
                  title='Kirim Undangan Calon Staf Baru'
                >
                  <Icons.userPlus className='h-3.5 w-3.5' />
                  <span className='hidden sm:inline'>Undang Staf</span>
                </Button>
              )}
            </div>
          ) : undefined
        }
        extraRightSlot={
          <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
            {/* Mobile Invite Staff Icon Button */}
            {onInviteStaff && isCompact && (
              <Button
                type='button'
                onClick={onInviteStaff}
                size='icon'
                className='size-8 rounded-md shrink-0 cursor-pointer'
                title='Kirim Undangan Calon Staf Baru'
              >
                <Icons.userPlus className='size-3.5' />
              </Button>
            )}

            {/* View Mode Toggle: Kanban vs Grid */}
            <div className='flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/30'>
              <Button
                type='button'
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size={isCompact ? 'icon' : 'sm'}
                onClick={() => onViewModeChange('kanban')}
                className={cn(isCompact ? 'size-7' : 'h-7 px-2 text-xs gap-1.5 cursor-pointer')}
                title='Tampilan Papan Kanban Berbasis Peran'
              >
                <Icons.kanban className='size-3.5' />
                {!isCompact && <span>Papan</span>}
              </Button>
              <Button
                type='button'
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size={isCompact ? 'icon' : 'sm'}
                onClick={() => onViewModeChange('grid')}
                className={cn(isCompact ? 'size-7' : 'h-7 px-2 text-xs gap-1.5 cursor-pointer')}
                title='Tampilan Daftar / Grid'
              >
                <Icons.layoutList className='size-3.5' />
                {!isCompact && <span>Daftar</span>}
              </Button>
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <Button
                type='button'
                variant='outline'
                size={isCompact ? 'icon' : 'sm'}
                onClick={onRefresh}
                className={cn(
                  isCompact ? 'size-8 rounded-md' : 'h-8 px-2 text-xs gap-1.5 cursor-pointer'
                )}
                title='Muat ulang data staf'
                aria-label='Muat ulang data'
              >
                <Icons.refresh className='size-3.5' />
                {!isCompact && <span>Segarkan</span>}
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
