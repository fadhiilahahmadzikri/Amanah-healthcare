'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import type { Table } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PatientExportButton } from './patient-export-button';
import {
  useTanStackSearchEngine,
  SearchEngineTrigger,
  SearchEngineDialog,
  type SearchEngineResultItem
} from '@/components/search-engine';
import { PROFILE_TYPE_OPTIONS } from './patient-tables/columns-helpers';
import { usePatientFormReferences } from '../model/usePatientFormReferences';
import { PatientMobileFilterDrawers, type DrawerFilterType } from './patient-mobile-filter-drawers';
import type { Patient } from '../api/types';

export interface PatientMobileFilterToolbarProps {
  table: Table<Patient>;
  onReset?: () => void;
  className?: string;
}

export function PatientMobileFilterToolbar({
  table,
  onReset,
  className
}: PatientMobileFilterToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerFilterType>(null);
  const references = usePatientFormReferences();

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];
    const rows = table.getCoreRowModel().rows;
    const seenPatients = new Set<string>();
    const seenRm = new Set<string>();

    const indexPatient = (p: Patient) => {
      if (p.name && !seenPatients.has(p.name)) {
        seenPatients.add(p.name);
        const sub = `No. RM: ${p.patient_id || '-'} • NIK: ${p.masked_nik || p.nik || '-'}`;

        items.push({
          id: `pat-${p.id}`,
          title: p.name,
          subtitle: sub,
          category: 'Pasien',
          icon: Icons.user,
          queryValue: p.name,
          badge: p.is_master ? 'Akun Utama' : 'Pasien',
          onSelect: () => {
            table.getColumn('name')?.setFilterValue(p.name);
          }
        });
      }
      if (p.patient_id && !seenRm.has(p.patient_id)) {
        seenRm.add(p.patient_id);
        items.push({
          id: `rm-${p.id}`,
          title: `No. RM: ${p.patient_id}`,
          subtitle: p.name,
          category: 'Nomor Rekam Medis',
          icon: Icons.forms,
          queryValue: p.patient_id,
          onSelect: () => {
            table.getColumn('name')?.setFilterValue(p.patient_id);
          }
        });
      }
    };

    rows.forEach((row) => {
      indexPatient(row.original);
    });

    return items;
  }, [table]);

  const searchEngine = useTanStackSearchEngine({
    table,
    columnId: 'name',
    id: 'data-pasien-search',
    title: 'Pencarian Pasien',
    description: 'Cari pasien berdasarkan nama, nomor RM, atau NIK',
    placeholder: 'Ketik nama pasien, no RM, NIK...',
    indexItems,
    realtimeSync: true
  });

  const profileCol = table.getColumn('profile_type');
  const genderCol = table.getColumn('gender');
  const statusCol = table.getColumn('account_status');
  const bloodCol = table.getColumn('blood_type');

  const searchValue = searchEngine.query;
  const rawProfile = profileCol?.getFilterValue();
  const profileValue = Array.isArray(rawProfile)
    ? rawProfile
    : rawProfile
      ? [rawProfile as string]
      : [];

  const rawGender = genderCol?.getFilterValue();
  const genderValue = Array.isArray(rawGender)
    ? (rawGender[0] ?? '')
    : ((rawGender as string) ?? '');

  const rawStatus = statusCol?.getFilterValue();
  const statusValue = Array.isArray(rawStatus) ? rawStatus : rawStatus ? [rawStatus as string] : [];

  const rawBlood = bloodCol?.getFilterValue();
  const bloodValue = Array.isArray(rawBlood) ? (rawBlood[0] ?? '') : ((rawBlood as string) ?? '');

  const hasProfileFilter = profileValue.length > 0;
  const hasGenderFilter = Boolean(genderValue && genderValue.trim().length > 0);
  const hasStatusFilter = statusValue.length > 0;
  const hasBloodFilter = Boolean(bloodValue && bloodValue.trim().length > 0);

  const isFiltered =
    Boolean(searchValue) ||
    hasProfileFilter ||
    hasGenderFilter ||
    hasStatusFilter ||
    hasBloodFilter ||
    table.getState().columnFilters.length > 0;

  const handleToggleProfile = (val: string) => {
    const current = Array.isArray(profileValue) ? [...profileValue] : [];
    const idx = current.indexOf(val);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(val);
    }
    profileCol?.setFilterValue(current.length > 0 ? current : undefined);
  };

  const handleToggleStatus = (val: string) => {
    const current = Array.isArray(statusValue) ? [...statusValue] : [];
    const idx = current.indexOf(val);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(val);
    }
    statusCol?.setFilterValue(current.length > 0 ? current : undefined);
  };

  const handleReset = () => {
    searchEngine.clearQuery();
    table.resetColumnFilters();
    table.resetSorting();
    onReset?.();
  };

  return (
    <>
      <div className={cn('flex flex-col gap-2 font-sans select-none', className)}>
        {/* Minimalist Horizontal Filter Dock */}
        <div className='flex items-center justify-between gap-1.5 w-full overflow-x-auto scrollbar-none py-0.5'>
          <div className='flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none'>
            {/* 1. Search Engine Icon Trigger */}
            <SearchEngineTrigger
              config={searchEngine.config}
              isOpen={searchEngine.isOpen}
              onOpen={searchEngine.open}
              ariaLabel='Cari pasien'
            />

            {/* 2. Profile Type Filter Button */}
            <Button
              type='button'
              variant={hasProfileFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('profile')}
              aria-label='Filter Status Profil'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasProfileFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.crown className='size-4 text-amber-600 dark:text-amber-400' />
              {hasProfileFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-primary text-primary-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {profileValue.length}
                </span>
              )}
            </Button>

            {/* 3. Gender Filter Button */}
            <Button
              type='button'
              variant={hasGenderFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('gender')}
              aria-label='Filter Jenis Kelamin'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasGenderFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.user className='size-4' />
              {hasGenderFilter && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary' />
              )}
            </Button>

            {/* 4. Status Filter Button */}
            <Button
              type='button'
              variant={hasStatusFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('status')}
              aria-label='Filter Status Akun'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasStatusFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.activity className='size-4' />
              {hasStatusFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {statusValue.length}
                </span>
              )}
            </Button>

            {/* 5. Blood Type Filter Button */}
            <Button
              type='button'
              variant={hasBloodFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('blood')}
              aria-label='Filter Golongan Darah'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasBloodFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.activity className='size-4' />
              {hasBloodFilter && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary' />
              )}
            </Button>
          </div>

          {/* Right Anchored Actions: Export & Reset on opposite side */}
          <div className='flex items-center gap-1.5 shrink-0 ml-auto'>
            {/* 6. Export Button */}
            <PatientExportButton variant='icon' />

            {/* 7. Reset Filter Button */}
            {isFiltered && (
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={handleReset}
                aria-label='Reset Semua Filter'
                className='size-8.5 rounded-xl border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20 cursor-pointer shadow-2xs shrink-0'
                title='Reset Semua Filter'
              >
                <Icons.refresh className='size-3.5' />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Summary Chips Row */}
        {isFiltered && (
          <div className='flex items-center gap-1.5 flex-wrap pt-0.5 overflow-x-auto scrollbar-none'>
            {searchEngine.config.query && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Cari: &quot;{searchEngine.config.query}&quot;</span>
                <button
                  type='button'
                  onClick={() => searchEngine.clearQuery()}
                  aria-label='Hapus pencarian'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasProfileFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>
                  Profil:{' '}
                  {profileValue
                    .map((v) => PROFILE_TYPE_OPTIONS.find((o) => o.value === v)?.label || v)
                    .join(', ')}
                </span>
                <button
                  type='button'
                  onClick={() => profileCol?.setFilterValue(undefined)}
                  aria-label='Hapus filter profil'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasGenderFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>
                  Gender:{' '}
                  {references.genders.find((o) => o.value === genderValue)?.label || genderValue}
                </span>
                <button
                  type='button'
                  onClick={() => genderCol?.setFilterValue(undefined)}
                  aria-label='Hapus filter gender'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasStatusFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>
                  Status:{' '}
                  {statusValue
                    .map((s) => references.statuses.find((o) => o.value === s)?.label || s)
                    .join(', ')}
                </span>
                <button
                  type='button'
                  onClick={() => statusCol?.setFilterValue(undefined)}
                  aria-label='Hapus filter status'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasBloodFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>
                  Gol. Darah:{' '}
                  {references.bloodTypes.find((o) => o.value === bloodValue)?.label || bloodValue}
                </span>
                <button
                  type='button'
                  onClick={() => bloodCol?.setFilterValue(undefined)}
                  aria-label='Hapus filter golongan darah'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Centralized Search Engine Modal */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Dedicated Filter Drawers (Profile, Gender, Status, Blood) */}
      <PatientMobileFilterDrawers
        openDrawer={openDrawer}
        onClose={() => setOpenDrawer(null)}
        profileValue={profileValue}
        genderValue={genderValue}
        statusValue={statusValue}
        bloodValue={bloodValue}
        bloodTypeOptions={references.bloodTypes}
        genderOptions={references.genders}
        statusOptions={references.statuses}
        onToggleProfile={handleToggleProfile}
        onSelectGender={(val) => genderCol?.setFilterValue(val ? [val] : undefined)}
        onToggleStatus={handleToggleStatus}
        onSelectBlood={(val) => bloodCol?.setFilterValue(val ? [val] : undefined)}
      />
    </>
  );
}
