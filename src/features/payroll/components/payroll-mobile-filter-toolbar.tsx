'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { SearchEngineTrigger, SearchEngineDialog } from '@/components/search-engine';
import { PayrollExportButton } from './payroll-export-button';
import { PayrollSettingsButton } from './payroll-settings-button';
import type { UsePayrollPresenterResult } from '../model/usePayrollPresenter';

export interface PayrollMobileFilterToolbarProps {
  presenter: UsePayrollPresenterResult;
  className?: string;
}

type DrawerFilterType = 'period' | 'category' | 'status' | null;

export function PayrollMobileFilterToolbar({
  presenter,
  className
}: PayrollMobileFilterToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerFilterType>(null);
  const { payrollView, searchEngine, mutations, actions } = presenter;

  const hasPeriodFilter = Boolean(
    payrollView.selectedPeriodId &&
    payrollView.periods.length > 0 &&
    payrollView.selectedPeriodId !== payrollView.periods[0]?.id
  );
  const hasCategoryFilter =
    payrollView.selectedCategory !== 'all' && Boolean(payrollView.selectedCategory);
  const hasStatusFilter =
    payrollView.selectedStatus !== 'all' && Boolean(payrollView.selectedStatus);

  const handleReset = () => {
    searchEngine.clearQuery();
    payrollView.actions.resetFilters();
  };

  const currentPeriodName = useMemo(() => {
    return (
      payrollView.periods.find((p) => p.id === payrollView.selectedPeriodId)?.periodName ||
      'Periode'
    );
  }, [payrollView.periods, payrollView.selectedPeriodId]);

  return (
    <>
      <div className={cn('flex flex-col gap-2 font-sans select-none', className)}>
        {/* Minimalist Horizontal Filter Dock */}
        <div className='flex items-center justify-between gap-1.5 w-full overflow-x-auto scrollbar-none py-0.5'>
          {/* Left: Filters */}
          <div className='flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none'>
            {/* 1. Dynamic Search Engine Trigger */}
            <SearchEngineTrigger
              config={searchEngine.config}
              isOpen={searchEngine.isOpen}
              onOpen={searchEngine.open}
              ariaLabel='Cari penggajian staf'
            />

            {/* 2. Period Filter Button */}
            <Button
              type='button'
              variant={hasPeriodFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('period')}
              aria-label='Filter Periode Penggajian'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasPeriodFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.calendar className='size-4' />
              {hasPeriodFilter && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary animate-pulse' />
              )}
            </Button>

            {/* 3. Category Filter Button */}
            <Button
              type='button'
              variant={hasCategoryFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('category')}
              aria-label='Filter Kategori Staf'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasCategoryFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.teams className='size-4' />
              {hasCategoryFilter && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary' />
              )}
            </Button>

            {/* 4. Status Filter Button */}
            <Button
              type='button'
              variant={hasStatusFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('status')}
              aria-label='Filter Status Penggajian'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasStatusFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.activity className='size-4' />
              {hasStatusFilter && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary' />
              )}
            </Button>
          </div>

          {/* Right: Export, Morphed Settings & Reset */}
          <div className='flex items-center gap-1.5 shrink-0 ml-auto'>
            {/* Export Button */}
            <PayrollExportButton
              data={payrollView.filteredSummaries}
              periodName={payrollView.currentPeriod?.periodName}
              variant='icon'
            />

            {/* Morphed Settings Button (Drawer Sheet on mobile) */}
            <PayrollSettingsButton
              onOpenRates={actions.openRates}
              onReconcileDailyLeave={actions.reconcileDailyLeave}
              onOpenAudit={actions.openAudit}
              onOpenConfirmFinalize={actions.openConfirmFinalize}
              canFinalize={payrollView.currentPeriod?.status === 'calculated'}
              isFinalizing={mutations.isFinalizing}
              isReconciling={mutations.isReconciling}
              forceMode='drawer'
              className='h-8 w-8'
            />

            {/* Reset Filter Button */}
            {payrollView.hasActiveFilters && (
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
        {payrollView.hasActiveFilters && (
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
            {hasPeriodFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Periode: {currentPeriodName}</span>
                <button
                  type='button'
                  onClick={() => payrollView.actions.changePeriod(payrollView.periods[0]?.id || '')}
                  aria-label='Reset filter periode'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasCategoryFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Kategori: {payrollView.selectedCategory}</span>
                <button
                  type='button'
                  onClick={() => payrollView.actions.changeCategory('all')}
                  aria-label='Reset filter kategori'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasStatusFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Status: {payrollView.selectedStatus}</span>
                <button
                  type='button'
                  onClick={() => payrollView.actions.changeStatus('all')}
                  aria-label='Reset filter status'
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

      {/* Drawer 1: Period Selection */}
      <Drawer
        open={openDrawer === 'period'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh] font-sans'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Periode Penggajian</DrawerTitle>
            <DrawerDescription>Pilih periode buku besar yang ingin ditampilkan</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-col gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {payrollView.periods.map((period) => {
              const isSelected = payrollView.selectedPeriodId === period.id;
              const statusLabel =
                period.status === 'calculated'
                  ? 'Terkalkulasi'
                  : period.status === 'finalized'
                    ? 'Ditutup buku'
                    : 'Draf';
              return (
                <button
                  key={period.id}
                  type='button'
                  onClick={() => {
                    payrollView.actions.changePeriod(period.id);
                    setOpenDrawer(null);
                  }}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between',
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-semibold shadow-xs'
                      : 'bg-muted/30 border-border/60 hover:bg-muted text-foreground'
                  )}
                >
                  <div>
                    <p className='text-xs font-semibold'>{period.periodName}</p>
                    <p className='text-[10px] text-muted-foreground mt-0.5'>
                      {period.periodStart} s/d {period.periodEnd} • Status: {statusLabel}
                    </p>
                  </div>
                  {isSelected && <Icons.check className='size-4 text-primary shrink-0' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setOpenDrawer(null)}
              className='w-full font-semibold text-xs h-8.5 cursor-pointer text-muted-foreground hover:text-foreground'
            >
              Tutup
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 2: Category Filter */}
      <Drawer
        open={openDrawer === 'category'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh] font-sans'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter kategori staf</DrawerTitle>
            <DrawerDescription>Pilih kategori karyawan yang ingin difilter</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {[
              { id: 'all', label: 'Semua Kategori' },
              ...(payrollView.filterOptions?.categories || [
                { id: 'doctor', label: 'Dokter' },
                { id: 'midwife', label: 'Bidan' },
                { id: 'worker', label: 'Staf Operasional' }
              ])
            ].map((cat) => {
              const isSelected = payrollView.selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => {
                    payrollView.actions.changeCategory(cat.id);
                    setOpenDrawer(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{cat.label}</span>
                  {isSelected && <Icons.check className='size-3 stroke-[2.5]' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setOpenDrawer(null)}
              className='w-full font-semibold text-xs h-8.5 cursor-pointer text-muted-foreground hover:text-foreground'
            >
              Tutup
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 3: Status Filter */}
      <Drawer
        open={openDrawer === 'status'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh] font-sans'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter status penggajian</DrawerTitle>
            <DrawerDescription>Pilih status buku besar periode penggajian</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {[
              { id: 'all', label: 'Semua Status' },
              ...(payrollView.filterOptions?.statuses || [
                { id: 'draft', label: 'Draf' },
                { id: 'calculated', label: 'Terkalkulasi' },
                { id: 'finalized', label: 'Ditutup Buku' }
              ])
            ].map((st) => {
              const isSelected = payrollView.selectedStatus === st.id;
              return (
                <button
                  key={st.id}
                  type='button'
                  onClick={() => {
                    payrollView.actions.changeStatus(st.id);
                    setOpenDrawer(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{st.label}</span>
                  {isSelected && <Icons.check className='size-3 stroke-[2.5]' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setOpenDrawer(null)}
              className='w-full font-semibold text-xs h-8.5 cursor-pointer text-muted-foreground hover:text-foreground'
            >
              Tutup
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
