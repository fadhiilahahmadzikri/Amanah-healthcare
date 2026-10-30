'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import { Icons } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { SearchEngineDialog } from '@/components/search-engine';
import { EntityCardGrid, EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { STAFF_INVITATION_STATUS } from '../constants/staff.constants';
import { useStaffManagementPresenter } from '../model/useStaffManagementPresenter';
import { StaffManagementToolbar } from './staff-management-toolbar';
import { StaffScheduleCard } from './staff-schedule-card';
import { StaffRoleBadge, StaffInvitationStatusBadge } from './staff-card-atoms';
import { StaffKanbanBoard } from './kanban';
import { InviteStaffModal } from './invite-staff-modal';
import { StaffRosterModal } from './staff-roster-modal';
import { StaffProfileModal } from './staff-profile-modal';
import { ExportDialog } from '@/features/export';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';
import type { StaffMember } from '../api/staff-management.api';

export function StaffManagementView() {
  const { view, dynamicOptions, revoke, rosterModal, detailModal, inviteModal } =
    useStaffManagementPresenter();
  const [exportStaff, setExportStaff] = useState<StaffMember | null>(null);
  const { can } = useAuthContext();
  const canInviteStaff = can(PERMISSIONS.STAFF.INVITE);

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  // Real-time synchronization catch-up: Automatically refetch lists on incoming staff events
  useEffect(() => {
    const handleStaffUpdated = () => {
      void view.refetch();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('clinic:staff_updated', handleStaffUpdated);
      return () => {
        window.removeEventListener('clinic:staff_updated', handleStaffUpdated);
      };
    }
  }, [view]);

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
      {/* Centralized Search Engine Dialog */}
      <SearchEngineDialog
        config={dynamicOptions.searchEngine.config}
        isOpen={dynamicOptions.searchEngine.isOpen}
        onClose={dynamicOptions.searchEngine.close}
      />

      <Tabs
        value={view.activeTab}
        onValueChange={(v) => view.actions.changeTab(v as 'members' | 'invitations')}
        className='flex flex-1 min-h-0 flex-col gap-4'
      >
        {/* Dynamic Responsive Facet Toolbar with Dual View Mode (Kanban vs Grid) */}
        <StaffManagementToolbar
          searchQuery={view.searchQuery}
          onSearchChange={view.actions.changeSearch}
          onOpenSearchDialog={dynamicOptions.searchEngine.open}
          facets={dynamicOptions.facetGroups}
          isFiltered={view.hasActiveFilters}
          onResetAll={() => {
            dynamicOptions.searchEngine.clearQuery();
            view.actions.resetFilters();
          }}
          activeFilterCount={dynamicOptions.activeFilterCount}
          isCompact={isCompact}
          staffsCount={view.allStaffs.length}
          invitationsCount={view.allInvitations.length}
          viewMode={view.viewMode}
          onViewModeChange={view.actions.changeViewMode}
          onInviteStaff={canInviteStaff ? inviteModal.open : undefined}
          onRefresh={() => void view.refetch()}
        />

        {/* Tab 1: Daftar Staf (Dual Mode: Kanban Board vs Responsive Grid) */}
        <TabsContent
          value='members'
          className='relative flex flex-1 min-h-0 flex-col overflow-hidden m-0'
        >
          {view.loading && view.allStaffs.length === 0 ? (
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='pb-20 pt-1'>
                  <EntityCardGridSkeleton
                    count={8}
                    className={cn(isSidebarExpanded && '2xl:grid-cols-4')}
                  />
                </div>
              </ScrollArea>
            </div>
          ) : view.filteredStaffs.length === 0 ? (
            <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
              <EmptyState
                icon={Icons.users}
                title='Tidak ada staf ditemukan'
                description={
                  view.hasActiveFilters
                    ? `Tidak ada profil staf yang cocok dengan kriteria filter atau kata kunci yang dipilih.`
                    : 'Belum ada data staf terdaftar di klinik.'
                }
                action={
                  view.hasActiveFilters ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        dynamicOptions.searchEngine.clearQuery();
                        view.actions.resetFilters();
                      }}
                      className='text-xs'
                    >
                      Reset Semua Filter
                    </Button>
                  ) : canInviteStaff ? (
                    <Button size='sm' onClick={inviteModal.open} className='text-xs gap-1.5'>
                      <Icons.userPlus className='h-3.5 w-3.5' />
                      Undang Staf Pertama
                    </Button>
                  ) : null
                }
                className='h-full w-full flex-1'
              />
            </div>
          ) : view.viewMode === 'kanban' ? (
            /* Kanban Board View grouped by Roles (Dokter, Bidan, Staf Operasional) */
            <div className='absolute inset-0 flex overflow-hidden pt-1 pb-2'>
              <StaffKanbanBoard
                staffs={view.filteredStaffs}
                onOpenRoster={rosterModal.open}
                onOpenDetail={detailModal.open}
                selectedStaffId={detailModal.staff?.id}
              />
            </div>
          ) : (
            /* Responsive Grid / Listing View */
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='pb-20 pt-1'>
                  <EntityCardGrid className={cn(isSidebarExpanded && '2xl:grid-cols-4')}>
                    {view.filteredStaffs.map((staff) => (
                      <StaffScheduleCard
                        key={staff.id}
                        staff={staff}
                        onOpenRoster={rosterModal.open}
                        onOpenDetail={detailModal.open}
                      />
                    ))}
                  </EntityCardGrid>
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Riwayat Undangan Calon Staf */}
        <TabsContent
          value='invitations'
          className='relative flex flex-1 min-h-0 flex-col overflow-hidden m-0'
        >
          <div className='absolute inset-0 flex overflow-hidden'>
            <ScrollArea className='h-full w-full pr-0 md:pr-3'>
              <div className='pb-20 pt-1'>
                {view.loading && view.allInvitations.length === 0 ? (
                  <div className='flex items-center justify-center py-16 text-muted-foreground'>
                    <Icons.spinner className='h-6 w-6 animate-spin mr-2' />
                    Memuat riwayat undangan...
                  </div>
                ) : view.filteredInvitations.length === 0 ? (
                  <EmptyState
                    icon={Icons.mail}
                    title='Belum Ada Riwayat Undangan'
                    description={
                      view.searchQuery
                        ? `Tidak ada undangan yang sesuai dengan kata kunci "${view.searchQuery}".`
                        : 'Seluruh riwayat undangan calon staf via email akan tercatat di sini.'
                    }
                  />
                ) : (
                  <div className='rounded-xl border border-border overflow-hidden bg-card'>
                    <Table>
                      <TableHeader className='bg-muted/40'>
                        <TableRow>
                          <TableHead className='font-semibold text-xs'>Email Calon Staf</TableHead>
                          <TableHead className='font-semibold text-xs'>Peran Ditugaskan</TableHead>
                          <TableHead className='font-semibold text-xs'>Status</TableHead>
                          <TableHead className='font-semibold text-xs'>Kedaluwarsa</TableHead>
                          <TableHead className='font-semibold text-xs'>Tanggal Kirim</TableHead>
                          <TableHead className='text-right font-semibold text-xs'>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className='divide-y divide-border/40'>
                        {view.filteredInvitations.map((inv) => (
                          <TableRow key={inv.id} className='hover:bg-muted/20'>
                            <TableCell className='font-medium text-xs'>{inv.email}</TableCell>
                            <TableCell>
                              <StaffRoleBadge roleCode={inv.roleCode} />
                            </TableCell>
                            <TableCell>
                              <StaffInvitationStatusBadge status={inv.status} />
                            </TableCell>
                            <TableCell className='text-xs text-muted-foreground font-mono'>
                              {new Date(inv.expiresAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className='text-xs text-muted-foreground font-mono'>
                              {new Date(inv.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className='text-right'>
                              {inv.status === STAFF_INVITATION_STATUS.PENDING && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  disabled={revoke.isRevoking}
                                  onClick={() => revoke.requestRevoke(inv.id, inv.email)}
                                  className='h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10'
                                >
                                  Batalkan
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals & Dialogs */}
      <InviteStaffModal
        isOpen={inviteModal.isOpen}
        onClose={inviteModal.close}
        onSuccess={() => void view.refetch()}
      />

      <StaffRosterModal
        staff={rosterModal.staff}
        isOpen={rosterModal.isOpen}
        onClose={rosterModal.close}
      />

      <StaffProfileModal
        staff={detailModal.staff}
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        onExport={(st) => setExportStaff(st)}
      />

      {/* Export Dialog Per Record */}
      <ExportDialog
        open={Boolean(exportStaff)}
        onOpenChange={(open) => !open && setExportStaff(null)}
        exportType='attendance'
        entityName={exportStaff?.fullName}
        parameters={{ staffProfileId: exportStaff?.id }}
        enableMonthPicker={true}
      />

      <AlertDialog
        open={revoke.isRevokeDialogOpen}
        onOpenChange={(open) => !open && revoke.cancelRevoke()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Undangan Calon Staf?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan undangan untuk{' '}
              <span className='font-semibold text-foreground'>
                {revoke.invitationToRevoke?.email}
              </span>
              ? Tautan aktivasi yang telah dikirimkan ke email tersebut tidak akan berlaku lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={revoke.cancelRevoke} disabled={revoke.isRevoking}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={revoke.confirmRevoke}
              disabled={revoke.isRevoking}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {revoke.isRevoking ? 'Membatalkan...' : 'Ya, Batalkan Undangan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
