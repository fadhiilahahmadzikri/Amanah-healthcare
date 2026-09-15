'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import PageContainer from '@/components/layout/page-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ClinicNotificationCard, getCategoryTagConfig } from './clinic-notification-card';
import { AppointmentPagination } from '@/features/klinik/components/appointment-pagination';
import { useNotificationStore } from '../utils/store';
import { clinicalTokens } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Semua Kategori' },
  { value: 'Janji Temu', label: '📅 Janji Temu' },
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
  const { notifications, markAsRead, markAllAsRead, bulkMarkAsRead, bulkDelete, resetToDefault } =
    useNotificationStore();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const bulkBarRef = useRef<HTMLDivElement>(null);

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    (categoryFilter !== 'ALL' && categoryFilter !== '') ||
    (statusFilter !== 'ALL' && statusFilter !== '');

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.sender.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.roleSubtitle.toLowerCase().includes(q);

      return matchCat && matchStatus && matchSearch;
    });
  }, [notifications, categoryFilter, statusFilter, searchQuery]);

  // Pagination calculation
  const totalItems = filteredNotifications.length;

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected =
    paginatedList.length > 0 && paginatedList.every((item) => selectedIds.has(item.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedList.forEach((item) => next.delete(item.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedList.forEach((item) => next.add(item.id));
        return next;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  // Bulk Actions
  const handleBulkMarkAsRead = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    bulkMarkAsRead(ids);
    toast.success(`${ids.length} notifikasi ditandai sebagai dibaca.`);
    handleClearSelection();
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    bulkDelete(ids);
    toast.success(`${ids.length} notifikasi berhasil dihapus.`);
    handleClearSelection();
  };

  // Floating Bulk Bar Animation
  useEffect(() => {
    if (!bulkBarRef.current) return;
    if (selectedIds.size > 0) {
      gsap.to(bulkBarRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        display: 'flex'
      });
    } else {
      gsap.to(bulkBarRef.current, {
        y: 80,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          if (bulkBarRef.current) {
            bulkBarRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [selectedIds.size]);

  const handleMarkAll = () => {
    markAllAsRead();
    toast.success('Semua notifikasi ditandai sebagai sudah dibaca.');
  };

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Notifikasi'
      pageDescription='Dapatkan informasi terbaru tentang jadwal dan layanan klinik Anda'
      pageHeaderAction={
        <Button onClick={handleMarkAll} className='text-xs md:text-sm'>
          <Icons.checks className='mr-2 h-4 w-4' />
          <span>Tandai Semua Sudah Dibaca</span>
        </Button>
      }
    >
      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 w-full font-sans select-none'>
        {/* 1. Harmonized Filter Toolbar matching Janji Temu & Queue View */}
        <div className='flex flex-wrap items-center justify-between gap-2.5'>
          {/* Left Toolbar Controls (Redundansi 'Pilih Semua' dihapus) */}
          <div className='flex flex-wrap items-center gap-2'>
            {/* Global Search Input */}
            <div className='relative flex-1 min-w-[180px] max-w-[260px]'>
              <Icons.search className='size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='text'
                aria-label='Cari notifikasi'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder='Cari notifikasi...'
                className='h-8 pl-8 pr-3 text-xs bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary shadow-2xs'
              />
            </div>

            {/* Category Filter Popover */}
            <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm' className='h-8 border-dashed gap-1.5 text-xs'>
                  <Icons.plusCircle className='size-3.5 text-muted-foreground' />
                  <span>Kategori</span>
                  {categoryFilter && categoryFilter !== 'ALL' && (
                    <>
                      <Separator orientation='vertical' className='mx-0.5 h-3.5' />
                      <Badge
                        variant='secondary'
                        className='rounded-sm px-1 font-normal text-[11px]'
                      >
                        {categoryFilter}
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
                        const isSelected = categoryFilter === opt.value;
                        return (
                          <CommandItem
                            key={opt.value}
                            onSelect={() => {
                              setCategoryFilter(opt.value);
                              setIsCategoryOpen(false);
                              setCurrentPage(1);
                            }}
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
                    {categoryFilter !== 'ALL' && categoryFilter !== '' && (
                      <>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setCategoryFilter('ALL');
                              setIsCategoryOpen(false);
                              setCurrentPage(1);
                            }}
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
            <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm' className='h-8 border-dashed gap-1.5 text-xs'>
                  <Icons.plusCircle className='size-3.5 text-muted-foreground' />
                  <span>Status</span>
                  {statusFilter && statusFilter !== 'ALL' && (
                    <>
                      <Separator orientation='vertical' className='mx-0.5 h-3.5' />
                      <Badge
                        variant='secondary'
                        className='rounded-sm px-1 font-normal text-[11px]'
                      >
                        {statusFilter === 'unread' ? 'Belum Dibaca' : 'Sudah Dibaca'}
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
                        const isSelected = statusFilter === opt.value;
                        return (
                          <CommandItem
                            key={opt.value}
                            onSelect={() => {
                              setStatusFilter(opt.value);
                              setIsStatusOpen(false);
                              setCurrentPage(1);
                            }}
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
                    {statusFilter !== 'ALL' && statusFilter !== '' && (
                      <>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setStatusFilter('ALL');
                              setIsStatusOpen(false);
                              setCurrentPage(1);
                            }}
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
            {isFiltered && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleResetAllFilters}
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
              onClick={() => setViewStyle('card')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer',
                viewStyle === 'card'
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icons.layoutList className='size-3.5' />
              <span className='hidden sm:inline'>Card View</span>
            </button>
            <button
              type='button'
              onClick={() => setViewStyle('table')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 cursor-pointer',
                viewStyle === 'table'
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icons.table className='size-3.5' />
              <span className='hidden sm:inline'>Table</span>
            </button>
          </div>
        </div>

        <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
          <div className='absolute inset-0 flex overflow-hidden'>
            <ScrollArea className='h-full w-full pr-3'>
              <div className='pb-24'>
                {/* 2. Notification List Display */}
                {paginatedList.length > 0 ? (
                  viewStyle === 'card' ? (
                    /* CARD VIEW */
                    <div className='space-y-3'>
                      {paginatedList.map((item) => (
                        <ClinicNotificationCard
                          key={item.id}
                          notification={item}
                          isSelected={selectedIds.has(item.id)}
                          onToggleSelect={handleToggleSelect}
                          onMarkAsRead={markAsRead}
                        />
                      ))}
                    </div>
                  ) : (
                    /* TABLE VIEW */
                    <div className='bg-card rounded-xl border border-border overflow-hidden shadow-none'>
                      <div className='overflow-x-auto'>
                        <table className='w-full text-left text-xs font-normal'>
                          {/* Table Header: Natural Title Case (Non-uppercase) */}
                          <thead className='bg-muted/40 border-b border-border text-foreground font-semibold text-xs'>
                            <tr>
                              <th className='p-3.5 w-8 text-center'>
                                <Checkbox
                                  checked={isAllSelected}
                                  onCheckedChange={handleToggleSelectAll}
                                  aria-label='Pilih semua notifikasi di halaman ini'
                                  className='size-4 rounded border-2 border-primary/50'
                                />
                              </th>
                              <th className='py-3 px-3 font-semibold text-xs text-foreground'>
                                Notifikasi
                              </th>
                              <th className='py-3 px-3 font-semibold text-xs text-foreground'>
                                Kategori
                              </th>
                              <th className='py-3 px-3 font-semibold text-xs text-foreground'>
                                Status
                              </th>
                              <th className='py-3 px-3 font-semibold text-xs text-foreground'>
                                Waktu
                              </th>
                              <th className='py-3 px-3 text-right font-semibold text-xs text-foreground'>
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-border/60'>
                            {paginatedList.map((item) => {
                              const isUnread = item.status === 'unread';
                              const isChecked = selectedIds.has(item.id);
                              const catConf = getCategoryTagConfig(item.category);

                              return (
                                <tr
                                  key={item.id}
                                  className={cn(
                                    'hover:bg-muted/40 transition-colors',
                                    isUnread && 'bg-primary/[0.02]',
                                    isChecked && 'bg-primary/[0.05]'
                                  )}
                                >
                                  <td className='p-3.5 text-center'>
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() => handleToggleSelect(item.id)}
                                      aria-label={`Pilih notifikasi ${item.sender}`}
                                      className='size-4 rounded border-2 border-primary/50'
                                    />
                                  </td>
                                  <td
                                    className='py-3 px-3'
                                    aria-label={`Notifikasi dari ${item.sender}`}
                                  >
                                    <div className='flex items-center gap-2.5'>
                                      <div className='size-8 rounded-full overflow-hidden shrink-0 ring-1 ring-border bg-muted'>
                                        <Image
                                          src={item.avatar}
                                          alt={item.sender}
                                          width={64}
                                          height={64}
                                          unoptimized
                                          className='size-full object-cover'
                                        />
                                      </div>
                                      <div className='min-w-0'>
                                        <p className='font-bold text-foreground text-xs truncate'>
                                          {item.sender}
                                        </p>
                                        <p className='text-muted-foreground text-[11px] truncate max-w-sm font-normal'>
                                          {item.body}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className='py-3 px-3'>
                                    {/* Neon Gradient Category Tag */}
                                    <span
                                      className={cn(
                                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm shadow-none select-none',
                                        catConf.pillBg,
                                        catConf.pillBorder
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          'size-1.5 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                                          catConf.dotGradient
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          'bg-clip-text text-transparent font-bold tracking-tight',
                                          catConf.textGradient
                                        )}
                                      >
                                        {catConf.label}
                                      </span>
                                    </span>
                                  </td>
                                  <td className='py-3 px-3'>
                                    {/* Neon Gradient Status Tag */}
                                    {isUnread ? (
                                      <span
                                        className={cn(
                                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm shadow-none select-none',
                                          clinicalTokens.colors.status.confirmed.pillBg,
                                          clinicalTokens.colors.status.confirmed.pillBorder
                                        )}
                                      >
                                        <span className='size-1.5 rounded-full shrink-0 bg-gradient-to-tr from-[#047857] via-[#10b981] to-[#34d399] relative flex'>
                                          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
                                        </span>
                                        <span
                                          className={cn(
                                            'bg-clip-text text-transparent font-bold tracking-tight',
                                            clinicalTokens.colors.status.confirmed.textGradient
                                          )}
                                        >
                                          Belum Dibaca
                                        </span>
                                      </span>
                                    ) : (
                                      <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-border/50 bg-muted/40 text-muted-foreground select-none'>
                                        <span className='size-1.5 rounded-full shrink-0 bg-muted-foreground/50' />
                                        <span>Sudah Dibaca</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className='py-3 px-3 text-muted-foreground text-[11px] whitespace-nowrap'>
                                    {item.timeAgo}
                                  </td>
                                  <td className='py-3 px-3 text-right'>
                                    <Button
                                      type='button'
                                      variant='default'
                                      shape='pill'
                                      size='sm'
                                      withTrailingCircleIcon
                                      onClick={() => {
                                        markAsRead(item.id);
                                        toast.info(`Detail notifikasi dari ${item.sender}`, {
                                          description: item.body
                                        });
                                      }}
                                      className='font-semibold ml-auto'
                                    >
                                      Detail
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                ) : (
                  /* Empty State */
                  <div className='bg-card rounded-xl p-10 text-center border border-border shadow-none space-y-3 flex flex-col items-center justify-center'>
                    <div className='size-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto ring-4 ring-muted/50'>
                      <Icons.notification className='size-6 opacity-40' />
                    </div>
                    <div className='space-y-1'>
                      <h3 className='text-sm font-bold text-foreground'>
                        Tidak ada notifikasi ditemukan
                      </h3>
                      <p className='text-xs text-muted-foreground max-w-xs mx-auto'>
                        Coba sesuaikan filter kategori, status, atau kata kunci pencarian kamu.
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={resetToDefault}
                      className='text-xs h-8 px-3 rounded-lg border-border/60'
                    >
                      Muat Ulang Notifikasi Bawaan
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className='absolute bottom-0 inset-x-0 z-20 pointer-events-none flex justify-center'>
            <div className='pointer-events-auto w-full'>
              <AppointmentPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[6, 10, 20, 50]}
                className='static bottom-auto z-auto mx-0 mt-0 mb-0 w-full border-t border-border/50 bg-background/80 px-4 py-3 shadow-md backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 dark:bg-card/80 dark:supports-[backdrop-filter]:bg-card/70 md:mx-0 md:w-full'
              />
            </div>
          </div>
        </div>

        {/* 4. Floating Batch Actions Toolbar */}
        <div
          ref={bulkBarRef}
          style={{ display: 'none', transform: 'translate(-50%, 80px)', opacity: 0 }}
          className='fixed bottom-6 left-1/2 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl shadow-2xl items-center gap-3 z-50 border border-primary/20 backdrop-blur-md'
        >
          <div className='flex items-center gap-2 text-xs font-semibold border-r border-primary-foreground/20 pr-3'>
            <span className='px-2 py-0.5 bg-primary-foreground/20 rounded-md font-bold text-xs'>
              {selectedIds.size}
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
              onClick={handleClearSelection}
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
