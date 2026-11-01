'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface RoleDescriptionStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

export function RoleDescriptionStep({
  description,
  onDescriptionChange,
  disabled
}: RoleDescriptionStepProps) {
  const maxLength = 255;

  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Apa tugas dan tanggung jawab peran ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Ceritakan singkat ruang lingkup atau tugas utama peran ini di klinik.
        </p>
      </div>

      <div className='space-y-1.5 pt-1'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='role-desc' className='text-xs font-semibold'>
            Deskripsi Tugas
          </Label>
          <span className='text-[11px] text-muted-foreground font-mono'>
            {description.length}/{maxLength}
          </span>
        </div>
        <Textarea
          id='role-desc'
          placeholder='Jelaskan tanggung jawab utama dan tugas harian peran ini...'
          value={description}
          maxLength={maxLength}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
          rows={4}
          className='resize-none text-sm'
        />
        <p className='text-[11px] text-muted-foreground'>
          Bagian ini boleh dikosongkan bila belum ada keterangan rinci.
        </p>
      </div>
    </div>
  );
}
