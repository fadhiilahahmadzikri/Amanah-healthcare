'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useVaccineCatalog } from '../../model/useVaccineCatalog';
import { calculateChildAge } from '../../utils/medical-appointment';
import type { InspectorTabProps } from './types';

export function InspectorImmunizationTab({ appointment, data }: InspectorTabProps) {
  const { child, answers, automatic } = data;
  const { vaccines } = useVaccineCatalog();

  const childName = child?.childName || answers.childName || appointment.patient_name || '-';
  const childNik = child?.childNik || answers.childNik || '-';
  const birthDate = child?.childBirthDate || answers.childBirthDate || '-';
  const childSex = child?.childSex || answers.childSex || '-';
  let childAge =
    child?.childAgeFormatted || answers.childAgeFormatted || automatic.childAgeAtSubmit;
  if (!childAge && birthDate && birthDate !== '-') {
    try {
      childAge = calculateChildAge(birthDate);
    } catch {
      childAge = '-';
    }
  }
  if (!childAge) childAge = '-';
  const parentPhone = child?.parentPhone || answers.parentPhone || appointment.patient_phone || '-';
  const fatherName = child?.fatherName || answers.fatherName || '-';
  const motherName = child?.motherName || answers.motherName || '-';
  const address = child?.childAddress || answers.childAddress || '-';

  const relationalEntries: any[] = child?.entries || answers?.entries || [];

  const hasVaccineHistory =
    answers.hasVaccineHistory ||
    child?.hasVaccineHistory ||
    (relationalEntries.length > 0
      ? 'Ya, pernah'
      : child?.previousVaccineHistory &&
          child.previousVaccineHistory !== 'Belum pernah imunisasi sama sekali'
        ? 'Ya, pernah'
        : 'Belum pernah sama sekali');
  const previousVaccineHistory =
    child?.previousVaccineHistory ||
    answers.previousVaccineHistory ||
    'Belum ada catatan ringkasan vaksinasi.';

  const hasAllergyHistory =
    answers.hasAllergyHistory ||
    child?.hasAllergyHistory ||
    (child?.childAllergyHistory && child.childAllergyHistory !== 'Tidak ada riwayat alergi.'
      ? 'Ada riwayat alergi'
      : 'Tidak ada alergi');
  const childAllergyHistory =
    child?.childAllergyHistory ||
    answers.childAllergyHistory ||
    (hasAllergyHistory === 'Ada riwayat alergi'
      ? 'Riwayat alergi tercatat.'
      : 'Tidak ada riwayat alergi.');

  return (
    <Tabs defaultValue='identitas' className='w-full flex flex-col h-full'>
      <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer'>
          Identitas Anak
        </TabsTrigger>
        <TabsTrigger value='orang-tua' className='text-xs font-semibold cursor-pointer'>
          Orang Tua & Alamat
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
                Tanggal Lahir Anak
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {birthDate}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Jenis Kelamin Anak
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {childSex}
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
                Nomor HP Orang Tua/Wali
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {parentPhone}
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='orang-tua' className='m-0 outline-none'>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Nama Ayah
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {fatherName}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Nama Ibu
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {motherName}
              </span>
            </div>

            <div className='col-span-2 border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Alamat Tempat Tinggal
              </span>
              <p className='text-sm font-medium text-foreground leading-relaxed'>{address}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='vaksin' className='m-0 outline-none'>
          <div className='flex flex-col gap-3'>
            <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
              <span className='text-xs font-normal text-muted-foreground block mb-1'>
                Apakah si kecil pernah mendapat imunisasi sebelumnya?
              </span>
              <Badge variant={hasVaccineHistory === 'Ya, pernah' ? 'default' : 'secondary'}>
                {hasVaccineHistory}
              </Badge>
            </div>

            {hasVaccineHistory === 'Ya, pernah' ? (
              <div className='rounded-lg border border-border/60 p-3 bg-card'>
                <span className='text-xs font-bold text-foreground block mb-2'>
                  Daftar Riwayat Vaksinasi Anak
                </span>
                <div className='divide-y divide-border/40'>
                  {vaccines.map((vaccine) => {
                    const code = vaccine.code || vaccine.id;
                    const relationalEntry = relationalEntries.find(
                      (e) => (e.vaccineCode || e.vaccine_code) === code
                    );
                    const status = relationalEntry
                      ? relationalEntry.status === 'GIVEN'
                        ? 'Sudah'
                        : relationalEntry.status === 'NOT_GIVEN'
                          ? 'Belum'
                          : 'Tidak tahu'
                      : answers[`vaccine_${code}_status`];
                    const date = relationalEntry
                      ? relationalEntry.givenDate || relationalEntry.given_date
                      : answers[`vaccine_${code}_date`];

                    return (
                      <div
                        key={vaccine.id || code}
                        className='flex items-center justify-between py-2 text-xs'
                      >
                        <div className='flex items-center gap-2 min-w-0 pr-2'>
                          <span className='font-semibold text-foreground truncate'>
                            {vaccine.name}
                          </span>
                          {vaccine.ageMilestone ? (
                            <span className='text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded'>
                              {vaccine.ageMilestone}
                            </span>
                          ) : null}
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
                  {relationalEntries
                    .filter(
                      (entry) =>
                        !vaccines.some(
                          (v) => (v.code || v.id) === (entry.vaccineCode || entry.vaccine_code)
                        )
                    )
                    .map((entry) => {
                      const code = entry.vaccineCode || entry.vaccine_code;
                      const isGiven = entry.status === 'GIVEN';
                      const isNotGiven = entry.status === 'NOT_GIVEN';
                      const dateDisplay =
                        entry.givenDate || entry.given_date
                          ? `(${entry.givenDate || entry.given_date})`
                          : '';

                      return (
                        <div key={entry.id || code} className='flex items-center justify-between py-2 text-xs'>
                          <div className='flex items-center gap-2 min-w-0 pr-2'>
                            <span className='font-semibold text-foreground truncate'>{code}</span>
                          </div>

                          <div className='flex items-center gap-2 shrink-0'>
                            {isGiven ? (
                              <Badge
                                variant='default'
                                className='text-[10px] h-5 px-1.5 bg-emerald-600 hover:bg-emerald-600 text-white'
                              >
                                Sudah {dateDisplay}
                              </Badge>
                            ) : isNotGiven ? (
                              <Badge
                                variant='outline'
                                className='text-[10px] h-5 px-1.5 text-muted-foreground'
                              >
                                Belum
                              </Badge>
                            ) : (
                              <Badge variant='secondary' className='text-[10px] h-5 px-1.5'>
                                Tidak tahu
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className='rounded-lg border border-border/60 p-4 bg-muted/10 text-center'>
                <p className='text-xs text-muted-foreground font-medium'>
                  Si kecil belum pernah mendapat imunisasi sebelumnya.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='alergi' className='m-0 outline-none'>
          <div className='flex flex-col gap-3'>
            <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
              <span className='text-xs font-normal text-muted-foreground block mb-1'>
                Apakah anak memiliki riwayat alergi?
              </span>
              <Badge
                variant={hasAllergyHistory === 'Ada riwayat alergi' ? 'destructive' : 'secondary'}
              >
                {hasAllergyHistory}
              </Badge>
            </div>

            {hasAllergyHistory === 'Ada riwayat alergi' ? (
              <div className='rounded-lg border border-border/60 p-3 bg-card'>
                <span className='text-xs font-bold text-foreground block mb-1'>
                  Detail Catatan Alergi
                </span>
                <p className='text-sm text-foreground leading-relaxed'>{childAllergyHistory}</p>
              </div>
            ) : (
              <div className='rounded-lg border border-border/60 p-4 bg-muted/10 text-center'>
                <p className='text-xs text-muted-foreground font-medium'>
                  Tidak ada riwayat alergi yang dilaporkan untuk anak ini.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
