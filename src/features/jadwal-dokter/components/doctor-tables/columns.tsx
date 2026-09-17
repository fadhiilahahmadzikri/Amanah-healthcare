'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { CellAction } from './cell-action';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../../api/types';

export const getColumns = ({
  onOpenDetail,
  onOpenEdit
}: {
  onOpenDetail: (doctor: DoctorSchedule) => void;
  onOpenEdit: (doctor: DoctorSchedule) => void;
}): ColumnDef<DoctorSchedule>[] => [
  {
    accessorKey: 'nama_dokter',
    header: 'Dokter',
    cell: ({ row }) => {
      const doc = row.original;
      const initials = doc.nama_dokter
        .replace('dr. ', '')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      return (
        <button
          type='button'
          onClick={() => onOpenDetail(doc)}
          aria-label={`Lihat detail ${doc.nama_dokter}`}
          className='flex w-full items-center gap-3 py-0.5 text-left cursor-pointer group'
        >
          <Avatar className='size-9 rounded-lg ring-1 ring-border/50 group-hover:ring-primary/40 transition-all'>
            <AvatarImage src={doc.avatar} alt={doc.nama_dokter} />
            <AvatarFallback className='text-xs font-bold bg-primary/10 text-primary'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='space-y-0.5 min-w-0'>
            <div className='text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate'>
              {doc.nama_dokter}
            </div>
            <div className='text-[11px] text-muted-foreground truncate'>{doc.spesialisasi}</div>
          </div>
        </button>
      );
    }
  },
  {
    accessorKey: 'ruang_praktik',
    header: 'Ruang Praktik',
    cell: ({ row }) => (
      <div className='text-xs font-medium text-foreground truncate max-w-[200px]'>
        {row.original.ruang_praktik}
      </div>
    )
  },
  {
    accessorKey: 'jadwal_hari_ini',
    header: 'Sesi Praktik 24 Jam',
    cell: ({ row }) => {
      const { sesi_harian, jadwal_hari_ini, kapasitas_per_hari } = row.original;
      if (sesi_harian && sesi_harian.length > 0) {
        return (
          <div className='space-y-1 py-0.5'>
            <div className='flex items-center gap-1.5 flex-wrap'>
              {sesi_harian.map((sesi) => (
                <span
                  key={sesi.id}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10.5px] font-semibold border flex items-center gap-1 font-mono',
                    sesi.status_sesi === 'Buka'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : sesi.status_sesi === 'Penuh'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-muted/50 text-muted-foreground border-border/40'
                  )}
                  title={`${sesi.nama_sesi}: ${sesi.waktu}`}
                >
                  <span
                    className={cn(
                      'size-1 rounded-full',
                      sesi.status_sesi === 'Buka'
                        ? 'bg-emerald-500'
                        : sesi.status_sesi === 'Penuh'
                          ? 'bg-amber-500'
                          : 'bg-muted-foreground'
                    )}
                  />
                  <span>
                    {sesi.nama_sesi.replace('Sesi ', '')} {sesi.jam_mulai}
                  </span>
                </span>
              ))}
            </div>
            <span className='text-[10px] text-muted-foreground block'>
              Total Kapasitas: {kapasitas_per_hari} pasien / hari
            </span>
          </div>
        );
      }

      return (
        <div className='space-y-0.5'>
          <span className='text-xs font-semibold text-foreground block font-mono'>
            {jadwal_hari_ini}
          </span>
          <span className='text-[10px] text-muted-foreground block'>
            Kapasitas: {kapasitas_per_hari} pasien
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'slot_tersedia',
    header: 'Slot Tersedia',
    cell: ({ row }) => {
      const { slot_tersedia, kapasitas_per_hari, is_cuti } = row.original;
      const percentage = is_cuti
        ? 0
        : Math.round((slot_tersedia / Math.max(kapasitas_per_hari, 1)) * 100);

      return (
        <div className='space-y-1.5 min-w-[130px] max-w-[170px]'>
          <div className='flex items-center justify-between text-[11px] font-bold'>
            <span
              className={cn(
                'tabular-nums font-mono',
                percentage <= 20 ? 'text-destructive' : 'text-primary'
              )}
            >
              {slot_tersedia} / {kapasitas_per_hari} Slot
            </span>
            <span className='text-[10px] text-muted-foreground tabular-nums'>{percentage}%</span>
          </div>
          <Progress
            value={percentage}
            className={cn(
              'h-1.5',
              percentage <= 20
                ? '[&>div]:bg-destructive'
                : percentage <= 50
                  ? '[&>div]:bg-amber-500'
                  : '[&>div]:bg-primary'
            )}
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'status_dokter',
    header: 'Status Dokter',
    cell: ({ row }) => {
      const cfg = getStatusConfig(row.original.status_dokter);
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border backdrop-blur-xs select-none',
            cfg.pillBg,
            cfg.pillBorder
          )}
        >
          <span className={cn('size-1.5 rounded-full', cfg.dotGradient)} />
          <span className={cn('bg-clip-text text-transparent font-bold', cfg.textGradient)}>
            {cfg.label}
          </span>
        </span>
      );
    }
  },
  {
    accessorKey: 'status_jadwal',
    header: 'Status Jadwal',
    cell: ({ row }) => {
      const cfg = getStatusConfig(row.original.status_jadwal);
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border backdrop-blur-xs select-none',
            cfg.pillBg,
            cfg.pillBorder
          )}
        >
          <span className={cn('size-1.5 rounded-full', cfg.dotGradient)} />
          <span className={cn('bg-clip-text text-transparent font-bold', cfg.textGradient)}>
            {cfg.label}
          </span>
        </span>
      );
    }
  },
  {
    id: 'actions',
    header: () => (
      <div className='text-right text-[13px] font-semibold text-foreground px-1'>Aksi</div>
    ),
    size: 90,
    cell: ({ row }) => (
      <CellAction data={row.original} onOpenDetail={onOpenDetail} onOpenEdit={onOpenEdit} />
    )
  }
];
