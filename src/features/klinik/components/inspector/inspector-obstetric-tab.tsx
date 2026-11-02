'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { useMaternalCatalogs } from '../../model/useMaternalCatalogs';
import type { InspectorTabProps, PreviousPregnancyEntry, ContraceptiveHistoryEntry } from './types';

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

  const childSexes = catalogs.childSexChoices ?? [];
  const deliveryMethods = catalogs.deliveryMethodChoices ?? [];
  const deliveryPlaces = catalogs.deliveryPlaceChoices ?? [];
  const birthAttendants = catalogs.birthAttendantChoices ?? [];
  const contraceptiveTypes = catalogs.contraceptiveTypeChoices ?? [];

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
            <PatientLineInput
              id='gpa-g-edit'
              label='Gravida (G - Total Hamil)'
              type='number'
              min={1}
              value={String(gravida)}
              onChange={(val) => onFieldChange?.('gravidaCount', parseInt(val, 10) || 1)}
              isMonospace
            />
            <PatientLineInput
              id='gpa-p-edit'
              label='Partus (P - Melahirkan)'
              type='number'
              min={0}
              value={String(partus)}
              onChange={(val) => onFieldChange?.('parityCount', parseInt(val, 10) || 0)}
              isMonospace
            />
            <PatientLineInput
              id='gpa-a-edit'
              label='Abortus (A - Keguguran)'
              type='number'
              min={0}
              value={String(abortus)}
              onChange={(val) => onFieldChange?.('abortionCount', parseInt(val, 10) || 0)}
              isMonospace
            />
            <PatientLineInput
              id='gpa-l-edit'
              label='Anak Hidup (Ah)'
              type='number'
              min={0}
              value={String(living)}
              onChange={(val) => onFieldChange?.('livingChildrenCount', parseInt(val, 10) || 0)}
              isMonospace
            />
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
              Data persalinan terdahulu ditampilkan lengkap per anak.
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
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`prev-birthyear-${selectedPregnancyIdx}`}
                          label='Tahun Lahir'
                          value={activePregnancy.birthYear || ''}
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'birthYear',
                              val
                            )
                          }
                          placeholder='YYYY'
                          isMonospace
                        />

                        <PatientLineSelect
                          id={`prev-sex-${selectedPregnancyIdx}`}
                          label='Jenis Kelamin'
                          value={activePregnancy.childSex || ''}
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'childSex',
                              val
                            )
                          }
                          options={childSexes}
                          placeholder='Pilih JK'
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`prev-weight-${selectedPregnancyIdx}`}
                          label='Berat Lahir Bayi (gram)'
                          type='number'
                          value={
                            activePregnancy.birthWeightGrams
                              ? String(activePregnancy.birthWeightGrams)
                              : ''
                          }
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'birthWeightGrams',
                              val ? parseInt(val, 10) : ''
                            )
                          }
                          placeholder='Contoh: 3100'
                          isMonospace
                        />

                        <PatientLineInput
                          id={`prev-length-${selectedPregnancyIdx}`}
                          label='Panjang Lahir Bayi (cm)'
                          type='number'
                          step='0.1'
                          value={
                            activePregnancy.birthLengthCm
                              ? String(activePregnancy.birthLengthCm)
                              : ''
                          }
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'birthLengthCm',
                              val
                            )
                          }
                          placeholder='Contoh: 49'
                          isMonospace
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineInput
                          id={`prev-gestational-${selectedPregnancyIdx}`}
                          label='Usia Kehamilan Saat Lahir'
                          value={activePregnancy.gestationalAgeAtBirth || ''}
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'gestationalAgeAtBirth',
                              val
                            )
                          }
                          placeholder='Contoh: 39 minggu'
                        />

                        <PatientLineSelect
                          id={`prev-delivery-method-${selectedPregnancyIdx}`}
                          label='Cara Persalinan'
                          value={activePregnancy.deliveryMethod || ''}
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'deliveryMethod',
                              val
                            )
                          }
                          options={deliveryMethods}
                          placeholder='Pilih metode'
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineSelect
                          id={`prev-attendant-${selectedPregnancyIdx}`}
                          label='Penolong Persalinan'
                          value={activePregnancy.birthAttendant || ''}
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'birthAttendant',
                              val
                            )
                          }
                          options={birthAttendants}
                          placeholder='Pilih penolong'
                        />

                        <PatientLineSelect
                          id={`prev-place-${selectedPregnancyIdx}`}
                          label='Tempat Persalinan'
                          value={activePregnancy.deliveryPlace || ''}
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'previousPregnancies',
                              selectedPregnancyIdx,
                              'deliveryPlace',
                              val
                            )
                          }
                          options={deliveryPlaces}
                          placeholder='Pilih tempat'
                        />
                      </div>

                      <PatientLineInput
                        id={`prev-complications-${selectedPregnancyIdx}`}
                        label='Komplikasi / Masalah Persalinan'
                        value={activePregnancy.complications || ''}
                        onChange={(val) =>
                          onNestedArrayChange?.(
                            'previousPregnancies',
                            selectedPregnancyIdx,
                            'complications',
                            val
                          )
                        }
                        placeholder='Tuliskan jika ada komplikasi, atau Tidak ada'
                      />
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
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <PatientLineSelect
                          id={`kb-type-${selectedKbIdx}`}
                          label='Jenis KB / Kontrasepsi'
                          value={activeKb.contraceptiveType || ''}
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'contraceptiveHistories',
                              selectedKbIdx,
                              'contraceptiveType',
                              val
                            )
                          }
                          options={contraceptiveTypes}
                          placeholder='Pilih metode'
                        />

                        <PatientLineInput
                          id={`kb-duration-${selectedKbIdx}`}
                          label='Lama Pemakaian'
                          value={activeKb.durationText || ''}
                          onChange={(val) =>
                            onNestedArrayChange?.(
                              'contraceptiveHistories',
                              selectedKbIdx,
                              'durationText',
                              val
                            )
                          }
                          placeholder='Contoh: 2 tahun'
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <CustomDatePicker
                          id={`kb-start-${selectedKbIdx}`}
                          label='Tanggal Mulai Pakai'
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
                          disableFutureDates
                          variant='underline'
                        />

                        <CustomDatePicker
                          id={`kb-stop-${selectedKbIdx}`}
                          label='Tanggal Berhenti / Lepas'
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
                          disableFutureDates
                          variant='underline'
                        />
                      </div>

                      <PatientLineInput
                        id={`kb-problems-${selectedKbIdx}`}
                        label='Masalah / Keluhan Pemakaian'
                        value={activeKb.problems || ''}
                        onChange={(val) =>
                          onNestedArrayChange?.(
                            'contraceptiveHistories',
                            selectedKbIdx,
                            'problems',
                            val
                          )
                        }
                        placeholder='Tuliskan keluhan atau Tidak ada'
                      />

                      <PatientLineInput
                        id={`kb-side-effects-${selectedKbIdx}`}
                        label='Efek Samping Yang Dialami'
                        value={activeKb.sideEffects || ''}
                        onChange={(val) =>
                          onNestedArrayChange?.(
                            'contraceptiveHistories',
                            selectedKbIdx,
                            'sideEffects',
                            val
                          )
                        }
                        placeholder='Tuliskan efek samping atau Tidak ada'
                      />
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
