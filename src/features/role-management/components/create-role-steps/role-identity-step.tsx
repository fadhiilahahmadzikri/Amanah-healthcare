'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface RoleIdentityStepProps {
  code?: string;
  name: string;
  onCodeChange?: (value: string) => void;
  onNameChange: (value: string) => void;
  isCodeLocked?: boolean;
  disabled?: boolean;
}

export function RoleIdentityStep({
  code,
  name,
  onNameChange,
  isCodeLocked = false,
  disabled
}: RoleIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          {isCodeLocked ? 'Identitas dan Nama Peran' : 'Mau dinamai apa peran baru ini?'}
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          {isCodeLocked
            ? 'Nama tampilan dapat disesuaikan. Kode peran bersifat permanen.'
            : 'Tuliskan nama peran agar mudah dikenali oleh seluruh staf klinik.'}
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='role-name' className='text-xs font-semibold'>
            Nama Tampilan <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='role-name'
            placeholder='contoh: Kepala Resepsionis'
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            className='h-10 text-sm'
          />
        </div>

        {isCodeLocked && code && (
          <div className='space-y-1.5'>
            <Label htmlFor='role-code' className='text-xs font-semibold'>
              Kode Peran
            </Label>
            <Input
              id='role-code'
              value={code}
              readOnly
              disabled
              className='h-10 text-sm font-mono opacity-80 cursor-not-allowed bg-muted/40'
            />
            <p className='text-[11px] text-muted-foreground'>
              Kode peran bersifat permanen dan tidak dapat diubah.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
