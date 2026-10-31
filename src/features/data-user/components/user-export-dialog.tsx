'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { userService } from '../api/service';
import type { DriverMetadata } from '../api/types';

export interface UserExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: DriverMetadata[];
}

export function UserExportDialog({ isOpen, onClose, drivers }: UserExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await userService.exportUsers(selectedFormat);
      const driver = drivers.find((d) => d.format === selectedFormat);
      const ext = driver?.extension || `.${selectedFormat}`;
      const filename = `amanah_users_backup_${new Date().toISOString().slice(0, 10)}${ext}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Data pengguna berhasil diekspor (${driver?.displayName || selectedFormat}).`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengekspor data pengguna.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-2 text-primary'>
            <Icons.upload className='size-5' />
            <DialogTitle className='text-base font-semibold'>
              Ekspor Cadangan Data Pengguna
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs pt-1'>
            Pilih driver format berkas cadangan pengguna. Seluruh populasi pengguna akan dicadangkan
            tanpa mempedulikan filter tampilan tabel aktif.
          </DialogDescription>
        </DialogHeader>

        <div className='py-3'>
          <RadioGroup
            value={selectedFormat}
            onValueChange={setSelectedFormat}
            className='space-y-2.5'
          >
            {drivers.map((d) => (
              <Label
                key={d.format}
                htmlFor={`format-${d.format}`}
                className='flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer transition-colors'
              >
                <RadioGroupItem value={d.format} id={`format-${d.format}`} className='mt-0.5' />
                <div className='space-y-0.5 flex-1'>
                  <span className='font-semibold text-xs text-foreground block'>
                    {d.displayName}
                  </span>
                  <p className='text-[11px] text-muted-foreground leading-snug'>{d.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={onClose} disabled={isExporting}>
            Batal
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className='gap-1.5 cursor-pointer shadow-xs'
          >
            {isExporting ? (
              <>
                <Icons.spinner className='size-4 animate-spin' />
                <span>Mengekspor...</span>
              </>
            ) : (
              <>
                <Icons.download className='size-4' />
                <span>Unduh Cadangan</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
