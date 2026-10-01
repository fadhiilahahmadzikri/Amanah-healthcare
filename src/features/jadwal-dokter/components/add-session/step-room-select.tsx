'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ClinicRoom } from '../../api/types';

export interface StepRoomSelectProps {
  rooms: ClinicRoom[];
  selectedRoomId: string;
  onSelectRoomId: (roomId: string) => void;
  doctorName?: string;
  isLoading?: boolean;
}

export function StepRoomSelect({
  rooms,
  selectedRoomId,
  onSelectRoomId,
  doctorName,
  isLoading = false
}: StepRoomSelectProps) {
  return (
    <div className='space-y-4 font-sans select-none'>
      <div>
        <h4 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
          Pilih Ruang Praktik
        </h4>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan ruangan poliklinik tempat {doctorName ? `dokter ${doctorName}` : 'dokter'} akan bertugas.
        </p>
      </div>

      {isLoading && rooms.length === 0 ? (
        <div className='space-y-2.5 max-h-[46vh] overflow-y-auto pr-1'>
          <Skeleton className='h-[68px] w-full rounded-xl' />
          <Skeleton className='h-[68px] w-full rounded-xl' />
          <Skeleton className='h-[68px] w-full rounded-xl' />
        </div>
      ) : rooms.length === 0 ? (
        <div className='p-8 rounded-2xl border border-dashed border-border bg-muted/15 flex flex-col items-center justify-center text-center space-y-2'>
          <div className='size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
            <Icons.location className='size-5' />
          </div>
          <p className='text-xs sm:text-sm font-bold text-foreground'>
            Tidak ada ruangan praktik terdaftar
          </p>
        </div>
      ) : (
        <div className='space-y-2.5 max-h-[46vh] overflow-y-auto pr-1'>
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const isOccupied = room.isOccupied;

            return (
              <button
                type='button'
                key={room.id}
                aria-label={`Pilih Ruang ${room.name}`}
                disabled={isOccupied}
                onClick={() => {
                  if (!isOccupied) {
                    onSelectRoomId(room.id);
                  }
                }}
                className={cn(
                  'w-full text-left relative flex items-center justify-between p-3.5 rounded-xl border transition-all',
                  isOccupied
                    ? 'border-border/40 bg-muted/30 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs cursor-pointer'
                      : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20 cursor-pointer'
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
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-xs sm:text-sm font-bold text-foreground truncate'>
                        {room.name}
                      </span>
                      {isOccupied ? (
                        <span className='inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20'>
                          Terisi ({room.occupiedBy || 'Dokter Lain'})
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'>
                          Tersedia
                        </span>
                      )}
                    </div>
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
