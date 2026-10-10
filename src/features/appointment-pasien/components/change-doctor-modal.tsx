'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [shouldCloseOldSchedule, setShouldCloseOldSchedule] = useState(false);
  const [closeReason, setCloseReason] = useState('');

  const isAssignMode =
    !currentDoctorName || currentDoctorName === '-' || currentDoctorName === 'Belum di-assign';

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
    if (!isOpen) {
      setSelectedDoctorId(null);
      setSelectedGroupId(null);
      setShouldCloseOldSchedule(false);
      setCloseReason('');
    } else if (groups.length === 1 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [isOpen, groups, selectedGroupId]);

  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

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

  const currentStep = activeGroup ? 'doctor' : 'category';

  const modalTitle =
    currentStep === 'category'
      ? isAssignMode
        ? 'Pilih Kategori Dokter'
        : 'Pilih Kategori Dokter Pengganti'
      : isAssignMode
        ? 'Tugaskan Dokter Pemeriksa'
        : 'Ganti Dokter Pemeriksa';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[500px]'
      showCloseButton={false}
      dismissible={!mutation.isPending}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl'
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        <div className='flex items-start justify-between gap-3 pb-3 border-b border-border/40'>
          <div className='space-y-1 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {modalTitle}
            </h3>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Janji temu untuk <span className='font-semibold text-foreground'>{patientName}</span>
              {queueNumber && queueNumber !== '-' ? ` dengan nomor antrean ${queueNumber}` : ''}
              {!isAssignMode && currentDoctorName && currentDoctorName !== '-'
                ? `, saat ini ditangani oleh ${currentDoctorName}`
                : ''}
              .
              {onViewAppointment && (
                <button
                  type='button'
                  onClick={() => onViewAppointment(appointmentId)}
                  className='text-xs font-semibold text-primary hover:underline cursor-pointer ml-1.5 inline-block'
                >
                  Lihat Pasien
                </button>
              )}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        <div className='space-y-3 pt-0.5'>
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
              Tidak ada dokter kandidat lain yang tersedia pada tanggal dan sesi praktik ini.
            </div>
          ) : currentStep === 'category' ? (
            <div
              className={cn(
                'grid gap-3 pt-1',
                groups.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
              )}
            >
              {groups.map((group) => {
                const nameLower = group.name.toLowerCase();
                const isKia =
                  nameLower.includes('anak') ||
                  nameLower.includes('ibu') ||
                  nameLower.includes('kia') ||
                  nameLower.includes('bidan');
                return (
                  <button
                    key={group.id}
                    type='button'
                    onClick={() => setSelectedGroupId(group.id)}
                    className='p-4 border border-border/70 hover:border-primary/60 transition-all cursor-pointer hover:shadow-xs rounded-2xl flex flex-col justify-between group bg-card text-left'
                  >
                    <div className='flex items-center justify-between w-full mb-3'>
                      <div className='size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                        {isKia ? (
                          <Icons.heart className='size-4.5 text-primary' />
                        ) : (
                          <Icons.stethoscope className='size-4.5 text-primary' />
                        )}
                      </div>
                      <span className='text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
                        {group.doctors.length} Dokter
                      </span>
                    </div>
                    <div className='space-y-1 mb-3'>
                      <h4 className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
                        {group.name}
                      </h4>
                      <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
                        {isKia
                          ? 'Pelayanan kesehatan ibu, anak, imunisasi, dan kebidanan'
                          : 'Pelayanan pemeriksaan medis umum dan konsultasi dokter'}
                      </p>
                    </div>
                    <div className='flex items-center gap-1 text-xs font-semibold text-primary pt-1'>
                      <span>Pilih Kategori</span>
                      <Icons.arrowRight className='size-3 group-hover:translate-x-0.5 transition-transform' />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className='space-y-2.5'>
              <div className='space-y-2 max-h-[250px] overflow-y-auto pr-1'>
                {activeGroup?.doctors.length === 0 ? (
                  <p className='text-xs text-muted-foreground text-center py-4'>
                    Tidak ada dokter di kategori ini yang tersedia.
                  </p>
                ) : (
                  activeGroup?.doctors.map((doctor) => {
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
                              {doctor.specialty || activeGroup.name}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center shrink-0 pl-2'>
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
              </div>

              {!isAssignMode && (
                <div className='p-3 rounded-xl border border-border/50 bg-muted/20 space-y-2 mt-2'>
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
                    <div className='pt-1 animate-in fade-in duration-150'>
                      <Input
                        value={closeReason}
                        onChange={(e) => setCloseReason(e.target.value)}
                        placeholder='Alasan penutupan sesi (opsional)'
                        className='h-8 text-xs bg-background'
                      />
                    </div>
                  )}
                </div>
              )}
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

          {currentStep === 'doctor' && (
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
              {isAssignMode ? 'Tugaskan Dokter' : 'Simpan Perubahan'}
            </Button>
          )}
        </div>
      </form>
    </ModalWrapper>
  );
}
