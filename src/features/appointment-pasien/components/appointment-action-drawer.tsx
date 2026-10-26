'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import { isAppointmentTerminal } from '../constants/options';
import type { AdminAppointment } from '../api/types';
import { callPatient } from '../api/service';
import { useQueryClient } from '@tanstack/react-query';
import { appointmentKeys } from '../api/queries';

export interface AppointmentActionDrawerProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
  onAssignDoctor?: (item: AdminAppointment) => void;
  onAssignRoom?: (item: AdminAppointment) => void;
  onUpdateStatus?: (item: AdminAppointment) => void;
  onQrCheckIn?: (item: AdminAppointment) => void;
  onReschedule?: (item: AdminAppointment) => void;
  onViewRecord?: (item: AdminAppointment) => void;
  onViewTimeline?: (item: AdminAppointment) => void;
  onViewPatientDetail?: (item: AdminAppointment) => void;
  onCancel?: (item: AdminAppointment) => void;
}

export function AppointmentActionDrawer({
  isOpen,
  appointment,
  onClose,
  onAssignDoctor,
  onAssignRoom,
  onUpdateStatus,
  onQrCheckIn,
  onReschedule,
  onViewRecord,
  onViewTimeline,
  onViewPatientDetail,
  onCancel
}: AppointmentActionDrawerProps) {
  const queryClient = useQueryClient();
  const [isCalling, setIsCalling] = useState(false);

  if (!appointment) return null;

  const isTerminal = isAppointmentTerminal(appointment.status);
  const { canCall, canCheckIn, canUpdateStatus, canReschedule, canCancel } =
    appointment.capabilities;
  const canReassign = !isTerminal;

  const handleCall = async () => {
    if (isCalling) return;
    setIsCalling(true);
    try {
      await callPatient(appointment.id);
      await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success(`Pasien dipanggil: Nomor antrean ${appointment.queueNumber}`);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal memanggil pasien: ${message}`);
    } finally {
      setIsCalling(false);
    }
  };

  const executeAction = (actionFn?: (item: AdminAppointment) => void) => {
    onClose();
    if (actionFn && appointment) {
      actionFn(appointment);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className='max-h-[85vh] font-sans z-[60]' overlayClassName='z-[60]'>
        {/* Header Drawer dengan Natural Wording Subtitle (Tanpa Separator Titik) */}
        <DrawerHeader className='text-left pb-2.5 border-b border-border/40'>
          <div className='flex flex-col min-w-0 space-y-0.5'>
            <DrawerTitle className='text-base font-bold truncate tracking-tight text-foreground'>
              {appointment.patientName}
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground truncate'>
              Antrean{' '}
              <span className='font-mono font-bold text-primary'>{appointment.queueNumber}</span>
              {appointment.poliklinikName ? ` di ${appointment.poliklinikName}` : ''}
              {appointment.layananName ? ` • ${appointment.layananName}` : ''}
            </DrawerDescription>
          </div>
        </DrawerHeader>

        {/* 3-Column Grid Actions */}
        <div className='p-4 pt-3 max-h-[55vh] overflow-y-auto select-none'>
          <div className='grid grid-cols-3 gap-2.5'>
            {/* 1. Panggil Pasien */}
            {canCall && (
              <button
                type='button'
                disabled={isCalling}
                onClick={handleCall}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform'>
                  {isCalling ? (
                    <Icons.spinner className='size-5 animate-spin text-amber-600' />
                  ) : (
                    <Icons.phone className='size-5 text-amber-600 dark:text-amber-400' />
                  )}
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Panggil Pasien</span>
              </button>
            )}

            {/* 2. Detail Janji Temu */}
            {onViewRecord && (
              <button
                type='button'
                onClick={() => executeAction(onViewRecord)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.forms className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Detail Record</span>
              </button>
            )}

            {/* 3. Lihat Pasien */}
            {onViewPatientDetail && (
              <button
                type='button'
                onClick={() => executeAction(onViewPatientDetail)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.user className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Lihat Pasien</span>
              </button>
            )}

            {/* 4. Garis Waktu Operasional */}
            {onViewTimeline && (
              <button
                type='button'
                onClick={() => executeAction(onViewTimeline)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.history className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Garis Waktu</span>
              </button>
            )}

            {/* 5. QR Code Check-In */}
            {canCheckIn && (
              <button
                type='button'
                onClick={() => executeAction(onQrCheckIn)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.qrCode className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>QR Check-In</span>
              </button>
            )}

            {/* 6. Update Status */}
            {canUpdateStatus && (
              <button
                type='button'
                onClick={() => executeAction(onUpdateStatus)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.refresh className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Update Status</span>
              </button>
            )}

            {/* 7. Tugaskan / Ganti Dokter */}
            {canReassign && (
              <button
                type='button'
                onClick={() => executeAction(onAssignDoctor)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.userCheck className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>
                  {appointment.doctorName ? 'Ganti Dokter' : 'Tugaskan Dokter'}
                </span>
              </button>
            )}

            {/* 8. Tugaskan / Ganti Ruangan */}
            {canReassign && (
              <button
                type='button'
                onClick={() => executeAction(onAssignRoom)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.mapPin className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>
                  {appointment.roomName ? 'Ganti Ruangan' : 'Tugaskan Ruang'}
                </span>
              </button>
            )}

            {/* 9. Jadwalkan Ulang */}
            {canReschedule && (
              <button
                type='button'
                onClick={() => executeAction(onReschedule)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.calendar className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Jadwal Ulang</span>
              </button>
            )}

            {/* 10. Batalkan Janji Temu */}
            {canCancel && (
              <button
                type='button'
                onClick={() => executeAction(onCancel)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.trash className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Batalkan</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer dengan Standarisasi size='card-action' and shape='pill' */}
        <DrawerFooter className='pt-2 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            size='card-action'
            shape='pill'
            onClick={onClose}
            className='w-full font-semibold text-xs'
          >
            Tutup
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
