'use client';

import * as React from 'react';
import Image from 'next/image';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ServiceImagePicker } from '../atoms/service-image-picker';
import type {
  ClinicFacilityItem,
  ClinicService,
  CreateClinicFacilityPayload,
  UpdateClinicFacilityPayload
} from '../../types/clinic-essentials.types';

export interface FacilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: ClinicFacilityItem | null;
  services: ClinicService[];
  onSubmit: (
    payload: CreateClinicFacilityPayload | UpdateClinicFacilityPayload,
    id?: string
  ) => Promise<void>;
}

export function FacilityFormDialog({
  open,
  onOpenChange,
  editItem,
  services,
  onSubmit
}: FacilityFormDialogProps) {
  const isEditing = Boolean(editItem);

  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [ctaUrl, setCtaUrl] = React.useState('/kontak');
  const [serviceId, setServiceId] = React.useState<string>('none');
  const [displayOrder, setDisplayOrder] = React.useState(0);
  const [isPublished, setIsPublished] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (editItem) {
        setTitle(editItem.title || '');
        setSlug(editItem.slug || '');
        setSummary(editItem.summary || '');
        setImageUrl(editItem.imageUrl || '');
        setCtaUrl(editItem.ctaUrl || '/kontak');
        setServiceId(editItem.serviceId || 'none');
        setDisplayOrder(editItem.displayOrder ?? 0);
        setIsPublished(editItem.isPublished !== false);
      } else {
        setTitle('');
        setSlug('');
        setSummary('');
        setImageUrl('');
        setCtaUrl('/kontak');
        setServiceId('none');
        setDisplayOrder(0);
        setIsPublished(true);
      }
      setError(null);
    }
  }, [open, editItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama fasilitas wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: CreateClinicFacilityPayload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        summary: summary.trim() || null,
        imageUrl: imageUrl.trim() || null,
        ctaUrl: ctaUrl.trim() || '/kontak',
        serviceId: serviceId !== 'none' ? serviceId : null,
        displayOrder: isEditing ? (Number(displayOrder) || 0) : undefined,
        isPublished
      };

      await onSubmit(payload, editItem?.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan fasilitas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[540px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Ubah Fasilitas Unggulan' : 'Tambah Fasilitas Unggulan'}
            </DialogTitle>
            <DialogDescription>
              Fasilitas ini ditampilkan pada carousel landing page dan terhubung secara dinamis dengan layanan medis.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {error && (
              <div className='p-2.5 rounded-md bg-destructive/10 text-destructive text-xs'>
                {error}
              </div>
            )}

            {/* Title & Slug */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='facility-title'>Nama Fasilitas *</Label>
                <Input
                  id='facility-title'
                  placeholder='contoh: Ruang Persalinan 24 Jam'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='facility-slug'>Slug URL (Opsional)</Label>
                <Input
                  id='facility-slug'
                  placeholder='otomatis dari nama'
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            {/* Summary */}
            <div className='space-y-1.5'>
              <Label htmlFor='facility-summary'>Deskripsi Ringkas</Label>
              <Textarea
                id='facility-summary'
                rows={2}
                placeholder='Jelaskan fasilitas dan kenyamanan yang disediakan bagi pasien...'
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            {/* Dual-Mode Image Input */}
            <div className='space-y-2 rounded-lg border border-border p-3 bg-muted/10'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs font-semibold'>Aset Gambar (Dual-Mode)</Label>
                <span className='text-[10px] text-muted-foreground'>
                  Bisa URL eksternal atau aset disk
                </span>
              </div>

              <div className='flex gap-2 items-center'>
                <Input
                  placeholder='https://... atau /healthcare/assets/images/...'
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className='h-9 text-xs'
                />
                <ServiceImagePicker
                  value={imageUrl}
                  onChange={(path) => setImageUrl(path || '')}
                />
              </div>

              {imageUrl && (
                <div className='relative mt-1 h-24 w-full overflow-hidden rounded-md border border-border bg-background'>
                  <Image
                    src={imageUrl}
                    alt='Preview'
                    fill
                    unoptimized={Boolean(
                      imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
                    )}
                    className='object-cover'
                  />
                </div>
              )}
            </div>

            {/* Linked Service & CTA URL */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='facility-service'>Relasi Layanan Medis</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger id='facility-service'>
                    <SelectValue placeholder='Pilih layanan medis' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Tanpa Layanan (Umum)</SelectItem>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='facility-cta'>Target Link CTA</Label>
                <Input
                  id='facility-cta'
                  placeholder='/kontak atau URL'
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Display Order & Is Published */}
            <div className='flex items-center justify-between pt-1'>
              {isEditing ? (
                <div className='flex items-center gap-2'>
                  <Label htmlFor='facility-order' className='text-xs'>
                    Urutan Tampil
                  </Label>
                  <Input
                    id='facility-order'
                    type='number'
                    min={0}
                    className='w-20 h-8 text-xs'
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              ) : (
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <span className='font-mono text-[11px] bg-muted px-2 py-0.5 rounded'>
                    Urutan otomatis di posisi terakhir
                  </span>
                </div>
              )}

              <div className='flex items-center gap-2'>
                <Switch
                  id='facility-published'
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor='facility-published' className='text-xs font-medium cursor-pointer'>
                  {isPublished ? 'Terbitkan Sekarang' : 'Simpan Sebagai Draft'}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Fasilitas'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
