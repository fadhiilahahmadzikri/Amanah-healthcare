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
import type { CreateRoomPayload, FacilityUnit } from '../../types/clinic-essentials.types';

export interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: FacilityUnit[];
}

export function CreateRoomDialog({ open, onOpenChange, units }: CreateRoomDialogProps) {
  const queryClient = useQueryClient();

  const [unitId, setUnitId] = React.useState('');
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [floor, setFloor] = React.useState('1');

  // Pre-select first unit if available and not selected
  React.useEffect(() => {
    if (units.length > 0 && !unitId) {
      setUnitId(units[0].id);
    }
  }, [units, unitId]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateRoomPayload) => clinicEssentialsApi.createRoom(payload),
    onSuccess: (data) => {
      toast.success(`Ruangan '${data.name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.rooms() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat ruangan periksa';
      toast.error(msg);
    }
  });

  const handleClose = () => {
    setName('');
    setCode('');
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
    if (!unitId) {
      toast.error('Pilih unit/poliklinik induk terlebih dahulu');
      return;
    }
    if (!name.trim()) {
      toast.error('Nama ruangan periksa wajib diisi');
      return;
    }
    if (!code.trim()) {
      toast.error('Kode ruangan wajib diisi');
      return;
    }

    createMutation.mutate({
      unitId,
      name: name.trim(),
      code: code.trim(),
      location: location.trim() || undefined,
      floor: floor.trim() || undefined,
      isActive: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>Tambah Ruang Periksa</DialogTitle>
            <DialogDescription>
              Buat ruangan pemeriksaan fisik yang terhubung ke unit poliklinik.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='space-y-1.5'>
              <Label htmlFor='room-unit'>
                Unit / Poliklinik Induk <span className='text-destructive'>*</span>
              </Label>
              {units.length === 0 ? (
                <div className='p-2 text-xs border border-dashed rounded text-muted-foreground'>
                  Belum ada unit poliklinik terdaftar. Silakan buat Unit terlebih dahulu.
                </div>
              ) : (
                <Select
                  value={unitId}
                  onValueChange={setUnitId}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger id='room-unit'>
                    <SelectValue placeholder='Pilih unit induk' />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='room-name'>
                Nama Ruangan <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='room-name'
                placeholder='Contoh: Ruang Periksa 1'
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='room-code'>
                Kode Ruangan <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='room-code'
                placeholder='room_pu_1'
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='room-floor'>Lantai</Label>
                <Input
                  id='room-floor'
                  placeholder='1'
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='room-location'>Deskripsi Lokasi</Label>
                <Input
                  id='room-location'
                  placeholder='Sebelah Ruang Tindakan'
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
            <Button type='submit' disabled={createMutation.isPending || units.length === 0}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Ruangan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
