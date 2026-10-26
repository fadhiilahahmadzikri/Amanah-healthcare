'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SearchInput } from '@/shared/ui/search-input';
import { cn } from '@/lib/utils';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import type { ClinicalHistoryTabType } from '../../api/history-queries';

export interface ClinicalHistoryMobileFilterToolbarProps {
  activeTab: ClinicalHistoryTabType;
  search: string;
  onSearchChange: (val: string) => void;
  patientId: string;
  onPatientChange: (val: string) => void;
  familyMembers: Array<{
    id: string;
    fullName: string;
    relationshipLabel?: string;
    relationship: string;
  }>;
  hasFilters: boolean;
  onReset: () => void;
  className?: string;
}

export function ClinicalHistoryMobileFilterToolbar({
  activeTab,
  search,
  onSearchChange,
  patientId,
  onPatientChange,
  familyMembers,
  hasFilters,
  onReset,
  className
}: ClinicalHistoryMobileFilterToolbarProps) {
  const searchPlaceholder =
    activeTab === 'maternity' ? 'Cari nama ibu / NIK...' : 'Cari nama anak / NIK...';

  return (
    <div className={cn('flex flex-col gap-2.5 font-sans select-none', className)}>
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full'>
        {/* Search Input using shared design system component */}
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          ariaLabel={searchPlaceholder}
          className='w-full sm:flex-1 max-w-none'
        />

        {/* Family Member Radix UI Select Dropdown */}
        {familyMembers.length > 0 && (
          <div className='w-full sm:w-auto sm:min-w-[200px]'>
            <Select
              value={patientId || 'ALL'}
              onValueChange={(val) => onPatientChange(val === 'ALL' ? '' : val)}
            >
              <SelectTrigger
                size='sm'
                className='w-full h-8 text-xs bg-card border-border shadow-2xs'
              >
                <SelectValue placeholder='Semua Anggota Keluarga' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL' className='text-xs'>
                  Semua Anggota Keluarga
                </SelectItem>
                {familyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id} className='text-xs'>
                    {member.fullName} ({getRelationshipLabel(member.relationship)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reset Filter Action */}
        {hasFilters && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            shape='pill'
            onClick={onReset}
            className='h-8 text-xs text-muted-foreground hover:text-foreground self-end sm:self-auto shrink-0 px-3'
          >
            <Icons.close className='size-3 mr-1.5' />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
