'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
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
  NO_PARENT_ROLE_SENTINEL,
  type Role,
  type RoleAudience,
  type RoleTier
} from '../../types/role.types';
import { cn } from '@/lib/utils';

export interface RoleHierarchyStepProps {
  tier: RoleTier;
  audience: RoleAudience;
  parentRoleId: string;
  macroRoles: Role[];
  onTierChange: (val: RoleTier) => void;
  onAudienceChange: (val: RoleAudience) => void;
  onParentRoleChange: (val: string) => void;
  disabled?: boolean;
}

export function RoleHierarchyStep({
  tier,
  audience,
  parentRoleId,
  macroRoles,
  onTierChange,
  onAudienceChange,
  onParentRoleChange,
  disabled
}: RoleHierarchyStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Di mana posisi peran ini dalam hierarki klinik?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan tingkatan peran, audiens pengguna, dan peran induk yang menaunginya.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        {/* Tier Selector */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold'>Tingkatan Peran</Label>
          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              disabled={disabled}
              onClick={() => onTierChange(ROLE_TIER.MACRO)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
                tier === ROLE_TIER.MACRO
                  ? 'border-2 border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <span className='text-xs font-bold text-foreground'>Makro (Induk)</span>
              <span className='text-[11px] text-muted-foreground mt-0.5'>
                Peran utama struktural di klinik
              </span>
            </button>

            <button
              type='button'
              disabled={disabled}
              onClick={() => onTierChange(ROLE_TIER.MICRO)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
                tier === ROLE_TIER.MICRO
                  ? 'border-2 border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <span className='text-xs font-bold text-foreground'>Mikro (Sub-Peran)</span>
              <span className='text-[11px] text-muted-foreground mt-0.5'>
                Spesialisasi atau bagian dari peran induk
              </span>
            </button>
          </div>
          {disabled && (
            <p className='text-[11px] text-muted-foreground italic pt-0.5'>
              Tingkatan peran administrator utama sistem dikunci permanen.
            </p>
          )}
        </div>

        {/* Audience Selector */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold'>Pengguna Peran (Audiens)</Label>
          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              disabled={disabled}
              onClick={() => onAudienceChange(AUDIENCE.INTERNAL)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
                audience === AUDIENCE.INTERNAL
                  ? 'border-2 border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <span className='text-xs font-bold text-foreground'>Staf Klinik</span>
              <span className='text-[11px] text-muted-foreground mt-0.5'>
                Tenaga medis, admin, kasir, atau operasional
              </span>
            </button>

            <button
              type='button'
              disabled={disabled}
              onClick={() => onAudienceChange(AUDIENCE.EXTERNAL)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
                audience === AUDIENCE.EXTERNAL
                  ? 'border-2 border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <span className='text-xs font-bold text-foreground'>Pasien Portal</span>
              <span className='text-[11px] text-muted-foreground mt-0.5'>
                Pasien dan pengunjung portal publik
              </span>
            </button>
          </div>
        </div>

        {/* Parent Role Dropdown */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold'>Peran Induk</Label>
          <Select value={parentRoleId} onValueChange={onParentRoleChange} disabled={disabled}>
            <SelectTrigger className='h-10 text-xs sm:text-sm w-full'>
              <SelectValue placeholder='Pilih peran induk...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PARENT_ROLE_SENTINEL}>Tanpa Induk (Mandiri)</SelectItem>
              {macroRoles.map((mr) => (
                <SelectItem key={mr.id} value={mr.id}>
                  {mr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-[11px] text-muted-foreground'>
            Tautkan ke peran induk jika peran ini merupakan bagian spesifik dari peran lain.
          </p>
        </div>
      </div>
    </div>
  );
}
