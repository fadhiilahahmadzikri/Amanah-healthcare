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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import { createUnitTypeSchema } from '../../schemas/clinic-essentials.schema';
import type {
  FacilityUnitType,
  CreateUnitTypePayload,
  UpdateUnitTypePayload
} from '../../types/clinic-essentials.types';

export interface CreateUnitTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (unitType: FacilityUnitType) => void;
  editItem?: FacilityUnitType | null;
}

export function CreateUnitTypeDialog({
  open,
  onOpenChange,
  onCreated,
  editItem
}: CreateUnitTypeDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [iconName, setIconName] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  const isEditing = Boolean(editItem);

  React.useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDescription(editItem.description || '');
      setIconName(editItem.iconName || '');
      setIsActive(editItem.isActive !== false);
    } else {
      setName('');
      setDescription('');
      setIconName('');
      setIsActive(true);
    }
  }, [editItem, open]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateUnitTypePayload) => clinicEssentialsApi.createUnitType(payload),
    onSuccess: (data) => {
      toast.success(`Klasifikasi fasilitas '${data.name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.unitTypes() });
      onCreated?.(data);
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat klasifikasi fasilitas';
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUnitTypePayload }) =>
      clinicEssentialsApi.updateUnitType(id, payload),
    onSuccess: (data) => {
      toast.success(`Klasifikasi fasilitas '${data.name}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.unitTypes() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui klasifikasi fasilitas';
      toast.error(msg);
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    setName('');
    setDescription('');
    setIconName('building-2');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = createUnitTypeSchema.safeParse({
      name: name.trim(),
      description: description.trim() || undefined,
      iconName: iconName || 'building-2',
      isActive
    });

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast.error(firstIssue?.message || 'Data masukan klasifikasi fasilitas tidak valid');
      return;
    }

    if (isEditing && editItem) {
      updateMutation.mutate({
        id: editItem.id,
        payload: {
          name: result.data.name,
          code: editItem.code,
          description: result.data.description,
          iconName: result.data.iconName,
          isActive
        }
      });
    } else {
      createMutation.mutate(result.data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>
              {isEditing ? 'Edit Klasifikasi Fasilitas' : 'Tambah Klasifikasi Fasilitas'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Perbarui definisi master klasifikasi fasilitas.'
                : 'Daftarkan klasifikasi tipe fasilitas baru (misal: Poliklinik Rawat Jalan, Ruang Rawat Inap, Departemen Medis).'}
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='flex items-center gap-3'>
              <div className='space-y-1.5 flex-1 min-w-0'>
                <Label htmlFor='unit-type-name' className='text-xs font-semibold'>
                  Nama Klasifikasi Fasilitas <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='unit-type-name'
                  placeholder='Contoh: Poliklinik Rawat Jalan'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
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
                  disabled={isPending}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='unit-type-description' className='text-xs font-semibold'>
                Deskripsi / Keterangan
              </Label>
              <Textarea
                id='unit-type-description'
                placeholder='Keterangan klasifikasi pelayanan tipe unit...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={3}
                className='text-xs'
              />
            </div>

            {isEditing && (
              <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
                <div className='space-y-0.5'>
                  <Label
                    htmlFor='unit-type-active'
                    className='text-xs font-semibold cursor-pointer'
                  >
                    Status Operasional Aktif
                  </Label>
                  <p className='text-[11px] text-muted-foreground'>
                    Nonaktifkan jika tidak digunakan dalam operasional fasilitas.
                  </p>
                </div>
                <Switch
                  id='unit-type-active'
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isPending}
                />
              </div>
            )}
          </div>

          <DialogFooter className='pt-3 border-t'>
            <Button type='button' variant='outline' onClick={handleClose} disabled={isPending}>
              Batal
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
