import React from 'react';
import { SectionHeader } from '../atoms/SectionHeader';
import { FormText } from '../atoms/FormText';
import { DottedLine } from '../atoms/DottedLine';
import { LocationRecordFields } from '../molecules/LocationRecordFields';
import { MeasurementFields } from '../molecules/MeasurementFields';
import type { PmbIdentityConfig, PmbIdentityData } from '../types';

export interface PmbIdentitySectionProps {
  config: PmbIdentityConfig;
  data?: PmbIdentityData;
}

export const PmbIdentitySection: React.FC<PmbIdentitySectionProps> = ({ config, data }) => {
  // If structured separated identity rows are provided, render clean zero-distraction layout
  if (data?.motherRows && data?.husbandRows) {
    const colWidths = [15.0, 35.0, 15.0, 35.0];

    return (
      <div className='w-full mb-1'>
        <SectionHeader title='IDENTITAS' beforeGapPx={4} afterGapPx={1} />

        <table className='w-full border-collapse border border-black table-fixed bg-white'>
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: `${w}%` }} />
            ))}
          </colgroup>
          <tbody>
            {/* SUB-SECTION A: DATA DIRI */}
            <tr className='h-[16px] bg-slate-50 border-t border-b border-black'>
              <td colSpan={4} className='border border-black px-1.5 py-[0.5px] align-middle'>
                <FormText customPt={6.8} bold>
                  A. DATA DIRI
                </FormText>
              </td>
            </tr>
            {data.motherRows.map((pair, rIdx) => (
              <tr key={`mother-${rIdx}`} className='h-[17px]'>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <FormText customPt={6.6}>{pair[0]?.[0] || ''}</FormText>
                </td>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <DottedLine value={pair[0]?.[1]} customPt={6.6} minHeight='13px' />
                </td>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <FormText customPt={6.6}>{pair[1]?.[0] || ''}</FormText>
                </td>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <DottedLine value={pair[1]?.[1]} customPt={6.6} minHeight='13px' />
                </td>
              </tr>
            ))}

            {/* SUB-SECTION B: DATA SUAMI */}
            <tr className='h-[16px] bg-slate-50 border-t border-b border-black'>
              <td colSpan={4} className='border border-black px-1.5 py-[0.5px] align-middle'>
                <FormText customPt={6.8} bold>
                  B. DATA SUAMI
                </FormText>
              </td>
            </tr>
            {data.husbandRows.map((pair, rIdx) => (
              <tr key={`husband-${rIdx}`} className='h-[17px]'>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <FormText customPt={6.6}>{pair[0]?.[0] || ''}</FormText>
                </td>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <DottedLine value={pair[0]?.[1]} customPt={6.6} minHeight='13px' />
                </td>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <FormText customPt={6.6}>{pair[1]?.[0] || ''}</FormText>
                </td>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <DottedLine value={pair[1]?.[1]} customPt={6.6} minHeight='13px' />
                </td>
              </tr>
            ))}

            {/* SUB-SECTION C: ALAMAT DAN DOMISILI */}
            <tr className='h-[16px] bg-slate-50 border-t border-b border-black'>
              <td colSpan={4} className='border border-black px-1.5 py-[0.5px] align-middle'>
                <FormText customPt={6.8} bold>
                  C. ALAMAT DAN DOMISILI
                </FormText>
              </td>
            </tr>
            {data.addressRows?.map((row, rIdx) => (
              <tr key={`addr-${rIdx}`} className='h-[17px]'>
                <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <FormText customPt={6.6}>{row[0]}</FormText>
                </td>
                <td colSpan={3} className='border border-black px-[2px] py-[0.5px] align-middle'>
                  <DottedLine value={row[1]} customPt={6.6} minHeight='13px' />
                </td>
              </tr>
            ))}
            {data.locationRows && data.locationRows.length > 0 && (
              <tr className='h-[17px]'>
                <td colSpan={4} className='border border-black px-[4px] py-[0.5px] align-middle'>
                  <div className='flex items-center justify-between w-full gap-4'>
                    {data.locationRows.map((loc, lIdx) => (
                      <div key={`loc-${lIdx}`} className='flex items-center gap-1.5 flex-1 min-w-0'>
                        <FormText customPt={6.6} className='shrink-0'>
                          {loc[0]}
                        </FormText>
                        <div className='flex-1 min-w-0'>
                          <DottedLine value={loc[1]} customPt={6.6} minHeight='13px' />
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            )}

            {/* SUB-SECTION D: PEMERIKSAAN FISIK */}
            <tr className='h-[16px] bg-slate-50 border-t border-b border-black'>
              <td colSpan={4} className='border border-black px-1.5 py-[0.5px] align-middle'>
                <FormText customPt={6.8} bold>
                  D. PEMERIKSAAN FISIK
                </FormText>
              </td>
            </tr>
            {(() => {
              const rows = data.physicalRows || [];
              const pairs: [string, string | undefined][][] = [];
              for (let i = 0; i < rows.length; i += 2) {
                pairs.push([rows[i], rows[i + 1]]);
              }
              return pairs.map((pair, pIdx) => (
                <tr key={`phys-${pIdx}`} className='h-[17px]'>
                  <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                    <FormText customPt={6.6}>{pair[0]?.[0] || ''}</FormText>
                  </td>
                  <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                    <DottedLine value={pair[0]?.[1]} customPt={6.6} minHeight='13px' />
                  </td>
                  <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                    <FormText customPt={6.6}>{pair[1]?.[0] || ''}</FormText>
                  </td>
                  <td className='border border-black px-[2px] py-[0.5px] align-middle'>
                    <DottedLine value={pair[1]?.[1]} customPt={6.6} minHeight='13px' />
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    );
  }

  // Legacy fallback
  const colWidths = [11.5, 26.69, 14.26, 10.12, 14.73, 22.7];

  return (
    <div className='w-full mb-1'>
      <SectionHeader title='IDENTITAS' beforeGapPx={4} afterGapPx={1} />

      <table className='w-full border-collapse border border-black table-fixed bg-white'>
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: `${w}%` }} />
          ))}
        </colgroup>
        <tbody>
          {/* Top 5 Rows */}
          {config.topRows.map((rowItems, rowIdx) => (
            <tr key={rowIdx} className='h-[17.5px]'>
              {rowItems.map((item, colIdx) => {
                const isLabel = colIdx % 2 === 0;
                const valueIdx = (colIdx - 1) / 2;
                const value = isLabel ? undefined : data?.topRowValues?.[rowIdx]?.[valueIdx];

                return (
                  <td key={colIdx} className='border border-black px-[2px] py-[0.5px] align-middle'>
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
            <tr key={rowIdx} className='h-[17.5px]'>
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
