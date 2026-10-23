import React from 'react';
import { FormText } from './FormText';

export interface FormCheckboxProps {
  label: string;
  checked?: boolean;
  customPt?: number;
  className?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  checked = false,
  customPt = 6.5,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-1 leading-none ${className}`}>
      <span className="inline-flex items-center justify-center w-[9px] h-[9px] border border-black text-[7pt] font-bold shrink-0 bg-white">
        {checked ? '✓' : ''}
      </span>
      <FormText customPt={customPt}>{label}</FormText>
    </div>
  );
};
