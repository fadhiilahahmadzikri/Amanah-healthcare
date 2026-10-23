/* oxlint-disable next/no-img-element */
import React from 'react';
import { FormText } from '../atoms/FormText';
import { DoubleDivider } from '../atoms/DoubleDivider';
import type { PmbHeaderConfig } from '../types';

export interface PmbHeaderProps {
  config: PmbHeaderConfig;
  allergy?: string;
  rmAncCode?: string;
}

export const PmbHeader: React.FC<PmbHeaderProps> = ({ config, allergy, rmAncCode }) => {
  return (
    <div className="w-full flex flex-col mb-1">
      {/* 3-column Header Table */}
      <div className="w-full grid grid-cols-[19.33%_54.91%_25.76%] items-center mb-1">
        {/* Left: Clinic Logo Box */}
        <div className="flex items-center justify-start">
          <div className="w-[32mm] h-[14.5mm] border border-black flex items-center justify-center bg-white p-1 overflow-hidden">
            <img
              src="/logo.svg"
              alt="Amanah Healthcare"
              className="max-h-[12.5mm] max-w-[30mm] object-contain"
              onError={(e) => {
                // Graceful fallback to typography image if svg not found
                (e.currentTarget as HTMLImageElement).src = '/logo-symbol-only.svg';
              }}
            />
          </div>
        </div>

        {/* Center: Clinic Lines */}
        <div className="flex flex-col items-center justify-center text-center">
          {config.clinicLines.map((line, idx) => (
            <FormText
              key={idx}
              customPt={line.size}
              bold={line.bold}
              align="center"
              className="leading-tight"
            >
              {line.text}
            </FormText>
          ))}
        </div>

        {/* Right: RM ANC Box */}
        <div className="flex items-center justify-end">
          <div className="w-[45mm] border border-black bg-white">
            <div className="border-b border-black py-[2px] text-center">
              <FormText customPt={7.6} bold align="center">
                {rmAncCode ? `RM ANC : ${rmAncCode}` : config.rmRows[0] || 'RM ANC :'}
              </FormText>
            </div>
            {/* Sesuai instruksi dokter: RMANC.2 dikosongkan total */}
            <div className="py-[2px] text-center min-h-[16px]">
              <FormText customPt={7.2} align="center">
                {config.rmRows[1] || '\u00A0'}
              </FormText>
            </div>
          </div>
        </div>
      </div>

      {/* Double Line Separator */}
      <DoubleDivider />

      {/* Right-aligned Allergy Field */}
      <div className="w-full flex justify-end mt-[2px] mb-[2px]">
        <div className="w-[65mm] flex items-baseline">
          <FormText customPt={7.2} bold className="shrink-0 mr-1">
            {config.allergyLabel}
          </FormText>
          <div className="grow border-b border-dotted border-[#777777] min-h-[13px]">
            <FormText customPt={7.2}>{allergy || '\u00A0'}</FormText>
          </div>
        </div>
      </div>
    </div>
  );
};
