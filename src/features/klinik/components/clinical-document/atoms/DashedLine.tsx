import React from 'react';
import { FormText } from './FormText';

export interface DashedLineProps {
  label?: string;
  value?: string;
  customPt?: number;
  className?: string;
}

export const DashedLine: React.FC<DashedLineProps> = ({
  label,
  value,
  customPt = 6.8,
  className = '',
}) => {
  return (
    <div
      className={`w-full flex items-baseline border-b border-dashed border-[#777777] min-h-[14px] ${className}`}
    >
      {label && (
        <span className="shrink-0 mr-1">
          <FormText customPt={customPt}>{label}</FormText>
        </span>
      )}
      <span className="grow overflow-hidden text-ellipsis whitespace-nowrap">
        <FormText customPt={customPt}>{value || '\u00A0'}</FormText>
      </span>
    </div>
  );
};
