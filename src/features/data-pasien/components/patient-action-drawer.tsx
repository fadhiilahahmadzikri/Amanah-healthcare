'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Patient } from '../api/types';

export interface PatientActionDrawerProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onViewDetail?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onViewHistory?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
}

export function PatientActionDrawer({
  isOpen,
  patient,
  onClose,
  onViewDetail,
  onEdit,
  onViewHistory,
  onDelete,
}: PatientActionDrawerProps) {
  if (!patient) return null;

  const executeAction = (actionFn?: (p: Patient) => void) => {
    onClose();
    if (actionFn && patient) {
      actionFn(patient);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className='max-h-[85vh] font-sans z-[60]' overlayClassName='z-[60]'>
        <DrawerHeader className='text-left pb-2.5 border-b border-border/40'>
          <div className='flex items-center justify-between gap-2 min-w-0'>
            <div className='flex flex-col min-w-0 space-y-0.5'>
              <DrawerTitle className='text-base font-bold truncate tracking-tight text-foreground'>
                {patient.name}
              </DrawerTitle>
              <DrawerDescription className='text-xs text-muted-foreground truncate'>
                No. RM: <span className='font-mono font-medium text-foreground'>{patient.patient_id}</span>
                {patient.nik ? ` • NIK: ${patient.masked_nik || patient.nik}` : ''}
              </DrawerDescription>
            </div>
            <StatusBadge
              status={patient.is_master ? 'Akun Utama' : 'Afiliasi'}
              size='sm'
            />
          </div>
        </DrawerHeader>

        <div className='p-4 pt-3 max-h-[55vh] overflow-y-auto select-none'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
            {/* 1. Detail Pasien */}
            {onViewDetail && (
              <button
                type='button'
                onClick={() => executeAction(onViewDetail)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.eye className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Lihat Detail</span>
              </button>
            )}

            {/* 2. Edit Pasien */}
            {onEdit && (
              <button
                type='button'
                onClick={() => executeAction(onEdit)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-muted text-foreground flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.edit className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Ubah Data</span>
              </button>
            )}

            {/* 3. Garis Waktu Riwayat Janji Temu */}
            {onViewHistory && (
              <button
                type='button'
                onClick={() => executeAction(onViewHistory)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.history className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Riwayat Medis</span>
              </button>
            )}

            {/* 4. Hapus / Nonaktifkan */}
            {onDelete && (
              <button
                type='button'
                onClick={() => executeAction(onDelete)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.trash className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Nonaktifkan</span>
              </button>
            )}
          </div>
        </div>

        <DrawerFooter className='pt-2 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            size='card-action'
            shape='pill'
            onClick={onClose}
            className='w-full font-semibold text-xs cursor-pointer'
          >
            Tutup
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
