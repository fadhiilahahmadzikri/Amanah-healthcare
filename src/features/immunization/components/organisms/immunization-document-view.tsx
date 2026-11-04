'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FormText } from '../atoms/form-typography';
import { DottedFieldLine } from '../atoms/dotted-field-line';
import { DocHeaderBoxes } from '../molecules/doc-header-boxes';
import {
  CANONICAL_IMMUNIZATION_ROWS,
  DEFAULT_OBJECTIVE_PLACEHOLDERS,
  DEFAULT_SUBJECTIVE_PLACEHOLDERS,
  IMMUNIZATION_DOC_CONFIG
} from '../../constants/immunization.constants';
import type {
  ImmunizationClinicalEntry,
  ImmunizationIntakeRecord
} from '../../types/immunization.types';

export interface ImmunizationDocumentViewProps {
  intake?: ImmunizationIntakeRecord | null;
  entries?: ImmunizationClinicalEntry[];
  patientDigits?: string[];
  onExportDocx?: () => void;
  onEditEntry?: (entry: ImmunizationClinicalEntry) => void;
  isReadOnly?: boolean;
}

export function ImmunizationDocumentView({
  intake,
  entries = [],
  patientDigits = [],
  onExportDocx,
  onEditEntry,
  isReadOnly = false
}: ImmunizationDocumentViewProps) {
  // Map stored entries by rowIndex (0-14)
  const entriesMap = React.useMemo(() => {
    const map = new Map<number, ImmunizationClinicalEntry>();
    for (const e of entries) {
      map.set(e.rowIndex, e);
    }
    return map;
  }, [entries]);

  const birthDateSexDisplay = React.useMemo(() => {
    if (!intake?.childBirthDate) return '( L / P )';
    const sexLetter = intake.childSex === 'Perempuan' ? 'P' : 'L';
    return `${intake.childBirthDate} (${sexLetter})`;
  }, [intake?.childBirthDate, intake?.childSex]);

  return (
    <div className='flex flex-col items-center w-full max-w-[850px] mx-auto bg-neutral-100 p-2 sm:p-6 rounded-xl border border-border/60 shadow-sm'>
      {/* Top Toolbar */}
      <div className='flex items-center justify-between w-full mb-3 px-1'>
        <div className='flex items-center gap-2'>
          <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-xs font-semibold text-neutral-700 tracking-wide'>
            Formulir Rekam Medis Imunisasi (1:1 Standar Klinik)
          </span>
        </div>

        {onExportDocx && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onExportDocx}
            className='h-8 text-xs font-semibold gap-1.5 shadow-xs border-neutral-300 bg-white hover:bg-neutral-50'
          >
            <Icons.download className='size-3.5 text-primary' />
            <span>Unduh DOCX</span>
          </Button>
        )}
      </div>

      {/* A4 Sheet Container */}
      <div className='w-full bg-white text-black p-6 sm:p-8 rounded-lg shadow-md border border-neutral-300 font-serif select-text'>
        {/* 1. Header Section */}
        <div className='flex items-start justify-between border-b border-transparent pb-2 mb-3'>
          <div className='flex flex-col justify-end pt-1'>
            <FormText customPt={11} bold underline className='tracking-wide'>
              {IMMUNIZATION_DOC_CONFIG.header.title}
            </FormText>
            <FormText customPt={10} className='tracking-wider mt-[2px]'>
              {IMMUNIZATION_DOC_CONFIG.header.subtitle}
            </FormText>
          </div>

          <DocHeaderBoxes
            topCode={IMMUNIZATION_DOC_CONFIG.header.topCode}
            recordDigits={patientDigits}
          />
        </div>

        {/* 2. Identity Section (4-column table) */}
        <div className='w-full mb-2.5'>
          <table className='w-full border-collapse border border-black table-fixed text-[10px]'>
            <colgroup>
              <col style={{ width: '13%' }} />
              <col style={{ width: '37%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '38%' }} />
            </colgroup>
            <tbody>
              {/* Row 1: Nama Anak | Nama Ayah */}
              <tr className='h-[22px]'>
                <td className='px-1.5 py-0.5 align-middle'>
                  <FormText customPt={7.2}>Nama Anak</FormText>
                </td>
                <td className='px-1.5 py-0.5 align-middle border-r border-r-black'>
                  <DottedFieldLine
                    value={intake?.childName}
                    boldValue={Boolean(intake?.childName)}
                    minHeight='15px'
                  />
                </td>
                <td className='px-1.5 py-0.5 align-middle'>
                  <FormText customPt={7.2}>Nama Ayah</FormText>
                </td>
                <td className='px-1.5 py-0.5 align-middle'>
                  <DottedFieldLine
                    value={intake?.fatherName}
                    boldValue={Boolean(intake?.fatherName)}
                    minHeight='15px'
                  />
                </td>
              </tr>

              {/* Row 2: NIK | Nama Ibu */}
              <tr className='h-[22px]'>
                <td className='px-1.5 py-0.5 align-middle'>
                  <FormText customPt={7.2}>NIK</FormText>
                </td>
                <td className='px-1.5 py-0.5 align-middle border-r border-r-black'>
                  <DottedFieldLine
                    value={intake?.childNik}
                    boldValue={Boolean(intake?.childNik)}
                    minHeight='15px'
                  />
                </td>
                <td className='px-1.5 py-0.5 align-middle'>
                  <FormText customPt={7.2}>Nama Ibu</FormText>
                </td>
                <td className='px-1.5 py-0.5 align-middle'>
                  <DottedFieldLine
                    value={intake?.motherName}
                    boldValue={Boolean(intake?.motherName)}
                    minHeight='15px'
                  />
                </td>
              </tr>

              {/* Row 3: Tanggal Lahir | Alamat */}
              <tr className='h-[22px]'>
                <td className='px-1.5 py-0.5 align-middle'>
                  <FormText customPt={7.2}>Tanggal Lahir</FormText>
                </td>
                <td className='px-1.5 py-0.5 align-middle border-r border-r-black'>
                  <DottedFieldLine
                    value={birthDateSexDisplay}
                    boldValue={Boolean(intake?.childBirthDate)}
                    className='justify-end text-right'
                    minHeight='15px'
                  />
                </td>
                <td className='px-1.5 py-0.5 align-middle'>
                  <FormText customPt={7.2}>Alamat</FormText>
                </td>
                <td className='px-1.5 py-0.5 align-middle'>
                  <DottedFieldLine
                    value={intake?.childAddress}
                    boldValue={Boolean(intake?.childAddress)}
                    minHeight='15px'
                  />
                </td>
              </tr>

              {/* Row 4: No HP | (blank) */}
              <tr className='h-[22px]'>
                <td className='px-1.5 py-0.5 align-middle'>
                  <FormText customPt={7.2}>No HP</FormText>
                </td>
                <td className='px-1.5 py-0.5 align-middle border-r border-r-black'>
                  <DottedFieldLine
                    value={intake?.parentPhone}
                    boldValue={Boolean(intake?.parentPhone)}
                    minHeight='15px'
                  />
                </td>
                <td className='px-1.5 py-0.5 align-middle' />
                <td className='px-1.5 py-0.5 align-middle' />
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. Pre-Table Section (Riwayat Vaksin & Alergi) */}
        <div className='w-full grid grid-cols-2 gap-4 items-baseline mb-2 text-[10px]'>
          <div className='flex items-baseline'>
            <FormText customPt={7.2} italic>
              {intake?.previousVaccineHistory
                ? `Riwayat Vaksin Sebelumnya: ${intake.previousVaccineHistory}`
                : 'Riwayat Vaksin Sebelumnya'}
            </FormText>
          </div>

          <div className='flex items-baseline'>
            <DottedFieldLine
              label='Riwayat Alergi :'
              value={intake?.childAllergyHistory}
              boldLabel
              boldValue
              minHeight='15px'
            />
          </div>
        </div>

        {/* 4. Canonical 15-Row Vaccine Table */}
        <div className='w-full overflow-x-auto'>
          <table className='w-full border-collapse border border-black table-fixed text-[9px]'>
            <colgroup>
              <col style={{ width: '25.8%' }} />
              <col style={{ width: '10.1%' }} />
              <col style={{ width: '7.8%' }} />
              <col style={{ width: '17.0%' }} />
              <col style={{ width: '19.3%' }} />
              <col style={{ width: '20.0%' }} />
            </colgroup>
            <thead>
              <tr className='bg-neutral-50 border-b border-black text-center font-bold'>
                {IMMUNIZATION_DOC_CONFIG.tableHeaders.map((header, idx) => (
                  <th
                    key={idx}
                    className='border border-black px-1 py-1 text-center align-middle font-bold'
                  >
                    {header === 'TGL SUNTIK' ? (
                      <div className='flex flex-col items-center justify-center leading-none'>
                        <FormText customPt={7.5} bold align='center'>
                          TGL
                        </FormText>
                        <FormText customPt={7.5} bold align='center'>
                          SUNTIK
                        </FormText>
                      </div>
                    ) : (
                      <FormText customPt={7.5} bold align='center'>
                        {header}
                      </FormText>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CANONICAL_IMMUNIZATION_ROWS.map((rowDef) => {
                const entry = entriesMap.get(rowDef.rowIndex);
                const isGiven = entry?.status === 'GIVEN';

                // Subjective display: Real values if given, otherwise placeholders
                const subjectiveLines = isGiven
                  ? [
                      `Demam: ${entry?.fever || 'Tidak'}`,
                      `Batuk: ${entry?.cough || 'Tidak'}`,
                      `Pilek: ${entry?.runnyNose || 'Tidak'}`
                    ]
                  : DEFAULT_SUBJECTIVE_PLACEHOLDERS;

                // Objective display: Real measurements if given, otherwise placeholders
                const bbStr =
                  entry?.weightKg !== undefined && entry?.weightKg !== null
                    ? `${entry.weightKg} kg`
                    : '-';
                const pbStr =
                  entry?.heightCm !== undefined && entry?.heightCm !== null
                    ? `${entry.heightCm} cm`
                    : '-';
                const lkStr =
                  entry?.headCircumferenceCm !== undefined &&
                  entry?.headCircumferenceCm !== null
                    ? `${entry.headCircumferenceCm} cm`
                    : '-';
                const tempStr =
                  entry?.temperatureCelsius !== undefined &&
                  entry?.temperatureCelsius !== null
                    ? `${entry.temperatureCelsius} C`
                    : '-';

                const objectiveLines = isGiven
                  ? [`BB/PB: ${bbStr}/${pbStr}`, `LK/S: ${lkStr}/${tempStr}`]
                  : DEFAULT_OBJECTIVE_PLACEHOLDERS;

                const borderBottomClass = rowDef.separatorAfter
                  ? 'border-b-2 border-b-black'
                  : 'border-b border-black';

                return (
                  <tr
                    key={rowDef.rowIndex}
                    onClick={() => {
                      if (!isReadOnly && onEditEntry) {
                        onEditEntry(
                          entry || {
                            rowIndex: rowDef.rowIndex,
                            vaccineName: rowDef.vaccineName,
                            vaccineCode: rowDef.vaccineCode,
                            status: 'NOT_GIVEN'
                          }
                        );
                      }
                    }}
                    className={`h-[42px] transition-colors ${borderBottomClass} ${
                      !isReadOnly && onEditEntry
                        ? 'hover:bg-primary/5 cursor-pointer'
                        : ''
                    }`}
                  >
                    {/* Col 1: Jenis Vaksin */}
                    <td className='border-r border-black px-1.5 py-1 align-middle'>
                      <div className='flex flex-col gap-0.5'>
                        {rowDef.displayLines.map((line, lIdx) => (
                          <div key={lIdx} className='flex items-center justify-between'>
                            <FormText customPt={7.2}>{line.left}</FormText>
                            {line.right && (
                              <FormText customPt={7.2} className='text-neutral-600'>
                                {line.right}
                              </FormText>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Col 2: Tanggal Suntik */}
                    <td className='border-r border-black px-1 py-1 text-center align-middle'>
                      <FormText customPt={6.4} align='center'>
                        {entry?.injectionDate || ''}
                      </FormText>
                    </td>

                    {/* Col 3: Umur */}
                    <td className='border-r border-black px-1 py-1 text-center align-middle'>
                      <FormText customPt={6.4} align='center'>
                        {entry?.ageDisplay || ''}
                      </FormText>
                    </td>

                    {/* Col 4: Subjektif */}
                    <td className='border-r border-black px-1.5 py-1 align-middle'>
                      <div className='flex flex-col gap-0.5'>
                        {subjectiveLines.map((line, sIdx) => (
                          <FormText key={sIdx} customPt={6.3}>
                            {line}
                          </FormText>
                        ))}
                      </div>
                    </td>

                    {/* Col 5: Objektif */}
                    <td className='border-r border-black px-1.5 py-1 align-middle'>
                      <div className='flex flex-col gap-0.5'>
                        {objectiveLines.map((line, oIdx) => (
                          <FormText
                            key={oIdx}
                            customPt={isGiven ? 6.3 : 7.2}
                            bold={!isGiven}
                          >
                            {line}
                          </FormText>
                        ))}
                      </div>
                    </td>

                    {/* Col 6: Planning */}
                    <td className='px-1.5 py-1 align-middle'>
                      <FormText customPt={6.3}>{entry?.planning || ''}</FormText>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
