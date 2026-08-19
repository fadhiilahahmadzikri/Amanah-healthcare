'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { Appointment, AppointmentStatus, AppointmentFormData } from '../api/types';
import { AppointmentCard } from './appointment-card';
import { AppointmentFilters } from './appointment-filters';
import { AppointmentPagination } from './appointment-pagination';
import { AppointmentModal } from './appointment-modal';
import { DetailsModal } from './details-modal';
import { Button } from '@/components/ui/button';
import {
  getDoctorByName,
  loadStoredAppointments,
  saveAppointmentsToStorage,
  createAppointmentRecord
} from '../api/service';

export function AppointmentsView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const data = loadStoredAppointments();
    setAppointments(data);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveAppointmentsToStorage(appointments);
    }
  }, [appointments, isInitialized]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Reset page to 1 whenever filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleMonthFilterChange = (val: string) => {
    setMonthFilter(val);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (val: Date | undefined) => {
    setDateFilter(val);
    setCurrentPage(1);
  };

  const handleSelectedServicesChange = (services: string[]) => {
    setSelectedServices(services);
    setCurrentPage(1);
  };

  const handleSelectedStatusesChange = (statuses: AppointmentStatus[]) => {
    setSelectedStatuses(statuses);
    setCurrentPage(1);
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setMonthFilter('ALL');
    setDateFilter(undefined);
    setSelectedServices([]);
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  // Broad & Precise Filtering Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      // 1. Global Search (Comprehensive fields)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const timeDots = (item.time || '').toLowerCase().replace(/:/g, '.');
        const timeColons = (item.time || '').toLowerCase().replace(/\./g, ':');

        const searchableFields = [
          item.patient_name,
          item.patient_email,
          item.id,
          item.booking_code,
          item.doctor_name,
          item.service,
          item.date,
          item.time,
          timeDots,
          timeColons,
          item.status,
          item.complaint,
          item.visit_type
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableFields.includes(query)) {
          return false;
        }
      }

      // 2. Month Filter
      if (monthFilter && monthFilter !== 'ALL') {
        const monthKey = monthFilter.split(' ')[0];
        if (!item.date.includes(monthKey)) {
          return false;
        }
      }

      // 3. Exact Date Filter
      if (dateFilter) {
        const day = dateFilter.getDate();
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'Mei',
          'Jun',
          'Jul',
          'Ags',
          'Sep',
          'Okt',
          'Nov',
          'Des'
        ];
        const datePattern = `${day} ${months[dateFilter.getMonth()]}`;
        if (!item.date.includes(datePattern)) {
          return false;
        }
      }

      // 4. Services / Poliklinik Filter
      if (selectedServices.length > 0) {
        if (!item.service || !selectedServices.includes(item.service)) {
          return false;
        }
      }

      // 5. Status Filter
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(item.status)) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, searchQuery, monthFilter, dateFilter, selectedServices, selectedStatuses]);

  // Paginated records (10 items per page)
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(startIndex, startIndex + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  const handleOpenCreateModal = () => {
    setSelectedAppointment(null);
    setFormModalMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenRescheduleModal = (item: Appointment) => {
    setSelectedAppointment(item);
    setFormModalMode('edit');
    setIsFormModalOpen(true);
  };

  const handleOpenDetailsModal = (item: Appointment) => {
    setSelectedAppointment(item);
    setIsDetailsModalOpen(true);
  };

  const handleAddAppointment = (formData: AppointmentFormData) => {
    const newRecord = createAppointmentRecord(formData, appointments);
    setAppointments((prev) => [newRecord, ...prev]);
    toast.success('Horeee! Janji temu berhasil ditambahkan!', {
      description: `Kode Booking: ${newRecord.booking_code}`
    });
  };

  const handleUpdateAppointment = (id: string, formData: AppointmentFormData) => {
    setAppointments((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            doctor_name: formData.doctor,
            date: formData.dateStr,
            time: formData.timeSlot,
            complaint: formData.complaint,
            visit_type: formData.visitType,
            service: formData.service,
            updated_at: 'Hari ini, Baru saja'
          };
        }
        return item;
      })
    );
    toast.success('Jadwal janji temu berhasil diperbarui!');
  };

  const handleFormSubmit = (data: AppointmentFormData, appointmentId?: string) => {
    if (formModalMode === 'edit' && appointmentId) {
      handleUpdateAppointment(appointmentId, data);
    } else {
      handleAddAppointment(data);
    }
  };

  return (
    <div className='flex flex-1 flex-col space-y-4 font-sans'>
      {/* 1. Filter Toolbar Row with Actions */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
        <AppointmentFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          monthFilter={monthFilter}
          onMonthFilterChange={handleMonthFilterChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          selectedServices={selectedServices}
          onSelectedServicesChange={handleSelectedServicesChange}
          selectedStatuses={selectedStatuses}
          onSelectedStatusesChange={handleSelectedStatusesChange}
          onResetAll={handleResetAllFilters}
          className='flex-1'
        />

        <Button onClick={handleOpenCreateModal} className='shrink-0 text-xs md:text-sm'>
          <Icons.add className='mr-2 h-4 w-4' />
          <span>Tambah Janji Temu</span>
        </Button>
      </div>

      {/* 2. Cards Grid Container */}
      <div className='flex-1 pb-4'>
        {paginatedAppointments.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {paginatedAppointments.map((item) => {
              const doctor = getDoctorByName(item.doctor_name);
              return (
                <AppointmentCard
                  key={item.id}
                  appointment={item}
                  doctor={doctor}
                  onReschedule={handleOpenRescheduleModal}
                  onViewDetails={handleOpenDetailsModal}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className='flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl text-center p-6 select-none my-auto'>
            <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3'>
              <Icons.search className='size-6' />
            </div>
            <h3 className='text-sm font-semibold text-foreground'>
              Tidak ada janji temu ditemukan
            </h3>
            <p className='text-xs text-muted-foreground mt-1 max-w-sm'>
              Coba sesuaikan kata kunci pencarian atau filter status konsultasi Anda.
            </p>
          </div>
        )}
      </div>

      {/* 3. Docked Bottom Sticky Pagination Bar (Directly pinned at viewport bottom) */}
      <AppointmentPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredAppointments.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 30, 50]}
      />

      {/* Stepper Appointment Modal (Add & Reschedule) */}
      <AppointmentModal
        isOpen={isFormModalOpen}
        mode={formModalMode}
        initialAppointment={selectedAppointment}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Summary Details Modal */}
      <DetailsModal
        isOpen={isDetailsModalOpen}
        appointment={selectedAppointment}
        onClose={() => setIsDetailsModalOpen(false)}
        onReschedule={handleOpenRescheduleModal}
      />
    </div>
  );
}
