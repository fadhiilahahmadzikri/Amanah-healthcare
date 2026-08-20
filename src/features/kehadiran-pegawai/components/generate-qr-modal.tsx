'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useUpdateQRConfigMutation } from '../api/mutations';
import type { QRPresenceConfig } from '../api/types';

export interface GenerateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QRPresenceConfig;
  onActivated?: () => void;
}

export function GenerateQRModal({ isOpen, onClose, config, onActivated }: GenerateQRModalProps) {
  const updateConfigMutation = useUpdateQRConfigMutation();

  const [shift, setShift] = useState(config.qr_context || 'Shift Pagi');
  const [statusPresensi, setStatusPresensi] = useState(
    config.status_presensi || 'Aktif hingga 16:00 WIB'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate fresh token code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newIdentifier = '';
    for (let i = 0; i < 6; i++) {
      newIdentifier += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    updateConfigMutation.mutate(
      {
        qr_context: shift,
        status_presensi: statusPresensi,
        qr_code_identifier: newIdentifier
      },
      {
        onSuccess: () => {
          onActivated?.();
          onClose();
        }
      }
    );
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[480px]'
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        {/* Header */}
        <div className='pb-3 border-b border-border/40'>
          <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
            Generate QR Presensi Pegawai
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Konfigurasi shift dan batas waktu untuk mengaktifkan sesi presensi kehadiran.
          </p>
        </div>

        {/* Form Fields (Identifier Token dihapus sesuai instruksi) */}
        <div className='space-y-3.5 py-1'>
          {/* Shift */}
          <div>
            <span className='text-xs font-normal text-muted-foreground/80 block mb-1.5'>
              Shift Kerja
            </span>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger className='h-9 text-xs'>
                <SelectValue placeholder='Pilih shift' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Shift Pagi'>Shift Pagi (08:00 - 16:00 WIB)</SelectItem>
                <SelectItem value='Shift Siang'>Shift Siang (14:00 - 21:00 WIB)</SelectItem>
                <SelectItem value='Shift Malam'>Shift Malam (21:00 - 08:00 WIB)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Presensi */}
          <div>
            <span className='text-xs font-normal text-muted-foreground/80 block mb-1.5'>
              Status & Batas Waktu Presensi
            </span>
            <Input
              value={statusPresensi}
              onChange={(e) => setStatusPresensi(e.target.value)}
              placeholder='Contoh: Aktif hingga 16:00 WIB'
              className='h-9 text-xs'
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='pt-3 border-t border-border/40 flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-6 font-medium text-xs sm:text-sm'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='default'
            disabled={updateConfigMutation.isPending}
            className='px-7 font-semibold text-xs sm:text-sm'
          >
            {updateConfigMutation.isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            Simpan & Aktifkan QR
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
