'use client';

import React, { useState } from 'react';
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
import type { AdminAppointment } from '../../api/types';
import { callPatient } from '../../api/service';
import { appointmentKeys } from '../../api/queries';
import { AppointmentRecordModal } from '../appointment-record-modal';
import { AppointmentDetailOrganism } from '@/features/klinik/components/details-modal';
import { adminAppointmentToAppointment } from '../../api/mapper';
import { AppointmentStatusModal } from '../appointment-status-modal';
import { AppointmentCheckInQrModal } from '../appointment-check-in-qr-modal';
import { ChangeDoctorModal } from '../change-doctor-modal';
import { ChangeRoomModal } from '../change-room-modal';

interface CellActionProps {
  data: AdminAppointment;
}

export function CellAction({ data }: CellActionProps) {
  const queryClient = useQueryClient();
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [changeDoctorOpen, setChangeDoctorOpen] = useState(false);
  const [changeRoomOpen, setChangeRoomOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const canCall = Boolean(data.allowedActions?.includes('CALL'));
  const canCheckIn =
    Boolean(data.doctorName) &&
    data.status !== APPOINTMENT_STATUS.LATE &&
    Boolean(data.allowedActions?.includes('CHECK_IN'));

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
    <>
      <AppointmentRecordModal
        isOpen={milestoneOpen}
        appointment={data}
        onClose={() => setMilestoneOpen(false)}
        onViewPatientDetail={() => setDetailOpen(true)}
        onUpdateStatus={() => setStatusOpen(true)}
        onChangeDoctor={() => setChangeDoctorOpen(true)}
        onChangeRoom={() => setChangeRoomOpen(true)}
        onQrCheckIn={() => setQrOpen(true)}
      />
      <AppointmentDetailOrganism
        appointment={adminAppointmentToAppointment(data)}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
      <AppointmentStatusModal
        appointment={data}
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
      />
      <AppointmentCheckInQrModal
        appointment={data}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
      />
      <ChangeDoctorModal
        isOpen={changeDoctorOpen}
        appointmentId={String(data.id)}
        patientName={data.patientName}
        patientId={data.patientId}
        queueNumber={data.queueNumber}
        currentDoctorName={data.doctorName || undefined}
        appointmentDate={data.scheduledDate}
        appointmentTime={data.etaRange || data.scheduledStartTime}
        onClose={() => setChangeDoctorOpen(false)}
        onSuccess={() => {
          setChangeDoctorOpen(false);
          queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        }}
      />
      <ChangeRoomModal
        isOpen={changeRoomOpen}
        appointmentId={String(data.id)}
        patientName={data.patientName}
        patientId={data.patientId}
        queueNumber={data.queueNumber}
        currentRoomName={data.roomName || undefined}
        appointmentDate={data.scheduledDate}
        appointmentTime={data.etaRange || data.scheduledStartTime}
        onClose={() => setChangeRoomOpen(false)}
        onSuccess={() => {
          setChangeRoomOpen(false);
          queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        }}
      />

      <div className='flex items-center gap-1'>
        {canCheckIn && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='size-8 text-primary hover:text-primary hover:bg-primary/10 rounded-md transition-colors'
                onClick={(e) => {
                  e.stopPropagation();
                  setQrOpen(true);
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors'
              onClick={(e) => {
                e.stopPropagation();
                setMilestoneOpen(true);
              }}
            >
              <Icons.eye className='size-4' />
              <span className='sr-only'>Lihat Riwayat & Detail</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Lihat Riwayat & Detail
          </TooltipContent>
        </Tooltip>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors'
              onClick={(e) => e.stopPropagation()}
            >
              <Icons.ellipsis className='size-4' />
              <span className='sr-only'>Menu Aksi</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-44 text-xs font-medium'>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setChangeDoctorOpen(true);
              }}
              className='cursor-pointer text-xs gap-2'
            >
              <Icons.userCheck className='size-3.5 text-muted-foreground' />
              <span>{data.doctorName ? 'Ganti Dokter' : 'Tugaskan Dokter'}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setChangeRoomOpen(true);
              }}
              className='cursor-pointer text-xs gap-2'
            >
              <Icons.mapPin className='size-3.5 text-muted-foreground' />
              <span>{data.roomName ? 'Ganti Ruangan' : 'Tugaskan Ruangan'}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setStatusOpen(true);
              }}
              className='cursor-pointer text-xs gap-2'
            >
              <Icons.refresh className='size-3.5 text-muted-foreground' />
              <span>Update Status</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
