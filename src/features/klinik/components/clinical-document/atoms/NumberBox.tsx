import React from 'react';
import { FormText } from './FormText';

export interface NumberBoxProps {
  digit?: string;
  width?: string;
  height?: string;
  bold?: boolean;
  className?: string;
}

export const NumberBox: React.FC<NumberBoxProps> = ({
  digit = '',
  width = '18px',
  height = '22px',
  bold = true,
  className = '',
}) => {
  return (
    <div
      style={{ width, height }}
      className={`border border-black flex items-center justify-center bg-white shrink-0 ${className}`}
    >
      <FormText customPt={7.5} bold={bold} align="center">
        {digit}
      </FormText>
    </div>
  );
};
