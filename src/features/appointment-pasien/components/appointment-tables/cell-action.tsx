'use client';

import React, { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { isAppointmentTerminal } from '../../constants/options';
import type { AdminAppointment } from '../../api/types';
import { callPatient } from '../../api/service';
import { appointmentKeys } from '../../api/queries';

export interface AppointmentTableMeta {
  onAssignDoctor?: (item: AdminAppointment) => void;
  onAssignRoom?: (item: AdminAppointment) => void;
  onUpdateStatus?: (item: AdminAppointment) => void;
  onQrCheckIn?: (item: AdminAppointment) => void;
  onReschedule?: (item: AdminAppointment) => void;
  onViewDetail?: (item: AdminAppointment) => void;
  onViewMilestone?: (item: AdminAppointment) => void;
  onCallPatient?: (item: AdminAppointment) => Promise<void> | void;
}

export interface CellActionProps {
  data: AdminAppointment;
  table?: Table<AdminAppointment>;
  onAssignDoctor?: (item: AdminAppointment) => void;
  onAssignRoom?: (item: AdminAppointment) => void;
  onUpdateStatus?: (item: AdminAppointment) => void;
  onQrCheckIn?: (item: AdminAppointment) => void;
  onReschedule?: (item: AdminAppointment) => void;
  onViewDetail?: (item: AdminAppointment) => void;
  onViewMilestone?: (item: AdminAppointment) => void;
}

export function CellAction({
  data,
  table,
  onAssignDoctor: propOnAssignDoctor,
  onAssignRoom: propOnAssignRoom,
  onUpdateStatus: propOnUpdateStatus,
  onQrCheckIn: propOnQrCheckIn,
  onReschedule: propOnReschedule,
  onViewDetail: propOnViewDetail,
  onViewMilestone: propOnViewMilestone
}: CellActionProps) {
  const queryClient = useQueryClient();
  const [isCalling, setIsCalling] = useState(false);

  const meta = table?.options.meta as AppointmentTableMeta | undefined;
  const onAssignDoctor = propOnAssignDoctor ?? meta?.onAssignDoctor;
  const onAssignRoom = propOnAssignRoom ?? meta?.onAssignRoom;
  const onUpdateStatus = propOnUpdateStatus ?? meta?.onUpdateStatus;
  const onQrCheckIn = propOnQrCheckIn ?? meta?.onQrCheckIn;
  const onReschedule = propOnReschedule ?? meta?.onReschedule;
  const onViewDetail = propOnViewDetail ?? meta?.onViewDetail;
  const onViewMilestone = propOnViewMilestone ?? meta?.onViewMilestone;

  const isTerminal = isAppointmentTerminal(data.status);
  const canCall = Boolean(data.allowedActions?.includes('CALL'));
  const canCheckIn = Boolean(data.allowedActions?.includes('CHECK_IN'));
  const canReassign = !isTerminal;
  const canUpdateStatus =
    Boolean(data.allowedActions?.includes('START_SERVICE')) ||
    Boolean(data.allowedActions?.includes('COMPLETE'));
  const canReschedule = Boolean(data.allowedActions?.includes('RESCHEDULE'));
  const canCancel = Boolean(data.allowedActions?.includes('CANCEL'));

  const handleCallPatient = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCalling) return;
    setIsCalling(true);
    try {
      await callPatient(data.id);
      await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success(`Pasien dipanggil: Nomor antrean ${data.queueNumber}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal memanggil pasien: ${message}`);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className='flex items-center gap-1 select-none'>
      {canCheckIn && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-primary hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                onQrCheckIn?.(data);
              }}
            >
              <Icons.qrCode className='size-4' />
              <span className='sr-only'>QR Check-In</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            QR Check-In Pasien
          </TooltipContent>
        </Tooltip>
      )}

      {data.status === APPOINTMENT_STATUS.WAITING && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant='ghost'
                size='icon'
                disabled={!canCall || isCalling}
                className={`size-8 rounded-md transition-colors ${
                  canCall
                    ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer'
                    : 'text-muted-foreground/30 cursor-not-allowed opacity-40 hover:bg-transparent'
                }`}
                onClick={canCall ? handleCallPatient : undefined}
              >
                {isCalling ? (
                  <Icons.spinner className='size-4 animate-spin' />
                ) : (
                  <Icons.phone className='size-4' />
                )}
                <span className='sr-only'>Panggil Pasien</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            {canCall
              ? 'Panggil Pasien'
              : 'Menunggu giliran (antrean sebelumnya masih menunggu)'}
          </TooltipContent>
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer'
            onClick={(e) => e.stopPropagation()}
          >
            <Icons.ellipsis className='size-4' />
            <span className='sr-only'>Menu Aksi</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44 text-xs font-medium'>
          {canReassign && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onAssignDoctor?.(data);
              }}
              className='cursor-pointer text-xs gap-2'
            >
              <Icons.userCheck className='size-3.5 text-muted-foreground' />
              <span>{data.doctorName ? 'Ganti Dokter' : 'Tugaskan Dokter'}</span>
            </DropdownMenuItem>
          )}

          {canReassign && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onAssignRoom?.(data);
              }}
              className='cursor-pointer text-xs gap-2'
            >
              <Icons.mapPin className='size-3.5 text-muted-foreground' />
              <span>{data.roomName ? 'Ganti Ruangan' : 'Tugaskan Ruangan'}</span>
            </DropdownMenuItem>
          )}

          {canUpdateStatus && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onUpdateStatus?.(data);
              }}
              className='cursor-pointer text-xs gap-2'
            >
              <Icons.refresh className='size-3.5 text-muted-foreground' />
              <span>Update Status</span>
            </DropdownMenuItem>
          )}

          {canReschedule && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onReschedule?.(data);
              }}
              className='cursor-pointer text-xs gap-2'
            >
              <Icons.calendar className='size-3.5 text-muted-foreground' />
              <span>Jadwalkan Ulang</span>
            </DropdownMenuItem>
          )}

          {canCancel && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onViewDetail?.(data);
              }}
              className='cursor-pointer text-xs gap-2 text-destructive focus:text-destructive'
            >
              <Icons.trash className='size-3.5 text-destructive' />
              <span>Batalkan Janji Temu</span>
            </DropdownMenuItem>
          )}

          {isTerminal && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onViewMilestone?.(data);
              }}
              className='cursor-pointer text-xs gap-2 text-muted-foreground'
            >
              <Icons.eye className='size-3.5 text-muted-foreground' />
              <span>Lihat Riwayat Saja</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
