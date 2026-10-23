import React from 'react';
import { FormText } from '../atoms/FormText';
import { FormCell } from '../atoms/FormCell';
import type { VaccineRowDefinition, VaccineRowData } from '../types';

export interface VaccineRowItemProps {
  definition: VaccineRowDefinition;
  data?: VaccineRowData;
  defaultSubjective?: string[];
  defaultObjective?: string[];
  bodyPt?: number;
  smallPt?: number;
}

export const VaccineRowItem: React.FC<VaccineRowItemProps> = ({
  definition,
  data,
  defaultSubjective = ['Demam :', 'Batuk :', 'Pilek :'],
  defaultObjective = ['BB / PB :', 'LK / S :'],
  bodyPt = 7.2,
  smallPt = 6.3,
}) => {
  const bottomBorder = definition.separatorAfter ? 'thick' : true;
  const subjectiveLines = data?.subjective || defaultSubjective;
  const objectiveLines = data?.objective || defaultObjective;

  return (
    <tr className="h-[28px]">
      {/* Col 0: Jenis Vaksin */}
      <FormCell
        widthPercent={25.77}
        borderBottom={bottomBorder}
        padding="px-[4px] py-[2px]"
        align="left"
      >
        {definition.vaccine.length === 1 && !definition.vaccine[0].right ? (
          <FormText customPt={bodyPt} bold>
            {definition.vaccine[0].left}
          </FormText>
        ) : (
          <div className="w-full flex flex-col justify-center">
            {definition.vaccine.map((line, idx) => (
              <div key={idx} className="flex justify-between items-center pr-2">
                <FormText customPt={bodyPt} bold>
                  {line.left}
                </FormText>
                <FormText customPt={bodyPt} bold>
                  {line.right || ''}
                </FormText>
              </div>
            ))}
          </div>
        )}
      </FormCell>

      {/* Col 1: Tgl Suntik */}
      <FormCell
        widthPercent={10.12}
        borderBottom={bottomBorder}
        align="center"
        padding="px-[2px] py-[2px]"
      >
        <FormText customPt={smallPt}>{data?.injectionDate || ''}</FormText>
      </FormCell>

      {/* Col 2: Umur */}
      <FormCell
        widthPercent={7.82}
        borderBottom={bottomBorder}
        align="center"
        padding="px-[2px] py-[2px]"
      >
        <FormText customPt={smallPt}>{data?.age || ''}</FormText>
      </FormCell>

      {/* Col 3: Subjektif */}
      <FormCell
        widthPercent={17.03}
        borderBottom={bottomBorder}
        padding="px-[3px] py-[1px]"
        align="left"
      >
        <div className="flex flex-col">
          {subjectiveLines.map((line, idx) => (
            <FormText key={idx} customPt={smallPt}>
              {line}
            </FormText>
          ))}
        </div>
      </FormCell>

      {/* Col 4: Objektif */}
      <FormCell
        widthPercent={19.33}
        borderBottom={bottomBorder}
        padding="px-[3px] py-[1px]"
        align="left"
      >
        <div className="flex flex-col">
          {objectiveLines.map((line, idx) => (
            <FormText key={idx} customPt={smallPt} bold={!data?.objective}>
              {line}
            </FormText>
          ))}
        </div>
      </FormCell>

      {/* Col 5: Planning */}
      <FormCell
        widthPercent={19.93}
        borderBottom={bottomBorder}
        padding="px-[3px] py-[2px]"
        align="left"
      >
        <FormText customPt={smallPt}>{data?.planning || ''}</FormText>
      </FormCell>
    </tr>
  );
};
