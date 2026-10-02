'use client';

import * as React from 'react';
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
    <div className='space-y-4'>
      <div>
        <div className='flex items-center justify-between border-b border-border/40 pb-1 mb-2.5'>
          <span className='text-xs font-bold text-foreground'>Status Obstetri & GPA</span>
          <span className='font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20'>
            {gpaCode}
          </span>
        </div>

        <div className='grid grid-cols-4 gap-2 text-center'>
          <div className='p-2 rounded-lg bg-card/60 border border-border/40'>
            <span className='text-[10.5px] text-muted-foreground block'>Gravida (G)</span>
            <span className='font-bold text-foreground text-sm font-mono mt-0.5 block'>
              {gravida}
            </span>
          </div>
          <div className='p-2 rounded-lg bg-card/60 border border-border/40'>
            <span className='text-[10.5px] text-muted-foreground block'>Partus (P)</span>
            <span className='font-bold text-foreground text-sm font-mono mt-0.5 block'>
              {partus}
            </span>
          </div>
          <div className='p-2 rounded-lg bg-card/60 border border-border/40'>
            <span className='text-[10.5px] text-muted-foreground block'>Abortus (A)</span>
            <span className='font-bold text-foreground text-sm font-mono mt-0.5 block'>
              {abortus}
            </span>
          </div>
          <div className='p-2 rounded-lg bg-card/60 border border-border/40'>
            <span className='text-[10.5px] text-muted-foreground block'>Anak Hidup (Ah)</span>
            <span className='font-bold text-foreground text-sm font-mono mt-0.5 block'>
              {living}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className='flex items-center justify-between border-b border-border/40 pb-1 mb-2.5'>
          <span className='text-xs font-bold text-foreground'>Riwayat Persalinan Sebelumnya</span>
          <span className='text-[11px] font-medium text-muted-foreground'>
            {prevPregnancies.length} Kehamilan
          </span>
        </div>

        {prevPregnancies.length === 0 ? (
          <p className='text-muted-foreground text-xs py-1'>
            Tidak ada riwayat persalinan sebelumnya (Kehamilan Pertama / Primigravida).
          </p>
        ) : (
          <div className='space-y-2'>
            {prevPregnancies.map((p, idx) => (
              <div
                key={idx}
                className='p-2.5 rounded-lg bg-card border border-border/40 text-xs space-y-1.5'
              >
                <div className='flex items-center justify-between font-bold text-foreground border-b border-border/20 pb-1'>
                  <span>
                    Anak Ke-{p.orderNumber || idx + 1} ({p.birthYear || '-'})
                  </span>
                  <span className='font-normal text-muted-foreground text-[10.5px]'>
                    {p.childSex || '-'} • {p.birthWeightGrams ? `${p.birthWeightGrams} g` : '-'}{' '}
                    {p.birthLengthCm ? `/ ${p.birthLengthCm} cm` : ''}
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-x-2 gap-y-1 text-muted-foreground text-[11px]'>
                  <div>
                    <span className='text-foreground font-medium'>Cara Persalinan: </span>
                    {p.deliveryMethod || '-'}
                  </div>
                  <div>
                    <span className='text-foreground font-medium'>Penolong: </span>
                    {p.birthAttendant || '-'}
                  </div>
                  <div>
                    <span className='text-foreground font-medium'>Tempat Bersalin: </span>
                    {p.deliveryPlace || '-'}
                  </div>
                  <div>
                    <span className='text-foreground font-medium'>Usia Lahir: </span>
                    {p.gestationalAgeAtBirth || '-'}
                  </div>
                </div>
                {p.complications && p.complications !== 'Tidak ada' && (
                  <div className='text-destructive text-[10.5px] pt-0.5 border-t border-destructive/20 font-medium'>
                    Komplikasi: {p.complications}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className='border-b border-border/40 pb-1 mb-2.5'>
          <span className='text-xs font-bold text-foreground'>Riwayat Kontrasepsi (KB)</span>
        </div>

        <div className='grid grid-cols-2 gap-y-3 gap-x-5 mb-2'>
          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Riwayat Pemakaian KB
            </span>
            <p className='text-sm font-semibold text-foreground truncate'>{everUsedKb}</p>
          </div>
          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Rencana KB Pasca Salin
            </span>
            <p className='text-sm font-semibold text-foreground truncate'>{postPartumKb}</p>
          </div>
        </div>

        {kbList.length === 0 ? (
          <p className='text-muted-foreground text-xs py-1'>
            Belum pernah menggunakan alat atau metode kontrasepsi sebelumnya.
          </p>
        ) : (
          <div className='space-y-1.5'>
            {kbList.map((c, idx) => (
              <div
                key={idx}
                className='p-2 rounded-lg bg-card border border-border/40 text-xs space-y-1'
              >
                <div className='flex items-center justify-between font-semibold text-foreground'>
                  <span>{c.contraceptiveType}</span>
                  <span className='text-muted-foreground font-normal text-[10.5px]'>
                    {c.durationText ||
                      (c.startDate ? `${c.startDate} s/d ${c.stopDate || 'Sekarang'}` : '-')}
                  </span>
                </div>
                {(c.problems || c.sideEffects) && (
                  <div className='text-muted-foreground text-[10.5px]'>
                    Efek/Keluhan: {c.problems || c.sideEffects}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
