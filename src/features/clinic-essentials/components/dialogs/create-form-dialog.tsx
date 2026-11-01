'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type {
  ClinicalIntakeForm,
  CreateIntakeFormPayload,
  UpdateIntakeFormPayload
} from '../../types/clinic-essentials.types';

export interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: ClinicalIntakeForm | null;
}

export function CreateFormDialog({ open, onOpenChange, editItem }: CreateFormDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [iconName, setIconName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setIconName(editItem.iconName || '');
      setDescription(editItem.description || '');
      setIsActive(editItem.isActive !== false);
    } else {
      setName('');
      setIconName('');
      setDescription('');
      setIsActive(true);
    }
  }, [editItem, open]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateIntakeFormPayload) => clinicEssentialsApi.createForm(payload),
    onSuccess: (data) => {
      toast.success(`Formulir '${data.name}' berhasil didaftarkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.forms() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat formulir pengkajian';
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateIntakeFormPayload) => {
      if (!editItem) throw new Error('Formulir tidak ditemukan untuk diedit');
      return clinicEssentialsApi.updateForm(editItem.id, payload);
    },
    onSuccess: (data) => {
      toast.success(`Formulir '${data.name}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.forms() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui formulir pengkajian';
      toast.error(msg);
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    if (!editItem) {
      setName('');
      setIconName('clipboard-list');
      setDescription('');
    }
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama formulir pengkajian wajib diisi');
      return;
    }

    const payload = {
      name: name.trim(),
      code: editItem ? editItem.code : undefined,
      iconName: iconName || 'clipboard-list',
      description: description.trim() || undefined,
      isActive
    };

    if (editItem) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>
              {editItem ? 'Edit Formulir Pengkajian Pasien' : 'Tambah Formulir Pengkajian Pasien'}
            </DialogTitle>
            <DialogDescription>
              {editItem
                ? 'Perbarui formulir pengkajian klinis pasien.'
                : 'Daftarkan formulir pengkajian klinis pasien baru (misal: Asesmen Awal, ANC / Kehamilan, Imunisasi).'}
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='flex items-center gap-3'>
              <div className='space-y-1.5 flex-1 min-w-0'>
                <Label htmlFor='form-name' className='text-xs font-semibold'>
                  Nama Formulir Pengkajian <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='form-name'
                  placeholder='Contoh: Pemeriksaan Kehamilan & ANC'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className='h-9 text-xs'
                />
              </div>

              <div className='space-y-1.5 shrink-0'>
                <Label className='text-xs font-semibold'>Visual</Label>
                <ShiftIconPickerPopover
                  value={iconName}
                  onChange={setIconName}
                  fallback={name.charAt(0) || 'F'}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='form-desc' className='text-xs font-semibold'>
                Deskripsi (Opsional)
              </Label>
              <Textarea
                id='form-desc'
                placeholder='Penjelasan alur atau data klinis khusus yang dikumpulkan oleh formulir ini'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={2}
                className='text-xs'
              />
            </div>

            {Boolean(editItem) && (
              <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
                <div className='space-y-0.5'>
                  <Label htmlFor='form-active' className='text-xs font-semibold cursor-pointer'>
                    Status Operasional Aktif
                  </Label>
                  <p className='text-[11px] text-muted-foreground'>
                    Nonaktifkan jika formulir ini sedang tidak digunakan untuk pengkajian pasien.
                  </p>
                </div>
                <Switch
                  id='form-active'
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <DialogFooter className='pt-3 border-t'>
            <Button type='button' variant='outline' onClick={handleClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
