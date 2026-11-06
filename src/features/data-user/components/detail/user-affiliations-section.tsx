'use client';

import React from 'react';
import type { UserAffiliationItem } from '../../api/types';

export interface UserAffiliationsSectionProps {
  affiliations?: UserAffiliationItem[];
}

export function UserAffiliationsSection({ affiliations = [] }: UserAffiliationsSectionProps) {
  // Saring diri sendiri, hanya tampilkan profil anggota keluarga / afiliasi nyata
  const familyAffiliations = affiliations.filter((aff) => {
    const rel = (aff.relationshipName || aff.relationLabel || '').trim().toLowerCase();
    return rel !== 'diri sendiri';
  });

  if (familyAffiliations.length === 0) return null;

  return (
    <div className='space-y-3 pt-4 border-t border-border/40'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold text-muted-foreground'>
          Keluarga &amp; Afiliasi Terhubung
        </span>
        <span className='text-[10px] text-muted-foreground'>
          {familyAffiliations.length} terhubung
        </span>
      </div>

      <div className='divide-y divide-border/40 text-xs'>
        {familyAffiliations.map((aff) => (
          <div key={aff.id} className='py-2.5 flex items-center justify-between gap-4'>
            <div className='min-w-0 flex items-center gap-2.5'>
              <span className='font-medium text-foreground truncate'>{aff.fullName}</span>
              <span className='font-mono text-muted-foreground text-[11px]'>
                ({aff.medicalRecordNumber})
              </span>
            </div>
            <span className='text-muted-foreground text-[11px] font-medium shrink-0 capitalize'>
              {aff.relationshipName || aff.relationLabel || 'Keluarga'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
