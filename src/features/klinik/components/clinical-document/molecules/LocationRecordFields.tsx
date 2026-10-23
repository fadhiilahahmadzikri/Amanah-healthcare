import React from 'react';
import { DottedLine } from '../atoms/DottedLine';

export interface LocationRecordFieldsProps {
  labels: string[];
  values?: (string | undefined)[];
  customPt?: number;
}

export const LocationRecordFields: React.FC<LocationRecordFieldsProps> = ({
  labels,
  values = [],
  customPt = 6.6,
}) => {
  return (
    <tr className="h-[18px]">
      {labels.map((label, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === labels.length - 1;
        const borderClasses = `border-t border-b border-black ${
          isFirst ? 'border-l border-black' : 'border-l-0'
        } ${isLast ? 'border-r border-black' : 'border-r-0'}`;

        return (
          <td
            key={label}
            colSpan={2}
            className={`px-[2px] py-[1px] align-middle ${borderClasses}`}
          >
            <DottedLine
              label={label}
              value={values[idx]}
              customPt={customPt}
              minHeight="14px"
            />
          </td>
        );
      })}
    </tr>
  );
};
