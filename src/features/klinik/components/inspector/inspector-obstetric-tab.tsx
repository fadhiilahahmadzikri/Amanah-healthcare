'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
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
    <div className='flex flex-col gap-3.5'>
      <div className='rounded-lg border border-border/60 bg-card p-3'>
        <div className='flex items-center justify-between mb-2.5 pb-2 border-b border-border/40'>
          <span className='text-xs font-bold text-foreground'>
            Status Obstetri (GPA)
          </span>
          <Badge variant='outline' className='font-mono font-bold text-xs'>
            {gpaCode}
          </Badge>
        </div>

        <div className='grid grid-cols-4 gap-2 text-center'>
          <div className='p-2 rounded-md bg-muted/20 border border-border/40'>
            <span className='text-[10.5px] text-muted-foreground block'>Gravida (G)</span>
            <span className='font-bold text-foreground text-sm font-mono mt-0.5 block'>
              {gravida}
            </span>
          </div>
          <div className='p-2 rounded-md bg-muted/20 border border-border/40'>
            <span className='text-[10.5px] text-muted-foreground block'>Partus (P)</span>
            <span className='font-bold text-foreground text-sm font-mono mt-0.5 block'>
              {partus}
            </span>
          </div>
          <div className='p-2 rounded-md bg-muted/20 border border-border/40'>
            <span className='text-[10.5px] text-muted-foreground block'>Abortus (A)</span>
            <span className='font-bold text-foreground text-sm font-mono mt-0.5 block'>
              {abortus}
            </span>
          </div>
          <div className='p-2 rounded-md bg-muted/20 border border-border/40'>
            <span className='text-[10.5px] text-muted-foreground block'>Anak Hidup (Ah)</span>
            <span className='font-bold text-foreground text-sm font-mono mt-0.5 block'>
              {living}
            </span>
          </div>
        </div>
      </div>

      <div className='rounded-lg border border-border/60 bg-card p-3'>
        <div className='flex items-center justify-between mb-2.5 pb-2 border-b border-border/40'>
          <span className='text-xs font-bold text-foreground'>
            Riwayat Persalinan Sebelumnya
          </span>
          <Badge variant='secondary' className='text-[10.5px]'>
            {prevPregnancies.length} Kehamilan
          </Badge>
        </div>

        {prevPregnancies.length === 0 ? (
          <div className='rounded-md border border-dashed border-border/60 p-4 bg-muted/10 text-center'>
            <p className='text-xs text-muted-foreground font-medium'>
              Tidak ada riwayat persalinan sebelumnya (Kehamilan Pertama / Primigravida).
            </p>
          </div>
        ) : (
          <div className='divide-y divide-border/40'>
            {prevPregnancies.map((p, idx) => (
              <div key={idx} className='py-2.5 text-xs space-y-1.5'>
                <div className='flex items-center justify-between font-semibold text-foreground'>
                  <span>
                    Anak Ke-{p.orderNumber || idx + 1} ({p.birthYear || '-'})
                  </span>
                  <div className='flex items-center gap-1.5'>
                    {p.childSex && (
                      <Badge variant='outline' className='text-[10px] h-5 px-1.5'>
                        {p.childSex}
                      </Badge>
                    )}
                    {(p.birthWeightGrams || p.birthLengthCm) && (
                      <span className='text-[10.5px] text-muted-foreground font-mono'>
                        {p.birthWeightGrams ? `${p.birthWeightGrams} g` : ''}
                        {p.birthLengthCm ? ` / ${p.birthLengthCm} cm` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-x-2 gap-y-1 text-muted-foreground text-[11px]'>
                  <div>
                    <span className='text-foreground font-medium'>Cara: </span>
                    {p.deliveryMethod || '-'}
                  </div>
                  <div>
                    <span className='text-foreground font-medium'>Penolong: </span>
                    {p.birthAttendant || '-'}
                  </div>
                  <div>
                    <span className='text-foreground font-medium'>Tempat: </span>
                    {p.deliveryPlace || '-'}
                  </div>
                  <div>
                    <span className='text-foreground font-medium'>Usia Lahir: </span>
                    {p.gestationalAgeAtBirth || '-'}
                  </div>
                </div>

                {p.complications && p.complications !== 'Tidak ada' && (
                  <div className='text-destructive text-[10.5px] pt-1 font-medium'>
                    Komplikasi: {p.complications}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='rounded-lg border border-border/60 bg-card p-3'>
        <div className='flex items-center justify-between mb-2.5 pb-2 border-b border-border/40'>
          <span className='text-xs font-bold text-foreground'>
            Riwayat KB & Kontrasepsi
          </span>
          <Badge
            variant={everUsedKb === 'Pernah' ? 'default' : 'secondary'}
            className='text-[10.5px]'
          >
            {everUsedKb}
          </Badge>
        </div>

        <div className='grid grid-cols-2 gap-y-2 gap-x-4 mb-3'>
          <div>
            <span className='text-[10.5px] text-muted-foreground block mb-0.5'>
              Riwayat Pemakaian KB
            </span>
            <span className='text-xs font-semibold text-foreground'>{everUsedKb}</span>
          </div>
          <div>
            <span className='text-[10.5px] text-muted-foreground block mb-0.5'>
              Rencana KB Pasca Salin
            </span>
            <span className='text-xs font-semibold text-foreground'>{postPartumKb}</span>
          </div>
        </div>

        {kbList.length === 0 ? (
          <div className='rounded-md border border-dashed border-border/60 p-4 bg-muted/10 text-center'>
            <p className='text-xs text-muted-foreground font-medium'>
              Belum pernah menggunakan alat atau metode kontrasepsi sebelumnya.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-border/40'>
            {kbList.map((c, idx) => (
              <div key={idx} className='py-2 text-xs space-y-0.5'>
                <div className='flex items-center justify-between font-semibold text-foreground'>
                  <span>{c.contraceptiveType}</span>
                  <span className='text-muted-foreground text-[10.5px] font-normal'>
                    {c.durationText ||
                      (c.startDate ? `${c.startDate} s/d ${c.stopDate || 'Sekarang'}` : '-')}
                  </span>
                </div>
                {(c.problems || c.sideEffects) && (
                  <p className='text-muted-foreground text-[10.5px]'>
                    Efek/Keluhan: {c.problems || c.sideEffects}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
