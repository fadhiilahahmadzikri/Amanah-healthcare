'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineCreatableSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-creatable-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { CONTRACEPTIVE_TYPE_OPTIONS } from '../../constants/maternity.constants';
import { calculateContraceptiveDuration } from '@/features/klinik/utils/medical-appointment';
import { validateContraceptiveEntry } from '@/features/klinik/schemas/medical-appointment-validation';
import type { MaternalContraceptiveHistory } from '../../types/maternity.types';

export interface ContraceptiveHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MaternalContraceptiveHistory | null;
  onSave: (item: MaternalContraceptiveHistory) => void;
  isEditing?: boolean;
  motherBirthDate?: string | null;
}

export function ContraceptiveHistoryModal({
  isOpen,
  onClose,
  item,
  onSave,
  isEditing = false,
  motherBirthDate
}: ContraceptiveHistoryModalProps) {
  const [draft, setDraft] = React.useState<MaternalContraceptiveHistory>({
    orderNumber: 1,
    startDate: '',
    contraceptiveType: 'Suntik 3 Bulan',
    durationText: '',
    stopDate: '',
    problems: '',
    sideEffects: ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (item && isOpen) {
      setDraft({ ...item });
      setErrors({});
    }
  }, [item, isOpen]);

  const handleFieldChange = (field: keyof MaternalContraceptiveHistory, value: any) => {
    const nextDraft: MaternalContraceptiveHistory = { ...draft, [field]: value };
    if (
      (field === 'startDate' || field === 'stopDate') &&
      nextDraft.startDate &&
      nextDraft.stopDate
    ) {
      const autoDuration = calculateContraceptiveDuration(nextDraft.startDate, nextDraft.stopDate);
      if (autoDuration) {
        nextDraft.durationText = autoDuration;
      }
    }
    setDraft(nextDraft);

    // Real-time on-the-fly validation (merah seketika jika input tidak valid)
    const validation = validateContraceptiveEntry(nextDraft, motherBirthDate);
    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (validation.errors[field]) {
        nextErrors[field] = validation.errors[field];
      } else {
        delete nextErrors[field];
      }

      // Validasi relasi rentang tanggal antara tanggal mulai dan tanggal lepas
      if (field === 'startDate' || field === 'stopDate') {
        if (validation.errors.startDate) {
          nextErrors.startDate = validation.errors.startDate;
        } else {
          delete nextErrors.startDate;
        }
        if (validation.errors.stopDate) {
          nextErrors.stopDate = validation.errors.stopDate;
        } else {
          delete nextErrors.stopDate;
        }
      }

      return nextErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContraceptiveEntry(draft, motherBirthDate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onSave(draft);
  };

  const title = isEditing
    ? `Edit Riwayat KB Ke-${draft.orderNumber || 1}`
    : 'Tambah Riwayat KB Baru';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto font-sans'>
        <DialogHeader>
          <DialogTitle className='text-base font-semibold text-foreground'>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Tgl Mulai */}
            <div className='space-y-1.5'>
              <label
                htmlFor='contra-start-date'
                className='text-xs font-semibold text-muted-foreground'
              >
                Kapan Mulai Dipakai?
              </label>
              <CustomDatePicker
                id='contra-start-date'
                value={draft.startDate || ''}
                onChange={(val) => handleFieldChange('startDate', val)}
                placeholder='Pilih tanggal mulai'
                variant='underline'
                error={errors.startDate}
                invalid={Boolean(errors.startDate)}
              />
            </div>

            {/* Tgl Lepas */}
            <div className='space-y-1.5'>
              <label
                htmlFor='contra-stop-date'
                className='text-xs font-semibold text-muted-foreground'
              >
                Kapan Berhenti atau Dilepas?
              </label>
              <CustomDatePicker
                id='contra-stop-date'
                value={draft.stopDate || ''}
                onChange={(val) => handleFieldChange('stopDate', val)}
                placeholder='Pilih tanggal lepas'
                variant='underline'
                error={errors.stopDate}
                invalid={Boolean(errors.stopDate)}
              />
            </div>

            {/* Jenis Kontrasepsi */}
            <div>
              <PatientLineCreatableSelect
                id='modal-contra-type'
                label='Jenis KB / Kontrasepsi'
                value={draft.contraceptiveType || ''}
                onChange={(val) => handleFieldChange('contraceptiveType', val)}
                options={CONTRACEPTIVE_TYPE_OPTIONS}
                placeholder='Pilih atau ketik sendiri...'
                customInputPlaceholder='Ketik jenis KB sendiri...'
                error={errors.contraceptiveType}
                invalid={Boolean(errors.contraceptiveType)}
              />
            </div>

            {/* Masa Pakai (Otomatis) */}
            <div>
              <PatientLineInput
                id='modal-contra-duration'
                label='Masa Pakai (Berapa lama)'
                value={draft.durationText || ''}
                onChange={(val) => handleFieldChange('durationText', val)}
                placeholder='Otomatis dari rentang tanggal'
                trailingIcon={
                  draft.durationText ? (
                    <span className='rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary select-none'>
                      Otomatis
                    </span>
                  ) : null
                }
              />
            </div>

            {/* Masalah */}
            <div className='sm:col-span-2'>
              <PatientLineTextarea
                id='modal-contra-problems'
                label='Masalah saat memakai KB'
                value={draft.problems || ''}
                onChange={(val) => handleFieldChange('problems', val)}
                placeholder='Tuliskan keluhan atau masalah jika ada'
              />
            </div>

            {/* Efek Samping */}
            <div className='sm:col-span-2'>
              <PatientLineTextarea
                id='modal-contra-side-effects'
                label='Efek Samping'
                value={draft.sideEffects || ''}
                onChange={(val) => handleFieldChange('sideEffects', val)}
                placeholder='Tuliskan efek samping jika ada'
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0 pt-3 border-t border-border/40'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='cursor-pointer'
            >
              Batal
            </Button>
            <Button type='submit' size='sm' className='font-semibold cursor-pointer'>
              {isEditing ? 'Simpan Perubahan' : 'Tambahkan Riwayat KB'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
