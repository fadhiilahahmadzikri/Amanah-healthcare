import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { VaccineAdministrationStatus } from '../../types/immunization.types';

export interface MilestoneStatusBadgeProps {
  status: VaccineAdministrationStatus;
}

export function MilestoneStatusBadge({ status }: MilestoneStatusBadgeProps) {
  switch (status) {
    case 'GIVEN':
      return (
        <Badge
          variant='outline'
          className='bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-medium px-2 py-0.5'
        >
          Sudah Diberikan
        </Badge>
      );
    case 'POSTPONED':
      return (
        <Badge
          variant='outline'
          className='bg-amber-50 text-amber-700 border-amber-300 text-[10px] font-medium px-2 py-0.5'
        >
          Ditunda
        </Badge>
      );
    case 'CONTRAINDICATED':
      return (
        <Badge
          variant='outline'
          className='bg-rose-50 text-rose-700 border-rose-300 text-[10px] font-medium px-2 py-0.5'
        >
          Kontraindikasi
        </Badge>
      );
    case 'NOT_GIVEN':
    default:
      return (
        <Badge
          variant='outline'
          className='bg-neutral-100 text-neutral-600 border-neutral-300 text-[10px] font-medium px-2 py-0.5'
        >
          Belum Diberikan
        </Badge>
      );
  }
}
