'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { doctorScheduleQueryOptions } from '../api/queries';
import { DoctorScheduleFilters } from './doctor-schedule-filters';
import { DoctorScheduleCard } from './doctor-schedule-card';
import { DoctorScheduleDetailSheet } from './doctor-schedule-detail-sheet';
import { DoctorScheduleEditModal } from './doctor-schedule-edit-modal';
import { DoctorExportButton } from './doctor-export-button';
import { DoctorSchedulePagination } from './doctor-schedule-pagination';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';

export function DoctorScheduleView() {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      perPage: parseAsInteger.withDefault(6),
      search: parseAsString.withDefault(''),
      month: parseAsString.withDefault('ALL'),
      date: parseAsString.withDefault(''),
      poli: parseAsString.withDefault(''),
      status: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const selectedPoli = useMemo(
    () => (params.poli ? params.poli.split(',').filter(Boolean) : []),
    [params.poli]
  );

  const selectedStatuses = useMemo(
    () => (params.status ? params.status.split(',').filter(Boolean) : []),
    [params.status]
  );

  const dateFilter = useMemo(() => {
    if (!params.date) return undefined;
    const parsed = new Date(params.date);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [params.date]);

  const filters = useMemo(
    () => ({
      page: params.page,
      limit: params.perPage,
      ...(params.search ? { search: params.search } : {}),
      ...(params.month && params.month !== 'ALL' ? { month: params.month } : {}),
      ...(params.date ? { date: params.date } : {}),
      ...(selectedPoli.length > 0 ? { poli: selectedPoli } : {}),
      ...(selectedStatuses.length > 0 ? { status: selectedStatuses } : {})
    }),
    [
      params.page,
      params.perPage,
      params.search,
      params.month,
      params.date,
      selectedPoli,
      selectedStatuses
    ]
  );

  const { data, isFetching, isLoading } = useQuery(doctorScheduleQueryOptions(filters));
  const doctors = data?.doctors ?? [];
  const totalDoctors = data?.total_doctors ?? 0;

  const handleOpenDetail = (doctor: DoctorSchedule) => {
    setSelectedDoctor(doctor);
    setDetailOpen(true);
  };

  const handleOpenEdit = (doctor: DoctorSchedule) => {
    setSelectedDoctor(doctor);
    setEditOpen(true);
  };

  const handleSearchChange = (val: string) => {
    setParams({ search: val || null, page: 1 }, { shallow: true });
  };

  const handleMonthFilterChange = (month: string) => {
    setParams({ month: month === 'ALL' ? null : month, page: 1 }, { shallow: true });
  };

  const handleDateFilterChange = (d: Date | undefined) => {
    if (!d) {
      setParams({ date: null, page: 1 }, { shallow: true });
    } else {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setParams({ date: `${year}-${month}-${day}`, page: 1 }, { shallow: true });
    }
  };

  const handleSelectedPoliChange = (poliList: string[]) => {
    setParams(
      { poli: poliList.length > 0 ? poliList.join(',') : null, page: 1 },
      { shallow: true }
    );
  };

  const handleSelectedStatusesChange = (statusList: string[]) => {
    setParams(
      { status: statusList.length > 0 ? statusList.join(',') : null, page: 1 },
      { shallow: true }
    );
  };

  const handleResetAll = () => {
    setParams(
      {
        search: null,
        month: null,
        date: null,
        poli: null,
        status: null,
        page: 1
      },
      { shallow: true }
    );
  };

  return (
    <>
      {/* 1. Detail Sheet */}
      <DoctorScheduleDetailSheet
        doctor={selectedDoctor}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onOpenEdit={(doc) => {
          setSelectedDoctor(doc);
          setDetailOpen(false);
          setEditOpen(true);
        }}
      />

      {/* 2. Edit Modal */}
      <DoctorScheduleEditModal
        doctor={selectedDoctor}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />

      {/* 3. Main Workspace Container */}
      <div className='flex h-full flex-1 flex-col gap-4 select-none'>
        {/* Toolbar Header (Search, Filters, Export) */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          <DoctorScheduleFilters
            searchQuery={params.search}
            onSearchChange={handleSearchChange}
            monthFilter={params.month || 'ALL'}
            onMonthFilterChange={handleMonthFilterChange}
            dateFilter={dateFilter}
            onDateFilterChange={handleDateFilterChange}
            selectedPoli={selectedPoli}
            onSelectedPoliChange={handleSelectedPoliChange}
            selectedStatuses={selectedStatuses}
            onSelectedStatusesChange={handleSelectedStatusesChange}
            onResetAll={handleResetAll}
            className='flex-1'
          />

          <div className='flex items-center gap-2 shrink-0'>
            <DoctorExportButton data={doctors} />
          </div>
        </div>

        {/* Doctor Schedules Card Grid */}
        <div
          className={cn(
            'flex-1 pb-4 min-h-[380px] transition-opacity duration-150',
            isFetching && 'opacity-75'
          )}
        >
          {isLoading && !data ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className='h-[340px] rounded-[24px] bg-muted/20 animate-pulse border border-border/40'
                />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className='p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card/40 my-4'>
              <Icons.clock className='size-10 text-muted-foreground/40 mx-auto mb-2' />
              <h3 className='text-sm font-bold text-foreground'>
                Tidak ada jadwal dokter ditemukan
              </h3>
              <p className='text-xs text-muted-foreground mt-1'>
                Coba sesuaikan kata kunci pencarian atau bersihkan filter yang aktif.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
              {doctors.map((doctor) => (
                <DoctorScheduleCard
                  key={doctor.id}
                  doctor={doctor}
                  onOpenDetail={handleOpenDetail}
                  onOpenEdit={handleOpenEdit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Docked Bottom Sticky Pagination Bar */}
        <DoctorSchedulePagination
          currentPage={params.page}
          pageSize={params.perPage}
          totalItems={totalDoctors}
          onPageChange={(page) => setParams({ page }, { shallow: true })}
          onPageSizeChange={(perPage) => setParams({ perPage, page: 1 }, { shallow: true })}
          pageSizeOptions={[6, 12, 18, 24, 30]}
        />
      </div>
    </>
  );
}
