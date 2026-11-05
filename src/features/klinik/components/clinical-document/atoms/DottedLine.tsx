import React from 'react';
import { FormText } from './FormText';

export interface DottedLineProps {
  label?: string;
  value?: string;
  customPt?: number;
  boldLabel?: boolean;
  boldValue?: boolean;
  className?: string;
  minHeight?: string;
  hasLine?: boolean;
}

export const DottedLine: React.FC<DottedLineProps> = ({
  label,
  value,
  customPt = 6.8,
  boldLabel = false,
  boldValue = false,
  className = '',
  minHeight = '14px',
  hasLine = false
}) => {
  return (
    <div
      style={{ minHeight }}
      className={`w-full flex items-baseline ${hasLine ? 'border-b border-dotted border-[#777777]' : ''} ${className}`}
    >
      {label && (
        <span className='shrink-0 mr-1'>
          <FormText customPt={customPt} bold={boldLabel}>
            {label}
          </FormText>
        </span>
      )}
      <span className='grow min-w-0 break-words whitespace-normal text-left'>
        <FormText customPt={customPt} bold={boldValue}>
          {value || '\u00A0'}
        </FormText>
      </span>
    </div>
  );
};
