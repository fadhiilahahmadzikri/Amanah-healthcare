import gsap from 'gsap';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { cn } from '@/lib/utils';

import type { MedicalAppointmentFlow } from '../../api/types';
import type {
  MedicalFormField,
  MedicalFormSection
} from '../../constants/medical-appointment-schemas';
import type { ScheduleValues } from '../../model/useMedicalAppointmentForm';
import {
  buildAutomaticRecord,
  type MedicalAppointmentValues
} from '../../utils/medical-appointment';
import { AppointmentCalendarDayPicker } from '../appointment-calendar-day-picker';
import { AppointmentTimeSlotPicker } from '../appointment-time-slot-picker';
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
  onFieldChange
}: {
  section: MedicalFormSection;
  catalogActionType?: 'add' | 'edit' | null;
  onReturnToCatalog?: () => void;
  renderField: (field: MedicalFormField) => React.ReactNode;
  values?: MedicalAppointmentValues;
  onFieldChange?: (fieldId: string, value: string) => void;
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
      {isQuestionnaire && values && onFieldChange ? (
        <div className='px-0.5 pt-0 pb-2'>
          <MedicalQuestionnaire section={section} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : (
        <FieldGroup
          className={cn(
            isGrid ? 'grid grid-cols-1 items-start gap-x-5 gap-y-3.5 sm:grid-cols-2' : 'space-y-4',
            'px-0.5 pt-0 pb-2'
          )}
        >
          {section.fields.map(renderField)}
        </FieldGroup>
      )}
    </div>
  );
}

export function DateStep({
  selectedDateStr,
  onSelectDate
}: {
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}) {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3 py-1'>
      <AppointmentCalendarDayPicker selectedDateStr={selectedDateStr} onSelectDate={onSelectDate} />
    </div>
  );
}

export function TimeStep({
  selectedDateStr,
  selectedTimeSlot,
  onSelectTimeSlot
}: {
  selectedDateStr: string;
  selectedTimeSlot: string;
  onSelectTimeSlot: (timeSlot: string) => void;
}) {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3 py-1'>
      <AppointmentTimeSlotPicker
        selectedDateStr={selectedDateStr}
        selectedTimeSlot={selectedTimeSlot}
        onSelectTimeSlot={onSelectTimeSlot}
      />
    </div>
  );
}

export function ReviewStep({
  definitionTitle,
  flow,
  answeredFields,
  schedule,
  serviceName,
  values
}: {
  definitionTitle: string;
  flow: MedicalAppointmentFlow;
  answeredFields: { id: string; label: string; value: string }[];
  schedule: ScheduleValues;
  serviceName: string;
  values: MedicalAppointmentValues;
}) {
  const automatic = buildAutomaticRecord(flow, values);

  const automaticLabels: Record<string, string> = {
    imtAtSubmit: 'IMT (Indeks Massa Tubuh)',
    estimatedDueDate: 'Taksiran Persalinan (HPL)',
    gestationalAgeAtSubmit: 'Usia Kehamilan Saat Submit',
    childAgeAtSubmit: 'Usia Anak Saat Submit'
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3 py-1'>
      <div className='grid shrink-0 gap-2 text-xs'>
        <SummaryRow label='Form' value={definitionTitle} />
        <SummaryRow label='Layanan' value={serviceName} />
        <SummaryRow label='Tenaga medis' value={schedule.doctor || 'Dokter / Bidan Jaga'} />
        <SummaryRow label='Tanggal' value={schedule.dateStr} />
        <SummaryRow label='Jam' value={schedule.timeSlot} />
        {Object.entries(automatic)
          .filter(([, value]) => value)
          .map(([key, value]) => (
            <SummaryRow key={key} label={automaticLabels[key] || key} value={value} />
          ))}
      </div>

      <div className='max-h-56 min-h-0 flex-1 overflow-y-auto rounded-lg border border-border p-3'>
        <div className='grid gap-2 pr-2 text-xs'>
          {answeredFields.map((answer) => (
            <SummaryRow key={answer.id} label={answer.label} value={answer.value} />
          ))}
        </div>
      </div>
    </div>
  );
}
