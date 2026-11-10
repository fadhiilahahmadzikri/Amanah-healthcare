'use client';

import React from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { UserItem } from '../api/types';
import { useUserDetailModal } from '../model/useUserDetailModal';
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

export function UserDetailModal(props: UserDetailModalProps) {
  const { user, isOpen, onClose } = props;
  const form = useUserDetailModal(props);

  if (!user) return null;

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
          displayName={form.formData.name || user.name}
          status={form.formData.status}
        />

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1 space-y-6'>
          <form
            id='user-detail-form'
            onSubmit={(e) => {
              e.preventDefault();
              if (form.isEditing && form.hasChanges) {
                form.handleSubmit(e);
              }
            }}
            className='p-0 space-y-6'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1'>
              {/* Kolom 1: Identitas & Kontak Akun */}
              <div className='rounded-2xl border border-border/70 bg-surface-subtle/80 dark:bg-muted/20 p-4 sm:p-5 shadow-xs'>
                <UserAccountSection
                  user={user}
                  formData={form.formData}
                  errors={form.errors}
                  isEditing={form.isEditing}
                  onFieldChange={form.handleFieldChange}
                  onBlur={form.handleFieldBlur}
                  formatDateTime={form.formatDateTime}
                />
              </div>

              {/* Kolom 2: Hak Akses & Peran Pengguna */}
              <div className='rounded-2xl border border-border/70 bg-surface-subtle/80 dark:bg-muted/20 p-4 sm:p-5 shadow-xs'>
                <UserRolesSection
                  user={user}
                  formData={form.formData}
                  availableRoles={form.availableRoles}
                  isLoadingRoles={form.isLoadingRoles}
                  isEditing={form.isEditing}
                  onRoleToggle={form.handleRoleToggle}
                />
              </div>

              {/* Kolom 3: Profil Terhubung (Klinis / Staf) */}
              <div className='rounded-2xl border border-border/70 bg-surface-subtle/80 dark:bg-muted/20 p-4 sm:p-5 shadow-xs'>
                <UserProfileSection
                  user={user}
                  formatDateTime={form.formatDateTime}
                />
              </div>
            </div>

            {/* Kolom Penuh: Pasien & Anggota Keluarga Terafiliasi */}
            <div className='rounded-2xl border border-border/70 bg-surface-subtle/80 dark:bg-muted/20 p-4 sm:p-5 shadow-xs'>
              <UserAffiliationsSection affiliations={user.patientAffiliations} />
            </div>
          </form>
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/40 flex items-center justify-end gap-2.5'>
          {!form.isEditing ? (
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
                  form.handleUnlockEdit();
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
                  form.handleCancelEdit();
                }}
                disabled={form.isSubmitting}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit(e);
                }}
                disabled={form.isSubmitting || !form.hasChanges}
                className='px-6 font-bold cursor-pointer'
              >
                {form.isSubmitting ? (
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
