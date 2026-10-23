import React from 'react';
import { FormText } from '../atoms/FormText';
import { CodeBoxesHeader } from '../molecules/CodeBoxesHeader';
import type { ImunisasiHeaderConfig } from '../types';

export interface ImunisasiHeaderProps {
  config: ImunisasiHeaderConfig;
  data?: {
    topCode?: string;
    recordDigits?: (string | undefined)[];
  };
}

export const ImunisasiHeader: React.FC<ImunisasiHeaderProps> = ({ config, data }) => {
  return (
    <div className="w-full flex items-start justify-between mb-2">
      {/* Left: Clinic Title & Subtitle */}
      <div className="flex flex-col justify-end pt-2">
        <FormText customPt={11} bold underline className="tracking-wide">
          {config.title}
        </FormText>
        <FormText customPt={10} className="tracking-wider mt-[1px]">
          {config.subtitle}
        </FormText>
      </div>

      {/* Right: RM Code & 10 Number Boxes */}
      <div className="flex items-start justify-end">
        <CodeBoxesHeader
          topCode={data?.topCode}
          recordDigits={data?.recordDigits}
        />
      </div>
    </div>
  );
};
