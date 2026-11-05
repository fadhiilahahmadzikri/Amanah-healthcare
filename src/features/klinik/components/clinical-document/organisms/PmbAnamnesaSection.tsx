/* oxlint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { SectionHeader } from '../atoms/SectionHeader';
import { FormText } from '../atoms/FormText';
import { FormCheckbox } from '../atoms/FormCheckbox';
import { DottedLine } from '../atoms/DottedLine';
import { DashedLine } from '../atoms/DashedLine';
import { DiseaseCheckRow } from '../molecules/DiseaseCheckRow';
import type { PmbAnamnesaConfig, DiseaseRecord } from '../types';

export interface PmbAnamnesaSectionProps {
  config: PmbAnamnesaConfig;
  data?: {
    promptValues?: (string | undefined)[];
    riskChecked?: Record<string, boolean>;
    environment?: string;
    otherLines?: string[];
    diseaseHistory?: Record<string, DiseaseRecord>;
  };
}

export const PmbAnamnesaSection: React.FC<PmbAnamnesaSectionProps> = ({ config, data }) => {
  return (
    <div className='w-full mb-1'>
      <SectionHeader title='ANAMNESA' beforeGapPx={4} afterGapPx={1} />

      <table className='w-full border-collapse border border-black table-fixed bg-white'>
        <colgroup>
          <col style={{ width: '17.95%' }} />
          <col style={{ width: '17.95%' }} />
          <col style={{ width: '17.94%' }} />
          <col style={{ width: '4.79%' }} />
          <col style={{ width: '20.67%' }} />
          <col style={{ width: '5.71%' }} />
          <col style={{ width: '6.90%' }} />
          <col style={{ width: '8.09%' }} />
        </colgroup>
        <tbody>
          {/* Row 0: Prompt 1 | Header Penyakit */}
          <tr className='h-[17px]'>
            <td colSpan={3} className='border-r border-black border-b border-black/40 px-1 py-0.5 align-middle'>
              <DottedLine
                label={config.prompts[0]}
                value={data?.promptValues?.[0]}
                customPt={6.8}
                minHeight='13px'
              />
            </td>
            <th className='border-r border-black border-b border-black text-center px-0.5 py-0 font-bold'>
              <FormText customPt={6.6} bold align='center'>No</FormText>
            </th>
            <th className='border-r border-black border-b border-black text-center px-0.5 py-0 font-bold'>
              <FormText customPt={6.6} bold align='center'>Riwayat Penyakit</FormText>
            </th>
            <th className='border-r border-black border-b border-black text-center px-0.5 py-0 font-bold'>
              <FormText customPt={6.6} bold align='center'>Ya</FormText>
            </th>
            <th className='border-r border-black border-b border-black text-center px-0.5 py-0 font-bold'>
              <FormText customPt={6.6} bold align='center'>Tidak</FormText>
            </th>
            <th className='border-b border-black text-center px-0.5 py-0 font-bold'>
              <FormText customPt={6.6} bold align='center'>Tahun</FormText>
            </th>
          </tr>

          {/* Row 1: Prompt 2 | Disease 1 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-black/40 px-1 py-0.5 align-middle'>
              <DottedLine
                label={config.prompts[1]}
                value={data?.promptValues?.[1]}
                customPt={6.8}
                minHeight='13px'
              />
            </td>
            <DiseaseCheckRow
              index={1}
              disease={config.diseases[0]}
              record={data?.diseaseHistory?.[config.diseases[0]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 2: Prompt 3 | Disease 2 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-black/40 px-1 py-0.5 align-middle'>
              <DottedLine
                label={config.prompts[2]}
                value={data?.promptValues?.[2]}
                customPt={6.8}
                minHeight='13px'
              />
            </td>
            <DiseaseCheckRow
              index={2}
              disease={config.diseases[1]}
              record={data?.diseaseHistory?.[config.diseases[1]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 3: Prompt 4 | Disease 3 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-black/40 px-1 py-0.5 align-middle'>
              <DottedLine
                label={config.prompts[3]}
                value={data?.promptValues?.[3]}
                customPt={6.8}
                minHeight='13px'
              />
            </td>
            <DiseaseCheckRow
              index={3}
              disease={config.diseases[2]}
              record={data?.diseaseHistory?.[config.diseases[2]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 4: Risk Title | Disease 4 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-black/40 px-1 py-0.5 align-middle'>
              <FormText customPt={6.7} bold>{config.riskTitle}</FormText>
            </td>
            <DiseaseCheckRow
              index={4}
              disease={config.diseases[3]}
              record={data?.diseaseHistory?.[config.diseases[3]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 5: Risk Grid Row 0 | Disease 5 */}
          <tr className='h-[21px]'>
            <td className='border-b border-black/40 px-1 py-0.5 align-middle overflow-hidden whitespace-nowrap'>
              <FormCheckbox
                label={config.riskGrid[0]?.[0] || 'Merokok'}
                checked={Boolean(data?.riskChecked?.[config.riskGrid[0]?.[0] || 'Merokok'])}
                customPt={6.5}
              />
            </td>
            <td className='border-b border-black/40 px-1 py-0.5 align-middle'>
              <FormCheckbox
                label={config.riskGrid[0]?.[1] || 'Pola Makan Beresiko'}
                checked={Boolean(data?.riskChecked?.[config.riskGrid[0]?.[1] || 'Pola Makan Beresiko'])}
                customPt={6.5}
              />
            </td>
            <td className='border-r border-black border-b border-black/40 px-1 py-0.5 align-middle'>
              <FormCheckbox
                label={config.riskGrid[0]?.[2] || 'Aktivitas fisik berkurang'}
                checked={Boolean(data?.riskChecked?.[config.riskGrid[0]?.[2] || 'Aktivitas fisik berkurang'])}
                customPt={6.5}
              />
            </td>
            <DiseaseCheckRow
              index={5}
              disease={config.diseases[4]}
              record={data?.diseaseHistory?.[config.diseases[4]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 6: Risk Grid Row 1 | Disease 6 */}
          <tr className='h-[21px]'>
            <td className='border-b border-black/40 px-1 py-0.5 align-middle'>
              <FormCheckbox
                label={config.riskGrid[1]?.[0] || 'Alkohol'}
                checked={Boolean(data?.riskChecked?.[config.riskGrid[1]?.[0] || 'Alkohol'])}
                customPt={6.5}
              />
            </td>
            <td className='border-b border-black/40 px-1 py-0.5 align-middle'>
              <FormCheckbox
                label={config.riskGrid[1]?.[1] || 'Obat Teratogenik'}
                checked={Boolean(data?.riskChecked?.[config.riskGrid[1]?.[1] || 'Obat Teratogenik'])}
                customPt={6.5}
              />
            </td>
            <td className='border-r border-black border-b border-black/40 px-1 py-0.5 align-middle'>
              <FormCheckbox
                label={config.riskGrid[1]?.[2] || 'Kosmetik dengan zat berbahaya'}
                checked={Boolean(data?.riskChecked?.[config.riskGrid[1]?.[2] || 'Kosmetik dengan zat berbahaya'])}
                customPt={6.5}
              />
            </td>
            <DiseaseCheckRow
              index={6}
              disease={config.diseases[5]}
              record={data?.diseaseHistory?.[config.diseases[5]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 7: Environment Risk | Disease 7 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-black/40 px-1 py-0.5 align-middle'>
              <DottedLine
                label={config.environmentLabel}
                value={data?.environment}
                customPt={6.8}
                minHeight='13px'
              />
            </td>
            <DiseaseCheckRow
              index={7}
              disease={config.diseases[6]}
              record={data?.diseaseHistory?.[config.diseases[6]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 8: Lain-lain Line 1 | Disease 8 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-dashed border-[#777777] px-1 py-0.5 align-middle'>
              <DashedLine
                label={config.otherLabel}
                value={data?.otherLines?.[0]}
                customPt={6.8}
              />
            </td>
            <DiseaseCheckRow
              index={8}
              disease={config.diseases[7]}
              record={data?.diseaseHistory?.[config.diseases[7]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 9: Lain-lain Line 2 | Disease 9 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-dashed border-[#777777] px-1 py-0.5 align-middle'>
              <DashedLine
                value={data?.otherLines?.[1]}
                customPt={6.8}
              />
            </td>
            <DiseaseCheckRow
              index={9}
              disease={config.diseases[8]}
              record={data?.diseaseHistory?.[config.diseases[8]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 10: Lain-lain Line 3 | Disease 10 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-dashed border-[#777777] px-1 py-0.5 align-middle'>
              <DashedLine
                value={data?.otherLines?.[2]}
                customPt={6.8}
              />
            </td>
            <DiseaseCheckRow
              index={10}
              disease={config.diseases[9]}
              record={data?.diseaseHistory?.[config.diseases[9]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 11: Blank Integrated 1 | Disease 11 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black px-1 py-0.5 align-middle'>
              <div className='h-[13px]' />
            </td>
            <DiseaseCheckRow
              index={11}
              disease={config.diseases[10]}
              record={data?.diseaseHistory?.[config.diseases[10]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 12: Blank Integrated 2 | Disease 12 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black px-1 py-0.5 align-middle'>
              <div className='h-[13px]' />
            </td>
            <DiseaseCheckRow
              index={12}
              disease={config.diseases[11]}
              record={data?.diseaseHistory?.[config.diseases[11]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 13: Blank Integrated 3 | Disease 13 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black px-1 py-0.5 align-middle'>
              <div className='h-[13px]' />
            </td>
            <DiseaseCheckRow
              index={13}
              disease={config.diseases[12]}
              record={data?.diseaseHistory?.[config.diseases[12]]}
              customPt={6.5}
            />
          </tr>

          {/* Row 14: Blank Integrated 4 (last row with bottom border) | Disease 14 */}
          <tr className='h-[15.5px]'>
            <td colSpan={3} className='border-r border-black border-b border-black px-1 py-0.5 align-middle'>
              <div className='h-[13px]' />
            </td>
            <DiseaseCheckRow
              index={14}
              disease={config.diseases[13]}
              record={data?.diseaseHistory?.[config.diseases[13]]}
              customPt={6.5}
            />
          </tr>
        </tbody>
      </table>
    </div>
  );
};
