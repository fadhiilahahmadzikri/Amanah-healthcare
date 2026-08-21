'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { attendanceQueries } from '../api/queries';
import { QRPresenceCard } from './qr-presence-card';
import { AttendanceTableCard } from './attendance-table-card';
import { ManualAttendanceModal } from './manual-attendance-modal';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { AttendanceFilterParams } from '../api/types';

export function KehadiranLiveView() {
  const router = useRouter();
  const [params, setParams] = useState<AttendanceFilterParams>({
    date: '23/08/2026',
    shift: 'all',
    status: 'all',
    category: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState(false);

  const { data, refetch } = useQuery(attendanceQueries.list(params));

  const handleFilterChange = (newParams: Partial<AttendanceFilterParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleResetFilter = () => {
    setParams({
      date: '23/08/2026',
      shift: 'all',
      status: 'all',
      category: 'all',
      search: '',
      page: 1,
      limit: 10
    });
    toast.info('Filter presensi telah direset.');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const handleClosePanel = () => {
    try {
      if (window.opener) {
        window.close();
      } else {
        router.push('/dashboard/kehadiran-pegawai');
      }
    } catch {
      router.push('/dashboard/kehadiran-pegawai');
    }
  };

  if (!data) {
    return (
      <div className='min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans'>
        <Icons.spinner className='size-10 animate-spin text-primary' />
        <p className='text-xs font-semibold text-muted-foreground mt-3'>
          Memuat Sesi Presensi Live...
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-background text-foreground flex flex-col font-sans select-none p-3 sm:p-4'>
      {/* Main Live Grid: Pure Full Screen QR + Attendance Table */}
      <main className='flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-0'>
        {/* Left Column: QR Presence Card */}
        <div className='lg:col-span-4 xl:col-span-4 h-full flex flex-col'>
          <QRPresenceCard
            config={data.qrConfig}
            onGenerateNewToken={() => refetch()}
            onOpenManualAttendance={() => setIsManualAttendanceModalOpen(true)}
            className='h-full'
          />
        </div>

        {/* Right Column: Full Attendance Table Card with Toolbar Clock, Sync & MoreVert Menu */}
        <div className='lg:col-span-8 xl:col-span-8 h-full flex flex-col min-h-0'>
          <AttendanceTableCard
            records={data.records}
            total={data.total}
            page={data.page}
            limit={data.limit}
            totalPages={data.totalPages}
            params={params}
            onFilterChange={handleFilterChange}
            onResetFilter={handleResetFilter}
            headerExtra={
              <div className='flex items-center gap-1.5'>
                {/* 1. Icon-base Sync Button with Tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={() => {
                        refetch();
                        toast.success('Data presensi diperbarui.');
                      }}
                      className='size-8 rounded-md bg-background border-border/70 text-muted-foreground hover:text-foreground shadow-2xs'
                    >
                      <Icons.refresh className='size-3.5' />
                      <span className='sr-only'>Segarkan Data Real-Time</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='bottom' className='text-xs font-medium'>
                    Segarkan Data Real-Time
                  </TooltipContent>
                </Tooltip>

                {/* 2. MoreVert Dropdown Menu with Tooltip */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='size-8 rounded-md bg-background border-border/70 text-muted-foreground hover:text-foreground shadow-2xs'
                        >
                          <Icons.ellipsis className='size-3.5' />
                          <span className='sr-only'>Opsi Panel Live</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='text-xs font-medium'>
                      Opsi Panel Live
                    </TooltipContent>
                  </Tooltip>

                  <DropdownMenuContent align='end' className='w-56 font-sans text-xs'>
                    {/* Fullscreen Toggle */}
                    <DropdownMenuItem
                      onClick={toggleFullscreen}
                      className='gap-2 py-2 cursor-pointer font-medium'
                    >
                      <Icons.media className='size-3.5 text-primary' />
                      <span>
                        {isFullscreen ? 'Keluar Mode Layar Penuh' : 'Mode Layar Penuh (Kiosk)'}
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Tutup Panel Live */}
                    <DropdownMenuItem
                      onClick={handleClosePanel}
                      variant='destructive'
                      className='gap-2 py-2 cursor-pointer font-medium'
                    >
                      <Icons.close className='size-3.5' />
                      <span>Tutup Panel Live</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
            className='h-full'
          />
        </div>
      </main>

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={isManualAttendanceModalOpen}
        onClose={() => setIsManualAttendanceModalOpen(false)}
      />
    </div>
  );
}
