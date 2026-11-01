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
import { Switch } from '@/components/ui/switch';
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
import { createUnitSchema } from '../../schemas/clinic-essentials.schema';
import type {
  CreateUnitPayload,
  FacilityUnit,
  UpdateUnitPayload
} from '../../types/clinic-essentials.types';
import { CreateUnitTypeDialog } from './create-unit-type-dialog';

export interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: FacilityUnit | null;
}

export function CreateUnitDialog({ open, onOpenChange, editItem }: CreateUnitDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [unitTypeId, setUnitTypeId] = React.useState('');
  const [iconName, setIconName] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [floor, setFloor] = React.useState('1');
  const [isActive, setIsActive] = React.useState(true);

  // Sub-dialog state for on-the-fly unit type creation
  const [isCreateUnitTypeOpen, setIsCreateUnitTypeOpen] = React.useState(false);

  // Sync editItem to form state
  React.useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setUnitTypeId(editItem.unitTypeId);
      setIconName(editItem.iconName || '');
      setLocation(editItem.location || '');
      setFloor(editItem.floor || '1');
      setIsActive(editItem.isActive !== false);
    } else {
      setName('');
      setUnitTypeId('');
      setIconName('');
      setLocation('');
      setFloor('1');
      setIsActive(true);
    }
  }, [editItem, open]);

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

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUnitPayload) => {
      if (!editItem) throw new Error('Unit tidak ditemukan untuk diedit');
      return clinicEssentialsApi.updateUnit(editItem.id, payload);
    },
    onSuccess: (data) => {
      toast.success(`Unit '${data.name}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.units() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui unit fasilitas';
      toast.error(msg);
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    if (!editItem) {
      setName('');
      setUnitTypeId('');
      setIconName('building-2');
      setLocation('');
      setFloor('1');
    }
    setIsCreateUnitTypeOpen(false);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitTypeId) {
      toast.error('Silakan pilih tipe unit atau klik Tambah Tipe untuk membuat baru');
      return;
    }

    const payload = {
      name: name.trim(),
      code: editItem ? editItem.code : undefined,
      unitTypeId,
      iconName: iconName || 'building-2',
      location: location.trim() || undefined,
      floor: floor.trim() || undefined,
      isActive
    };

    if (editItem) {
      updateMutation.mutate(payload);
    } else {
      const result = createUnitSchema.safeParse(payload);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        toast.error(firstIssue?.message || 'Data masukan unit tidak valid');
        return;
      }
      createMutation.mutate(result.data);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-lg'>
          <form onSubmit={handleSubmit}>
            <DialogHeader className='pb-4 border-b'>
              <DialogTitle>
                {editItem ? 'Edit Poliklinik / Departemen' : 'Tambah Poliklinik / Departemen'}
              </DialogTitle>
              <DialogDescription>
                {editItem
                  ? 'Perbarui data poliklinik atau departemen pelayanan klinik.'
                  : 'Buat poliklinik atau departemen pelayanan baru pada klinik.'}
              </DialogDescription>
            </DialogHeader>

            <div className='py-4 space-y-3.5'>
              <div className='flex items-center gap-3'>
                <div className='space-y-1.5 flex-1 min-w-0'>
                  <Label htmlFor='unit-name' className='text-xs font-semibold'>
                    Nama Poliklinik / Unit <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='unit-name'
                    placeholder='Contoh: Poliklinik Rawat Jalan'
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
                    fallback={name.charAt(0) || 'U'}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='unit-type-id' className='text-xs font-semibold'>
                  Klasifikasi Fasilitas <span className='text-destructive'>*</span>
                </Label>
                <div className='flex items-center gap-1.5'>
                  <Select
                    value={unitTypeId}
                    onValueChange={setUnitTypeId}
                    disabled={isSubmitting || isLoadingUnitTypes}
                  >
                    <SelectTrigger id='unit-type-id' className='flex-1 h-9 text-xs'>
                      <SelectValue
                        placeholder={
                          isLoadingUnitTypes
                            ? 'Memuat klasifikasi...'
                            : unitTypes.length === 0
                              ? 'Belum ada klasifikasi fasilitas'
                              : 'Pilih klasifikasi fasilitas'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map((ut) => (
                        <SelectItem key={ut.id} value={ut.id} className='text-xs'>
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
                    disabled={isSubmitting}
                    className='gap-1 shrink-0 h-9 text-xs px-2.5'
                    title='Tambah Klasifikasi Fasilitas Baru'
                  >
                    <Plus className='size-3.5' /> Tambah
                  </Button>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='unit-floor' className='text-xs font-semibold'>
                    Lantai
                  </Label>
                  <Input
                    id='unit-floor'
                    placeholder='1'
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    disabled={isSubmitting}
                    className='h-9 text-xs'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='unit-location' className='text-xs font-semibold'>
                    Lokasi Spesifik
                  </Label>
                  <Input
                    id='unit-location'
                    placeholder='Gedung Utama Lantai 1'
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
                    <Label htmlFor='unit-active' className='text-xs font-semibold cursor-pointer'>
                      Status Operasional Aktif
                    </Label>
                    <p className='text-[11px] text-muted-foreground'>
                      Nonaktifkan jika poliklinik sedang tidak beroperasi.
                    </p>
                  </div>
                  <Switch
                    id='unit-active'
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
