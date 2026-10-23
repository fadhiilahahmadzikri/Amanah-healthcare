/* oxlint-disable next/no-img-element, jsx-a11y/control-has-associated-label */
import React from 'react';
import { FormText } from '../atoms/FormText';
import { DoubleDivider } from '../atoms/DoubleDivider';
import type { RegulerHeaderConfig } from '../types';

export interface RegulerHeaderProps {
  config: RegulerHeaderConfig;
  medicalRecordNumber?: string;
  registrationDate?: string;
  bookingCode?: string;
}

export const RegulerHeader: React.FC<RegulerHeaderProps> = ({
  config,
  medicalRecordNumber,
  registrationDate,
  bookingCode,
}) => {
  return (
    <div className="w-full mb-3">
      {/* Top Kop Surat */}
      <div className="w-full flex items-center justify-between pb-2">
        {/* Left: Clinic Brand Logo */}
        <div className="w-[120px] flex items-center justify-center p-1">
          <img
            src="/logo.svg"
            alt="Klinik Amanah Healthcare"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo-symbol-only.svg';
            }}
          />
        </div>

        {/* Center: Clinic Institutional Text */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <FormText customPt={11} bold className="tracking-wide text-gray-900 leading-tight">
            {config.clinicName}
          </FormText>
          <FormText customPt={8.5} bold className="tracking-normal text-emerald-800 leading-tight mt-0.5">
            {config.clinicTagline}
          </FormText>
          <FormText customPt={7.2} className="text-gray-600 leading-tight mt-1">
            {config.clinicAddress}
          </FormText>
          <FormText customPt={6.8} className="text-gray-500 leading-tight mt-0.5">
            {config.clinicContact}
          </FormText>
        </div>

        {/* Right: RM Code Box */}
        <div className="w-[140px] flex flex-col border border-black bg-white text-center">
          <div className="bg-gray-100 border-b border-black py-0.5">
            <FormText customPt={7} bold align="center">
              NOMOR REKAM MEDIS
            </FormText>
          </div>
          <div className="py-1 px-1 min-h-[24px] flex items-center justify-center">
            <FormText customPt={9} bold align="center">
              {medicalRecordNumber || '-'}
            </FormText>
          </div>
          {bookingCode && (
            <div className="border-t border-black/40 py-0.5 px-1 bg-gray-50">
              <FormText customPt={6} align="center" className="text-gray-600">
                {bookingCode}
              </FormText>
            </div>
          )}
        </div>
      </div>

      {/* Double Divider Line */}
      <DoubleDivider />

      {/* Form Title & Subtitle */}
      <div className="w-full flex flex-col items-center justify-center mt-2.5 mb-1.5">
        <FormText customPt={10.5} bold underline align="center" className="tracking-wide">
          {config.formTitle}
        </FormText>
        <FormText customPt={8} bold align="center" className="text-gray-700 tracking-wider mt-0.5">
          {config.formSubtitle}
        </FormText>
        {registrationDate && (
          <FormText customPt={7} italic align="center" className="text-gray-500 mt-0.5">
            Tanggal Registrasi: {registrationDate}
          </FormText>
        )}
      </div>
    </div>
  );
};
