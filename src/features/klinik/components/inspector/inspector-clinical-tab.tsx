'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
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

  const envNotes = maternal?.concerningEnvironmentNotes || '-';
  const allergy = maternal?.allergyInfo || '-';
  const otherNotes = maternal?.otherNotes || '-';

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

  const positiveDiseases = DISEASES.map((d) => {
    const rawVal = answers[d.id];
    const fromMap =
      conditionsMap.get(d.id.toLowerCase()) || conditionsMap.get(d.label.toLowerCase());

    const has = fromMap
      ? fromMap.has
      : rawVal === true || (typeof rawVal === 'string' && rawVal.toLowerCase() === 'ya');
    const year =
      fromMap?.year ||
      (d.yearId ? answers[d.yearId] : undefined) ||
      (d.notesId ? answers[d.notesId] : undefined);
    const notes = fromMap?.notes || (d.notesId && d.yearId ? answers[d.notesId] : undefined);

    return { ...d, has, year, notes };
  }).filter((d) => d.has);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
      {/* Kolom 1: Kebiasaan 1 Bulan Pra-Hamil */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Kebiasaan 1 Bulan Sebelum Hamil
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput id='habit-smoking' label='Merokok Pra-Hamil' value={smoking} readOnly />
          <PatientLineInput
            id='habit-alcohol'
            label='Minuman Beralkohol'
            value={alcohol}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput id='habit-diet' label='Pola Makan Tak Teratur' value={diet} readOnly />
          <PatientLineInput
            id='habit-activity'
            label='Aktivitas Fisik Berkurang'
            value={activity}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='habit-meds'
            label='Minum Obat Tanpa Resep'
            value={unprescribedMed}
            readOnly
          />
          <PatientLineInput
            id='habit-cosmetics'
            label='Kosmetik Khusus / Khawatir'
            value={cosmetic}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='habit-pesticide'
            label='Paparan Pestisida Tanaman'
            value={pesticide}
            readOnly
          />
          <PatientLineInput
            id='habit-chemical'
            label='Paparan Bahan Kimia'
            value={chemical}
            readOnly
          />
        </div>

        <PatientLineInput
          id='habit-smoke-exposure'
          label='Paparan Asap Rokok / Pembakaran'
          value={smokeExposure}
          readOnly
        />
      </div>

      {/* Kolom 2: Riwayat Penyakit & Catatan Klinis */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Riwayat Penyakit Pasien
        </span>

        {positiveDiseases.length === 0 ? (
          <PatientLineInput
            id='clinical-no-disease'
            label='Riwayat Penyakit Kronis / Bawaan'
            value='Tidak ada riwayat penyakit kronis atau komorbiditas yang dilaporkan'
            readOnly
          />
        ) : (
          positiveDiseases.map((d, idx) => (
            <PatientLineInput
              key={idx}
              id={`disease-${d.id}`}
              label={d.label}
              value={`Teridentifikasi ${d.year ? `• Diagnosa: ${d.year}` : ''} ${d.notes ? `• ${d.notes}` : ''}`.trim()}
              readOnly
            />
          ))
        )}

        <div className='pt-2 space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Catatan Tambahan & Lingkungan
          </span>

          <PatientLineInput
            id='clinical-allergy'
            label='Catatan Riwayat Alergi'
            value={allergy}
            readOnly
          />

          <PatientLineInput
            id='clinical-environment'
            label='Catatan Lingkungan Berisiko'
            value={envNotes}
            readOnly
          />

          <PatientLineInput
            id='clinical-other-notes'
            label='Catatan Tambahan untuk Bidan'
            value={otherNotes}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
