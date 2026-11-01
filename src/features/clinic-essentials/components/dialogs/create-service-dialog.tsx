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
  ClinicService,
  ClinicalIntakeForm,
  CreateServicePayload,
  ServiceCategory,
  UpdateServicePayload
} from '../../types/clinic-essentials.types';

export interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  editItem?: ClinicService | null;
}

export function CreateServiceDialog({
  open,
  onOpenChange,
  categories,
  forms,
  editItem
}: CreateServiceDialogProps) {
  const queryClient = useQueryClient();

  const [serviceCategoryId, setServiceCategoryId] = React.useState('');
  const [intakeFormId, setIntakeFormId] = React.useState('none');
  const [name, setName] = React.useState('');
  const [iconName, setIconName] = React.useState('');
  const [complaintsRaw, setComplaintsRaw] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  // Sync editItem or pre-select first category if available
  React.useEffect(() => {
    if (editItem) {
      setServiceCategoryId(editItem.serviceCategoryId);
      setIntakeFormId(editItem.intakeFormId || 'none');
      setName(editItem.name);
      setIconName(editItem.iconName || '');
      setComplaintsRaw((editItem.complaints || []).join(', '));
      setDescription(editItem.description || '');
      setIsActive(editItem.isActive !== false);
    } else {
      setName('');
      setIconName('');
      setIntakeFormId('none');
      setComplaintsRaw('');
      setDescription('');
      setIsActive(true);
      if (categories.length > 0) {
        setServiceCategoryId(categories[0].id);
      }
    }
  }, [editItem, open, categories]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateServicePayload) => clinicEssentialsApi.createService(payload),
    onSuccess: (data) => {
      toast.success(`Layanan '${data.name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.services() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat layanan medis';
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateServicePayload) => {
      if (!editItem) throw new Error('Layanan tidak ditemukan untuk diedit');
      return clinicEssentialsApi.updateService(editItem.id, payload);
    },
    onSuccess: (data) => {
      toast.success(`Layanan '${data.name}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.services() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui layanan medis';
      toast.error(msg);
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    if (!editItem) {
      setName('');
      setIconName('stethoscope');
      setIntakeFormId('none');
      setComplaintsRaw('');
      setDescription('');
    }
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceCategoryId) {
      toast.error('Pilih kelompok kategori layanan terlebih dahulu');
      return;
    }
    if (!name.trim()) {
      toast.error('Nama layanan medis wajib diisi');
      return;
    }

    const complaints = complaintsRaw
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const payload = {
      serviceCategoryId,
      intakeFormId: intakeFormId === 'none' ? null : intakeFormId,
      name: name.trim(),
      code: editItem ? editItem.code : undefined,
      codePrefix: editItem ? editItem.codePrefix : undefined,
      iconName: iconName || 'stethoscope',
      description: description.trim() || undefined,
      complaints: complaints.length > 0 ? complaints : undefined,
      displayOrder: editItem ? editItem.displayOrder : 0,
      isBookable: true,
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
      <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>{editItem ? 'Edit Service Medis' : 'Tambah Service Medis'}</DialogTitle>
            <DialogDescription>
              {editItem
                ? 'Perbarui data service medis dan formulir pengkajian terhubung.'
                : 'Buat service medis klinik dan hubungkan ke formulir pengkajian yang sesuai.'}
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='service-cat' className='text-xs font-semibold'>
                  Kelompok Layanan <span className='text-destructive'>*</span>
                </Label>
                {categories.length === 0 ? (
                  <div className='p-2 text-xs border border-dashed rounded text-muted-foreground'>
                    Belum ada kelompok layanan. Buat Kelompok Layanan terlebih dahulu.
                  </div>
                ) : (
                  <Select
                    value={serviceCategoryId}
                    onValueChange={setServiceCategoryId}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id='service-cat' className='h-9 text-xs'>
                      <SelectValue placeholder='Pilih kelompok' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className='text-xs'>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='service-form' className='text-xs font-semibold'>
                  Formulir Pengkajian Pasien
                </Label>
                <Select
                  value={intakeFormId}
                  onValueChange={setIntakeFormId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id='service-form' className='h-9 text-xs'>
                    <SelectValue placeholder='Pilih formulir' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none' className='text-xs'>
                      Tanpa Formulir Khusus (Standar / Umum)
                    </SelectItem>
                    {forms.map((f) => (
                      <SelectItem key={f.id} value={f.id} className='text-xs'>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='space-y-1.5 flex-1 min-w-0'>
                <Label htmlFor='service-name' className='text-xs font-semibold'>
                  Nama Service Medis <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='service-name'
                  placeholder='Contoh: Pemeriksaan Kehamilan & ANC'
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
                  onChange={(newVal) => setIconName(newVal || 'stethoscope')}
                  fallback={name.charAt(0) || 'L'}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='service-desc' className='text-xs font-semibold'>
                Keterangan Singkat
              </Label>
              <Input
                id='service-desc'
                placeholder='Pemeriksaan kehamilan rutin, ANC terpadu'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='service-complaints' className='text-xs font-semibold'>
                Daftar Keluhan Awal (Pisahkan dengan koma)
              </Label>
              <Textarea
                id='service-complaints'
                placeholder='Contoh: Mual muntah pagi, Nyeri perut bawah, Cek denyut jantung janin'
                value={complaintsRaw}
                onChange={(e) => setComplaintsRaw(e.target.value)}
                disabled={isSubmitting}
                rows={2}
                className='text-xs'
              />
              <p className='text-[11px] text-muted-foreground'>
                Opsi keluhan klinis yang akan muncul pada saat pasien atau resepsionis mendaftar.
              </p>
            </div>

            {Boolean(editItem) && (
              <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
                <div className='space-y-0.5'>
                  <Label htmlFor='service-active' className='text-xs font-semibold cursor-pointer'>
                    Status Operasional Aktif
                  </Label>
                  <p className='text-[11px] text-muted-foreground'>
                    Nonaktifkan jika tindakan/layanan ini sedang tidak tersedia untuk pasien.
                  </p>
                </div>
                <Switch
                  id='service-active'
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
            <Button type='submit' disabled={isSubmitting || categories.length === 0}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
