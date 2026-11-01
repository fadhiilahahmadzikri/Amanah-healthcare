'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { IconShield } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox/types';
import {
  SearchEngineDialog,
  useStateSearchEngine,
  type SearchEngineResultItem
} from '@/components/search-engine';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { roleManagementApi } from '@/features/role-management/api/role-management.api';
import { useUserTable } from '../../model/useUserTable';
import { getUserColumns } from './columns';
import { UserBulkActions } from './user-bulk-actions';
import { UserDetailModal } from '../user-detail-modal';
import { UserDeleteDialog } from '../user-delete-dialog';
import { UserExportDialog } from '../user-export-dialog';
import { UserRestoreDialog } from '../user-restore-dialog';
import { UserMobileCards, UserCardsSkeleton } from '../user-mobile-cards';

export function UserTable() {
  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  const rolesQuery = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => roleManagementApi.getAllRoles()
  });

  const tableColumns = useMemo(() => getUserColumns(), []);
  const columnIds = useMemo(
    () => tableColumns.map((c) => c.id).filter(Boolean) as string[],
    [tableColumns]
  );

  const userTable = useUserTable({
    columns: tableColumns,
    columnIds
  });

  const selectedRows = userTable.table
    .getFilteredSelectedRowModel()
    .flatRows.map((r) => r.original);
  const selectedRowIds = selectedRows.map((r) => r.id);

  const {
    statusFilter,
    audienceFilter,
    roleFilter,
    handleStatusChange,
    handleAudienceChange,
    handleRoleChange
  } = userTable;

  // Dynamic Facets Definition
  const facetGroups: FacetGroupDefinition[] = useMemo(() => {
    const roleOptions = (rolesQuery.data || []).map((r) => ({
      label: r.name,
      value: r.id
    }));

    return [
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'single',
        options: [
          { label: 'Aktif', value: 'active', dotColor: '#10b981' },
          { label: 'Nonaktif', value: 'inactive', dotColor: '#64748b' },
          { label: 'Tertunda', value: 'pending_verification', dotColor: '#f59e0b' },
          { label: 'Ditangguhkan', value: 'suspended', dotColor: '#ef4444' }
        ],
        selectedValues: statusFilter ? [statusFilter] : [],
        onSelect: (val) => handleStatusChange(val),
        onReset: () => handleStatusChange(''),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Status'
      },
      {
        id: 'audience',
        title: 'Audience',
        icon: Icons.users,
        mode: 'single',
        options: [
          { label: 'Internal (Klinik/Staf)', value: 'internal' },
          { label: 'Eksternal (Publik/Pasien)', value: 'external' }
        ],
        selectedValues: audienceFilter ? [audienceFilter] : [],
        onSelect: (val) => handleAudienceChange(val),
        onReset: () => handleAudienceChange(''),
        popoverWidth: 'w-52',
        resetLabel: 'Semua Audience'
      },
      {
        id: 'role',
        title: 'Peran Akun',
        icon: IconShield,
        mode: 'single',
        options: roleOptions,
        selectedValues: roleFilter ? [roleFilter] : [],
        onSelect: (val) => handleRoleChange(val),
        onReset: () => handleRoleChange(''),
        popoverWidth: 'w-52',
        resetLabel: 'Semua Peran'
      }
    ];
  }, [
    rolesQuery.data,
    statusFilter,
    audienceFilter,
    roleFilter,
    handleStatusChange,
    handleAudienceChange,
    handleRoleChange
  ]);

  const activeFilterCount = [
    userTable.roleFilter,
    userTable.statusFilter,
    userTable.audienceFilter
  ].filter(Boolean).length;

  // Search Engine Index for Instant Modal Search
  const searchIndexItems: SearchEngineResultItem[] = useMemo(() => {
    return userTable.activeUsers.map((u) => {
      const rolesStr = (u.roles || []).map((r) => r.name).join(', ') || 'Tanpa Peran';
      return {
        id: u.id,
        title: u.name,
        description: `${u.email} • ${u.phone || 'Tanpa no. telepon'}`,
        category: u.primaryAudience === 'internal' ? 'Internal Klinik' : 'Eksternal',
        badge: rolesStr,
        onSelect: () => userTable.actions.openDetail(u)
      };
    });
  }, [userTable.activeUsers, userTable.actions]);

  const searchEngine = useStateSearchEngine({
    query: userTable.searchQuery,
    onQueryChange: userTable.handleSearchChange,
    id: 'data-user-search',
    title: 'Pencarian Pengguna Sistem',
    placeholder: 'Cari nama, email, no. telepon, atau peran pengguna...',
    indexItems: searchIndexItems
  });

  if (userTable.isLoading) {
    return <UserTableSkeleton />;
  }

  return (
    <>
      {/* Centralized Search Engine Modal */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* 1. Modal Detail Profil Akun */}
      <UserDetailModal
        user={userTable.selectedUser}
        isOpen={userTable.isDetailOpen}
        initialEditing={userTable.isEditingDetail}
        onClose={userTable.actions.closeDetail}
      />

      {/* 2. Dialog Konfirmasi Hapus Permanen Tunggal */}
      <UserDeleteDialog
        user={userTable.selectedUser}
        isOpen={userTable.isPurgeOpen}
        onClose={userTable.actions.closePurge}
      />

      {/* 3. Dialog Konfirmasi Hapus Permanen Massal */}
      <UserDeleteDialog
        userIds={selectedRowIds}
        isOpen={userTable.isBulkPurgeOpen}
        onClose={userTable.actions.closeBulkPurge}
        onSuccess={() => userTable.table.resetRowSelection()}
      />

      {/* 4. Dialog Ekspor Cadangan Data Pengguna */}
      <UserExportDialog
        isOpen={userTable.isExportOpen}
        onClose={userTable.actions.closeExport}
        drivers={userTable.availableDrivers}
      />

      {/* 5. Dialog Pulihkan Cadangan Data Pengguna (Restore) */}
      <UserRestoreDialog
        isOpen={userTable.isRestoreOpen}
        onClose={userTable.actions.closeRestore}
        drivers={userTable.availableDrivers}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5'>
        {/* Responsive Facet Toolbox */}
        <ResponsiveFacetToolbox
          searchQuery={userTable.searchQuery}
          onSearchChange={userTable.handleSearchChange}
          onOpenSearchDialog={searchEngine.open}
          searchPlaceholder='Pencarian Pengguna...'
          facets={facetGroups}
          isFiltered={userTable.hasActiveFilters}
          onResetAll={userTable.resetFilters}
          activeFilterCount={activeFilterCount}
          isCompact={isCompact}
          extraRightSlot={
            <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
              {!isCompact && <DataTableViewOptions table={userTable.table} />}

              {/* Restore Button */}
              <Button
                type='button'
                variant='outline'
                size={isCompact ? 'icon' : 'sm'}
                onClick={userTable.actions.openRestore}
                className={
                  isCompact ? 'size-8 rounded-md shrink-0' : 'h-8 text-xs font-medium gap-1.5'
                }
                title='Pulihkan Cadangan (Restore)'
              >
                <Icons.download className='size-3.5' />
                {!isCompact && <span>Restore</span>}
              </Button>

              {/* Export Button */}
              <Button
                type='button'
                variant='default'
                size={isCompact ? 'icon' : 'sm'}
                onClick={userTable.actions.openExport}
                className={
                  isCompact
                    ? 'size-8 rounded-md shrink-0 shadow-xs'
                    : 'h-8 text-xs font-medium gap-1.5 shadow-xs'
                }
                title='Ekspor Cadangan Pengguna'
              >
                <Icons.upload className='size-3.5' />
                {!isCompact && <span>Backup / Ekspor</span>}
              </Button>
            </div>
          }
        />

        {/* Desktop View: TanStack Data Table */}
        <div className='hidden md:flex min-h-0 flex-1 flex-col'>
          <DataTable
            table={userTable.table}
            onRowClick={userTable.actions.openDetail}
            entityName='pengguna'
            hidePagination={true}
            footerSlot={
              <div
                ref={userTable.sentinelRef}
                className='border-t border-border/50 bg-background/80 px-4 py-2.5 shadow-xs backdrop-blur-xl flex items-center justify-between text-xs text-muted-foreground'
              >
                <span>
                  Menampilkan{' '}
                  <strong className='font-semibold text-foreground'>
                    {userTable.activeUsers.length}
                  </strong>{' '}
                  dari {userTable.totalUsers} pengguna sistem
                </span>
                {userTable.isFetchingNextPage ? (
                  <div className='flex items-center gap-1.5 text-primary font-medium'>
                    <Icons.spinner className='size-3.5 animate-spin' />
                    <span>Memuat pengguna berikutnya...</span>
                  </div>
                ) : !userTable.hasNextPage ? (
                  <span className='text-muted-foreground/60'>Semua pengguna telah dimuat</span>
                ) : (
                  <span className='text-muted-foreground/60'>
                    Scroll ke bawah untuk memuat otomatis
                  </span>
                )}
              </div>
            }
            bulkActions={
              <UserBulkActions
                table={userTable.table}
                onBulkPurge={userTable.actions.openBulkPurge}
              />
            }
          />
        </div>

        {/* Mobile View: Minimalist Responsive Cards Mengikuti Standar Janji Temu */}
        <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
          <UserMobileCards
            users={userTable.activeUsers}
            hasFilters={userTable.hasActiveFilters}
            onReset={userTable.resetFilters}
            onRowClick={userTable.actions.openDetail}
            onViewDetail={userTable.actions.openDetail}
            onEdit={userTable.actions.openEdit}
            onPurge={userTable.actions.openPurge}
            sentinelRef={userTable.sentinelRef}
            isFetchingNextPage={userTable.isFetchingNextPage}
            hasNextPage={userTable.hasNextPage}
            isLoading={userTable.isLoading}
          />
        </div>
      </div>
    </>
  );
}

export function UserTableSkeleton() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Desktop Table Skeleton */}
      <div className='hidden md:flex flex-1 flex-col space-y-4'>
        <div className='flex w-full items-center justify-between gap-2 p-1'>
          <div className='flex items-center gap-2 flex-1'>
            <Skeleton className='h-8 w-64 rounded-md' />
            <Skeleton className='h-8 w-24 border-dashed rounded-md' />
            <Skeleton className='h-8 w-24 border-dashed rounded-md' />
          </div>
          <Skeleton className='h-8 w-28 rounded-md' />
        </div>

        <div className='flex-1 border border-border/60 rounded-xl overflow-hidden'>
          <div className='border-b border-border/60 px-4 py-3 flex items-center justify-between gap-4'>
            <Skeleton className='size-4 rounded-[4px]' />
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-4 w-32 rounded-md' />
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-4 w-20 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
            <Skeleton className='h-4 w-20 rounded-md' />
            <Skeleton className='size-8 rounded-md' />
          </div>
          <div className='divide-y divide-border/40'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='px-4 py-3 flex items-center justify-between gap-4'>
                <Skeleton className='size-4 rounded-[4px]' />
                <div className='flex items-center gap-2.5 w-32'>
                  <Skeleton className='size-8 rounded-full' />
                  <Skeleton className='h-4 w-20 rounded-md' />
                </div>
                <Skeleton className='h-4 w-32 rounded-md' />
                <Skeleton className='h-4 w-24 rounded-md' />
                <Skeleton className='h-5 w-20 rounded-full' />
                <Skeleton className='h-5 w-16 rounded-full' />
                <Skeleton className='h-5 w-12 rounded-full' />
                <Skeleton className='h-4 w-20 rounded-md' />
                <Skeleton className='size-8 rounded-md' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className='block md:hidden flex-1 space-y-3 pt-1'>
        <div className='flex items-center justify-between gap-2 mb-3'>
          <Skeleton className='h-9 w-full rounded-full' />
          <Skeleton className='size-9 rounded-full shrink-0' />
        </div>
        <UserCardsSkeleton />
      </div>
    </div>
  );
}
