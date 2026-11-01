'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface RoleIdentityStepProps {
  name: string;
  onNameChange: (value: string) => void;
  isCodeLocked?: boolean;
  disabled?: boolean;
  code?: string;
  onCodeChange?: (value: string) => void;
}

export function RoleIdentityStep({
  name,
  onNameChange,
  isCodeLocked = false,
  disabled
}: RoleIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          {isCodeLocked ? 'Nama Peran' : 'Mau dinamai apa peran baru ini?'}
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          {isCodeLocked
            ? 'Sesuaikan nama tampilan peran agar mudah dikenali oleh staf klinik.'
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
      </div>
    </div>
  );
}
