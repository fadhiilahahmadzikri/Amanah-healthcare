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
  // Optimized column widths: Tahun Lahir compact HUG (~7%), Komplikasi and text fields expanded
  const colWidths = [4.00, 7.00, 11.50, 4.50, 5.50, 14.00, 16.00, 17.50, 20.00];

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
                className='border border-black px-1 py-[1px] text-center align-middle'
              >
                <FormText customPt={7.0} bold align='center'>
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
              <tr key={rowIdx} className='h-[42px]'>
                {colWidths.map((_, colIdx) => {
                  const isCentered = colIdx <= 4;
                  return (
                    <td
                      key={colIdx}
                      className={`border border-black px-1.5 py-1 align-middle overflow-hidden break-words ${
                        isCentered ? 'text-center' : 'text-left'
                      }`}
                    >
                      <FormText
                        customPt={7.0}
                        align={isCentered ? 'center' : 'left'}
                        className='leading-tight break-words whitespace-normal block w-full'
                      >
                        {colIdx === 0 && !rowData[colIdx] ? `${rowIdx + 1}.` : rowData[colIdx] || ''}
                      </FormText>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
