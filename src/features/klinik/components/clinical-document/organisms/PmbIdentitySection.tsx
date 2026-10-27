import React from 'react';
import { SectionHeader } from '../atoms/SectionHeader';
import { FormText } from '../atoms/FormText';
import { DottedLine } from '../atoms/DottedLine';
import { LocationRecordFields } from '../molecules/LocationRecordFields';
import { MeasurementFields } from '../molecules/MeasurementFields';
import type { PmbIdentityConfig } from '../types';

export interface PmbIdentitySectionProps {
  config: PmbIdentityConfig;
  data?: {
    topRowValues?: (string | undefined)[][];
    fullRowValues?: (string | undefined)[];
    locationValues?: (string | undefined)[];
    measurementValues?: (string | undefined)[][];
  };
}

export const PmbIdentitySection: React.FC<PmbIdentitySectionProps> = ({ config, data }) => {
  const colWidths = [11.0, 25.0, 14.0, 18.0, 13.0, 19.0];

  return (
    <div className='w-full mb-1'>
      <SectionHeader title='IDENTITAS' beforeGapPx={2} afterGapPx={2} />

      <table className='w-full border-collapse border border-black table-fixed bg-white'>
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: `${w}%` }} />
          ))}
        </colgroup>
        <tbody>
          {/* Top 5 Rows */}
          {config.topRows.map((rowItems, rowIdx) => (
            <tr key={rowIdx} className='h-[17px]'>
              {rowItems.map((item, colIdx) => {
                const isLabel = colIdx % 2 === 0;
                const valueIdx = (colIdx - 1) / 2;
                const value = isLabel ? undefined : data?.topRowValues?.[rowIdx]?.[valueIdx];

                return (
                  <td
                    key={colIdx}
                    className='border border-black px-[2px] py-[0.5px] align-middle overflow-hidden'
                  >
                    {isLabel ? (
                      <FormText customPt={6.6}>{item}</FormText>
                    ) : (
                      <DottedLine value={value} customPt={6.6} minHeight='13px' />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Full Rows (Agama, Domisili, Alamat KTP, No. Telp) */}
          {config.fullRows.map((label, rowIdx) => (
            <tr key={rowIdx} className='h-[17px]'>
              <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                <FormText customPt={6.6}>{label}</FormText>
              </td>
              <td colSpan={5} className='border border-black px-[2px] py-[0.5px] align-middle'>
                <DottedLine value={data?.fullRowValues?.[rowIdx]} customPt={6.6} minHeight='13px' />
              </td>
            </tr>
          ))}

          {/* Location Records: Dasawisma, Posyandu, Puskesmas */}
          <LocationRecordFields
            labels={config.locationLabels}
            values={data?.locationValues}
            customPt={6.6}
          />

          {/* Measurements: TB, BB awal, LILA, IMT, Status TT, Gol Darah */}
          <MeasurementFields
            measurementRows={config.measurementRows}
            values={data?.measurementValues}
            customPt={6.6}
          />
        </tbody>
      </table>
    </div>
  );
};
