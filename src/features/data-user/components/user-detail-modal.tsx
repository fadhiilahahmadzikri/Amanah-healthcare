'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { cn } from '@/lib/utils';
import type { UserItem } from '../api/types';
import { activeRolesQueryOptions } from '../api/queries';
import { useUpdateUserMutation } from '../api/mutations';

export interface UserDetailModalProps {
  user: UserItem | null;
  isOpen: boolean;
  initialEditing?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserDetailModal({
  user,
  isOpen,
  initialEditing = false,
  onClose,
  onSuccess
}: UserDetailModalProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    roleIds: [] as string[]
  });

  const { data: availableRoles = [], isLoading: isLoadingRoles } =
    useQuery(activeRolesQueryOptions());

  const updateUserMutation = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status === 'active' ? 'active' : 'inactive',
        roleIds: user.roles.map((r) => r.id)
      });
      setIsEditing(initialEditing);
    }
  }, [user, initialEditing, isOpen]);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => {
      const exists = prev.roleIds.includes(roleId);
      if (exists) {
        return { ...prev, roleIds: prev.roleIds.filter((id) => id !== roleId) };
      }
      return { ...prev, roleIds: [...prev.roleIds, roleId] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email wajib diisi');
      return;
    }

    // UX Protection for numeric phone field
    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length > 0 && (digits.length < 8 || digits.length > 15)) {
        toast.error('Nomor telepon harus memiliki panjang 8 hingga 15 digit angka');
        return;
      }
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        payload: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          status: formData.status,
          roleIds: formData.roleIds
        }
      });
      setIsEditing(false);
      onSuccess?.();
    } catch {
      // Error handled by mutation hook
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Belum tersedia';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[95vw] w-[95vw]'
      showCloseButton={false}
      className='max-h-[92vh] flex flex-col p-5 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='flex items-center gap-3 min-w-0 flex-1'>
            <Avatar className='size-11 border border-border/60 shrink-0'>
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className='text-sm font-bold bg-primary/10 text-primary'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-0.5 min-w-0 flex-1'>
              <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
                <span className='truncate'>{formData.name || user.name}</span>
              </h3>
              <div className='flex items-center gap-2 text-xs text-muted-foreground truncate font-medium'>
                <span className='font-mono'>{formData.email || user.email}</span>
                <span>•</span>
                <span className='capitalize font-semibold text-primary/90'>
                  {user.primaryAudience === 'internal' ? 'Internal Klinik' : 'Eksternal'}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              shape='pill'
              onClick={async () => {
                await navigator.clipboard.writeText(user.id);
                toast.success('ID Pengguna disalin ke clipboard');
              }}
              title='Salin ID Pengguna'
              aria-label='Salin ID Pengguna'
              className='size-7 text-muted-foreground hover:text-primary hover:border-primary/40 shrink-0 cursor-pointer'
            >
              <Icons.copy className='size-3.5' />
            </Button>
            <StatusBadge
              status={formData.status === 'active' ? 'active' : 'inactive'}
              label={formData.status === 'active' ? 'Aktif' : 'Nonaktif'}
              size='sm'
            />
          </div>
        </div>

        {/* Scrollable Body - 3 Columns Layout */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1'>
          <form id='user-detail-form' onSubmit={handleSubmit} className='p-0 space-y-0'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1'>
              {/* Kolom 1: Identitas Kependudukan & Akun */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas & Kontak Akun
                </span>

                <PatientLineInput
                  id='user_fullName'
                  label='Nama Lengkap *'
                  placeholder='Nama lengkap pengguna'
                  value={formData.name}
                  onChange={(val) => handleFieldChange('name', val)}
                  required
                  disabled={!isEditing}
                  autoComplete='name'
                />

                <PatientLineInput
                  id='user_email'
                  label='Email Akun *'
                  type='email'
                  placeholder='pengguna@amanah.clinic'
                  value={formData.email}
                  onChange={(val) => handleFieldChange('email', val)}
                  required
                  disabled={!isEditing}
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
                    handleFieldChange('phone', cleaned);
                  }}
                  inputMode='numeric'
                  disabled={!isEditing}
                  autoComplete='tel'
                />
              </div>

              {/* Kolom 2: Penugasan Peran & Akses RBAC */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 flex items-center justify-between'>
                  <span>Penugasan Peran (RBAC)</span>
                  <span className='text-[10px] text-muted-foreground font-normal'>
                    {formData.roleIds.length} peran terpilih
                  </span>
                </span>

                {isLoadingRoles ? (
                  <div className='py-8 flex items-center justify-center gap-2 text-xs text-muted-foreground'>
                    <Icons.spinner className='size-4 animate-spin text-primary' />
                    <span>Memuat master peran...</span>
                  </div>
                ) : !isEditing ? (
                  <div className='space-y-2'>
                    {user.roles.length === 0 ? (
                      <div className='p-3.5 rounded-xl border border-dashed border-border bg-muted/20 text-center'>
                        <p className='text-xs text-muted-foreground font-medium'>
                          Akun ini belum memiliki peran aktif terhubung.
                        </p>
                      </div>
                    ) : (
                      user.roles.map((r) => (
                        <div
                          key={r.id}
                          className='p-3 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between gap-2'
                        >
                          <div className='min-w-0 space-y-0.5'>
                            <p className='text-xs font-bold text-foreground truncate'>{r.name}</p>
                            <p className='text-[10px] font-mono text-muted-foreground truncate'>
                              Kode: {r.code}
                            </p>
                          </div>
                          <div className='flex items-center gap-1 shrink-0'>
                            <Badge
                              variant='outline'
                              className='text-[10px] uppercase font-semibold text-muted-foreground'
                            >
                              {r.tier}
                            </Badge>
                            <Badge
                              variant='outline'
                              className='text-[10px] capitalize font-medium text-primary'
                            >
                              {r.audience}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className='space-y-2 max-h-[300px] overflow-y-auto pr-1'>
                    <p className='text-[11px] text-muted-foreground pb-1'>
                      Pilih satu atau lebih peran untuk akun ini. Menetapkan peran Internal akan
                      memberikan akses modul staf klinik.
                    </p>
                    {availableRoles.map((r) => {
                      const isSelected = formData.roleIds.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type='button'
                          onClick={() => handleRoleToggle(r.id)}
                          className={cn(
                            'w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer',
                            isSelected
                              ? 'border-primary bg-primary/5 text-foreground shadow-xs'
                              : 'border-border/60 bg-background text-muted-foreground hover:border-border hover:bg-muted/30'
                          )}
                        >
                          <div className='min-w-0 space-y-0.5'>
                            <div className='flex items-center gap-2'>
                              <div
                                className={cn(
                                  'size-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors',
                                  isSelected
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-muted-foreground/40 bg-background'
                                )}
                              >
                                {isSelected && <Icons.check className='size-3 stroke-[3]' />}
                              </div>
                              <span className='text-xs font-bold text-foreground truncate'>
                                {r.name}
                              </span>
                            </div>
                            <p className='text-[10px] font-mono pl-6 text-muted-foreground truncate'>
                              {r.code} • {r.audience}
                            </p>
                          </div>
                          <Badge
                            variant='outline'
                            className='text-[10px] uppercase font-semibold shrink-0'
                          >
                            {r.tier}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kolom 3: Profil Terhubung & Status Operasional (Singleton Pattern Table) */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Profil Klinis Terhubung & Operasional
                </span>

                {/* 1 Field 1 Record Singleton Pattern Table */}
                <div className='rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden bg-muted/10 text-xs'>
                  {/* Linked Profile Rows */}
                  {user.staffProfile ? (
                    <>
                      <div className='px-3.5 py-2.5 flex items-center justify-between'>
                        <span className='text-muted-foreground'>Kode Staf</span>
                        <span className='font-mono font-bold text-primary'>
                          {user.staffProfile.staffCode}
                        </span>
                      </div>
                      <div className='px-3.5 py-2.5 flex items-center justify-between'>
                        <span className='text-muted-foreground'>Profesi / Posisi</span>
                        <span className='font-medium text-foreground'>
                          {user.staffProfile.positionTitle || 'Staf Medis / Operasional'}
                        </span>
                      </div>
                      <div className='px-3.5 py-2.5 flex items-center justify-between'>
                        <span className='text-muted-foreground'>Departemen</span>
                        <span className='font-medium text-foreground'>
                          {user.staffProfile.departmentName || '-'}
                        </span>
                      </div>
                      <div className='px-3.5 py-2.5 flex items-center justify-between'>
                        <span className='text-muted-foreground'>Unit Poliklinik</span>
                        <span className='font-medium text-foreground'>
                          {user.staffProfile.primaryUnitName || 'Unit Umum'}
                        </span>
                      </div>
                    </>
                  ) : user.patientProfile ? (
                    <>
                      <div className='px-3.5 py-2.5 flex items-center justify-between'>
                        <span className='text-muted-foreground'>No. Rekam Medis</span>
                        <span className='font-mono font-bold text-emerald-700 dark:text-emerald-400'>
                          {user.patientProfile.medicalRecordNumber}
                        </span>
                      </div>
                      <div className='px-3.5 py-2.5 flex items-center justify-between'>
                        <span className='text-muted-foreground'>Golongan Darah</span>
                        <span className='font-medium text-foreground'>
                          {user.patientProfile.bloodType || '-'}
                        </span>
                      </div>
                      <div className='px-3.5 py-2.5 flex items-center justify-between'>
                        <span className='text-muted-foreground'>Total Kunjungan</span>
                        <span className='font-medium text-foreground'>
                          {user.patientProfile.visitCount || 0} kali
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className='px-3.5 py-2.5 flex items-center justify-between text-muted-foreground'>
                      <span>Tipe Entitas</span>
                      <span className='font-medium text-foreground'>Akun Identitas Mandiri</span>
                    </div>
                  )}

                  {/* Timestamp Rows */}
                  <div className='px-3.5 py-2.5 flex items-center justify-between'>
                    <span className='text-muted-foreground'>Waktu Registrasi</span>
                    <span className='font-medium text-foreground'>
                      {formatDateTime(user.createdAt)}
                    </span>
                  </div>
                  <div className='px-3.5 py-2.5 flex items-center justify-between'>
                    <span className='text-muted-foreground'>Terakhir Masuk</span>
                    <span className='font-medium text-foreground'>
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Belum pernah masuk'}
                    </span>
                  </div>
                  <div className='px-3.5 py-2.5 flex items-center justify-between'>
                    <span className='text-muted-foreground'>Pembaruan Terakhir</span>
                    <span className='font-medium text-foreground'>
                      {formatDateTime(user.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Operational Status Switch */}
                <div className='flex items-center justify-between pt-2 select-none border-t border-border/40'>
                  <div className='space-y-0.5'>
                    <label
                      htmlFor='user_active_switch'
                      className='text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer'
                    >
                      <span>Status Operasional Akun</span>
                    </label>
                    <p className='text-[11px] text-muted-foreground'>
                      {formData.status === 'active'
                        ? 'Akun aktif dan diizinkan mengakses layanan aplikasi.'
                        : 'Akun dinonaktifkan sementara dari akses sistem.'}
                    </p>
                  </div>
                  <Switch
                    id='user_active_switch'
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) =>
                      handleFieldChange('status', checked ? 'active' : 'inactive')
                    }
                    disabled={!isEditing}
                    aria-label='Status Operasional Akun'
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/40 flex items-center justify-end gap-2.5'>
          {!isEditing ? (
            <>
              <Button
                key='btn-close-view'
                type='button'
                variant='outline'
                size='card-action'
                shape='pill'
                onClick={onClose}
                className='px-6 font-semibold cursor-pointer'
              >
                Tutup
              </Button>
              <Button
                key='btn-unlock-edit'
                type='button'
                variant='default'
                size='card-action'
                shape='pill'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className='px-6 font-bold cursor-pointer'
              >
                <Icons.edit className='size-3.5 mr-1.5' />
                Edit Akun
              </Button>
            </>
          ) : (
            <>
              <Button
                key='btn-cancel-edit'
                type='button'
                variant='outline'
                size='card-action'
                shape='pill'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(false);
                  // Reset form data to current user values
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    status: user.status === 'active' ? 'active' : 'inactive',
                    roleIds: user.roles.map((r) => r.id)
                  });
                }}
                disabled={updateUserMutation.isPending}
                className='px-6 font-semibold cursor-pointer'
              >
                Batal
              </Button>
              <Button
                key='btn-submit-save'
                type='button'
                variant='default'
                size='card-action'
                shape='pill'
                onClick={handleSubmit}
                disabled={updateUserMutation.isPending}
                className='px-6 font-bold cursor-pointer'
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Icons.spinner className='size-3.5 mr-1.5 animate-spin' />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Icons.check className='size-3.5 mr-1.5' />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
