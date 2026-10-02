import gsap from 'gsap';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isGrid = section?.layout === 'grid';
  const isQuestionnaire = section?.layout === 'questionnaire';

  React.useLayoutEffect(() => {
    const scrollToTop = () => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector(
          '[data-radix-scroll-area-viewport]'
        ) as HTMLElement | null;
        if (viewport) {
          viewport.scrollTop = 0;
        }
        scrollRef.current.scrollTop = 0;
      }
    };

    scrollToTop();
    const rafId = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(rafId);
  }, [section?.id]);

  React.useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current,
      { y: 12, opacity: 0, scale: 0.99 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.24,
        ease: 'power3.out'
      }
    );
  }, [section?.id]);

  return (
    <div ref={containerRef} className='flex min-h-0 flex-1 flex-col gap-4'>
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
      <StepTitle title={section.title} description={section.description} />
      <ScrollArea
        ref={scrollRef}
        key={section.id}
        className='min-h-0 flex-1 [&_[data-slot=scroll-area-scrollbar]]:hidden'
      >
        {isQuestionnaire && values && onFieldChange ? (
          <div className='px-1 pt-0 pb-8'>
            <MedicalQuestionnaire section={section} values={values} onFieldChange={onFieldChange} />
          </div>
        ) : (
          <FieldGroup
            className={cn(
              isGrid
                ? 'grid grid-cols-1 items-start gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-4.5'
                : 'gap-5',
              'px-1 pt-1 pb-8'
            )}
          >
            {section.fields.map(renderField)}
          </FieldGroup>
        )}
      </ScrollArea>
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
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <StepTitle
        title='Tanggal kunjungan'
        description='Pilih tanggal praktik kunjungan yang tersedia.'
      />
      <div className='min-h-0 flex-1 overflow-y-auto pr-1 pb-2'>
        <AppointmentCalendarDayPicker
          selectedDateStr={selectedDateStr}
          onSelectDate={onSelectDate}
        />
      </div>
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
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <StepTitle
        title='Jam kunjungan'
        description={`Pilih slot sesi jam kunjungan yang tersedia pada ${selectedDateStr}.`}
      />
      <div className='min-h-0 flex-1 overflow-y-auto pr-1 pb-2'>
        <AppointmentTimeSlotPicker
          selectedDateStr={selectedDateStr}
          selectedTimeSlot={selectedTimeSlot}
          onSelectTimeSlot={onSelectTimeSlot}
        />
      </div>
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
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <StepTitle
        title='Konfirmasi data'
        description='Pastikan jadwal dan jawaban form sudah benar sebelum disimpan.'
      />
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

      <ScrollArea className='min-h-[160px] flex-1 rounded-lg border border-border p-3'>
        <div className='grid gap-2 pr-3 text-xs'>
          {answeredFields.map((answer) => (
            <SummaryRow key={answer.id} label={answer.label} value={answer.value} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
