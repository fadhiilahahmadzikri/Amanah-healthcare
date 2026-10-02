'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { InspectorTabProps } from './types';

interface DiseaseItem {
  id: string;
  notesId?: string;
  yearId?: string;
  label: string;
}

const DISEASES: DiseaseItem[] = [
  {
    id: 'hasHypertensionHistory',
    notesId: 'hypertensionHistoryNotes',
    label: 'Tekanan Darah Tinggi / Hipertensi'
  },
  { id: 'hasHeartDiseaseHistory', notesId: 'heartDiseaseHistoryNotes', label: 'Penyakit Jantung' },
  {
    id: 'hasThyroidDiseaseHistory',
    notesId: 'thyroidDiseaseHistoryNotes',
    label: 'Masalah Tiroid'
  },
  { id: 'hasAutoimmuneHistory', notesId: 'autoimmuneHistoryNotes', label: 'Penyakit Autoimun' },
  { id: 'hasDiabetesHistory', notesId: 'diabetesHistoryNotes', label: 'Diabetes / Kencing Manis' },
  { id: 'hasAsthmaHistory', notesId: 'asthmaHistoryNotes', label: 'Asma' },
  {
    id: 'hasTuberculosisHistory',
    notesId: 'tuberculosisHistoryNotes',
    label: 'TBC / Tuberkulosis'
  },
  { id: 'hasHepatitisBHistory', notesId: 'hepatitisBHistoryNotes', label: 'Hepatitis B' },
  { id: 'hasHivOrSyphilisHistory', notesId: 'hivOrSyphilisHistoryNotes', label: 'HIV / Sifilis' },
  { id: 'hasMentalHealthHistory', notesId: 'mentalHealthHistoryNotes', label: 'Kesehatan Jiwa' },
  {
    id: 'hasTwinPregnancyHistory',
    notesId: 'twinPregnancyHistoryNotes',
    label: 'Riwayat Hamil Kembar'
  },
  {
    id: 'hasCystMyomaTumorHistory',
    notesId: 'cystMyomaTumorHistoryNotes',
    label: 'Kista, Miom, atau Tumor'
  },
  { id: 'hasSurgeryHistory', notesId: 'surgeryHistoryNotes', label: 'Riwayat Operasi' },
  {
    id: 'hasOtherDiseaseHistory',
    yearId: 'otherDiseaseHistoryYear',
    notesId: 'otherDiseaseHistoryNotes',
    label: 'Penyakit Lainnya'
  }
];

export function InspectorClinicalTab({ data }: InspectorTabProps) {
  const { answers, maternal } = data;

  const smoking =
    answers.smokedBeforePregnancy || (maternal?.smokedBeforePregnancy ? 'Ya' : 'Tidak');
  const alcohol = answers.alcoholBeforePregnancy || 'Tidak';
  const diet = answers.irregularDietBeforePregnancy || 'Tidak';
  const activity = answers.reducedPhysicalActivityBeforePregnancy || 'Tidak';
  const unprescribedMed =
    answers.unprescribedMedicationBeforePregnancy ||
    (maternal?.unprescribedMedicationBeforePregnancy ? 'Ya' : 'Tidak');
  const cosmetic =
    answers.concerningCosmeticUseBeforePregnancy ||
    (maternal?.concerningCosmeticUseBeforePregnancy ? 'Ya' : 'Tidak');
  const pesticide =
    answers.pesticideExposureBeforePregnancy ||
    (maternal?.pesticideExposureBeforePregnancy ? 'Ya' : 'Tidak');
  const chemical =
    answers.chemicalExposureBeforePregnancy ||
    (maternal?.chemicalExposureBeforePregnancy ? 'Ya' : 'Tidak');
  const smokeExposure =
    answers.smokeExposureBeforePregnancy ||
    (maternal?.smokeExposureBeforePregnancy ? 'Ya' : 'Tidak');

  const habits = [
    { label: 'Merokok sebelum hamil', value: smoking },
    { label: 'Minum minuman beralkohol', value: alcohol },
    { label: 'Pola makan tidak teratur / tinggi gula', value: diet },
    { label: 'Aktivitas fisik jauh berkurang', value: activity },
    { label: 'Minum obat tanpa resep dokter/bidan', value: unprescribedMed },
    { label: 'Penggunaan kosmetik yang dikhawatirkan', value: cosmetic },
    { label: 'Paparan pestisida / obat tanaman', value: pesticide },
    { label: 'Paparan bahan kimia kerja / rumah tangga', value: chemical },
    { label: 'Paparan asap rokok / pembakaran', value: smokeExposure }
  ];

  const envNotes =
    answers.concerningEnvironmentNotes || maternal?.concerningEnvironmentNotes || '-';
  const allergy = answers.allergyInfo || maternal?.allergyInfo || '-';
  const otherNotes = answers.otherNotes || maternal?.otherNotes || '-';

  const conditionsMap = new Map<string, { has: boolean; year?: string; notes?: string }>();
  if (maternal?.healthConditions && Array.isArray(maternal.healthConditions)) {
    maternal.healthConditions.forEach((c) => {
      const key = c.conditionCode;
      if (key) {
        conditionsMap.set(key.toLowerCase(), {
          has: Boolean(c.hasCondition),
          year: c.diagnosisYear ? String(c.diagnosisYear) : undefined,
          notes: c.notes || undefined
        });
      }
    });
  }

  return (
    <div className='space-y-4'>
      <div>
        <div className='border-b border-border/40 pb-1 mb-2.5'>
          <span className='text-xs font-bold text-foreground'>Kebiasaan 1 Bulan Sebelum Hamil</span>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
          {habits.map((item, idx) => {
            const isNegative = item.value === 'Tidak' || item.value === 'tidak';
            return (
              <div
                key={idx}
                className='flex items-center justify-between p-2 rounded-lg border border-border/40 bg-card/40 gap-2'
              >
                <span className='text-muted-foreground truncate text-xs'>{item.label}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0',
                    isNegative
                      ? 'bg-muted text-muted-foreground border-border/40'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  )}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        <div className='grid grid-cols-2 gap-y-3 gap-x-5 pt-3'>
          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Catatan Alergi
            </span>
            <p className='text-sm font-semibold text-foreground truncate'>{allergy}</p>
          </div>
          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Catatan Lingkungan
            </span>
            <p className='text-sm font-semibold text-foreground truncate'>{envNotes}</p>
          </div>
          {otherNotes !== '-' && (
            <div className='col-span-2 border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Catatan Tambahan untuk Bidan
              </span>
              <p className='text-sm font-medium text-foreground leading-relaxed'>{otherNotes}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className='border-b border-border/40 pb-1 mb-2.5'>
          <span className='text-xs font-bold text-foreground'>14 Riwayat Penyakit Pasien</span>
        </div>

        <div className='space-y-1.5'>
          {DISEASES.map((d) => {
            const rawVal = answers[d.id];
            const fromMap =
              conditionsMap.get(d.id.toLowerCase()) || conditionsMap.get(d.label.toLowerCase());

            const hasCondition = fromMap
              ? fromMap.has
              : rawVal === 'Ya' || rawVal === 'ya' || rawVal === true;
            const year =
              fromMap?.year ||
              (d.yearId ? answers[d.yearId] : undefined) ||
              (d.notesId ? answers[d.notesId] : undefined);
            const notes =
              fromMap?.notes || (d.notesId && d.yearId ? answers[d.notesId] : undefined);

            return (
              <div
                key={d.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg border text-xs transition-colors',
                  hasCondition ? 'bg-rose-500/5 border-rose-500/20' : 'bg-card/40 border-border/30'
                )}
              >
                <div className='min-w-0 flex-1 pr-2'>
                  <span
                    className={cn(
                      'block font-medium truncate',
                      hasCondition ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {d.label}
                  </span>
                  {hasCondition && (year || notes) && (
                    <span className='text-[10px] text-muted-foreground block truncate'>
                      {year ? `Tahun: ${year}` : ''} {notes ? `• ${notes}` : ''}
                    </span>
                  )}
                </div>

                <div className='flex items-center gap-1.5 shrink-0'>
                  {hasCondition && year && (
                    <span className='px-1.5 py-0.5 rounded font-mono text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold'>
                      {year}
                    </span>
                  )}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10.5px] font-bold border',
                      hasCondition
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : 'bg-muted text-muted-foreground border-border/40'
                    )}
                  >
                    {hasCondition ? 'Ya' : 'Tidak'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
