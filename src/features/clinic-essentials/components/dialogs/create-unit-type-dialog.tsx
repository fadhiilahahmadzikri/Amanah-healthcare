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
import { createUnitTypeSchema } from '../../schemas/clinic-essentials.schema';
import type { FacilityUnitType, CreateUnitTypePayload } from '../../types/clinic-essentials.types';

export interface CreateUnitTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (unitType: FacilityUnitType) => void;
}

const COMMON_ICONS = [
  { value: 'building-2', label: 'Building (Gedung/Unit)' },
  { value: 'stethoscope', label: 'Stethoscope (Konsultasi Dokter / Klinis)' },
  { value: 'baby', label: 'Baby (Kesehatan Ibu & Anak)' },
  { value: 'heart-pulse', label: 'Heart Pulse (Kardiologi/Tindakan)' },
  { value: 'activity', label: 'Activity (Klinis/Gawat Darurat)' },
  { value: 'shield', label: 'Shield (Pelayanan Umum)' }
];

export function CreateUnitTypeDialog({
  open,
  onOpenChange,
  onCreated
}: CreateUnitTypeDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [iconName, setIconName] = React.useState('building-2');

  const createMutation = useMutation({
    mutationFn: (payload: CreateUnitTypePayload) => clinicEssentialsApi.createUnitType(payload),
    onSuccess: (data) => {
      toast.success(`Tipe unit '${data.name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.unitTypes() });
      onCreated?.(data);
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat tipe unit fasilitas';
      toast.error(msg);
    }
  });

  const handleClose = () => {
    setName('');
    setCode('');
    setDescription('');
    setIconName('building-2');
    onOpenChange(false);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code === name.toLowerCase().replace(/[^a-z0-9_]/g, '_')) {
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

    const result = createUnitTypeSchema.safeParse({
      name: name.trim(),
      code: code.trim(),
      description: description.trim() || undefined,
      iconName: iconName || 'building-2',
      isActive: true
    });

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast.error(firstIssue?.message || 'Data masukan tipe unit tidak valid');
      return;
    }

    createMutation.mutate(result.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>Tambah Tipe Unit</DialogTitle>
            <DialogDescription>
              Daftarkan master klasifikasi tipe unit fasilitas baru (misal: Poliklinik Rawat Jalan, Ruang Rawat Inap, Departemen Medis).
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='space-y-1.5'>
              <Label htmlFor='unit-type-name'>
                Nama Tipe Unit <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='unit-type-name'
                placeholder='Contoh: Poliklinik Rawat Jalan'
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='unit-type-code'>
                  Kode (SSOT) <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='unit-type-code'
                  placeholder='rawat_jalan'
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                  }
                  disabled={createMutation.isPending}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='unit-type-icon'>Ikon Tipe</Label>
                <Select
                  value={iconName}
                  onValueChange={setIconName}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger id='unit-type-icon'>
                    <SelectValue placeholder='Pilih ikon' />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ICONS.map((ic) => (
                      <SelectItem key={ic.value} value={ic.value}>
                        {ic.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='unit-type-description'>Deskripsi / Keterangan</Label>
              <Textarea
                id='unit-type-description'
                placeholder='Keterangan klasifikasi pelayanan tipe unit...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createMutation.isPending}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className='pt-3 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Batal
            </Button>
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Tipe Unit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
