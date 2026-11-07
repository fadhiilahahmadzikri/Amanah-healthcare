'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { MaskedNik } from '@/components/ui/masked-nik';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { formatClinicDate } from '@/lib/date-format';
import type { MaternityIntake, MaternalHusbandProfile } from '../../../types/maternity.types';

export interface MaternityPartnerIdentityFieldsProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onHusbandFieldChange?: (field: keyof MaternalHusbandProfile, value: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
  educationOptions: string[];
  occupationOptions: string[];
  bloodTypeOptions: string[];
}

export function MaternityPartnerIdentityFields({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  onHusbandFieldChange,
  validationErrors,
  onClearError,
  educationOptions,
  occupationOptions,
  bloodTypeOptions
}: MaternityPartnerIdentityFieldsProps) {
  const [showNik, setShowNik] = React.useState(false);
  if (isEditing && onIntakeFieldChange) {
    return (
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Identitas Suami / Pasangan
        </span>

        <PatientLineInput
          id='maternity-husband-name'
          label='Nama Suami'
          value={intake?.partnerName}
          onChange={(val) => {
            onIntakeFieldChange('partnerName', val);
            if (validationErrors?.partnerName) {
              onClearError?.('partnerName');
            }
          }}
          error={validationErrors?.partnerName}
          invalid={Boolean(validationErrors?.partnerName)}
          placeholder='Nama lengkap suami...'
        />

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='maternity-husband-nik'
            label='NIK Suami (16 Digit)'
            value={intake?.partnerNik}
            onChange={(val) => {
              const numeric = val.replace(/\D/g, '').slice(0, 16);
              onIntakeFieldChange('partnerNik', numeric);
              if (validationErrors?.partnerNik && numeric.length === 16) {
                onClearError?.('partnerNik');
              }
            }}
            error={validationErrors?.partnerNik}
            invalid={Boolean(validationErrors?.partnerNik)}
            placeholder='16 digit NIK...'
            maxLength={16}
            isMonospace
            isMasked={!showNik}
            trailingIcon={
              <button
                type='button'
                onClick={() => setShowNik((prev) => !prev)}
                className='text-muted-foreground hover:text-foreground transition-colors p-1'
                title={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
                tabIndex={-1}
              >
                {showNik ? (
                  <Icons.eyeOff className='size-4 text-primary' />
                ) : (
                  <Icons.eye className='size-4 text-muted-foreground' />
                )}
              </button>
            }
          />

          <CustomDatePicker
            id='maternity-husband-birthdate'
            label='Tanggal Lahir Suami'
            value={intake?.partnerBirthDate || ''}
            onChange={(val) => {
              onIntakeFieldChange('partnerBirthDate', val);
              if (validationErrors?.partnerBirthDate && val) {
                onClearError?.('partnerBirthDate');
              }
            }}
            placeholder='Pilih tgl lahir'
            disableFutureDates
            variant='underline'
            error={validationErrors?.partnerBirthDate}
            invalid={Boolean(validationErrors?.partnerBirthDate)}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='maternity-husband-phone'
            label='Nomor HP Suami'
            type='tel'
            value={intake?.husbandProfile?.phoneNumber || ''}
            onChange={(val) => {
              onHusbandFieldChange?.('phoneNumber', val);
              if (validationErrors?.partnerPhone) {
                onClearError?.('partnerPhone');
              }
            }}
            error={validationErrors?.partnerPhone}
            invalid={Boolean(validationErrors?.partnerPhone)}
            placeholder='08xxxxxxxxxx'
            isMonospace
          />

          <PatientLineSelect
            id='maternity-husband-bloodtype'
            label='Golongan Darah Suami'
            value={intake?.partnerBloodType}
            onChange={(val) => onIntakeFieldChange('partnerBloodType', val)}
            options={['Tidak Tahu', ...bloodTypeOptions]}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineSelect
            id='maternity-husband-education'
            label='Pendidikan Terakhir Suami'
            value={intake?.partnerEducation}
            onChange={(val) => onIntakeFieldChange('partnerEducation', val)}
            options={educationOptions}
          />

          <PatientLineSelect
            id='maternity-husband-job'
            label='Pekerjaan Suami'
            value={intake?.partnerJob}
            onChange={(val) => onIntakeFieldChange('partnerJob', val)}
            options={occupationOptions}
          />
        </div>

        <div className='pt-2 space-y-3'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Wilayah & Fasilitas Kesehatan
          </span>

          <div className='grid grid-cols-3 gap-3'>
            <PatientLineInput
              id='maternity-dasawisma'
              label='Dasawisma'
              value={intake?.dasawisma}
              onChange={(val) => {
                onIntakeFieldChange('dasawisma', val);
                if (validationErrors?.dasawisma) {
                  onClearError?.('dasawisma');
                }
              }}
              error={validationErrors?.dasawisma}
              invalid={Boolean(validationErrors?.dasawisma)}
              placeholder='cth: Mawar 1'
            />
            <PatientLineInput
              id='maternity-posyandu'
              label='Posyandu'
              value={intake?.posyandu}
              onChange={(val) => {
                onIntakeFieldChange('posyandu', val);
                if (validationErrors?.posyandu) {
                  onClearError?.('posyandu');
                }
              }}
              error={validationErrors?.posyandu}
              invalid={Boolean(validationErrors?.posyandu)}
              placeholder='cth: Melati'
            />
            <PatientLineInput
              id='maternity-puskesmas'
              label='Puskesmas'
              value={intake?.puskesmas}
              onChange={(val) => {
                onIntakeFieldChange('puskesmas', val);
                if (validationErrors?.puskesmas) {
                  onClearError?.('puskesmas');
                }
              }}
              error={validationErrors?.puskesmas}
              invalid={Boolean(validationErrors?.puskesmas)}
              placeholder='cth: Depok III'
            />
          </div>
        </div>
      </div>
    );
  }

  // Read mode
  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
        Identitas Suami / Pasangan
      </span>

      <PatientLineInput
        id='view-husband-name'
        label='Nama Suami'
        value={intake?.partnerName || ''}
        readOnly
      />

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-1'>
          <span className='text-[11px] font-medium text-muted-foreground block'>
            NIK Suami (16 Digit)
          </span>
          <MaskedNik
            nik={intake?.partnerNik}
            allowUnmask={true}
          />
        </div>
        <PatientLineInput
          id='view-husband-birthdate'
          label='Tanggal Lahir Suami'
          value={intake?.partnerBirthDate ? formatClinicDate(intake.partnerBirthDate, { style: 'human_medium' }) : ''}
          readOnly
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <PatientLineInput
          id='view-husband-phone'
          label='Nomor HP Suami'
          value={intake?.husbandProfile?.phoneNumber || ''}
          isMonospace
          readOnly
        />
        <PatientLineInput
          id='view-husband-bloodtype'
          label='Golongan Darah Suami'
          value={intake?.partnerBloodType || ''}
          readOnly
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <PatientLineInput
          id='view-husband-education'
          label='Pendidikan Terakhir Suami'
          value={intake?.partnerEducation || ''}
          readOnly
        />
        <PatientLineInput
          id='view-husband-job'
          label='Pekerjaan Suami'
          value={intake?.partnerJob || ''}
          readOnly
        />
      </div>

      <div className='pt-2 space-y-3'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Wilayah & Fasilitas Kesehatan
        </span>

        <div className='grid grid-cols-3 gap-3'>
          <PatientLineInput
            id='view-dasawisma'
            label='Dasawisma'
            value={intake?.dasawisma || ''}
            readOnly
          />
          <PatientLineInput
            id='view-posyandu'
            label='Posyandu'
            value={intake?.posyandu || ''}
            readOnly
          />
          <PatientLineInput
            id='view-puskesmas'
            label='Puskesmas'
            value={intake?.puskesmas || ''}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
