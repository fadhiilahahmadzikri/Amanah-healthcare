'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MilestoneStatusBadge } from '../atoms/milestone-status-badge';
import { MilestoneRowEditor } from '../molecules/milestone-row-editor';
import { CANONICAL_IMMUNIZATION_ROWS } from '../../constants/immunization.constants';
import type {
  ImmunizationClinicalEntry,
  ImmunizationIntakeRecord
} from '../../types/immunization.types';

export interface ImmunizationInspectorTabProps {
  intake?: ImmunizationIntakeRecord | null;
  entries: ImmunizationClinicalEntry[];
  onEntriesChange: (updated: ImmunizationClinicalEntry[]) => void;
  isEditing?: boolean;
  onOpenDocumentPreview?: () => void;
}

export function ImmunizationInspectorTab({
  intake,
  entries,
  onEntriesChange,
  isEditing = false,
  onOpenDocumentPreview
}: ImmunizationInspectorTabProps) {
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
    <div className='flex flex-col h-full space-y-4'>
      {/* Top Banner & Quick Document Actions */}
      <div className='flex items-center justify-between rounded-xl bg-muted/40 p-3.5 border border-border/60'>
        <div className='space-y-0.5'>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-semibold text-foreground'>
              Trajektori Imunisasi Anak (15 Milestone Kanonikal)
            </h3>
            <Badge variant='outline' className='text-[10px] bg-background'>
              Standar 1:1 Klinik
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground'>
            Isi atau perbarui catatan klinis (BB, PB, LK, suhu, anamnesis, dan planning) untuk setiap vaksin.
          </p>
        </div>

        {onOpenDocumentPreview && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onOpenDocumentPreview}
            className='h-8 text-xs font-semibold gap-1.5 shrink-0 bg-background'
          >
            <Icons.view className='size-3.5 text-primary' />
            <span>Lihat Dokumen 1:1</span>
          </Button>
        )}
      </div>

      {/* Main 15 Milestone List */}
      <div className='flex-1 overflow-y-auto pr-1 space-y-3 min-h-[350px]'>
        {CANONICAL_IMMUNIZATION_ROWS.map((milestone) => {
          const entry =
            entriesMap.get(milestone.rowIndex) || {
              rowIndex: milestone.rowIndex,
              vaccineName: milestone.vaccineName,
              vaccineCode: milestone.vaccineCode,
              status: 'NOT_GIVEN' as const
            };

          const isExpanded = activeEditingIndex === milestone.rowIndex;
          const isGiven = entry.status === 'GIVEN';

          return (
            <div
              key={milestone.rowIndex}
              className='rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs transition-all'
            >
              {/* Milestone Summary Header Row */}
              <div
                onClick={() => {
                  if (isEditing) {
                    setActiveEditingIndex(isExpanded ? null : milestone.rowIndex);
                  }
                }}
                className={`flex items-center justify-between p-3.5 select-none ${
                  isEditing ? 'cursor-pointer hover:bg-muted/30' : ''
                }`}
              >
                <div className='flex items-center gap-3'>
                  <span className='flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                    {milestone.rowIndex + 1}
                  </span>

                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-xs text-foreground'>
                        {milestone.vaccineName}
                      </span>
                      {entry.injectionDate && (
                        <span className='text-[11px] text-muted-foreground'>
                          • {entry.injectionDate} ({entry.ageDisplay || '-'})
                        </span>
                      )}
                    </div>

                    {isGiven ? (
                      <div className='flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground'>
                        <span>BB: {entry.weightKg ? `${entry.weightKg} kg` : '-'}</span>
                        <span>PB: {entry.heightCm ? `${entry.heightCm} cm` : '-'}</span>
                        <span>Suhu: {entry.temperatureCelsius ? `${entry.temperatureCelsius}°C` : '-'}</span>
                        {entry.planning && (
                          <span className='truncate max-w-[200px]'>• {entry.planning}</span>
                        )}
                      </div>
                    ) : (
                      <span className='text-[11px] text-neutral-400 italic block mt-0.5'>
                        Belum dicatat pada kunjungan ini
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <MilestoneStatusBadge status={entry.status} />
                  {isEditing && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-7 w-7 p-0'
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEditingIndex(isExpanded ? null : milestone.rowIndex);
                      }}
                    >
                      <Icons.chevronDown
                        className={`size-4 text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  )}
                </div>
              </div>

              {/* Inline Editor Drawer when Expanded */}
              {isExpanded && isEditing && (
                <div className='border-t border-border/50 p-3.5 bg-muted/20 animate-in slide-in-from-top-2 duration-150'>
                  <MilestoneRowEditor
                    entry={entry}
                    onChange={(updated) => handleUpdateEntry(updated)}
                  />
                  <div className='flex justify-end mt-3'>
                    <Button
                      type='button'
                      size='sm'
                      onClick={() => setActiveEditingIndex(null)}
                      className='h-7 text-xs font-semibold'
                    >
                      Tutup Editor
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
