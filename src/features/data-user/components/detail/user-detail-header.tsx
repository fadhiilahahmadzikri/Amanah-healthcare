'use client';

import React from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Icons } from '@/components/icons';
import type { UserItem } from '../../api/types';

export interface UserDetailHeaderProps {
  user: UserItem;
  displayName: string;
  status: string;
}

export function UserDetailHeader({ user, displayName, status }: UserDetailHeaderProps) {
  const initials = (displayName || user.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(user.id);
    toast.success('ID Pengguna disalin ke clipboard');
  };

  return (
    <div className='shrink-0 pb-4 border-b border-border/40 flex items-center justify-between gap-4 min-w-0'>
      <div className='flex items-center gap-3.5 min-w-0 flex-1'>
        <Avatar className='size-11 border border-border/60 shrink-0'>
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className='text-sm font-bold bg-muted text-foreground'>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className='space-y-0.5 min-w-0 flex-1'>
          <h3 className='text-lg font-bold text-foreground tracking-tight truncate'>
            {displayName || user.name}
          </h3>
          <p className='text-xs text-muted-foreground font-mono truncate'>
            {user.email}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-2.5 shrink-0'>
        <Button
          type='button'
          variant='outline'
          size='icon'
          shape='pill'
          onClick={handleCopyId}
          title='Salin ID Pengguna'
          aria-label='Salin ID Pengguna'
          className='size-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer'
        >
          <Icons.copy className='size-3.5' />
        </Button>
        <StatusBadge
          status={status === 'active' ? 'active' : 'inactive'}
          label={status === 'active' ? 'Aktif' : 'Nonaktif'}
          size='sm'
        />
      </div>
    </div>
  );
}
