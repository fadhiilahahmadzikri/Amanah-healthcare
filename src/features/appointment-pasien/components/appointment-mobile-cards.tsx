'use client';

import React, { useState } from 'react';
import type { AdminAppointment } from '../api/types';
import { adminAppointmentToAppointment } from '../api/mapper';
import { AppointmentCardOrganism } from '@/features/klinik/components/appointment-card';
import { AUDIENCE } from '@/core/auth/permissions.constants';
import { AppointmentCardsSkeleton } from '@/features/klinik/components/appointment-cards-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { AppointmentActionDrawer } from './appointment-action-drawer';

export interface AppointmentMobileCardsProps {
  appointments: AdminAppointment[];
  onRowClick: (appointment: AdminAppointment) => void;
  onAssignDoctor: (appointment: AdminAppointment) => void;
  onAssignRoom: (appointment: AdminAppointment) => void;
  onUpdateStatus: (appointment: AdminAppointment) => void;
  onQrCheckIn: (appointment: AdminAppointment) => void;
  onReschedule: (appointment: AdminAppointment) => void;
  onViewDetail: (appointment: AdminAppointment) => void;
  onViewTimeline?: (appointment: AdminAppointment) => void;
  onOpenActionDrawer?: (appointment: AdminAppointment) => void;
  hasFilters: boolean;
  isLoading?: boolean;
}

export function AppointmentMobileCards({
  appointments,
  onRowClick,
  onAssignDoctor,
  onAssignRoom,
  onUpdateStatus,
  onQrCheckIn,
  onReschedule,
  onViewDetail,
  onViewTimeline,
  onOpenActionDrawer,
  hasFilters,
  isLoading = false
}: AppointmentMobileCardsProps) {
  const [selectedActionAppointment, setSelectedActionAppointment] =
    useState<AdminAppointment | null>(null);

  if (isLoading) {
    return <AppointmentCardsSkeleton count={4} className='grid grid-cols-1 gap-3.5' />;
  }

  if (appointments.length === 0) {
    return (
      <div className='flex flex-1 min-h-[300px] flex-col items-center justify-center p-4'>
        {hasFilters ? (
          <EmptyState
            title='Tidak ada antrean yang cocok'
            description='Tidak ditemukan antrean janji temu dengan filter atau kata kunci pencarian yang dipilih.'
          />
        ) : (
          <EmptyState
            title='Belum ada antrean janji temu'
            description='Data janji temu dan reservasi pasien akan ditampilkan di sini setelah didaftarkan.'
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-3.5 pb-24'>
        {appointments.map((item) => {
          const adapted = adminAppointmentToAppointment(item);

          return (
            <div key={item.id} className='transition-transform'>
              <AppointmentCardOrganism
                appointment={adapted}
                viewerAudience={AUDIENCE.INTERNAL}
                onViewDetails={() => onRowClick(item)}
                actionsSlot={
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenActionDrawer) {
                        onOpenActionDrawer(item);
                      } else {
                        setSelectedActionAppointment(item);
                      }
                    }}
                    aria-label={`Aksi untuk pasien ${item.patientName}`}
                    className='size-7.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer shrink-0'
                  >
                    <Icons.ellipsis className='size-4' />
                  </Button>
                }
              />
            </div>
          );
        })}
      </div>

      {/* Centralized Action Drawer for Mobile Cards (rendered internally if not provided by parent) */}
      {!onOpenActionDrawer && (
        <AppointmentActionDrawer
          isOpen={Boolean(selectedActionAppointment)}
          appointment={selectedActionAppointment}
          onClose={() => setSelectedActionAppointment(null)}
          onAssignDoctor={onAssignDoctor}
          onAssignRoom={onAssignRoom}
          onUpdateStatus={onUpdateStatus}
          onQrCheckIn={onQrCheckIn}
          onReschedule={onReschedule}
          onViewRecord={onRowClick}
          onViewTimeline={onViewTimeline}
          onViewPatientDetail={onViewDetail}
          onCancel={onViewDetail}
        />
      )}
    </>
  );
}
