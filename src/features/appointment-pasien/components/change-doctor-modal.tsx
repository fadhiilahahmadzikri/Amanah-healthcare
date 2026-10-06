'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doctorCandidatesQueryOptions, appointmentKeys } from '../api/queries';
import { changeAppointmentDoctor } from '../api/service';
import { getQueryClient } from '@/lib/query-client';
import { DoctorAvatar } from '@/features/klinik/components/doctor-avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { DoctorCandidateItem, ChangeDoctorPayload } from '../api/types';

export interface ChangeDoctorModalProps {
  isOpen: boolean;
  appointmentId: string;
  patientName?: string;
  patientId?: string;
  queueNumber?: string;
  currentDoctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onViewAppointment?: (appointmentId: string) => void;
}

export function ChangeDoctorModal({
  isOpen,
  appointmentId,
  patientName = '-',
  patientId: _patientId = '-',
  queueNumber = '-',
  currentDoctorName = '-',
  appointmentDate: _appointmentDate = '-',
  appointmentTime: _appointmentTime = '-',
  onClose,
  onSuccess,
  onViewAppointment
}: ChangeDoctorModalProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [shouldCloseOldSchedule, setShouldCloseOldSchedule] = useState(false);
  const [closeReason, setCloseReason] = useState('');

  const {
    data: candidatesData,
    isLoading,
    isError
  } = useQuery({
    ...doctorCandidatesQueryOptions(appointmentId),
    enabled: isOpen && Boolean(appointmentId)
  });

  const groups = useMemo(() => candidatesData?.groups || [], [candidatesData]);

  useEffect(() => {
    if (groups.length > 0 && (!activeTab || !groups.some((g) => g.id === activeTab))) {
      setActiveTab(groups[0].id);
    }
  }, [groups, activeTab]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctorId(null);
      setShouldCloseOldSchedule(false);
      setCloseReason('');
    }
  }, [isOpen]);

  const allDoctors = useMemo(() => {
    const map = new Map<string, DoctorCandidateItem>();
    for (const group of groups) {
      for (const doc of group.doctors) {
        map.set(doc.id, doc);
      }
    }
    return map;
  }, [groups]);

  const selectedDoctor = selectedDoctorId ? allDoctors.get(selectedDoctorId) : null;

  const mutation = useMutation({
    mutationFn: (payload: ChangeDoctorPayload) =>
      changeAppointmentDoctor(payload.appointmentId, payload.doctorId, {
        closeOldSchedule: payload.closeOldSchedule,
        reason: payload.reason
      }),
    onSuccess: (res) => {
      const qc = getQueryClient();
      void qc.invalidateQueries({ queryKey: appointmentKeys.all });
      void qc.invalidateQueries({ queryKey: ['doctor-schedules'] });

      if (res?.success === false) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message, {
        description: `Pasien kini ditugaskan kepada ${selectedDoctor?.name || 'Dokter baru'}.`,
        action: onViewAppointment
          ? {
              label: 'Lihat Janji Temu',
              onClick: () => onViewAppointment(appointmentId)
            }
          : undefined
      });
      onSuccess?.();
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal mengubah dokter');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.warning('Silakan pilih salah satu dokter');
      return;
    }

    await mutation.mutateAsync({
      appointmentId,
      doctorId: selectedDoctorId,
      closeOldSchedule: shouldCloseOldSchedule,
      reason: closeReason.trim() || undefined
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[508px]'
      showCloseButton={false}
      dismissible={!mutation.isPending}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl'
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-1 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Ganti Dokter Janji Temu
            </h3>
            <div className='flex items-center gap-2 text-xs text-muted-foreground flex-wrap'>
              <span>
                Pasien: <strong className='text-foreground font-semibold'>{patientName}</strong>
              </span>
              {queueNumber && queueNumber !== '-' && (
                <span className='inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px]'>
                  Antrean: {queueNumber}
                </span>
              )}
              {currentDoctorName && currentDoctorName !== '-' && (
                <span className='text-muted-foreground'>
                  • Dokter saat ini:{' '}
                  <span className='text-foreground font-medium'>{currentDoctorName}</span>
                </span>
              )}
              {onViewAppointment && (
                <button
                  type='button'
                  onClick={() => onViewAppointment(appointmentId)}
                  className='text-xs font-semibold text-primary hover:underline cursor-pointer transition-colors ml-1'
                >
                  Lihat Pasien
                </button>
              )}
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50'
          >
            <Icons.close className='size-4' />
          </button>
        </div>
        <div className='space-y-2.5 pt-0.5 min-h-[180px]'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-foreground block'>
              Pilih Dokter Pengganti:
            </span>
            {selectedDoctor && (
              <span className='text-[11px] text-primary font-medium truncate max-w-[200px]'>
                Terpilih: {selectedDoctor.name}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className='py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <Icons.spinner className='size-6 animate-spin text-primary' />
              <span className='text-xs'>Memeriksa ketersediaan jadwal dokter...</span>
            </div>
          ) : isError ? (
            <div className='p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs space-y-1'>
              <p className='font-semibold'>Gagal memuat kandidat dokter</p>
              <p className='text-muted-foreground'>
                Silakan periksa koneksi atau coba beberapa saat lagi.
              </p>
            </div>
          ) : groups.length === 0 ? (
            <div className='py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl p-4'>
              Tidak ada dokter kandidat lain yang tersedia pada tanggal dan slot waktu ini.
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <TabsList className='w-full justify-start overflow-x-auto h-9 p-1 bg-muted/60'>
                {groups.map((group) => (
                  <TabsTrigger
                    key={group.id}
                    value={group.id}
                    className='text-xs px-3 py-1 data-[state=active]:bg-background'
                  >
                    <span>{group.name}</span>
                    <span className='ml-1.5 text-[10px] opacity-70'>({group.doctors.length})</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {groups.map((group) => (
                <TabsContent
                  key={group.id}
                  value={group.id}
                  className='pt-2 space-y-2 max-h-[220px] overflow-y-auto pr-1'
                >
                  {group.doctors.length === 0 ? (
                    <p className='text-xs text-muted-foreground text-center py-4'>
                      Tidak ada dokter di kategori ini yang tersedia.
                    </p>
                  ) : (
                    group.doctors.map((doctor) => {
                      const isSelected = selectedDoctorId === doctor.id;
                      return (
                        <button
                          key={doctor.id}
                          type='button'
                          aria-label={`Pilih dokter ${doctor.name}`}
                          onClick={() => setSelectedDoctorId(doctor.id)}
                          className={cn(
                            'w-full text-left relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none',
                            isSelected
                              ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                              : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20'
                          )}
                        >
                          <div className='flex items-center gap-3 min-w-0 flex-1'>
                            <div className='size-10 min-w-10 rounded-full overflow-hidden shrink-0 ring-1 ring-border/40'>
                              <DoctorAvatar name={doctor.name} size={40} />
                            </div>

                            <div className='min-w-0 flex-1'>
                              <h4 className='text-xs font-bold text-foreground truncate'>
                                {doctor.name}
                              </h4>
                              <p className='text-[11px] text-muted-foreground truncate'>
                                {doctor.specialty}
                                {doctor.defaultRoomName ? ` • ${doctor.defaultRoomName}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center shrink-0'>
                            <div
                              className={cn(
                                'size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                  : 'border-muted-foreground/30 bg-background'
                              )}
                            >
                              {isSelected && <Icons.check className='size-3 stroke-[2.5]' />}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
        <div className='p-3 sm:p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-2.5'>
          <div className='flex items-start gap-2.5'>
            <Checkbox
              id='close-old-schedule'
              checked={shouldCloseOldSchedule}
              onCheckedChange={(checked) => setShouldCloseOldSchedule(Boolean(checked))}
              className='mt-0.5'
            />
            <div className='space-y-0.5 leading-none flex-1'>
              <Label
                htmlFor='close-old-schedule'
                className='text-xs font-semibold cursor-pointer select-none text-foreground'
              >
                Tutup sesi jadwal dokter sebelumnya
              </Label>
              <p className='text-[11px] text-muted-foreground leading-normal'>
                Sesi ini akan ditandai tutup dan tidak menerima antrean baru.
              </p>
            </div>
          </div>

          {shouldCloseOldSchedule && (
            <div className='pt-1 animate-in fade-in duration-150 space-y-1.5'>
              <Input
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder='Alasan penutupan sesi (opsional)'
                className='h-8 text-xs bg-background'
              />
            </div>
          )}
        </div>
        <div className='pt-3 border-t border-border/40 flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            disabled={mutation.isPending}
            className='px-6 font-medium'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='default'
            disabled={mutation.isPending || !selectedDoctorId}
            className='px-7 font-semibold'
          >
            {mutation.isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            Simpan Perubahan Dokter
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
