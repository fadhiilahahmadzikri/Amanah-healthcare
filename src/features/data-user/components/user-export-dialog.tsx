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
      <DialogContent className='max-w-md rounded-2xl border border-border shadow-2xl'>
        <DialogHeader className='text-left pb-3 border-b border-border/40'>
          <DialogTitle className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
            Ekspor Cadangan Data Pengguna
          </DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground pt-1'>
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

        <DialogFooter className='shrink-0 pt-3.5 border-t border-border/40 flex flex-row items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='card-action'
            shape='pill'
            className='px-5 font-semibold cursor-pointer'
            onClick={onClose}
            disabled={isExporting}
          >
            Batal
          </Button>
          <Button
            type='button'
            variant='default'
            size='card-action'
            shape='pill'
            withTrailingCircleIcon
            disabled={isExporting}
            onClick={handleExport}
            className='font-bold shadow-2xs cursor-pointer'
          >
            {isExporting ? (
              <span className='inline-flex items-center gap-1.5'>
                <Icons.spinner className='size-3.5 animate-spin' />
                Mengekspor...
              </span>
            ) : (
              'Unduh Cadangan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
