import React from 'react';
import { FormText } from '../atoms/FormText';
import { ObstetriHeader } from '../molecules/ObstetriHeader';
import type { PmbObstetriConfig } from '../types';

export interface PmbObstetriSectionProps {
  config: PmbObstetriConfig;
  data?: (string | undefined)[][];
  pregnancyFields?: Record<string, string>;
}

export const PmbObstetriSection: React.FC<PmbObstetriSectionProps> = ({
  config,
  data = [],
  pregnancyFields
}) => {
  const colWidths = [4.79, 14.26, 13.80, 5.15, 5.71, 11.41, 15.83, 17.95, 11.10];

  return (
    <div className='w-full mb-1 mt-[5px]'>
      <ObstetriHeader
        title={config.title}
        pregnancyFields={config.pregnancyFields}
        fieldValues={pregnancyFields}
        titlePt={8.2}
        fieldPt={7.2}
      />

      <table className='w-full border-collapse border border-black table-fixed bg-white'>
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: `${w}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr className='h-[17px] bg-white border-b border-black'>
            {config.headers.map((header, idx) => (
              <th
                key={idx}
                className='border border-black px-[2px] py-[1px] text-center align-middle'
              >
                <FormText customPt={6.8} bold align='center'>
                  {header}
                </FormText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: config.blankRows }).map((_, rowIdx) => {
            const rowData = data[rowIdx] || [];
            return (
              <tr key={rowIdx} className='h-[45px]'>
                {colWidths.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className={`border border-black px-[2px] py-[1px] align-middle overflow-hidden break-words ${
                      colIdx === 0 || colIdx === 3 ? 'text-center' : 'text-left'
                    }`}
                  >
                    <FormText customPt={6.8} className='leading-tight break-words whitespace-normal block w-full'>
                      {colIdx === 0 && !rowData[colIdx] ? `${rowIdx + 1}.` : rowData[colIdx] || ''}
                    </FormText>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
