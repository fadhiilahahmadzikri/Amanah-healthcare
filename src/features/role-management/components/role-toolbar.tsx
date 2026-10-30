'use client';

import * as React from 'react';
import { IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AUDIENCE,
  ROLE_TIER,
  type AudienceType,
  type RoleTierType
} from '@/core/auth/permissions.constants';

export interface RoleToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  tierFilter: 'all' | RoleTierType;
  onTierFilterChange: (value: 'all' | RoleTierType) => void;
  audienceFilter: 'all' | AudienceType;
  onAudienceFilterChange: (value: 'all' | AudienceType) => void;
  clinicalFilter: 'all' | 'clinical' | 'operational';
  onClinicalFilterChange: (value: 'all' | 'clinical' | 'operational') => void;
  onRefresh: () => void;
  isRefetching: boolean;
  onAddClick?: () => void;
}

export function RoleToolbar({
  searchQuery,
  onSearchChange,
  tierFilter,
  onTierFilterChange,
  audienceFilter,
  onAudienceFilterChange,
  clinicalFilter,
  onClinicalFilterChange,
  onRefresh,
  isRefetching,
  onAddClick
}: RoleToolbarProps) {
  return (
    <div className='flex flex-col gap-3'>
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

          {onAddClick && (
            <Button size='sm' onClick={onAddClick} className='h-9 text-xs gap-1.5 font-medium'>
              <IconPlus className='size-4' />
              Tambah Peran
            </Button>
          )}
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2 pt-1'>
        <Select value={tierFilter} onValueChange={onTierFilterChange}>
          <SelectTrigger className='w-[130px] h-8 text-xs'>
            <SelectValue placeholder='Tier' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Semua Tier</SelectItem>
            <SelectItem value={ROLE_TIER.MACRO}>Macro</SelectItem>
            <SelectItem value={ROLE_TIER.MICRO}>Micro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={audienceFilter} onValueChange={onAudienceFilterChange}>
          <SelectTrigger className='w-[140px] h-8 text-xs'>
            <SelectValue placeholder='Audience' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Semua Audience</SelectItem>
            <SelectItem value={AUDIENCE.INTERNAL}>Internal</SelectItem>
            <SelectItem value={AUDIENCE.EXTERNAL}>Eksternal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={clinicalFilter} onValueChange={onClinicalFilterChange}>
          <SelectTrigger className='w-[140px] h-8 text-xs'>
            <SelectValue placeholder='Sifat' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Semua Sifat</SelectItem>
            <SelectItem value='clinical'>Klinis</SelectItem>
            <SelectItem value='operational'>Operasional</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
