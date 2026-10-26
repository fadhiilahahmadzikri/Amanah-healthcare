'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchEngineDialog, useStateSearchEngine } from '@/components/search-engine';

export interface StaffManagementToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  staffsCount: number;
  invitationsCount: number;
  onInviteStaff: () => void;
}

export function StaffManagementToolbar({
  searchQuery,
  onSearchChange,
  staffsCount,
  invitationsCount,
  onInviteStaff
}: StaffManagementToolbarProps) {
  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: onSearchChange,
    id: 'staff-management-search',
    placeholder: 'Cari nama atau email staf...'
  });

  return (
    <>
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      <div className='flex items-center justify-between gap-2 sm:gap-3 shrink-0 w-full'>
        {/* Left Group: Search Button/Input + Hugging TabsList */}
        <div className='flex items-center gap-2 min-w-0'>
          {/* Mobile: Search Button (Pojok Kiri, Sejajar Staf) */}
          <Button
            type='button'
            variant={searchQuery ? 'default' : 'outline'}
            size='icon'
            onClick={searchEngine.open}
            aria-label='Buka dialog pencarian staf'
            title={searchQuery ? `Pencarian aktif: "${searchQuery}"` : 'Cari staf...'}
            className='size-9 rounded-lg shrink-0 sm:hidden cursor-pointer'
          >
            <Icons.search className='size-4' />
          </Button>

          {/* Desktop: Full Search Input */}
          <div className='relative hidden sm:block sm:w-72 shrink-0'>
            <Icons.search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Cari nama atau email staf...'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='pl-8 h-9 text-xs'
            />
          </div>

          {/* Tabs List (Hugging Content) */}
          <TabsList className='inline-flex h-9 w-fit shrink-0'>
            <TabsTrigger value='members' className='text-xs gap-1.5 px-2.5 sm:px-3'>
              <Icons.users className='h-3.5 w-3.5' />
              <span>Staf ({staffsCount})</span>
            </TabsTrigger>
            <TabsTrigger value='invitations' className='text-xs gap-1.5 px-2.5 sm:px-3'>
              <Icons.mail className='h-3.5 w-3.5' />
              <span>Undangan ({invitationsCount})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Right: Undang Staf Button (Mobile: Icon-Only, Desktop: Icon + Text) */}
        <div className='flex items-center gap-2 shrink-0 justify-end'>
          <Button
            onClick={onInviteStaff}
            size='sm'
            aria-label='Undang Staf'
            className='h-9 px-2.5 sm:px-3 sm:gap-1.5 cursor-pointer shrink-0'
          >
            <Icons.userPlus className='h-4 w-4' />
            <span className='hidden sm:inline'>Undang Staf</span>
          </Button>
        </div>
      </div>
    </>
  );
}
