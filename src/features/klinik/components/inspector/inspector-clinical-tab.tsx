'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { InspectorTabProps } from './types';

interface DiseaseDefinition {
  id: string;
  label: string;
  notesId?: string;
  yearId?: string;
  helpText?: string;
}

const ALL_14_DISEASES: DiseaseDefinition[] = [
  {
    id: 'hasHypertensionHistory',
    notesId: 'hypertensionHistoryNotes',
    label: 'Tekanan Darah Tinggi / Hipertensi',
    helpText: 'Riwayat hipertensi kronis atau gestasional'
  },
  {
    id: 'hasHeartDiseaseHistory',
    notesId: 'heartDiseaseHistoryNotes',
    label: 'Penyakit Jantung',
    helpText: 'Kelainan katup, aritmia, atau masalah jantung lain'
  },
  {
    id: 'hasThyroidDiseaseHistory',
    notesId: 'thyroidDiseaseHistoryNotes',
    label: 'Masalah Tiroid',
    helpText: 'Hipertiroid, hipotiroid, atau struma'
  },
  {
    id: 'hasAutoimmuneHistory',
    notesId: 'autoimmuneHistoryNotes',
    label: 'Penyakit Autoimun',
    helpText: 'Lupus (SLE), rheumatoid arthritis, dsb'
  },
  {
    id: 'hasDiabetesHistory',
    notesId: 'diabetesHistoryNotes',
    label: 'Diabetes / Kencing Manis',
    helpText: 'Diabetes melitus tipe 1/2 atau gestasional'
  },
  {
    id: 'hasAsthmaHistory',
    notesId: 'asthmaHistoryNotes',
    label: 'Asma',
    helpText: 'Riwayat sesak napas atau asma bronkiale'
  },
  {
    id: 'hasTuberculosisHistory',
    notesId: 'tuberculosisHistoryNotes',
    label: 'TBC / Tuberkulosis',
    helpText: 'Pernah pengobatan flek paru / TBC 6 bulan'
  },
  {
    id: 'hasHepatitisBHistory',
    notesId: 'hepatitisBHistoryNotes',
    label: 'Hepatitis B',
    helpText: 'Pernah HBsAg reaktif'
  },
  {
    id: 'hasHivOrSyphilisHistory',
    notesId: 'hivOrSyphilisHistoryNotes',
    label: 'HIV / Sifilis',
    helpText: 'Hasil skrining triple eliminasi terdahulu'
  },
  {
    id: 'hasMentalHealthHistory',
    notesId: 'mentalHealthHistoryNotes',
    label: 'Kesehatan Jiwa',
    helpText: 'Depresi, ansietas, atau bantuan psikiatri'
  },
  {
    id: 'hasTwinPregnancyHistory',
    notesId: 'twinPregnancyHistoryNotes',
    label: 'Riwayat Hamil Kembar',
    helpText: 'Pernah melahirkan atau riwayat keluarga kembar'
  },
  {
    id: 'hasCystMyomaTumorHistory',
    notesId: 'cystMyomaTumorHistoryNotes',
    label: 'Kista, Miom, atau Tumor Kandungan',
    helpText: 'Riwayat kista ovarium atau mioma uteri'
  },
  {
    id: 'hasSurgeryHistory',
    notesId: 'surgeryHistoryNotes',
    label: 'Riwayat Operasi',
    helpText: 'Operasi sesar, usus buntu, kista, dsb'
  },
  {
    id: 'hasOtherDiseaseHistory',
    yearId: 'otherDiseaseHistoryYear',
    notesId: 'otherDiseaseHistoryNotes',
    label: 'Penyakit / Keluhan Lainnya',
    helpText: 'Penyakit atau kondisi lain yang belum tercantum'
  }
];

const HABITS = [
  {
    id: 'alcoholBeforePregnancy',
    label: 'Minuman Beralkohol',
    description: 'Minum alkohol dalam 1 bulan sebelum hamil'
  },
  {
    id: 'irregularDietBeforePregnancy',
    label: 'Pola Makan Tak Teratur',
    description: 'Pola makan tak teratur atau tinggi gula/lemak'
  },
  {
    id: 'reducedPhysicalActivityBeforePregnancy',
    label: 'Aktivitas Fisik Berkurang Drastis',
    description: 'Aktivitas fisik jauh berkurang sebelum hamil'
  },
  {
    id: 'unprescribedMedicationBeforePregnancy',
    label: 'Obat Tanpa Petunjuk Petugas',
    description: 'Minum obat tanpa arahan dokter/bidan'
  },
  {
    id: 'concerningCosmeticUseBeforePregnancy',
    label: 'Kosmetik yang Dikhawatirkan',
    description: 'Produk tubuh yang dikhawatirkan memengaruhi janin'
  },
  {
    id: 'pesticideExposureBeforePregnancy',
    label: 'Paparan Pestisida',
    description: 'Sering terkena pestisida atau obat tanaman'
  },
  {
    id: 'chemicalExposureBeforePregnancy',
    label: 'Paparan Bahan Kimia Keras',
    description: 'Terkena bahan kimia kerja atau rumah tangga kuat'
  },
  {
    id: 'smokeExposureBeforePregnancy',
    label: 'Paparan Asap Rokok / Polusi',
    description: 'Sering terpapar asap rokok atau pembakaran'
  }
] as const;

export function InspectorClinicalTab({
  data,
  isEditing = false,
  formData,
  onFieldChange,
  onDiseaseChange
}: InspectorTabProps) {
  const { answers, maternal } = data;

  // Resolve disease history state (merging maternal, answers, and edit state)
  const getDiseaseStatus = React.useCallback(
    (item: DiseaseDefinition) => {
      if (formData?.diseaseHistory) {
        const has = Boolean(formData.diseaseHistory[item.id]);
        const year = item.yearId
          ? formData.diseaseHistory[item.yearId]
          : formData.diseaseHistory[item.notesId || ''];
        const notes = item.yearId ? formData.diseaseHistory[item.notesId || ''] : undefined;
        return { has, year, notes };
      }

      // Fallback from maternal relational healthConditions
      if (maternal?.healthConditions && Array.isArray(maternal.healthConditions)) {
        const match = maternal.healthConditions.find(
          (c) => c.conditionCode?.toLowerCase() === item.id.toLowerCase()
        );
        if (match) {
          return {
            has: Boolean(match.hasCondition),
            year: match.diagnosisYear ? String(match.diagnosisYear) : undefined,
            notes: match.notes || undefined
          };
        }
      }

      // Fallback from maternal.diseaseHistory record
      if (maternal?.diseaseHistory && typeof maternal.diseaseHistory === 'object') {
        const dObj = maternal.diseaseHistory as Record<string, any>;
        const raw = dObj[item.id];
        const has = raw === true || raw === 'Ya';
        const year = item.yearId ? dObj[item.yearId] : dObj[item.notesId || ''];
        const notes = item.yearId ? dObj[item.notesId || ''] : undefined;
        return { has, year, notes };
      }

      // Fallback from answers
      const rawAns = answers[item.id];
      const has = rawAns === true || rawAns === 'Ya';
      const year = item.yearId ? answers[item.yearId] : answers[item.notesId || ''];
      const notes = item.yearId ? answers[item.notesId || ''] : undefined;
      return { has, year, notes };
    },
    [formData, maternal, answers]
  );

  const smoking =
    formData?.smokedBeforePregnancy ??
    maternal?.smokedBeforePregnancy ??
    answers.smokedBeforePregnancy ??
    'Tidak';

  const envNotes =
    formData?.concerningEnvironmentNotes ??
    maternal?.concerningEnvironmentNotes ??
    answers.concerningEnvironmentNotes ??
    '-';

  const allergy = formData?.allergyInfo ?? maternal?.allergyInfo ?? answers.allergyInfo ?? '-';

  const otherNotes = formData?.otherNotes ?? maternal?.otherNotes ?? answers.otherNotes ?? '-';

  return (
    <div className='space-y-6 pt-1 select-text'>
      {/* Bagian 1: Skrining Kebiasaan & Faktor Risiko Lingkungan */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between pb-1 border-b border-border/40'>
          <span className='text-xs font-semibold text-foreground uppercase tracking-wider'>
            Kebiasaan Sekitar 1 Bulan Sebelum Hamil
          </span>
          {isEditing && (
            <span className='text-[11px] text-primary font-medium'>
              Klik switch untuk ubah status
            </span>
          )}
        </div>

        {/* Status Merokok */}
        <div className='p-3 rounded-lg border border-border/40 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='space-y-0.5'>
            <Label className='text-xs font-semibold text-foreground'>
              Merokok (Termasuk Rokok Elektrik / Vape)
            </Label>
            <p className='text-[11px] text-muted-foreground'>
              Status konsumsi rokok aktif maupun pasif dalam 1 bulan sebelum kehamilan.
            </p>
          </div>
          {isEditing ? (
            <Select
              value={smoking}
              onValueChange={(val) => onFieldChange?.('smokedBeforePregnancy', val)}
            >
              <SelectTrigger className='w-32 h-8 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Tidak' className='text-xs'>
                  Tidak
                </SelectItem>
                <SelectItem value='Aktif' className='text-xs'>
                  Aktif
                </SelectItem>
                <SelectItem value='Pasif' className='text-xs'>
                  Pasif
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge
              variant={smoking === 'Tidak' ? 'outline' : 'secondary'}
              className={`text-xs px-3 py-1 font-semibold ${
                smoking === 'Aktif'
                  ? 'border-destructive/40 text-destructive bg-destructive/10'
                  : smoking === 'Pasif'
                    ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                    : 'text-muted-foreground'
              }`}
            >
              {smoking === 'Tidak' ? 'Tidak Merokok' : `Perokok ${smoking}`}
            </Badge>
          )}
        </div>

        {/* 8 Kebiasaan Lainnya */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5'>
          {HABITS.map((habit) => {
            const isChecked = formData
              ? Boolean(formData[habit.id as keyof typeof formData])
              : maternal
                ? Boolean(maternal[habit.id as keyof typeof maternal])
                : Boolean(answers[habit.id]);

            return (
              <div
                key={habit.id}
                className='flex items-center justify-between p-2.5 rounded-md border border-border/30 bg-background hover:bg-muted/10 transition-colors gap-3'
              >
                <div className='space-y-0.5 min-w-0'>
                  <p className='text-xs font-medium text-foreground truncate'>{habit.label}</p>
                  <p className='text-[11px] text-muted-foreground line-clamp-1'>
                    {habit.description}
                  </p>
                </div>

                {isEditing ? (
                  <div className='flex items-center gap-2 shrink-0'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      {isChecked ? 'Ya' : 'Tidak'}
                    </span>
                    <Switch
                      checked={isChecked}
                      onCheckedChange={(val) => onFieldChange?.(habit.id as any, val)}
                    />
                  </div>
                ) : (
                  <Badge
                    variant={isChecked ? 'secondary' : 'outline'}
                    className={`text-[11px] shrink-0 font-medium ${
                      isChecked
                        ? 'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {isChecked ? 'Ya' : 'Tidak'}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Catatan Lingkungan, Alergi & Keluhan Lain */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 pt-2'>
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-foreground'>Catatan Lingkungan</Label>
            {isEditing ? (
              <Textarea
                value={formData?.concerningEnvironmentNotes ?? ''}
                onChange={(e) => onFieldChange?.('concerningEnvironmentNotes', e.target.value)}
                placeholder='Paparan lingkungan, asap pabrik, dsb...'
                rows={2}
                className='text-xs resize-none'
              />
            ) : (
              <div className='p-2.5 rounded-md border border-border/30 bg-muted/10 text-xs min-h-[58px]'>
                {envNotes}
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-foreground'>
              Riwayat Alergi (Obat/Makanan)
            </Label>
            {isEditing ? (
              <Textarea
                value={formData?.allergyInfo ?? ''}
                onChange={(e) => onFieldChange?.('allergyInfo', e.target.value)}
                placeholder='Alergi amoxicillin, seafood, debu, dsb...'
                rows={2}
                className='text-xs resize-none'
              />
            ) : (
              <div className='p-2.5 rounded-md border border-border/30 bg-muted/10 text-xs min-h-[58px]'>
                {allergy}
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-foreground'>
              Catatan Lain untuk Bidan
            </Label>
            {isEditing ? (
              <Textarea
                value={formData?.otherNotes ?? ''}
                onChange={(e) => onFieldChange?.('otherNotes', e.target.value)}
                placeholder='Pesan atau catatan khusus lainnya...'
                rows={2}
                className='text-xs resize-none'
              />
            ) : (
              <div className='p-2.5 rounded-md border border-border/30 bg-muted/10 text-xs min-h-[58px]'>
                {otherNotes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bagian 2: Tabel Interaktif 14 Penyakit Kesehatan (Exposed 1:1 Tanpa Filter) */}
      <div className='space-y-3 pt-2'>
        <div className='flex items-center justify-between pb-1 border-b border-border/40'>
          <div className='space-y-0.5'>
            <span className='text-xs font-semibold text-foreground uppercase tracking-wider'>
              Skrining 14 Riwayat Penyakit & Operasi
            </span>
            <p className='text-[11px] text-muted-foreground'>
              Menampilkan seluruh 14 kondisi kesehatan terstandar obstetri KIA Praktik Mandiri
              Bidan.
            </p>
          </div>
          <Badge variant='outline' className='text-[11px] font-semibold text-foreground'>
            Total 14 Penyakit
          </Badge>
        </div>

        <div className='rounded-lg border border-border/40 overflow-hidden'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='w-10 text-center text-xs font-semibold'>No</TableHead>
                <TableHead className='text-xs font-semibold'>Kondisi / Penyakit</TableHead>
                <TableHead className='w-28 text-center text-xs font-semibold'>Status</TableHead>
                <TableHead className='w-48 text-xs font-semibold'>
                  Tahun Diagnosis / Catatan
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_14_DISEASES.map((item, index) => {
                const status = getDiseaseStatus(item);
                const isOther = item.id === 'hasOtherDiseaseHistory';

                return (
                  <TableRow
                    key={item.id}
                    className={
                      status.has
                        ? 'bg-amber-500/5 hover:bg-amber-500/10 transition-colors'
                        : 'hover:bg-muted/20 transition-colors'
                    }
                  >
                    <TableCell className='text-center text-xs text-muted-foreground font-mono'>
                      {index + 1}
                    </TableCell>

                    <TableCell className='py-2.5'>
                      <div className='space-y-0.5'>
                        <span className='text-xs font-semibold text-foreground block'>
                          {item.label}
                        </span>
                        {item.helpText && (
                          <span className='text-[11px] text-muted-foreground block line-clamp-1'>
                            {item.helpText}
                          </span>
                        )}
                        {isOther && status.has && !isEditing && status.notes && (
                          <span className='text-xs font-medium text-amber-700 dark:text-amber-300 block pt-0.5'>
                            Nama Keluhan: {status.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className='text-center py-2.5'>
                      {isEditing ? (
                        <div className='flex items-center justify-center gap-2'>
                          <span
                            className={`text-xs font-semibold ${
                              status.has ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            {status.has ? 'Ya' : 'Tidak'}
                          </span>
                          <Switch
                            checked={status.has}
                            onCheckedChange={(checked) => {
                              onDiseaseChange?.(item.id, checked);
                            }}
                          />
                        </div>
                      ) : (
                        <Badge
                          variant={status.has ? 'default' : 'outline'}
                          className={`text-xs px-2.5 py-0.5 font-semibold ${
                            status.has
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {status.has ? 'Ya' : 'Tidak'}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className='py-2.5'>
                      {isEditing ? (
                        isOther ? (
                          <div className='space-y-1.5'>
                            <Input
                              value={status.notes || ''}
                              onChange={(e) =>
                                onDiseaseChange?.(
                                  item.notesId || 'otherDiseaseHistoryNotes',
                                  e.target.value
                                )
                              }
                              placeholder='Nama penyakit...'
                              disabled={!status.has}
                              className='h-7.5 text-xs'
                            />
                            <Input
                              value={status.year || ''}
                              onChange={(e) =>
                                onDiseaseChange?.(
                                  item.yearId || 'otherDiseaseHistoryYear',
                                  e.target.value
                                )
                              }
                              placeholder='Tahun (cth: 2021)'
                              disabled={!status.has}
                              className='h-7.5 text-xs font-mono'
                            />
                          </div>
                        ) : (
                          <Input
                            value={status.year || ''}
                            onChange={(e) =>
                              onDiseaseChange?.(item.notesId || `${item.id}Notes`, e.target.value)
                            }
                            placeholder={status.has ? 'Tahun (cth: 2020)' : '-'}
                            disabled={!status.has}
                            className='h-7.5 text-xs font-mono'
                          />
                        )
                      ) : (
                        <div className='text-xs text-foreground font-mono'>
                          {status.has ? (
                            status.year ? (
                              <span className='font-semibold text-primary'>
                                Tahun {status.year}
                              </span>
                            ) : (
                              <span className='text-muted-foreground italic'>
                                Tercatat tanpa tahun
                              </span>
                            )
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
