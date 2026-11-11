'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { ServiceImagePicker } from '@/features/clinic-essentials/components/atoms/service-image-picker';
import { cn } from '@/lib/utils';
import type { PromoImageType, ModalMode } from '../../types/promotions.types';

export interface PromotionVisualBentoProps {
  // Visual Image
  imageType: PromoImageType;
  setImageType: (val: PromoImageType) => void;
  imageValue: string;
  setImageValue: (val: string) => void;
  imageAlt: string;
  setImageAlt: (val: string) => void;
  urlTestStatus: 'idle' | 'testing' | 'valid' | 'invalid';
  onTestUrl: () => void;

  // Placements & Format
  showBanner: boolean;
  setShowBanner: (val: boolean) => void;
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  modalMode: ModalMode;
  setModalMode: (val: ModalMode) => void;
  showSection: boolean;
  setShowSection: (val: boolean) => void;

  // Schedule & Terms
  startDateStr: string;
  setStartDateStr: (val: string) => void;
  endDateStr: string;
  setEndDateStr: (val: string) => void;
  customTermsNote: string;
  setCustomTermsNote: (val: string) => void;
  combinedTerms: string;

  // Priority, Broadcast & Publication
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

export function PromotionVisualBento({
  imageType,
  setImageType,
  imageValue,
  setImageValue,
  imageAlt,
  setImageAlt,
  urlTestStatus,
  onTestUrl,
  showBanner,
  setShowBanner,
  showModal,
  setShowModal,
  modalMode,
  setModalMode,
  showSection,
  setShowSection,
  startDateStr,
  setStartDateStr,
  endDateStr,
  setEndDateStr,
  customTermsNote,
  setCustomTermsNote,
  combinedTerms,
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
}: PromotionVisualBentoProps) {
  const placementCount = [showBanner, showModal, showSection].filter(Boolean).length;

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
            Visual & Pengaturan Tayang
          </h4>
          <p className='text-[11px] text-muted-foreground mt-0.5 font-medium'>
            Aset gambar, penempatan, format tampilan, dan jadwal
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 pt-3 space-y-5 scrollbar-thin'>
        {/* Section A: Gambar Visual */}
        <div className='space-y-3'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Aset Gambar Promosi
          </span>

          {/* Segmented Source Selector */}
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setImageType('static')}
              className={cn(
                'flex-1 rounded-xl border py-2 px-3 text-xs font-semibold transition-all cursor-pointer text-center',
                imageType === 'static'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
              )}
            >
              Katalog Gambar Klinik
            </button>
            <button
              type='button'
              onClick={() => setImageType('url')}
              className={cn(
                'flex-1 rounded-xl border py-2 px-3 text-xs font-semibold transition-all cursor-pointer text-center',
                imageType === 'url'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
              )}
            >
              Tautan URL Gambar
            </button>
          </div>

          {/* Mode 1: Katalog */}
          {imageType === 'static' ? (
            <div className='flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card/60'>
              <ServiceImagePicker
                value={imageValue}
                onChange={(url) => {
                  if (url) {
                    setImageValue(url);
                    if (!imageAlt) {
                      const baseName = url.split('/').pop()?.replace('.webp', '') || 'Gambar Layanan';
                      setImageAlt(baseName);
                    }
                  }
                }}
              />
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-semibold text-foreground truncate'>
                  {imageValue ? imageValue.split('/').pop() : 'Belum ada gambar terpilih'}
                </p>
                <p className='text-[11px] text-muted-foreground'>
                  Klik thumbnail untuk memilih aset visual klinik
                </p>
              </div>
            </div>
          ) : (
            /* Mode 2: URL */
            <div className='space-y-2'>
              <div className='flex items-end gap-2'>
                <div className='flex-1 min-w-0'>
                  <PatientLineInput
                    id='promo_image_url'
                    label='Tautan URL Gambar *'
                    type='url'
                    placeholder='https://images.example.com/promo-banner.webp'
                    value={imageValue}
                    onChange={setImageValue}
                    autoComplete='off'
                  />
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  onClick={onTestUrl}
                  disabled={!imageValue.trim() || urlTestStatus === 'testing'}
                  className='text-xs font-semibold px-4 h-9 shrink-0 cursor-pointer shadow-2xs'
                >
                  {urlTestStatus === 'testing' ? (
                    <>
                      <Icons.spinner className='size-3 mr-1.5 animate-spin' />
                      Menguji...
                    </>
                  ) : (
                    'Uji Muat'
                  )}
                </Button>
              </div>

              {urlTestStatus === 'valid' ? (
                <p className='text-[11px] text-primary font-medium flex items-center gap-1.5'>
                  <Icons.check className='size-3.5' /> Gambar valid dan siap digunakan.
                </p>
              ) : urlTestStatus === 'invalid' ? (
                <p className='text-[11px] text-destructive font-medium flex items-center gap-1.5'>
                  <Icons.close className='size-3.5' /> Gambar gagal dimuat. Periksa tautan publik Anda.
                </p>
              ) : null}
            </div>
          )}

          {/* Alt Text */}
          <div>
            <PatientLineInput
              id='promo_image_alt'
              label='Teks Alternatif Gambar (Alt Text)'
              placeholder='Deskripsi visual singkat untuk aksesibilitas'
              value={imageAlt}
              onChange={setImageAlt}
              autoComplete='off'
            />
          </div>
        </div>

        {/* Section B: Penempatan & Format Tampilan */}
        <div className='space-y-3 pt-2 border-t border-border/40'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Penempatan & Format Tampilan
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
            <label
              htmlFor='promo_placement_banner'
              className='flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2 cursor-pointer hover:bg-muted/40 transition-colors'
            >
              <input
                id='promo_placement_banner'
                type='checkbox'
                aria-label='Tampilkan di Top Banner'
                checked={showBanner}
                onChange={(e) => setShowBanner(e.target.checked)}
                className='size-4 rounded accent-primary cursor-pointer'
              />
              <div className='min-w-0'>
                <span className='text-xs font-semibold text-foreground block truncate'>Top Banner</span>
                <span className='text-[10px] text-muted-foreground block truncate'>Strip atas</span>
              </div>
            </label>

            <label
              htmlFor='promo_placement_modal'
              className='flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2 cursor-pointer hover:bg-muted/40 transition-colors'
            >
              <input
                id='promo_placement_modal'
                type='checkbox'
                aria-label='Tampilkan di Popup Modal'
                checked={showModal}
                onChange={(e) => setShowModal(e.target.checked)}
                className='size-4 rounded accent-primary cursor-pointer'
              />
              <div className='min-w-0'>
                <span className='text-xs font-semibold text-foreground block truncate'>Pop-up</span>
                <span className='text-[10px] text-muted-foreground block truncate'>Dialog otomatis</span>
              </div>
            </label>

            <label
              htmlFor='promo_placement_section'
              className='flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2 cursor-pointer hover:bg-muted/40 transition-colors'
            >
              <input
                id='promo_placement_section'
                type='checkbox'
                aria-label='Tampilkan di Home Section'
                checked={showSection}
                onChange={(e) => setShowSection(e.target.checked)}
                className='size-4 rounded accent-primary cursor-pointer'
              />
              <div className='min-w-0'>
                <span className='text-xs font-semibold text-foreground block truncate'>Section</span>
                <span className='text-[10px] text-muted-foreground block truncate'>Kartu beranda</span>
              </div>
            </label>
          </div>

          {/* Switcher Mode: Kartu Rincian vs Poster Murni */}
          {showModal || showSection ? (
            <div className='rounded-xl border border-border/60 bg-muted/30 p-2.5 space-y-2'>
              <span className='text-xs font-semibold text-foreground block'>
                Format Tampilan Promo
              </span>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <button
                  type='button'
                  onClick={() => setModalMode('card')}
                  className={cn(
                    'rounded-lg border p-2 text-left transition-all cursor-pointer',
                    modalMode === 'card'
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs font-semibold'
                      : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div className='text-xs font-semibold text-foreground'>🏷️ Kartu Rincian</div>
                  <div className='text-[10px] text-muted-foreground mt-0.5'>Gambar banner + teks di bawahnya</div>
                </button>

                <button
                  type='button'
                  onClick={() => setModalMode('image_only')}
                  className={cn(
                    'rounded-lg border p-2 text-left transition-all cursor-pointer',
                    modalMode === 'image_only'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs font-semibold'
                      : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div className='text-xs font-semibold text-foreground'>🖼️ Poster Murni</div>
                  <div className='text-[10px] text-muted-foreground mt-0.5'>Cuma poster flyer, klik ➔ Detail</div>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Section C: Jadwal Tayang & Syarat Ketentuan */}
        <div className='space-y-3 pt-2 border-t border-border/40'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Jadwal Tayang & Syarat Ketentuan
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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
              <div className='mt-2 rounded-xl bg-card/60 p-2 border border-border/50 text-[11px] text-muted-foreground'>
                <span className='font-semibold text-foreground'>Syarat & Ketentuan: </span>
                <span>{combinedTerms}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Section D: Prioritas, Notifikasi & Publikasi */}
        <div className='space-y-3 pt-2 border-t border-border/40'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Distribusi & Publikasi
          </span>

          {/* Prioritas Tampil */}
          <div className='flex items-center justify-between gap-3'>
            <div>
              <label htmlFor='promo_priority' className='text-xs font-semibold text-foreground block'>
                Prioritas Tampil
              </label>
              <p className='text-[11px] text-muted-foreground'>
                Angka lebih tinggi ditampilkan lebih awal
              </p>
            </div>
            <div className='w-20 shrink-0'>
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
          <div className='pt-1 space-y-2'>
            <div className='flex items-start justify-between gap-4'>
              <div className='space-y-0.5'>
                <div className='text-xs font-semibold text-foreground'>
                  Kirim Notifikasi ke Pasien
                </div>
                <p className='text-[11px] text-muted-foreground'>
                  Kirim pemberitahuan saat status promosi Live
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
                  <span>In-App</span>
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
                  <span>Push</span>
                </label>
              </div>
            ) : null}
          </div>

          {/* Publish Switch */}
          <div className='pt-1 flex items-start justify-between gap-4'>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Publikasikan Sekarang</div>
              <p className='text-[11px] text-muted-foreground'>
                {isPublished ? 'Promosi tampil di situs publik' : 'Tersimpan sebagai draf internal'}
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

      {/* Visual Footer */}
      <div className='shrink-0 pt-2.5 mt-auto border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground'>
        <div className='flex items-center gap-1.5 font-medium'>
          <span
            className={cn(
              'size-1.5 rounded-full',
              isPublished ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          />
          <span>{isPublished ? 'Aktif / Publik' : 'Draf Internal'}</span>
        </div>
        <span className='font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded-md'>
          {placementCount} Penempatan
        </span>
      </div>
    </div>
  );
}
