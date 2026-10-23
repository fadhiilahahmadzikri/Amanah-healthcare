import React from 'react';
import { FormText } from '../atoms/FormText';
import { DottedLine } from '../atoms/DottedLine';

export interface LabeledFieldProps {
  label: string;
  value?: string;
  customPt?: number;
  labelWidthPx?: string;
  className?: string;
}

export const LabeledField: React.FC<LabeledFieldProps> = ({
  label,
  value,
  customPt = 6.6,
  labelWidthPx,
  className = '',
}) => {
  if (!labelWidthPx) {
    return <DottedLine label={label} value={value} customPt={customPt} className={className} />;
  }

  return (
    <div className={`flex items-baseline w-full ${className}`}>
      <div style={{ width: labelWidthPx }} className="shrink-0">
        <FormText customPt={customPt}>{label}</FormText>
      </div>
      <div className="grow border-b border-dotted border-[#777777] min-h-[14px] overflow-hidden whitespace-nowrap">
        <FormText customPt={customPt}>{value || '\u00A0'}</FormText>
      </div>
    </div>
  );
};
