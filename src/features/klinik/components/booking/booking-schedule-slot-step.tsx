'use client';

import React, { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  patientAffiliationService,
  type BookingOptionShift
} from '@/features/data-pasien/api/patient-affiliation-service';

export interface BookingScheduleSlotStepProps {
  onBack: () => void;
  onSubmitBooking: (bookingData: {
    poliklinikId: string;
    layananId: string;
    appointmentDate: string;
    session: string;
    visitType: string;
    complaint: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
  initialVisitType?: string;
  initialComplaint?: string;
  poliklinikId?: string;
  layananId?: string;
}

export function BookingScheduleSlotStep({
  onBack,
  onSubmitBooking,
  isSubmitting = false,
  initialVisitType,
  initialComplaint,
  poliklinikId: preferredPoliId,
  layananId: preferredLayananId
}: BookingScheduleSlotStepProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10);

  const [dateStr, setDateStr] = useState(defaultDateStr);
  const [shifts, setShifts] = useState<BookingOptionShift[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [selectedShift, setSelectedShift] = useState<BookingOptionShift | null>(null);
  const [visitType, setVisitType] = useState(initialVisitType || 'Pemeriksaan Baru');
  const [complaint, setComplaint] = useState(initialComplaint || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingShifts(true);
    setSelectedShift(null);

    patientAffiliationService
      .getBookingOptions(dateStr)
      .then((data) => {
        if (isMounted) {
          setShifts(data);
          const available = data.find((s) => s.isAvailable);
          if (available) {
            setSelectedShift(available);
          }
          setIsLoadingShifts(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching booking options:', err);
          setIsLoadingShifts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dateStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedShift) {
      setErrorMsg('Silakan pilih salah satu sesi shift praktik yang tersedia.');
      return;
    }
    if (!complaint.trim()) {
      setErrorMsg('Keluhan utama atau alasan kunjungan wajib diisi.');
      return;
    }

    try {
      await onSubmitBooking({
        poliklinikId: preferredPoliId || selectedShift.poliklinikId,
        layananId: preferredLayananId || selectedShift.layananId,
        appointmentDate: dateStr,
        session: selectedShift.session,
        visitType,
        complaint
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal memproses janji temu. Silakan coba kembali.';
      setErrorMsg(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 max-h-[460px] overflow-y-auto px-1 pr-2'>
      <div className='border-b border-border/50 pb-2 mb-3'>
        <h4 className='text-sm sm:text-base font-bold text-foreground'>
          Pilih Tanggal & Sesi Praktik Dokter
        </h4>
        <p className='text-xs text-muted-foreground'>
          Kuota dan sesi diambil langsung dari jadwal dokter yang aktif
        </p>
      </div>

      {errorMsg && (
        <div className='p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold'>
          {errorMsg}
        </div>
      )}

      {/* Tanggal Booking */}
      <div className='space-y-1.5'>
        <Label className='text-xs font-semibold text-foreground'>Tanggal Rencana Kunjungan *</Label>
        <Input
          required
          type='date'
          value={dateStr}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDateStr(e.target.value)}
          className='h-9 text-xs rounded-xl max-w-xs'
        />
      </div>

      {/* Sesi Shift Pilihan */}
      <div className='space-y-2'>
        <Label className='text-xs font-semibold text-foreground'>Pilihan Sesi & Kuota</Label>

        {isLoadingShifts ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='h-20 rounded-xl bg-muted/40 animate-pulse border border-border/40'
              />
            ))}
          </div>
        ) : shifts.length === 0 ? (
          <div className='p-6 text-center border border-dashed rounded-xl bg-muted/10'>
            <Icons.calendar className='size-6 text-muted-foreground mx-auto mb-1.5 opacity-60' />
            <p className='text-xs font-medium text-foreground'>
              Tidak ada jadwal dokter aktif pada tanggal ini
            </p>
            <p className='text-[11px] text-muted-foreground mt-0.5'>Silakan pilih tanggal lain</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
            {shifts.map((shift) => {
              const isSelected = selectedShift?.session === shift.session;
              return (
                <button
                  type='button'
                  key={shift.session}
                  disabled={!shift.isAvailable}
                  onClick={() => shift.isAvailable && setSelectedShift(shift)}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all flex flex-col justify-between select-none text-left w-full',
                    !shift.isAvailable
                      ? 'opacity-50 cursor-not-allowed bg-muted/20 border-border/40'
                      : isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30 cursor-pointer shadow-xs'
                        : 'border-border/60 bg-card hover:border-primary/40 cursor-pointer'
                  )}
                >
                  <div className='flex items-start justify-between gap-1 mb-1'>
                    <div>
                      <span className='text-xs font-bold text-foreground block'>{shift.label}</span>
                      <span className='text-[11px] text-muted-foreground font-mono'>
                        {shift.timeRange}
                      </span>
                    </div>

                    <Badge
                      variant={shift.isAvailable ? 'secondary' : 'outline'}
                      className={cn(
                        'text-[10px] font-semibold px-2 py-0.5',
                        shift.isAvailable ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {shift.isAvailable ? `Sisa ${shift.availableQuota}` : 'Penuh'}
                    </Badge>
                  </div>

                  <div className='pt-2 border-t border-border/40 text-[11px] text-muted-foreground truncate'>
                    <span className='font-medium text-foreground'>{shift.doctorName}</span> •{' '}
                    <span>{shift.poliklinikName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tipe Kunjungan */}
      <div className='space-y-1.5 pt-1'>
        <Label className='text-xs font-semibold text-foreground'>Tipe Kunjungan</Label>
        <div className='grid grid-cols-2 gap-2'>
          {['Pemeriksaan Baru', 'Kontrol Ulang'].map((type) => (
            <button
              key={type}
              type='button'
              onClick={() => setVisitType(type)}
              className={cn(
                'h-9 rounded-xl text-xs font-medium border transition-colors select-none',
                visitType === type
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border/60 bg-muted/20 text-muted-foreground'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Keluhan */}
      <div className='space-y-1.5'>
        <Label className='text-xs font-semibold text-foreground'>Keluhan Utama *</Label>
        <Textarea
          required
          rows={2}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder='Jelaskan gejala atau keluhan yang dialami pasien...'
          className='text-xs rounded-xl min-h-[60px]'
        />
      </div>

      {/* Actions */}
      <div className='flex items-center justify-end gap-2.5 pt-3 border-t border-border/40'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          shape='pill'
          onClick={onBack}
          disabled={isSubmitting}
        >
          Kembali
        </Button>
        <Button
          type='submit'
          variant='default'
          size='sm'
          shape='pill'
          disabled={isSubmitting || !selectedShift}
          className='font-bold px-6'
        >
          {isSubmitting ? 'Memproses Booking...' : 'Konfirmasi Janji Temu'}
        </Button>
      </div>
    </form>
  );
}
