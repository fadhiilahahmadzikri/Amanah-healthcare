'use client';

import * as React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { formatClinicDate } from '@/lib/date-format';
import type { Patient } from '@/features/data-pasien/api/types';
import {
  getRelationshipStatusKey,
  getRelationshipLabel
} from '@/features/data-pasien/components/patient-tables/columns-helpers';

export interface MedicalHistoryMobileCardsProps {
  patients: Patient[];
  hasFilters: boolean;
  onReset?: () => void;
  onOpenHistory: (patient: Patient) => void;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
}

export function MedicalHistoryMobileCards({
  patients,
  hasFilters,
  onReset,
  onOpenHistory,
  sentinelRef,
  isFetchingNextPage,
  hasNextPage
}: MedicalHistoryMobileCardsProps) {
  const [expandedDeckIds, setExpandedDeckIds] = React.useState<Set<string>>(new Set());

  const toggleDeck = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDeckIds((prev) => {
      const next = new Set(prev);
      if (next.has(patientId)) {
        next.delete(patientId);
      } else {
        next.add(patientId);
      }
      return next;
    });
  };

  if (patients.length === 0) {
    return (
      <div className='flex flex-1 min-h-[300px] flex-col items-center justify-center p-4'>
        {hasFilters ? (
          <div className='flex flex-col items-center gap-3 w-full max-w-xs text-center'>
            <EmptyState
              title='Tidak ada riwayat pasien yang cocok'
              description='Tidak ditemukan riwayat pasien dengan filter atau kata kunci pencarian yang dipilih.'
            />
            {onReset && (
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='sm'
                onClick={onReset}
                className='font-semibold text-xs cursor-pointer'
              >
                Reset Semua Filter
              </Button>
            )}
          </div>
        ) : (
          <EmptyState
            title='Belum ada riwayat medis'
            description='Data riwayat medis pasien akan ditampilkan di sini.'
          />
        )}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3.5 pb-28 pt-1 select-none font-sans'>
      {patients.map((patient) => {
        const isMaster =
          patient.is_master ?? (!patient.master_patient_id && !patient.relationship_type);
        const relLabel = getRelationshipLabel(patient.relationship_type, patient.relation_label);
        const relStatusKey = getRelationshipStatusKey(patient.relationship_type);
        const hasAffiliates = Boolean(
          !hasFilters && patient.affiliates && patient.affiliates.length > 0
        );
        const isExpanded = hasAffiliates && expandedDeckIds.has(patient.id);

        const rm = patient.patient_id || patient.medical_record_number || '-';
        const nik = patient.nik || patient.masked_nik || '-';
        const total = patient.total_appointments ?? 0;
        const completed = patient.completed_visits ?? 0;
        const missedOrCancelled =
          (patient.missed_appointments || 0) + (patient.cancelled_appointments || 0);

        return (
          <div key={patient.id} className='flex flex-col w-full'>
            {/* KARTU PASIEN UTAMA */}
            <div
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpenHistory(patient);
              }}
              onClick={() => onOpenHistory(patient)}
              className={cn(
                'group relative z-20 w-full bg-gradient-to-t from-primary/[0.04] via-card to-card text-card-foreground border border-border rounded-[22px] p-4 flex flex-col justify-between gap-3 select-none transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/50 hover:shadow-xs'
              )}
            >
              {/* Header: Avatar + Nama + Status Profil */}
              <div className='flex items-start justify-between gap-2.5 min-w-0'>
                <div className='flex items-center gap-3 min-w-0 flex-1'>
                  <div className='size-11 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-muted aspect-square shadow-2xs flex items-center justify-center'>
                    <Avatar className='h-full w-full overflow-hidden'>
                      <AvatarImage
                        src={patient.avatarUrl || DEFAULT_AVATAR_PATH}
                        alt={patient.name}
                        className='size-full object-cover'
                      />
                      <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                        <Image
                          src={DEFAULT_AVATAR_PATH}
                          alt={patient.name}
                          width={44}
                          height={44}
                          unoptimized
                          className='size-full object-cover'
                        />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className='min-w-0 flex-1 space-y-0.5'>
                    <h3
                      className='text-sm font-bold tracking-tight text-foreground truncate'
                      title={patient.name}
                    >
                      {patient.name}
                    </h3>

                    <div className='flex items-center gap-1.5 flex-wrap'>
                      {isMaster ? (
                        <StatusBadge
                          status='AKUN_UTAMA'
                          label='Akun Utama'
                          icon={
                            <Icons.crown className='size-2.5 shrink-0 text-amber-600 dark:text-amber-400' />
                          }
                          size='sm'
                        />
                      ) : (
                        <StatusBadge status={relStatusKey} label={relLabel} size='sm' />
                      )}
                    </div>
                  </div>
                </div>

                {/* Indikator Afiliasi / Toggle Deck */}
                {hasAffiliates && (
                  <button
                    type='button'
                    onClick={(e) => toggleDeck(patient.id, e)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all shrink-0 cursor-pointer',
                      isExpanded
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/70 text-foreground border-border/80 hover:bg-muted'
                    )}
                  >
                    <Icons.users className='size-3 shrink-0' />
                    <span>{patient.affiliates?.length} Afiliasi</span>
                    <Icons.chevronDown
                      className={cn(
                        'size-3 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Data Kanonik: No. RM, NIK, Kontak */}
              <div className='grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/40 font-mono'>
                <div>
                  <span className='text-muted-foreground block text-[10px] font-sans'>No. RM</span>
                  <span className='font-bold text-foreground truncate block'>{rm}</span>
                </div>
                <div>
                  <span className='text-muted-foreground block text-[10px] font-sans'>NIK</span>
                  <span className='font-medium text-foreground truncate block'>{nik}</span>
                </div>
              </div>

              {/* Ringkasan Agregat Kunjungan */}
              <div className='grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/30 text-center'>
                <div>
                  <span className='text-[10px] text-muted-foreground block font-sans'>Total</span>
                  <span className='font-mono font-bold text-xs text-foreground'>{total}</span>
                </div>
                <div>
                  <span className='text-[10px] text-muted-foreground block font-sans'>Selesai</span>
                  <span className='font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400'>
                    {completed}
                  </span>
                </div>
                <div>
                  <span className='text-[10px] text-muted-foreground block font-sans'>
                    Batal/Lewat
                  </span>
                  <span
                    className={cn(
                      'font-mono font-bold text-xs',
                      missedOrCancelled > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    {missedOrCancelled}
                  </span>
                </div>
              </div>

              {/* Kunjungan Terakhir & Tombol Aksi */}
              <div className='flex items-center justify-between pt-1 border-t border-border/40'>
                <span className='text-[11px] font-mono text-muted-foreground truncate'>
                  Terakhir:{' '}
                  {patient.last_visit_date
                    ? formatClinicDate(patient.last_visit_date, { style: 'human_short' })
                    : '-'}
                </span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  onClick={() => onOpenHistory(patient)}
                  className='text-xs font-semibold gap-1.5 h-7.5 px-3'
                >
                  <Icons.history className='size-3 text-primary' />
                  <span>Lihat Riwayat</span>
                </Button>
              </div>
            </div>

            {/* DECK AFILIASI TERHUBUNG (CHILD CARDS) */}
            {hasAffiliates && isExpanded && (
              <div className='flex flex-col gap-2 pl-4 pt-2 border-l-2 border-primary/30 ml-5 animate-in fade-in-50 duration-200'>
                {patient.affiliates?.map((aff) => {
                  const affRm = aff.patient_id || aff.medical_record_number || '-';
                  const affRelLabel = getRelationshipLabel(
                    aff.relationship_type,
                    aff.relation_label
                  );
                  const affRelKey = getRelationshipStatusKey(aff.relationship_type);

                  return (
                    <div
                      key={aff.id}
                      role='button'
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onOpenHistory(aff);
                      }}
                      onClick={() => onOpenHistory(aff)}
                      className='w-full bg-card/90 border border-border/70 rounded-2xl p-3.5 space-y-2.5 cursor-pointer hover:border-primary/50 transition-colors shadow-2xs'
                    >
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                          <Avatar className='size-8 rounded-lg shrink-0 border border-border/40'>
                            <AvatarImage
                              src={aff.avatarUrl || DEFAULT_AVATAR_PATH}
                              alt={aff.name}
                            />
                            <AvatarFallback className='p-0 bg-transparent'>
                              <Image
                                src={DEFAULT_AVATAR_PATH}
                                alt={aff.name}
                                width={32}
                                height={32}
                                unoptimized
                                className='size-full object-cover'
                              />
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <span className='text-xs font-bold text-foreground truncate block'>
                              {aff.name}
                            </span>
                            <span className='text-[10px] font-mono text-muted-foreground'>
                              {affRm}
                            </span>
                          </div>
                        </div>

                        <StatusBadge status={affRelKey} label={affRelLabel} size='sm' />
                      </div>

                      <div className='flex items-center justify-between pt-1 border-t border-border/30 text-[11px] font-mono'>
                        <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>
                          {aff.completed_visits ?? 0} Selesai
                        </span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-6 px-2 text-xs font-semibold text-primary'
                        >
                          Lihat Riwayat &rarr;
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Sentinel Infinite Scroll Target */}
      <div ref={sentinelRef} className='h-4 w-full shrink-0' />
      {isFetchingNextPage && (
        <div className='flex items-center justify-center p-3'>
          <Icons.spinner className='size-4 animate-spin text-primary' />
          <span className='ml-2 text-xs text-muted-foreground'>Memuat pasien berikutnya...</span>
        </div>
      )}
      {!hasNextPage && patients.length > 0 && (
        <div className='text-center py-3 text-xs text-muted-foreground/60'>
          Semua riwayat pasien telah dimuat
        </div>
      )}
    </div>
  );
}
