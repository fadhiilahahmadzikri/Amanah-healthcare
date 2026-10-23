/* oxlint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { FormText } from '../atoms/FormText';
import { SectionHeader } from '../atoms/SectionHeader';
import type { RegulerFormData } from '../types';

export interface RegulerClinicalNotesSectionProps {
  clinical?: RegulerFormData['clinical'];
}

export const RegulerClinicalNotesSection: React.FC<RegulerClinicalNotesSectionProps> = ({
  clinical,
}) => {
  return (
    <div className="w-full mb-3">
      <SectionHeader title="III. ANAMNESIS & PEMERIKSAAN KLINIS DOKTER" customPt={8} className="mb-1" />

      {/* Vital signs bar */}
      <table className="w-full border-collapse border border-black table-fixed mb-1.5 text-[7.5pt]">
        <colgroup>
          <col style={{ width: '16%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
        </colgroup>
        <tbody>
          <tr className="h-[20px]">
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold text-center">
              <FormText customPt={7} bold align="center">Tinggi Badan</FormText>
            </td>
            <td className="px-1.5 py-0.5 border-r border-black text-center">
              <FormText customPt={7.2} align="center">{clinical?.vitalHeightCm || '-'}</FormText>
            </td>
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold text-center">
              <FormText customPt={7} bold align="center">Berat Badan</FormText>
            </td>
            <td className="px-1.5 py-0.5 border-r border-black text-center">
              <FormText customPt={7.2} align="center">{clinical?.vitalWeightKg || '-'}</FormText>
            </td>
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold text-center">
              <FormText customPt={7} bold align="center">Tekanan Darah</FormText>
            </td>
            <td className="px-1.5 py-0.5 text-center">
              <FormText customPt={7.2} align="center">{clinical?.vitalBloodPressure || '-'}</FormText>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Complaints and Observations Box */}
      <div className="w-full border border-black p-2 bg-white flex flex-col gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-[7.5pt] uppercase underline">Keluhan Utama (Chief Complaint):</span>
          </div>
          <div className="min-h-[34px] px-1.5 py-1 bg-gray-50 border border-gray-200 text-[7.5pt]">
            <FormText customPt={7.2}>
              {clinical?.chiefComplaint || 'Tidak ada keluhan spesifik yang dicatat.'}
            </FormText>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-[7.5pt] uppercase underline text-red-700">Riwayat Alergi Obat / Makanan:</span>
          </div>
          <div className="min-h-[22px] px-1.5 py-1 bg-amber-50/50 border border-amber-200 text-[7.5pt]">
            <FormText customPt={7.2} bold={Boolean(clinical?.allergyHistory && clinical.allergyHistory !== '-')}>
              {clinical?.allergyHistory || 'Tidak ada riwayat alergi yang dilaporkan (Bebas Alergi)'}
            </FormText>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-[7.5pt] uppercase underline">Catatan Pemeriksaan & Instruksi Terapi:</span>
          </div>
          <div className="min-h-[50px] px-1.5 py-1 bg-gray-50 border border-gray-200 text-[7.5pt]">
            <FormText customPt={7.2}>
              {clinical?.additionalNotes || '-'}
            </FormText>
          </div>
        </div>
      </div>
    </div>
  );
};
