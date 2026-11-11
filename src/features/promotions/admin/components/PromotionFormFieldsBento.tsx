'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
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
  startDateStr: string;
  setStartDateStr: (val: string) => void;
  endDateStr: string;
  setEndDateStr: (val: string) => void;
  customTermsNote: string;
  setCustomTermsNote: (val: string) => void;
  combinedTerms: string;
  ctaType: 'none' | 'whatsapp' | 'custom';
  setCtaType: (val: 'none' | 'whatsapp' | 'custom') => void;
  ctaLabel: string;
  setCtaLabel: (val: string) => void;
  ctaUrl: string;
  setCtaUrl: (val: string) => void;
  showBanner: boolean;
  setShowBanner: (val: boolean) => void;
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  showSection: boolean;
  setShowSection: (val: boolean) => void;
  priority: number;
  setPriority: (val: number) => void;
  broadcastToUsers: boolean;
  setBroadcastToUsers: (val: boolean) => void;
  broadcastInApp: boolean;
  setBroadcastInApp: (val: boolean) => void;
  broadcastPush: boolean;
  setBroadcastPush: (val: boolean) => void;
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
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
  startDateStr,
  setStartDateStr,
  endDateStr,
  setEndDateStr,
  customTermsNote,
  setCustomTermsNote,
  combinedTerms,
  ctaType,
  setCtaType,
  ctaLabel,
  setCtaLabel,
  ctaUrl,
  setCtaUrl,
  showBanner,
  setShowBanner,
  showModal,
  setShowModal,
  showSection,
  setShowSection,
  priority,
  setPriority,
  broadcastToUsers,
  setBroadcastToUsers,
  broadcastInApp,
  setBroadcastInApp,
  broadcastPush,
  setBroadcastPush,
  isPublished,
  setIsPublished,
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
      {/* Box Header (Tanpa Header Icon) */}
      <div className='flex items-center justify-between pb-3 border-b border-border/40 shrink-0'>
        <div>
          <h4 className='text-xs sm:text-sm font-bold text-foreground tracking-tight'>
            Konten & Formulir Promosi
          </h4>
          <p className='text-[11px] text-muted-foreground mt-0.5 font-medium'>
            Kelola teks judul, ringkasan, tautan layanan, jadwal, CTA, dan penempatan
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
              placeholder='Penjelasan 1-2 kalimat yang menarik minat pasien...'
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

          {/* Detail Tambahan */}
          <div>
            <PatientLineTextarea
              id='promo_body'
              label='Detail Tambahan (Ditampilkan pada Popup Modal)'
              placeholder='Rincian prosedur, dokter pemeriksa, atau fasilitas paket promosi...'
              value={body}
              onChange={setBody}
              rows={3}
            />
          </div>
        </div>

        {/* Section B: Jadwal & Ketentuan Khusus */}
        <div className='space-y-4 pt-2 border-t border-border/40'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Jadwal Tayang & Syarat Ketentuan
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <CustomDatePicker
              id='promo_start_date'
              label='Mulai Tayang'
              ariaLabel='Mulai Tayang'
              value={startDateStr}
              onChange={setStartDateStr}
              placeholder='Pilih tanggal mulai'
            />

            <CustomDatePicker
              id='promo_end_date'
              label='Selesai Tayang'
              ariaLabel='Selesai Tayang'
              value={endDateStr}
              onChange={setEndDateStr}
              placeholder='Pilih tanggal selesai'
            />
          </div>

          <div>
            <PatientLineInput
              id='promo_terms_note'
              label='Catatan Ketentuan Khusus (Opsional)'
              placeholder='Contoh: Khusus pasien umum non-asuransi, kuota terbatas'
              value={customTermsNote}
              onChange={setCustomTermsNote}
              maxLength={300}
              autoComplete='off'
            />

            {combinedTerms ? (
              <div className='mt-2 rounded-xl bg-card/60 p-2.5 border border-border/50 text-[11px] text-muted-foreground'>
                <span className='font-semibold text-foreground'>Hasil Syarat & Ketentuan: </span>
                <span>{combinedTerms}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Section C: Tombol Aksi Pasien (CTA) */}
        <div className='space-y-4 pt-2 border-t border-border/40'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Tombol Aksi Pasien (CTA)
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
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
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
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

        {/* Section D: Penempatan & Broadcast */}
        <div className='space-y-4 pt-2 border-t border-border/40'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Penempatan & Status Publikasi
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
            <label
              htmlFor='promo_placement_banner'
              className='flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/50 p-2.5 cursor-pointer hover:bg-muted/40 transition-colors'
            >
              <input
                id='promo_placement_banner'
                type='checkbox'
                aria-label='Tampilkan di Top Banner'
                checked={showBanner}
                onChange={(e) => setShowBanner(e.target.checked)}
                className='size-4 rounded accent-primary cursor-pointer'
              />
              <div>
                <span className='text-xs font-semibold text-foreground block'>Top Banner</span>
                <span className='text-[10px] text-muted-foreground block'>Strip atas beranda</span>
              </div>
            </label>

            <label
              htmlFor='promo_placement_modal'
              className='flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/50 p-2.5 cursor-pointer hover:bg-muted/40 transition-colors'
            >
              <input
                id='promo_placement_modal'
                type='checkbox'
                aria-label='Tampilkan di Popup Modal'
                checked={showModal}
                onChange={(e) => setShowModal(e.target.checked)}
                className='size-4 rounded accent-primary cursor-pointer'
              />
              <div>
                <span className='text-xs font-semibold text-foreground block'>Popup Dialog</span>
                <span className='text-[10px] text-muted-foreground block'>Muncul otomatis</span>
              </div>
            </label>

            <label
              htmlFor='promo_placement_section'
              className='flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/50 p-2.5 cursor-pointer hover:bg-muted/40 transition-colors'
            >
              <input
                id='promo_placement_section'
                type='checkbox'
                aria-label='Tampilkan di Home Section'
                checked={showSection}
                onChange={(e) => setShowSection(e.target.checked)}
                className='size-4 rounded accent-primary cursor-pointer'
              />
              <div>
                <span className='text-xs font-semibold text-foreground block'>Home Section</span>
                <span className='text-[10px] text-muted-foreground block'>Kartu promo beranda</span>
              </div>
            </label>
          </div>

          {/* Prioritas Tampil */}
          <div className='flex items-center justify-between gap-3 pt-1'>
            <div>
              <label htmlFor='promo_priority' className='text-xs font-semibold text-foreground block'>
                Prioritas Tampil
              </label>
              <p className='text-[11px] text-muted-foreground'>
                Angka lebih tinggi ditampilkan lebih awal pada banner dan modal
              </p>
            </div>
            <div className='w-24 shrink-0'>
              <PatientLineInput
                id='promo_priority'
                label=''
                type='number'
                min={0}
                value={priority}
                onChange={(val) => setPriority(Math.max(0, Number(val) || 0))}
                isMonospace
              />
            </div>
          </div>

          {/* Broadcast Switch */}
          <div className='pt-2 border-t border-border/40 space-y-2'>
            <div className='flex items-start justify-between gap-4'>
              <div className='space-y-0.5'>
                <div className='text-xs font-semibold text-foreground'>
                  Kirim Notifikasi Otomatis ke Pasien
                </div>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  Mengirimkan notifikasi ke akun pasien melalui antrean RabbitMQ saat status promosi Live
                </p>
              </div>
              <Switch
                checked={broadcastToUsers}
                onCheckedChange={setBroadcastToUsers}
                aria-label='Kirim Notifikasi Otomatis ke Pasien'
              />
            </div>

            {broadcastToUsers ? (
              <div className='flex items-center gap-4 pl-1 pt-1'>
                <label
                  htmlFor='promo_broadcast_in_app'
                  className='flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer'
                >
                  <input
                    id='promo_broadcast_in_app'
                    type='checkbox'
                    aria-label='In-App Notification'
                    checked={broadcastInApp}
                    onChange={(e) => setBroadcastInApp(e.target.checked)}
                    className='size-3.5 rounded accent-primary cursor-pointer'
                  />
                  <span>In-App Notification</span>
                </label>

                <label
                  htmlFor='promo_broadcast_push'
                  className='flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer'
                >
                  <input
                    id='promo_broadcast_push'
                    type='checkbox'
                    aria-label='Push Notification'
                    checked={broadcastPush}
                    onChange={(e) => setBroadcastPush(e.target.checked)}
                    className='size-3.5 rounded accent-primary cursor-pointer'
                  />
                  <span>Push Notification</span>
                </label>
              </div>
            ) : null}
          </div>

          {/* Publish Switch */}
          <div className='pt-2 border-t border-border/40 flex items-start justify-between gap-4'>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Publikasikan Sekarang</div>
              <p className='text-[11px] text-muted-foreground'>
                Jika dinonaktifkan, promosi akan disimpan sebagai draf
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              aria-label='Publikasikan Sekarang'
            />
          </div>
        </div>
      </div>

      {/* Form Footer (Bento Layer 3: Pinned Footer) */}
      <div className='shrink-0 pt-2.5 mt-auto border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground'>
        <div className='flex items-center gap-1.5 font-medium'>
          <span
            className={cn(
              'size-1.5 rounded-full',
              isPublished ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          />
          <span>{isPublished ? 'Status: Aktif / Publik' : 'Status: Draf / Disimpan'}</span>
        </div>
        <span className='font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded-md'>
          {[showBanner && 'Banner', showModal && 'Modal', showSection && 'Section'].filter(Boolean).length || 0} Penempatan
        </span>
      </div>
    </div>
  );
}
