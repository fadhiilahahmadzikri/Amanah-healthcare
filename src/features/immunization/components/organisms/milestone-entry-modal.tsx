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
import type { ImmunizationClinicalEntry } from '../../types/immunization.types';

export interface MilestoneEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ImmunizationClinicalEntry | null;
  onSave: (entry: ImmunizationClinicalEntry) => void;
  isSaving?: boolean;
}

export function MilestoneEntryModal({
  isOpen,
  onClose,
  entry,
  onSave,
  isSaving = false
}: MilestoneEntryModalProps) {
  const [draft, setDraft] = React.useState<ImmunizationClinicalEntry | null>(entry);

  React.useEffect(() => {
    setDraft(entry);
  }, [entry]);

  if (!draft) return null;

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
            onChange={(updated) => setDraft(updated)}
            disabled={isSaving}
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
            onClick={() => draft && onSave(draft)}
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
