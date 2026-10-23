import React from 'react';
import { FormText } from '../atoms/FormText';
import { DottedLine } from '../atoms/DottedLine';
import type { ImunisasiPreTableConfig } from '../types';

export interface ImunisasiPreTableSectionProps {
  config: ImunisasiPreTableConfig;
  data?: {
    previousVaccines?: string;
    allergy?: string;
  };
}

export const ImunisasiPreTableSection: React.FC<ImunisasiPreTableSectionProps> = ({
  config,
  data,
}) => {
  const previousVaccines = data?.previousVaccines;
  const allergy = data?.allergy;

  return (
    <div className="w-full grid grid-cols-2 gap-4 items-baseline mb-1">
      {/* Left: Riwayat Vaksin Sebelumnya */}
      <div className="flex items-baseline">
        <FormText customPt={7.2} italic>
          {previousVaccines
            ? `${config.leftLabel}: ${previousVaccines}`
            : config.leftLabel}
        </FormText>
      </div>

      {/* Right: Riwayat Alergi */}
      <div className="flex items-baseline">
        <DottedLine
          label={config.rightLabel}
          value={allergy}
          customPt={7.2}
          boldLabel
          boldValue
          minHeight="14px"
        />
      </div>
    </div>
  );
};
