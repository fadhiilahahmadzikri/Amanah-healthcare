'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { CATEGORY_FILTER_OPTIONS } from '../constants/options';
import { formatCurrency } from '../utils/currency';
import type { PayrollFilterState, PayrollSummaryItem, StaffCategory } from '../api/types';

interface PayrollTableProps {
  summaries: PayrollSummaryItem[];
  isLoading?: boolean;
  onSelectStaff: (summary: PayrollSummaryItem) => void;
  filterState: PayrollFilterState;
  onFilterChange: (newFilter: Partial<PayrollFilterState>) => void;
  onResetFilter: () => void;
}

export function PayrollTable({
  summaries,
  isLoading,
  onSelectStaff,
  filterState,
  onFilterChange,
  onResetFilter
}: PayrollTableProps) {
  // Apply Client-Side Filter (Search and Category)
  const filteredSummaries = summaries.filter((item) => {
    const matchesSearch =
      !filterState.search ||
      item.fullName.toLowerCase().includes(filterState.search.toLowerCase()) ||
      (item.positionTitle &&
        item.positionTitle.toLowerCase().includes(filterState.search.toLowerCase()));

    const matchesCategory =
      filterState.category === 'all' || item.staffType === filterState.category;

    return matchesSearch && matchesCategory;
  });

  const isFiltered = filterState.search !== '' || filterState.category !== 'all';

  return (
    <div className='bg-card border border-border/60 rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden shadow-xs'>
      {/* Filter Toolbar */}
      <div className='p-3.5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10 shrink-0'>
        <div className='flex items-center gap-2.5 flex-1 max-w-lg'>
          {/* Search Input */}
          <div className='relative flex-1'>
            <Icons.search className='size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Cari nama staf atau posisi...'
              value={filterState.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className='text-xs h-8 pl-8 rounded-xl bg-background'
            />
          </div>

          {/* Category Select */}
          <div className='w-44'>
            <Select
              value={filterState.category}
              onValueChange={(val) => onFilterChange({ category: val as 'all' | StaffCategory })}
            >
              <SelectTrigger className='text-xs h-8 rounded-xl bg-background'>
                <SelectValue placeholder='Pilih Kategori' />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className='text-xs'>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filter Button */}
          {isFiltered && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onResetFilter}
              className='text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground'
            >
              Reset
            </Button>
          )}
        </div>

        <div className='text-xs text-muted-foreground shrink-0 font-medium'>
          Menampilkan <span className='text-foreground font-bold'>{filteredSummaries.length}</span>{' '}
          dari {summaries.length} Karyawan
        </div>
      </div>

      {/* Table Content inside Non-Paginated ScrollArea */}
      <div className='flex-1 min-h-0 relative'>
        {isLoading ? (
          <div className='p-8 space-y-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className='h-12 rounded-xl bg-muted/20 animate-pulse border border-border/40'
              />
            ))}
          </div>
        ) : filteredSummaries.length === 0 ? (
          <EmptyState
            icon={Icons.receipt}
            title={isFiltered ? 'Tidak ada karyawan yang sesuai' : 'Belum ada data slip gaji'}
            description={
              isFiltered
                ? 'Coba sesuaikan kata kunci pencarian atau filter kategori di atas.'
                : 'Silakan jalankan kalkulasi payroll periode baru untuk melihat rincian gaji staf.'
            }
            className='h-full w-full py-16'
          />
        ) : (
          <ScrollArea className='h-full w-full'>
            <Table>
              <TableHeader className='bg-muted/30 sticky top-0 z-10 backdrop-blur-xs'>
                <TableRow className='border-b border-border/60 hover:bg-transparent'>
                  <TableHead className='text-xs font-semibold text-foreground py-3 pl-4'>
                    Karyawan / Staf
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-foreground py-3 text-center'>
                    Jam Pokok
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-foreground py-3 text-right'>
                    Gaji Pokok
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-foreground py-3 text-right'>
                    Potongan Izin
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-foreground py-3 text-right'>
                    Insentif Pengganti
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-foreground py-3 text-right'>
                    Gaji Bersih (THP)
                  </TableHead>
                  <TableHead className='text-xs font-semibold text-foreground py-3 text-center pr-4'>
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSummaries.map((staff) => {
                  const roleBadgeClass =
                    staff.staffType === 'doctor'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300/40'
                      : staff.staffType === 'midwife'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300/40'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300/40';

                  return (
                    <TableRow
                      key={staff.staffId}
                      className='hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/40'
                      onClick={() => onSelectStaff(staff)}
                    >
                      {/* 1. Staf / Karyawan */}
                      <TableCell className='py-3 pl-4 font-medium'>
                        <div className='flex items-center gap-2.5'>
                          <div className='size-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0'>
                            {staff.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div className='min-w-0'>
                            <span className='font-semibold text-xs text-foreground block truncate'>
                              {staff.fullName}
                            </span>
                            <div className='flex items-center gap-1.5 mt-0.5'>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${roleBadgeClass}`}
                              >
                                {staff.staffType}
                              </span>
                              {staff.positionTitle && (
                                <span className='text-[10px] text-muted-foreground truncate'>
                                  • {staff.positionTitle}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Jam Pokok */}
                      <TableCell className='py-3 text-center text-xs text-muted-foreground tabular-nums'>
                        {staff.baseHours} jam
                      </TableCell>

                      {/* 3. Gaji Pokok */}
                      <TableCell className='py-3 text-right text-xs font-medium text-foreground tabular-nums'>
                        {formatCurrency(staff.baseEarnings)}
                      </TableCell>

                      {/* 4. Potongan Cuti */}
                      <TableCell className='py-3 text-right text-xs tabular-nums'>
                        {staff.leaveDeductions > 0 ? (
                          <span className='text-rose-600 dark:text-rose-400 font-medium'>
                            -{formatCurrency(staff.leaveDeductions)}
                          </span>
                        ) : (
                          <span className='text-muted-foreground/60'>-</span>
                        )}
                      </TableCell>

                      {/* 5. Insentif Pengganti */}
                      <TableCell className='py-3 text-right text-xs tabular-nums'>
                        {staff.replacementAdditions > 0 ? (
                          <span className='text-emerald-600 dark:text-emerald-400 font-medium'>
                            +{formatCurrency(staff.replacementAdditions)}
                          </span>
                        ) : (
                          <span className='text-muted-foreground/60'>-</span>
                        )}
                      </TableCell>

                      {/* 6. Gaji Bersih THP */}
                      <TableCell className='py-3 text-right text-xs font-bold text-primary tabular-nums'>
                        {formatCurrency(staff.netPayroll)}
                      </TableCell>

                      {/* 7. Aksi */}
                      <TableCell
                        className='py-3 text-center pr-4'
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStaff(staff);
                        }}
                      >
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7 text-xs px-2 rounded-lg text-primary hover:text-primary hover:bg-primary/10 gap-1'
                        >
                          <Icons.receipt className='size-3.5' />
                          <span>Rincian</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
