'use client';

import React from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { formatClinicDate, formatClinicDateTime } from '@/lib/date-format';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';
import { LeaveStatusBadge } from './leave-status-badge';
import { useLeaveDetailSheet } from '../model/useLeaveDetailSheet';
import type { LeaveRequestItem } from '../api/types';

export interface LeaveDetailModalProps {
  leave: LeaveRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

const LEAVE_TYPE_MAP: Record<string, string> = {
  annual_leave: 'Cuti Tahunan',
  sick_leave: 'Izin Sakit',
  seminar_symposium: 'Seminar / Simposium',
  family_matter: 'Keperluan Keluarga',
  external_assignment: 'Tugas Luar',
  other: 'Izin / Cuti Lainnya'
};

export function LeaveDetailModal({
  leave,
  isOpen,
  onClose,
  portalContainerRef
}: LeaveDetailModalProps) {
  const { approvalNotes, setApprovalNotes, handleReview, handleClose, isPending, isSubmitting } =
    useLeaveDetailSheet({ leave, onClose });
  const { can } = useAuthContext();
  const canApprove = can(PERMISSIONS.ATTENDANCE.APPROVE) || can(PERMISSIONS.ATTENDANCE.MANAGE);

  if (!leave) return null;

  const staff = leave.staff;
  const leaveTypeLabel = LEAVE_TYPE_MAP[leave.type] || leave.type;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth='max-w-4xl w-[95vw]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
      className='max-h-[90vh] flex flex-col p-5 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl font-sans text-left'
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
              {staff?.fullName || 'Detail Permohonan Izin'}
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              {staff?.roleName || staff?.profession || ''}
              {staff?.roleName && staff?.profession ? ` • ${staff.profession}` : ''}
              {staff?.idCardNumber ? ` • ID: ${staff.idCardNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Scrollable Body - 2 Columns Layout Matching StaffDetailEditModal */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-1'>
            {/* Kolom 1: Jadwal & Lingkup Izin */}
            <div className='space-y-4'>
              <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                Jadwal &amp; Lingkup Izin
              </span>

              <PatientLineInput
                id='leave_startDate'
                label='Tanggal Mulai'
                value={formatClinicDate(leave.startDate, { style: 'human_full' })}
                readOnly
                className='cursor-default'
              />

              <PatientLineInput
                id='leave_endDate'
                label='Tanggal Selesai'
                value={formatClinicDate(leave.endDate, { style: 'human_full' })}
                readOnly
                className='cursor-default'
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <PatientLineInput
                  id='leave_duration'
                  label='Total Durasi'
                  value={`${leave.durationDays} Hari`}
                  readOnly
                  className='cursor-default'
                />

                <PatientLineInput
                  id='leave_type'
                  label='Jenis Permohonan'
                  value={leaveTypeLabel}
                  readOnly
                  className='cursor-default font-semibold text-primary'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <PatientLineInput
                  id='leave_scope'
                  label='Lingkup Izin'
                  value={leave.scope === 'session' ? 'Per Sesi Tertentu' : '1 Hari Penuh'}
                  readOnly
                  className='cursor-default'
                />

                <PatientLineInput
                  id='leave_createdAt'
                  label='Diajukan Pada'
                  value={formatClinicDate(leave.createdAt, { style: 'human_full' })}
                  readOnly
                  className='cursor-default'
                />
              </div>

              {/* Sesi Dinas Terkait jika ada */}
              {leave.sessions && leave.sessions.length > 0 && (
                <div className='space-y-2 pt-2 border-t border-border/40'>
                  <span className='text-xs font-medium text-foreground block'>
                    Sesi Dinas Terkait
                  </span>
                  <div className='flex flex-wrap gap-1.5'>
                    {leave.sessions.map((s) => (
                      <span
                        key={s.id}
                        className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium'
                      >
                        <Icons.clock className='size-3 text-primary shrink-0' />
                        <span>
                          {s.sessionLabel} (
                          {formatClinicDate(s.workDate, { style: 'human_medium' })})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Kolom 2: Alasan Pengajuan & Peninjauan */}
            <div className='space-y-4'>
              <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                Alasan Pengajuan &amp; Peninjauan
              </span>

              <div className='space-y-1.5'>
                <label htmlFor='leave_reason' className='text-xs font-medium text-foreground block'>
                  Alasan Pengajuan
                </label>
                <div className='p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs text-foreground italic leading-relaxed'>
                  &ldquo;{leave.reason}&rdquo;
                </div>
              </div>

              {/* Riwayat Peninjauan jika sudah disetujui / ditolak */}
              {(leave.status === 'approved' || leave.status === 'rejected') && (
                <div className='space-y-2.5 pt-2 border-t border-border/40'>
                  <span className='text-xs font-medium text-foreground block'>
                    Informasi Peninjauan
                  </span>
                  <div className='p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2 text-xs'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground text-[11px]'>Status Peninjauan:</span>
                      <LeaveStatusBadge status={leave.status} />
                    </div>
                    {leave.approvalNotes && (
                      <div className='flex flex-col gap-0.5 pt-1 border-t border-border/30'>
                        <span className='text-muted-foreground text-[11px]'>Catatan Peninjau:</span>
                        <span className='text-foreground font-medium'>{leave.approvalNotes}</span>
                      </div>
                    )}
                    {leave.updatedAt && (
                      <div className='flex items-center justify-between text-muted-foreground text-[11px] pt-1 border-t border-border/30'>
                        <span>Waktu Peninjauan:</span>
                        <span>{formatClinicDateTime(leave.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Aksi Peninjauan Khusus Admin jika Pending */}
              {isPending && (
                <div className='space-y-3 pt-2 border-t border-border/40'>
                  <div className='space-y-0.5'>
                    <span className='text-xs font-semibold text-foreground block'>
                      Tindakan Persetujuan Manajemen
                    </span>
                    <p className='text-[11px] text-muted-foreground'>
                      Tinjau permohonan ini. Menyetujui izin akan secara otomatis membuka slot dinas
                      pengganti bagi rekan sejawat.
                    </p>
                  </div>

                  <div className='space-y-1.5'>
                    <label
                      htmlFor='approval-notes'
                      className='text-xs font-medium text-foreground block'
                    >
                      Catatan Peninjauan (Opsional)
                    </label>
                    <Textarea
                      id='approval-notes'
                      placeholder='Tuliskan catatan persetujuan atau alasan penolakan...'
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      rows={2}
                      className='text-xs'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/40 flex items-center justify-end gap-2.5'>
          {isPending && canApprove && (
            <Button
              type='button'
              variant='outline'
              size='md'
              shape='pill'
              disabled={isSubmitting}
              onClick={() => handleReview('rejected')}
              className='px-6 text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer'
            >
              Tolak Permohonan
            </Button>
          )}

          <Button
            type='button'
            variant='outline'
            size='md'
            shape='pill'
            onClick={handleClose}
            disabled={isSubmitting}
            className='px-6 text-xs font-semibold cursor-pointer'
          >
            Tutup
          </Button>

          {isPending && canApprove && (
            <Button
              type='button'
              variant='default'
              size='md'
              shape='pill'
              disabled={isSubmitting}
              onClick={() => handleReview('approved')}
              className='px-7 text-xs font-semibold cursor-pointer'
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className='size-3.5 mr-1.5 animate-spin' />
                  Menyimpan...
                </>
              ) : (
                'Setujui Permohonan'
              )}
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
