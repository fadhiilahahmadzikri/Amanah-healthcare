'use client';

import * as React from 'react';
import { IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface RoleToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefetching: boolean;
  onAddClick: () => void;
}

export function RoleToolbar({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefetching,
  onAddClick
}: RoleToolbarProps) {
  return (
    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
      <div className='relative flex-1 max-w-sm'>
        <IconSearch className='absolute left-3 top-2.5 size-4 text-muted-foreground' />
        <Input
          placeholder='Cari peran...'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-9 h-9 text-xs'
        />
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={isRefetching}
          className='h-9 text-xs'
        >
          <IconRefresh className={`size-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Segarkan
        </Button>

        <Button size='sm' onClick={onAddClick} className='h-9 text-xs gap-1.5 font-medium'>
          <IconPlus className='size-4' />
          Tambah Peran
        </Button>
      </div>
    </div>
  );
}
