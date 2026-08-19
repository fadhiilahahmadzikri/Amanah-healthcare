'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface DoctorScheduleFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  monthFilter: string;
  onMonthFilterChange: (month: string) => void;
  dateFilter: Date | undefined;
  onDateFilterChange: (date: Date | undefined) => void;
  selectedPoli: string[];
  onSelectedPoliChange: (poli: string[]) => void;
  selectedStatuses: string[];
  onSelectedStatusesChange: (statuses: string[]) => void;
  onResetAll: () => void;
  className?: string;
}

const MONTH_OPTIONS = [
  { value: 'ALL', label: 'Semua Bulan' },
  { value: 'Mei 2026', label: 'Mei 2026' },
  { value: 'Jun 2026', label: 'Juni 2026' },
  { value: 'Jul 2026', label: 'Juli 2026' },
  { value: 'Ags 2026', label: 'Agustus 2026' }
];

const POLI_OPTIONS = [
  'Penyakit Dalam',
  'Spesialis Anak',
  'Kebidanan & Kandungan',
  'Dokter Gigi',
  'Ortopedi & Traumatologi',
  'Dermatologi',
  'Jantung & Kardiovaskular',
  'Spesialis Mata',
  'Spesialis THT',
  'Kesehatan Jiwa & Psikiatri',
  'Neurologi / Saraf',
  'Dokter Umum'
];

const STATUS_OPTIONS: {
  value: string;
  label: string;
  dotColor: string;
}[] = [
  { value: 'Aktif', label: 'Aktif', dotColor: 'bg-emerald-500' },
  { value: 'Sebagian', label: 'Sebagian', dotColor: 'bg-amber-500' },
  { value: 'Cuti', label: 'Cuti', dotColor: 'bg-purple-500' },
  { value: 'Tutup', label: 'Tutup', dotColor: 'bg-rose-500' },
  { value: 'Terkoneksi', label: 'Terkoneksi', dotColor: 'bg-blue-500' },
  { value: 'Pending', label: 'Pending', dotColor: 'bg-amber-500' }
];

function formatDateDisplay(d: Date): string {
  const day = d.getDate();
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
  return `${day} ${months[d.getMonth()]}`;
}

export function DoctorScheduleFilters({
  searchQuery,
  onSearchChange,
  monthFilter,
  onMonthFilterChange,
  dateFilter,
  onDateFilterChange,
  selectedPoli,
  onSelectedPoliChange,
  selectedStatuses,
  onSelectedStatusesChange,
  onResetAll,
  className
}: DoctorScheduleFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isPoliOpen, setIsPoliOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Sync local search when external reset occurs
  React.useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // Debounced query dispatch (250ms) to ensure smooth 60fps typing without layout reflow
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    Boolean(localSearch.trim()) ||
    (monthFilter !== 'ALL' && monthFilter !== '') ||
    Boolean(dateFilter) ||
    selectedPoli.length > 0 ||
    selectedStatuses.length > 0;

  const handleTogglePoli = (poli: string) => {
    if (selectedPoli.includes(poli)) {
      onSelectedPoliChange(selectedPoli.filter((p) => p !== poli));
    } else {
      onSelectedPoliChange([...selectedPoli, poli]);
    }
  };

  const handleToggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onSelectedStatusesChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onSelectedStatusesChange([...selectedStatuses, status]);
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2 font-sans select-none', className)}>
      {/* 1. Global Search Input */}
      <div className='relative flex-1 min-w-[200px] max-w-[280px]'>
        <Icons.search className='size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='text'
          aria-label='Pencarian Dokter'
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder='Pencarian Dokter...'
          className='h-8 pl-8 pr-3 text-xs bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary shadow-2xs'
        />
      </div>

      {/* 2. Month Filter (Bulan) */}
      <Popover open={isMonthOpen} onOpenChange={setIsMonthOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 border-dashed gap-1.5 text-xs'>
            <Icons.calendar className='size-3.5 text-muted-foreground' />
            <span>Bulan</span>
            {monthFilter && monthFilter !== 'ALL' && (
              <>
                <Separator orientation='vertical' className='mx-0.5 h-3.5' />
                <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                  {monthFilter}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-48 p-0' align='start'>
          <Command>
            <CommandInput placeholder='Pilih bulan...' />
            <CommandList>
              <CommandEmpty>Bulan tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {MONTH_OPTIONS.map((opt) => {
                  const isSelected = monthFilter === opt.value;
                  return (
                    <CommandItem
                      key={opt.value}
                      onSelect={() => {
                        onMonthFilterChange(opt.value);
                        setIsMonthOpen(false);
                      }}
                      className='text-xs cursor-pointer'
                    >
                      <div
                        className={cn(
                          'mr-2 flex size-4 items-center justify-center rounded-[4px] border transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-muted-foreground/40 opacity-60 [&_svg]:invisible'
                        )}
                      >
                        <Icons.check className='size-3 text-white stroke-[3]' />
                      </div>
                      <span>{opt.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {monthFilter !== 'ALL' && monthFilter !== '' && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onMonthFilterChange('ALL');
                        setIsMonthOpen(false);
                      }}
                      className='justify-center text-center text-xs cursor-pointer'
                    >
                      Reset Bulan
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 3. Date Filter (Tanggal Calendar Popover) */}
      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 border-dashed gap-1.5 text-xs'>
            <Icons.calendar className='size-3.5 text-muted-foreground' />
            <span>Tanggal</span>
            {dateFilter && (
              <>
                <Separator orientation='vertical' className='mx-0.5 h-3.5' />
                <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                  {formatDateDisplay(dateFilter)}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={dateFilter}
            onSelect={(d) => {
              onDateFilterChange(d);
              setIsDateOpen(false);
            }}
            initialFocus
          />
          {dateFilter && (
            <div className='p-2 border-t border-border'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  onDateFilterChange(undefined);
                  setIsDateOpen(false);
                }}
                className='w-full text-xs h-7 justify-center'
              >
                Reset Tanggal
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* 4. Poli Filter */}
      <Popover open={isPoliOpen} onOpenChange={setIsPoliOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 border-dashed gap-1.5 text-xs'>
            <Icons.plusCircle className='size-3.5 text-muted-foreground' />
            <span>Poli</span>
            {selectedPoli.length > 0 && (
              <>
                <Separator orientation='vertical' className='mx-0.5 h-3.5' />
                <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                  {selectedPoli.length}
                </Badge>
                <div className='hidden items-center gap-1 xl:flex'>
                  {selectedPoli.length <= 2 ? (
                    selectedPoli.map((poli) => (
                      <Badge
                        key={poli}
                        variant='secondary'
                        className='rounded-sm px-1 font-normal text-[11px]'
                      >
                        {poli}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                      {selectedPoli.length} dipilih
                    </Badge>
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-56 p-0' align='start'>
          <Command>
            <CommandInput placeholder='Cari spesialisasi / poli...' />
            <CommandList>
              <CommandEmpty>Poli tidak ditemukan.</CommandEmpty>
              <CommandGroup className='max-h-64 overflow-y-auto'>
                {POLI_OPTIONS.map((poli) => {
                  const isSelected = selectedPoli.includes(poli);
                  return (
                    <CommandItem
                      key={poli}
                      onSelect={() => handleTogglePoli(poli)}
                      className='text-xs cursor-pointer'
                    >
                      <div
                        className={cn(
                          'mr-2 flex size-4 items-center justify-center rounded-[4px] border transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-muted-foreground/40 opacity-60 [&_svg]:invisible'
                        )}
                      >
                        <Icons.check className='size-3 text-white stroke-[3]' />
                      </div>
                      <span className='truncate'>{poli}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedPoli.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onSelectedPoliChange([])}
                      className='justify-center text-center text-xs cursor-pointer'
                    >
                      Reset Poli
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 5. Status Filter */}
      <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 border-dashed gap-1.5 text-xs'>
            <Icons.plusCircle className='size-3.5 text-muted-foreground' />
            <span>Status</span>
            {selectedStatuses.length > 0 && (
              <>
                <Separator orientation='vertical' className='mx-0.5 h-3.5' />
                <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                  {selectedStatuses.length}
                </Badge>
                <div className='hidden items-center gap-1 xl:flex'>
                  {selectedStatuses.length <= 2 ? (
                    selectedStatuses.map((st) => (
                      <Badge
                        key={st}
                        variant='secondary'
                        className='rounded-sm px-1 font-normal text-[11px]'
                      >
                        {st}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                      {selectedStatuses.length} dipilih
                    </Badge>
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-48 p-0' align='start'>
          <Command>
            <CommandInput placeholder='Filter status...' />
            <CommandList>
              <CommandEmpty>Status tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = selectedStatuses.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      onSelect={() => handleToggleStatus(opt.value)}
                      className='text-xs cursor-pointer'
                    >
                      <div
                        className={cn(
                          'mr-2 flex size-4 items-center justify-center rounded-[4px] border transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-muted-foreground/40 opacity-60 [&_svg]:invisible'
                        )}
                      >
                        <Icons.check className='size-3 text-white stroke-[3]' />
                      </div>
                      <span className={cn('size-2 rounded-full mr-1.5 shrink-0', opt.dotColor)} />
                      <span>{opt.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedStatuses.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onSelectedStatusesChange([])}
                      className='justify-center text-center text-xs cursor-pointer'
                    >
                      Reset Status
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 6. Reset Filters Button */}
      {isFiltered && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onResetAll}
          className='h-8 px-2.5 text-xs border border-dashed border-border'
        >
          <Icons.close className='size-3.5 mr-1' />
          Reset
        </Button>
      )}
    </div>
  );
}
