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
  type SearchEngineResultItem,
} from '@/components/search-engine';
import {
  PROFILE_TYPE_OPTIONS,
  getRelationshipLabel,
} from './patient-tables/columns-helpers';
import {
  PatientMobileFilterDrawers,
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  type DrawerFilterType,
} from './patient-mobile-filter-drawers';
import type { Patient } from '../api/types';
import type { UsePatientFiltersResult } from '../model/usePatientFilters';

export interface PatientMobileFilterToolbarProps {
  table: Table<Patient>;
  patientFilters?: UsePatientFiltersResult;
  onReset?: () => void;
  className?: string;
}

export function PatientMobileFilterToolbar({
  table,
  patientFilters,
  onReset,
  className,
}: PatientMobileFilterToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerFilterType>(null);

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];
    const rows = table.getCoreRowModel().rows;
    const seenPatients = new Set<string>();
    const seenRm = new Set<string>();

    const indexPatient = (
      p: Patient,
      isAffiliate = false,
      parentName?: string
    ) => {
      if (p.name && !seenPatients.has(p.name)) {
        seenPatients.add(p.name);
        const relLabel = getRelationshipLabel(p.relationship_type, p.relation_label);
        const sub = isAffiliate
          ? `Afiliasi (${relLabel}) dari ${parentName || 'Akun Utama'}`
          : `No. RM: ${p.patient_id || '-'} • NIK: ${p.masked_nik || p.nik || '-'}`;

        items.push({
          id: `pat-${p.id}`,
          title: p.name,
          subtitle: sub,
          category: isAffiliate ? 'Pasien Afiliasi' : 'Pasien',
          icon: isAffiliate ? Icons.users : Icons.user,
          queryValue: p.name,
          badge: isAffiliate ? 'Afiliasi' : 'Akun Utama',
          onSelect: () => {
            if (patientFilters) {
              patientFilters.setFilter('name', p.name);
            } else {
              table.getColumn('name')?.setFilterValue(p.name);
            }
          },
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
            if (patientFilters) {
              patientFilters.setFilter('name', p.patient_id);
            } else {
              table.getColumn('name')?.setFilterValue(p.patient_id);
            }
          },
        });
      }
    };

    rows.forEach((row) => {
      indexPatient(row.original, false);
      if (row.subRows && row.subRows.length > 0) {
        row.subRows.forEach((subRow) => {
          indexPatient(subRow.original, true, row.original.name);
        });
      }
    });

    return items;
  }, [table, patientFilters]);

  const searchEngine = useTanStackSearchEngine({
    table,
    columnId: 'name',
    id: 'data-pasien-search',
    title: 'Pencarian Pasien',
    description: 'Cari pasien berdasarkan nama, nomor RM, atau NIK',
    placeholder: 'Ketik nama pasien, no RM, NIK...',
    indexItems,
    realtimeSync: true,
  });

  const nameCol = table.getColumn('name');
  const profileCol = table.getColumn('profile_type');
  const genderCol = table.getColumn('gender');
  const statusCol = table.getColumn('account_status');
  const bloodCol = table.getColumn('blood_type');

  // Derive filter values from SSOT (patientFilters) when available, falling back to table state
  const searchValue = patientFilters
    ? (patientFilters.params.name || patientFilters.params.search || patientFilters.params.patient || '')
    : searchEngine.query;

  const profileValue = useMemo(() => {
    if (patientFilters) return patientFilters.params.profile_type;
    const raw = profileCol?.getFilterValue();
    return Array.isArray(raw) ? raw : raw ? [raw as string] : [];
  }, [patientFilters, profileCol]);

  const genderValue = useMemo(() => {
    if (patientFilters) return patientFilters.params.gender[0] ?? '';
    const raw = genderCol?.getFilterValue();
    return Array.isArray(raw) ? (raw[0] ?? '') : ((raw as string) ?? '');
  }, [patientFilters, genderCol]);

  const statusValue = useMemo(() => {
    if (patientFilters) {
      return patientFilters.params.account_status.length > 0
        ? patientFilters.params.account_status
        : patientFilters.params.status;
    }
    const raw = statusCol?.getFilterValue();
    return Array.isArray(raw) ? raw : raw ? [raw as string] : [];
  }, [patientFilters, statusCol]);

  const bloodValue = useMemo(() => {
    if (patientFilters) return patientFilters.params.blood_type[0] ?? '';
    const raw = bloodCol?.getFilterValue();
    return Array.isArray(raw) ? (raw[0] ?? '') : ((raw as string) ?? '');
  }, [patientFilters, bloodCol]);

  const hasProfileFilter = profileValue.length > 0;
  const hasGenderFilter = Boolean(genderValue && genderValue.trim().length > 0);
  const hasStatusFilter = statusValue.length > 0;
  const hasBloodFilter = Boolean(bloodValue && bloodValue.trim().length > 0);

  const isFiltered = patientFilters
    ? patientFilters.hasFilters
    : Boolean(searchValue) ||
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
    if (patientFilters) {
      patientFilters.setFilter('profile_type', current.length > 0 ? current : null);
    } else {
      profileCol?.setFilterValue(current.length > 0 ? current : undefined);
    }
  };

  const handleToggleStatus = (val: string) => {
    const current = Array.isArray(statusValue) ? [...statusValue] : [];
    const idx = current.indexOf(val);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(val);
    }
    if (patientFilters) {
      patientFilters.setFilter('account_status', current.length > 0 ? current : null);
    } else {
      statusCol?.setFilterValue(current.length > 0 ? current : undefined);
    }
  };

  const handleReset = () => {
    searchEngine.clearQuery();
    table.resetColumnFilters();
    table.resetSorting();
    if (patientFilters) {
      patientFilters.reset();
    }
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
            {searchValue && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Cari: &quot;{searchValue}&quot;</span>
                <button
                  type='button'
                  onClick={() => {
                    searchEngine.clearQuery();
                    if (patientFilters) {
                      patientFilters.setFilter('name', null);
                      patientFilters.setFilter('search', null);
                      patientFilters.setFilter('patient', null);
                    } else {
                      nameCol?.setFilterValue(undefined);
                    }
                  }}
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
                  onClick={() => {
                    if (patientFilters) {
                      patientFilters.setFilter('profile_type', null);
                    } else {
                      profileCol?.setFilterValue(undefined);
                    }
                  }}
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
                  {GENDER_OPTIONS.find((o) => o.value === genderValue)?.label || genderValue}
                </span>
                <button
                  type='button'
                  onClick={() => {
                    if (patientFilters) {
                      patientFilters.setFilter('gender', null);
                    } else {
                      genderCol?.setFilterValue(undefined);
                    }
                  }}
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
                    .map((s) => STATUS_OPTIONS.find((o) => o.value === s)?.label || s)
                    .join(', ')}
                </span>
                <button
                  type='button'
                  onClick={() => {
                    if (patientFilters) {
                      patientFilters.setFilter('account_status', null);
                      patientFilters.setFilter('status', null);
                    } else {
                      statusCol?.setFilterValue(undefined);
                    }
                  }}
                  aria-label='Hapus filter status'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasBloodFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Gol. Darah: {bloodValue}</span>
                <button
                  type='button'
                  onClick={() => {
                    if (patientFilters) {
                      patientFilters.setFilter('blood_type', null);
                    } else {
                      bloodCol?.setFilterValue(undefined);
                    }
                  }}
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
        onToggleProfile={handleToggleProfile}
        onSelectGender={(val) => {
          if (patientFilters) {
            patientFilters.setFilter('gender', val ? [val] : null);
          } else {
            genderCol?.setFilterValue(val ? [val] : undefined);
          }
        }}
        onToggleStatus={handleToggleStatus}
        onSelectBlood={(val) => {
          if (patientFilters) {
            patientFilters.setFilter('blood_type', val ? [val] : null);
          } else {
            bloodCol?.setFilterValue(val ? [val] : undefined);
          }
        }}
      />
    </>
  );
}
