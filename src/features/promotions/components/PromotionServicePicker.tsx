'use client';

import * as React from 'react';
import { Check, Search, Sparkles, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EssentialCardIcon } from '@/features/clinic-essentials/utils/essential-icon-resolver';
import type { ClinicService } from '@/features/clinic-essentials/types/clinic-essentials.types';
import { cn } from '@/lib/utils';

export interface PromotionServicePickerProps {
  services: ClinicService[];
  value?: string | null;
  onChange: (serviceId: string | null, service?: ClinicService | null) => void;
  disabled?: boolean;
  className?: string;
}

export function PromotionServicePicker({
  services,
  value,
  onChange,
  disabled = false,
  className,
}: PromotionServicePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedService = React.useMemo(() => {
    if (!value) return null;
    return services.find((s) => s.id === value) || null;
  }, [services, value]);

  const filteredServices = React.useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase().trim();
    return services.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchCategory = Boolean(s.categoryName && s.categoryName.toLowerCase().includes(q));
      return matchName || matchCategory;
    });
  }, [services, search]);

  const handleSelect = (service: ClinicService | null) => {
    if (!service) {
      onChange(null, null);
    } else {
      onChange(service.id, service);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className='flex items-center gap-2'>
          <PopoverTrigger asChild>
            <button
              type='button'
              disabled={disabled}
              className={cn(
                'group flex h-10 flex-1 items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                disabled && 'pointer-events-none opacity-50',
                selectedService && 'border-primary/40 bg-primary/5'
              )}
            >
              <div className='flex min-w-0 items-center gap-2.5'>
                {selectedService ? (
                  <>
                    <EssentialCardIcon
                      iconName={selectedService.iconName}
                      fallback={selectedService.name.substring(0, 2)}
                      className='size-6 rounded-md bg-primary/10 text-primary'
                    />
                    <span className='truncate font-semibold text-foreground text-xs'>
                      {selectedService.name}
                    </span>
                  </>
                ) : (
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <Sparkles className='size-3.5 text-primary' />
                    <span>— Umum (Tidak Terikat Layanan Tertentu) —</span>
                  </div>
                )}
              </div>

              <span className='text-[11px] font-semibold text-primary group-hover:underline shrink-0 ml-2'>
                {selectedService ? 'Ubah' : 'Pilih'}
              </span>
            </button>
          </PopoverTrigger>

          {selectedService && !disabled ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleClear}
              className='size-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg cursor-pointer shrink-0'
              title='Hapus Tautan Layanan (Kembali ke Umum)'
            >
              <X className='size-4' />
            </Button>
          ) : null}
        </div>

        <PopoverContent
          align='start'
          className='w-[340px] sm:w-[400px] p-3 font-sans rounded-xl border-border/80 shadow-lg'
        >
          <div className='space-y-2.5'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border/50 pb-2'>
              <div className='flex items-center gap-1.5'>
                <Sparkles className='size-4 text-primary' />
                <h4 className='text-xs font-bold text-foreground'>Pilih Layanan Klinik</h4>
              </div>
              <Badge variant='outline' className='text-[10px] px-1.5 py-0'>
                {services.length} Layanan
              </Badge>
            </div>

            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Cari nama layanan medis...'
                className='h-8 pl-8 pr-7 text-xs bg-muted/30'
              />
              {search && (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5'
                >
                  <X className='size-3' />
                </button>
              )}
            </div>

            {/* General Promo Option */}
            <button
              type='button'
              onClick={() => handleSelect(null)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border border-border/70 p-2 text-left transition-all hover:bg-muted/50 cursor-pointer',
                !value && 'border-primary ring-1 ring-primary bg-primary/5'
              )}
            >
              <div className='min-w-0'>
                <p className='text-xs font-semibold text-foreground'>Umum (Tanpa Layanan Khusus)</p>
                <p className='text-[11px] text-muted-foreground'>
                  Promosi atau pengumuman berlaku untuk seluruh klinik
                </p>
              </div>
              {!value && <Check className='size-3.5 text-primary shrink-0' />}
            </button>

            {/* Services List */}
            <ScrollArea className='h-[220px] pr-2'>
              <div className='space-y-1.5 pt-0.5'>
                {filteredServices.length > 0 ? (
                  filteredServices.map((svc) => {
                    const isSelected = value === svc.id;
                    return (
                      <button
                        key={svc.id}
                        type='button'
                        onClick={() => handleSelect(svc)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-lg border border-border/60 p-2 text-left transition-all hover:border-primary/60 hover:bg-muted/40 cursor-pointer',
                          isSelected && 'border-primary ring-1 ring-primary bg-primary/5'
                        )}
                      >
                        <EssentialCardIcon
                          iconName={svc.iconName}
                          fallback={svc.name.substring(0, 2)}
                          className='size-7 rounded-md bg-muted/60 shrink-0'
                        />
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-xs font-semibold text-foreground leading-tight'>
                            {svc.name}
                          </p>
                          {svc.categoryName && (
                            <span className='text-[10px] text-muted-foreground'>
                              {svc.categoryName}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className='size-3.5 text-primary shrink-0' />}
                      </button>
                    );
                  })
                ) : (
                  <div className='p-6 text-center text-xs text-muted-foreground'>
                    Tidak ada layanan medis yang cocok
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}
