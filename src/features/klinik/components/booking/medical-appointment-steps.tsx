import gsap from 'gsap';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { cn } from '@/lib/utils';

import type {
  MedicalFormField,
  MedicalFormSection
} from '../../constants/medical-appointment-schemas';
import type { MedicalAppointmentValues } from '../../utils/medical-appointment';
import { MedicalQuestionnaire } from '../questionnaire';

export function StepTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className='text-base font-semibold tracking-tight text-foreground'>{title}</h3>
      <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>{description}</p>
    </div>
  );
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 pb-2 last:border-b-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium text-foreground'>{value || '-'}</span>
    </div>
  );
}

export function MedicalSectionStep({
  section,
  catalogActionType,
  onReturnToCatalog,
  renderField,
  values,
  onFieldChange,
  selfProfile
}: {
  section: MedicalFormSection;
  catalogActionType?: 'add' | 'edit' | null;
  onReturnToCatalog?: () => void;
  renderField: (field: MedicalFormField) => React.ReactNode;
  values?: MedicalAppointmentValues;
  onFieldChange?: (fieldId: string, value: string) => void;
  selfProfile?: {
    fullName: string;
    nik?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    bloodType?: string | null;
    occupationName?: string | null;
  } | null;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isGrid = section?.layout === 'grid';
  const isQuestionnaire = section?.layout === 'questionnaire';

  React.useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current,
      { y: 8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: 'power3.out'
      }
    );
  }, [section?.id]);

  return (
    <div ref={containerRef} className='flex min-h-0 flex-1 flex-col gap-3'>
      {catalogActionType && onReturnToCatalog ? (
        <div className='flex items-center justify-between rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary'>
          <div className='flex items-center gap-2'>
            {catalogActionType === 'add' ? (
              <Icons.add className='size-3.5' />
            ) : (
              <Icons.edit className='size-3.5' />
            )}
            <span>
              {catalogActionType === 'add'
                ? 'Sedang menambah data riwayat'
                : 'Sedang mengubah data riwayat'}
            </span>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            shape='pill'
            onClick={onReturnToCatalog}
            className='h-6 text-xs text-primary hover:bg-primary/20'
          >
            Kembali ke Katalog
          </Button>
        </div>
      ) : null}
      {(section?.id === 'partnerIdentity' ||
        section?.id === 'pregnancy-husband-identity') &&
      selfProfile &&
      selfProfile.gender !== 'female' ? (
        values?.partnerName === selfProfile.fullName ? (
          <div className='flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs mb-1'>
            <div className='space-y-0.5 min-w-0'>
              <p className='font-semibold text-foreground flex items-center gap-1.5 truncate'>
                <Icons.user className='size-3.5 text-primary shrink-0' />
                <span className='truncate'>Menggunakan data akun Anda ({selfProfile.fullName})</span>
              </p>
              <p className='text-[11px] text-muted-foreground'>
                Data suami terisi otomatis dari profil akun Anda.
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={() => {
                onFieldChange?.('partnerName', '');
                onFieldChange?.('partnerNik', '');
                onFieldChange?.('partnerBirthDate', '');
                onFieldChange?.('partnerAge', '');
                onFieldChange?.('partnerJob', '');
                onFieldChange?.('partnerEducation', '');
                onFieldChange?.('partnerBloodType', '');
              }}
              className='h-7 shrink-0 text-xs border-border/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
            >
              Ganti / Kosongkan
            </Button>
          </div>
        ) : (
          <div className='flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs mb-1'>
            <div className='space-y-0.5 min-w-0'>
              <p className='font-semibold text-foreground truncate'>
                Gunakan data akun Anda ({selfProfile.fullName}) sebagai suami?
              </p>
              <p className='text-[11px] text-muted-foreground'>
                Klik untuk mengisi otomatis nama dan profil pendukung dari akun Anda.
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={() => {
                onFieldChange?.('partnerName', selfProfile.fullName);
                if (selfProfile.birthDate) onFieldChange?.('partnerBirthDate', selfProfile.birthDate);
                if (selfProfile.bloodType) onFieldChange?.('partnerBloodType', selfProfile.bloodType);
                if (selfProfile.occupationName) onFieldChange?.('partnerJob', selfProfile.occupationName);
              }}
              className='h-7 shrink-0 text-xs text-primary border-primary/30 hover:bg-primary/10'
            >
              Gunakan Akun Saya
            </Button>
          </div>
        )
      ) : null}

      {isQuestionnaire && values && onFieldChange ? (
        <div className='px-0.5 pt-1.5 pb-2'>
          <MedicalQuestionnaire
            section={section}
            values={values}
            onFieldChange={onFieldChange}
            birthYear={
              values['motherBirthDate'] || values['birthDate']
                ? new Date(values['motherBirthDate'] || values['birthDate']).getFullYear()
                : null
            }
          />
        </div>
      ) : (
        <FieldGroup
          className={cn(
            isGrid ? 'grid grid-cols-1 items-start gap-x-5 gap-y-3.5 sm:grid-cols-2' : 'space-y-4',
            'px-0.5 pt-1.5 pb-2'
          )}
        >
          {section.fields
            .filter((field) => !field.visibleIf || (values && field.visibleIf(values)))
            .map(renderField)}
        </FieldGroup>
      )}
    </div>
  );
}
