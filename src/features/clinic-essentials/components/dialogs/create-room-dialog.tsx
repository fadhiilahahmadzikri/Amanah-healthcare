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
  CreateRoomPayload,
  FacilityRoom,
  FacilityUnit,
  UpdateRoomPayload
} from '../../types/clinic-essentials.types';

export interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: FacilityUnit[];
  editItem?: FacilityRoom | null;
}

export function CreateRoomDialog({ open, onOpenChange, units, editItem }: CreateRoomDialogProps) {
  const queryClient = useQueryClient();

  const [unitId, setUnitId] = React.useState('');
  const [name, setName] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [floor, setFloor] = React.useState('1');
  const [isActive, setIsActive] = React.useState(true);

  // Sync editItem to form state or pre-select first unit
  React.useEffect(() => {
    if (editItem) {
      setUnitId(editItem.unitId);
      setName(editItem.name);
      setLocation(editItem.location || '');
      setFloor(editItem.floor || '1');
      setIsActive(editItem.isActive !== false);
    } else {
      setName('');
      setLocation('');
      setFloor('1');
      setIsActive(true);
      if (units.length > 0) {
        setUnitId(units[0].id);
      }
    }
  }, [editItem, open, units]);

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

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateRoomPayload) => {
      if (!editItem) throw new Error('Ruangan tidak ditemukan untuk diedit');
      return clinicEssentialsApi.updateRoom(editItem.id, payload);
    },
    onSuccess: (data) => {
      toast.success(`Ruangan '${data.name}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.rooms() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui ruangan periksa';
      toast.error(msg);
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    if (!editItem) {
      setName('');
      setLocation('');
      setFloor('1');
    }
    onOpenChange(false);
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

    const payload = {
      unitId,
      name: name.trim(),
      code: editItem ? editItem.code : undefined,
      location: location.trim() || undefined,
      floor: floor.trim() || undefined,
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
            <DialogTitle>{editItem ? 'Edit Ruang Periksa' : 'Tambah Ruang Periksa'}</DialogTitle>
            <DialogDescription>
              {editItem
                ? 'Perbarui ruangan pemeriksaan fisik yang terhubung ke unit poliklinik.'
                : 'Daftarkan ruangan pemeriksaan fisik yang terhubung ke unit poliklinik.'}
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='space-y-1.5'>
              <Label htmlFor='room-unit' className='text-xs font-semibold'>
                Poliklinik / Departemen Induk <span className='text-destructive'>*</span>
              </Label>
              {units.length === 0 ? (
                <div className='p-2 text-xs border border-dashed rounded text-muted-foreground'>
                  Belum ada unit poliklinik terdaftar. Silakan buat Unit terlebih dahulu.
                </div>
              ) : (
                <Select value={unitId} onValueChange={setUnitId} disabled={isSubmitting}>
                  <SelectTrigger id='room-unit' className='h-9 text-xs'>
                    <SelectValue placeholder='Pilih unit induk' />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id} className='text-xs'>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='room-name' className='text-xs font-semibold'>
                Nama Ruangan <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='room-name'
                placeholder='Contoh: Ruang Periksa 1'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
                className='h-9 text-xs'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='room-floor' className='text-xs font-semibold'>
                  Lantai
                </Label>
                <Input
                  id='room-floor'
                  placeholder='1'
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  disabled={isSubmitting}
                  className='h-9 text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='room-location' className='text-xs font-semibold'>
                  Deskripsi Lokasi
                </Label>
                <Input
                  id='room-location'
                  placeholder='Sebelah Ruang Tindakan'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                  className='h-9 text-xs'
                />
              </div>
            </div>

            {Boolean(editItem) && (
              <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
                <div className='space-y-0.5'>
                  <Label htmlFor='room-active' className='text-xs font-semibold cursor-pointer'>
                    Status Operasional Aktif
                  </Label>
                  <p className='text-[11px] text-muted-foreground'>
                    Nonaktifkan jika ruangan sedang dalam perbaikan atau tidak digunakan.
                  </p>
                </div>
                <Switch
                  id='room-active'
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
            <Button type='submit' disabled={isSubmitting || units.length === 0}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
