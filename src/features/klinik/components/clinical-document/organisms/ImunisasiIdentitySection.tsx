import React from 'react';
import { FormText } from '../atoms/FormText';
import { DottedLine } from '../atoms/DottedLine';
import type { ImunisasiIdentityConfig } from '../types';

export interface ImunisasiIdentitySectionProps {
  config: ImunisasiIdentityConfig;
  data?: {
    leftValues?: (string | undefined)[];
    rightValues?: (string | undefined)[];
  };
}

export const ImunisasiIdentitySection: React.FC<ImunisasiIdentitySectionProps> = ({
  config,
  data
}) => {
  return (
    <div className='w-full mb-2'>
      <table className='w-full border-collapse border border-black table-fixed text-[8.2pt]'>
        <colgroup>
          <col style={{ width: '14%' }} />
          <col style={{ width: '36%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '36%' }} />
        </colgroup>
        <tbody>
          {config.rows.map((rowItem, idx) => {
            const leftVal = data?.leftValues?.[idx] ?? rowItem.leftValue;
            const rightVal = data?.rightValues?.[idx] ?? rowItem.rightValue;
            const isAddressRow = idx === 2;

            return (
              <tr key={idx} className='border-b border-black'>
                {/* Left Label */}
                <td className='border border-black px-1.5 py-1 align-top bg-white'>
                  <FormText customPt={8.2}>{rowItem.leftLabel}</FormText>
                </td>

                {/* Left Field */}
                <td className='border border-black px-1.5 py-1 align-top bg-white'>
                  <DottedLine
                    value={leftVal}
                    customPt={8.2}
                    boldValue={Boolean(leftVal && leftVal !== '( L / P )')}
                    minHeight='16px'
                  />
                </td>

                {/* Right Label & Field */}
                {isAddressRow ? (
                  <>
                    <td rowSpan={2} className='border border-black px-1.5 py-1 align-top bg-white'>
                      <FormText customPt={8.2}>{rowItem.rightLabel}</FormText>
                    </td>
                    <td rowSpan={2} className='border border-black px-1.5 py-1 align-top bg-white'>
                      <div className='min-h-[36px] flex flex-col justify-start'>
                        <FormText customPt={8.2} bold={Boolean(rightVal)}>
                          {rightVal || ''}
                        </FormText>
                      </div>
                    </td>
                  </>
                ) : idx === 3 ? null : (
                  <>
                    <td className='border border-black px-1.5 py-1 align-top bg-white'>
                      <FormText customPt={8.2}>{rowItem.rightLabel}</FormText>
                    </td>
                    <td className='border border-black px-1.5 py-1 align-top bg-white'>
                      <DottedLine
                        value={rightVal}
                        customPt={8.2}
                        boldValue={Boolean(rightVal)}
                        minHeight='16px'
                      />
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
