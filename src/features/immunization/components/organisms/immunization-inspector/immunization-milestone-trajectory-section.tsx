'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MilestoneStatusBadge } from '../../atoms/milestone-status-badge';
import { MilestoneRowEditor } from '../../molecules/milestone-row-editor';
import { CANONICAL_IMMUNIZATION_ROWS } from '../../../constants/immunization.constants';
import { validateImmunizationDateEntry } from '@/features/klinik/schemas/medical-appointment-validation';
import type { ImmunizationClinicalEntry } from '../../../types/immunization.types';

export interface ImmunizationMilestoneTrajectorySectionProps {
  entries: ImmunizationClinicalEntry[];
  isEditing?: boolean;
  onEntriesChange?: (updated: ImmunizationClinicalEntry[]) => void;
  childBirthDate?: string | null;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function ImmunizationMilestoneTrajectorySection({
  entries,
  isEditing = false,
  onEntriesChange,
  childBirthDate,
  validationErrors = {},
  onClearError
}: ImmunizationMilestoneTrajectorySectionProps) {
  const [activeEditingIndex, setActiveEditingIndex] = React.useState<number | null>(null);
  const [dateErrors, setDateErrors] = React.useState<Record<number, string>>({});

  // Auto-expand the milestone row that has validation errors
  React.useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const firstEntryKey = Object.keys(validationErrors).find((k) => k.startsWith('entry_'));
      if (firstEntryKey) {
        const match = firstEntryKey.match(/^entry_(\d+)_/);
        if (match) {
          const errRowIndex = Number(match[1]);
          if (!Number.isNaN(errRowIndex)) {
            setActiveEditingIndex(errRowIndex);
          }
        }
      }
    }
  }, [validationErrors]);

  // Map entries by rowIndex (0-14)
  const entriesMap = React.useMemo(() => {
    const map = new Map<number, ImmunizationClinicalEntry>();
    for (const e of entries) {
      map.set(e.rowIndex, e);
    }
    return map;
  }, [entries]);

  const handleUpdateEntry = (updated: ImmunizationClinicalEntry) => {
    if (!onEntriesChange) return;

    // Validate injection date against birth date if provided
    if (updated.injectionDate) {
      const res = validateImmunizationDateEntry(updated.injectionDate, childBirthDate);
      if (!res.isValid && res.errors.injectionDate) {
        setDateErrors((prev) => ({ ...prev, [updated.rowIndex]: res.errors.injectionDate! }));
      } else {
        setDateErrors((prev) => {
          const next = { ...prev };
          delete next[updated.rowIndex];
          return next;
        });
      }
    } else {
      setDateErrors((prev) => {
        const next = { ...prev };
        delete next[updated.rowIndex];
        return next;
      });
    }

    const newEntries = [...entries];
    const existingIndex = newEntries.findIndex((e) => e.rowIndex === updated.rowIndex);
    if (existingIndex >= 0) {
      newEntries[existingIndex] = updated;
    } else {
      newEntries.push(updated);
    }
    onEntriesChange(newEntries);
  };

  return (
    <div className='rounded-2xl p-4 sm:p-5 bg-surface-subtle/80 dark:bg-muted/20 shadow-xs space-y-4 font-sans'>
      <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
        Jadwal & Trajektori Imunisasi Anak
      </span>

      <div className='w-full min-h-0 flex flex-col space-y-2.5 pb-1 font-sans'>
        {CANONICAL_IMMUNIZATION_ROWS.map((milestone) => {
        const entry: ImmunizationClinicalEntry = entriesMap.get(milestone.rowIndex) || {
          rowIndex: milestone.rowIndex,
          vaccineName: milestone.vaccineName,
          vaccineCode: milestone.vaccineCode,
          status: 'NOT_GIVEN' as const
        };

        const isExpanded = activeEditingIndex === milestone.rowIndex;

        // Check if there are any Zod or date errors for this entry
        const entryErrorKeys = Object.keys(validationErrors).filter((k) =>
          k.startsWith(`entry_${milestone.rowIndex}_`)
        );
        const hasEntryError = entryErrorKeys.length > 0 || Boolean(dateErrors[milestone.rowIndex]);
        const entryDateError =
          dateErrors[milestone.rowIndex] ||
          validationErrors[`entry_${milestone.rowIndex}_injectionDate`];

        const rowErrors: Record<string, string> = {};
        if (dateErrors[milestone.rowIndex]) {
          rowErrors.injectionDate = dateErrors[milestone.rowIndex];
        }
        const prefix = `entry_${milestone.rowIndex}_`;
        for (const [k, v] of Object.entries(validationErrors)) {
          if (k.startsWith(prefix)) {
            rowErrors[k.slice(prefix.length)] = v;
          }
        }

        return (
          <div
            key={milestone.rowIndex}
            id={`trajectory-row-${milestone.rowIndex}`}
            className={cn(
              'w-full shrink-0 rounded-xl border bg-card overflow-hidden transition-all',
              isExpanded
                ? 'border-primary/50'
                : hasEntryError
                  ? 'border-destructive/60'
                  : 'border-border/60 hover:border-border'
            )}
          >
            {/* Accordion Row Header / Trigger */}
            <div
              role='button'
              tabIndex={0}
              onClick={() => setActiveEditingIndex(isExpanded ? null : milestone.rowIndex)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveEditingIndex(isExpanded ? null : milestone.rowIndex);
                }
              }}
              className={cn(
                'flex items-center justify-between gap-3 p-3 select-none transition-colors cursor-pointer',
                isExpanded ? 'bg-muted/30 border-b border-border/40' : 'hover:bg-muted/15'
              )}
            >
              {/* Left Section: Vaccine Name + Error Badge */}
              <div className='flex items-center min-w-0 flex-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='font-semibold text-xs text-foreground'>
                    {milestone.vaccineName}
                  </span>
                  {hasEntryError && (
                    <span className='text-[10px] font-semibold text-destructive px-1.5 py-0.5 rounded-sm bg-destructive/10'>
                      Perlu diperiksa
                    </span>
                  )}
                </div>
              </div>

              {/* Right Section: Status Badge + Chevron Icon */}
              <div className='flex items-center gap-2.5 shrink-0 ml-auto'>
                <MilestoneStatusBadge status={entry.status} variant='text' />
                <ChevronDown
                  className={cn(
                    'size-4 text-muted-foreground transition-transform duration-200',
                    isExpanded && 'rotate-180 text-foreground'
                  )}
                />
              </div>
            </div>

            {/* Accordion Expandable Editor Panel */}
            {isExpanded && (
              <div className='p-4 bg-muted/5 animate-in slide-in-from-top-1 duration-150'>
                <MilestoneRowEditor
                  entry={entry}
                  onChange={(updated) => handleUpdateEntry(updated)}
                  disabled={!isEditing}
                  dateError={entryDateError}
                  rowErrors={rowErrors}
                  onClearError={onClearError}
                />
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
