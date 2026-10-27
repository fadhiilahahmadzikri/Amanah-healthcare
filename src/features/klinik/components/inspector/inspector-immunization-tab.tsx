'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { cn } from '@/lib/utils';
import { useVaccineCatalog } from '../../model/useVaccineCatalog';
import { calculateChildAge } from '../../utils/medical-appointment';
import type { InspectorTabProps } from './types';

const IMMUNIZATION_TABS = [
  { value: 'identitas', label: 'Identitas Anak' },
  { value: 'orang-tua', label: 'Orang Tua & Alamat' },
  { value: 'vaksin', label: 'Riwayat Vaksin' },
  { value: 'alergi', label: 'Riwayat Alergi' }
] as const;

export function InspectorImmunizationTab({ data }: InspectorTabProps) {
  const [activeTab, setActiveTab] = React.useState<string>('identitas');
  const { child } = data;
  const { vaccines } = useVaccineCatalog();

  const childName = child?.childName || '-';
  const childNik = child?.childNik || '-';
  const birthDate = child?.childBirthDate || '-';
  const childSex = child?.childSex || '-';
  let childAge = child?.childAgeFormatted;
  if (!childAge && birthDate && birthDate !== '-') {
    try {
      childAge = calculateChildAge(birthDate);
    } catch {
      childAge = '-';
    }
  }
  if (!childAge) childAge = '-';
  const parentPhone = child?.parentPhone || '-';
  const fatherName = child?.fatherName || '-';
  const motherName = child?.motherName || '-';
  const address = child?.childAddress || '-';

  const relationalEntries: any[] = child?.entries || [];

  const hasVaccineHistory =
    child?.hasVaccineHistory ||
    (relationalEntries.length > 0
      ? 'Ya, pernah'
      : child?.previousVaccineHistory &&
          child.previousVaccineHistory !== 'Belum pernah imunisasi sama sekali'
        ? 'Ya, pernah'
        : 'Belum pernah sama sekali');
  const previousVaccineHistory =
    child?.previousVaccineHistory || 'Belum ada catatan ringkasan vaksinasi.';

  const hasAllergyHistory =
    child?.hasAllergyHistory ||
    (child?.childAllergyHistory && child.childAllergyHistory !== 'Tidak ada riwayat alergi.'
      ? 'Ada riwayat alergi'
      : 'Tidak ada alergi');
  const childAllergyHistory =
    child?.childAllergyHistory ||
    (hasAllergyHistory === 'Ada riwayat alergi'
      ? 'Riwayat alergi tercatat.'
      : 'Tidak ada riwayat alergi.');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full flex flex-col h-full'>
      {/* Mobile Morevert Dropdown Navigation */}
      <div className='flex sm:hidden items-center justify-between p-2 mb-2.5 rounded-lg border border-border/60 bg-muted/30 shrink-0'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='text-xs font-bold text-foreground truncate'>
            {IMMUNIZATION_TABS.find((t) => t.value === activeTab)?.label || 'Identitas Anak'}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              shape='pill'
              className='size-7 shrink-0 text-foreground hover:bg-muted'
              aria-label='Pilih bagian formulir'
            >
              <Icons.ellipsis className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            {IMMUNIZATION_TABS.map((tab) => (
              <DropdownMenuItem
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center justify-between text-xs cursor-pointer',
                  activeTab === tab.value && 'font-bold text-primary bg-primary/10'
                )}
              >
                <span>{tab.label}</span>
                {activeTab === tab.value && <Icons.check className='size-3.5 text-primary' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Horizontal Tabs */}
      <TabsList className='hidden sm:grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        {IMMUNIZATION_TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className='text-xs font-semibold cursor-pointer'
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
        <TabsContent value='identitas' className='m-0 outline-none'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
            <div className='space-y-4'>
              <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                Identitas Anak
              </span>
              <PatientLineInput
                id='child-name'
                label='Nama Lengkap Anak'
                value={childName}
                readOnly
              />
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <PatientLineInput
                  id='child-nik'
                  label='NIK Anak'
                  value={childNik}
                  isMonospace
                  readOnly
                />
                <PatientLineInput id='child-sex' label='Jenis Kelamin' value={childSex} readOnly />
              </div>
            </div>

            <div className='space-y-4'>
              <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                Kelahiran & Kontak Wali
              </span>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <PatientLineInput
                  id='child-birthdate'
                  label='Tanggal Lahir Anak'
                  value={birthDate}
                  isMonospace
                  readOnly
                />
                <PatientLineInput
                  id='child-age'
                  label='Usia Saat Pendaftaran'
                  value={childAge}
                  readOnly
                />
              </div>
              <PatientLineInput
                id='child-parent-phone'
                label='Nomor HP Orang Tua/Wali'
                value={parentPhone}
                readOnly
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='orang-tua' className='m-0 outline-none'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
            <div className='space-y-4'>
              <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                Data Orang Tua / Wali
              </span>
              <PatientLineInput
                id='child-father-name'
                label='Nama Ayah'
                value={fatherName}
                readOnly
              />
              <PatientLineInput
                id='child-mother-name'
                label='Nama Ibu'
                value={motherName}
                readOnly
              />
            </div>

            <div className='space-y-4'>
              <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                Alamat Tinggal Keluarga
              </span>
              <PatientLineInput
                id='child-address'
                label='Alamat Tempat Tinggal'
                value={address}
                readOnly
              />
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
                    const code = vaccine.code;
                    const relationalEntry = relationalEntries.find((e) => e.vaccineCode === code);
                    const status = relationalEntry
                      ? relationalEntry.status === 'GIVEN'
                        ? 'Sudah'
                        : relationalEntry.status === 'NOT_GIVEN'
                          ? 'Belum'
                          : 'Tidak tahu'
                      : undefined;
                    const date = relationalEntry ? relationalEntry.givenDate : undefined;

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
                    .filter((entry) => !vaccines.some((v) => v.code === entry.vaccineCode))
                    .map((entry) => {
                      const code = entry.vaccineCode;
                      const isGiven = entry.status === 'GIVEN';
                      const isNotGiven = entry.status === 'NOT_GIVEN';
                      const dateDisplay = entry.givenDate ? `(${entry.givenDate})` : '';

                      return (
                        <div
                          key={entry.id || code}
                          className='flex items-center justify-between py-2 text-xs'
                        >
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
