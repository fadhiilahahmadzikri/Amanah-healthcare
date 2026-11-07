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
import { IconArrowBackUp } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { isAppointmentTerminal } from '../../constants/options';
import type { AdminAppointment } from '../../api/types';
import { callPatient, noShowPatient, revertAppointmentProposal } from '../../api/service';
import { appointmentKeys } from '../../api/queries';

export interface AppointmentTableMeta {
  onAssignDoctor?: (item: AdminAppointment) => void;
  onAssignRoom?: (item: AdminAppointment) => void;
  onUpdateStatus?: (item: AdminAppointment) => void;
  onQrCheckIn?: (item: AdminAppointment) => void;
  onReschedule?: (item: AdminAppointment) => void;
  onCancel?: (item: AdminAppointment) => void;
  onViewDetail?: (item: AdminAppointment) => void;
  onViewPatientDetail?: (item: AdminAppointment) => void;
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
  onCancel?: (item: AdminAppointment) => void;
  onViewDetail?: (item: AdminAppointment) => void;
  onViewPatientDetail?: (item: AdminAppointment) => void;
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
  onCancel: propOnCancel,
  onViewDetail: propOnViewDetail,
  onViewPatientDetail: propOnViewPatientDetail,
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
  const onCancel = propOnCancel ?? meta?.onCancel;
  const onViewDetail = propOnViewDetail ?? meta?.onViewDetail;
  const onViewPatientDetail = propOnViewPatientDetail ?? meta?.onViewPatientDetail;
  const onViewMilestone = propOnViewMilestone ?? meta?.onViewMilestone;

  const isTerminal = isAppointmentTerminal(data.status);
  const { canCall, canCheckIn, canUpdateStatus, canReschedule, canCancel } = data.capabilities;
  const canReassign = !isTerminal;

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
            {canCall ? 'Panggil Pasien' : 'Menunggu giliran (antrean sebelumnya masih menunggu)'}
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
        <DropdownMenuContent align='end' className='w-48 text-xs font-medium'>
          {onViewPatientDetail && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onViewPatientDetail(data);
              }}
              className='cursor-pointer text-xs gap-2'
            >
              <Icons.user className='size-3.5 text-primary' />
              <span>Lihat Pasien</span>
            </DropdownMenuItem>
          )}

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

          {canCall && (
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                try {
                  const res = await noShowPatient(data.id);
                  await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
                  if (res.noShow) {
                    toast.warning(
                      `Nomor antrean ${data.queueNumber} ditandai Tidak Hadir (No-Show).`
                    );
                  } else if (res.requeued) {
                    toast.info(
                      `Nomor antrean ${data.queueNumber} digeser ke belakang (Panggilan ke-${res.attemptNumber}). Sisa kesempatan: ${res.remainingAttempts ?? 0} kali.`
                    );
                  } else {
                    toast.success('Berhasil memperbarui antrean');
                  }
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : String(err);
                  toast.error(`Gagal memproses lewati antrean: ${message}`);
                }
              }}
              className='cursor-pointer text-xs gap-2 text-rose-600 focus:text-rose-600'
            >
              <Icons.userX className='size-3.5 text-rose-600' />
              <span>Lewati (No-Show)</span>
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
                if (onCancel) {
                  onCancel(data);
                } else {
                  onViewDetail?.(data);
                }
              }}
              className='cursor-pointer text-xs gap-2 text-destructive focus:text-destructive'
            >
              <Icons.alertCircle className='size-3.5 text-destructive' />
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

          {data.hasSettledProposal && (
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                try {
                  const res = await revertAppointmentProposal(data.id);
                  if (res.success) {
                    toast.success('Persetujuan berhasil ditarik (revert).');
                    await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
                  } else {
                    toast.error(res.message || 'Gagal menarik persetujuan');
                  }
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Gagal menarik persetujuan');
                }
              }}
              className='cursor-pointer text-xs gap-2 text-amber-600 focus:text-amber-600'
            >
              <IconArrowBackUp className='size-3.5 text-amber-600' />
              <span>Tarik Perubahan (Revert)</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
