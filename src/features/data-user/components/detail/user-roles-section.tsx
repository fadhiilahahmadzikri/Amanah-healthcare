'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { RoleItem, UserItem } from '../../api/types';

export interface UserRolesSectionProps {
  user: UserItem;
  formData: {
    roleIds: string[];
  };
  availableRoles: RoleItem[];
  isLoadingRoles: boolean;
  isEditing: boolean;
  onRoleToggle: (roleId: string) => void;
}

export function UserRolesSection({
  user,
  formData,
  availableRoles,
  isLoadingRoles,
  isEditing,
  onRoleToggle,
}: UserRolesSectionProps) {
  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 flex items-center justify-between'>
        <span>Hak Akses &amp; Peran</span>
        <span className='text-[10px] text-muted-foreground font-normal'>
          {formData.roleIds.length} peran
        </span>
      </span>

      {isLoadingRoles ? (
        <div className='py-8 flex items-center justify-center gap-2 text-xs text-muted-foreground'>
          <Icons.spinner className='size-4 animate-spin text-primary' />
          <span>Memuat peran...</span>
        </div>
      ) : !isEditing ? (
        <div className='divide-y divide-border/40 text-xs'>
          {user.roles.length === 0 ? (
            <div className='py-6 text-center text-muted-foreground'>Belum ada peran terhubung</div>
          ) : (
            user.roles.map((r) => (
              <div key={r.id} className='py-2.5 flex items-center justify-between'>
                <span className='font-medium text-foreground'>{r.name}</span>
                <span className='text-[11px] text-muted-foreground'>
                  {r.audience === 'internal' ? 'Internal' : 'Publik'}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className='space-y-2 max-h-[320px] overflow-y-auto pr-1'>
          {availableRoles.map((r) => {
            const isSelected = formData.roleIds.includes(r.id);
            return (
              <button
                key={r.id}
                type='button'
                onClick={() => onRoleToggle(r.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer',
                  isSelected
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/30'
                )}
              >
                <div className='flex items-center gap-2.5'>
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
                  <span className='text-xs font-medium text-foreground'>{r.name}</span>
                </div>
                <span className='text-[10px] text-muted-foreground'>
                  {r.audience === 'internal' ? 'Internal' : 'Publik'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
