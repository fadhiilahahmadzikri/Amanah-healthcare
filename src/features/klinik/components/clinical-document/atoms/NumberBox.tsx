import React from 'react';
import { FormText } from './FormText';

export interface NumberBoxProps {
  digit?: string;
  width?: string;
  height?: string;
  bold?: boolean;
  customPt?: number;
  className?: string;
}

export const NumberBox: React.FC<NumberBoxProps> = ({
  digit = '',
  width = '18px',
  height = '22px',
  bold = true,
  customPt = 7.2,
  className = '',
}) => {
  return (
    <div
      style={{ width, height }}
      className={`border border-black flex items-center justify-center bg-white shrink-0 ${className}`}
    >
      <FormText customPt={customPt} bold={bold} align="center">
        {digit}
      </FormText>
    </div>
  );
};
