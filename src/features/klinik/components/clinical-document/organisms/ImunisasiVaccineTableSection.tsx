import React from 'react';
import { FormText } from '../atoms/FormText';
import { VaccineRowItem } from '../molecules/VaccineRowItem';
import type { ImunisasiVaccineTableConfig, VaccineRowData } from '../types';

export interface ImunisasiVaccineTableSectionProps {
  config: ImunisasiVaccineTableConfig;
  data?: (VaccineRowData | undefined)[];
}

export const ImunisasiVaccineTableSection: React.FC<ImunisasiVaccineTableSectionProps> = ({
  config,
  data = [],
}) => {
  const colWidths = [25.77, 10.12, 7.82, 17.03, 19.33, 19.93];

  return (
    <div className="w-full">
      <table className="w-full border-collapse border border-black table-fixed">
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: `${w}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr className="h-[26px] bg-white border-b border-black">
            {config.headers.map((header, idx) => (
              <th
                key={idx}
                className="border border-black px-1 py-1 text-center align-middle"
              >
                {header === 'TGL SUNTIK' ? (
                  <div className="flex flex-col items-center justify-center leading-none">
                    <FormText customPt={7.5} bold align="center">
                      TGL
                    </FormText>
                    <FormText customPt={7.5} bold align="center">
                      SUNTIK
                    </FormText>
                  </div>
                ) : (
                  <FormText customPt={7.5} bold align="center">
                    {header}
                  </FormText>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {config.rows.map((definition, idx) => (
            <VaccineRowItem
              key={idx}
              definition={definition}
              data={data[idx]}
              defaultSubjective={config.subjective}
              defaultObjective={config.objective}
              bodyPt={7.2}
              smallPt={6.3}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
