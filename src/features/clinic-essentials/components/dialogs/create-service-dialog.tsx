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
  ClinicalIntakeForm,
  CreateServicePayload,
  ServiceCategory
} from '../../types/clinic-essentials.types';

export interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
}

const SERVICE_ICONS = [
  { value: 'stethoscope', label: 'Stethoscope (Pemeriksaan Dokter)' },
  { value: 'baby', label: 'Baby (Kebidanan & Bayi)' },
  { value: 'syringe', label: 'Syringe (Suntik / Vaksin)' },
  { value: 'heart-pulse', label: 'Heart Pulse (Kardiologi/Tindakan)' },
  { value: 'pill', label: 'Pill (Obat / Terapi)' },
  { value: 'activity', label: 'Activity (Klinis Terpadu)' },
  { value: 'clipboard-list', label: 'Clipboard (Skrining / Konsultasi)' }
];

export function CreateServiceDialog({
  open,
  onOpenChange,
  categories,
  forms
}: CreateServiceDialogProps) {
  const queryClient = useQueryClient();

  const [serviceCategoryId, setServiceCategoryId] = React.useState('');
  const [intakeFormId, setIntakeFormId] = React.useState('none');
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codePrefix, setCodePrefix] = React.useState('');
  const [iconName, setIconName] = React.useState('stethoscope');
  const [complaintsRaw, setComplaintsRaw] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Pre-select first category if available
  React.useEffect(() => {
    if (categories.length > 0 && !serviceCategoryId) {
      setServiceCategoryId(categories[0].id);
    }
  }, [categories, serviceCategoryId]);

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

  const handleClose = () => {
    setName('');
    setCode('');
    setCodePrefix('');
    setIconName('stethoscope');
    setIntakeFormId('none');
    setComplaintsRaw('');
    setDescription('');
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
    if (!serviceCategoryId) {
      toast.error('Pilih kategori layanan terlebih dahulu');
      return;
    }
    if (!name.trim()) {
      toast.error('Nama layanan wajib diisi');
      return;
    }
    if (!code.trim()) {
      toast.error('Kode layanan wajib diisi');
      return;
    }
    if (!codePrefix.trim()) {
      toast.error('Prefix kode layanan wajib diisi');
      return;
    }

    const complaints = complaintsRaw
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    createMutation.mutate({
      serviceCategoryId,
      intakeFormId: intakeFormId === 'none' ? null : intakeFormId,
      name: name.trim(),
      code: code.trim(),
      codePrefix: codePrefix.trim().toUpperCase(),
      iconName: iconName || 'stethoscope',
      description: description.trim() || undefined,
      complaints: complaints.length > 0 ? complaints : undefined,
      displayOrder: 0,
      isBookable: true,
      isActive: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>Tambah Layanan Medis</DialogTitle>
            <DialogDescription>
              Buat layanan tindakan medis kanonik dan hubungkan ke formulir intake yang sesuai.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='service-cat'>
                  Kategori Layanan <span className='text-destructive'>*</span>
                </Label>
                {categories.length === 0 ? (
                  <div className='p-2 text-xs border border-dashed rounded text-muted-foreground'>
                    Belum ada kategori layanan. Buat Kategori terlebih dahulu.
                  </div>
                ) : (
                  <Select
                    value={serviceCategoryId}
                    onValueChange={setServiceCategoryId}
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger id='service-cat'>
                      <SelectValue placeholder='Pilih kategori' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='service-form'>Formulir Intake Terhubung</Label>
                <Select
                  value={intakeFormId}
                  onValueChange={setIntakeFormId}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger id='service-form'>
                    <SelectValue placeholder='Pilih formulir' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Tanpa Formulir Khusus (Standar / Umum)</SelectItem>
                    {forms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='service-name'>
                Nama Layanan <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='service-name'
                placeholder='Contoh: Pemeriksaan Kehamilan & ANC'
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='service-code'>
                  Kode Layanan <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='service-code'
                  placeholder='pregnancy_checkup'
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                  }
                  disabled={createMutation.isPending}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='service-prefix'>
                  Prefix Antrean <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='service-prefix'
                  placeholder='ANC'
                  maxLength={8}
                  value={codePrefix}
                  onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                  disabled={createMutation.isPending}
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='service-icon'>Ikon Layanan</Label>
                <Select
                  value={iconName}
                  onValueChange={setIconName}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger id='service-icon'>
                    <SelectValue placeholder='Pilih ikon' />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_ICONS.map((ic) => (
                      <SelectItem key={ic.value} value={ic.value}>
                        {ic.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='service-desc'>Keterangan Singkat</Label>
                <Input
                  id='service-desc'
                  placeholder='Pemeriksaan kehamilan rutin'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='service-complaints'>Daftar Keluhan Awal (Pisahkan dengan koma)</Label>
              <Textarea
                id='service-complaints'
                placeholder='Contoh: Mual muntah pagi, Nyeri perut bawah, Cek denyut jantung janin'
                value={complaintsRaw}
                onChange={(e) => setComplaintsRaw(e.target.value)}
                disabled={createMutation.isPending}
                rows={2}
              />
              <p className='text-[11px] text-muted-foreground'>
                Opsi keluhan yang akan muncul pada saat pasien atau resepsionis mendaftar.
              </p>
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
            <Button type='submit' disabled={createMutation.isPending || categories.length === 0}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Layanan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
