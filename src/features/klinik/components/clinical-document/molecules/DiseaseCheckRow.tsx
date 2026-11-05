import React from 'react';
import { FormText } from '../atoms/FormText';
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
    <>
      <td className="border-r border-b border-black text-center px-0.5 py-0 align-middle">
        <FormText customPt={customPt}>{index}.</FormText>
      </td>
      <td className="border-r border-b border-black text-left px-1 py-0 align-middle">
        {disease ? (
          <FormText customPt={customPt}>{disease}</FormText>
        ) : record?.notes ? (
          <FormText customPt={customPt} className="break-words whitespace-normal text-left">
            {record.notes}
          </FormText>
        ) : (
          <div className="h-[12px] w-full" />
        )}
      </td>
      <td className="border-r border-b border-black text-center px-0.5 py-0 align-middle">
        <FormText customPt={customPt} bold>
          {isYa ? 'X' : ''}
        </FormText>
      </td>
      <td className="border-r border-b border-black text-center px-0.5 py-0 align-middle">
        <FormText customPt={customPt} bold>
          {isTidak ? 'X' : ''}
        </FormText>
      </td>
      <td className="border-b border-black text-center px-0.5 py-0 align-middle">
        <FormText customPt={customPt}>{year}</FormText>
      </td>
    </>
  );
};
