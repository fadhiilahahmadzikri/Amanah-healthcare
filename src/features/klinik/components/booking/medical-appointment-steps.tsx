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
import { VaccineChecklist } from './vaccine-checklist';

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
  builderMode = false,
  onUpdateField,
  onDeleteField,
  onAddField
}: {
  section: MedicalFormSection;
  catalogActionType?: 'add' | 'edit' | null;
  onReturnToCatalog?: () => void;
  renderField: (field: MedicalFormField, index: number) => React.ReactNode;
  values?: MedicalAppointmentValues;
  onFieldChange?: (fieldId: string, value: string) => void;
  builderMode?: boolean;
  onUpdateField?: (fieldId: string, updated: Partial<MedicalFormField>) => void;
  onDeleteField?: (fieldId: string) => void;
  onAddField?: (componentId?: string) => void;
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
      {section.id === 'vaccineHistory' && values && onFieldChange ? (
        <div className='px-0.5 pt-1.5 pb-2'>
          <VaccineChecklist values={values} onFieldChange={onFieldChange} />
        </div>
      ) : isQuestionnaire && (builderMode || (values && onFieldChange)) ? (
        <div className='px-0.5 pt-1.5 pb-2'>
          <MedicalQuestionnaire
            section={section}
            values={values || {}}
            onFieldChange={onFieldChange || (() => {})}
            builderMode={builderMode}
            onUpdateField={onUpdateField}
            onDeleteField={onDeleteField}
            onAddField={onAddField}
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
            .filter(
              (field) =>
                (builderMode || field.isActive !== false) &&
                (!field.visibleIf || (values && field.visibleIf(values)))
            )
            .map((field, idx) => renderField(field, idx))}

          {builderMode && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const compId =
                  e.dataTransfer.getData('application/x-amanah-component-id') ||
                  e.dataTransfer.getData('text/plain');
                if (compId && onAddField) {
                  onAddField(compId);
                }
              }}
              className='col-span-1 sm:col-span-2 flex items-center justify-center rounded-xl border border-dashed border-border/70 py-4 px-4 text-center text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground hover:bg-muted/30 transition-all select-none'
            >
              <span>Seret komponen dari Studio Formulir ke sini untuk menambahkan</span>
            </div>
          )}
        </FieldGroup>
      )}
    </div>
  );
}
