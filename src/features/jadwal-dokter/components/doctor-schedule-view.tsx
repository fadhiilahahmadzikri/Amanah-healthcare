'use client';

import React, { useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { doctorScheduleQueryOptions } from '../api/queries';
import { DoctorScheduleCard } from './doctor-schedule-card';
import { DoctorScheduleDetailSheet } from './doctor-schedule-detail-sheet';
import { DoctorScheduleEditModal } from './doctor-schedule-edit-modal';
import { DoctorExportButton } from './doctor-export-button';
import { POLI_OPTIONS } from '../constants/options';
import type { DoctorSchedule } from '../api/types';

export function DoctorScheduleView() {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(20),
    search: parseAsString.withDefault(''),
    poli: parseAsString.withDefault('all'),
    status: parseAsString.withDefault('all')
  });

  const filters = useMemo(
    () => ({
      page: params.page,
      limit: params.perPage,
      ...(params.search ? { search: params.search } : {}),
      ...(params.poli && params.poli !== 'all' ? { poli: [params.poli] } : {}),
      ...(params.status && params.status !== 'all' ? { status: [params.status] } : {})
    }),
    [params]
  );

  const { data } = useSuspenseQuery(doctorScheduleQueryOptions(filters));

  const handleOpenDetail = (doctor: DoctorSchedule) => {
    setSelectedDoctor(doctor);
    setDetailOpen(true);
  };

  const handleOpenEdit = (doctor: DoctorSchedule) => {
    setSelectedDoctor(doctor);
    setEditOpen(true);
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
        <div className='flex flex-wrap items-center justify-between gap-3 p-1'>
          <div className='flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]'>
            {/* Search Input */}
            <div className='relative w-full sm:w-[260px]'>
              <Icons.search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none' />
              <Input
                value={params.search}
                onChange={(e) => setParams({ search: e.target.value || null, page: 1 })}
                placeholder='Cari dokter, spesialisasi, atau ruang...'
                className='pl-8 h-9 text-xs bg-background shadow-2xs border-border/70'
              />
            </div>

            {/* Poli Filter */}
            <Select
              value={params.poli}
              onValueChange={(val) => setParams({ poli: val === 'all' ? null : val, page: 1 })}
            >
              <SelectTrigger className='w-[160px] h-9 text-xs bg-background shadow-2xs border-border/70'>
                <SelectValue placeholder='Semua poli' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua poli</SelectItem>
                {POLI_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={params.status}
              onValueChange={(val) => setParams({ status: val === 'all' ? null : val, page: 1 })}
            >
              <SelectTrigger className='w-[140px] h-9 text-xs bg-background shadow-2xs border-border/70'>
                <SelectValue placeholder='Semua status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua status</SelectItem>
                <SelectItem value='Aktif'>Aktif</SelectItem>
                <SelectItem value='Cuti'>Cuti</SelectItem>
                <SelectItem value='Sebagian'>Sebagian</SelectItem>
                <SelectItem value='Tutup'>Tutup</SelectItem>
              </SelectContent>
            </Select>

            {(params.search || params.poli !== 'all' || params.status !== 'all') && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setParams({ search: null, poli: null, status: null, page: 1 })}
                className='h-9 px-2 text-xs text-muted-foreground hover:text-foreground'
              >
                <Icons.refresh className='mr-1 size-3' />
                Reset
              </Button>
            )}
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <DoctorExportButton data={data.doctors} />
          </div>
        </div>

        {/* Doctor Schedules Card Grid */}
        {data.doctors.length === 0 ? (
          <div className='p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card/40 my-4'>
            <Icons.clock className='size-10 text-muted-foreground/40 mx-auto mb-2' />
            <h3 className='text-sm font-bold text-foreground'>Tidak ada jadwal dokter ditemukan</h3>
            <p className='text-xs text-muted-foreground mt-1'>
              Coba sesuaikan kata kunci pencarian atau bersihkan filter yang aktif.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5 pb-6'>
            {data.doctors.map((doctor) => (
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
    </>
  );
}
