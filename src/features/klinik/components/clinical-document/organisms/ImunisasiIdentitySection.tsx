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
  data,
}) => {
  return (
    <div className="w-full mb-2">
      <table className="w-full border-collapse border border-black table-fixed">
        <colgroup>
          <col style={{ width: '12.42%' }} />
          <col style={{ width: '37.58%' }} />
          <col style={{ width: '11.96%' }} />
          <col style={{ width: '38.04%' }} />
        </colgroup>
        <tbody>
          {config.rows.map((rowItem, idx) => {
            const leftVal = data?.leftValues?.[idx] ?? rowItem.leftValue;
            const rightVal = data?.rightValues?.[idx] ?? rowItem.rightValue;

            return (
              <tr key={idx} className="h-[21px]">
                {/* Left Label */}
                <td className="px-1.5 py-0.5 align-middle border-t-0 border-b-0 border-l-0 border-r-0">
                  <FormText customPt={7.2}>{rowItem.leftLabel}</FormText>
                </td>

                {/* Left Field (with right vertical border dividing left & right sections) */}
                <td className="px-1.5 py-0.5 align-middle border-t-0 border-b-0 border-l-0 border-r border-r-black">
                  <DottedLine
                    value={leftVal}
                    customPt={7.2}
                    boldValue={Boolean(leftVal && leftVal !== '( L / P )')}
                    className={leftVal ? 'justify-end' : ''}
                    minHeight="15px"
                  />
                </td>

                {/* Right Label */}
                <td className="px-1.5 py-0.5 align-middle border-t-0 border-b-0 border-l-0 border-r-0">
                  <FormText customPt={7.2}>{rowItem.rightLabel}</FormText>
                </td>

                {/* Right Field */}
                <td className="px-1.5 py-0.5 align-middle border-t-0 border-b-0 border-l-0 border-r-0">
                  {rowItem.rightLabel ? (
                    <DottedLine
                      value={rightVal}
                      customPt={7.2}
                      boldValue={Boolean(rightVal)}
                      minHeight="15px"
                    />
                  ) : (
                    <div className="h-[15px]" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
