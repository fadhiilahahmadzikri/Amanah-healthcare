'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { PatientSearchableSelect } from '@/features/data-pasien/components/registration/molecules/patient-searchable-select';
import type { ClinicService } from '@/features/clinic-essentials/types/clinic-essentials.types';
import { cn } from '@/lib/utils';

export interface PromotionFormFieldsBentoProps {
  title: string;
  setTitle: (val: string) => void;
  summary: string;
  setSummary: (val: string) => void;
  body: string;
  setBody: (val: string) => void;
  serviceId: string | null;
  onServiceChange: (id: string | null, selected?: ClinicService | null) => void;
  services: ClinicService[];
  ctaType: 'none' | 'whatsapp' | 'custom';
  setCtaType: (val: 'none' | 'whatsapp' | 'custom') => void;
  ctaLabel: string;
  setCtaLabel: (val: string) => void;
  ctaUrl: string;
  setCtaUrl: (val: string) => void;
  className?: string;
}

export function PromotionFormFieldsBento({
  title,
  setTitle,
  summary,
  setSummary,
  body,
  setBody,
  serviceId,
  onServiceChange,
  services,
  ctaType,
  setCtaType,
  ctaLabel,
  setCtaLabel,
  ctaUrl,
  setCtaUrl,
  className,
}: PromotionFormFieldsBentoProps) {
  const serviceOptions = React.useMemo(() => {
    return [
      {
        id: '',
        name: '— Umum (Tidak Terikat Layanan Tertentu) —',
        description: 'Promosi atau pengumuman berlaku untuk seluruh klinik',
      },
      ...services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.categoryName || undefined,
      })),
    ];
  }, [services]);

  const activeServiceName = React.useMemo(() => {
    if (!serviceId) return '';
    const found = services.find((s) => s.id === serviceId);
    return found ? found.name : '';
  }, [services, serviceId]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 flex flex-col h-full overflow-hidden shadow-2xs font-sans',
        className
      )}
    >
      {/* Box Header */}
      <div className='flex items-center justify-between pb-3 border-b border-border/40 shrink-0'>
        <div>
          <h4 className='text-xs sm:text-sm font-bold text-foreground tracking-tight'>
            Konten & Formulir Promosi
          </h4>
          <p className='text-[11px] text-muted-foreground mt-0.5 font-medium'>
            Judul, ringkasan, layanan terkait, detail isi, dan tombol aksi
          </p>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className='flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 pt-3 space-y-5 scrollbar-thin'>
        {/* Section A: Identitas & Teks Promosi */}
        <div className='space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Informasi Utama
          </span>

          <div className='space-y-1'>
            <div className='flex justify-between items-center text-[11px] text-muted-foreground px-0.5'>
              <span className='font-medium text-foreground'>Judul Promosi *</span>
              <span className={cn(title.length > 70 && 'text-amber-500 font-semibold')}>
                {title.length}/80
              </span>
            </div>
            <PatientLineInput
              id='promo_title'
              label=''
              placeholder='Contoh: Paket Medical Check-Up Spesial Akhir Tahun'
              value={title}
              onChange={setTitle}
              maxLength={80}
              required
              autoComplete='off'
            />
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between items-center text-[11px] text-muted-foreground px-0.5'>
              <span className='font-medium text-foreground'>Ringkasan Singkat *</span>
              <span className={cn(summary.length > 140 && 'text-amber-500 font-semibold')}>
                {summary.length}/160
              </span>
            </div>
            <PatientLineTextarea
              id='promo_summary'
              label=''
              placeholder='Penjelasan 1-2 kalimat yang informatif bagi pasien...'
              value={summary}
              onChange={setSummary}
              rows={2}
            />
          </div>

          {/* Tautan Layanan Medis */}
          <div>
            <PatientSearchableSelect
              id='promo_service_picker'
              label='Tautan Layanan Medis (Opsional)'
              placeholder='Pilih layanan medis klinik...'
              value={activeServiceName}
              options={serviceOptions}
              onSelect={(item) => {
                const targetService = item.id ? services.find((s) => s.id === item.id) : null;
                onServiceChange(item.id || null, targetService);
              }}
              searchPlaceholder='Cari nama layanan medis...'
            />
          </div>

          {/* Detail Tambahan / Body */}
          <div>
            <PatientLineTextarea
              id='promo_body'
              label='Detail Tambahan (Ditampilkan pada Halaman Detail & Dialog)'
              placeholder='Rincian prosedur, dokter pemeriksa, atau fasilitas paket promosi...'
              value={body}
              onChange={setBody}
              rows={3}
            />
          </div>
        </div>

        {/* Section B: Tombol Aksi Pasien (CTA) */}
        <div className='space-y-4 pt-2 border-t border-border/40'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Tombol Aksi Pasien (CTA)
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
            <button
              type='button'
              onClick={() => setCtaType('whatsapp')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-all cursor-pointer',
                ctaType === 'whatsapp'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs font-semibold'
                  : 'border-border/60 bg-card/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <div className='text-xs font-semibold text-foreground'>WhatsApp Chat</div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>Langsung ke admin klinik</div>
            </button>

            <button
              type='button'
              onClick={() => setCtaType('custom')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-all cursor-pointer',
                ctaType === 'custom'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs font-semibold'
                  : 'border-border/60 bg-card/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <div className='text-xs font-semibold text-foreground'>Tautan Kustom</div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>URL web atau booking</div>
            </button>

            <button
              type='button'
              onClick={() => setCtaType('none')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-all cursor-pointer',
                ctaType === 'none'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs font-semibold'
                  : 'border-border/60 bg-card/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <div className='text-xs font-semibold text-foreground'>Tanpa Tombol</div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>Pengumuman visual murni</div>
            </button>
          </div>

          {ctaType !== 'none' ? (
            <div className='space-y-3 pt-1'>
              <PatientLineInput
                id='promo_cta_label'
                label='Label Tombol CTA'
                placeholder='Contoh: Konsultasi Sekarang'
                value={ctaLabel}
                onChange={setCtaLabel}
                maxLength={30}
                autoComplete='off'
              />

              <PatientLineInput
                id='promo_cta_url'
                label={ctaType === 'whatsapp' ? 'Pesan Awal WhatsApp' : 'URL Tujuan'}
                placeholder={
                  ctaType === 'whatsapp'
                    ? 'Halo Amanah Healthcare, saya tertarik...'
                    : 'https://amanahhealthcare.com'
                }
                value={ctaUrl}
                onChange={setCtaUrl}
                autoComplete='off'
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Form Footer */}
      <div className='shrink-0 pt-2.5 mt-auto border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground'>
        <span className='font-medium'>
          {activeServiceName ? `Layanan: ${activeServiceName}` : 'Promosi Umum Klinik'}
        </span>
        <span className='font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded-md'>
          CTA: {ctaType === 'whatsapp' ? 'WhatsApp' : ctaType === 'custom' ? 'Kustom' : 'Nonaktif'}
        </span>
      </div>
    </div>
  );
}
