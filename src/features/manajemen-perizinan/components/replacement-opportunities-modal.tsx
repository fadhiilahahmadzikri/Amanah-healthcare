'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { formatClinicDate } from '@/lib/date-format';
import { cn } from '@/lib/utils';
import { useReplacementsQuery } from '../api/queries';
import { ReplacementDetailModal } from './replacement-detail-modal';
import type { ReplacementOpportunityItem } from '../api/types';

export interface ReplacementOpportunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

type ReplacementStatusTab = 'all' | 'open' | 'claimed' | 'completed';

const FILTER_TABS: { key: ReplacementStatusTab; label: string }[] = [
  { key: 'all', label: 'Semua Status' },
  { key: 'open', label: 'Terbuka' },
  { key: 'claimed', label: 'Diklaim' },
  { key: 'completed', label: 'Selesai' }
];

export function ReplacementOpportunitiesModal({
  isOpen,
  onClose,
  portalContainerRef
}: ReplacementOpportunitiesModalProps) {
  const [statusTab, setStatusTab] = useState<ReplacementStatusTab>('all');
  const [selectedReplacement, setSelectedReplacement] = useState<ReplacementOpportunityItem | null>(
    null
  );

  const queryParam = statusTab === 'all' ? undefined : statusTab;
  const { data: replacements = [], isLoading } = useReplacementsQuery(queryParam);

  const renderStatusPill = (status: ReplacementOpportunityItem['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold'>
            Terbuka
          </span>
        );
      case 'claimed':
        return (
          <span className='bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold'>
            Diklaim
          </span>
        );
      case 'completed':
        return (
          <span className='bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-[11px] font-semibold'>
            Selesai
          </span>
        );
      case 'cancelled':
        return (
          <span className='bg-destructive/10 text-destructive px-2.5 py-0.5 rounded-full text-[11px] font-semibold'>
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        maxWidth='w-full sm:max-w-3xl lg:max-w-4xl'
        showCloseButton={false}
        portalContainerRef={portalContainerRef}
        className='h-auto max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-card p-4.5 sm:p-5 w-full my-auto shadow-2xl flex flex-col'
      >
        <div className='flex flex-col font-sans select-none gap-4 max-h-[85vh]'>
          {/* Header */}
          <div className='flex items-start justify-between gap-4 border-b border-border/60 pb-3 shrink-0'>
            <div className='flex items-start gap-3 min-w-0 flex-1'>
              <div className='p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5'>
                <Icons.calendar className='size-5' />
              </div>
              <div className='space-y-0.5 min-w-0 flex-1 text-left'>
                <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
                  Peluang Pengganti Dinas
                </h3>
                <p className='text-xs text-muted-foreground leading-normal'>
                  Daftar permohonan dinas pengganti yang terbuka atau telah diklaim rekan sejawat
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/60 transition-colors shrink-0'
              aria-label='Tutup'
            >
              <Icons.close className='size-4' />
            </button>
          </div>

          {/* Filter Pills */}
          <div className='flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0'>
            {FILTER_TABS.map((tab) => {
              const isActive = statusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type='button'
                  onClick={() => setStatusTab(tab.key)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs transition-colors shrink-0 font-medium',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className='flex-1 min-h-0 overflow-hidden'>
            {isLoading ? (
              <div className='space-y-3 py-1'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className='p-4 rounded-xl border border-border/50 bg-card/60 shadow-2xs space-y-3 animate-pulse'
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='space-y-1.5 flex-1'>
                        <Skeleton className='h-4 w-40 rounded-md' />
                        <Skeleton className='h-3 w-56 rounded-md' />
                      </div>
                      <Skeleton className='h-5 w-16 rounded-full shrink-0' />
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/20 border border-border/30'>
                      <div className='flex items-center gap-2'>
                        <Skeleton className='size-7 rounded-lg shrink-0' />
                        <div className='space-y-1 flex-1'>
                          <Skeleton className='h-3.5 w-24 rounded-md' />
                          <Skeleton className='h-2.5 w-16 rounded-md' />
                        </div>
                      </div>
                      <div className='flex items-center gap-2 sm:border-l sm:border-border/30 sm:pl-3'>
                        <Skeleton className='size-7 rounded-lg shrink-0' />
                        <div className='space-y-1 flex-1'>
                          <Skeleton className='h-3.5 w-24 rounded-md' />
                          <Skeleton className='h-2.5 w-16 rounded-md' />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : replacements.length === 0 ? (
              <EmptyState
                icon={Icons.calendar}
                title='Tidak Ada Peluang Pengganti'
                description={
                  statusTab === 'all'
                    ? 'Belum ada jadwal peluang dinas pengganti yang tercatat saat ini.'
                    : `Tidak ada permohonan dinas pengganti dengan filter status "${statusTab}".`
                }
                animated={false}
                className='min-h-[220px] py-8 rounded-xl border-dashed border-border/60 bg-muted/10'
              />
            ) : (
              <div className='max-h-[60vh] overflow-y-auto space-y-3 pr-1'>
                {replacements.map((item) => {
                  const timeDisplay =
                    item.startTime && item.endTime
                      ? `${item.startTime.slice(0, 5)} - ${item.endTime.slice(0, 5)} WIB`
                      : 'Mengikuti roster';

                  const formattedDate = formatClinicDate(item.workDate, { style: 'human_full' });

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedReplacement(item)}
                      className='bg-card border border-border/70 hover:border-border p-4 rounded-xl flex flex-col gap-3 shadow-2xs hover:shadow-md cursor-pointer transition-all text-left'
                    >
                      {/* Header */}
                      <div className='flex items-start justify-between gap-3'>
                        <div className='space-y-0.5 min-w-0 flex-1'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <h4 className='font-semibold text-foreground text-xs sm:text-sm leading-snug'>
                              {item.sessionLabel || item.sessionCode || 'Sesi Dinas'}
                            </h4>
                            <span className='text-muted-foreground text-xs'>•</span>
                            <span className='text-xs text-muted-foreground font-medium'>
                              {formattedDate}
                            </span>
                          </div>
                          <p className='text-[11px] text-muted-foreground flex items-center gap-1'>
                            <Icons.clock className='size-3 shrink-0' />
                            <span>{timeDisplay}</span>
                          </p>
                        </div>
                        <div className='shrink-0'>{renderStatusPill(item.status)}</div>
                      </div>

                      {/* Body Grid */}
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/20 border border-border/40 text-xs'>
                        {/* Left: Staf Berhalangan */}
                        <div className='space-y-1.5'>
                          <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block'>
                            Staf Berhalangan
                          </span>
                          <div className='flex items-center gap-2 min-w-0'>
                            <Avatar className='size-7 rounded-lg border border-border/50 shrink-0'>
                              <AvatarImage
                                src={item.originalStaffAvatarUrl || DEFAULT_AVATAR_PATH}
                                alt={item.originalStaffName || 'Staf'}
                                className='rounded-lg object-cover'
                              />
                              <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                                <Image
                                  src={DEFAULT_AVATAR_PATH}
                                  alt={item.originalStaffName || 'Staf'}
                                  width={28}
                                  height={28}
                                  unoptimized
                                  className='size-full rounded-lg object-cover'
                                />
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0 flex-1'>
                              <div className='font-semibold text-foreground text-xs truncate leading-tight'>
                                {item.originalStaffName || 'Staf Klinik'}
                              </div>
                              {item.originalStaffRole && (
                                <div className='text-muted-foreground text-[11px] truncate leading-tight mt-0.5'>
                                  {item.originalStaffRole}
                                </div>
                              )}
                            </div>
                          </div>
                          {item.leaveReason && (
                            <p className='text-[11px] text-muted-foreground line-clamp-1 italic mt-1'>
                              &ldquo;{item.leaveReason}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Right: Staf Pengganti */}
                        <div className='space-y-1.5 sm:border-l sm:border-border/40 sm:pl-3'>
                          <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block'>
                            Staf Pengganti
                          </span>
                          {item.claimedByName ? (
                            <div className='flex items-center gap-2 min-w-0'>
                              <Avatar className='size-7 rounded-lg border border-border/50 shrink-0'>
                                <AvatarImage
                                  src={item.claimedByAvatarUrl || DEFAULT_AVATAR_PATH}
                                  alt={item.claimedByName || 'Pengganti'}
                                  className='rounded-lg object-cover'
                                />
                                <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                                  <Image
                                    src={DEFAULT_AVATAR_PATH}
                                    alt={item.claimedByName || 'Pengganti'}
                                    width={28}
                                    height={28}
                                    unoptimized
                                    className='size-full rounded-lg object-cover'
                                  />
                                </AvatarFallback>
                              </Avatar>
                              <div className='min-w-0 flex-1'>
                                <div className='font-semibold text-primary text-xs truncate leading-tight'>
                                  {item.claimedByName}
                                </div>
                                {item.claimedByRole && (
                                  <div className='text-muted-foreground text-[11px] truncate leading-tight mt-0.5'>
                                    {item.claimedByRole}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : item.status === 'open' ? (
                            <div className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium py-1'>
                              <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0' />
                              <span className='text-[11px]'>
                                Terbuka untuk diklaim rekan sejawat
                              </span>
                            </div>
                          ) : (
                            <span className='text-muted-foreground text-xs'>-</span>
                          )}
                        </div>
                      </div>

                      {/* Footer / Action */}
                      <div className='flex items-center justify-between pt-1 border-t border-border/30 text-xs'>
                        <span className='text-[11px] text-muted-foreground'>
                          {item.status === 'claimed'
                            ? 'Staf pengganti sah untuk scan QR presensi.'
                            : item.status === 'open'
                              ? 'Dapat diklaim via aplikasi mobile.'
                              : 'Sesi dinas pengganti.'}
                        </span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReplacement(item);
                          }}
                          className='h-7 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 font-medium gap-1'
                        >
                          <span>Lihat Detail</span>
                          <Icons.arrowRight className='size-3.5' />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='flex justify-end pt-3 border-t border-border/60 shrink-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              className='text-xs h-8.5 px-4 text-muted-foreground hover:text-foreground font-medium'
            >
              Tutup
            </Button>
          </div>
        </div>
      </ModalWrapper>

      {/* Detail Inspection Modal */}
      <ReplacementDetailModal
        replacement={selectedReplacement}
        isOpen={Boolean(selectedReplacement)}
        onClose={() => setSelectedReplacement(null)}
        portalContainerRef={portalContainerRef}
      />
    </>
  );
}
