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
import type { CreateIntakeFormPayload } from '../../types/clinic-essentials.types';

export interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FORM_ICONS = [
  { value: 'clipboard-list', label: 'Clipboard (Formulir Standar)' },
  { value: 'baby', label: 'Baby (ANC / Kehamilan / Anak)' },
  { value: 'syringe', label: 'Syringe (Imunisasi / Vaksin)' },
  { value: 'stethoscope', label: 'Stethoscope (Pemeriksaan Dokter)' },
  { value: 'file-text', label: 'File Text (Dokumen Medis)' }
];

export function CreateFormDialog({ open, onOpenChange }: CreateFormDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [iconName, setIconName] = React.useState('clipboard-list');
  const [description, setDescription] = React.useState('');

  const createMutation = useMutation({
    mutationFn: (payload: CreateIntakeFormPayload) => clinicEssentialsApi.createForm(payload),
    onSuccess: (data) => {
      toast.success(`Formulir '${data.name}' (${data.code}) berhasil didaftarkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.forms() });
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat formulir intake';
      toast.error(msg);
    }
  });

  const handleClose = () => {
    setName('');
    setCode('');
    setIconName('clipboard-list');
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
    if (!name.trim()) {
      toast.error('Nama formulir intake wajib diisi');
      return;
    }
    if (!code.trim()) {
      toast.error('Kode formulir wajib diisi');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      code: code.trim(),
      iconName: iconName || 'clipboard-list',
      description: description.trim() || undefined,
      isActive: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle>Tambah Master Formulir Intake</DialogTitle>
            <DialogDescription>
              Daftarkan kode formulir klinis (misal: general, pregnancy, immunization) untuk
              dikoneksikan ke layanan.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4 space-y-3.5'>
            <div className='space-y-1.5'>
              <Label htmlFor='form-name'>
                Nama Formulir <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='form-name'
                placeholder='Contoh: Pemeriksaan Kehamilan & ANC'
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='form-code'>
                  Kode Formulir <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='form-code'
                  placeholder='pregnancy'
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                  }
                  disabled={createMutation.isPending}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='form-icon'>Ikon Formulir</Label>
                <Select
                  value={iconName}
                  onValueChange={setIconName}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger id='form-icon'>
                    <SelectValue placeholder='Pilih ikon' />
                  </SelectTrigger>
                  <SelectContent>
                    {FORM_ICONS.map((ic) => (
                      <SelectItem key={ic.value} value={ic.value}>
                        {ic.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='form-desc'>Deskripsi (Opsional)</Label>
              <Textarea
                id='form-desc'
                placeholder='Penjelasan alur atau data khusus yang dikumpulkan oleh formulir ini'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createMutation.isPending}
                rows={2}
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
              {createMutation.isPending ? 'Menyimpan...' : 'Daftarkan Formulir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
