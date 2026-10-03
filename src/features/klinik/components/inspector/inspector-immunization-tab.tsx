'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CORE_VACCINE_LIST } from '../../constants/kia-constants';
import type { InspectorTabProps } from './types';

export function InspectorImmunizationTab({ appointment, data }: InspectorTabProps) {
  const { child, answers, automatic } = data;

  const childName = child?.childName || answers.childName || appointment.patient_name || '-';
  const childNik = child?.childNik || answers.childNik || '-';
  const birthDate = child?.childBirthDate || answers.childBirthDate || '-';
  const childSex = child?.childSex || answers.childSex || '-';
  const childAge =
    child?.childAgeFormatted || answers.childAgeFormatted || automatic.childAgeAtSubmit || '-';
  const parentPhone = child?.parentPhone || answers.parentPhone || appointment.patient_phone || '-';
  const fatherName = child?.fatherName || answers.fatherName || '-';
  const motherName = child?.motherName || answers.motherName || '-';
  const address = child?.childAddress || answers.childAddress || '-';

  const hasVaccineHistory =
    answers.hasVaccineHistory || (child?.previousVaccineHistory ? 'Ya, pernah' : '-');
  const previousVaccineHistory =
    child?.previousVaccineHistory ||
    answers.previousVaccineHistory ||
    'Belum ada catatan ringkasan vaksinasi.';
  const otherVaccinesNote = answers.otherVaccinesNote || '-';

  const hasAllergyHistory =
    answers.hasAllergyHistory ||
    (child?.childAllergyHistory ? 'Ada riwayat alergi' : 'Tidak ada alergi');
  const childAllergyHistory =
    child?.childAllergyHistory || answers.childAllergyHistory || 'Tidak ada riwayat alergi.';

  return (
    <Tabs defaultValue='identitas' className='w-full flex flex-col h-full'>
      <TabsList className='grid grid-cols-3 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer'>
          Identitas Anak
        </TabsTrigger>
        <TabsTrigger value='vaksin' className='text-xs font-semibold cursor-pointer'>
          Riwayat Vaksin
        </TabsTrigger>
        <TabsTrigger value='alergi' className='text-xs font-semibold cursor-pointer'>
          Riwayat Alergi
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
        <TabsContent value='identitas' className='m-0 outline-none'>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Nama Lengkap Anak
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {childName}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                NIK Anak
              </span>
              <span className='text-sm font-semibold font-mono text-foreground block truncate'>
                {childNik}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Tanggal Lahir / Kelamin
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {birthDate} ({childSex})
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Usia Saat Pendaftaran
              </span>
              <span className='text-sm font-bold font-mono text-primary block truncate'>
                {childAge}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                No. HP Orang Tua / Wali
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {parentPhone}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Orang Tua (Ayah / Ibu)
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {fatherName} / {motherName}
              </span>
            </div>

            <div className='col-span-2 border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Alamat Domisili
              </span>
              <p className='text-sm font-medium text-foreground leading-relaxed'>{address}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='vaksin' className='m-0 outline-none'>
          <div className='flex flex-col gap-3'>
            <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
              <span className='text-xs font-normal text-muted-foreground block mb-1'>
                Pernah Mendapat Imunisasi Sebelumnya?
              </span>
              <Badge variant={hasVaccineHistory === 'Ya, pernah' ? 'default' : 'secondary'}>
                {hasVaccineHistory}
              </Badge>
            </div>

            <div className='rounded-lg border border-border/60 p-3 bg-card'>
              <span className='text-xs font-bold text-foreground block mb-2'>
                Checklist Riwayat Vaksinasi
              </span>
              <div className='divide-y divide-border/40'>
                {CORE_VACCINE_LIST.map((vaccine) => {
                  const statusKey = `vaccine_${vaccine.id}_status`;
                  const dateKey = `vaccine_${vaccine.id}_date`;
                  const status = answers[statusKey];
                  const date = answers[dateKey];

                  return (
                    <div
                      key={vaccine.id}
                      className='flex items-center justify-between py-2 text-xs'
                    >
                      <div className='flex items-center gap-2 min-w-0 pr-2'>
                        <span className='font-semibold text-foreground truncate'>
                          {vaccine.name}
                        </span>
                        <span className='text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded'>
                          {vaccine.ageGroup}
                        </span>
                      </div>

                      <div className='flex items-center gap-2 shrink-0'>
                        {status === 'Sudah' ? (
                          <Badge
                            variant='default'
                            className='text-[10px] h-5 px-1.5 bg-emerald-600 hover:bg-emerald-600 text-white'
                          >
                            Sudah {date ? `(${date})` : ''}
                          </Badge>
                        ) : status === 'Belum' ? (
                          <Badge
                            variant='outline'
                            className='text-[10px] h-5 px-1.5 text-muted-foreground'
                          >
                            Belum
                          </Badge>
                        ) : status === 'Tidak tahu' ? (
                          <Badge variant='secondary' className='text-[10px] h-5 px-1.5'>
                            Tidak tahu
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground text-[11px]'>-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {otherVaccinesNote && otherVaccinesNote !== '-' ? (
              <div className='rounded-lg border border-border/60 p-3 bg-muted/20'>
                <span className='text-xs font-bold text-foreground block mb-1'>
                  Imunisasi Lain / Catatan Tambahan
                </span>
                <p className='text-xs text-foreground leading-relaxed'>{otherVaccinesNote}</p>
              </div>
            ) : null}

            <div className='rounded-lg border border-border/60 p-3 bg-muted/10'>
              <span className='text-xs font-bold text-foreground block mb-1'>
                Ringkasan Terformat (SSOT Backend)
              </span>
              <p className='text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap'>
                {previousVaccineHistory}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='alergi' className='m-0 outline-none'>
          <div className='flex flex-col gap-3'>
            <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
              <span className='text-xs font-normal text-muted-foreground block mb-1'>
                Riwayat Alergi Anak
              </span>
              <Badge
                variant={hasAllergyHistory === 'Ada riwayat alergi' ? 'destructive' : 'secondary'}
              >
                {hasAllergyHistory}
              </Badge>
            </div>

            <div className='rounded-lg border border-border/60 p-3 bg-card'>
              <span className='text-xs font-bold text-foreground block mb-1'>
                Detail Catatan Alergi
              </span>
              <p className='text-sm text-foreground leading-relaxed'>{childAllergyHistory}</p>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
