'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import type { DoctorDailySession, DoctorSchedule } from '../../api/types';
import { sessionPatientsQueryOptions } from '../../api/queries';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import { DoctorSessionPatientCard } from './doctor-session-patient-card';

export interface DoctorSessionAccordionItemProps {
  session: DoctorDailySession;
  doctor: DoctorSchedule;
  selectedDate?: string;
  isPending: boolean;
  onToggleStatus: (session: DoctorDailySession) => void;
  onSelectPatient: (patient: BookedPatientItem, session: DoctorDailySession) => void;
  className?: string;
}

/**
 * Clean Single Outer Container for a Session using AccordionItem
 * Header contains: session name, status, patient count, time & room (as tooltip), more options menu.
 * Content displays: compact 5-column responsive grid of patient cards with text ellipsis.
 */
export function DoctorSessionAccordionItem({
  session,
  doctor,
  selectedDate,
  isPending,
  onToggleStatus,
  onSelectPatient,
  className
}: DoctorSessionAccordionItemProps) {
  const doctorId = doctor.id || doctor.practitioner_id || '';
  const isClosed = session.status_sesi === 'CLOSED';
  const effectiveDate = session.tanggal || selectedDate;

  // Fetch registered patients for this session
  const { data: patientsData, isLoading: isLoadingPatients } = useQuery({
    ...sessionPatientsQueryOptions(doctorId, session.id, { date: effectiveDate }),
    enabled: Boolean(doctorId && session.id)
  });

  const patientsList: BookedPatientItem[] = patientsData?.patients || [];
  const bookedCount = session.pasien_terdaftar ?? patientsList.length;

  return (
    <AccordionItem
      value={session.id}
      className={cn(
        'rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs transition-all last:border-b last:border-border/70',
        isClosed && 'bg-muted/10 opacity-80',
        className
      )}
    >
      {/* Accordion Header: Essential info + Time/Room Tooltip */}
      <AccordionTrigger className='px-4 py-3 hover:no-underline bg-muted/20 border-b border-border/30 data-[state=closed]:border-b-0 transition-colors'>
        <div className='flex items-center justify-between w-full pr-3 min-w-0'>
          {/* Left: Session Name, Status, Registered Patient Count, Time/Room Tooltip */}
          <div className='flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0'>
            <h4 className='font-bold text-sm sm:text-base text-foreground tracking-tight'>
              {session.nama_sesi}
            </h4>
            <StatusBadge status={isClosed ? 'Tutup' : 'Buka'} variant='pill' size='sm' />
            <span className='text-xs font-medium text-muted-foreground'>
              ({bookedCount} Pasien)
            </span>

            {/* Time & Room manifested compactly as a Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  role='button'
                  tabIndex={0}
                  className='inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-help px-1.5 py-0.5 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors'
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Icons.clock className='size-3 text-muted-foreground shrink-0' />
                  <span>
                    {session.jam_mulai}–{session.jam_selesai}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent
                side='top'
                className='text-xs space-y-1 py-1.5 px-2.5 shadow-md font-sans'
              >
                <p className='font-semibold text-primary-foreground'>Info Sesi</p>
                <div className='flex items-center gap-1.5 text-primary-foreground/90'>
                  <Icons.clock className='size-3 shrink-0' />
                  <span>
                    {session.jam_mulai} – {session.jam_selesai} WIB
                  </span>
                </div>
                {session.ruang && (
                  <div className='flex items-center gap-1.5 text-primary-foreground/90'>
                    <Icons.mapPin className='size-3 shrink-0' />
                    <span>Ruangan: {session.ruang}</span>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right: More Options Menu */}
          <div
            className='flex items-center gap-1 shrink-0'
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <span
                  role='button'
                  tabIndex={0}
                  className='size-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer select-none'
                  aria-label={`Opsi untuk sesi ${session.nama_sesi}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.click();
                    }
                  }}
                >
                  <Icons.moreHorizontal className='size-4' />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40 text-xs font-sans'>
                <DropdownMenuItem
                  disabled={isPending}
                  onClick={() => onToggleStatus(session)}
                  className='cursor-pointer gap-2 text-xs py-2'
                >
                  {isClosed ? (
                    <>
                      <Icons.check className='size-3.5' />
                      <span>Buka Sesi</span>
                    </>
                  ) : (
                    <>
                      <Icons.close className='size-3.5' />
                      <span>Tutup Sesi</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </AccordionTrigger>

      {/* Accordion Content: Compact 5-column patient grid */}
      <AccordionContent className='p-3 sm:p-3.5 pt-2'>
        {isLoadingPatients ? (
          <div className='grid grid-cols-2 sm:grid-cols-5 gap-1.5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='h-8 rounded-lg bg-muted/30 animate-pulse border border-border/30'
              />
            ))}
          </div>
        ) : patientsList.length === 0 ? (
          <EmptyState
            title='Belum ada pasien'
            description='Belum ada pasien yang mendaftar pada sesi ini.'
            className='min-h-[220px] py-4 bg-transparent border-dashed border-border/60'
            animationClassName='w-36 h-36 sm:w-44 sm:h-44'
          />
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-5 gap-1.5'>
            {patientsList.map((patient) => (
              <DoctorSessionPatientCard
                key={patient.appointmentId}
                patient={patient}
                onSelect={(p) => onSelectPatient(p, session)}
              />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
