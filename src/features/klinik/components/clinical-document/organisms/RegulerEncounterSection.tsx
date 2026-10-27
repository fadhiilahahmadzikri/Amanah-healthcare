/* oxlint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { FormText } from '../atoms/FormText';
import { SectionHeader } from '../atoms/SectionHeader';
import type { RegulerFormData } from '../types';

export interface RegulerEncounterSectionProps {
  data?: Partial<RegulerFormData>;
}

export const RegulerEncounterSection: React.FC<RegulerEncounterSectionProps> = ({ data }) => {
  return (
    <div className='w-full mb-2'>
      <SectionHeader title='I. INFORMASI PENDAFTARAN & KUNJUNGAN' customPt={8} className='mb-1' />

      <table className='w-full border-collapse border border-black table-fixed text-[7.5pt]'>
        <colgroup>
          <col style={{ width: '18%' }} />
          <col style={{ width: '32%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '32%' }} />
        </colgroup>
        <tbody>
          <tr className='border-b border-black h-[20px]'>
            <td className='px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold'>
              <FormText customPt={7.2} bold>
                Kode Booking
              </FormText>
            </td>
            <td className='px-1.5 py-0.5 border-r border-black'>
              <FormText customPt={7.2} bold>
                {data?.bookingCode || '-'}
              </FormText>
            </td>
            <td className='px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold'>
              <FormText customPt={7.2} bold>
                Nomor Antrean
              </FormText>
            </td>
            <td className='px-1.5 py-0.5'>
              <FormText customPt={7.2} bold>
                {data?.queueNumber || '-'}
              </FormText>
            </td>
          </tr>
          <tr className='border-b border-black h-[20px]'>
            <td className='px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold'>
              <FormText customPt={7.2} bold>
                Layanan / Poli
              </FormText>
            </td>
            <td className='px-1.5 py-0.5 border-r border-black'>
              <FormText customPt={7.2}>{data?.serviceName || 'Poli Umum'}</FormText>
            </td>
            <td className='px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold'>
              <FormText customPt={7.2} bold>
                Dokter Pemeriksa
              </FormText>
            </td>
            <td className='px-1.5 py-0.5'>
              <FormText customPt={7.2} bold>
                {data?.doctorName || '-'}
              </FormText>
            </td>
          </tr>
          <tr className='h-[20px]'>
            <td className='px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold'>
              <FormText customPt={7.2} bold>
                Waktu & Sesi
              </FormText>
            </td>
            <td colSpan={3} className='px-1.5 py-0.5'>
              <FormText customPt={7.2}>{data?.scheduledTime || '-'}</FormText>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
