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
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type {
  DemographicMasterItem,
  CreateDemographicPayload,
  UpdateDemographicPayload,
} from '../../types/clinic-essentials.types';

export interface DemographicMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: 'blood-types' | 'education-levels' | 'religions' | 'occupations';
  resourceLabel: string;
  editItem?: DemographicMasterItem | null;
  onSuccess?: (item: DemographicMasterItem) => void;
}

export function DemographicMasterDialog({
  open,
  onOpenChange,
  resourceType,
  resourceLabel,
  editItem,
  onSuccess,
}: DemographicMasterDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [displayOrder, setDisplayOrder] = React.useState<number | ''>('');
  const [isActive, setIsActive] = React.useState(true);

  const isEditing = Boolean(editItem);

  React.useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDescription(editItem.description || '');
      setDisplayOrder(editItem.displayOrder ?? '');
      setIsActive(editItem.isActive !== false);
    } else {
      setName('');
      setDescription('');
      setDisplayOrder('');
      setIsActive(true);
    }
  }, [editItem, open]);

  const queryKey = React.useMemo(() => {
    switch (resourceType) {
      case 'blood-types':
        return clinicEssentialsKeys.bloodTypes();
      case 'education-levels':
        return clinicEssentialsKeys.educationLevels();
      case 'religions':
        return clinicEssentialsKeys.religions();
      case 'occupations':
        return clinicEssentialsKeys.occupations();
    }
  }, [resourceType]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateDemographicPayload) => {
      switch (resourceType) {
        case 'blood-types':
          return clinicEssentialsApi.createBloodType(payload);
        case 'education-levels':
          return clinicEssentialsApi.createEducationLevel(payload);
        case 'religions':
          return clinicEssentialsApi.createReligion(payload);
        case 'occupations':
          return clinicEssentialsApi.createOccupation(payload);
      }
    },
    onSuccess: (data) => {
      toast.success(`${resourceLabel} '${data.name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [...clinicEssentialsKeys.all, resourceType] });
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      onSuccess?.(data);
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : `Gagal menambahkan ${resourceLabel}`;
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDemographicPayload }) => {
      switch (resourceType) {
        case 'blood-types':
          return clinicEssentialsApi.updateBloodType(id, payload);
        case 'education-levels':
          return clinicEssentialsApi.updateEducationLevel(id, payload);
        case 'religions':
          return clinicEssentialsApi.updateReligion(id, payload);
        case 'occupations':
          return clinicEssentialsApi.updateOccupation(id, payload);
      }
    },
    onSuccess: (data) => {
      toast.success(`${resourceLabel} '${data.name}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [...clinicEssentialsKeys.all, resourceType] });
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      onSuccess?.(data);
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : `Gagal memperbarui ${resourceLabel}`;
      toast.error(msg);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    setName('');
    setDescription('');
    setDisplayOrder('');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(`Nama ${resourceLabel} wajib diisi.`);
      return;
    }

    const cleanName = resourceType === 'blood-types' ? name.trim().toUpperCase() : name.trim();
    const resolvedOrder = typeof displayOrder === 'number' && displayOrder > 0 ? displayOrder : undefined;

    const payload: CreateDemographicPayload = {
      name: cleanName,
      description: description.trim() || undefined,
      displayOrder: resolvedOrder,
      isActive,
    };

    if (isEditing && editItem) {
      updateMutation.mutate({ id: editItem.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${resourceLabel}` : `Tambah ${resourceLabel}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui informasi master data ${resourceLabel.toLowerCase()}.`
              : `Daftarkan entri baru untuk referensi master ${resourceLabel.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2 font-sans'>
          <div className='space-y-1.5'>
            <Label htmlFor='demographic-name'>
              Nama / Simbol <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='demographic-name'
              placeholder={`Contoh: ${resourceType === 'blood-types' ? 'A+, O-' : resourceType === 'education-levels' ? 'S1, SMA/SMK' : resourceType === 'religions' ? 'Islam, Kristen' : 'PNS, Wiraswasta'}`}
              value={name}
              onChange={(e) =>
                setName(resourceType === 'blood-types' ? e.target.value.toUpperCase() : e.target.value)
              }
              maxLength={resourceType === 'blood-types' ? 16 : 128}
              disabled={isPending}
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='demographic-desc'>Keterangan / Deskripsi</Label>
            <Textarea
              id='demographic-desc'
              placeholder='Deskripsi detail atau catatan (opsional)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='demographic-order'>
                Urutan Tampilan{' '}
                {!isEditing && (
                  <span className='text-xs text-muted-foreground font-normal'>(Opsional)</span>
                )}
              </Label>
              <Input
                id='demographic-order'
                type='number'
                min={0}
                placeholder='Otomatis (urutan berikutnya)'
                value={displayOrder}
                onChange={(e) => {
                  const val = e.target.value;
                  setDisplayOrder(val === '' ? '' : Number(val));
                }}
                disabled={isPending}
              />
            </div>

            <div className='flex flex-col justify-end pb-1 space-y-1.5'>
              <Label htmlFor='demographic-status' className='text-xs text-muted-foreground'>
                Status Aktif
              </Label>
              <div className='flex items-center gap-2'>
                <Switch
                  id='demographic-status'
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isPending}
                />
                <span className='text-xs font-medium'>
                  {isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
