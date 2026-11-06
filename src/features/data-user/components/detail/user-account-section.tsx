'use client';

import React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { Switch } from '@/components/ui/switch';
import type { UserItem } from '../../api/types';

export interface UserAccountSectionProps {
  user: UserItem;
  formData: {
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  isEditing: boolean;
  onFieldChange: (field: string, val: any) => void;
  formatDateTime: (dateStr?: string | null) => string;
}

export function UserAccountSection({
  user,
  formData,
  isEditing,
  onFieldChange,
  formatDateTime,
}: UserAccountSectionProps) {
  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
        Identitas &amp; Kontak Akun
      </span>

      <PatientLineInput
        id='user_fullName'
        label='Nama Lengkap *'
        placeholder='Nama lengkap pengguna'
        value={formData.name}
        onChange={(val) => onFieldChange('name', val)}
        required
        disabled={!isEditing}
        autoComplete='name'
      />

      <PatientLineInput
        id='user_email'
        label='Email Akun'
        type='email'
        value={formData.email}
        disabled={true}
        autoComplete='email'
      />

      <PatientLineInput
        id='user_phoneNumber'
        label='No. Telepon / WhatsApp'
        type='tel'
        placeholder='081234567890'
        value={formData.phone}
        onChange={(val) => {
          const cleaned = val.replace(/[^0-9+\s-]/g, '');
          onFieldChange('phone', cleaned);
        }}
        inputMode='numeric'
        disabled={!isEditing}
        autoComplete='tel'
      />

      {/* Info Waktu Akun */}
      <div className='divide-y divide-border/40 text-xs pt-1'>
        <div className='py-2 flex items-center justify-between'>
          <span className='text-muted-foreground'>Terakhir Masuk</span>
          <span className='font-medium text-foreground'>
            {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Belum pernah masuk'}
          </span>
        </div>
        <div className='py-2 flex items-center justify-between'>
          <span className='text-muted-foreground'>Waktu Registrasi</span>
          <span className='font-medium text-foreground'>{formatDateTime(user.createdAt)}</span>
        </div>
      </div>

      {/* Operational Status Switch */}
      <div className='flex items-center justify-between pt-2 select-none border-t border-border/40'>
        <label
          htmlFor='user_active_switch'
          className='text-xs font-medium text-foreground cursor-pointer'
        >
          Status Operasional Akun
        </label>
        <Switch
          id='user_active_switch'
          checked={formData.status === 'active'}
          onCheckedChange={(checked) =>
            onFieldChange('status', checked ? 'active' : 'inactive')
          }
          disabled={!isEditing}
          aria-label='Status Operasional Akun'
        />
      </div>
    </div>
  );
}
