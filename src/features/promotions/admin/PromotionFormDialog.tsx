'use client';

import * as React from 'react';
import {
  Calendar,
  Check,
  ExternalLink,
  Eye,
  Info,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  Radio,
  Send,
  Smartphone,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { CLINIC_WHATSAPP_CONFIG } from '@/config/whatsapp.config';
import type { ClinicService } from '@/features/clinic-essentials/types/clinic-essentials.types';
import { ServiceImagePicker } from '@/features/clinic-essentials/components/atoms/service-image-picker';
import { promotionsApi } from '../api/promotions.api';
import { buildWhatsAppUrl, isSafeCtaUrl } from '../lib/cta';
import { formatWibPeriod } from '../lib/schedule';
import { normalizeImageUrl } from '../lib/image';
import type {
  AdminPromotion,
  CreatePromotionPayload,
  ModalFrequency,
  PromoImageType,
  PublicPromotion,
} from '../types/promotions.types';
import { PromotionFormSchema } from '../schemas/promotion-form.schema';
import { PromotionServicePicker } from '../components/PromotionServicePicker';
import { PromoBanner } from '../components/PromoBanner';
import { PromoCard } from '../components/PromoCard';
import { PromoImage } from '../components/PromoImage';
import { PromotionsProvider } from '../context/PromotionsContext';

export interface PromotionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  promotion?: AdminPromotion | null;
  isDuplicate?: boolean;
  services?: ClinicService[];
  onSuccess?: () => void;
}

export function PromotionFormDialog({
  isOpen,
  onClose,
  promotion,
  isDuplicate = false,
  services = [],
  onSuccess,
}: PromotionFormDialogProps) {
  const isEdit = Boolean(promotion && !isDuplicate);

  // Form Fields
  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [body, setBody] = React.useState('');
  const [customTermsNote, setCustomTermsNote] = React.useState('');
  const [serviceId, setServiceId] = React.useState<string | null>(null);

  // Visual Image
  const [imageType, setImageType] = React.useState<PromoImageType>('static');
  const [imageValue, setImageValue] = React.useState('');
  const [imageAlt, setImageAlt] = React.useState('');
  const [urlTestStatus, setUrlTestStatus] = React.useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

  // CTA Settings
  const [ctaType, setCtaType] = React.useState<'none' | 'whatsapp' | 'custom'>('whatsapp');
  const [ctaLabel, setCtaLabel] = React.useState('Konsultasi WhatsApp');
  const [ctaUrl, setCtaUrl] = React.useState('');

  // Placements & Display
  const [showBanner, setShowBanner] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [showSection, setShowSection] = React.useState(true);
  const [modalFrequency, setModalFrequency] = React.useState<ModalFrequency>('once_per_day');
  const [modalDelaySec, setModalDelaySec] = React.useState(3);
  const [priority, setPriority] = React.useState(0);
  const [isPublished, setIsPublished] = React.useState(false);

  // Schedule Dates ('YYYY-MM-DD')
  const [startDateStr, setStartDateStr] = React.useState('');
  const [endDateStr, setEndDateStr] = React.useState('');

  // Broadcast Settings
  const [broadcastToUsers, setBroadcastToUsers] = React.useState(false);
  const [broadcastInApp, setBroadcastInApp] = React.useState(true);
  const [broadcastPush, setBroadcastPush] = React.useState(true);

  // UI State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'form' | 'preview'>('form');
  const [previewViewport, setPreviewViewport] = React.useState<'desktop' | 'mobile'>('desktop');

  // Populate form on open/edit
  React.useEffect(() => {
    if (isOpen && promotion) {
      setTitle(isDuplicate ? `${promotion.title} (Salinan)` : promotion.title);
      setSummary(promotion.summary);
      setBody(promotion.body ?? '');
      setCustomTermsNote(promotion.terms ?? '');
      setServiceId(promotion.serviceId ?? null);
      setImageType(promotion.imageType);
      setImageValue(promotion.imageValue);
      setImageAlt(promotion.imageAlt);

      if (!promotion.ctaUrl) {
        setCtaType('none');
        setCtaLabel('');
        setCtaUrl('');
      } else if (promotion.ctaUrl.includes('wa.me') || promotion.ctaUrl.includes('whatsapp.com')) {
        setCtaType('whatsapp');
        setCtaLabel(promotion.ctaLabel ?? 'Konsultasi WhatsApp');
        setCtaUrl(promotion.ctaUrl);
      } else {
        setCtaType('custom');
        setCtaLabel(promotion.ctaLabel ?? 'Pelajari Selengkapnya');
        setCtaUrl(promotion.ctaUrl);
      }

      setShowBanner(promotion.showBanner);
      setShowModal(promotion.showModal);
      setShowSection(promotion.showSection);
      setModalFrequency(promotion.modalFrequency);
      setModalDelaySec(promotion.modalDelaySec);
      setPriority(promotion.priority);
      setIsPublished(isDuplicate ? false : promotion.isPublished);

      setStartDateStr(promotion.startsAt ? promotion.startsAt.slice(0, 10) : '');
      setEndDateStr(promotion.endsAt ? promotion.endsAt.slice(0, 10) : '');

      setBroadcastToUsers(isDuplicate ? false : promotion.broadcastToUsers);
      setBroadcastInApp(promotion.broadcastChannels.includes('in_app'));
      setBroadcastPush(promotion.broadcastChannels.includes('push'));
      setUrlTestStatus('idle');
      setActiveTab('form');
    } else if (isOpen && !promotion) {
      // Default initial states
      setTitle('');
      setSummary('');
      setBody('');
      setCustomTermsNote('');
      setServiceId(null);
      setImageType('static');
      setImageValue('/promo/pemeriksaan-dokter-umum.webp');
      setImageAlt('Layanan Dokter Umum');
      setCtaType('whatsapp');
      setCtaLabel('Konsultasi WhatsApp');
      setCtaUrl('');
      setShowBanner(true);
      setShowModal(false);
      setShowSection(true);
      setModalFrequency('once_per_day');
      setModalDelaySec(3);
      setPriority(0);
      setIsPublished(false);
      setStartDateStr('');
      setEndDateStr('');
      setBroadcastToUsers(false);
      setBroadcastInApp(true);
      setBroadcastPush(true);
      setUrlTestStatus('idle');
      setActiveTab('form');
    }
  }, [isOpen, promotion, isDuplicate]);

  // Auto-compose Terms & Conditions from Schedule Metadata
  const combinedTerms = React.useMemo(() => {
    const periodText =
      startDateStr || endDateStr
        ? `Berlaku periode ${formatWibPeriod(
            startDateStr ? `${startDateStr}T00:00:00+07:00` : null,
            endDateStr ? `${endDateStr}T23:59:59+07:00` : null
          )}.`
        : '';
    const note = customTermsNote.trim();
    if (periodText && note) {
      return `${periodText} ${note}`;
    }
    return periodText || note || '';
  }, [startDateStr, endDateStr, customTermsNote]);

  // When Service changes, suggest image alt and WhatsApp greeting
  const handleServiceChange = (id: string | null, selected?: ClinicService | null) => {
    setServiceId(id);
    if (selected) {
      if (!imageAlt) {
        setImageAlt(`Layanan ${selected.name}`);
      }
      if (ctaType === 'whatsapp') {
        const url = buildWhatsAppUrl(
          CLINIC_WHATSAPP_CONFIG.phoneNumber,
          `Halo Amanah Healthcare, saya tertarik dengan informasi layanan ${selected.name}. Mohon info jadwal dan konsultasi.`
        );
        setCtaUrl(url);
      }
    }
  };

  // Test Image URL
  const testImageUrl = React.useCallback((url: string) => {
    if (!url) {
      setUrlTestStatus('idle');
      return;
    }
    setUrlTestStatus('testing');
    const normalized = normalizeImageUrl(url);
    const img = new Image();
    img.addEventListener('load', () => setUrlTestStatus('valid'), { once: true });
    img.addEventListener('error', () => setUrlTestStatus('invalid'), { once: true });
    img.src = normalized;
  }, []);

  // Compute live preview CTA href
  const previewCtaHref = React.useMemo(() => {
    if (ctaType === 'none') return undefined;
    if (ctaType === 'whatsapp') {
      const selected = services.find((s) => s.id === serviceId);
      const serviceName = selected ? selected.name : title || 'Klinik Amanah';
      return (
        ctaUrl ||
        buildWhatsAppUrl(
          CLINIC_WHATSAPP_CONFIG.phoneNumber,
          `Halo Amanah Healthcare, saya tertarik dengan informasi ${serviceName}. Mohon informasi lebih lanjut.`
        )
      );
    }
    return ctaUrl || '#';
  }, [ctaType, ctaUrl, serviceId, services, title]);

  // Synthetic Public Promotion object for live preview
  const previewPromotion = React.useMemo<PublicPromotion>(() => {
    const selected = services.find((s) => s.id === serviceId);
    const placements: Array<'banner' | 'modal' | 'section'> = [];
    if (showBanner) placements.push('banner');
    if (showModal) placements.push('modal');
    if (showSection) placements.push('section');

    return {
      id: 'preview-id',
      version: String(Date.now()),
      title: title || 'Judul Promosi Layanan Klinik',
      summary: summary || 'Ringkasan singkat penawaran yang informatif dan jelas bagi pasien.',
      body: body || undefined,
      terms: combinedTerms || undefined,
      serviceId: serviceId || undefined,
      serviceName: selected ? selected.name : undefined,
      image: {
        src: imageValue || '/promo/pemeriksaan-dokter-umum.webp',
        alt: imageAlt || title || 'Promosi Klinik',
      },
      cta:
        ctaType !== 'none'
          ? {
              label: ctaLabel || 'Konsultasi WhatsApp',
              href: previewCtaHref || '#',
            }
          : undefined,
      placements,
      modal: {
        frequency: modalFrequency,
        delaySec: modalDelaySec,
      },
    };
  }, [
    title,
    summary,
    body,
    combinedTerms,
    serviceId,
    services,
    imageValue,
    imageAlt,
    ctaType,
    ctaLabel,
    previewCtaHref,
    showBanner,
    showModal,
    showSection,
    modalFrequency,
    modalDelaySec,
  ]);

  // Form Submit with Zod Schema Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startsAtIso = startDateStr ? new Date(`${startDateStr}T00:00:00+07:00`).toISOString() : null;
    const endsAtIso = endDateStr ? new Date(`${endDateStr}T23:59:59+07:00`).toISOString() : null;

    const validationResult = PromotionFormSchema.safeParse({
      serviceId: serviceId || null,
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim() ? body.trim() : null,
      terms: combinedTerms.trim() ? combinedTerms.trim() : null,
      imageType,
      imageValue: imageValue.trim(),
      imageAlt: imageAlt.trim() || title.trim(),
      ctaType,
      ctaLabel: ctaType !== 'none' ? ctaLabel.trim() : null,
      ctaUrl: ctaType !== 'none' ? previewCtaHref : null,
      showBanner,
      showModal,
      showSection,
      modalFrequency,
      modalDelaySec: Number(modalDelaySec) || 0,
      priority: Number(priority) || 0,
      isPublished,
      startsAt: startsAtIso,
      endsAt: endsAtIso,
      broadcastToUsers,
      broadcastInApp,
      broadcastPush,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(firstError?.message || 'Data promosi tidak valid');
      return;
    }

    if (ctaType !== 'none' && ctaUrl && !isSafeCtaUrl(ctaUrl)) {
      toast.error('Protokol URL tidak aman (hanya https:, tel:, atau relatif yang diizinkan)');
      return;
    }

    const broadcastChannels: string[] = [];
    if (broadcastInApp) broadcastChannels.push('in_app');
    if (broadcastPush) broadcastChannels.push('push');

    const payload: CreatePromotionPayload = {
      serviceId: serviceId || null,
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim() ? body.trim() : null,
      terms: combinedTerms.trim() ? combinedTerms.trim() : null,
      imageType,
      imageValue: imageValue.trim(),
      imageAlt: imageAlt.trim() || title.trim(),
      ctaLabel: ctaType !== 'none' ? ctaLabel.trim() : null,
      ctaUrl: ctaType !== 'none' ? previewCtaHref : null,
      showBanner,
      showModal,
      showSection,
      modalFrequency,
      modalDelaySec: Number(modalDelaySec) || 0,
      priority: Number(priority) || 0,
      isPublished,
      startsAt: startsAtIso,
      endsAt: endsAtIso,
      broadcastToUsers,
      broadcastChannels,
    };

    setIsSubmitting(true);
    try {
      if (isEdit && promotion) {
        await promotionsApi.updatePromotion(promotion.id, payload);
        toast.success('Promosi berhasil diperbarui');
      } else {
        await promotionsApi.createPromotion(payload);
        toast.success(isDuplicate ? 'Promosi berhasil diduplikasi' : 'Promosi berhasil ditambahkan');
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan promosi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-4xl'
      className='relative flex flex-col h-auto max-h-[88dvh] overflow-hidden rounded-2xl border border-border bg-card p-0 w-full my-auto shadow-2xl font-sans'
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6 bg-card shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <Tag className='size-4.5' />
          </div>
          <div>
            <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
              {isEdit ? 'Edit Promosi' : isDuplicate ? 'Duplikasi Promosi' : 'Tambah Promosi'}
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Kelola penawaran layanan dan informasi promosi klinik
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Form vs Live Preview */}
        <div className='flex items-center gap-2'>
          <div className='flex items-center rounded-lg border border-border bg-muted/40 p-1'>
            <button
              type='button'
              onClick={() => setActiveTab('form')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'form'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className='size-3.5' />
              <span>Formulir</span>
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('preview')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'preview'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className='size-3.5' />
              <span>Live Preview</span>
            </button>
          </div>

          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup dialog'
            className='flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
          >
            <X className='size-4' />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className='flex flex-1 min-h-0 overflow-hidden'>
        {activeTab === 'form' ? (
          <form
            id='promo-form'
            onSubmit={handleSubmit}
            className='flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-sm select-none'
          >
            {/* Section 1: Konten Utama */}
            <div className='rounded-xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-2xs'>
              <div className='flex items-center justify-between border-b border-border/50 pb-2.5'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <Info className='size-4 text-primary' />
                  Konten & Informasi Utama
                </h4>
                <span className='text-[11px] text-muted-foreground'>* Wajib diisi</span>
              </div>

              {/* Judul & Counter */}
              <div className='space-y-1.5'>
                <div className='flex justify-between items-center'>
                  <label htmlFor='promo-title' className='font-medium text-foreground text-xs'>
                    Judul Promosi *
                  </label>
                  <span
                    className={cn(
                      'text-[11px]',
                      title.length > 70 ? 'text-amber-500 font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {title.length}/80
                  </span>
                </div>
                <Input
                  id='promo-title'
                  type='text'
                  aria-label='Judul Promosi'
                  required
                  maxLength={80}
                  placeholder='Contoh: Paket Medical Check-Up Spesial Akhir Tahun'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='h-9 text-xs'
                />
              </div>

              {/* Ringkasan & Counter */}
              <div className='space-y-1.5'>
                <div className='flex justify-between items-center'>
                  <label htmlFor='promo-summary' className='font-medium text-foreground text-xs'>
                    Ringkasan Singkat *
                  </label>
                  <span
                    className={cn(
                      'text-[11px]',
                      summary.length > 140 ? 'text-amber-500 font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {summary.length}/160
                  </span>
                </div>
                <textarea
                  id='promo-summary'
                  aria-label='Ringkasan Singkat'
                  required
                  maxLength={160}
                  rows={2}
                  placeholder='Penjelasan 1-2 kalimat yang menarik minat pasien...'
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className='w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none'
                />
              </div>

              {/* Tautan Layanan Medis (No Snake Case!) */}
              <div className='space-y-1.5'>
                <span className='font-medium text-foreground text-xs flex items-center gap-1.5'>
                  <Sparkles className='size-3.5 text-primary' />
                  Tautan Layanan Medis
                </span>
                <PromotionServicePicker
                  services={services}
                  value={serviceId}
                  onChange={handleServiceChange}
                />
                <p className='text-[11px] text-muted-foreground'>
                  Jika ditautkan, badge nama layanan akan muncul otomatis pada banner & modal.
                </p>
              </div>

              {/* Detail Body (Opsional untuk Modal) */}
              <div className='space-y-1.5'>
                <label htmlFor='promo-body' className='font-medium text-foreground text-xs'>
                  Detail Tambahan (Ditampilkan pada Popup Modal)
                </label>
                <textarea
                  id='promo-body'
                  aria-label='Detail Tambahan Promosi'
                  rows={3}
                  maxLength={1000}
                  placeholder='Rincian prosedur, dokter pemeriksa, atau fasilitas paket...'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className='w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                />
              </div>
            </div>

            {/* Section 2: Jadwal Tayang & Syarat Ketentuan */}
            <div className='rounded-xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-2xs'>
              <div className='flex items-center justify-between border-b border-border/50 pb-2.5'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <Calendar className='size-4 text-primary' />
                  Jadwal Tayang & Syarat Ketentuan
                </h4>
                <span className='text-[11px] text-muted-foreground'>Metadata Otomatis</span>
              </div>

              {/* Schedule Pickers using CustomDatePicker */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <CustomDatePicker
                  id='promo-start-date'
                  label='Mulai Tayang'
                  ariaLabel='Mulai Tayang'
                  value={startDateStr}
                  onChange={(val) => setStartDateStr(val)}
                  placeholder='Pilih tanggal mulai'
                />

                <CustomDatePicker
                  id='promo-end-date'
                  label='Selesai Tayang'
                  ariaLabel='Selesai Tayang'
                  value={endDateStr}
                  onChange={(val) => setEndDateStr(val)}
                  placeholder='Pilih tanggal selesai'
                />
              </div>

              {/* Terms & Conditions Field */}
              <div className='space-y-1.5 pt-1'>
                <label htmlFor='promo-terms-note' className='font-medium text-foreground text-xs'>
                  Catatan Ketentuan Khusus (Opsional)
                </label>
                <Input
                  id='promo-terms-note'
                  type='text'
                  aria-label='Catatan Ketentuan Khusus'
                  maxLength={300}
                  placeholder='Contoh: Khusus pasien umum non-asuransi, maksimal 1 kupon per akun.'
                  value={customTermsNote}
                  onChange={(e) => setCustomTermsNote(e.target.value)}
                  className='h-9 text-xs'
                />

                {combinedTerms ? (
                  <div className='rounded-lg bg-muted/40 p-2.5 border border-border/60 text-[11px] text-muted-foreground'>
                    <span className='font-semibold text-foreground'>Hasil Syarat & Ketentuan: </span>
                    <span>{combinedTerms}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Section 3: Visual & Gambar */}
            <div className='rounded-xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-2xs'>
              <div className='flex items-center justify-between border-b border-border/50 pb-2.5'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <Tag className='size-4 text-primary' />
                  Gambar & Visual Promosi
                </h4>
                <span className='text-[11px] text-muted-foreground'>Rasio 16:9 disarankan</span>
              </div>

              {/* Source Toggle */}
              <div className='flex items-center gap-2.5'>
                <button
                  type='button'
                  onClick={() => setImageType('static')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                    imageType === 'static'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Layers className='size-3.5' />
                  <span>Katalog Gambar Klinik</span>
                </button>
                <button
                  type='button'
                  onClick={() => setImageType('url')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                    imageType === 'url'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  )}
                >
                  <LinkIcon className='size-3.5' />
                  <span>Tautan URL Gambar</span>
                </button>
              </div>

              {/* Static Picker using ServiceImagePicker */}
              {imageType === 'static' ? (
                <div className='flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20'>
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
                      Klik thumbnail untuk membuka popover katalog gambar klinik
                    </p>
                  </div>
                </div>
              ) : (
                /* URL Input & Test */
                <div className='space-y-2'>
                  <div className='flex gap-2'>
                    <Input
                      type='url'
                      aria-label='Tautan URL Gambar'
                      placeholder='https://images.example.com/promo-banner.webp'
                      value={imageValue}
                      onChange={(e) => {
                        setImageValue(e.target.value);
                        setUrlTestStatus('idle');
                      }}
                      className='h-9 text-xs flex-1'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => testImageUrl(imageValue)}
                      disabled={!imageValue || urlTestStatus === 'testing'}
                      className='text-xs h-9'
                    >
                      {urlTestStatus === 'testing' ? 'Memeriksa...' : 'Uji Muat'}
                    </Button>
                  </div>

                  {urlTestStatus === 'valid' ? (
                    <p className='text-xs text-primary font-medium flex items-center gap-1.5'>
                      <Check className='size-3.5' /> Gambar valid dan berhasil dimuat.
                    </p>
                  ) : urlTestStatus === 'invalid' ? (
                    <p className='text-xs text-destructive font-medium flex items-center gap-1.5'>
                      <X className='size-3.5' /> Gambar gagal dimuat. Periksa tautan publik.
                    </p>
                  ) : null}
                </div>
              )}

              {/* Alt Text */}
              <div className='space-y-1.5'>
                <label htmlFor='promo-alt' className='font-medium text-foreground text-xs'>
                  Teks Alternatif Gambar (Alt Text)
                </label>
                <Input
                  id='promo-alt'
                  type='text'
                  aria-label='Teks Alternatif Gambar'
                  placeholder='Deskripsi visual singkat untuk aksesibilitas'
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className='h-9 text-xs'
                />
              </div>
            </div>

            {/* Section 4: Tombol Aksi Pasien (CTA) */}
            <div className='rounded-xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-2xs'>
              <div className='flex items-center justify-between border-b border-border/50 pb-2.5'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <ExternalLink className='size-4 text-primary' />
                  Tombol Aksi Pasien (CTA)
                </h4>
              </div>

              {/* CTA Type Buttons */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <button
                  type='button'
                  onClick={() => setCtaType('whatsapp')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-3 text-left transition-colors cursor-pointer',
                    ctaType === 'whatsapp'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <MessageSquare className='size-4 text-primary shrink-0' />
                  <div>
                    <div className='text-xs font-semibold text-foreground'>WhatsApp Chat</div>
                    <div className='text-[11px] text-muted-foreground'>Otomatis ke nomor klinik</div>
                  </div>
                </button>

                <button
                  type='button'
                  onClick={() => setCtaType('custom')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-3 text-left transition-colors cursor-pointer',
                    ctaType === 'custom'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <LinkIcon className='size-4 text-primary shrink-0' />
                  <div>
                    <div className='text-xs font-semibold text-foreground'>Tautan Kustom</div>
                    <div className='text-[11px] text-muted-foreground'>Halaman booking atau URL web</div>
                  </div>
                </button>

                <button
                  type='button'
                  onClick={() => setCtaType('none')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-3 text-left transition-colors cursor-pointer',
                    ctaType === 'none'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <X className='size-4 text-muted-foreground shrink-0' />
                  <div>
                    <div className='text-xs font-semibold text-foreground'>Tanpa Tombol</div>
                    <div className='text-[11px] text-muted-foreground'>Hanya pengumuman visual</div>
                  </div>
                </button>
              </div>

              {/* CTA Inputs */}
              {ctaType !== 'none' ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                  <div className='space-y-1.5'>
                    <label htmlFor='promo-cta-label' className='font-medium text-foreground text-xs'>
                      Label Tombol
                    </label>
                    <Input
                      id='promo-cta-label'
                      type='text'
                      aria-label='Label Tombol'
                      maxLength={30}
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      placeholder='Contoh: Konsultasi Sekarang'
                      className='h-9 text-xs'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label htmlFor='promo-cta-url' className='font-medium text-foreground text-xs'>
                      {ctaType === 'whatsapp' ? 'Pesan Awal WhatsApp' : 'URL Tujuan'}
                    </label>
                    <Input
                      id='promo-cta-url'
                      type='text'
                      aria-label={ctaType === 'whatsapp' ? 'Pesan Awal WhatsApp' : 'URL Tujuan'}
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder={
                        ctaType === 'whatsapp'
                          ? 'Halo Amanah Healthcare, saya tertarik...'
                          : '/booking atau https://amanahhealthcare.com'
                      }
                      className='h-9 text-xs'
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Section 5: Penempatan & Prioritas Tampil */}
            <div className='rounded-xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-2xs'>
              <div className='flex items-center justify-between border-b border-border/50 pb-2.5'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <Layers className='size-4 text-primary' />
                  Penempatan & Prioritas Tampil
                </h4>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <label className='flex items-center gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40'>
                  <input
                    type='checkbox'
                    aria-label='Tampilkan di Top Banner'
                    checked={showBanner}
                    onChange={(e) => setShowBanner(e.target.checked)}
                    className='size-4 rounded accent-primary'
                  />
                  <div>
                    <div className='text-xs font-semibold text-foreground'>Top Banner</div>
                    <div className='text-[11px] text-muted-foreground'>Strip atas di seluruh halaman</div>
                  </div>
                </label>

                <label className='flex items-center gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40'>
                  <input
                    type='checkbox'
                    aria-label='Tampilkan di Popup Modal'
                    checked={showModal}
                    onChange={(e) => setShowModal(e.target.checked)}
                    className='size-4 rounded accent-primary'
                  />
                  <div>
                    <div className='text-xs font-semibold text-foreground'>Popup Dialog Modal</div>
                    <div className='text-[11px] text-muted-foreground'>Muncul saat pertama berkunjung</div>
                  </div>
                </label>

                <label className='flex items-center gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40'>
                  <input
                    type='checkbox'
                    aria-label='Tampilkan di Home Section'
                    checked={showSection}
                    onChange={(e) => setShowSection(e.target.checked)}
                    className='size-4 rounded accent-primary'
                  />
                  <div>
                    <div className='text-xs font-semibold text-foreground'>Home Section</div>
                    <div className='text-[11px] text-muted-foreground'>Kartu promo pada beranda</div>
                  </div>
                </label>
              </div>

              {/* Priority Input matching StepClinicSettings pattern */}
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40'>
                <div>
                  <label htmlFor='promo-priority' className='font-semibold text-xs text-foreground'>
                    Prioritas Tampil
                  </label>
                  <p className='text-[11px] text-muted-foreground'>
                    Angka lebih tinggi ditampilkan lebih awal pada banner dan modal.
                  </p>
                </div>

                <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                  <input
                    id='promo-priority'
                    type='number'
                    aria-label='Prioritas Tampil'
                    min={0}
                    value={priority}
                    onChange={(e) => setPriority(Math.max(0, Number(e.target.value)))}
                    className='w-16 sm:w-20 px-2.5 py-1 text-xs text-foreground bg-transparent focus:outline-none text-right font-medium'
                  />
                  <span className='px-2 text-[11px] font-semibold text-muted-foreground bg-muted/50 h-full flex items-center border-l border-border/60 shrink-0 select-none'>
                    Urutan
                  </span>
                </div>
              </div>
            </div>

            {/* Section 6: Broadcast & Status Publikasi */}
            <div className='rounded-xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-2xs'>
              <div className='flex items-center justify-between border-b border-border/50 pb-2.5'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <Radio className='size-4 text-primary' />
                  Broadcast & Status Publikasi
                </h4>
              </div>

              {/* Broadcast Switch */}
              <div className='flex items-start justify-between gap-4'>
                <div className='space-y-0.5'>
                  <div className='text-xs font-semibold text-foreground'>
                    Kirim Notifikasi Otomatis ke Pasien Terdaftar
                  </div>
                  <p className='text-[11px] text-muted-foreground leading-relaxed'>
                    Mengirimkan notifikasi ke akun pasien melalui antrean RabbitMQ saat status promosi Live.
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
                  <label className='flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer'>
                    <input
                      type='checkbox'
                      aria-label='In-App Notification'
                      checked={broadcastInApp}
                      onChange={(e) => setBroadcastInApp(e.target.checked)}
                      className='size-3.5 rounded accent-primary'
                    />
                    <span>In-App Notification</span>
                  </label>

                  <label className='flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer'>
                    <input
                      type='checkbox'
                      aria-label='Push Notification'
                      checked={broadcastPush}
                      onChange={(e) => setBroadcastPush(e.target.checked)}
                      className='size-3.5 rounded accent-primary'
                    />
                    <span>Push Notification</span>
                  </label>
                </div>
              ) : null}

              {/* Publish Switch */}
              <div className='flex items-start justify-between gap-4 pt-3 border-t border-border/40'>
                <div className='space-y-0.5'>
                  <div className='text-xs font-semibold text-foreground'>
                    Publikasikan Sekarang
                  </div>
                  <p className='text-[11px] text-muted-foreground'>
                    Jika dinonaktifkan, promosi akan disimpan sebagai Draf.
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  aria-label='Publikasikan Sekarang'
                />
              </div>
            </div>
          </form>
        ) : (
          /* Live Preview Pane */
          <div className='flex-1 flex flex-col overflow-hidden bg-muted/20'>
            {/* Viewport Toolbar */}
            <div className='flex items-center justify-between border-b border-border bg-card px-5 py-2.5 sm:px-6'>
              <span className='text-xs font-semibold text-muted-foreground'>
                Pratinjau Interaktif Publik
              </span>

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() => setPreviewViewport('desktop')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
                    previewViewport === 'desktop'
                      ? 'bg-muted text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Desktop
                </button>
                <button
                  type='button'
                  onClick={() => setPreviewViewport('mobile')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
                    previewViewport === 'mobile'
                      ? 'bg-muted text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Smartphone className='size-3.5' />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className='flex-1 overflow-y-auto p-5 sm:p-6 flex justify-center'>
              <div
                className={cn(
                  'w-full transition-all duration-300 space-y-6',
                  previewViewport === 'mobile'
                    ? 'max-w-sm rounded-3xl border-4 border-foreground/20 p-4 shadow-xl bg-background'
                    : 'max-w-3xl'
                )}
              >
                <PromotionsProvider initialData={[previewPromotion]}>
                  {/* 1. Banner Preview */}
                  {showBanner ? (
                    <div className='space-y-1.5'>
                      <span className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                        Pratinjau: Top Banner
                      </span>
                      <div className='overflow-hidden rounded-lg border border-border shadow-xs'>
                        <PromoBanner />
                      </div>
                    </div>
                  ) : null}

                  {/* 2. Card Preview */}
                  {showSection ? (
                    <div className='space-y-1.5'>
                      <span className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                        Pratinjau: Card Beranda
                      </span>
                      <div className='max-w-md'>
                        <PromoCard promo={previewPromotion} />
                      </div>
                    </div>
                  ) : null}

                  {/* 3. Modal Mock Preview */}
                  {showModal ? (
                    <div className='space-y-1.5'>
                      <span className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                        Pratinjau: Tampilan Popup Modal
                      </span>
                      <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-lg max-w-md'>
                        <PromoImage
                          src={previewPromotion.image.src}
                          alt={previewPromotion.image.alt}
                          fallbackTitle={previewPromotion.title}
                          fallbackSummary={previewPromotion.summary}
                          aspectRatio='video'
                        />
                        <div className='p-5 space-y-2'>
                          <h4 className='font-bold text-foreground text-base'>
                            {previewPromotion.title}
                          </h4>
                          <p className='text-xs text-muted-foreground leading-relaxed'>
                            {previewPromotion.summary}
                          </p>
                          {previewPromotion.body ? (
                            <p className='text-xs text-foreground/80 whitespace-pre-line border-t border-border pt-2'>
                              {previewPromotion.body}
                            </p>
                          ) : null}
                          {previewPromotion.terms ? (
                            <p className='text-[11px] text-muted-foreground italic border-t border-border/50 pt-1.5'>
                              * {previewPromotion.terms}
                            </p>
                          ) : null}
                          {previewPromotion.cta ? (
                            <div className='pt-2 flex justify-end'>
                              <span className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground'>
                                {previewPromotion.cta.label}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </PromotionsProvider>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className='flex items-center justify-between border-t border-border/70 px-5 py-3.5 sm:px-6 bg-card shrink-0'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='text-xs'
        >
          Batal
        </Button>

        <div className='flex items-center gap-2.5'>
          {activeTab === 'preview' ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setActiveTab('form')}
              className='text-xs'
            >
              Kembali ke Formulir
            </Button>
          ) : (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setActiveTab('preview')}
              className='text-xs'
            >
              <Eye className='size-3.5' />
              <span>Lihat Pratinjau</span>
            </Button>
          )}

          <Button
            type='submit'
            form='promo-form'
            variant='primary'
            size='sm'
            disabled={isSubmitting}
            className='text-xs min-w-[130px]'
          >
            <Send className='size-3.5' />
            <span>
              {isSubmitting
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Simpan Promosi'}
            </span>
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
