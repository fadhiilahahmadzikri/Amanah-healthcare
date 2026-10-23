import React from 'react';
import { FormText } from '../atoms/FormText';
import { FormCell } from '../atoms/FormCell';
import type { DiseaseRecord } from '../types';

export interface DiseaseCheckRowProps {
  index: number;
  disease: string;
  record?: DiseaseRecord;
  customPt?: number;
}

export const DiseaseCheckRow: React.FC<DiseaseCheckRowProps> = ({
  index,
  disease,
  record,
  customPt = 6.5,
}) => {
  const isYa = record?.status === 'ya';
  const isTidak = record?.status === 'tidak';
  const year = record?.year || '';

  return (
    <tr className="h-[15px]">
      <FormCell widthPercent={10.37} align="center" padding="px-[1px] py-0">
        <FormText customPt={customPt}>{index}.</FormText>
      </FormCell>
      <FormCell widthPercent={44.78} align="left" padding="px-[2px] py-0">
        {disease ? (
          <FormText customPt={customPt}>{disease}</FormText>
        ) : (
          <div className="border-b border-dotted border-[#777777] h-[12px] w-full" />
        )}
      </FormCell>
      <FormCell widthPercent={12.36} align="center" padding="px-[1px] py-0">
        <FormText customPt={customPt} bold>
          {isYa ? 'X' : ''}
        </FormText>
      </FormCell>
      <FormCell widthPercent={14.95} align="center" padding="px-[1px] py-0">
        <FormText customPt={customPt} bold>
          {isTidak ? 'X' : ''}
        </FormText>
      </FormCell>
      <FormCell widthPercent={17.54} align="center" padding="px-[1px] py-0">
        <FormText customPt={customPt}>{year}</FormText>
      </FormCell>
    </tr>
  );
};
