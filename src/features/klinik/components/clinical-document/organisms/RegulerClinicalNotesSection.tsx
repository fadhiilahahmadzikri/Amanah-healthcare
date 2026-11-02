/* oxlint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { FormText } from '../atoms/FormText';
import { SectionHeader } from '../atoms/SectionHeader';
import type { RegulerFormData } from '../types';

export interface RegulerClinicalNotesSectionProps {
  chiefComplaint?: string;
  clinical?: RegulerFormData['clinical'];
}

export const RegulerClinicalNotesSection: React.FC<RegulerClinicalNotesSectionProps> = ({
  chiefComplaint,
  clinical
}) => {
  const displayComplaint = chiefComplaint || clinical?.chiefComplaint || '-';

  return (
    <div className='w-full mb-3'>
      <SectionHeader title='III. KELUHAN UTAMA & ALASAN KUNJUNGAN' customPt={8} className='mb-1' />

      {/* Chief Complaint Box (1:1 with Standard Registration Flow) */}
      <div className='w-full border border-black p-2.5 bg-white flex flex-col gap-1.5'>
        <div className='flex items-center gap-1.5 mb-0.5'>
          <span className='font-bold text-[7.5pt] uppercase underline'>
            Keluhan Utama (Chief Complaint):
          </span>
        </div>
        <div className='min-h-[48px] px-2 py-1.5 border border-black/40 text-[7.5pt]'>
          <FormText customPt={7.5}>
            {displayComplaint !== '-'
              ? displayComplaint
              : 'Tidak ada keluhan klinis yang dicatat saat pendaftaran.'}
          </FormText>
        </div>
      </div>
    </div>
  );
};
