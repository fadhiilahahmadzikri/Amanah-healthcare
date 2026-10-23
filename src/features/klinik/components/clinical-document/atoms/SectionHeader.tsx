import React from 'react';
import { FormText } from './FormText';

export interface SectionHeaderProps {
  title: string;
  beforeGapPx?: number;
  afterGapPx?: number;
  className?: string;
  customPt?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  beforeGapPx = 4,
  afterGapPx = 2,
  className = '',
  customPt = 8.2,
}) => {
  return (
    <div
      style={{
        marginTop: `${beforeGapPx}px`,
        marginBottom: `${afterGapPx}px`,
      }}
      className={`w-full font-serif font-bold uppercase tracking-wide ${className}`}
    >
      <FormText customPt={customPt} bold>
        {title}
      </FormText>
    </div>
  );
};
