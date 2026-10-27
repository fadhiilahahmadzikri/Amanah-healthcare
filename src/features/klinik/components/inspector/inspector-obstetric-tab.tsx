'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { useMaternalCatalogs } from '../../model/useMaternalCatalogs';
import type { InspectorTabProps, PreviousPregnancyEntry, ContraceptiveHistoryEntry } from './types';

const FALLBACK_SEXES = ['Laki-laki', 'Perempuan'];
const FALLBACK_DELIVERY_METHODS = [
  'Normal / Spontan',
  'Sectio Caesarea (SC)',
  'Vakum',
  'Forsep',
  'Lainnya'
];
const FALLBACK_DELIVERY_PLACES = [
  'Praktik Mandiri Bidan (PMB)',
  'Puskesmas',
  'Klinik',
  'Rumah Sakit',
  'Rumah Sendiri',
  'Lainnya'
];
const FALLBACK_ATTENDANTS = ['Bidan', 'Dokter Spesialis Obgyn', 'Dokter Umum', 'Tenaga Lainnya'];
const FALLBACK_CONTRACEPTIVES = [
  'Suntik 1 Bulan',
  'Suntik 3 Bulan',
  'Pil KB',
  'IUD / AKDR (Spiral)',
  'Implan / Susuk',
  'Kondom',
  'MOW / Tubektomi',
  'MOP / Vasektomi',
  'MAL (Metode Amenore Laktasi)',
  'Kalender / Alami',
  'Lainnya'
];

export function InspectorObstetricTab({
  data,
  isEditing = false,
  formData,
  onFieldChange,
  onNestedArrayChange,
  onAddNestedItem,
  onRemoveNestedItem
}: InspectorTabProps) {
  const { catalogs } = useMaternalCatalogs();
  const { answers, maternal } = data;

  const childSexes = catalogs.childSexChoices?.length ? catalogs.childSexChoices : FALLBACK_SEXES;
  const deliveryMethods = catalogs.deliveryMethodChoices?.length
    ? catalogs.deliveryMethodChoices
    : FALLBACK_DELIVERY_METHODS;
  const deliveryPlaces = catalogs.deliveryPlaceChoices?.length
    ? catalogs.deliveryPlaceChoices
    : FALLBACK_DELIVERY_PLACES;
  const birthAttendants = catalogs.birthAttendantChoices?.length
    ? catalogs.birthAttendantChoices
    : FALLBACK_ATTENDANTS;
  const contraceptiveTypes = catalogs.contraceptiveTypeChoices?.length
    ? catalogs.contraceptiveTypeChoices
    : FALLBACK_CONTRACEPTIVES;

  // GPA values
  const gravida =
    formData?.gravidaCount ??
    maternal?.gravidaCount ??
    (answers.gravidaCount ? Number(answers.gravidaCount) : 1);
  const partus =
    formData?.parityCount ??
    maternal?.parityCount ??
    (answers.parityCount || answers.partusCount
      ? Number(answers.parityCount || answers.partusCount)
      : 0);
  const abortus =
    formData?.abortionCount ??
    maternal?.abortionCount ??
    (answers.abortionCount || answers.abortusCount
      ? Number(answers.abortionCount || answers.abortusCount)
      : 0);
  const living =
    formData?.livingChildrenCount ??
    maternal?.livingChildrenCount ??
    (answers.livingChildrenCount ? Number(answers.livingChildrenCount) : 0);
  const gpaCode = `G${gravida} P${partus} A${abortus} Ah${living}`;

  // Previous Pregnancies List
  const prevPregnancies: PreviousPregnancyEntry[] = React.useMemo(() => {
    if (formData?.previousPregnancies) {
      return formData.previousPregnancies;
    }
    if (maternal?.previousPregnancies && maternal.previousPregnancies.length > 0) {
      return maternal.previousPregnancies;
    }
    const list: PreviousPregnancyEntry[] = [];
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
    return list;
  }, [formData?.previousPregnancies, maternal?.previousPregnancies, answers]);

  // Contraceptive Histories List
  const kbList: ContraceptiveHistoryEntry[] = React.useMemo(() => {
    if (formData?.contraceptiveHistories) {
      return formData.contraceptiveHistories;
    }
    if (maternal?.contraceptiveHistories && maternal.contraceptiveHistories.length > 0) {
      return maternal.contraceptiveHistories;
    }
    const list: ContraceptiveHistoryEntry[] = [];
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
    return list;
  }, [formData?.contraceptiveHistories, maternal?.contraceptiveHistories, answers]);

  // Active indices for sidebar navigation
  const [selectedPregnancyIdx, setSelectedPregnancyIdx] = React.useState<number>(0);
  const [selectedKbIdx, setSelectedKbIdx] = React.useState<number>(0);

  // Keep selection bounded
  React.useEffect(() => {
    if (selectedPregnancyIdx >= prevPregnancies.length && prevPregnancies.length > 0) {
      setSelectedPregnancyIdx(prevPregnancies.length - 1);
    }
  }, [prevPregnancies.length, selectedPregnancyIdx]);

  React.useEffect(() => {
    if (selectedKbIdx >= kbList.length && kbList.length > 0) {
      setSelectedKbIdx(kbList.length - 1);
    }
  }, [kbList.length, selectedKbIdx]);

  const activePregnancy = prevPregnancies[selectedPregnancyIdx];
  const activeKb = kbList[selectedKbIdx];

  const handleAddPregnancy = () => {
    if (!onAddNestedItem) return;
    const nextOrder = prevPregnancies.length + 1;
    onAddNestedItem('previousPregnancies', {
      orderNumber: nextOrder,
      birthYear: String(new Date().getFullYear()),
      birthWeightGrams: 3000,
      birthLengthCm: 49,
      childSex: 'Laki-laki',
      gestationalAgeAtBirth: '39 minggu',
      deliveryMethod: 'Normal / Spontan',
      birthAttendant: 'Bidan',
      deliveryPlace: 'Praktik Mandiri Bidan (PMB)',
      complications: 'Tidak ada'
    });
    setSelectedPregnancyIdx(prevPregnancies.length);
  };

  const handleAddKb = () => {
    if (!onAddNestedItem) return;
    const nextOrder = kbList.length + 1;
    onAddNestedItem('contraceptiveHistories', {
      orderNumber: nextOrder,
      contraceptiveType: 'Suntik 3 Bulan',
      startDate: '',
      stopDate: '',
      durationText: '1 tahun',
      problems: 'Tidak ada',
      sideEffects: 'Tidak ada'
    });
    setSelectedKbIdx(kbList.length);
  };

  return (
    <div className='space-y-6 pt-1 select-text'>
      {/* Bagian 1: Ringkasan Status Obstetri (GPA) */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between pb-1 border-b border-border/40'>
          <span className='text-xs font-semibold text-muted-foreground block'>
            Status Obstetri (GPA)
          </span>
          <span className='text-xs font-mono font-semibold text-primary'>{gpaCode}</span>
        </div>

        {isEditing ? (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-foreground'>
                Gravida (G - Total Hamil)
              </Label>
              <Input
                type='number'
                min={1}
                value={gravida}
                onChange={(e) => onFieldChange?.('gravidaCount', parseInt(e.target.value, 10) || 1)}
                className='h-8 text-xs font-mono'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-foreground'>Partus (P - Melahirkan)</Label>
              <Input
                type='number'
                min={0}
                value={partus}
                onChange={(e) => onFieldChange?.('parityCount', parseInt(e.target.value, 10) || 0)}
                className='h-8 text-xs font-mono'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-foreground'>Abortus (A - Keguguran)</Label>
              <Input
                type='number'
                min={0}
                value={abortus}
                onChange={(e) =>
                  onFieldChange?.('abortionCount', parseInt(e.target.value, 10) || 0)
                }
                className='h-8 text-xs font-mono'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-foreground'>Anak Hidup (Ah)</Label>
              <Input
                type='number'
                min={0}
                value={living}
                onChange={(e) =>
                  onFieldChange?.('livingChildrenCount', parseInt(e.target.value, 10) || 0)
                }
                className='h-8 text-xs font-mono'
              />
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            <PatientLineInput id='gpa-g' label='Gravida (G)' value={`${gravida} Kali`} readOnly />
            <PatientLineInput id='gpa-p' label='Partus (P)' value={`${partus} Kali`} readOnly />
            <PatientLineInput id='gpa-a' label='Abortus (A)' value={`${abortus} Kali`} readOnly />
            <PatientLineInput
              id='gpa-l'
              label='Anak Hidup (Ah)'
              value={`${living} Orang`}
              readOnly
            />
          </div>
        )}
      </div>

      {/* Bagian 2: Riwayat Persalinan Sebelumnya (Dengan Sub-Nav Sidebar Minimalis) */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between pb-1 border-b border-border/40'>
          <div className='space-y-0.5'>
            <span className='text-xs font-semibold text-foreground'>
              Riwayat Persalinan & Kehamilan Lalu
            </span>
            <p className='text-[11px] text-muted-foreground'>
              Data persalinan terdahulu ditampilkan secara kanonik 1:1 per anak.
            </p>
          </div>
          <Badge variant='outline' className='text-xs font-medium'>
            {prevPregnancies.length} Tercatat
          </Badge>
        </div>

        {prevPregnancies.length === 0 ? (
          <div className='p-4 rounded-lg border border-dashed border-border/60 bg-muted/10 text-center space-y-2'>
            <p className='text-xs text-muted-foreground'>
              Kehamilan Pertama / Primigravida (Tidak ada riwayat persalinan sebelumnya).
            </p>
            {isEditing && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddPregnancy}
                className='h-7.5 text-xs'
              >
                <Icons.plus className='size-3.5 mr-1.5' /> Tambah Riwayat Anak
              </Button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
            {/* Sidebar Daftar Riwayat Persalinan (Minimalis) */}
            <div className='md:col-span-4 border border-border/40 rounded-lg p-2.5 bg-muted/10 space-y-2'>
              <div className='flex items-center justify-between px-1 pb-1 border-b border-border/30'>
                <span className='text-[11px] font-semibold text-muted-foreground'>
                  Daftar Riwayat
                </span>
                {isEditing && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    onClick={handleAddPregnancy}
                    className='size-6 text-primary hover:bg-primary/10'
                    title='Tambah Riwayat'
                  >
                    <Icons.plus className='size-3.5' />
                  </Button>
                )}
              </div>

              <div className='space-y-1.5'>
                {prevPregnancies.map((p, idx) => {
                  const isSelected = idx === selectedPregnancyIdx;
                  return (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => setSelectedPregnancyIdx(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-all text-xs font-medium ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-background hover:bg-muted/40 text-foreground border border-border/30'
                      }`}
                    >
                      <div className='truncate'>
                        <span className='block font-semibold'>
                          Anak Ke-{p.orderNumber || idx + 1}
                        </span>
                        <span
                          className={`text-[11px] block truncate ${
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          Tahun {p.birthYear || '-'} • {p.childSex || '-'}
                        </span>
                      </div>
                      <Icons.chevronRight className='size-3.5 shrink-0 opacity-70 ml-2' />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel Detail Kanonik untuk Riwayat yang Aktif */}
            <div className='md:col-span-8 border border-border/40 rounded-lg p-4 bg-background space-y-4'>
              {activePregnancy && (
                <>
                  <div className='flex items-center justify-between pb-2 border-b border-border/30'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='text-xs font-bold'>
                        Anak Ke-{activePregnancy.orderNumber || selectedPregnancyIdx + 1}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        Kelahiran Tahun {activePregnancy.birthYear || '-'}
                      </span>
                    </div>

                    {isEditing && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          onRemoveNestedItem?.('previousPregnancies', selectedPregnancyIdx)
                        }
                        className='h-7 px-2 text-destructive hover:bg-destructive/10 text-xs'
                      >
                        <Icons.trash className='size-3.5 mr-1' /> Hapus
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className='space-y-3.5'>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Tahun Lahir</Label>
                          <Input
                            value={activePregnancy.birthYear || ''}
                            onChange={(e) =>
                              onNestedArrayChange?.(
                                'previousPregnancies',
                                selectedPregnancyIdx,
                                'birthYear',
                                e.target.value
                              )
                            }
                            placeholder='YYYY'
                            className='h-8 text-xs font-mono'
                          />
                        </div>

                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Jenis Kelamin</Label>
                          <Select
                            value={activePregnancy.childSex || ''}
                            onValueChange={(val) =>
                              onNestedArrayChange?.(
                                'previousPregnancies',
                                selectedPregnancyIdx,
                                'childSex',
                                val
                              )
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue placeholder='Pilih JK' />
                            </SelectTrigger>
                            <SelectContent>
                              {childSexes.map((s) => (
                                <SelectItem key={s} value={s} className='text-xs'>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* BB Lahir dan TB Lahir Terpisah Secara Kanonik */}
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Berat Lahir Bayi (gram)</Label>
                          <Input
                            type='number'
                            value={activePregnancy.birthWeightGrams ?? ''}
                            onChange={(e) =>
                              onNestedArrayChange?.(
                                'previousPregnancies',
                                selectedPregnancyIdx,
                                'birthWeightGrams',
                                e.target.value ? parseInt(e.target.value, 10) : ''
                              )
                            }
                            placeholder='Contoh: 3100'
                            className='h-8 text-xs font-mono'
                          />
                        </div>

                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Panjang Lahir Bayi (cm)</Label>
                          <Input
                            type='number'
                            step='0.1'
                            value={activePregnancy.birthLengthCm ?? ''}
                            onChange={(e) =>
                              onNestedArrayChange?.(
                                'previousPregnancies',
                                selectedPregnancyIdx,
                                'birthLengthCm',
                                e.target.value
                              )
                            }
                            placeholder='Contoh: 49'
                            className='h-8 text-xs font-mono'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Usia Kehamilan Saat Lahir</Label>
                          <Input
                            value={activePregnancy.gestationalAgeAtBirth || ''}
                            onChange={(e) =>
                              onNestedArrayChange?.(
                                'previousPregnancies',
                                selectedPregnancyIdx,
                                'gestationalAgeAtBirth',
                                e.target.value
                              )
                            }
                            placeholder='Contoh: 39 minggu'
                            className='h-8 text-xs'
                          />
                        </div>

                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Cara Persalinan</Label>
                          <Select
                            value={activePregnancy.deliveryMethod || ''}
                            onValueChange={(val) =>
                              onNestedArrayChange?.(
                                'previousPregnancies',
                                selectedPregnancyIdx,
                                'deliveryMethod',
                                val
                              )
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue placeholder='Pilih metode' />
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryMethods.map((m) => (
                                <SelectItem key={m} value={m} className='text-xs'>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Penolong Persalinan</Label>
                          <Select
                            value={activePregnancy.birthAttendant || ''}
                            onValueChange={(val) =>
                              onNestedArrayChange?.(
                                'previousPregnancies',
                                selectedPregnancyIdx,
                                'birthAttendant',
                                val
                              )
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue placeholder='Pilih penolong' />
                            </SelectTrigger>
                            <SelectContent>
                              {birthAttendants.map((a) => (
                                <SelectItem key={a} value={a} className='text-xs'>
                                  {a}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Tempat Persalinan</Label>
                          <Select
                            value={activePregnancy.deliveryPlace || ''}
                            onValueChange={(val) =>
                              onNestedArrayChange?.(
                                'previousPregnancies',
                                selectedPregnancyIdx,
                                'deliveryPlace',
                                val
                              )
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue placeholder='Pilih tempat' />
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryPlaces.map((p) => (
                                <SelectItem key={p} value={p} className='text-xs'>
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Komplikasi / Masalah</Label>
                        <Input
                          value={activePregnancy.complications || ''}
                          onChange={(e) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'complications',
                              e.target.value
                            )
                          }
                          placeholder='Tuliskan jika ada komplikasi, atau Tidak ada'
                          className='h-8 text-xs'
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`prev-year-${selectedPregnancyIdx}`}
                          label='Tahun Lahir'
                          value={activePregnancy.birthYear || '-'}
                          isMonospace
                          readOnly
                        />
                        <PatientLineInput
                          id={`prev-sex-${selectedPregnancyIdx}`}
                          label='Jenis Kelamin'
                          value={activePregnancy.childSex || '-'}
                          readOnly
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`prev-weight-${selectedPregnancyIdx}`}
                          label='Berat Badan Lahir'
                          value={
                            activePregnancy.birthWeightGrams
                              ? `${activePregnancy.birthWeightGrams} gram`
                              : '-'
                          }
                          isMonospace
                          readOnly
                        />
                        <PatientLineInput
                          id={`prev-length-${selectedPregnancyIdx}`}
                          label='Panjang Badan Lahir'
                          value={
                            activePregnancy.birthLengthCm
                              ? `${activePregnancy.birthLengthCm} cm`
                              : '-'
                          }
                          isMonospace
                          readOnly
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`prev-uk-${selectedPregnancyIdx}`}
                          label='Usia Kehamilan Saat Lahir'
                          value={activePregnancy.gestationalAgeAtBirth || '-'}
                          readOnly
                        />
                        <PatientLineInput
                          id={`prev-method-${selectedPregnancyIdx}`}
                          label='Cara Persalinan'
                          value={activePregnancy.deliveryMethod || '-'}
                          readOnly
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`prev-attendant-${selectedPregnancyIdx}`}
                          label='Penolong Persalinan'
                          value={activePregnancy.birthAttendant || '-'}
                          readOnly
                        />
                        <PatientLineInput
                          id={`prev-place-${selectedPregnancyIdx}`}
                          label='Tempat Persalinan'
                          value={activePregnancy.deliveryPlace || '-'}
                          readOnly
                        />
                      </div>

                      <PatientLineInput
                        id={`prev-complications-${selectedPregnancyIdx}`}
                        label='Komplikasi Persalinan'
                        value={activePregnancy.complications || 'Tidak ada komplikasi'}
                        readOnly
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bagian 3: Riwayat Kontrasepsi / KB (Dengan Sub-Nav Sidebar Minimalis) */}
      <div className='space-y-3 pt-2'>
        <div className='flex items-center justify-between pb-1 border-b border-border/40'>
          <div className='space-y-0.5'>
            <span className='text-xs font-semibold text-foreground'>
              Riwayat Pemakaian Kontrasepsi / KB
            </span>
            <p className='text-[11px] text-muted-foreground'>
              Metode kontrasepsi yang pernah digunakan sebelum kehamilan saat ini.
            </p>
          </div>
          <Badge variant='outline' className='text-xs font-medium'>
            {kbList.length} Metode Tercatat
          </Badge>
        </div>

        {kbList.length === 0 ? (
          <div className='p-4 rounded-lg border border-dashed border-border/60 bg-muted/10 text-center space-y-2'>
            <p className='text-xs text-muted-foreground'>
              Belum pernah menggunakan alat atau metode kontrasepsi sebelumnya.
            </p>
            {isEditing && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddKb}
                className='h-7.5 text-xs'
              >
                <Icons.plus className='size-3.5 mr-1.5' /> Tambah Riwayat KB
              </Button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
            {/* Sidebar Daftar Riwayat KB */}
            <div className='md:col-span-4 border border-border/40 rounded-lg p-2.5 bg-muted/10 space-y-2'>
              <div className='flex items-center justify-between px-1 pb-1 border-b border-border/30'>
                <span className='text-[11px] font-semibold text-muted-foreground'>
                  Daftar Metode KB
                </span>
                {isEditing && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    onClick={handleAddKb}
                    className='size-6 text-primary hover:bg-primary/10'
                    title='Tambah KB'
                  >
                    <Icons.plus className='size-3.5' />
                  </Button>
                )}
              </div>

              <div className='space-y-1.5'>
                {kbList.map((c, idx) => {
                  const isSelected = idx === selectedKbIdx;
                  return (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => setSelectedKbIdx(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-all text-xs font-medium ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-background hover:bg-muted/40 text-foreground border border-border/30'
                      }`}
                    >
                      <div className='truncate'>
                        <span className='block font-semibold'>
                          {c.contraceptiveType || `KB #${idx + 1}`}
                        </span>
                        <span
                          className={`text-[11px] block truncate ${
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          Durasi: {c.durationText || '-'}
                        </span>
                      </div>
                      <Icons.chevronRight className='size-3.5 shrink-0 opacity-70 ml-2' />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel Detail Kanonik untuk Riwayat KB yang Aktif */}
            <div className='md:col-span-8 border border-border/40 rounded-lg p-4 bg-background space-y-4'>
              {activeKb && (
                <>
                  <div className='flex items-center justify-between pb-2 border-b border-border/30'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='text-xs font-bold'>
                        {activeKb.contraceptiveType || `KB #${selectedKbIdx + 1}`}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        Durasi: {activeKb.durationText || '-'}
                      </span>
                    </div>

                    {isEditing && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          onRemoveNestedItem?.('contraceptiveHistories', selectedKbIdx)
                        }
                        className='h-7 px-2 text-destructive hover:bg-destructive/10 text-xs'
                      >
                        <Icons.trash className='size-3.5 mr-1' /> Hapus
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className='space-y-3.5'>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Jenis KB / Kontrasepsi</Label>
                          <Select
                            value={activeKb.contraceptiveType || ''}
                            onValueChange={(val) =>
                              onNestedArrayChange?.(
                                'contraceptiveHistories',
                                selectedKbIdx,
                                'contraceptiveType',
                                val
                              )
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue placeholder='Pilih metode' />
                            </SelectTrigger>
                            <SelectContent>
                              {contraceptiveTypes.map((k) => (
                                <SelectItem key={k} value={k} className='text-xs'>
                                  {k}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Lama Pemakaian</Label>
                          <Input
                            value={activeKb.durationText || ''}
                            onChange={(e) =>
                              onNestedArrayChange?.(
                                'contraceptiveHistories',
                                selectedKbIdx,
                                'durationText',
                                e.target.value
                              )
                            }
                            placeholder='Contoh: 2 tahun'
                            className='h-8 text-xs'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Tanggal Mulai Pakai</Label>
                          <CustomDatePicker
                            value={activeKb.startDate || ''}
                            onChange={(val) =>
                              onNestedArrayChange?.(
                                'contraceptiveHistories',
                                selectedKbIdx,
                                'startDate',
                                val
                              )
                            }
                            placeholder='YYYY-MM-DD'
                            triggerClassName='h-8 text-xs font-mono'
                            disableFutureDates
                          />
                        </div>

                        <div className='space-y-1'>
                          <Label className='text-xs font-medium'>Tanggal Berhenti / Lepas</Label>
                          <CustomDatePicker
                            value={activeKb.stopDate || ''}
                            onChange={(val) =>
                              onNestedArrayChange?.(
                                'contraceptiveHistories',
                                selectedKbIdx,
                                'stopDate',
                                val
                              )
                            }
                            placeholder='YYYY-MM-DD'
                            triggerClassName='h-8 text-xs font-mono'
                            disableFutureDates
                          />
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Masalah / Keluhan Pemakaian</Label>
                        <Textarea
                          value={activeKb.problems || ''}
                          onChange={(e) =>
                            onNestedArrayChange?.(
                              'contraceptiveHistories',
                              selectedKbIdx,
                              'problems',
                              e.target.value
                            )
                          }
                          placeholder='Tuliskan keluhan atau Tidak ada'
                          rows={2}
                          className='text-xs resize-none'
                        />
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs font-medium'>Efek Samping Yang Dialami</Label>
                        <Textarea
                          value={activeKb.sideEffects || ''}
                          onChange={(e) =>
                            onNestedArrayChange?.(
                              'contraceptiveHistories',
                              selectedKbIdx,
                              'sideEffects',
                              e.target.value
                            )
                          }
                          placeholder='Tuliskan efek samping atau Tidak ada'
                          rows={2}
                          className='text-xs resize-none'
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`kb-type-${selectedKbIdx}`}
                          label='Jenis Kontrasepsi'
                          value={activeKb.contraceptiveType || '-'}
                          readOnly
                        />
                        <PatientLineInput
                          id={`kb-duration-${selectedKbIdx}`}
                          label='Lama Pemakaian'
                          value={activeKb.durationText || '-'}
                          readOnly
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`kb-start-${selectedKbIdx}`}
                          label='Tanggal Mulai'
                          value={activeKb.startDate || '-'}
                          isMonospace
                          readOnly
                        />
                        <PatientLineInput
                          id={`kb-stop-${selectedKbIdx}`}
                          label='Tanggal Berhenti'
                          value={activeKb.stopDate || '-'}
                          isMonospace
                          readOnly
                        />
                      </div>

                      <PatientLineInput
                        id={`kb-problems-${selectedKbIdx}`}
                        label='Masalah / Keluhan'
                        value={activeKb.problems || 'Tidak ada'}
                        readOnly
                      />

                      <PatientLineInput
                        id={`kb-side-effects-${selectedKbIdx}`}
                        label='Efek Samping'
                        value={activeKb.sideEffects || 'Tidak ada'}
                        readOnly
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
