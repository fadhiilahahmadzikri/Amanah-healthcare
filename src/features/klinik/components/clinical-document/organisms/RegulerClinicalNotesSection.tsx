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
    <div className='w-full mb-2'>
      <SectionHeader title='III. KELUHAN' customPt={8} className='mb-1' />

      <table className='w-full border-collapse border border-black table-fixed text-[7.5pt]'>
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '80%' }} />
        </colgroup>
        <tbody>
          <tr className='h-[28px]'>
            <td className='px-1.5 py-1 bg-gray-50 border-r border-black font-semibold align-top'>
              <FormText customPt={7.2}>Keluhan</FormText>
            </td>
            <td className='px-1.5 py-1 align-top'>
              <FormText customPt={7.2}>
                {displayComplaint !== '-'
                  ? displayComplaint
                  : 'Tidak ada keluhan klinis yang dicatat saat pendaftaran.'}
              </FormText>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
