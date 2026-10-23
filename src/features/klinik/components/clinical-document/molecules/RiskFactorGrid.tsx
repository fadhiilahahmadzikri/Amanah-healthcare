import React from 'react';
import { FormCheckbox } from '../atoms/FormCheckbox';

export interface RiskFactorGridProps {
  riskGrid: string[][];
  checkedMap?: Record<string, boolean>;
  customPt?: number;
}

export const RiskFactorGrid: React.FC<RiskFactorGridProps> = ({
  riskGrid,
  checkedMap = {},
  customPt = 6.5,
}) => {
  return (
    <div className="w-full flex flex-col gap-[3px] my-[3px]">
      {riskGrid.map((row, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-3 gap-1">
          {row.map((item) => (
            <FormCheckbox
              key={item}
              label={item}
              checked={Boolean(checkedMap[item])}
              customPt={customPt}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
