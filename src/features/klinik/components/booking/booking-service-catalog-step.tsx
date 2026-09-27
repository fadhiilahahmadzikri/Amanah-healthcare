'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  useClinicServiceCatalog,
  type UseClinicServiceCatalogResult
} from '../../model/useClinicServiceCatalog';
import type { ServiceCatalogItem } from '../../api/catalog.service';

export interface BookingServiceCatalogStepProps {
  selectedService: ServiceCatalogItem | null;
  onSelectService: (service: ServiceCatalogItem) => void;
  selectedComplaint: string;
  onSelectComplaint: (complaint: string) => void;
  customComplaint: string;
  onChangeCustomComplaint: (complaint: string) => void;
  visitType: 'Pemeriksaan Baru' | 'Kontrol Ulang';
  onChangeVisitType: (type: 'Pemeriksaan Baru' | 'Kontrol Ulang') => void;
  onContinue: () => void;
  catalogHook?: UseClinicServiceCatalogResult;
}

export function BookingServiceCatalogStep({
  selectedService,
  onSelectService,
  selectedComplaint,
  onSelectComplaint,
  customComplaint,
  onChangeCustomComplaint,
  visitType,
  onChangeVisitType,
  onContinue,
  catalogHook
}: BookingServiceCatalogStepProps) {
  const internalHook = useClinicServiceCatalog();
  const { categories, selectedCategoryCode, selectedCategory, selectCategory, isLoading, error } =
    catalogHook || internalHook;

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center p-12 space-y-3'>
        <Icons.spinner className='size-8 animate-spin text-primary' />
        <p className='text-sm text-muted-foreground'>Memuat katalog layanan klinik...</p>
      </div>
    );
  }

  if (error || categories.length === 0) {
    return (
      <div className='p-6 text-center space-y-3'>
        <p className='text-sm font-medium text-destructive'>
          Gagal memuat katalog layanan. Pastikan koneksi server aktif.
        </p>
      </div>
    );
  }

  const effectiveComplaint = customComplaint.trim() || selectedComplaint;
  const canContinue = !!selectedService && effectiveComplaint.length >= 3;

  return (
    <div className='space-y-5 text-left font-sans'>
      {/* 1. Category Tabs */}
      <div className='space-y-1.5'>
        <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
          Pilih Kategori Layanan
        </Label>
        <div className='flex flex-wrap gap-2'>
          {categories.map((cat) => {
            const isSelected = selectedCategoryCode === cat.code;
            return (
              <button
                key={cat.id}
                type='button'
                onClick={() => selectCategory(cat.code)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border text-left flex items-center gap-2',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/40 hover:bg-muted/80 text-foreground border-border/40'
                )}
              >
                <span>{cat.name}</span>
                <Badge
                  variant={isSelected ? 'secondary' : 'outline'}
                  className='text-[10px] px-1.5 py-0'
                >
                  {cat.services.length}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Services Grid */}
      <div className='space-y-1.5'>
        <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
          Pilih Tindakan / Layanan Medis
        </Label>
        <ScrollArea className='h-[200px] sm:h-[220px] rounded-xl border border-border/40 p-2 bg-muted/10'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {selectedCategory?.services.map((srv) => {
              const isSelected = selectedService?.id === srv.id;
              return (
                <button
                  key={srv.id}
                  type='button'
                  onClick={() => onSelectService(srv)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1.5',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border/40 bg-card hover:border-primary/40 hover:bg-accent/40'
                  )}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <span className='font-semibold text-xs sm:text-sm text-foreground leading-tight'>
                      {srv.name}
                    </span>
                    <Badge variant='outline' className='text-[10px] font-mono px-1.5 py-0 shrink-0'>
                      {srv.prefix}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                    <span>{srv.poliklinikName}</span>
                    {srv.complaints.length > 0 ? (
                      <>
                        <span>•</span>
                        <span>{srv.complaints.length} opsi keluhan</span>
                      </>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* 3. Visit Type & Complaints */}
      {selectedService ? (
        <div className='space-y-4 pt-2 border-t border-border/40'>
          {/* Visit Type */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              Tipe Kunjungan
            </Label>
            <RadioGroup
              value={visitType}
              onValueChange={(val) =>
                onChangeVisitType(val as 'Pemeriksaan Baru' | 'Kontrol Ulang')
              }
              className='grid grid-cols-2 gap-2'
            >
              {(['Pemeriksaan Baru', 'Kontrol Ulang'] as const).map((type) => (
                <label
                  key={type}
                  className={cn(
                    'flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-colors',
                    visitType === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/40 hover:bg-muted/40 text-foreground'
                  )}
                >
                  <RadioGroupItem value={type} />
                  <span>{type}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Preset Complaints */}
          {selectedService.complaints.length > 0 ? (
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Pilihan Cepat Keluhan Pasien
              </Label>
              <div className='flex flex-wrap gap-1.5'>
                {selectedService.complaints.map((comp) => {
                  const isSelected = selectedComplaint === comp && !customComplaint;
                  return (
                    <button
                      key={comp}
                      type='button'
                      onClick={() => {
                        onSelectComplaint(comp);
                        onChangeCustomComplaint('');
                      }}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-lg border transition-all text-left',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary font-medium'
                          : 'bg-muted/30 hover:bg-muted text-foreground border-border/40'
                      )}
                    >
                      {comp}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Custom Complaint Input */}
          <div className='space-y-1.5'>
            <Label htmlFor='custom-complaint' className='text-xs font-semibold text-foreground'>
              Keluhan Utama / Catatan Khusus
            </Label>
            <Input
              id='custom-complaint'
              placeholder='Deskripsikan keluhan atau gejala yang dirasakan...'
              value={customComplaint || (selectedComplaint ? selectedComplaint : '')}
              onChange={(e) => {
                onChangeCustomComplaint(e.target.value);
                if (selectedComplaint && e.target.value !== selectedComplaint) {
                  onSelectComplaint('');
                }
              }}
              className='text-xs sm:text-sm'
            />
            <p className='text-[11px] text-muted-foreground'>
              Minimal 3 karakter untuk melanjutkan ke tahap penentuan pasien & jadwal.
            </p>
          </div>
        </div>
      ) : null}

      {/* Action Button */}
      <div className='pt-2 flex justify-end'>
        <Button
          type='button'
          disabled={!canContinue}
          onClick={onContinue}
          className='w-full sm:w-auto text-xs sm:text-sm'
        >
          <span>Lanjut ke Data Pasien & Jadwal</span>
          <Icons.chevronRight className='ml-1.5 size-4' />
        </Button>
      </div>
    </div>
  );
}
