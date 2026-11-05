'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CANONICAL_MATERNAL_CONDITIONS } from '../../constants/maternity.constants';
import type { MaternalConditionResponse } from '../../types/maternity.types';

export interface MaternalConditionChecklistProps {
  conditions: MaternalConditionResponse[];
  isEditing?: boolean;
  motherBirthDate?: string | null;
  onChange?: (updated: MaternalConditionResponse[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function MaternalConditionChecklist({
  conditions,
  isEditing = false,
  motherBirthDate,
  onChange,
  validationErrors,
  onClearError
}: MaternalConditionChecklistProps) {
  const currentYear = new Date().getFullYear();
  const birthYear = React.useMemo(() => {
    if (!motherBirthDate) return 1900;
    const parsed = new Date(motherBirthDate).getFullYear();
    return Number.isNaN(parsed) ? 1900 : parsed;
  }, [motherBirthDate]);

  // Map conditions by conditionCode
  const conditionsMap = React.useMemo(() => {
    const map = new Map<string, MaternalConditionResponse>();
    for (const c of conditions) {
      map.set(c.conditionCode.toUpperCase(), c);
    }
    return map;
  }, [conditions]);

  const handleToggle = (code: string, checked: boolean) => {
    if (!onChange) return;
    const upperCode = code.toUpperCase();
    const updated = [...conditions];
    const index = updated.findIndex(
      (c) => c.conditionCode.toUpperCase() === upperCode
    );

    if (index >= 0) {
      updated[index] = {
        ...updated[index],
        hasCondition: checked,
        diagnosisYear: checked ? updated[index].diagnosisYear : null
      };
    } else {
      updated.push({
        conditionCode: code,
        hasCondition: checked,
        diagnosisYear: null,
        notes: null
      });
    }

    if (!checked) {
      onClearError?.(`condition_${code}_year`);
    }

    onChange(updated);
  };

  const handleYearChange = (code: string, year: number | null) => {
    if (!onChange) return;
    const upperCode = code.toUpperCase();
    const updated = [...conditions];
    const index = updated.findIndex(
      (c) => c.conditionCode.toUpperCase() === upperCode
    );

    if (index >= 0) {
      updated[index] = {
        ...updated[index],
        diagnosisYear: year
      };
    } else {
      updated.push({
        conditionCode: code,
        hasCondition: true,
        diagnosisYear: year,
        notes: null
      });
    }

    if (validationErrors?.[`condition_${code}_year`]) {
      onClearError?.(`condition_${code}_year`);
    }

    onChange(updated);
  };

  const handleNotesChange = (code: string, notes: string) => {
    if (!onChange) return;
    const upperCode = code.toUpperCase();
    const updated = [...conditions];
    const index = updated.findIndex(
      (c) => c.conditionCode.toUpperCase() === upperCode
    );

    if (index >= 0) {
      updated[index] = {
        ...updated[index],
        notes
      };
    } else {
      updated.push({
        conditionCode: code,
        hasCondition: true,
        diagnosisYear: null,
        notes
      });
    }
    onChange(updated);
  };

  const confirmedCount = React.useMemo(
    () => conditions.filter((c) => c.hasCondition).length,
    [conditions]
  );

  return (
    <div className='space-y-3 font-sans'>
      <div className='flex items-center justify-between pb-1 border-b border-border/40'>
        <span className='text-xs font-semibold text-muted-foreground'>
          Skrining 14 Kondisi Kesehatan & Penyakit Medis
        </span>
        <span className='text-[11px] text-muted-foreground font-medium'>
          {confirmedCount} dari {CANONICAL_MATERNAL_CONDITIONS.length} terkonfirmasi
        </span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {CANONICAL_MATERNAL_CONDITIONS.map((item) => {
          const resp = conditionsMap.get(item.code.toUpperCase());
          const hasCondition = resp ? resp.hasCondition : false;
          const year = resp?.diagnosisYear;
          const notes = resp?.notes;
          const errorKey = `condition_${item.code}_year`;
          const conditionError = validationErrors?.[errorKey];

          return (
            <div
              key={item.code}
              onClick={() => {
                if (isEditing) {
                  handleToggle(item.code, !hasCondition);
                }
              }}
              className={cn(
                'p-3 rounded-lg border transition-all bg-card',
                isEditing && 'cursor-pointer hover:border-primary/50',
                hasCondition
                  ? 'border-primary/60'
                  : 'border-border/60 hover:bg-muted/10',
                conditionError && 'border-destructive'
              )}
            >
              <div className='flex items-start justify-between gap-3'>
                {/* Sisi Kiri: Checkbox, Label & Pertanyaan Skrining */}
                <div className='flex items-start gap-2.5 flex-1 min-w-0'>
                  {isEditing ? (
                    <Checkbox
                      id={`cond-${item.code}`}
                      checked={hasCondition}
                      onCheckedChange={(checked) =>
                        handleToggle(item.code, Boolean(checked))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className='mt-0.5 cursor-pointer shrink-0'
                    />
                  ) : (
                    <Checkbox
                      checked={hasCondition}
                      disabled
                      className='mt-0.5 pointer-events-none opacity-80 shrink-0'
                    />
                  )}

                  <div className='flex-1 min-w-0 space-y-1'>
                    <Label
                      htmlFor={`cond-${item.code}`}
                      className={cn(
                        'text-xs font-semibold leading-tight block text-foreground',
                        isEditing && 'cursor-pointer'
                      )}
                    >
                      {item.name}
                    </Label>
                    <p className='text-[11px] text-muted-foreground leading-normal'>
                      {item.questionPrompt}
                    </p>

                    {/* Catatan Penyakit Khusus OTHER */}
                    {hasCondition && item.code === 'OTHER' && (
                      <div
                        className='pt-2'
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isEditing ? (
                          <input
                            value={notes || ''}
                            onChange={(e) =>
                              handleNotesChange(item.code, e.target.value)
                            }
                            placeholder='Nama penyakit atau keluhan lain...'
                            className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/80 focus:outline-none focus:border-primary shadow-none'
                          />
                        ) : (
                          notes && (
                            <span className='text-xs text-muted-foreground italic truncate block'>
                              Nama Penyakit: {notes}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sisi Kanan (Ujung Kanan): Input / Tampilan Tahun Terkonfirmasi */}
                {hasCondition && (
                  <div
                    className='shrink-0 flex flex-col items-end pl-2'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isEditing ? (
                      <div className='w-28 space-y-1'>
                        <span className='text-[10px] text-muted-foreground block text-right font-medium'>
                          Tahun Diagnosis
                        </span>
                        <input
                          type='number'
                          min={birthYear}
                          max={currentYear}
                          value={year ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleYearChange(
                              item.code,
                              val ? Number(val) : null
                            );
                          }}
                          placeholder='YYYY'
                          className={cn(
                            'h-7 w-full text-xs px-1 text-right font-mono bg-transparent rounded-none border-0 border-b border-border/80 focus:outline-none focus:border-primary shadow-none',
                            conditionError && 'border-destructive text-destructive'
                          )}
                        />
                        {conditionError && (
                          <p className='text-[10px] text-destructive leading-tight text-right mt-0.5 font-medium'>
                            {conditionError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className='text-right'>
                        <span className='text-[10px] text-muted-foreground block'>
                          Tahun
                        </span>
                        <span className='text-xs font-semibold font-mono text-foreground'>
                          {year || '-'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
