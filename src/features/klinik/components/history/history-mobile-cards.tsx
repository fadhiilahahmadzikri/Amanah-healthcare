'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { formatClinicDate } from '@/lib/date-format';
import type {
  MaternalHistoryItem,
  ImmunizationHistoryItem,
  ClinicalHistoryTabType
} from '../../api/history-queries';

export interface ClinicalHistoryMobileCardsProps {
  activeTab: ClinicalHistoryTabType;
  maternalRecords: MaternalHistoryItem[];
  immunizationRecords: ImmunizationHistoryItem[];
  hasFilters: boolean;
  onViewDetail: (type: ClinicalHistoryTabType, id: string) => void;
}

export function ClinicalHistoryMobileCards({
  activeTab,
  maternalRecords,
  immunizationRecords,
  hasFilters,
  onViewDetail
}: ClinicalHistoryMobileCardsProps) {
  const isMaternity = activeTab === 'maternity';
  const records = isMaternity ? maternalRecords : immunizationRecords;

  if (records.length === 0) {
    return (
      <div className='flex flex-1 min-h-[300px] flex-col items-center justify-center p-4'>
        {hasFilters ? (
          <EmptyState
            icon={Icons.search}
            title='Tidak ada riwayat yang cocok'
            description='Tidak ditemukan arsip rekam medis dengan filter atau kata kunci pencarian yang dipilih.'
          />
        ) : (
          <EmptyState
            icon={Icons.history}
            title={
              isMaternity
                ? 'Belum ada riwayat kehamilan & persalinan'
                : 'Belum ada riwayat imunisasi anak'
            }
            description='Data rekam formulir medis yang telah diisi saat reservasi janji temu akan tercatat di sini.'
          />
        )}
      </div>
    );
  }

  return (
    <div className='space-y-3 font-sans select-none pb-4'>
      {isMaternity
        ? maternalRecords.map((item) => {
            const gpa = `G${item.gravidaCount ?? 1} P${item.parityCount ?? 0} A${item.abortionCount ?? 0}`;
            const gestAge =
              item.gestationalAgeFormatted ||
              (item.gestationalAgeWeeks ? `${item.gestationalAgeWeeks} Minggu` : '-');

            return (
              <div
                key={item.id}
                role='button'
                tabIndex={0}
                onClick={() => onViewDetail('maternity', item.id)}
                className='p-4 rounded-2xl border border-border/70 bg-card hover:border-primary/50 transition-all flex flex-col gap-3 shadow-2xs'
              >
                <div className='flex items-start justify-between gap-2 border-b border-border/40 pb-2.5'>
                  <div>
                    <h5 className='text-sm font-bold text-foreground'>{item.motherName}</h5>
                    <span className='font-mono text-[11px] text-muted-foreground'>
                      NIK: {item.motherNik || '-'}
                    </span>
                  </div>
                  <span className='text-[11px] font-medium text-muted-foreground whitespace-nowrap'>
                    {formatClinicDate(item.createdAt)}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <span className='text-[10.5px] text-muted-foreground block'>
                      Obstetrik (GPA)
                    </span>
                    <Badge
                      variant='outline'
                      className='mt-0.5 text-[10.5px] font-mono font-semibold bg-primary/5 text-primary border-primary/20'
                    >
                      {gpa}
                    </Badge>
                  </div>
                  <div>
                    <span className='text-[10.5px] text-muted-foreground block'>
                      Usia Hamil & HPL
                    </span>
                    <span className='font-medium text-foreground block'>{gestAge}</span>
                    <span className='text-[10px] text-muted-foreground'>
                      HPL: {item.estimatedDueDate || '-'}
                    </span>
                  </div>
                  <div className='col-span-2'>
                    <span className='text-[10.5px] text-muted-foreground block'>
                      Suami / Pasangan
                    </span>
                    <span className='text-foreground'>{item.partnerName || '-'}</span>
                  </div>
                </div>

                <div className='pt-2 border-t border-border/40 flex items-center justify-end'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    shape='pill'
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail('maternity', item.id);
                    }}
                    className='h-7.5 px-3 text-xs font-semibold'
                  >
                    <Icons.eye className='size-3.5 mr-1.5 text-primary' />
                    Lihat Detail
                  </Button>
                </div>
              </div>
            );
          })
        : immunizationRecords.map((item) => {
            const genderLabel =
              item.childSex === 'L' || item.childSex === 'Laki-laki'
                ? 'Laki-laki'
                : item.childSex === 'P' || item.childSex === 'Perempuan'
                  ? 'Perempuan'
                  : item.childSex || '-';

            return (
              <div
                key={item.id}
                role='button'
                tabIndex={0}
                onClick={() => onViewDetail('immunization', item.id)}
                className='p-4 rounded-2xl border border-border/70 bg-card hover:border-primary/50 transition-all flex flex-col gap-3 shadow-2xs'
              >
                <div className='flex items-start justify-between gap-2 border-b border-border/40 pb-2.5'>
                  <div>
                    <h5 className='text-sm font-bold text-foreground'>{item.childName}</h5>
                    <span className='font-mono text-[11px] text-muted-foreground'>
                      NIK: {item.childNik || '-'}
                    </span>
                  </div>
                  <span className='text-[11px] font-medium text-muted-foreground whitespace-nowrap'>
                    {formatClinicDate(item.createdAt)}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <span className='text-[10.5px] text-muted-foreground block'>
                      Tgl Lahir / Gender
                    </span>
                    <span className='font-medium text-foreground block'>
                      {item.childBirthDate || '-'}
                    </span>
                    <span className='text-[10.5px] text-muted-foreground'>{genderLabel}</span>
                  </div>
                  <div>
                    <span className='text-[10.5px] text-muted-foreground block'>
                      Vaksin Terjadwal
                    </span>
                    <Badge
                      variant='outline'
                      className='mt-0.5 text-[10.5px] font-semibold bg-primary/5 text-primary border-primary/20'
                    >
                      {item.scheduledVaccinesCount} Vaksin
                    </Badge>
                  </div>
                  <div className='col-span-2'>
                    <span className='text-[10.5px] text-muted-foreground block'>
                      Kontak Orang Tua
                    </span>
                    <span className='text-foreground'>{item.parentPhone || '-'}</span>
                  </div>
                </div>

                <div className='pt-2 border-t border-border/40 flex items-center justify-end'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    shape='pill'
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail('immunization', item.id);
                    }}
                    className='h-7.5 px-3 text-xs font-semibold'
                  >
                    <Icons.eye className='size-3.5 mr-1.5 text-primary' />
                    Lihat Detail
                  </Button>
                </div>
              </div>
            );
          })}
    </div>
  );
}
