'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { usePatientTable } from '../../model/usePatientTable';
import { getPatientColumns } from './columns';
import { usePatientFormReferences } from '../../model/usePatientFormReferences';
import { PatientModal } from '../patient-modal';
import { PatientHistoryModal } from '../patient-history-modal';
import { PatientDeleteDialog } from '../patient-delete-dialog';
import { PatientBulkActions } from './patient-bulk-actions';
import { PatientExportButton } from '../patient-export-button';
import { PatientMobileFilterToolbar } from '../patient-mobile-filter-toolbar';
import { PatientMobileCards } from '../patient-mobile-cards';
import type { Patient } from '../../api/types';

export function PatientTable() {
  const { genders, statuses } = usePatientFormReferences();
  const tableColumns = useMemo(
    () => getPatientColumns({ genders, statuses }),
    [genders, statuses]
  );
  const columnIds = useMemo(
    () => tableColumns.map((c) => c.id).filter(Boolean) as string[],
    [tableColumns]
  );

  const patientTable = usePatientTable({ columns: tableColumns, columnIds });

  const selectedRowIds = patientTable.table
    .getFilteredSelectedRowModel()
    .flatRows.map((r) => r.original.id);

  const rows = patientTable.table.getRowModel().rows.map((r) => r.original);
  const hasFilters =
    patientTable.patientFilters.hasFilters || patientTable.isInfiniteSearch;

  const mobilePatients = useMemo(() => {
    const rawRows = patientTable.table.getRowModel().rows;
    if (!hasFilters) {
      return rawRows
        .filter((r) => r.depth === 0)
        .map((r) => {
          const affiliates =
            r.subRows && r.subRows.length > 0
              ? r.subRows.map((sr) => sr.original)
              : r.original.affiliates ?? [];
          return {
            ...r.original,
            affiliates,
          };
        });
    }

    // Mode Filter Aktif: Ratakan seluruh pasien & subrows menjadi kartu individual (abaikan hierarki deck afiliasi)
    const flatList: Patient[] = [];
    rawRows.forEach((r) => {
      flatList.push({
        ...r.original,
        affiliates: [],
      });
      if (r.subRows && r.subRows.length > 0) {
        r.subRows.forEach((sr) => {
          flatList.push({
            ...sr.original,
            affiliates: [],
          });
        });
      }
    });

    const colFilters = patientTable.table.getState().columnFilters;
    const genderFilter = colFilters.find((f) => f.id === 'gender')?.value;
    const statusFilter = colFilters.find((f) => f.id === 'account_status')?.value;
    const bloodFilter = colFilters.find((f) => f.id === 'blood_type')?.value;
    const profileFilter = colFilters.find((f) => f.id === 'profile_type')?.value;

    return flatList.filter((p) => {
      if (genderFilter) {
        const selected = Array.isArray(genderFilter) ? genderFilter : [genderFilter];
        if (selected.length > 0 && !selected.includes(p.gender)) {
          return false;
        }
      }

      if (statusFilter) {
        const selected = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
        if (selected.length > 0 && !selected.includes(p.account_status)) {
          return false;
        }
      }

      if (bloodFilter) {
        const selected = Array.isArray(bloodFilter) ? bloodFilter : [bloodFilter];
        if (selected.length > 0 && !selected.includes(p.blood_type)) {
          return false;
        }
      }

      if (profileFilter) {
        const selected = Array.isArray(profileFilter) ? profileFilter : [profileFilter];
        if (selected.length > 0) {
          const isAffiliate = Boolean(p.master_patient_id);
          const isMaster = Boolean(p.is_master);
          const match = selected.some((pr) => {
            if (pr === 'master') return isMaster;
            if (pr === 'affiliate') return isAffiliate;
            return true;
          });
          if (!match) return false;
        }
      }

      return true;
    });
  }, [patientTable.table, hasFilters]);

  return (
    <>
      {/* 1. Modal Pasien Terpadu (Detail & Edit dengan Unlock Button) */}
      <PatientModal
        key={patientTable.selectedPatient?.id || 'new'}
        patient={patientTable.selectedPatient}
        isOpen={patientTable.isDetailOpen || patientTable.isEditOpen}
        initialMode={patientTable.isEditOpen ? 'edit' : 'view'}
        onClose={() => {
          if (patientTable.isDetailOpen) patientTable.actions.closeDetail();
          if (patientTable.isEditOpen) patientTable.actions.closeEdit();
        }}
      />

      {/* 2. Modal Garis Waktu Riwayat Janji Temu & Form Klinis Terkait */}
      <PatientHistoryModal
        patient={patientTable.selectedPatient}
        isOpen={patientTable.isHistoryOpen}
        onClose={patientTable.actions.closeHistory}
      />

      {/* 3. Dialog Konfirmasi Hapus Pasien Tunggal */}
      <PatientDeleteDialog
        patient={patientTable.selectedPatient}
        isOpen={patientTable.isDeleteOpen}
        onClose={patientTable.actions.closeDelete}
      />

      {/* 4. Dialog Konfirmasi Hapus Pasien Massal (Bulk) */}
      <PatientDeleteDialog
        isOpen={patientTable.isBulkDeleteOpen}
        patientIds={selectedRowIds}
        onClose={patientTable.actions.closeBulkDelete}
        onSuccess={() => patientTable.table.resetRowSelection()}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5'>
        {/* Desktop View: TanStack Table dengan Dual-Layer Search & Infinite Scroll Support */}
        <div className='hidden md:flex min-h-0 flex-1 flex-col'>
          <DataTable
            table={patientTable.table}
            onRowClick={patientTable.actions.openDetail}
            entityName='pasien'
            hidePagination={patientTable.hidePagination}
            footerSlot={
              <div
                ref={patientTable.sentinelRef}
                className='border-t border-border/50 bg-background/80 px-4 py-2.5 shadow-md backdrop-blur-xl flex items-center justify-between text-xs text-muted-foreground'
              >
                <span>
                  Menampilkan{' '}
                  <strong className='font-semibold text-foreground'>{rows.length}</strong>{' '}
                  dari {patientTable.totalPatients} hasil pencarian
                </span>
                {patientTable.isFetchingNextPage ? (
                  <div className='flex items-center gap-1.5 text-primary font-medium'>
                    <Icons.spinner className='size-3.5 animate-spin' />
                    <span>Memuat pasien berikutnya...</span>
                  </div>
                ) : !patientTable.hasNextPage ? (
                  <span className='text-muted-foreground/60'>Semua hasil pencarian telah dimuat</span>
                ) : (
                  <span className='text-muted-foreground/60'>Scroll ke bawah untuk memuat otomatis</span>
                )}
              </div>
            }
            bulkActions={
              <PatientBulkActions
                table={patientTable.table}
                onBulkDelete={patientTable.actions.openBulkDelete}
              />
            }
          >
            <DataTableToolbar
              table={patientTable.table}
              onReset={patientTable.resetFilters}
            >
              <PatientExportButton />
            </DataTableToolbar>
          </DataTable>
        </div>

        {/* Mobile View: Docked Filter Toolbar, Single-Tone Cards, & Action Drawer */}
        <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
          <PatientMobileFilterToolbar
            table={patientTable.table}
            patientFilters={patientTable.patientFilters}
            onReset={patientTable.resetFilters}
            className='mb-3'
          />
          <PatientMobileCards
            patients={mobilePatients}
            hasFilters={hasFilters}
            onReset={patientTable.resetFilters}
            onRowClick={patientTable.actions.openDetail}
            onViewDetail={patientTable.actions.openDetail}
            onEdit={patientTable.actions.openEdit}
            onViewHistory={patientTable.actions.openHistory}
            onDelete={patientTable.actions.openDelete}
            sentinelRef={patientTable.sentinelRef}
            isFetchingNextPage={patientTable.isFetchingNextPage}
            hasNextPage={patientTable.hasNextPage}
          />
          {!patientTable.hidePagination && patientTable.table.getRowModel().rows.length > 0 && (
            <div className='sticky bottom-0 bg-background pt-2 pb-1 border-t border-border/80 shadow-md z-10'>
              <DataTablePagination table={patientTable.table} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function PatientTableSkeleton() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Toolbar Skeleton */}
      <div className='flex w-full items-center justify-between gap-2 overflow-auto p-1'>
        <div className='flex flex-1 items-center gap-2'>
          <Skeleton className='h-8 w-56 rounded-md' />
          <Skeleton className='h-8 w-24 border-dashed rounded-md' />
          <Skeleton className='h-8 w-24 border-dashed rounded-md' />
        </div>
        <Skeleton className='h-8 w-20 rounded-md' />
      </div>

      {/* Clean Borderless Table Skeleton */}
      <div className='flex-1 overflow-hidden'>
        <div className='border-b border-border/60 px-4 py-3 flex items-center justify-between gap-6'>
          <Skeleton className='size-4 rounded-[4px]' />
          <Skeleton className='h-4 w-20 rounded-md' />
          <Skeleton className='h-4 w-32 rounded-md' />
          <Skeleton className='h-4 w-16 rounded-md' />
          <Skeleton className='h-4 w-16 rounded-md' />
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-4 w-16 rounded-md' />
        </div>
        <div className='divide-y divide-border/40'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='px-4 py-3.5 flex items-center justify-between gap-6'>
              <Skeleton className='size-4 rounded-[4px]' />
              <Skeleton className='h-4 w-16 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-36 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-14 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-12 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-20 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-20 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-16 rounded-full bg-muted/40' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
