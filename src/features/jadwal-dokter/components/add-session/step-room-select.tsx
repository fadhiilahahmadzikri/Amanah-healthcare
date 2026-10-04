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
  onViewConflict?: (room: ClinicRoom) => void;
  showHeader?: boolean;
}

export function StepRoomSelect({
  rooms,
  selectedRoomId,
  onSelectRoomId,
  doctorName,
  isLoading = false,
  onViewConflict,
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

            if (isOccupied) {
              return (
                <div
                  key={room.id}
                  className='group w-full text-left relative flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20 opacity-75 hover:opacity-100 transition-all'
                >
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <div className='size-9 rounded-full flex items-center justify-center shrink-0 bg-muted/60 text-muted-foreground/50'>
                      <Icons.location className='size-4' />
                    </div>

                    <div className='min-w-0 flex-1 space-y-0.5'>
                      <span className='text-xs sm:text-sm font-bold text-muted-foreground truncate block'>
                        {room.name}
                      </span>
                      {room.location && (
                        <p className='text-xs text-muted-foreground truncate'>
                          {room.location} {room.floor ? `• Lantai ${room.floor}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='relative flex items-center gap-2.5 shrink-0 pl-2'>
                    {onViewConflict && (
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onViewConflict(room);
                        }}
                        className='absolute right-[calc(100%+8px)] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto text-[11px] font-semibold text-primary hover:underline hover:text-primary/80 cursor-pointer inline-flex items-center gap-0.5 whitespace-nowrap'
                        aria-label={`Lihat dokter di ${room.name}`}
                      >
                        <span>Lihat dokter</span>
                        <Icons.arrowRight className='size-2.5 stroke-[2.5]' />
                      </button>
                    )}

                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20'>
                      Terisi
                    </span>

                    <div className='size-5 rounded-full border border-muted-foreground/15 bg-muted/30 flex items-center justify-center' />
                  </div>
                </div>
              );
            }

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
