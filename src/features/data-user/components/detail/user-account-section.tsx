'use client';

import React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import type { UserItem } from '../../api/types';

export interface UserAccountSectionProps {
  user: UserItem;
  formData: {
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  errors?: Record<string, string>;
  isEditing: boolean;
  onFieldChange: (field: string, val: unknown) => void;
  onBlur?: (field: string) => void;
  formatDateTime: (dateStr?: string | null) => string;
}

export function UserAccountSection({
  user,
  formData,
  errors,
  isEditing,
  onFieldChange,
  onBlur,
  formatDateTime,
}: UserAccountSectionProps) {
  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
        Identitas &amp; Kontak Akun
      </span>

      <PatientLineInput
        id='user_fullName'
        label={
          <span>
            Nama Lengkap <span className='text-destructive font-bold'>*</span>
          </span>
        }
        placeholder='Nama lengkap pengguna'
        value={formData.name}
        onChange={(val) => onFieldChange('name', val)}
        onBlur={() => onBlur?.('name')}
        error={errors?.name}
        required
        disabled={!isEditing}
        autoComplete='name'
      />

      <div className='space-y-1.5'>
        <PatientLineInput
          id='user_email'
          label='Email Akun (Terkunci)'
          type='email'
          value={formData.email}
          disabled={true}
          autoComplete='email'
        />
        <span className='text-[10px] text-muted-foreground block px-1'>
          Alamat email akun hanya dapat diubah oleh pemilik akun melalui verifikasi mandiri.
        </span>

        {/* Lencana Metode Autentikasi Login Akun */}
        <div className='flex items-center gap-1.5 pt-0.5 px-0.5 flex-wrap'>
          {user.hasGoogle && (
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'>
              <Icons.google className='size-3' />
              Terhubung Google
            </span>
          )}
          {user.hasPassword && (
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'>
              <Icons.lock className='size-3' />
              Kata Sandi Aktif
            </span>
          )}
          {!user.hasGoogle && !user.hasPassword && (
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'>
              <Icons.mail className='size-3' />
              Menunggu Aktivasi
            </span>
          )}
        </div>
      </div>

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
        onBlur={() => onBlur?.('phone')}
        error={errors?.phone}
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
