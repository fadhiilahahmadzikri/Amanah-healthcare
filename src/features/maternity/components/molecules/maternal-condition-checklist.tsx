'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CANONICAL_MATERNAL_CONDITIONS } from '../../constants/maternity.constants';
import type { MaternalConditionResponse } from '../../types/maternity.types';

export interface MaternalConditionChecklistProps {
  conditions: MaternalConditionResponse[];
  isEditing?: boolean;
  motherBirthDate?: string | null;
  onChange?: (updated: MaternalConditionResponse[]) => void;
}

export function MaternalConditionChecklist({
  conditions,
  isEditing = false,
  motherBirthDate,
  onChange,
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
    const existing = conditionsMap.get(upperCode);
    const updated = [...conditions];
    const index = updated.findIndex(
      (c) => c.conditionCode.toUpperCase() === upperCode,
    );

    if (index >= 0) {
      updated[index] = {
        ...updated[index],
        hasCondition: checked,
        diagnosisYear: checked ? updated[index].diagnosisYear : null,
      };
    } else {
      updated.push({
        conditionCode: code,
        hasCondition: checked,
        diagnosisYear: null,
        notes: null,
      });
    }
    onChange(updated);
  };

  const handleYearChange = (code: string, year: number | null) => {
    if (!onChange) return;
    const upperCode = code.toUpperCase();
    const updated = [...conditions];
    const index = updated.findIndex(
      (c) => c.conditionCode.toUpperCase() === upperCode,
    );

    if (index >= 0) {
      updated[index] = {
        ...updated[index],
        diagnosisYear: year,
      };
    } else {
      updated.push({
        conditionCode: code,
        hasCondition: true,
        diagnosisYear: year,
        notes: null,
      });
    }
    onChange(updated);
  };

  const handleNotesChange = (code: string, notes: string) => {
    if (!onChange) return;
    const upperCode = code.toUpperCase();
    const updated = [...conditions];
    const index = updated.findIndex(
      (c) => c.conditionCode.toUpperCase() === upperCode,
    );

    if (index >= 0) {
      updated[index] = {
        ...updated[index],
        notes,
      };
    } else {
      updated.push({
        conditionCode: code,
        hasCondition: true,
        diagnosisYear: null,
        notes,
      });
    }
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Skrining 14 Kondisi Kesehatan & Penyakit Medis
        </span>
        <span className="text-[11px] text-muted-foreground">
          {conditions.filter((c) => c.hasCondition).length} dari{' '}
          {CANONICAL_MATERNAL_CONDITIONS.length} terkonfirmasi
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CANONICAL_MATERNAL_CONDITIONS.map((item) => {
          const resp = conditionsMap.get(item.code.toUpperCase());
          const hasCondition = resp ? resp.hasCondition : false;
          const year = resp?.diagnosisYear;
          const notes = resp?.notes;

          return (
            <div
              key={item.code}
              onClick={() => {
                if (isEditing) {
                  handleToggle(item.code, !hasCondition);
                }
              }}
              className={`p-3 rounded-lg border transition-colors ${
                isEditing ? 'cursor-pointer hover:border-primary/50' : ''
              } ${
                hasCondition
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-border/60 bg-card'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isEditing ? (
                  <Checkbox
                    id={`cond-${item.code}`}
                    checked={hasCondition}
                    onCheckedChange={(checked) =>
                      handleToggle(item.code, Boolean(checked))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 cursor-pointer"
                  />
                ) : (
                  <div
                    className={`size-4 rounded flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                      hasCondition
                        ? 'bg-amber-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {hasCondition ? '✓' : '—'}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <Label
                    htmlFor={`cond-${item.code}`}
                    className={`text-xs font-semibold leading-tight block ${
                      isEditing ? 'cursor-pointer' : ''
                    }`}
                  >
                    {item.name}
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {item.questionPrompt}
                  </p>

                  {hasCondition && (
                    <div
                      className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-28 shrink-0">
                        {isEditing ? (
                          <Input
                            type="number"
                            min={birthYear}
                            max={currentYear}
                            value={year || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleYearChange(
                                item.code,
                                val ? Number(val) : null,
                              );
                            }}
                            placeholder="Tahun..."
                            className="h-7 text-xs px-2"
                          />
                        ) : (
                          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            Tahun: {year || '-'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <Input
                            value={notes || ''}
                            onChange={(e) =>
                              handleNotesChange(item.code, e.target.value)
                            }
                            placeholder={
                              item.code === 'OTHER'
                                ? 'Nama penyakit atau keluhan lain...'
                                : 'Catatan tambahan (opsional)...'
                            }
                            className="h-7 text-xs px-2"
                          />
                        ) : (
                          notes && (
                            <span className="text-xs text-muted-foreground italic truncate block">
                              Catatan: {notes}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
