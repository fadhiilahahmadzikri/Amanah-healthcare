'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatClinicDate, formatClinicTime } from '@/lib/date-format';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { BookedPatientKiaIntake } from '@/features/jadwal-dokter/components/booked-patient-kia-intake';
import { patientHistoryQueryOptions } from '../api/queries';
import type { Patient } from '../api/types';

export interface PatientHistoryModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
}

export function PatientHistoryModal({
  isOpen,
  patient,
  onClose,
}: PatientHistoryModalProps) {
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    ...patientHistoryQueryOptions(patient?.id || ''),
    enabled: Boolean(isOpen && patient?.id),
  });

  if (!patient) return null;

  const initials = patient.name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const timelineItems = data?.data ?? [];

  const toggleForm = (id: string) => {
    setExpandedFormId((prev) => (prev === id ? null : id));
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[640px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4'>
        {/* 1. Header with Patient Identity & Aggregated Badges */}
        <div className='flex items-start justify-between gap-4 pb-3.5 border-b border-border/40'>
          <div className='flex items-center gap-3.5 min-w-0 flex-1'>
            <Avatar className='size-12 rounded-xl shrink-0 border border-border/40'>
              <AvatarFallback className='rounded-xl text-sm bg-primary/10 text-primary font-bold'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className='flex flex-col min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h3 className='text-base font-bold text-foreground truncate tracking-tight'>
                  {patient.name}
                </h3>
                <span className='font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/40'>
                  {patient.patient_id}
                </span>
              </div>
              <p className='text-xs font-mono text-muted-foreground mt-0.5'>
                NIK: {patient.masked_nik}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            <span
              title='Total Janji Temu'
              className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border/40'
            >
              <Icons.calendar className='size-3 text-muted-foreground' />
              <span>{patient.total_appointments} Janji</span>
            </span>
            <span
              title='Kunjungan Selesai'
              className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            >
              <Icons.check className='size-3' />
              <span>{patient.completed_visits} Selesai</span>
            </span>
          </div>
        </div>

        {/* 2. Subheader Title */}
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <h4 className='text-sm font-semibold text-foreground tracking-tight'>
              Riwayat Kunjungan & Garis Waktu Klinis
            </h4>
            <p className='text-xs text-muted-foreground'>
              Urutan kronologis janji temu, layanan poli, dan berkas formulir klinis terkait.
            </p>
          </div>
          {!isLoading && (
            <span className='text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md'>
              {timelineItems.length} Catatan
            </span>
          )}
        </div>

        {/* 3. Timeline Body */}
        <div className='max-h-[58vh] overflow-y-auto pr-1.5 space-y-4'>
          {isLoading ? (
            <div className='space-y-3 py-2'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex gap-3 items-start p-3 rounded-xl border border-border/40 bg-muted/20'>
                  <Skeleton className='size-8 rounded-full shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-44 rounded-md' />
                    <Skeleton className='h-3 w-64 rounded-md' />
                    <Skeleton className='h-3 w-32 rounded-md' />
                  </div>
                </div>
              ))}
            </div>
          ) : timelineItems.length === 0 ? (
            <EmptyState
              title='Belum Ada Riwayat Kunjungan'
              description='Pasien ini belum memiliki riwayat janji temu atau kunjungan pada database klinik.'
              className='py-8 border border-dashed rounded-xl'
            />
          ) : (
            <div className='relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60'>
              {timelineItems.map((item) => {
                const statusConfig = getStatusConfig(item.status);
                const isFormExpanded = expandedFormId === item.id;
                const isCompleted = item.status === 'completed';
                const isCancelled = item.status === 'cancelled';

                return (
                  <div key={item.id} className='relative text-xs'>
                    {/* Node Dot */}
                    <div
                      className={cn(
                        'absolute -left-6 top-1 size-4 rounded-full ring-2 ring-background border flex items-center justify-center transition-colors',
                        isCompleted && 'bg-emerald-500 border-emerald-600 text-white',
                        isCancelled && 'bg-rose-500 border-rose-600 text-white',
                        item.status === 'in_service' && 'bg-primary border-primary text-white animate-pulse',
                        !isCompleted && !isCancelled && item.status !== 'in_service' && 'bg-muted border-border text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Icons.check className='size-2.5 stroke-[3]' />
                      ) : isCancelled ? (
                        <Icons.close className='size-2.5 stroke-[3]' />
                      ) : (
                        <span className='size-1.5 rounded-full bg-current' />
                      )}
                    </div>

                    {/* Timeline Card */}
                    <div className='p-3.5 rounded-xl border border-border/50 bg-card hover:border-border transition-colors space-y-2'>
                      {/* Top Row: Service & Status */}
                      <div className='flex items-start justify-between gap-2'>
                        <div className='space-y-0.5 min-w-0 flex-1'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <span className='font-bold text-sm text-foreground tracking-tight'>
                              {item.poliklinik_name}
                            </span>
                            <span className='font-mono text-[11px] text-muted-foreground px-1.5 py-0.2 rounded bg-muted'>
                              #{item.booking_code}
                            </span>
                          </div>
                          <p className='text-xs text-muted-foreground font-medium'>
                            Dokter: <span className='text-foreground'>{item.doctor_name || 'Belum Ditugaskan'}</span>
                          </p>
                        </div>

                        {/* Status Pill */}
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0',
                            statusConfig.pillBg,
                            statusConfig.pillBorder
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full shrink-0', statusConfig.dotGradient)} />
                          <span className={cn('bg-clip-text text-transparent font-bold', statusConfig.textGradient)}>
                            {statusConfig.label}
                          </span>
                        </span>
                      </div>

                      {/* Time & Date */}
                      <div className='flex items-center gap-2 text-xs text-muted-foreground font-mono'>
                        <Icons.calendar className='size-3 text-muted-foreground shrink-0' />
                        <span>{formatClinicDate(item.scheduled_date, { style: 'human_medium' })}</span>
                        <span>•</span>
                        <Icons.clock className='size-3 text-muted-foreground shrink-0' />
                        <span>{formatClinicTime(item.scheduled_start_time)}</span>
                      </div>

                      {/* Complaint or Notes */}
                      {item.complaint && (
                        <div className='text-xs text-foreground/80 bg-muted/40 p-2 rounded-lg border border-border/30'>
                          <span className='text-[10px] font-medium text-muted-foreground block mb-0.5'>
                            Keluhan Pasien:
                          </span>
                          <span className='italic'>{item.complaint}</span>
                        </div>
                      )}

                      {/* Cancel reason */}
                      {item.cancel_reason && (
                        <div className='text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20'>
                          <span className='text-[10px] font-medium block mb-0.5'>
                            Alasan Pembatalan:
                          </span>
                          <span>{item.cancel_reason}</span>
                        </div>
                      )}

                      {/* Associated Form Trigger */}
                      {item.has_associated_form && (
                        <div className='pt-1'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            shape='pill'
                            onClick={() => toggleForm(item.id)}
                            className={cn(
                              'text-xs font-semibold gap-1.5 h-7 px-3 cursor-pointer transition-colors',
                              isFormExpanded
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'text-primary hover:text-primary hover:bg-primary/10 border-primary/30'
                            )}
                          >
                            <Icons.page className='size-3.5' />
                            <span>
                              {isFormExpanded ? 'Tutup Berkas Form' : 'Lihat Form Terkait'}
                              {item.associated_form_type === 'maternal'
                                ? ' (KIA ANC)'
                                : item.associated_form_type === 'immunization'
                                  ? ' (Imunisasi)'
                                  : ''}
                            </span>
                          </Button>

                          {/* Expanded Read-Only Form Content */}
                          {isFormExpanded && (
                            <div className='mt-2.5 p-3 rounded-xl border border-border/60 bg-muted/15 animate-in fade-in-50 duration-200'>
                              <BookedPatientKiaIntake appointmentId={item.id} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className='pt-2.5 border-t border-border/40 flex items-center justify-end'>
          <Button
            type='button'
            variant='default'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-7 font-semibold cursor-pointer'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
