'use client';

import * as React from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type {
  ClinicService,
  CreateSupportFaqPayload,
  ServiceCategory,
  SupportFaqItem,
  UpdateSupportFaqPayload
} from '../../types/clinic-essentials.types';

export interface FaqFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: SupportFaqItem | null;
  services: ClinicService[];
  categories: ServiceCategory[];
  onSubmit: (
    payload: CreateSupportFaqPayload | UpdateSupportFaqPayload,
    id?: string
  ) => Promise<void>;
}

const AVAILABLE_PATHS = [
  { path: '/', label: 'Beranda (/)' },
  { path: '/fasilitas', label: 'Fasilitas & Layanan (/fasilitas)' },
  { path: '/tentang-kami', label: 'Tentang Kami (/tentang-kami)' },
  { path: '/kontak', label: 'Kontak (/kontak)' }
];

const AVAILABLE_CATEGORIES = [
  { value: 'general', label: 'Umum (General)' },
  { value: 'beranda', label: 'Beranda' },
  { value: 'fasilitas', label: 'Fasilitas & Layanan' },
  { value: 'tentang-kami', label: 'Tentang Kami' },
  { value: 'kontak', label: 'Kontak & Informasi' }
];

export function FaqFormDialog({
  open,
  onOpenChange,
  editItem,
  services,
  categories,
  onSubmit
}: FaqFormDialogProps) {
  const isEditing = Boolean(editItem);

  const [title, setTitle] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [category, setCategory] = React.useState('general');
  const [selectedPaths, setSelectedPaths] = React.useState<string[]>(['/']);
  const [serviceId, setServiceId] = React.useState<string>('none');
  const [categoryId, setCategoryId] = React.useState<string>('none');
  const [displayOrder, setDisplayOrder] = React.useState(0);
  const [isPublished, setIsPublished] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (editItem) {
        setTitle(editItem.title || '');
        setAnswer(
          Array.isArray(editItem.solutionSteps)
            ? editItem.solutionSteps.join('\n\n')
            : String(editItem.solutionSteps || '')
        );
        setCategory(editItem.category || 'general');
        setSelectedPaths(
          editItem.paths && editItem.paths.length > 0 ? editItem.paths : ['/']
        );
        setServiceId(editItem.serviceId || 'none');
        setCategoryId(editItem.categoryId || 'none');
        setDisplayOrder(editItem.displayOrder ?? 0);
        setIsPublished(editItem.isPublished !== false);
      } else {
        setTitle('');
        setAnswer('');
        setCategory('general');
        setSelectedPaths(['/']);
        setServiceId('none');
        setCategoryId('none');
        setDisplayOrder(0);
        setIsPublished(true);
      }
      setError(null);
    }
  }, [open, editItem]);

  const togglePath = (path: string) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Pertanyaan FAQ wajib diisi');
      return;
    }
    if (!answer.trim()) {
      setError('Jawaban FAQ wajib diisi');
      return;
    }
    if (selectedPaths.length === 0) {
      setError('Pilih minimal satu halaman penempatan rute FAQ');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const steps = answer
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: CreateSupportFaqPayload = {
        title: title.trim(),
        solutionSteps: steps.length > 0 ? steps : [answer.trim()],
        category: category.trim() || 'general',
        paths: selectedPaths,
        serviceId: serviceId !== 'none' ? serviceId : null,
        categoryId: categoryId !== 'none' ? categoryId : null,
        displayOrder: isEditing ? (Number(displayOrder) || 0) : undefined,
        isPublished
      };

      await onSubmit(payload, editItem?.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[560px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Ubah Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ'}</DialogTitle>
            <DialogDescription>
              Pertanyaan dan jawaban FAQ ini akan muncul pada landing page sesuai halaman penempatan rute yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {error && (
              <div className='p-2.5 rounded-md bg-destructive/10 text-destructive text-xs'>
                {error}
              </div>
            )}

            {/* Question */}
            <div className='space-y-1.5'>
              <Label htmlFor='faq-question'>Pertanyaan *</Label>
              <Input
                id='faq-question'
                placeholder='contoh: Apakah layanan persalinan tersedia 24 jam?'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Answer */}
            <div className='space-y-1.5'>
              <Label htmlFor='faq-answer'>Jawaban *</Label>
              <Textarea
                id='faq-answer'
                rows={3}
                placeholder='Tuliskan jawaban yang lengkap, jelas, dan ramah bagi pasien...'
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
            </div>

            {/* Category & Placement Paths */}
            <div className='space-y-2'>
              <Label htmlFor='faq-category'>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id='faq-category'>
                  <SelectValue placeholder='Pilih kategori' />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paths Checkboxes */}
            <div className='space-y-2 rounded-lg border border-border p-3 bg-muted/10'>
              <Label className='text-xs font-semibold'>Penempatan Rute Landing Page *</Label>
              <div className='grid grid-cols-2 gap-2 pt-1'>
                {AVAILABLE_PATHS.map((item) => (
                  <div key={item.path} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`path-${item.path}`}
                      checked={selectedPaths.includes(item.path)}
                      onCheckedChange={() => togglePath(item.path)}
                    />
                    <label
                      htmlFor={`path-${item.path}`}
                      className='text-xs text-foreground cursor-pointer font-medium'
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Relations */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='faq-service'>Relasi Layanan Medis (Opsional)</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger id='faq-service'>
                    <SelectValue placeholder='Pilih layanan medis' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Tanpa Layanan Khusus</SelectItem>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='faq-category-relation'>Relasi Kelompok Layanan</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id='faq-category-relation'>
                    <SelectValue placeholder='Pilih kelompok layanan' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Tanpa Kelompok Khusus</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Display Order & Is Published */}
            <div className='flex items-center justify-between pt-1'>
              {isEditing ? (
                <div className='flex items-center gap-2'>
                  <Label htmlFor='faq-order' className='text-xs'>
                    Urutan Tampil
                  </Label>
                  <Input
                    id='faq-order'
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
                  id='faq-published'
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor='faq-published' className='text-xs font-medium cursor-pointer'>
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
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah FAQ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
