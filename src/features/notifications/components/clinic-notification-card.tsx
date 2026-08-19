'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ClinicNotification } from '../types';
import { clinicalTokens } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ClinicNotificationCardProps {
  notification: ClinicNotification;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

export function getCategoryTagConfig(category: string) {
  switch (category) {
    case 'Janji Temu':
      return {
        pillBg: clinicalTokens.colors.status.confirmed.pillBg,
        pillBorder: clinicalTokens.colors.status.confirmed.pillBorder,
        textGradient: clinicalTokens.colors.status.confirmed.textGradient,
        dotGradient: clinicalTokens.colors.status.confirmed.dotGradient,
        label: 'Janji Temu'
      };
    case 'Promo':
      return {
        pillBg: clinicalTokens.colors.status.pending.pillBg,
        pillBorder: clinicalTokens.colors.status.pending.pillBorder,
        textGradient: clinicalTokens.colors.status.pending.textGradient,
        dotGradient: clinicalTokens.colors.status.pending.dotGradient,
        label: 'Promo'
      };
    case 'Hasil Lab':
      return {
        pillBg: clinicalTokens.colors.status.upcoming.pillBg,
        pillBorder: clinicalTokens.colors.status.upcoming.pillBorder,
        textGradient: clinicalTokens.colors.status.upcoming.textGradient,
        dotGradient: clinicalTokens.colors.status.upcoming.dotGradient,
        label: 'Hasil Lab'
      };
    case 'Antrean':
      return {
        pillBg: clinicalTokens.colors.status.completed.pillBg,
        pillBorder: clinicalTokens.colors.status.completed.pillBorder,
        textGradient: clinicalTokens.colors.status.completed.textGradient,
        dotGradient: clinicalTokens.colors.status.completed.dotGradient,
        label: 'Antrean'
      };
    case 'Farmasi':
      return {
        pillBg: clinicalTokens.colors.status.cancelled.pillBg,
        pillBorder: clinicalTokens.colors.status.cancelled.pillBorder,
        textGradient: clinicalTokens.colors.status.cancelled.textGradient,
        dotGradient: clinicalTokens.colors.status.cancelled.dotGradient,
        label: 'Farmasi'
      };
    case 'Telemedisin':
      return {
        pillBg: clinicalTokens.colors.status.checkedIn.pillBg,
        pillBorder: clinicalTokens.colors.status.checkedIn.pillBorder,
        textGradient: clinicalTokens.colors.status.checkedIn.textGradient,
        dotGradient: clinicalTokens.colors.status.checkedIn.dotGradient,
        label: 'Telemedisin'
      };
    default:
      return {
        pillBg: 'bg-muted/60',
        pillBorder: 'border-border/50',
        textGradient: 'text-foreground',
        dotGradient: 'bg-muted-foreground',
        label: category
      };
  }
}

export function ClinicNotificationCard({
  notification,
  isSelected = false,
  onToggleSelect,
  onMarkAsRead,
  className
}: ClinicNotificationCardProps) {
  const isUnread = notification.status === 'unread';
  const categoryConfig = getCategoryTagConfig(notification.category);

  // Sub-badge icon selector based on badgeIcon string
  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'stethoscope':
        return (
          <Icons.stethoscope
            className='size-2.5 sm:size-3 text-primary-foreground'
            strokeWidth={2.5}
          />
        );
      case 'gift':
        return (
          <Icons.gift className='size-2.5 sm:size-3 text-primary-foreground' strokeWidth={2.5} />
        );
      case 'flask':
        return (
          <Icons.flask className='size-2.5 sm:size-3 text-primary-foreground' strokeWidth={2.5} />
        );
      case 'activity':
        return (
          <Icons.activity
            className='size-2.5 sm:size-3 text-primary-foreground'
            strokeWidth={2.5}
          />
        );
      case 'pill':
        return (
          <Icons.pill className='size-2.5 sm:size-3 text-primary-foreground' strokeWidth={2.5} />
        );
      case 'video':
        return (
          <Icons.video className='size-2.5 sm:size-3 text-primary-foreground' strokeWidth={2.5} />
        );
      default:
        return (
          <Icons.notification
            className='size-2.5 sm:size-3 text-primary-foreground'
            strokeWidth={2.5}
          />
        );
    }
  };

  // Meta Pill Icon
  const renderMetaIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return <Icons.calendar className='size-3.5 shrink-0 text-primary' />;
      case 'sparkles':
        return <Icons.sparkles className='size-3.5 shrink-0 text-primary' />;
      case 'fileTypePdf':
        return <Icons.fileTypePdf className='size-3.5 shrink-0 text-primary' />;
      case 'user':
        return <Icons.user className='size-3.5 shrink-0 text-primary' />;
      case 'package':
        return <Icons.package className='size-3.5 shrink-0 text-primary' />;
      case 'video':
        return <Icons.video className='size-3.5 shrink-0 text-primary' />;
      default:
        return <Icons.clock className='size-3.5 shrink-0 text-primary' />;
    }
  };

  // Action Button Click Handler with rich toast feedback
  const handleActionClick = (actionKey: string, label: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    switch (actionKey) {
      case 'confirm':
        toast.success('Kehadiran Janji Temu Dikonfirmasi', {
          description: `Terima kasih! Jadwal kunjungan ke ${notification.roleSubtitle} telah dikonfirmasi.`
        });
        break;
      case 'reschedule':
        toast.info('Ubah Jadwal Janji Temu', {
          description: 'Membuka dialog pemilihan jadwal dan slot dokter pengganti...'
        });
        break;
      case 'claim_promo':
        toast.success('Voucher Promo Berhasil Diklaim! 🎁', {
          description:
            'Voucher diskon 30% telah tersimpan di akun Anda dan dapat digunakan saat pembayaran kasir.'
        });
        break;
      case 'download_lab':
        toast.success('Mengunduh Hasil Laboratorium 📄', {
          description: 'Dokumen PDF Hasil Tes Medis Anda sedang diunduh secara aman.'
        });
        break;
      case 'view_queue':
        toast.info('Menuju Monitor Antrean Live', {
          description: 'Mengarahkan ke layar Cek Antrean Poliklinik...'
        });
        break;
      case 'track_medication':
        toast.info('Opsi Pengambilan Obat Farmasi', {
          description: 'Resep digital siap diambil di Loket 3 Apotek atau melalui kurir express.'
        });
        break;
      case 'view_telemedicine':
        toast.info('Ringkasan Telemedisin', {
          description: 'Membuka catatan resep dokter dan anjuran medis sesi telemedisin.'
        });
        break;
      default:
        toast.info(label, {
          description: `Aksi untuk notifikasi dari ${notification.sender} telah diproses.`
        });
        break;
    }
  };

  return (
    <article
      id={`notif-card-${notification.id}`}
      className={cn(
        'notif-item-card group relative rounded-xl p-4 sm:p-5 border transition-all duration-200 bg-card text-card-foreground shadow-none',
        isUnread ? 'border-primary/40 bg-card shadow-xs' : 'border-border/60 hover:border-border',
        isSelected && 'ring-2 ring-primary/40 bg-primary/[0.03] border-primary/50',
        className
      )}
    >
      {/* 1. Top Right Category & Unread Indicator */}
      <div className='absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 z-10'>
        {/* Neon Gradient Category Tag */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm select-none shadow-none',
            categoryConfig.pillBg,
            categoryConfig.pillBorder
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
              categoryConfig.dotGradient
            )}
          />
          <span
            className={cn(
              'bg-clip-text text-transparent font-bold tracking-tight',
              categoryConfig.textGradient
            )}
          >
            {categoryConfig.label}
          </span>
        </span>

        {isUnread && (
          <span className='relative flex size-2.5'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75' />
            <span className='relative inline-flex rounded-full size-2.5 bg-primary' />
          </span>
        )}
      </div>

      {/* 2. Optical Left-Aligned Layout Grid */}
      <div className='flex items-start gap-3.5 sm:gap-4'>
        {/* Column 1: Visible Checkbox + Avatar + Sub-badge */}
        <div className='flex items-center gap-3 shrink-0 pt-0.5'>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(notification.id)}
            aria-label={`Pilih notifikasi ${notification.sender}`}
            className='size-4.5 rounded border-2 border-primary/50 bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground transition-all cursor-pointer shadow-2xs'
          />

          <div className='relative size-10 sm:size-11 rounded-full overflow-hidden shrink-0 ring-1 ring-border/60 bg-muted'>
            <Image
              src={notification.avatar}
              alt={notification.sender}
              width={88}
              height={88}
              unoptimized
              className='size-full object-cover object-center rounded-full'
            />
            {/* Sub-badge corner icon */}
            <div className='absolute -bottom-0.5 -right-0.5 size-4.5 sm:size-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-card shadow-2xs'>
              {renderBadgeIcon(notification.badgeIcon)}
            </div>
          </div>
        </div>

        {/* Column 2: Notification Content Body - Full Width */}
        <div className='flex-1 min-w-0'>
          {/* Header Info - Padded on right to avoid overlapping category badge */}
          <div className='pr-28 sm:pr-32'>
            <div className='flex items-baseline gap-2 flex-wrap'>
              <h4 className='text-xs sm:text-sm font-bold text-foreground truncate leading-snug'>
                {notification.sender}
              </h4>
              <span className='text-[11px] text-muted-foreground font-normal whitespace-nowrap'>
                {notification.timeAgo}
              </span>
            </div>
            <p className='text-[11px] text-muted-foreground mt-0.5 font-normal'>
              Mengirim pesan untuk{' '}
              <span className='text-foreground font-medium'>{notification.roleSubtitle}</span>
            </p>
          </div>

          {/* Message Text */}
          <div className='mt-2 text-xs sm:text-[13px] text-foreground/90 leading-relaxed font-normal'>
            {notification.body}
          </div>

          {/* Dynamic Context Meta Pill */}
          <div className='mt-2.5'>
            <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/60 bg-muted/30 text-foreground text-[11px] sm:text-xs font-medium'>
              {renderMetaIcon(notification.metaIcon)}
              <span>{notification.dateFull}</span>
            </div>
          </div>

          {/* Footer Action Buttons - Strictly Flush Right to the Edge */}
          {notification.actions && notification.actions.length > 0 && (
            <div className='mt-3.5 pt-3 border-t border-border/40 flex items-center justify-end gap-2 w-full flex-wrap'>
              {notification.actions.map((act) => {
                if (act.type === 'primary') {
                  return (
                    <Button
                      key={act.id}
                      size='sm'
                      onClick={() => handleActionClick(act.actionKey, act.label)}
                      className='h-8 px-3.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5'
                    >
                      <Icons.check className='size-3.5' />
                      <span>{act.label}</span>
                    </Button>
                  );
                } else if (act.type === 'warning') {
                  return (
                    <Button
                      key={act.id}
                      size='sm'
                      onClick={() => handleActionClick(act.actionKey, act.label)}
                      className='h-8 px-3.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5'
                    >
                      <Icons.ticket className='size-3.5' />
                      <span>{act.label}</span>
                    </Button>
                  );
                } else if (act.type === 'info') {
                  return (
                    <Button
                      key={act.id}
                      variant='secondary'
                      size='sm'
                      onClick={() => handleActionClick(act.actionKey, act.label)}
                      className='h-8 px-3.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5'
                    >
                      <Icons.download className='size-3.5' />
                      <span>{act.label}</span>
                    </Button>
                  );
                } else {
                  return (
                    <Button
                      key={act.id}
                      variant='outline'
                      size='sm'
                      onClick={() => handleActionClick(act.actionKey, act.label)}
                      className='h-8 px-3.5 rounded-lg text-xs font-medium border-border/60 hover:bg-muted text-foreground flex items-center gap-1.5'
                    >
                      {act.icon === 'truck' && <Icons.truck className='size-3.5' />}
                      {act.icon === 'externalLink' && <Icons.externalLink className='size-3.5' />}
                      {act.icon === 'fileTypeDoc' && <Icons.fileTypeDoc className='size-3.5' />}
                      <span>{act.label}</span>
                    </Button>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
