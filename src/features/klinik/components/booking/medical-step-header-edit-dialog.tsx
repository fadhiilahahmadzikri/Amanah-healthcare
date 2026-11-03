'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModalWrapper } from '@/components/ui/modal-wrapper';

export interface MedicalStepHeaderEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stepNumber: number;
  initialTitle: string;
  initialDescription?: string;
  onSave: (newTitle: string, newDescription: string) => void;
}

export function MedicalStepHeaderEditDialog({
  isOpen,
  onClose,
  stepNumber,
  initialTitle,
  initialDescription = '',
  onSave
}: MedicalStepHeaderEditDialogProps) {
  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState(initialDescription);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription || '');
    }
  }, [isOpen, initialTitle, initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave(trimmedTitle, description.trim());
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[480px]'
      showCloseButton={false}
      className='flex flex-col gap-4 p-5 sm:p-6'
    >
      <div className='flex flex-col gap-1 pb-2 border-b border-border/40'>
        <h3 className='text-sm sm:text-base font-bold text-foreground'>
          Konfigurasi Langkah ke-{stepNumber}
        </h3>
        <p className='text-xs text-muted-foreground'>
          Sesuaikan teks judul langkah dan petunjuk pengisian.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
        <div className='space-y-1.5'>
          <Label htmlFor='step-header-title' className='text-xs font-semibold'>
            Judul Langkah <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='step-header-title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Contoh: Ceritakan riwayat persalinan sebelumnya'
            required
            className='h-8 text-xs'
            autoFocus
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='step-header-desc' className='text-xs font-semibold'>
            Petunjuk / Deskripsi Langkah
          </Label>
          <Textarea
            id='step-header-desc'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Contoh: Isi sesuai data yang diingat.'
            rows={3}
            className='text-xs resize-none'
          />
        </div>

        <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/40'>
          <Button type='button' variant='ghost' shape='pill' onClick={onClose} className='text-xs'>
            Batal
          </Button>
          <Button
            type='submit'
            variant='primary'
            shape='pill'
            disabled={!title.trim()}
            className='text-xs'
          >
            Terapkan
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
