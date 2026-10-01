'use client';

import * as React from 'react';
import { getMedicalFlowDefinition } from '../constants/medical-appointment-schemas';
import type { MedicalIntakeRecord } from '../api/types';

const automaticLabels: Record<string, string> = {
  estimatedDueDate: 'HPL otomatis',
  gestationalAgeAtSubmit: 'Umur kehamilan saat submit',
  childAgeAtSubmit: 'Umur anak saat submit',
  imtAtSubmit: 'IMT (Indeks Massa Tubuh)'
};

export function MedicalIntakeSummary({ intake }: { intake: MedicalIntakeRecord }) {
  const definition = getMedicalFlowDefinition(intake.flow);
  const automaticEntries = Object.entries(intake.automatic || {}).filter(([, value]) => value);

  const sectionsWithAnswers = definition.sections
    .map((section) => {
      const answeredFields = section.fields
        .map((field) => ({
          id: field.id,
          label: field.label,
          value: intake.answersByFieldId[field.id] || ''
        }))
        .filter((field) => field.value.trim().length > 0);

      return {
        id: section.id,
        title: section.title,
        description: section.description,
        fields: answeredFields
      };
    })
    .filter((section) => section.fields.length > 0);

  return (
    <div className='border-b border-border/40 pb-3.5 space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Intake Medis Pasien
          </span>
          <p className='text-sm font-semibold text-foreground'>{definition.formTitle}</p>
        </div>
        {intake.submittedAt && (
          <span className='shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground'>
            {intake.submittedAt}
          </span>
        )}
      </div>

      {automaticEntries.length > 0 && (
        <div className='p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs'>
          <span className='text-[11px] font-bold text-primary block'>
            Kalkulasi Klinis Otomatis
          </span>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {automaticEntries.map(([key, value]) => (
              <div
                key={key}
                className='flex items-center justify-between gap-2 border-b border-primary/10 pb-1 last:border-b-0'
              >
                <span className='text-muted-foreground text-[11px]'>
                  {automaticLabels[key] || key}
                </span>
                <span className='font-semibold text-foreground text-[11.5px]'>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='space-y-2.5'>
        {sectionsWithAnswers.map((section) => (
          <div
            key={section.id}
            className='p-3 rounded-xl bg-muted/15 border border-border/50 space-y-2 text-xs'
          >
            <div className='border-b border-border/30 pb-1.5'>
              <h4 className='font-semibold text-foreground text-xs'>{section.title}</h4>
              {section.description && (
                <p className='text-[10.5px] text-muted-foreground'>{section.description}</p>
              )}
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5'>
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  className='flex items-baseline justify-between gap-2 border-b border-border/20 pb-1 last:border-b-0'
                >
                  <span className='text-muted-foreground text-[11px] shrink-0'>{field.label}</span>
                  <span className='font-medium text-foreground text-right text-[11.5px] truncate'>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
