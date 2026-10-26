'use client';

import * as React from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SearchInput } from '@/shared/ui/search-input';
import { cn } from '@/lib/utils';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import { useClinicalHistoryTable } from '../../../model/useClinicalHistoryTable';
import { useClinicalHistoryDialogs } from '../../../model/useClinicalHistoryDialogs';
import { getMaternityColumns } from './maternity-columns';
import { getImmunizationColumns } from './immunization-columns';
import { ClinicalHistoryCategoryTabs } from '../history-category-tabs';
import { ClinicalHistoryMobileFilterToolbar } from '../history-mobile-filter-toolbar';
import { ClinicalHistoryMobileCards } from '../history-mobile-cards';
import { ClinicalRecordDetailModal } from '../clinical-record-detail-modal';
import { CLINICAL_HISTORY_TAB } from '../../../api/history-queries';

export function ClinicalHistoryTables() {
  const dialogs = useClinicalHistoryDialogs();

  const maternityColumns = React.useMemo(
    () =>
      getMaternityColumns({
        onViewDetail: (id) => dialogs.actions.openDetail(CLINICAL_HISTORY_TAB.MATERNITY, id)
      }),
    [dialogs.actions]
  );

  const immunizationColumns = React.useMemo(
    () =>
      getImmunizationColumns({
        onViewDetail: (id) => dialogs.actions.openDetail(CLINICAL_HISTORY_TAB.IMMUNIZATION, id)
      }),
    [dialogs.actions]
  );

  const tableState = useClinicalHistoryTable({
    maternityColumns,
    immunizationColumns,
    dialogs
  });

  return (
    <>
      <div
        aria-busy={tableState.isFetching}
        className={cn(
          'flex h-full min-h-0 flex-1 flex-col gap-3.5 select-none font-sans',
          tableState.isFetching && 'opacity-80 transition-opacity'
        )}
      >
        {/* Category Tabs: Kehamilan & Persalinan vs Imunisasi Anak */}
        <ClinicalHistoryCategoryTabs
          activeTab={tableState.activeTab}
          onSelectTab={tableState.setActiveTab}
          totalMaternal={tableState.totalMaternal}
          totalImmunization={tableState.totalImmunization}
        />

        {/* Desktop View: TanStack DataTable with Integrated Custom Toolbar */}
        <div className='hidden md:flex min-h-0 flex-1 flex-col'>
          <DataTable
            table={tableState.activeTable as any}
            onRowClick={(row: any) =>
              tableState.dialogs.actions.openDetail(tableState.activeTab, row.id)
            }
            entityName={
              tableState.activeTab === CLINICAL_HISTORY_TAB.MATERNITY
                ? 'riwayat kehamilan'
                : 'riwayat imunisasi'
            }
            emptyState={
              tableState.hasFilters ? (
                <EmptyState
                  icon={Icons.search}
                  title='Tidak ada riwayat yang cocok'
                  description='Tidak ditemukan riwayat rekam medis dengan filter atau kata kunci pencarian yang dipilih.'
                />
              ) : (
                <EmptyState
                  icon={Icons.history}
                  title={
                    tableState.activeTab === CLINICAL_HISTORY_TAB.MATERNITY
                      ? 'Belum ada riwayat formulir kehamilan'
                      : 'Belum ada riwayat formulir imunisasi'
                  }
                  description='Formulir rekam medis yang telah diisi saat reservasi janji temu akan tercatat di sini.'
                />
              )
            }
          >
            {/* Custom Toolbar with SearchInput & Radix Family Member Select */}
            <div className='flex items-center justify-between gap-2.5 pb-1'>
              <div className='flex flex-1 items-center gap-2'>
                <SearchInput
                  value={tableState.search}
                  onChange={tableState.setSearch}
                  placeholder={
                    tableState.activeTab === CLINICAL_HISTORY_TAB.MATERNITY
                      ? 'Cari nama ibu atau NIK...'
                      : 'Cari nama anak atau NIK...'
                  }
                  ariaLabel={
                    tableState.activeTab === CLINICAL_HISTORY_TAB.MATERNITY
                      ? 'Cari nama ibu atau NIK'
                      : 'Cari nama anak atau NIK'
                  }
                  className='min-w-[220px] max-w-[300px]'
                />

                {tableState.familyMembers.length > 0 && (
                  <div className='min-w-[190px] max-w-[240px]'>
                    <Select
                      value={tableState.patientId || 'ALL'}
                      onValueChange={(val) => tableState.setPatientId(val === 'ALL' ? '' : val)}
                    >
                      <SelectTrigger
                        size='sm'
                        className='h-8 text-xs bg-card border-border shadow-2xs'
                        aria-label='Filter Anggota Keluarga'
                      >
                        <SelectValue placeholder='Semua Anggota Keluarga' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='ALL' className='text-xs'>
                          Semua Anggota Keluarga
                        </SelectItem>
                        {tableState.familyMembers.map(
                          (m: {
                            id: string;
                            fullName: string;
                            relationshipLabel?: string;
                            relationship: string;
                          }) => (
                            <SelectItem key={m.id} value={m.id} className='text-xs'>
                              {m.fullName} ({getRelationshipLabel(m.relationship)})
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {tableState.hasFilters && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={tableState.resetFilters}
                    className='h-8 text-xs border-dashed text-muted-foreground hover:text-foreground'
                  >
                    <Icons.close className='size-3 mr-1.5' />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </DataTable>
        </div>

        {/* Mobile View: Cards Layout matching appointment-pasien */}
        <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
          <ClinicalHistoryMobileFilterToolbar
            activeTab={tableState.activeTab}
            search={tableState.search}
            onSearchChange={tableState.setSearch}
            patientId={tableState.patientId}
            onPatientChange={tableState.setPatientId}
            familyMembers={tableState.familyMembers}
            hasFilters={tableState.hasFilters}
            onReset={tableState.resetFilters}
            className='mb-3'
          />
          <ClinicalHistoryMobileCards
            activeTab={tableState.activeTab}
            maternalRecords={tableState.maternalRows}
            immunizationRecords={tableState.immunizationRows}
            hasFilters={tableState.hasFilters}
            onViewDetail={(type, id) => tableState.dialogs.actions.openDetail(type, id)}
          />
          {tableState.totalActive > 0 && (
            <div className='sticky bottom-0 bg-background pt-2 pb-1 border-t border-border/80 shadow-md z-10'>
              <DataTablePagination table={tableState.activeTable as any} />
            </div>
          )}
        </div>
      </div>

      {/* Centralized Read-Only Detail Modal */}
      <ClinicalRecordDetailModal
        isOpen={tableState.dialogs.isOpen}
        recordType={tableState.dialogs.recordType}
        recordId={tableState.dialogs.recordId}
        onClose={tableState.dialogs.actions.closeDetail}
      />
    </>
  );
}

export function ClinicalHistoryTableSkeleton() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Category Tabs Skeleton */}
      <div className='flex items-center gap-2'>
        <Skeleton className='h-9 w-48 rounded-xl' />
        <Skeleton className='h-9 w-36 rounded-xl' />
      </div>

      {/* Desktop Toolbar Skeleton */}
      <div className='hidden md:flex items-center justify-between gap-2 p-1'>
        <div className='flex items-center gap-2 flex-1'>
          <Skeleton className='h-8 w-64 rounded-md' />
          <Skeleton className='h-8 w-48 rounded-md' />
        </div>
      </div>

      {/* Desktop Rows Skeleton */}
      <div className='hidden md:block flex-1 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 space-y-3'>
        <div className='flex items-center justify-between border-b border-border/40 pb-3'>
          <Skeleton className='h-4 w-32 rounded-md' />
          <Skeleton className='h-4 w-40 rounded-md' />
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-4 w-28 rounded-md' />
          <Skeleton className='h-4 w-20 rounded-md' />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='flex items-center justify-between py-2'>
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-4 w-44 rounded-md' />
            <Skeleton className='h-5 w-20 rounded-md' />
            <Skeleton className='h-4 w-32 rounded-md' />
            <Skeleton className='h-7 w-24 rounded-full' />
          </div>
        ))}
      </div>

      {/* Mobile Cards Skeleton */}
      <div className='block md:hidden space-y-3 pt-1'>
        <Skeleton className='h-8.5 w-full rounded-xl' />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-36 w-full rounded-2xl' />
        ))}
      </div>
    </div>
  );
}
