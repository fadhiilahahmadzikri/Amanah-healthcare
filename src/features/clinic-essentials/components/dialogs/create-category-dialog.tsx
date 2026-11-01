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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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

const CATEGORY_ICONS = [
  { value: 'folder', label: 'Folder (Kategori Standar)' },
  { value: 'stethoscope', label: 'Stethoscope (Pemeriksaan Dokter)' },
  { value: 'baby', label: 'Baby (Kebidanan & Anak)' },
  { value: 'heart-pulse', label: 'Heart Pulse (Tindakan Medis)' },
  { value: 'pill', label: 'Pill (Farmasi / Obat)' },
  { value: 'clipboard-list', label: 'Clipboard (Pemeriksaan & Skrining)' }
];

export function CreateCategoryDialog({
  open,
  onOpenChange,
  units,
  editItem
}: CreateCategoryDialogProps) {
  const queryClient = useQueryClient();

  const [unitId, setUnitId] = React.useState<string>('none');
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codePrefix, setCodePrefix] = React.useState('');
  const [iconName, setIconName] = React.useState('folder');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (editItem) {
      setUnitId(editItem.unitId || 'none');
      setName(editItem.name);
      setCode(editItem.code);
      setCodePrefix(editItem.codePrefix || '');
      setIconName(editItem.iconName || 'folder');
      setDescription(editItem.description || '');
    } else {
      setUnitId('none');
      setName('');
      setCode('');
      setCodePrefix('');
      setIconName('folder');
      setDescription('');
    }
  }, [editItem, open]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => clinicEssentialsApi.createCategory(payload),
    onSuccess: (data) => {
      toast.success(`Kategori '${data.name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.categories() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat kategori layanan';
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => {
      if (!editItem) throw new Error('Kategori tidak ditemukan untuk diedit');
      return clinicEssentialsApi.updateCategory(editItem.id, payload);
    },
    onSuccess: (data) => {
      toast.success(`Kategori '${data.name}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.categories() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui kategori layanan';
      toast.error(msg);
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    if (!editItem) {
      setUnitId('none');
      setName('');
      setCode('');
      setCodePrefix('');
      setIconName('folder');
      setDescription('');
    }
    onOpenChange(false);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editItem && (!code || code === name.toLowerCase().replace(/[^a-z0-9_]/g, '_'))) {
      setCode(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9_]+/g, '_')
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama kategori layanan wajib diisi');
      return;
    }
    if (!code.trim()) {
      toast.error('Kode kategori wajib diisi');
      return;
    }

    const payload = {
      unitId: unitId === 'none' ? undefined : unitId,
      name: name.trim(),
      code: code.trim(),
      codePrefix: codePrefix.trim().toUpperCase() || undefined,
      iconName: iconName || 'folder',
      description: description.trim() || undefined,
      displayOrder: 0,
      isActive: editItem ? editItem.isActive : true
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
              {editItem ? 'Edit Kategori Layanan' : 'Tambah Kategori Layanan'}
            </DialogTitle>
            <DialogDescription>
              {editItem
                ? 'Perbarui kelompok kategori layanan medis.'
                : 'Buat kelompok kategori layanan medis (misal: Layanan Umum, Layanan Kebidanan).'}
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='space-y-1.5'>
              <Label htmlFor='cat-name'>
                Nama Kategori <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='cat-name'
                placeholder='Contoh: Layanan Pemeriksaan Umum'
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='cat-code'>
                  Kode Kategori <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='cat-code'
                  placeholder='layanan_umum'
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='cat-prefix'>Prefix Kode</Label>
                <Input
                  id='cat-prefix'
                  placeholder='UM'
                  maxLength={8}
                  value={codePrefix}
                  onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='cat-unit'>Unit Poliklinik (Opsional)</Label>
                <Select value={unitId} onValueChange={setUnitId} disabled={isSubmitting}>
                  <SelectTrigger id='cat-unit'>
                    <SelectValue placeholder='Pilih unit' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Tanpa Unit Khusus (Global)</SelectItem>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='cat-icon'>Ikon Kategori</Label>
                <Select value={iconName} onValueChange={setIconName} disabled={isSubmitting}>
                  <SelectTrigger id='cat-icon'>
                    <SelectValue placeholder='Pilih ikon' />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ICONS.map((ic) => (
                      <SelectItem key={ic.value} value={ic.value}>
                        {ic.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='cat-desc'>Deskripsi (Opsional)</Label>
              <Textarea
                id='cat-desc'
                placeholder='Keterangan singkat tentang kelompok kategori layanan ini'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={2}
              />
            </div>
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
