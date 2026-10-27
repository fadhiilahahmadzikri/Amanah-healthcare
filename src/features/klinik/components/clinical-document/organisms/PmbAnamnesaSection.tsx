/* oxlint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { SectionHeader } from '../atoms/SectionHeader';
import { FormText } from '../atoms/FormText';
import { DottedLine } from '../atoms/DottedLine';
import { DashedLine } from '../atoms/DashedLine';
import { RiskFactorGrid } from '../molecules/RiskFactorGrid';
import { DiseaseCheckRow } from '../molecules/DiseaseCheckRow';
import type { PmbAnamnesaConfig, DiseaseRecord } from '../types';

export interface PmbAnamnesaSectionProps {
  config: PmbAnamnesaConfig;
  data?: {
    promptValues?: (string | undefined)[];
    riskChecked?: Record<string, boolean>;
    environment?: string;
    otherLines?: string[];
    diseaseHistory?: Record<string, DiseaseRecord>;
  };
}

export const PmbAnamnesaSection: React.FC<PmbAnamnesaSectionProps> = ({ config, data }) => {
  return (
    <div className='w-full mb-1'>
      <SectionHeader title='ANAMNESA' beforeGapPx={2} afterGapPx={2} />

      <div className='w-full grid grid-cols-[53.84%_46.16%] border border-black bg-white'>
        {/* Left Column: Prompts, Risk factors, Notes */}
        <div className='border-r border-black p-1 flex flex-col justify-start'>
          <div>
            {/* 4 Prompts: HPHT, HPL, UK, Keluhan */}
            <div className='flex flex-col gap-[2px]'>
              {config.prompts.map((prompt, idx) => (
                <DottedLine
                  key={idx}
                  label={prompt}
                  value={data?.promptValues?.[idx]}
                  customPt={6.8}
                  minHeight='14px'
                />
              ))}
            </div>

            {/* Risk Title & Grid */}
            <div className='mt-1 pt-0.5 border-t border-black/40'>
              <FormText customPt={6.7} bold>
                {config.riskTitle}
              </FormText>
              <RiskFactorGrid
                riskGrid={config.riskGrid}
                checkedMap={data?.riskChecked}
                customPt={6.5}
              />
            </div>

            {/* Environment Risk */}
            <div className='mt-1'>
              <DottedLine
                label={config.environmentLabel}
                value={data?.environment}
                customPt={6.8}
                minHeight='14px'
              />
            </div>

            {/* Other Lines (Lain-lain) with Dashed Lines spanning to bottom */}
            <div className='mt-1 flex flex-col gap-[1px]'>
              {Array.from({ length: (config.otherDashedRows || 3) + 3 }).map((_, idx) => (
                <DashedLine
                  key={idx}
                  label={idx === 0 ? config.otherLabel : ''}
                  value={data?.otherLines?.[idx]}
                  customPt={6.8}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Disease Checklist Table */}
        <div className='p-0'>
          <table className='w-full border-collapse table-fixed'>
            <thead>
              <tr className='h-[17px] border-b border-black'>
                <th className='w-[10.37%] border-r border-black text-center px-[1px] py-0'>
                  <FormText customPt={6.6} bold align='center'>
                    No
                  </FormText>
                </th>
                <th className='w-[44.78%] border-r border-black text-center px-[2px] py-0'>
                  <FormText customPt={6.6} bold align='center'>
                    Riwayat Penyakit
                  </FormText>
                </th>
                <th className='w-[12.36%] border-r border-black text-center px-[1px] py-0'>
                  <FormText customPt={6.6} bold align='center'>
                    Ya
                  </FormText>
                </th>
                <th className='w-[14.95%] border-r border-black text-center px-[1px] py-0'>
                  <FormText customPt={6.6} bold align='center'>
                    Tidak
                  </FormText>
                </th>
                <th className='w-[17.54%] text-center px-[1px] py-0'>
                  <FormText customPt={6.6} bold align='center'>
                    Tahun
                  </FormText>
                </th>
              </tr>
            </thead>
            <tbody>
              {config.diseases.map((disease, idx) => (
                <DiseaseCheckRow
                  key={idx}
                  index={idx + 1}
                  disease={disease}
                  record={data?.diseaseHistory?.[disease]}
                  customPt={6.5}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
