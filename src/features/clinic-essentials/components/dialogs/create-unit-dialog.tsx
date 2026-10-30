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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type { CreateUnitPayload } from '../../types/clinic-essentials.types';

export interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMON_ICONS = [
  { value: 'building-2', label: 'Building (Gedung/Unit)' },
  { value: 'stethoscope', label: 'Stethoscope (Poli Umum/Dokter)' },
  { value: 'baby', label: 'Baby (Poli KIA/Anak)' },
  { value: 'heart-pulse', label: 'Heart Pulse (Kardiologi/Tindakan)' },
  { value: 'activity', label: 'Activity (Klinis/Gawat Darurat)' },
  { value: 'shield', label: 'Shield (Pelayanan Umum)' }
];

export function CreateUnitDialog({ open, onOpenChange }: CreateUnitDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [unitType, setUnitType] = React.useState<
    'department' | 'polyclinic' | 'ward' | 'emergency' | 'support' | 'other'
  >('polyclinic');
  const [queuePrefix, setQueuePrefix] = React.useState('');
  const [iconName, setIconName] = React.useState('building-2');
  const [location, setLocation] = React.useState('');
  const [floor, setFloor] = React.useState('1');

  const createMutation = useMutation({
    mutationFn: (payload: CreateUnitPayload) => clinicEssentialsApi.createUnit(payload),
    onSuccess: (data) => {
      toast.success(`Unit '${data.name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.units() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat unit fasilitas';
      toast.error(msg);
    }
  });

  const handleClose = () => {
    setName('');
    setCode('');
    setUnitType('polyclinic');
    setQueuePrefix('');
    setIconName('building-2');
    setLocation('');
    setFloor('1');
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
    if (!name.trim()) {
      toast.error('Nama unit wajib diisi');
      return;
    }
    if (!code.trim()) {
      toast.error('Kode unit wajib diisi');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      code: code.trim(),
      unitType,
      queuePrefix: queuePrefix.trim().toUpperCase() || undefined,
      iconName: iconName || 'building-2',
      location: location.trim() || undefined,
      floor: floor.trim() || undefined,
      isActive: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>Tambah Unit / Poliklinik</DialogTitle>
            <DialogDescription>
              Buat unit layanan atau departemen kanonik baru pada klinik.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='space-y-1.5'>
              <Label htmlFor='unit-name'>
                Nama Unit <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='unit-name'
                placeholder='Contoh: Poli Umum'
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='unit-code'>
                  Kode Unit <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='unit-code'
                  placeholder='poli_umum'
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                  }
                  disabled={createMutation.isPending}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='queue-prefix'>Prefix Antrean</Label>
                <Input
                  id='queue-prefix'
                  placeholder='PU'
                  maxLength={8}
                  value={queuePrefix}
                  onChange={(e) => setQueuePrefix(e.target.value.toUpperCase())}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='unit-type'>Tipe Unit</Label>
                <Select
                  value={unitType}
                  onValueChange={(val: NonNullable<CreateUnitPayload['unitType']>) =>
                    setUnitType(val)
                  }
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger id='unit-type'>
                    <SelectValue placeholder='Pilih tipe' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='polyclinic'>Poliklinik Rawat Jalan</SelectItem>
                    <SelectItem value='department'>Departemen Medis</SelectItem>
                    <SelectItem value='emergency'>Instalasi Gawat Darurat</SelectItem>
                    <SelectItem value='ward'>Ruang Rawat Inap</SelectItem>
                    <SelectItem value='support'>Penunjang Medis</SelectItem>
                    <SelectItem value='other'>Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='unit-icon'>Ikon Unit</Label>
                <Select
                  value={iconName}
                  onValueChange={setIconName}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger id='unit-icon'>
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

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='unit-floor'>Lantai</Label>
                <Input
                  id='unit-floor'
                  placeholder='1'
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='unit-location'>Lokasi Spesifik</Label>
                <Input
                  id='unit-location'
                  placeholder='Gedung Utama Lantai 1'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={createMutation.isPending}
                />
              </div>
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
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Unit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
