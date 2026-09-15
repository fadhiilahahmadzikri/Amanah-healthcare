'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useAttendanceLiveView } from '../model/useAttendanceLiveView';
import { AttendanceTableCard } from './attendance-table-card';
import { ManualAttendanceModal } from './manual-attendance-modal';
import { QRPresenceCard } from './qr-presence-card';

export function KehadiranLiveView() {
  const attendanceLive = useAttendanceLiveView();
  const { data } = attendanceLive;

  const handleResetFilter = () => {
    attendanceLive.actions.resetFilter();
    toast.info('Filter presensi telah direset.');
  };

  const handleRefreshData = () => {
    attendanceLive.actions.refreshData();
    toast.success('Sinkronisasi data presensi real-time berhasil.');
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
            onGenerateNewToken={attendanceLive.actions.generateNewToken}
            onOpenManualAttendance={attendanceLive.actions.openManualAttendance}
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
            params={attendanceLive.params}
            onFilterChange={attendanceLive.actions.changeFilter}
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
                      onClick={handleRefreshData}
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
                      onClick={attendanceLive.actions.toggleFullscreen}
                      className='gap-2 py-2 cursor-pointer font-medium'
                    >
                      <Icons.media className='size-3.5 text-primary' />
                      <span>
                        {attendanceLive.isFullscreen
                          ? 'Keluar Mode Layar Penuh'
                          : 'Mode Layar Penuh (Kiosk)'}
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Tutup Panel Live */}
                    <DropdownMenuItem
                      onClick={attendanceLive.actions.closePanel}
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
        isOpen={attendanceLive.isManualAttendanceModalOpen}
        onClose={attendanceLive.actions.closeManualAttendance}
      />
    </div>
  );
}
