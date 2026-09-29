'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ClinicNotification } from '../types';
import { getCategoryTagConfig } from './clinic-notification-card';
import { clinicalTokens } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface NotificationsListTableProps {
  notifications: ClinicNotification[];
  selectedIds: Set<string>;
  isAllSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onMarkAsRead: (id: string) => void;
}

export function NotificationsListTable({
  notifications,
  selectedIds,
  isAllSelected,
  onToggleSelect,
  onToggleSelectAll,
  onMarkAsRead
}: NotificationsListTableProps) {
  return (
    <div className='bg-card rounded-xl border border-border overflow-hidden shadow-none'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-xs font-normal'>
          <thead className='bg-muted/40 border-b border-border text-foreground font-semibold text-xs'>
            <tr>
              <th className='p-3.5 w-8 text-center'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label='Pilih semua notifikasi di halaman ini'
                  className='size-4 rounded border-2 border-primary/50'
                />
              </th>
              <th className='py-3 px-3 font-semibold text-xs text-foreground'>Notifikasi</th>
              <th className='py-3 px-3 font-semibold text-xs text-foreground'>Kategori</th>
              <th className='py-3 px-3 font-semibold text-xs text-foreground'>Status</th>
              <th className='py-3 px-3 font-semibold text-xs text-foreground'>Waktu</th>
              <th className='py-3 px-3 text-right font-semibold text-xs text-foreground'>Aksi</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/60'>
            {notifications.map((item) => {
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
                      onCheckedChange={() => onToggleSelect(item.id)}
                      aria-label={`Pilih notifikasi ${item.sender}`}
                      className='size-4 rounded border-2 border-primary/50'
                    />
                  </td>
                  <td className='py-3 px-3' aria-label={`Notifikasi dari ${item.sender}`}>
                    <div className='flex items-center gap-2.5'>
                      <Avatar className='size-8 shrink-0 ring-1 ring-border bg-muted'>
                        {item.avatar ? (
                          <AvatarImage
                            src={item.avatar}
                            alt={item.sender}
                            className='object-cover'
                          />
                        ) : null}
                        <AvatarFallback className='bg-primary/10 text-primary font-bold text-[10px]'>
                          {item.sender.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <p className='font-bold text-foreground text-xs truncate'>{item.sender}</p>
                        <p className='text-muted-foreground text-[11px] truncate max-w-sm font-normal'>
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-3'>
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
                        onMarkAsRead(item.id);
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
  );
}
