'use client';

import * as React from 'react';
import { MilestoneStatusBadge } from '../../atoms/milestone-status-badge';
import { MilestoneRowEditor } from '../../molecules/milestone-row-editor';
import { CANONICAL_IMMUNIZATION_ROWS } from '../../../constants/immunization.constants';
import { formatClinicDate } from '@/lib/date-format';
import type { ImmunizationClinicalEntry } from '../../../types/immunization.types';

export interface ImmunizationMilestoneTrajectorySectionProps {
  entries: ImmunizationClinicalEntry[];
  isEditing?: boolean;
  onEntriesChange?: (updated: ImmunizationClinicalEntry[]) => void;
}

export function ImmunizationMilestoneTrajectorySection({
  entries,
  isEditing = false,
  onEntriesChange
}: ImmunizationMilestoneTrajectorySectionProps) {
  const [activeEditingIndex, setActiveEditingIndex] = React.useState<number | null>(null);

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
    <div className='flex-1 min-h-0 flex flex-col space-y-2 pt-1 font-sans h-full'>
      {/* Header Kolom Trajektori */}
      <div className='hidden sm:flex items-center gap-3 px-3.5 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40'>
        <span className='w-6 text-center shrink-0'>No</span>
        <span className='min-w-[150px] max-w-[200px] shrink-0'>Vaksin</span>
        <span className='min-w-[150px] shrink-0'>Tanggal & Usia</span>
        <span className='min-w-[180px] shrink-0'>Pemeriksaan Fisik</span>
        <span className='flex-1 min-w-0'>Planning / Catatan</span>
        <span className='shrink-0 ml-auto text-right w-28'>Status</span>
      </div>

      {CANONICAL_IMMUNIZATION_ROWS.map((milestone) => {
        const entry: ImmunizationClinicalEntry =
          entriesMap.get(milestone.rowIndex) || {
            rowIndex: milestone.rowIndex,
            vaccineName: milestone.vaccineName,
            vaccineCode: milestone.vaccineCode,
            status: 'NOT_GIVEN' as const
          };

        const isExpanded = activeEditingIndex === milestone.rowIndex;
        const hasPhysical = Boolean(entry.weightKg || entry.heightCm || entry.temperatureCelsius);

        return (
          <div
            key={milestone.rowIndex}
            className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-2xs transition-all'
          >
            <div
              onClick={() => {
                if (isEditing) {
                  setActiveEditingIndex(isExpanded ? null : milestone.rowIndex);
                }
              }}
              className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-3.5 select-none ${
                isEditing ? 'cursor-pointer hover:bg-muted/30' : ''
              }`}
            >
              {/* Col 1: Nomor */}
              <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                {milestone.rowIndex + 1}
              </span>

              {/* Col 2: Vaksin */}
              <div className='min-w-[150px] max-w-[200px] shrink-0'>
                <span className='font-semibold text-xs text-foreground'>
                  {milestone.vaccineName}
                </span>
              </div>

              {/* Col 3: Tanggal & Usia */}
              <div className='min-w-[150px] shrink-0 text-xs'>
                {entry.injectionDate ? (
                  <span className='text-foreground font-medium'>
                    {formatClinicDate(entry.injectionDate, { style: 'human_medium' })}{' '}
                    <span className='text-muted-foreground font-normal'>
                      ({entry.ageDisplay || '-'})
                    </span>
                  </span>
                ) : (
                  <span className='text-muted-foreground/60 italic'>-</span>
                )}
              </div>

              {/* Col 4: Pengukuran Fisik */}
              <div className='min-w-[180px] shrink-0 text-xs text-muted-foreground'>
                {hasPhysical ? (
                  <span>
                    {entry.weightKg ? `${entry.weightKg} kg` : '-'} / {entry.heightCm ? `${entry.heightCm} cm` : '-'} / {entry.temperatureCelsius ? `${entry.temperatureCelsius}°C` : '-'}
                  </span>
                ) : (
                  <span className='text-muted-foreground/60 italic'>-</span>
                )}
              </div>

              {/* Col 5: Planning / Catatan */}
              <div
                className='flex-1 min-w-0 text-xs text-muted-foreground truncate'
                title={entry.planning || undefined}
              >
                {entry.planning ? (
                  <span>{entry.planning}</span>
                ) : (
                  <span className='text-muted-foreground/60 italic'>-</span>
                )}
              </div>

              {/* Col 6: Status Badge */}
              <div className='shrink-0 ml-auto'>
                <MilestoneStatusBadge status={entry.status} />
              </div>
            </div>

            {isExpanded && isEditing && (
              <div className='border-t border-border/50 p-3.5 bg-muted/20 animate-in slide-in-from-top-2 duration-150'>
                <MilestoneRowEditor
                  entry={entry}
                  onChange={(updated) => handleUpdateEntry(updated)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
