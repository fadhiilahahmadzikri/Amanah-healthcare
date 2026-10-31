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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { userService } from '../api/service';
import type { DriverMetadata, RestorePreviewResponse } from '../api/types';
import { useRestoreExecuteMutation } from '../api/mutations';

export interface UserRestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: DriverMetadata[];
}

export function UserRestoreDialog({ isOpen, onClose, drivers }: UserRestoreDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [preview, setPreview] = useState<RestorePreviewResponse | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update'>('skip');

  const restoreMutation = useRestoreExecuteMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPreview(null);

    // Auto-detect format from extension
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const matchedDriver = drivers.find((d) => d.extension === ext);
    if (matchedDriver) {
      setSelectedFormat(matchedDriver.format);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text || '');
    };
    reader.readAsText(file);
  };

  const handleValidatePreview = async () => {
    if (!fileContent) {
      toast.error('Silakan pilih berkas cadangan terlebih dahulu.');
      return;
    }

    try {
      setIsValidating(true);
      const res = await userService.previewRestore(selectedFormat, fileContent);
      setPreview(res);
      if (!res.valid && res.errors.length > 0) {
        toast.error(`Validasi gagal: ${res.errors[0]}`);
      } else {
        toast.success(`Validasi berhasil: ${res.totalRecords} data terbaca.`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal memvalidasi berkas cadangan.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleExecuteRestore = () => {
    if (!fileContent || !preview) return;

    restoreMutation.mutate(
      {
        format: selectedFormat,
        fileContent,
        duplicateStrategy
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        }
      }
    );
  };

  const resetForm = () => {
    setFileContent('');
    setFileName('');
    setPreview(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <div className='flex items-center gap-2 text-primary'>
            <Icons.download className='size-5' />
            <DialogTitle className='text-base font-semibold'>
              Pulihkan Data Pengguna (Restore)
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs pt-1'>
            Unggah berkas cadangan (JSON, CSV, atau SQL). Sistem akan memvalidasi struktur data dan
            relasi peran sebelum mengeksekusi pemulihan.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2 text-xs'>
          {/* File Picker */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Pilih Berkas Cadangan</Label>
            <input
              type='file'
              accept='.json,.csv,.sql'
              onChange={handleFileChange}
              className='w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer border border-border/60 rounded-xl p-2'
            />
            {fileName && (
              <p className='text-[11px] text-muted-foreground'>
                Berkas terpilih: <span className='font-mono font-medium'>{fileName}</span>
              </p>
            )}
          </div>

          {/* Format Selector */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Driver Format Berkas</Label>
            <div className='flex items-center gap-2 flex-wrap'>
              {drivers
                .filter((d) => d.supportsRestore)
                .map((d) => (
                  <Button
                    key={d.format}
                    type='button'
                    variant={selectedFormat === d.format ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      setSelectedFormat(d.format);
                      setPreview(null);
                    }}
                    className='h-7 text-xs px-2.5 font-medium'
                  >
                    {d.format.toUpperCase()}
                  </Button>
                ))}
            </div>
          </div>

          {/* Validation Trigger */}
          {!preview && fileContent && (
            <Button
              type='button'
              onClick={handleValidatePreview}
              disabled={isValidating}
              className='w-full h-8 text-xs font-medium gap-1.5 cursor-pointer'
            >
              {isValidating ? (
                <>
                  <Icons.spinner className='size-3.5 animate-spin' />
                  <span>Memvalidasi Berkas...</span>
                </>
              ) : (
                <>
                  <Icons.check className='size-3.5' />
                  <span>Validasi & Pratinjau Berkas</span>
                </>
              )}
            </Button>
          )}

          {/* Preview Results */}
          {preview && (
            <div className='p-3.5 rounded-xl border border-border/70 bg-muted/30 space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='font-semibold text-xs text-foreground'>
                  Hasil Pratinjau Berkas:
                </span>
                <Badge
                  variant='outline'
                  className={
                    preview.valid
                      ? 'text-[10px] border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'text-[10px] border-destructive/40 text-destructive bg-destructive/10'
                  }
                >
                  {preview.valid ? 'Valid & Siap Dipulihkan' : 'Ada Ketidaksesuaian'}
                </Badge>
              </div>

              <div className='grid grid-cols-3 gap-2 text-center text-xs'>
                <div className='p-2 rounded-lg bg-background border border-border/50'>
                  <span className='text-[10px] text-muted-foreground block'>Baru</span>
                  <strong className='font-bold text-emerald-600 text-sm'>{preview.newCount}</strong>
                </div>
                <div className='p-2 rounded-lg bg-background border border-border/50'>
                  <span className='text-[10px] text-muted-foreground block'>Duplikat</span>
                  <strong className='font-bold text-amber-600 text-sm'>
                    {preview.duplicateCount}
                  </strong>
                </div>
                <div className='p-2 rounded-lg bg-background border border-border/50'>
                  <span className='text-[10px] text-muted-foreground block'>Gagal</span>
                  <strong className='font-bold text-destructive text-sm'>
                    {preview.invalidCount}
                  </strong>
                </div>
              </div>

              {preview.duplicateCount > 0 && (
                <div className='space-y-1.5 pt-1 border-t border-border/40'>
                  <Label className='text-[11px] font-semibold text-foreground'>
                    Kebijakan Akun Duplikat (Email Sama):
                  </Label>
                  <RadioGroup
                    value={duplicateStrategy}
                    onValueChange={(v: 'skip' | 'update') => setDuplicateStrategy(v)}
                    className='flex items-center gap-4 text-xs'
                  >
                    <Label className='flex items-center gap-1.5 cursor-pointer text-xs'>
                      <RadioGroupItem value='skip' id='strat-skip' />
                      <span>Lewati akun duplikat</span>
                    </Label>
                    <Label className='flex items-center gap-1.5 cursor-pointer text-xs'>
                      <RadioGroupItem value='update' id='strat-update' />
                      <span>Perbarui nama/telepon</span>
                    </Label>
                  </RadioGroup>
                </div>
              )}

              {preview.errors.length > 0 && (
                <div className='p-2 rounded-lg bg-destructive/10 text-destructive text-[11px] space-y-1'>
                  <span className='font-semibold'>Peringatan Validasi:</span>
                  <ul className='list-disc pl-4 space-y-0.5'>
                    {preview.errors.slice(0, 3).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {preview.errors.length > 3 && (
                      <li>...dan {preview.errors.length - 3} peringatan lainnya</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={handleClose} disabled={restoreMutation.isPending}>
            Batal
          </Button>
          <Button
            disabled={!preview || restoreMutation.isPending}
            onClick={handleExecuteRestore}
            className='gap-1.5 cursor-pointer shadow-xs'
          >
            {restoreMutation.isPending ? (
              <>
                <Icons.spinner className='size-4 animate-spin' />
                <span>Memulihkan...</span>
              </>
            ) : (
              <>
                <Icons.check className='size-4' />
                <span>Eksekusi Pemulihan</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
