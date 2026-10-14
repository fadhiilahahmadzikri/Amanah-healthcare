'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PatientActionDrawer } from './patient-action-drawer';
import { getInitials } from './patient-tables/columns-helpers';
import { usePatientMobileCards } from '../model/usePatientMobileCards';
import type { Patient } from '../api/types';

export interface PatientMobileCardsProps {
  patients: Patient[];
  hasFilters: boolean;
  onReset?: () => void;
  onRowClick: (patient: Patient) => void;
  onViewDetail: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
}

export function PatientMobileCards({
  patients,
  hasFilters,
  onReset,
  onRowClick,
  onViewDetail,
  onEdit,
  onViewHistory,
  onDelete,
  sentinelRef,
  isFetchingNextPage,
  hasNextPage
}: PatientMobileCardsProps) {
  const {
    selectedActionPatient,
    openActionDrawer,
    closeActionDrawer,
    getCleanRelationLabel,
    getRelationStatusKey,
    getDemographicSlots,
    formatVisitDate
  } = usePatientMobileCards();

  if (patients.length === 0) {
    return (
      <div className='flex flex-1 min-h-[300px] flex-col items-center justify-center p-4'>
        {hasFilters ? (
          <div className='flex flex-col items-center gap-3 w-full max-w-xs text-center'>
            <EmptyState
              title='Tidak ada pasien yang cocok'
              description='Tidak ditemukan data pasien dengan filter atau kata kunci pencarian yang dipilih.'
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
            title='Belum ada data pasien'
            description='Data pasien akan ditampilkan di sini setelah didaftarkan ke sistem klinik.'
          />
        )}
      </div>
    );
  }

  return (
    <>
      {/* Container dengan gutter vertikal proporsional */}
      <div className='flex flex-col gap-3.5 pb-28 pt-1 select-none'>
        {patients.map((patient) => {
          const isMaster =
            patient.is_master ?? (!patient.master_patient_id && !patient.relationship_type);
          const slots = getDemographicSlots(patient);
          const statusAccount = patient.account_status || 'active';
          const relLabel = getCleanRelationLabel(patient.relationship_type, patient.relation_label);
          const relStatusKey = getRelationStatusKey(patient.relationship_type);

          return (
            <div key={patient.id} className='flex flex-col w-full'>
              {/* KARTU PASIEN FLAT & AGNOSTIK */}
              <div
                onClick={() => onRowClick(patient)}
                className={cn(
                  'group relative w-full bg-gradient-to-t from-primary/[0.04] via-card to-card text-card-foreground border border-border rounded-[22px] p-4 sm:p-4.5 flex flex-col justify-between gap-3 select-none transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/50 hover:shadow-xs'
                )}
              >
                {/* 1. Header: Avatar + Nama + Subtitle (Badge Status/Hubungan) + Status Akun */}
                <div className='flex items-start justify-between gap-2.5 min-w-0'>
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <div className='size-11 sm:size-12 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-muted aspect-square shadow-2xs flex items-center justify-center'>
                      <Avatar className='h-full w-full'>
                        <AvatarFallback className='text-xs font-bold bg-primary/10 text-primary'>
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className='min-w-0 flex-1 space-y-1'>
                      <h3
                        className='text-sm sm:text-[15px] font-bold tracking-tight text-foreground truncate'
                        title={patient.name}
                      >
                        {patient.name}
                      </h3>

                      {/* Subtitle: Badge Profil / Hubungan Tanpa Prefix */}
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
                        {patient.has_own_account && !isMaster && (
                          <StatusBadge status='PUNYA_AKUN' label='Punya Akun' size='sm' />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Akun di Pojok Kanan Atas */}
                  <div className='shrink-0 self-start pt-0.5'>
                    <StatusBadge status={statusAccount} size='sm' />
                  </div>
                </div>

                {/* 2. Slot Demografis dengan Separator Pipa (|) */}
                <div className='flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    {slots.map((s, idx) => (
                      <React.Fragment key={s.id}>
                        {idx > 0 && (
                          <span className='text-border/90 font-light select-none'>|</span>
                        )}
                        <span
                          className={cn('text-foreground font-medium', s.isMono && 'font-mono')}
                        >
                          {s.label}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>

                  {patient.patient_id && (
                    <span className='font-mono text-[11px] text-muted-foreground/80'>
                      {patient.patient_id}
                    </span>
                  )}
                </div>

                {/* 3. Footer: Kunjungan Terakhir + Ellipsis Action + Detail Button */}
                <div className='w-full flex items-center justify-between gap-3 pt-2.5 border-t border-border/40 min-w-0'>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[11px] text-muted-foreground'>Kunjungan terakhir</span>
                    <span className='text-xs font-semibold font-mono text-foreground truncate'>
                      {formatVisitDate(patient.last_visit_date)}
                    </span>
                  </div>

                  <div className='flex items-center gap-1.5 shrink-0'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        openActionDrawer(patient);
                      }}
                      aria-label={`Aksi untuk pasien ${patient.name}`}
                      className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer shrink-0'
                    >
                      <Icons.ellipsis className='size-4' />
                    </Button>

                    <Button
                      type='button'
                      variant='default'
                      shape='pill'
                      size='card-action'
                      withTrailingCircleIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(patient);
                      }}
                      className='font-bold shadow-2xs cursor-pointer'
                    >
                      Detail
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Sentinel Infinite Scroll */}
        {sentinelRef && (
          <div
            ref={sentinelRef}
            className='py-3 flex flex-col items-center justify-center text-xs text-muted-foreground'
          >
            {isFetchingNextPage && (
              <div className='flex items-center gap-2 text-primary font-medium'>
                <Icons.spinner className='size-4 animate-spin' />
                <span>Memuat pasien berikutnya...</span>
              </div>
            )}
            {!hasNextPage && patients.length > 0 && (
              <span className='text-muted-foreground/60 text-[11px]'>
                Semua hasil pencarian telah dimuat
              </span>
            )}
          </div>
        )}
      </div>

      {/* Centralized Action Drawer */}
      <PatientActionDrawer
        isOpen={Boolean(selectedActionPatient)}
        patient={selectedActionPatient}
        onClose={closeActionDrawer}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onViewHistory={onViewHistory}
        onDelete={onDelete}
      />
    </>
  );
}
