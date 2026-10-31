'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
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
import { createUnitSchema } from '../../schemas/clinic-essentials.schema';
import type { CreateUnitPayload } from '../../types/clinic-essentials.types';
import { CreateUnitTypeDialog } from './create-unit-type-dialog';

export interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMON_ICONS = [
  { value: 'building-2', label: 'Building (Gedung/Unit)' },
  { value: 'stethoscope', label: 'Stethoscope (Konsultasi Dokter / Klinis)' },
  { value: 'baby', label: 'Baby (Kesehatan Ibu & Anak)' },
  { value: 'heart-pulse', label: 'Heart Pulse (Kardiologi/Tindakan)' },
  { value: 'activity', label: 'Activity (Klinis/Gawat Darurat)' },
  { value: 'shield', label: 'Shield (Pelayanan Umum)' }
];

export function CreateUnitDialog({ open, onOpenChange }: CreateUnitDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [unitTypeId, setUnitTypeId] = React.useState('');
  const [queuePrefix, setQueuePrefix] = React.useState('');
  const [iconName, setIconName] = React.useState('building-2');
  const [location, setLocation] = React.useState('');
  const [floor, setFloor] = React.useState('1');

  // Sub-dialog state for on-the-fly unit type creation
  const [isCreateUnitTypeOpen, setIsCreateUnitTypeOpen] = React.useState(false);

  // Fetch dynamic unit types from database
  const { data: unitTypes = [], isLoading: isLoadingUnitTypes } = useQuery({
    queryKey: clinicEssentialsKeys.unitTypes(),
    queryFn: () => clinicEssentialsApi.getUnitTypes()
  });

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
    setUnitTypeId('');
    setQueuePrefix('');
    setIconName('building-2');
    setLocation('');
    setFloor('1');
    setIsCreateUnitTypeOpen(false);
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

    if (!unitTypeId) {
      toast.error('Silakan pilih tipe unit atau klik Tambah Tipe untuk membuat baru');
      return;
    }

    const result = createUnitSchema.safeParse({
      name: name.trim(),
      code: code.trim(),
      unitTypeId,
      queuePrefix: queuePrefix.trim().toUpperCase() || undefined,
      iconName: iconName || 'building-2',
      location: location.trim() || undefined,
      floor: floor.trim() || undefined,
      isActive: true
    });

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast.error(firstIssue?.message || 'Data masukan unit tidak valid');
      return;
    }

    createMutation.mutate(result.data);
  };

  return (
    <>
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
                  placeholder='Contoh: Poliklinik Rawat Jalan'
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
                  <Label htmlFor='unit-type-id'>
                    Tipe Unit <span className='text-destructive'>*</span>
                  </Label>
                  <div className='flex items-center gap-1.5'>
                    <Select
                      value={unitTypeId}
                      onValueChange={setUnitTypeId}
                      disabled={createMutation.isPending || isLoadingUnitTypes}
                    >
                      <SelectTrigger id='unit-type-id' className='flex-1'>
                        <SelectValue
                          placeholder={
                            isLoadingUnitTypes
                              ? 'Memuat tipe...'
                              : unitTypes.length === 0
                                ? 'Belum ada tipe unit'
                                : 'Pilih tipe unit'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {unitTypes.map((ut) => (
                          <SelectItem key={ut.id} value={ut.id}>
                            {ut.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setIsCreateUnitTypeOpen(true)}
                      disabled={createMutation.isPending}
                      className='gap-1 shrink-0 h-9 text-xs px-2.5'
                      title='Tambah Tipe Unit Baru'
                    >
                      <Plus className='size-3.5' /> Tambah
                    </Button>
                  </div>
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

      {/* Embedded on-the-fly Unit Type Creation Modal */}
      <CreateUnitTypeDialog
        open={isCreateUnitTypeOpen}
        onOpenChange={setIsCreateUnitTypeOpen}
        onCreated={(newType) => {
          setUnitTypeId(newType.id);
          setIsCreateUnitTypeOpen(false);
        }}
      />
    </>
  );
}
