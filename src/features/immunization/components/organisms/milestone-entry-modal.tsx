'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MilestoneRowEditor } from '../molecules/milestone-row-editor';
import { validateImmunizationDateEntry } from '@/features/klinik/schemas/medical-appointment-validation';
import type { ImmunizationClinicalEntry } from '../../types/immunization.types';

export interface MilestoneEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ImmunizationClinicalEntry | null;
  onSave: (entry: ImmunizationClinicalEntry) => void;
  isSaving?: boolean;
  childBirthDate?: string | null;
}

export function MilestoneEntryModal({
  isOpen,
  onClose,
  entry,
  onSave,
  isSaving = false,
  childBirthDate
}: MilestoneEntryModalProps) {
  const [draft, setDraft] = React.useState<ImmunizationClinicalEntry | null>(entry);
  const [dateError, setDateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(entry);
    setDateError(null);
  }, [entry]);

  if (!draft) return null;

  const handleEntryChange = (updated: ImmunizationClinicalEntry) => {
    setDraft(updated);
    if (updated.injectionDate) {
      const res = validateImmunizationDateEntry(updated.injectionDate, childBirthDate);
      if (!res.isValid && res.errors.injectionDate) {
        setDateError(res.errors.injectionDate);
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
  };

  const handleSave = () => {
    if (!draft) return;
    if (draft.injectionDate) {
      const res = validateImmunizationDateEntry(draft.injectionDate, childBirthDate);
      if (!res.isValid && res.errors.injectionDate) {
        setDateError(res.errors.injectionDate);
        return;
      }
    }
    setDateError(null);
    onSave(draft);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-base font-semibold'>
            Isi Rekam Medis Imunisasi — {draft.vaccineName}
          </DialogTitle>
        </DialogHeader>

        <div className='py-2'>
          <MilestoneRowEditor
            entry={draft}
            onChange={handleEntryChange}
            disabled={isSaving}
            dateError={dateError}
          />
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClose}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={handleSave}
            disabled={isSaving}
            className='font-semibold'
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Rekam Medis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
