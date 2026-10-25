'use client';

import { useMemo } from 'react';
import PageContainer from '@/components/layout/page-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ClinicNotificationCard } from './clinic-notification-card';
import { NotificationsListTable } from './notifications-list-table';
import { AppointmentPagination } from '@/features/klinik';
import { useNotificationsPage } from '../model/useNotificationsPage';
import { useNotificationDynamicOptions } from '../model/useNotificationDynamicOptions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const notificationsPage = useNotificationsPage();

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  // Canonical responsive breakpoint formula from Kehadiran Pegawai:
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. Expanded sidebar collisions on standard viewports (<= 1280px)
  const isCompact = isMobile || isUnder1024 || (isUnder1280 && isSidebarExpanded);

  const { facetGroups, activeFilterCount, searchEngine } = useNotificationDynamicOptions({
    notifications: notificationsPage.notifications,
    categoryFilter: notificationsPage.categoryFilter,
    statusFilter: notificationsPage.statusFilter,
    searchQuery: notificationsPage.searchQuery,
    actions: {
      changeSearch: notificationsPage.actions.changeSearch,
      changeCategoryFilter: notificationsPage.actions.changeCategoryFilter,
      changeStatusFilter: notificationsPage.actions.changeStatusFilter
    }
  });

  // Check if there are any unread notifications
  const hasUnread = useMemo(
    () => notificationsPage.notifications.some((item) => item.status === 'unread'),
    [notificationsPage.notifications]
  );

  // Bulk Actions
  const handleBulkMarkAsRead = () => {
    const affectedCount = notificationsPage.actions.bulkMarkAsRead();
    if (affectedCount > 0) {
      toast.success(`${affectedCount} notifikasi ditandai sebagai dibaca.`);
    }
  };

  const handleBulkDelete = () => {
    const affectedCount = notificationsPage.actions.bulkDelete();
    if (affectedCount > 0) {
      toast.success(`${affectedCount} notifikasi berhasil dihapus.`);
    }
  };

  const handleMarkAll = () => {
    notificationsPage.actions.markAllAsRead();
    toast.success('Semua notifikasi ditandai sebagai sudah dibaca.');
  };

  return (
    <>
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      <PageContainer
        scrollable={false}
        pageTitle='Notifikasi'
        pageDescription='Dapatkan informasi terbaru tentang jadwal dan layanan klinik Anda'
      >
        <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5 w-full font-sans select-none'>
          {/* Harmonized Responsive Facet Toolbox (Kehadiran Pegawai Master Paradigm) */}
          {notificationsPage.notifications.length > 0 && (
            <ResponsiveFacetToolbox
              searchQuery={notificationsPage.searchQuery}
              onSearchChange={notificationsPage.actions.changeSearch}
              searchPlaceholder='Cari notifikasi...'
              onOpenSearchDialog={searchEngine.open}
              facets={facetGroups}
              isFiltered={notificationsPage.isFiltered}
              onResetAll={notificationsPage.actions.resetAllFilters}
              activeFilterCount={activeFilterCount}
              isCompact={isCompact}
              actionsSlot={
                <Button
                  type='button'
                  variant={hasUnread ? 'default' : 'outline'}
                  size='sm'
                  onClick={hasUnread ? handleMarkAll : undefined}
                  disabled={!hasUnread}
                  className={cn(
                    'h-8 text-xs font-semibold gap-1.5 px-2.5 sm:px-3 shrink-0 transition-all duration-200 select-none',
                    hasUnread
                      ? 'shadow-xs cursor-pointer'
                      : 'border-border/80 bg-muted/40 text-muted-foreground/70 cursor-not-allowed shadow-none',
                    isCompact && 'px-2 text-[11px]'
                  )}
                  title={hasUnread ? 'Tandai Semua Sudah Dibaca' : 'Semua notifikasi sudah dibaca'}
                  aria-label={
                    hasUnread ? 'Tandai Semua Sudah Dibaca' : 'Semua notifikasi sudah dibaca'
                  }
                >
                  <Icons.checks
                    className={cn(
                      'size-3.5 shrink-0 transition-colors',
                      hasUnread ? 'text-primary-foreground' : 'text-muted-foreground/60'
                    )}
                  />
                  <span className='hidden sm:inline'>
                    {hasUnread ? 'Tandai Semua Dibaca' : 'Sudah Dibaca'}
                  </span>
                  <span className='inline sm:hidden'>
                    {hasUnread ? 'Tandai Semua' : 'Sudah Dibaca'}
                  </span>
                </Button>
              }
              extraRightSlot={
                <div className='flex items-center gap-1.5 shrink-0'>
                  {/* View Switcher: Card vs Table */}
                  <div className='inline-flex items-center p-0.5 bg-muted rounded-lg border border-border shrink-0'>
                    <button
                      type='button'
                      onClick={() => notificationsPage.actions.changeViewStyle('card')}
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer',
                        notificationsPage.viewStyle === 'card'
                          ? 'bg-card text-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      title='Tampilan Card'
                    >
                      <Icons.layoutList className='size-3.5' />
                      {!isCompact && <span>Card</span>}
                    </button>
                    <button
                      type='button'
                      onClick={() => notificationsPage.actions.changeViewStyle('table')}
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer',
                        notificationsPage.viewStyle === 'table'
                          ? 'bg-card text-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      title='Tampilan Tabel'
                    >
                      <Icons.table className='size-3.5' />
                      {!isCompact && <span>Tabel</span>}
                    </button>
                  </div>
                </div>
              }
            />
          )}

          <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
            {notificationsPage.paginatedList.length > 0 ? (
              <>
                <div className='absolute inset-0 flex overflow-hidden'>
                  <ScrollArea className='h-full w-full pr-3'>
                    <div className='pb-24'>
                      {/* Notification List Display */}
                      {notificationsPage.viewStyle === 'card' ? (
                        /* CARD VIEW */
                        <div className='space-y-3'>
                          {notificationsPage.paginatedList.map((item) => (
                            <ClinicNotificationCard
                              key={item.id}
                              notification={item}
                              isSelected={notificationsPage.selectedIds.has(item.id)}
                              onToggleSelect={notificationsPage.actions.toggleSelect}
                              onMarkAsRead={notificationsPage.actions.markAsRead}
                            />
                          ))}
                        </div>
                      ) : (
                        <NotificationsListTable
                          notifications={notificationsPage.paginatedList}
                          selectedIds={notificationsPage.selectedIds}
                          isAllSelected={notificationsPage.isAllSelected}
                          onToggleSelect={notificationsPage.actions.toggleSelect}
                          onToggleSelectAll={notificationsPage.actions.toggleSelectAll}
                          onMarkAsRead={notificationsPage.actions.markAsRead}
                        />
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {notificationsPage.totalItems > 0 ? (
                  <div className='absolute bottom-0 inset-x-0 z-20 pointer-events-none flex justify-center'>
                    <div className='pointer-events-auto w-full'>
                      <AppointmentPagination
                        currentPage={notificationsPage.currentPage}
                        pageSize={notificationsPage.pageSize}
                        totalItems={notificationsPage.totalItems}
                        onPageChange={notificationsPage.actions.changePage}
                        onPageSizeChange={notificationsPage.actions.changePageSize}
                        pageSizeOptions={[6, 10, 20, 50]}
                        itemLabel='notifikasi'
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
                <EmptyState
                  icon={Icons.notification}
                  title='Tidak ada notifikasi ditemukan'
                  description='Notifikasi akan ditampilkan di sini setelah tersedia.'
                  className='h-full w-full flex-1'
                />
              </div>
            )}
          </div>

          {/* Floating Batch Actions Toolbar */}
          <div
            ref={notificationsPage.bulkBarRef}
            style={{
              display: 'none',
              transform: 'translate(-50%, 80px)',
              opacity: 0
            }}
            className='fixed bottom-6 left-1/2 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl shadow-2xl items-center gap-3 z-50 border border-primary/20 backdrop-blur-md'
          >
            <div className='flex items-center gap-2 text-xs font-semibold border-r border-primary-foreground/20 pr-3'>
              <span className='px-2 py-0.5 bg-primary-foreground/20 rounded-md font-bold text-xs'>
                {notificationsPage.selectedIds.size}
              </span>
              <span>notifikasi dipilih</span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='secondary'
                onClick={handleBulkMarkAsRead}
                className='h-7.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground'
              >
                <Icons.checks className='size-3.5' />
                <span>Tandai Dibaca</span>
              </Button>

              <Button
                size='sm'
                variant='destructive'
                onClick={handleBulkDelete}
                className='h-7.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer'
              >
                <Icons.trash className='size-3.5' />
                <span>Hapus</span>
              </Button>

              <button
                type='button'
                onClick={notificationsPage.actions.clearSelection}
                className='p-1 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground transition cursor-pointer ml-0.5'
              >
                <Icons.close className='size-4' />
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
