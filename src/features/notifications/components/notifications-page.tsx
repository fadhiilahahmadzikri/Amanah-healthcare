'use client';

import PageContainer from '@/components/layout/page-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { ClinicNotificationCard } from './clinic-notification-card';
import { NotificationsListTable } from './notifications-list-table';
import { AppointmentPagination } from '@/features/klinik';
import { useNotificationsPage } from '../model/useNotificationsPage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Semua Kategori' },
  { value: 'Janji Temu', label: '📅 Janji Temu' },
  { value: 'Shift & Kehadiran', label: '🕒 Shift & Kehadiran' },
  { value: 'Promo', label: '🎁 Promo Klinik' },
  { value: 'Hasil Lab', label: '🧪 Hasil Lab' },
  { value: 'Antrean', label: '🔢 Nomor Antrean' },
  { value: 'Farmasi', label: '💊 Farmasi & Obat' },
  { value: 'Telemedisin', label: '💻 Telemedisin' }
];

const STATUS_OPTIONS: { value: string; label: string; dotColor: string }[] = [
  { value: 'ALL', label: 'Semua Status', dotColor: 'bg-muted-foreground' },
  { value: 'unread', label: 'Belum Dibaca', dotColor: 'bg-primary' },
  { value: 'read', label: 'Sudah Dibaca', dotColor: 'bg-muted-foreground/60' }
];

export default function NotificationsPage() {
  const notificationsPage = useNotificationsPage();

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
    <PageContainer
      scrollable={false}
      pageTitle='Notifikasi'
      pageDescription='Dapatkan informasi terbaru tentang jadwal dan layanan klinik Anda'
      pageHeaderAction={
        notificationsPage.notifications.length > 0 ? (
          <Button onClick={handleMarkAll} className='text-xs md:text-sm'>
            <Icons.checks className='mr-2 h-4 w-4' />
            <span>Tandai Semua Sudah Dibaca</span>
          </Button>
        ) : undefined
      }
    >
      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 w-full font-sans select-none'>
        {/* 1. Harmonized Filter Toolbar matching Janji Temu & Queue View - Only rendered when data exists */}
        {notificationsPage.notifications.length > 0 && (
          <div className='flex flex-wrap items-center justify-between gap-2.5'>
            {/* Left Toolbar Controls (Redundansi 'Pilih Semua' dihapus) */}
            <div className='flex flex-wrap items-center gap-2'>
              {/* Global Search Input */}
              <div className='relative flex-1 min-w-[180px] max-w-[260px]'>
                <Icons.search className='size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <Input
                  type='text'
                  aria-label='Cari notifikasi'
                  value={notificationsPage.searchQuery}
                  onChange={(e) => notificationsPage.actions.changeSearch(e.target.value)}
                  placeholder='Cari notifikasi...'
                  className='h-8 pl-8 pr-3 text-xs bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary shadow-2xs'
                />
              </div>

              {/* Category Filter Popover */}
              <Popover
                open={notificationsPage.isCategoryOpen}
                onOpenChange={notificationsPage.actions.setCategoryOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm' className='h-8 border-dashed gap-1.5 text-xs'>
                    <Icons.plusCircle className='size-3.5 text-muted-foreground' />
                    <span>Kategori</span>
                    {notificationsPage.categoryFilter &&
                      notificationsPage.categoryFilter !== 'ALL' && (
                        <>
                          <Separator orientation='vertical' className='mx-0.5 h-3.5' />
                          <Badge
                            variant='secondary'
                            className='rounded-sm px-1 font-normal text-[11px]'
                          >
                            {notificationsPage.categoryFilter}
                          </Badge>
                        </>
                      )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-48 p-0' align='start'>
                  <Command>
                    <CommandInput placeholder='Pilih kategori...' />
                    <CommandList>
                      <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {CATEGORY_OPTIONS.map((opt) => {
                          const isSelected = notificationsPage.categoryFilter === opt.value;
                          return (
                            <CommandItem
                              key={opt.value}
                              onSelect={() =>
                                notificationsPage.actions.changeCategoryFilter(opt.value)
                              }
                              className='text-xs cursor-pointer'
                            >
                              <div
                                className={cn(
                                  'border-primary mr-2 flex size-3.5 items-center justify-center rounded-sm border',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'opacity-50 [&_svg]:invisible'
                                )}
                              >
                                <Icons.check className='size-3' />
                              </div>
                              <span>{opt.label}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      {notificationsPage.categoryFilter !== 'ALL' && (
                        <>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => notificationsPage.actions.changeCategoryFilter('ALL')}
                              className='justify-center text-center text-xs cursor-pointer'
                            >
                              Reset Kategori
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Status Filter Popover */}
              <Popover
                open={notificationsPage.isStatusOpen}
                onOpenChange={notificationsPage.actions.setStatusOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm' className='h-8 border-dashed gap-1.5 text-xs'>
                    <Icons.plusCircle className='size-3.5 text-muted-foreground' />
                    <span>Status</span>
                    {notificationsPage.statusFilter && notificationsPage.statusFilter !== 'ALL' && (
                      <>
                        <Separator orientation='vertical' className='mx-0.5 h-3.5' />
                        <Badge
                          variant='secondary'
                          className='rounded-sm px-1 font-normal text-[11px]'
                        >
                          {notificationsPage.statusFilter === 'unread'
                            ? 'Belum Dibaca'
                            : 'Sudah Dibaca'}
                        </Badge>
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-48 p-0' align='start'>
                  <Command>
                    <CommandInput placeholder='Filter status...' />
                    <CommandList>
                      <CommandEmpty>Status tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {STATUS_OPTIONS.map((opt) => {
                          const isSelected = notificationsPage.statusFilter === opt.value;
                          return (
                            <CommandItem
                              key={opt.value}
                              onSelect={() =>
                                notificationsPage.actions.changeStatusFilter(opt.value)
                              }
                              className='text-xs cursor-pointer'
                            >
                              <div
                                className={cn(
                                  'border-primary mr-2 flex size-3.5 items-center justify-center rounded-sm border',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'opacity-50 [&_svg]:invisible'
                                )}
                              >
                                <Icons.check className='size-3' />
                              </div>
                              <span
                                className={cn('size-2 rounded-full mr-1.5 shrink-0', opt.dotColor)}
                              />
                              <span>{opt.label}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      {notificationsPage.statusFilter !== 'ALL' && (
                        <>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => notificationsPage.actions.changeStatusFilter('ALL')}
                              className='justify-center text-center text-xs cursor-pointer'
                            >
                              Reset Status
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Reset All Filters Button */}
              {notificationsPage.isFiltered && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={notificationsPage.actions.resetAllFilters}
                  className='h-8 px-2.5 text-xs border border-dashed border-border'
                >
                  <Icons.close className='size-3.5 mr-1' />
                  Reset
                </Button>
              )}
            </div>

            {/* Right Toolbar Controls (View Switcher) */}
            <div className='inline-flex items-center p-0.5 bg-muted rounded-lg border border-border shrink-0'>
              <button
                type='button'
                onClick={() => notificationsPage.actions.changeViewStyle('card')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer',
                  notificationsPage.viewStyle === 'card'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icons.layoutList className='size-3.5' />
                <span className='hidden sm:inline'>Card View</span>
              </button>
              <button
                type='button'
                onClick={() => notificationsPage.actions.changeViewStyle('table')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer',
                  notificationsPage.viewStyle === 'table'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icons.table className='size-3.5' />
                <span className='hidden sm:inline'>Table</span>
              </button>
            </div>
          </div>
        )}

        <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
          {notificationsPage.paginatedList.length > 0 ? (
            <>
              <div className='absolute inset-0 flex overflow-hidden'>
                <ScrollArea className='h-full w-full pr-3'>
                  <div className='pb-24'>
                    {/* 2. Notification List Display */}
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

        {/* 4. Floating Batch Actions Toolbar */}
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
  );
}
