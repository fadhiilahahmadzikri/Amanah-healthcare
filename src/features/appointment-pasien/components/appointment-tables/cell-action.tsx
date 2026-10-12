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
import { isAppointmentBooked, isAppointmentTerminal } from '../../constants/options';
import type { AdminAppointment } from '../../api/types';
import { callPatient, cancelAppointmentAction } from '../../api/service';
import { appointmentKeys } from '../../api/queries';
import { AppointmentRecordModal } from '../appointment-record-modal';
import { AppointmentDetailOrganism } from '@/features/klinik/components/details-modal';
import { adminAppointmentToAppointment } from '../../api/mapper';
import { AppointmentStatusModal } from '../appointment-status-modal';
import { AppointmentCheckInQrModal } from '../appointment-check-in-qr-modal';
import { ChangeDoctorModal } from '../change-doctor-modal';
import { ChangeRoomModal } from '../change-room-modal';
import { RescheduleAppointmentModal } from '../reschedule-appointment-modal';

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
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const isTerminal = isAppointmentTerminal(data.status);
  const isBooked = isAppointmentBooked(data.status);
  const hasAssignments = Boolean(data.doctorName && data.roomName);
  const canCall = Boolean(data.allowedActions?.includes('CALL'));
  const canCheckIn = Boolean(data.allowedActions?.includes('CHECK_IN'));
  const canReassign = !isTerminal;
  const canUpdateStatus = !isTerminal && (!isBooked || hasAssignments);
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
    <>
      <AppointmentRecordModal
        isOpen={milestoneOpen}
        appointment={data}
        onClose={() => setMilestoneOpen(false)}
        onViewPatientDetail={() => {
          setMilestoneOpen(false);
          setDetailOpen(true);
        }}
        onUpdateStatus={() => {
          setMilestoneOpen(false);
          setStatusOpen(true);
        }}
        onChangeDoctor={() => {
          setMilestoneOpen(false);
          setChangeDoctorOpen(true);
        }}
        onChangeRoom={() => {
          setMilestoneOpen(false);
          setChangeRoomOpen(true);
        }}
        onQrCheckIn={() => {
          setMilestoneOpen(false);
          setQrOpen(true);
        }}
        onReschedule={() => {
          setMilestoneOpen(false);
          setRescheduleOpen(true);
        }}
        onCancel={() => {
          setMilestoneOpen(false);
          setDetailOpen(true);
        }}
      />
      <AppointmentDetailOrganism
        appointment={adminAppointmentToAppointment(data)}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onCancel={async (_apt, reason) => {
          await cancelAppointmentAction(data.id, reason);
          await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
          toast.success('Janji temu berhasil dibatalkan');
          setDetailOpen(false);
        }}
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
            {canReassign && (
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
            )}

            {canReassign && (
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
            )}

            {canUpdateStatus && (
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
            )}

            {canReschedule && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setRescheduleOpen(true);
                }}
                className='cursor-pointer text-xs gap-2'
              >
                <Icons.calendar className='size-3.5 text-muted-foreground' />
                <span>Jadwalkan Ulang</span>
              </DropdownMenuItem>
            )}

            {canCancel && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailOpen(true);
                }}
                className='cursor-pointer text-xs gap-2 text-destructive focus:text-destructive'
              >
                <Icons.trash className='size-3.5 text-destructive' />
                <span>Batalkan Janji Temu</span>
              </DropdownMenuItem>
            )}

            {isTerminal && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setMilestoneOpen(true);
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

      <RescheduleAppointmentModal
        isOpen={rescheduleOpen}
        appointmentId={String(data.id)}
        patientName={data.patientName}
        queueNumber={data.queueNumber}
        serviceName={data.layananName || data.poliklinikName}
        poliklinikId={data.layananId || undefined}
        currentDate={data.scheduledDate}
        currentSession={data.session || data.sessionName || undefined}
        onClose={() => setRescheduleOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        }}
      />
    </>
  );
}
