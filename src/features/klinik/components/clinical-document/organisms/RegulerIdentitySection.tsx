/* oxlint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { FormText } from '../atoms/FormText';
import { SectionHeader } from '../atoms/SectionHeader';
import type { RegulerFormData } from '../types';

export interface RegulerIdentitySectionProps {
  identity?: RegulerFormData['identity'];
  emergencyContact?: RegulerFormData['emergencyContact'];
}

export const RegulerIdentitySection: React.FC<RegulerIdentitySectionProps> = ({
  identity,
  emergencyContact,
}) => {
  return (
    <div className="w-full mb-2">
      <SectionHeader title="II. DATA IDENTITAS PASIEN" customPt={8} className="mb-1" />

      <table className="w-full border-collapse border border-black table-fixed text-[7.5pt]">
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '30%' }} />
        </colgroup>
        <tbody>
          <tr className="border-b border-black h-[21px]">
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>NIK (KTP)</FormText>
            </td>
            <td className="px-1.5 py-0.5 border-r border-black font-mono">
              <FormText customPt={7.2} bold>{identity?.nik || '-'}</FormText>
            </td>
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Nama Lengkap</FormText>
            </td>
            <td className="px-1.5 py-0.5 font-semibold">
              <FormText customPt={7.2} bold>{identity?.fullName || '-'}</FormText>
            </td>
          </tr>

          <tr className="border-b border-black h-[21px]">
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Tempat / Tgl Lahir</FormText>
            </td>
            <td className="px-1.5 py-0.5 border-r border-black">
              <FormText customPt={7.2}>
                {[identity?.birthPlace, identity?.birthDate].filter(Boolean).join(', ') || '-'}
              </FormText>
            </td>
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Jenis Kelamin / Usia</FormText>
            </td>
            <td className="px-1.5 py-0.5">
              <FormText customPt={7.2}>
                {[identity?.gender, identity?.age ? `(${identity.age})` : ''].filter(Boolean).join(' ') || '-'}
              </FormText>
            </td>
          </tr>

          <tr className="border-b border-black h-[21px]">
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Golongan Darah</FormText>
            </td>
            <td className="px-1.5 py-0.5 border-r border-black">
              <FormText customPt={7.2} bold>{identity?.bloodType || '-'}</FormText>
            </td>
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Nama Ibu Kandung</FormText>
            </td>
            <td className="px-1.5 py-0.5">
              <FormText customPt={7.2}>{identity?.motherName || '-'}</FormText>
            </td>
          </tr>

          <tr className="border-b border-black h-[21px]">
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Pekerjaan</FormText>
            </td>
            <td className="px-1.5 py-0.5 border-r border-black">
              <FormText customPt={7.2}>{identity?.occupation || '-'}</FormText>
            </td>
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Agama</FormText>
            </td>
            <td className="px-1.5 py-0.5">
              <FormText customPt={7.2}>{identity?.religion || '-'}</FormText>
            </td>
          </tr>

          <tr className="border-b border-black h-[21px]">
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>No. Telepon / WA</FormText>
            </td>
            <td className="px-1.5 py-0.5 border-r border-black">
              <FormText customPt={7.2}>{identity?.phoneNumber || '-'}</FormText>
            </td>
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Email Pasien</FormText>
            </td>
            <td className="px-1.5 py-0.5">
              <FormText customPt={7.2}>{identity?.email || '-'}</FormText>
            </td>
          </tr>

          <tr className="border-b border-black h-[24px]">
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold align-top">
              <FormText customPt={7.2}>Alamat Lengkap</FormText>
            </td>
            <td colSpan={3} className="px-1.5 py-0.5">
              <FormText customPt={7.2}>{identity?.address || '-'}</FormText>
            </td>
          </tr>

          <tr className="h-[21px]">
            <td className="px-1.5 py-0.5 bg-gray-50 border-r border-black font-semibold">
              <FormText customPt={7.2}>Kontak Darurat</FormText>
            </td>
            <td colSpan={3} className="px-1.5 py-0.5">
              <FormText customPt={7.2}>
                {emergencyContact?.name
                  ? `${emergencyContact.name} (${emergencyContact.relationship || 'Keluarga'}) - Telp: ${emergencyContact.phoneNumber || '-'}`
                  : '-'}
              </FormText>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
