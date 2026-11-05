import React from 'react';
import { FormText } from './FormText';

export interface DashedLineProps {
  label?: string;
  value?: string;
  customPt?: number;
  className?: string;
  hasLine?: boolean;
}

export const DashedLine: React.FC<DashedLineProps> = ({
  label,
  value,
  customPt = 6.8,
  className = '',
  hasLine = false
}) => {
  return (
    <div
      className={`w-full flex items-baseline ${hasLine ? 'border-b border-dashed border-[#777777]' : ''} min-h-[14px] ${className}`}
    >
      {label && (
        <span className="shrink-0 mr-1">
          <FormText customPt={customPt}>{label}</FormText>
        </span>
      )}
      <span className="grow min-w-0 break-words whitespace-normal text-left">
        <FormText customPt={customPt}>{value || '\u00A0'}</FormText>
      </span>
    </div>
  );
};
