'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { UserItem } from '../api/types';
import { activeRolesQueryOptions } from '../api/queries';
import { useUpdateUserMutation } from '../api/mutations';
import { UserDetailHeader } from './detail/user-detail-header';
import { UserAccountSection } from './detail/user-account-section';
import { UserRolesSection } from './detail/user-roles-section';
import { UserProfileSection } from './detail/user-profile-section';
import { UserAffiliationsSection } from './detail/user-affiliations-section';

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
  onSuccess,
}: UserDetailModalProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    roleIds: [] as string[],
  });

  const { data: availableRoles = [], isLoading: isLoadingRoles } = useQuery(
    activeRolesQueryOptions(),
  );

  const updateUserMutation = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || user.staffProfile?.phone || user.patientProfile?.phone || '',
        status: user.status === 'active' ? 'active' : 'inactive',
        roleIds: user.roles.map((r) => r.id),
      });
      setIsEditing(initialEditing);
    }
  }, [user, initialEditing, isOpen]);

  if (!user) return null;

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
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        payload: {
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          status: formData.status,
          roleIds: formData.roleIds,
        },
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
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-[97vw] max-w-[97vw]'
      backdropClassName='p-0'
      showCloseButton={false}
      className='w-[97vw] max-w-[97vw] h-[97vh] max-h-[97vh] flex flex-col p-5 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header */}
        <UserDetailHeader
          user={user}
          displayName={formData.name || user.name}
          status={formData.status}
        />

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1 space-y-6'>
          <form id='user-detail-form' onSubmit={handleSubmit} className='p-0 space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-1'>
              {/* Kolom 1: Identitas & Kontak Akun */}
              <UserAccountSection
                user={user}
                formData={formData}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
                formatDateTime={formatDateTime}
              />

              {/* Kolom 2: Hak Akses & Peran Pengguna (Bebas Jargon) */}
              <UserRolesSection
                user={user}
                formData={formData}
                availableRoles={availableRoles}
                isLoadingRoles={isLoadingRoles}
                isEditing={isEditing}
                onRoleToggle={handleRoleToggle}
              />

              {/* Kolom 3: Profil Terhubung (Klinis / Staf) */}
              <UserProfileSection
                user={user}
                formatDateTime={formatDateTime}
              />
            </div>

            {/* Kolom Penuh: Pasien & Anggota Keluarga Terafiliasi */}
            <UserAffiliationsSection affiliations={user.patientAffiliations} />
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
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || user.staffProfile?.phone || user.patientProfile?.phone || '',
                    status: user.status === 'active' ? 'active' : 'inactive',
                    roleIds: user.roles.map((r) => r.id),
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
