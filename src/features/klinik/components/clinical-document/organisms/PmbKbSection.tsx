import React from 'react';
import { SectionHeader } from '../atoms/SectionHeader';
import { FormText } from '../atoms/FormText';
import type { PmbKbConfig } from '../types';

export interface PmbKbSectionProps {
  config: PmbKbConfig;
  data?: (string | undefined)[][];
}

export const PmbKbSection: React.FC<PmbKbSectionProps> = ({ config, data = [] }) => {
  const colWidths = [4.79, 15.55, 20.25, 12.7, 15.65, 17.48, 13.58];

  return (
    <div className="w-full mb-1">
      <SectionHeader title={config.title} beforeGapPx={2} afterGapPx={2} />

      <table className="w-full border-collapse border border-black table-fixed bg-white">
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: `${w}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr className="h-[18px] bg-white border-b border-black">
            {config.headers.map((header, idx) => (
              <th
                key={idx}
                className="border border-black px-[2px] py-[1px] text-center align-middle"
              >
                <FormText customPt={6.8} bold align="center">
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
              <tr key={rowIdx} className="h-[18px]">
                {colWidths.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className={`border border-black px-[2px] py-[1px] align-middle ${
                      colIdx === 0 ? 'text-center' : 'text-left'
                    }`}
                  >
                    <FormText customPt={6.8}>
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
