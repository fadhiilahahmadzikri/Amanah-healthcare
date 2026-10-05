'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { ClinicRoom } from '../../api/types';

export interface StepRoomSelectProps {
  rooms: ClinicRoom[];
  selectedRoomId: string;
  onSelectRoomId: (roomId: string) => void;
  doctorName?: string;
  isLoading?: boolean;
  showHeader?: boolean;
}

export function StepRoomSelect({
  rooms,
  selectedRoomId,
  onSelectRoomId,
  doctorName,
  isLoading = false,
  showHeader = true
}: StepRoomSelectProps) {
  return (
    <div className='space-y-4 font-sans select-none'>
      {showHeader && (
        <div>
          <h4 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            Pilih Ruang Praktik
          </h4>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
            Tentukan ruangan poliklinik tempat {doctorName ? `dokter ${doctorName}` : 'dokter'} akan
            bertugas.
          </p>
        </div>
      )}

      {isLoading && rooms.length === 0 ? (
        <div className='space-y-2.5 max-h-[46vh] overflow-y-auto pr-1'>
          <Skeleton className='h-[68px] w-full rounded-xl' />
          <Skeleton className='h-[68px] w-full rounded-xl' />
          <Skeleton className='h-[68px] w-full rounded-xl' />
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          animated
          title='Tidak Ada Ruangan Praktik'
          description='Belum ada ruangan poliklinik yang terdaftar pada tanggal ini.'
          className='border-0 bg-transparent py-2 min-h-0'
          animationClassName='w-32 h-32 sm:w-36 sm:h-36'
        />
      ) : (
        <div className='space-y-2.5 max-h-[46vh] overflow-y-auto pr-1'>
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;

            return (
              <button
                type='button'
                key={room.id}
                aria-label={`Pilih Ruang ${room.name}`}
                onClick={() => onSelectRoomId(room.id)}
                className={cn(
                  'w-full text-left relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                    : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20'
                )}
              >
                <div className='flex items-center gap-3 min-w-0 flex-1'>
                  <div
                    className={cn(
                      'size-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icons.location className='size-4' />
                  </div>

                  <div className='min-w-0 flex-1 space-y-0.5'>
                    <span className='text-xs sm:text-sm font-bold text-foreground truncate block'>
                      {room.name}
                    </span>
                    {room.location && (
                      <p className='text-xs text-muted-foreground truncate'>
                        {room.location} {room.floor ? `• Lantai ${room.floor}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className='shrink-0 pl-2'>
                  <div
                    className={cn(
                      'size-5 rounded-full border flex items-center justify-center transition-all',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30 bg-transparent'
                    )}
                  >
                    {isSelected && <div className='size-2 rounded-full bg-white' />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
