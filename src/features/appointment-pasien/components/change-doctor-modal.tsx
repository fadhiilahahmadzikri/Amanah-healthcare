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
import {
  DOCTOR_AVAILABILITY,
  type DoctorCandidateItem,
  type ChangeDoctorPayload
} from '../api/types';
import { DoctorAssignmentModal } from '@/features/jadwal-dokter/components/doctor-assignment-modal';
import type { DoctorSchedule } from '@/features/jadwal-dokter/api/types';

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
  const [rosterDoctor, setRosterDoctor] = useState<DoctorSchedule | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

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
  const isSelectedDoctorAvailable =
    selectedDoctor?.availability === DOCTOR_AVAILABILITY.AVAILABLE && !selectedDoctor?.isOnLeave;

  const targetDow = useMemo(() => {
    const rawDate = candidatesData?.scheduledDate || _appointmentDate;
    if (!rawDate || rawDate === '-') return undefined;
    const [y, m, d] = rawDate.split('-').map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d).getDay();
  }, [candidatesData?.scheduledDate, _appointmentDate]);

  const handleOpenDoctorRoster = (doc: DoctorCandidateItem) => {
    setRosterDoctor({
      id: doc.id,
      fullName: doc.name,
      specialty: doc.specialty || activeGroup?.name || '',
      practitionerId: doc.id,
      doctorStatus: 'OPEN',
      practiceRoom: '',
      practiceDate: candidatesData?.scheduledDate || '',
      avatar: doc.avatarUrl || '',
      todaySchedule: '',
      upcomingSchedule: '',
      scheduleStatus: 'OPEN',
      scheduleMonth: '',
      isOnLeave: false,
      totalPatients: 0,
      dailySessions: []
    } as unknown as DoctorSchedule);
    setIsRosterModalOpen(true);
  };

  const handleCloseRosterModal = () => {
    setIsRosterModalOpen(false);
    setRosterDoctor(null);
    const qc = getQueryClient();
    void qc.invalidateQueries({
      queryKey: appointmentKeys.doctorCandidates(appointmentId)
    });
  };

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
                const isKia = group.code === 'maternal_child_health';
                const availableCount = group.doctors.filter(
                  (d) => d.availability === DOCTOR_AVAILABILITY.AVAILABLE
                ).length;
                const scheduleRequiredCount = group.doctors.length - availableCount;
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
                      <div className='flex items-center gap-1.5 flex-wrap justify-end'>
                        {availableCount > 0 && (
                          <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                            {availableCount} Tersedia
                          </span>
                        )}
                        {scheduleRequiredCount > 0 && (
                          <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'>
                            {scheduleRequiredCount} Perlu Jadwal
                          </span>
                        )}
                        {group.doctors.length === 0 && (
                          <span className='text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
                            0 Dokter
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='space-y-1 mb-3'>
                      <h4 className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
                        {group.name}
                      </h4>
                      <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
                        Pelayanan pemeriksaan medis dan konsultasi {group.name}
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
              {groups.length > 1 && (
                <button
                  type='button'
                  onClick={() => setSelectedGroupId(null)}
                  className='inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer mb-1'
                >
                  <Icons.arrowLeft className='size-3.5' />
                  <span>Kategori: {activeGroup?.name} (Ubah)</span>
                </button>
              )}

              <div className='space-y-2 max-h-[250px] overflow-y-auto pr-1'>
                {activeGroup?.doctors.length === 0 ? (
                  <p className='text-xs text-muted-foreground text-center py-4'>
                    Tidak ada dokter di kategori ini yang tersedia.
                  </p>
                ) : (
                  activeGroup?.doctors.map((doctor) => {
                    const isSelected = selectedDoctorId === doctor.id;
                    const isRostered = doctor.availability === DOCTOR_AVAILABILITY.AVAILABLE;
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
                            <DoctorAvatar
                              name={doctor.name}
                              avatarUrl={doctor.avatarUrl || undefined}
                              size={40}
                            />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-2 flex-wrap'>
                              <h4 className='text-xs font-bold text-foreground truncate'>
                                {doctor.name}
                              </h4>
                              {doctor.isOnLeave ? (
                                <span
                                  className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0'
                                  title={doctor.leaveReason || 'Sedang Cuti'}
                                >
                                  Cuti
                                </span>
                              ) : isRostered ? (
                                <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0'>
                                  Tersedia
                                </span>
                              ) : (
                                <div className='flex items-center gap-1.5 shrink-0'>
                                  <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'>
                                    Perlu Jadwal
                                  </span>
                                  <span
                                    role='button'
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDoctorRoster(doctor);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        handleOpenDoctorRoster(doctor);
                                      }
                                    }}
                                    className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors cursor-pointer select-none'
                                    title={`Buka atau atur jadwal kerja untuk ${doctor.name}`}
                                  >
                                    <Icons.settings className='size-3' />
                                    <span>Buka Sesi</span>
                                  </span>
                                </div>
                              )}
                              {doctor.isReplacement && (
                                <span
                                  className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0'
                                  title={
                                    doctor.replacingDoctorName
                                      ? `Menggantikan ${doctor.replacingDoctorName}`
                                      : 'Dokter Pengganti'
                                  }
                                >
                                  Pengganti
                                </span>
                              )}
                              {doctor.attendanceWarning && !doctor.isOnLeave && (
                                <span
                                  className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0'
                                  title={doctor.attendanceWarning}
                                >
                                  <Icons.alertCircle className='size-3 text-amber-600 dark:text-amber-400' />
                                  <span>Belum Presensi</span>
                                </span>
                              )}
                            </div>
                            <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground truncate mt-0.5'>
                              <span>{doctor.specialty || activeGroup.name}</span>
                              {typeof doctor.currentQueueCount === 'number' && (
                                <>
                                  <span>•</span>
                                  <span className='font-medium text-foreground/75'>
                                    {doctor.currentQueueCount} antrean aktif
                                  </span>
                                </>
                              )}
                            </div>
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

        <div className='flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/40'>
          <div className='text-xs text-muted-foreground w-full sm:w-auto'>
            {selectedDoctor && !isSelectedDoctorAvailable && (
              <span className='text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1.5'>
                <Icons.alertCircle className='size-3.5 shrink-0' />
                <span>Dokter belum ada jadwal hari ini. Klik "Buka Sesi" untuk mengaktifkan.</span>
              </span>
            )}
          </div>

          <div className='flex items-center gap-3 w-full sm:w-auto justify-end'>
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
                disabled={mutation.isPending || !selectedDoctorId || !isSelectedDoctorAvailable}
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
        </div>
      </form>

      {isRosterModalOpen && rosterDoctor && (
        <DoctorAssignmentModal
          doctor={rosterDoctor}
          isOpen={isRosterModalOpen}
          onClose={handleCloseRosterModal}
          focusedDow={targetDow}
        />
      )}
    </ModalWrapper>
  );
}
