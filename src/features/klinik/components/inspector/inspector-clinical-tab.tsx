'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { InspectorTabProps } from './types';

interface DiseaseItem {
  id: string;
  notesId?: string;
  yearId?: string;
  label: string;
}

const DISEASES: DiseaseItem[] = [
  { id: 'hasHypertensionHistory', notesId: 'hypertensionHistoryNotes', label: 'Tekanan Darah Tinggi / Hipertensi' },
  { id: 'hasHeartDiseaseHistory', notesId: 'heartDiseaseHistoryNotes', label: 'Penyakit Jantung' },
  { id: 'hasThyroidDiseaseHistory', notesId: 'thyroidDiseaseHistoryNotes', label: 'Masalah Tiroid' },
  { id: 'hasAutoimmuneHistory', notesId: 'autoimmuneHistoryNotes', label: 'Penyakit Autoimun' },
  { id: 'hasDiabetesHistory', notesId: 'diabetesHistoryNotes', label: 'Diabetes / Kencing Manis' },
  { id: 'hasAsthmaHistory', notesId: 'asthmaHistoryNotes', label: 'Asma' },
  { id: 'hasTuberculosisHistory', notesId: 'tuberculosisHistoryNotes', label: 'TBC / Tuberkulosis' },
  { id: 'hasHepatitisBHistory', notesId: 'hepatitisBHistoryNotes', label: 'Hepatitis B' },
  { id: 'hasHivOrSyphilisHistory', notesId: 'hivOrSyphilisHistoryNotes', label: 'HIV / Sifilis' },
  { id: 'hasMentalHealthHistory', notesId: 'mentalHealthHistoryNotes', label: 'Kesehatan Jiwa' },
  { id: 'hasTwinPregnancyHistory', notesId: 'twinPregnancyHistoryNotes', label: 'Riwayat Hamil Kembar' },
  { id: 'hasCystMyomaTumorHistory', notesId: 'cystMyomaTumorHistoryNotes', label: 'Kista, Miom, atau Tumor' },
  { id: 'hasSurgeryHistory', notesId: 'surgeryHistoryNotes', label: 'Riwayat Operasi' },
  { id: 'hasOtherDiseaseHistory', yearId: 'otherDiseaseHistoryYear', notesId: 'otherDiseaseHistoryNotes', label: 'Penyakit Lainnya' }
];

export function InspectorClinicalTab({ data }: InspectorTabProps) {
  const { answers, maternal } = data;

  const smoking = answers.smokedBeforePregnancy || (maternal?.smokedBeforePregnancy ? 'Ya' : 'Tidak');
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

  const envNotes = answers.concerningEnvironmentNotes || maternal?.concerningEnvironmentNotes || '-';
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
    <div className='flex flex-col gap-3.5'>
      <div className='rounded-lg border border-border/60 bg-card p-3'>
        <span className='text-xs font-bold text-foreground block mb-2'>
          Kebiasaan 1 Bulan Sebelum Hamil
        </span>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
          {habits.map((item, idx) => {
            const isYes = item.value === 'Ya' || item.value === 'ya' || item.value === true;
            return (
              <div
                key={idx}
                className='flex items-center justify-between p-2 rounded-md border border-border/40 bg-muted/10 gap-2'
              >
                <span className='text-muted-foreground truncate text-xs'>{item.label}</span>
                <Badge
                  variant={isYes ? 'default' : 'secondary'}
                  className='text-[10px] h-5 px-1.5 shrink-0'
                >
                  {isYes ? 'Ya' : 'Tidak'}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className='rounded-lg border border-border/60 bg-card p-3'>
        <span className='text-xs font-bold text-foreground block mb-2'>
          Riwayat Penyakit Pasien
        </span>
        <div className='divide-y divide-border/40'>
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
              <div key={d.id} className='flex items-center justify-between py-2 text-xs'>
                <div className='min-w-0 flex-1 pr-2'>
                  <span className='font-medium text-foreground truncate block'>
                    {d.label}
                  </span>
                  {hasCondition && (year || notes) && (
                    <span className='text-[10.5px] text-muted-foreground block truncate'>
                      {year ? `Tahun: ${year}` : ''} {notes ? `• ${notes}` : ''}
                    </span>
                  )}
                </div>

                <div className='flex items-center gap-1.5 shrink-0'>
                  <Badge
                    variant={hasCondition ? 'destructive' : 'outline'}
                    className='text-[10px] h-5 px-1.5'
                  >
                    {hasCondition ? 'Ya' : 'Tidak'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
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
  );
}
