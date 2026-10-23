import React from 'react';
import { DottedLine } from '../atoms/DottedLine';

export interface MeasurementFieldsProps {
  measurementRows: string[][];
  values?: (string | undefined)[][];
  customPt?: number;
}

export const MeasurementFields: React.FC<MeasurementFieldsProps> = ({
  measurementRows,
  values = [],
  customPt = 6.6,
}) => {
  const spans = [2, 2, 1, 1];

  return (
    <>
      {measurementRows.map((rowLabels, rowIdx) => (
        <tr key={rowIdx} className="h-[18px]">
          {rowLabels.map((label, colIdx) => {
            const span = spans[colIdx];
            const value = values[rowIdx]?.[colIdx];
            const isFirst = colIdx === 0;
            const isLast = colIdx === rowLabels.length - 1;

            const borderClasses = `border-t border-b border-black ${
              isFirst ? 'border-l border-black' : 'border-l-0'
            } ${isLast ? 'border-r border-black' : 'border-r-0'}`;

            return (
              <td
                key={colIdx}
                colSpan={span}
                className={`px-[2px] py-[1px] align-middle ${borderClasses}`}
              >
                {label ? (
                  <DottedLine
                    label={label}
                    value={value}
                    customPt={customPt}
                    minHeight="14px"
                  />
                ) : (
                  <div className="h-[14px]" />
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};
