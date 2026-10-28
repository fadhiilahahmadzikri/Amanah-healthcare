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
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { formatClinicDate } from '@/lib/date-format';
import type { SessionContext } from '@/features/klinik/components/appointment-card';
import type { DoctorDailySession, DoctorSchedule } from '../../api/types';
import { sessionPatientsQueryOptions } from '../../api/queries';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import { DoctorSessionPatientCarousel } from './doctor-session-patient-carousel';

export interface DoctorSessionAccordionItemProps {
  session: DoctorDailySession;
  doctor: DoctorSchedule;
  selectedDate?: string;
  isPending: boolean;
  onToggleStatus: (session: DoctorDailySession) => void;
  onSelectPatient: (patient: BookedPatientItem, session: DoctorDailySession) => void;
  onOpenPatientsModal?: (session: DoctorDailySession) => void;
  className?: string;
}

/**
 * Clean Single Outer Container for a Session using AccordionItem
 * Header contains: session name, status, patient count, time & room (as tooltip), more options menu.
 * Content displays: responsive horizontal patient carousel using BookedPatientOuterCard.
 */
export function DoctorSessionAccordionItem({
  session,
  doctor,
  selectedDate,
  isPending,
  onToggleStatus,
  onSelectPatient,
  onOpenPatientsModal,
  className
}: DoctorSessionAccordionItemProps) {
  const doctorId = doctor.id || '';
  const isClosed = session.sessionStatus === 'CLOSED';
  const effectiveDate = session.date || selectedDate;

  // Fetch registered patients for this session
  const { data: patientsData, isLoading: isLoadingPatients } = useQuery({
    ...sessionPatientsQueryOptions(doctorId, session.id, { date: effectiveDate }),
    enabled: Boolean(doctorId && session.id)
  });

  const patientsList: BookedPatientItem[] = patientsData?.patients || [];
  const bookedCount = session.bookedPatients ?? patientsList.length;

  const sessionTimeDisplay = React.useMemo(() => {
    return `${session.startTime} - ${session.endTime} WIB`;
  }, [session.startTime, session.endTime]);

  const formattedDisplayDate = React.useMemo(() => {
    if (!effectiveDate) return '';
    return formatClinicDate(effectiveDate);
  }, [effectiveDate]);

  const sessionContext: SessionContext = React.useMemo(
    () => ({
      doctorName: doctor.fullName,
      doctorSpecialty: doctor.specialty,
      date: formattedDisplayDate,
      sessionTime: sessionTimeDisplay
    }),
    [doctor.fullName, doctor.specialty, formattedDisplayDate, sessionTimeDisplay]
  );

  return (
    <AccordionItem
      value={session.id}
      className={cn(
        'border-b border-border/40 last:border-b-0 bg-card transition-colors rounded-none',
        isClosed && 'bg-muted/10 opacity-80',
        className
      )}
    >
      {/* Accordion Header: Essential info + Time/Room Tooltip */}
      <AccordionTrigger className='px-4 sm:px-5 py-3 hover:no-underline rounded-none bg-muted/15 hover:bg-muted/25 border-b border-border/30 data-[state=closed]:border-b-0 transition-colors'>
        <div className='flex items-center justify-between w-full pr-3 min-w-0'>
          {/* Left: Session Name, Status, Registered Patient Count, Time/Room Tooltip */}
          <div className='flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0'>
            <h4 className='font-bold text-sm sm:text-base text-foreground tracking-tight'>
              {session.sessionName}
            </h4>
            <StatusBadge status={session.sessionStatus} variant='pill' size='sm' />
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                    }
                  }}
                >
                  <Icons.clock className='size-3 text-muted-foreground shrink-0' />
                  <span>
                    {session.startTime}–{session.endTime}
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
                    {session.startTime} – {session.endTime} WIB
                  </span>
                </div>
                {session.roomName && (
                  <div className='flex items-center gap-1.5 text-primary-foreground/90'>
                    <Icons.mapPin className='size-3 shrink-0' />
                    <span>Ruangan: {session.roomName}</span>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right: More Options Menu */}
          <div className='flex items-center gap-1 shrink-0'>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <span
                  role='button'
                  tabIndex={0}
                  className='size-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer select-none'
                  aria-label={`Opsi untuk sesi ${session.sessionName}`}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.click();
                    }
                  }}
                >
                  <Icons.moreHorizontal className='size-4' />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48 text-xs font-sans'>
                {onOpenPatientsModal && (
                  <DropdownMenuItem
                    onClick={() => onOpenPatientsModal(session)}
                    className='cursor-pointer gap-2 text-xs py-2'
                  >
                    <Icons.user className='size-3.5' />
                    <span>Daftar Pasien ({bookedCount})</span>
                  </DropdownMenuItem>
                )}
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

      {/* Accordion Content: Full-Featured Horizontal Patient Carousel */}
      <AccordionContent className='px-4 sm:px-5 py-3.5 sm:py-4'>
        <DoctorSessionPatientCarousel
          patients={patientsList}
          isLoading={isLoadingPatients}
          sessionContext={sessionContext}
          onSelectPatient={(p) => onSelectPatient(p, session)}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
