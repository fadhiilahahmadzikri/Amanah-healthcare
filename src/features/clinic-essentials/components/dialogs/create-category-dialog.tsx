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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type {
  CreateCategoryPayload,
  FacilityUnit,
  ServiceCategory,
  UpdateCategoryPayload
} from '../../types/clinic-essentials.types';

export interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: FacilityUnit[];
  editItem?: ServiceCategory | null;
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  units,
  editItem
}: CreateCategoryDialogProps) {
  const queryClient = useQueryClient();

  const [unitId, setUnitId] = React.useState<string>('none');
  const [name, setName] = React.useState('');
  const [iconName, setIconName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (editItem) {
      setUnitId(editItem.unitId || 'none');
      setName(editItem.name);
      setIconName(editItem.iconName || '');
      setDescription(editItem.description || '');
      setIsActive(editItem.isActive !== false);
    } else {
      setUnitId('none');
      setName('');
      setIconName('');
      setDescription('');
      setIsActive(true);
    }
  }, [editItem, open]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => clinicEssentialsApi.createCategory(payload),
    onSuccess: (data) => {
      toast.success(`Kelompok layanan '${data.name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.categories() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat kelompok layanan';
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => {
      if (!editItem) throw new Error('Kategori tidak ditemukan untuk diedit');
      return clinicEssentialsApi.updateCategory(editItem.id, payload);
    },
    onSuccess: (data) => {
      toast.success(`Kelompok layanan '${data.name}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.categories() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui kelompok layanan';
      toast.error(msg);
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    if (!editItem) {
      setUnitId('none');
      setName('');
      setIconName('folder');
      setDescription('');
    }
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama kelompok layanan wajib diisi');
      return;
    }

    const payload = {
      unitId: unitId === 'none' ? undefined : unitId,
      name: name.trim(),
      code: editItem ? editItem.code : undefined,
      codePrefix: editItem ? editItem.codePrefix || undefined : undefined,
      iconName: iconName || 'folder',
      description: description.trim() || undefined,
      displayOrder: editItem ? editItem.displayOrder : 0,
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
      <DialogContent className='max-w-lg'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>
              {editItem ? 'Edit Kelompok Layanan' : 'Tambah Kelompok Layanan'}
            </DialogTitle>
            <DialogDescription>
              {editItem
                ? 'Perbarui kelompok kategori layanan medis.'
                : 'Buat kelompok kategori layanan medis (misal: Layanan Umum, Layanan Kebidanan).'}
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='flex items-center gap-3'>
              <div className='space-y-1.5 flex-1 min-w-0'>
                <Label htmlFor='cat-name' className='text-xs font-semibold'>
                  Nama Kelompok Layanan <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='cat-name'
                  placeholder='Contoh: Layanan Pemeriksaan Umum'
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
                  fallback={name.charAt(0) || 'K'}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='cat-unit' className='text-xs font-semibold'>
                Poliklinik / Departemen (Opsional)
              </Label>
              <Select value={unitId} onValueChange={setUnitId} disabled={isSubmitting}>
                <SelectTrigger id='cat-unit' className='h-9 text-xs'>
                  <SelectValue placeholder='Pilih unit' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none' className='text-xs'>
                    Tanpa Unit Khusus (Global)
                  </SelectItem>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id} className='text-xs'>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='cat-desc' className='text-xs font-semibold'>
                Deskripsi (Opsional)
              </Label>
              <Textarea
                id='cat-desc'
                placeholder='Keterangan singkat tentang kelompok kategori layanan ini'
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
                  <Label htmlFor='cat-active' className='text-xs font-semibold cursor-pointer'>
                    Status Operasional Aktif
                  </Label>
                  <p className='text-[11px] text-muted-foreground'>
                    Nonaktifkan jika kelompok layanan ini sedang tidak tersedia.
                  </p>
                </div>
                <Switch
                  id='cat-active'
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
