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
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineCreatableSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-creatable-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { GENDER_OPTIONS } from '@/constants/gender.constants';
import {
  BIRTH_ATTENDANT_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  DELIVERY_PLACE_OPTIONS
} from '../../constants/maternity.constants';
import { validatePregnancyHistoryEntry } from '@/features/klinik/schemas/medical-appointment-validation';
import type { MaternalPreviousPregnancy } from '../../types/maternity.types';

export interface PregnancyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MaternalPreviousPregnancy | null;
  onSave: (item: MaternalPreviousPregnancy) => void;
  isEditing?: boolean;
  motherBirthDate?: string | null;
}

export function PregnancyHistoryModal({
  isOpen,
  onClose,
  item,
  onSave,
  isEditing = false,
  motherBirthDate
}: PregnancyHistoryModalProps) {
  const [draft, setDraft] = React.useState<MaternalPreviousPregnancy>({
    orderNumber: 1,
    birthYear: '',
    birthWeightGrams: undefined,
    birthLengthCm: undefined,
    childSex: undefined,
    gestationalAgeAtBirth: '',
    birthAttendant: 'Bidan',
    deliveryMethod: 'Normal / Spontan',
    deliveryPlace: 'Puskesmas',
    complications: ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (item && isOpen) {
      setDraft({ ...item });
      setErrors({});
    }
  }, [item, isOpen]);

  const handleFieldChange = (field: keyof MaternalPreviousPregnancy, value: any) => {
    const nextDraft: MaternalPreviousPregnancy = { ...draft, [field]: value };
    setDraft(nextDraft);

    // Real-time on-the-fly validation (merah seketika jika input tidak valid)
    const validation = validatePregnancyHistoryEntry(nextDraft, motherBirthDate);
    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (validation.errors[field]) {
        nextErrors[field] = validation.errors[field];
      } else {
        delete nextErrors[field];
      }
      return nextErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePregnancyHistoryEntry(draft, motherBirthDate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onSave(draft);
  };

  const title = isEditing
    ? `Edit Riwayat Persalinan Ke-${draft.orderNumber || 1}`
    : 'Tambah Riwayat Persalinan Anak';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto font-sans'>
        <DialogHeader>
          <DialogTitle className='text-base font-semibold text-foreground'>
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Tahun Kelahiran */}
            <div>
              <PatientLineInput
                id='modal-preg-year'
                label='Tahun Lahir atau Berakhir'
                value={draft.birthYear || ''}
                onChange={(val) => handleFieldChange('birthYear', val.slice(0, 4))}
                placeholder='Contoh: 2022'
                maxLength={4}
                inputMode='numeric'
                error={errors.birthYear}
                invalid={Boolean(errors.birthYear)}
              />
            </div>

            {/* Usia Kehamilan Saat Lahir */}
            <div>
              <PatientLineInput
                id='modal-preg-gestational-age'
                label='Usia Kehamilan Saat Lahir'
                value={
                  draft.gestationalAgeAtBirth
                    ? draft.gestationalAgeAtBirth.replace(/\D/g, '')
                    : ''
                }
                onChange={(val) => {
                  const cleaned = val.replace(/\D/g, '');
                  handleFieldChange(
                    'gestationalAgeAtBirth',
                    cleaned ? `${cleaned} mgg` : ''
                  );
                }}
                placeholder='Contoh: 38'
                trailingIcon={
                  <span className='text-xs font-semibold text-muted-foreground select-none'>
                    mgg
                  </span>
                }
                inputMode='numeric'
              />
            </div>

            {/* Berat Lahir */}
            <div>
              <PatientLineInput
                id='modal-preg-weight'
                label='Berat Badan Lahir Bayi'
                value={draft.birthWeightGrams !== undefined ? String(draft.birthWeightGrams) : ''}
                onChange={(val) => {
                  const num = val === '' ? undefined : Number(val.replace(/\D/g, ''));
                  handleFieldChange('birthWeightGrams', num);
                }}
                placeholder='Contoh: 3200'
                trailingIcon={
                  <span className='text-xs font-semibold text-muted-foreground select-none'>
                    gr
                  </span>
                }
                inputMode='numeric'
                error={errors.birthWeightGrams}
                invalid={Boolean(errors.birthWeightGrams)}
              />
            </div>

            {/* Panjang Lahir */}
            <div>
              <PatientLineInput
                id='modal-preg-length'
                label='Panjang Badan Lahir Bayi'
                value={draft.birthLengthCm !== undefined ? String(draft.birthLengthCm) : ''}
                onChange={(val) => {
                  const num = val === '' ? undefined : Number(val.replace(/\D/g, ''));
                  handleFieldChange('birthLengthCm', num);
                }}
                placeholder='Contoh: 49'
                trailingIcon={
                  <span className='text-xs font-semibold text-muted-foreground select-none'>
                    cm
                  </span>
                }
                inputMode='numeric'
                error={errors.birthLengthCm}
                invalid={Boolean(errors.birthLengthCm)}
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <PatientLineSelect
                id='modal-preg-gender'
                label='Jenis Kelamin Bayi'
                value={draft.childSex || ''}
                onChange={(val) => handleFieldChange('childSex', val)}
                options={GENDER_OPTIONS as any}
                placeholder='Pilih jenis kelamin'
              />
            </div>

            {/* Penolong Persalinan */}
            <div>
              <PatientLineCreatableSelect
                id='modal-preg-attendant'
                label='Penolong Persalinan'
                value={draft.birthAttendant || ''}
                onChange={(val) => handleFieldChange('birthAttendant', val)}
                options={BIRTH_ATTENDANT_OPTIONS}
                placeholder='Pilih atau ketik sendiri...'
                customInputPlaceholder='Ketik penolong persalinan sendiri...'
              />
            </div>

            {/* Cara Persalinan */}
            <div>
              <PatientLineCreatableSelect
                id='modal-preg-delivery-method'
                label='Cara Persalinan'
                value={draft.deliveryMethod || ''}
                onChange={(val) => handleFieldChange('deliveryMethod', val)}
                options={DELIVERY_METHOD_OPTIONS}
                placeholder='Pilih atau ketik sendiri...'
                customInputPlaceholder='Ketik cara persalinan sendiri...'
              />
            </div>

            {/* Tempat Persalinan */}
            <div>
              <PatientLineCreatableSelect
                id='modal-preg-delivery-place'
                label='Tempat Persalinan'
                value={draft.deliveryPlace || ''}
                onChange={(val) => handleFieldChange('deliveryPlace', val)}
                options={DELIVERY_PLACE_OPTIONS}
                placeholder='Pilih atau ketik sendiri...'
                customInputPlaceholder='Ketik tempat persalinan sendiri...'
              />
            </div>

            {/* Komplikasi */}
            <div className='sm:col-span-2'>
              <PatientLineTextarea
                id='modal-preg-complications'
                label='Komplikasi atau Masalah Persalinan'
                value={draft.complications || ''}
                onChange={(val) => handleFieldChange('complications', val)}
                placeholder='Contoh: Tidak ada / Preeklamsia / Perdarahan pascapersalinan'
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
            <Button
              type='submit'
              size='sm'
              className='font-semibold cursor-pointer'
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambahkan Riwayat Persalinan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
