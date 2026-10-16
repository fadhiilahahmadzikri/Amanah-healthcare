'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import type { InspectorTabProps } from './types';

export function InspectorObstetricTab({ data }: InspectorTabProps) {
  const { answers, maternal } = data;

  const gravida =
    maternal?.gravidaCount ?? (answers.gravidaCount ? Number(answers.gravidaCount) : 1);
  const partus = maternal?.parityCount ?? (answers.partusCount ? Number(answers.partusCount) : 0);
  const abortus =
    maternal?.abortionCount ?? (answers.abortusCount ? Number(answers.abortusCount) : 0);
  const living =
    maternal?.livingChildrenCount ??
    (answers.livingChildrenCount ? Number(answers.livingChildrenCount) : 0);
  const gpaCode = `G${gravida} P${partus} A${abortus} Ah${living}`;

  let prevPregnancies = maternal?.previousPregnancies || [];
  if (prevPregnancies.length === 0) {
    const list: any[] = [];
    for (let i = 1; i <= 4; i += 1) {
      const year = answers[`previousPregnancy${i}BirthYear`];
      if (year) {
        list.push({
          orderNumber: i,
          birthYear: year,
          gestationalAgeAtBirth: answers[`previousPregnancy${i}GestationalAgeAtBirth`],
          birthWeightGrams: answers[`previousPregnancy${i}BirthWeight`],
          birthLengthCm: answers[`previousPregnancy${i}BirthLength`],
          childSex: answers[`previousPregnancy${i}ChildSex`],
          deliveryMethod: answers[`previousPregnancy${i}DeliveryMethod`],
          birthAttendant: answers[`previousPregnancy${i}BirthAttendant`],
          deliveryPlace: answers[`previousPregnancy${i}DeliveryPlace`],
          complications: answers[`previousPregnancy${i}Complications`]
        });
      }
    }
    prevPregnancies = list;
  }

  const everUsedKb =
    answers.everUsedContraception ||
    (maternal?.contraceptiveHistories && maternal.contraceptiveHistories.length > 0
      ? 'Pernah'
      : 'Belum Pernah');
  const postPartumKb = answers.plansPostpartumContraception || '-';

  let kbList = maternal?.contraceptiveHistories || [];
  if (kbList.length === 0) {
    const list: any[] = [];
    for (let i = 1; i <= 4; i += 1) {
      const type = answers[`contraception${i}Type`] || answers[`contraceptive${i}Type`];
      if (type) {
        list.push({
          orderNumber: i,
          contraceptiveType: type,
          startDate: answers[`contraception${i}StartDate`] || answers[`contraceptive${i}StartDate`],
          stopDate: answers[`contraception${i}StopDate`] || answers[`contraceptive${i}StopDate`],
          durationText:
            answers[`contraception${i}Duration`] || answers[`contraceptive${i}Duration`],
          problems: answers[`contraception${i}Problems`] || answers[`contraceptive${i}Problems`],
          sideEffects:
            answers[`contraception${i}SideEffects`] || answers[`contraceptive${i}SideEffects`]
        });
      }
    }
    kbList = list;
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
      {/* Kolom 1: Status Obstetri & Riwayat Persalinan */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Status Obstetri (GPA)
        </span>

        <PatientLineInput
          id='obstetric-gpa-summary'
          label='Ringkasan Status Obstetri'
          value={gpaCode}
          isMonospace
          readOnly
        />

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='obstetric-gravida'
            label='Gravida (Kehamilan Ke)'
            value={String(gravida)}
            readOnly
          />
          <PatientLineInput
            id='obstetric-partus'
            label='Partus (Jumlah Persalinan)'
            value={String(partus)}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='obstetric-abortus'
            label='Abortus (Keguguran)'
            value={String(abortus)}
            readOnly
          />
          <PatientLineInput
            id='obstetric-living'
            label='Anak Hidup (Ah)'
            value={String(living)}
            readOnly
          />
        </div>

        <div className='pt-2 space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Riwayat Persalinan Sebelumnya ({prevPregnancies.length} Tercatat)
          </span>

          {prevPregnancies.length === 0 ? (
            <PatientLineInput
              id='obstetric-no-history'
              label='Riwayat Persalinan'
              value='Kehamilan Pertama / Primigravida (Tidak ada riwayat persalinan lalu)'
              readOnly
            />
          ) : (
            prevPregnancies.map((p, idx) => (
              <div
                key={idx}
                className='space-y-3 pt-1 border-b border-border/20 pb-3 last:border-b-0'
              >
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id={`obstetric-prev-child-${idx}`}
                    label={`Anak Ke-${p.orderNumber || idx + 1}`}
                    value={`Tahun ${p.birthYear || '-'} • ${p.childSex || 'Jenis kelamin -'}`}
                    readOnly
                  />
                  <PatientLineInput
                    id={`obstetric-prev-weight-${idx}`}
                    label='BB / TB Lahir'
                    value={`${p.birthWeightGrams ? `${p.birthWeightGrams} g` : '-'} / ${p.birthLengthCm ? `${p.birthLengthCm} cm` : '-'}`}
                    readOnly
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id={`obstetric-prev-method-${idx}`}
                    label='Cara & Penolong Persalinan'
                    value={`${p.deliveryMethod || '-'} / ${p.birthAttendant || '-'}`}
                    readOnly
                  />
                  <PatientLineInput
                    id={`obstetric-prev-place-${idx}`}
                    label='Tempat & Komplikasi'
                    value={`${p.deliveryPlace || '-'} (${p.complications || 'Tanpa komplikasi'})`}
                    readOnly
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kolom 2: Riwayat KB & Kontrasepsi */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Riwayat KB & Perencanaan Kontrasepsi
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='obstetric-ever-kb'
            label='Pernah Menggunakan KB'
            value={everUsedKb}
            readOnly
          />
          <PatientLineInput
            id='obstetric-postpartum-kb'
            label='Rencana KB Pasca Salin'
            value={postPartumKb}
            readOnly
          />
        </div>

        <div className='pt-2 space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Daftar Pemakaian Kontrasepsi ({kbList.length} Metode)
          </span>

          {kbList.length === 0 ? (
            <PatientLineInput
              id='obstetric-no-kb'
              label='Riwayat Kontrasepsi'
              value='Belum pernah menggunakan alat atau metode kontrasepsi sebelumnya'
              readOnly
            />
          ) : (
            kbList.map((c, idx) => (
              <div
                key={idx}
                className='space-y-3 pt-1 border-b border-border/20 pb-3 last:border-b-0'
              >
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id={`kb-type-${idx}`}
                    label={`Metode KB #${idx + 1}`}
                    value={c.contraceptiveType || '-'}
                    readOnly
                  />
                  <PatientLineInput
                    id={`kb-duration-${idx}`}
                    label='Durasi / Periode'
                    value={
                      c.durationText ||
                      (c.startDate ? `${c.startDate} s/d ${c.stopDate || 'Sekarang'}` : '-')
                    }
                    readOnly
                  />
                </div>
                {(c.problems || c.sideEffects) && (
                  <PatientLineInput
                    id={`kb-issues-${idx}`}
                    label='Efek Samping / Keluhan'
                    value={c.problems || c.sideEffects || '-'}
                    readOnly
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
