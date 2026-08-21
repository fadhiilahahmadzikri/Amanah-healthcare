'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { initialDoctorSchedules } from '@/constants/mock-api-doctor-schedules';
import type { DoctorSchedule, DoctorDailySession } from '@/features/jadwal-dokter/api/types';
import { cn } from '@/lib/utils';

export interface AppointmentTimeSlotPickerProps {
  doctorName: string;
  selectedDateStr: string;
  selectedTimeSlot: string;
  onSelectTimeSlot: (timeSlot: string) => void;
  className?: string;
}

interface StandardShiftConfig {
  id: string;
  nama_sesi: string;
  jam_mulai: string;
  jam_selesai: string;
  waktu: string;
}

const STANDARD_SHIFTS: StandardShiftConfig[] = [
  {
    id: 'pagi',
    nama_sesi: 'Sesi Pagi',
    jam_mulai: '07:00',
    jam_selesai: '12:00',
    waktu: '07:00 - 12:00'
  },
  {
    id: 'siang',
    nama_sesi: 'Sesi Siang',
    jam_mulai: '12:00',
    jam_selesai: '17:00',
    waktu: '12:00 - 17:00'
  },
  {
    id: 'malam',
    nama_sesi: 'Sesi Malam',
    jam_mulai: '19:00',
    jam_selesai: '24:00',
    waktu: '19:00 - 24:00'
  }
];

function AccordionSessionItem({
  shift,
  slots,
  availableCount,
  isOpen,
  onToggle,
  selectedTimeSlot,
  onSelectTimeSlot
}: {
  shift: StandardShiftConfig;
  slots: { timeStr: string; isBooked: boolean }[];
  availableCount: number;
  isOpen: boolean;
  onToggle: () => void;
  selectedTimeSlot: string;
  onSelectTimeSlot: (timeStr: string) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        gsap.fromTo(
          contentRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.24, ease: 'power2.out' }
        );
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.18,
          ease: 'power2.in'
        });
      }
    }

    if (chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotate: isOpen ? 180 : 0,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  }, [isOpen]);

  return (
    <div className='border-b border-border/50 last:border-b-0 pb-2.5 pt-1'>
      {/* Clean Accordion Header (No wrap border) */}
      <button
        type='button'
        onClick={onToggle}
        className='w-full py-2 flex items-center justify-between text-left transition-colors cursor-pointer select-none group'
      >
        <div className='flex items-center gap-2.5'>
          <span className='text-xs font-bold text-foreground group-hover:text-primary transition-colors'>
            {shift.nama_sesi}
          </span>
          <span className='text-[11px] font-mono text-muted-foreground'>({shift.waktu})</span>
        </div>

        <div className='flex items-center gap-2.5'>
          <span
            className={cn(
              'text-[10.5px] font-semibold px-2 py-0.5 rounded-full',
              availableCount > 0
                ? 'text-success bg-success-subtle border border-success-border'
                : 'text-muted-foreground bg-muted'
            )}
          >
            {availableCount > 0 ? `${availableCount} slot tersedia` : 'Penuh'}
          </span>

          <Icons.chevronDown
            ref={chevronRef}
            className='size-4 text-muted-foreground transition-transform duration-200'
          />
        </div>
      </button>

      {/* GSAP Accordion Content (Slots Grid) */}
      <div
        ref={contentRef}
        className='overflow-hidden'
        style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 pb-1'>
          {slots.map((slot) => {
            const isSelected = selectedTimeSlot === slot.timeStr && !slot.isBooked;

            if (slot.isBooked) {
              return (
                <div
                  key={slot.timeStr}
                  aria-disabled='true'
                  className='py-2.5 px-3 rounded-lg border border-dashed border-border/50 bg-muted/20 text-muted-foreground/40 text-center font-mono text-xs font-medium line-through opacity-50 cursor-not-allowed select-none'
                >
                  {slot.timeStr}
                </div>
              );
            }

            return (
              <button
                key={slot.timeStr}
                type='button'
                onClick={() => onSelectTimeSlot(slot.timeStr)}
                className={cn(
                  'py-2.5 px-3 rounded-lg border text-center font-mono text-xs font-medium transition-all cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary dark:bg-indigo-600 text-primary-foreground font-bold shadow-2xs ring-2 ring-primary border-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent'
                )}
              >
                {slot.timeStr}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AppointmentTimeSlotPicker({
  doctorName,
  selectedDateStr,
  selectedTimeSlot,
  onSelectTimeSlot,
  className
}: AppointmentTimeSlotPickerProps) {
  const doctorSchedule: DoctorSchedule | undefined = useMemo(() => {
    return (
      initialDoctorSchedules.find(
        (d) => d.nama_dokter.toLowerCase() === doctorName.toLowerCase()
      ) || initialDoctorSchedules[0]
    );
  }, [doctorName]);

  // Generate standardized 30-min slots for Pagi (07:00-12:00), Siang (12:00-17:00), Malam (19:00-24:00)
  const shiftSlots = useMemo(() => {
    return STANDARD_SHIFTS.map((shift, shiftIdx) => {
      const startH = parseInt(shift.jam_mulai.split(':')[0], 10);
      const endH = parseInt(shift.jam_selesai.split(':')[0], 10);

      const rawSlots: string[] = [];
      let curMins = startH * 60;
      const endMins = endH * 60;

      while (curMins < endMins) {
        const h1 = Math.floor(curMins / 60);
        const m1 = curMins % 60;
        const nextMins = curMins + 30;
        const h2 = Math.floor(nextMins / 60);
        const m2 = nextMins % 60;

        const fmt1 = `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')}`;
        const fmt2 = `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`;
        rawSlots.push(`${fmt1} - ${fmt2} WIB`);

        curMins += 30;
      }

      // Slot availability: simulate based on doctor schedule quota
      const bookedCount = shiftIdx === 0 ? 3 : shiftIdx === 1 ? 4 : 2;
      const availableCount = Math.max(1, rawSlots.length - bookedCount);

      const slots = rawSlots.map((timeStr, idx) => {
        const isBooked = idx < bookedCount;
        return { timeStr, isBooked };
      });

      return {
        shift,
        slots,
        availableCount
      };
    });
  }, []);

  // Determine which accordion session is initially open
  const [openSessionId, setOpenSessionId] = useState<string>(() => {
    if (selectedTimeSlot) {
      const hour = parseInt(selectedTimeSlot.split(':')[0], 10);
      if (hour < 12) return 'pagi';
      if (hour < 18) return 'siang';
      return 'malam';
    }
    return 'pagi';
  });

  return (
    <div
      className={cn(
        'space-y-1 font-sans select-none max-h-[360px] overflow-y-auto pr-1',
        className
      )}
    >
      {shiftSlots.map(({ shift, slots, availableCount }) => (
        <AccordionSessionItem
          key={shift.id}
          shift={shift}
          slots={slots}
          availableCount={availableCount}
          isOpen={openSessionId === shift.id}
          onToggle={() => setOpenSessionId((prev) => (prev === shift.id ? '' : shift.id))}
          selectedTimeSlot={selectedTimeSlot}
          onSelectTimeSlot={onSelectTimeSlot}
        />
      ))}
    </div>
  );
}
