'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { CLINIC_WHATSAPP_CONFIG } from '@/config/whatsapp.config';
import type { ClinicService } from '@/features/clinic-essentials/types/clinic-essentials.types';
import { promotionsApi } from '../api/promotions.api';
import { buildPromoWhatsAppUrl, isSafeHref } from '../lib/cta';
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
import { PromotionFormFieldsBento } from './components/PromotionFormFieldsBento';
import { PromotionVisualBento } from './components/PromotionVisualBento';
import { PromotionPreviewBento } from './components/PromotionPreviewBento';

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
      setUrlTestStatus(promotion.imageType === 'url' ? 'valid' : 'idle');
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
        const url = buildPromoWhatsAppUrl(
          CLINIC_WHATSAPP_CONFIG.phoneNumber,
          `Halo Amanah Healthcare, saya tertarik dengan informasi layanan ${selected.name}. Mohon info jadwal dan konsultasi.`
        );
        setCtaUrl(url);
      }
    }
  };

  // Test Image URL
  const testImageUrl = React.useCallback((url: string) => {
    if (!url.trim()) {
      setUrlTestStatus('idle');
      return;
    }
    setUrlTestStatus('testing');
    const normalized = normalizeImageUrl(url.trim());
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
        buildPromoWhatsAppUrl(
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

    if (ctaType !== 'none' && ctaUrl && !isSafeHref(ctaUrl)) {
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

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[95vw] w-[95vw]'
      showCloseButton={false}
      className='max-h-[90vh] h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl font-sans'
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header (Format Form Reguler - Tanpa Header Icon) */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {isEdit ? 'Edit Promosi' : isDuplicate ? 'Duplikasi Promosi' : 'Tambah Promosi'}
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              Kelola penawaran layanan dan informasi promosi klinik.
            </p>
          </div>

          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup modal'
            className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Scrollable / Bento Body (2 Columns Layout) */}
        <div className='flex-1 min-h-0 py-4'>
          <form id='promo-detail-form' onSubmit={handleSubmit} className='h-full'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0'>
              {/* Kolom Kiri: Box 1 (Konten & Form Promosi) */}
              <div className='col-span-12 lg:col-span-7 h-full min-h-0'>
                <PromotionFormFieldsBento
                  title={title}
                  setTitle={setTitle}
                  summary={summary}
                  setSummary={setSummary}
                  body={body}
                  setBody={setBody}
                  serviceId={serviceId}
                  onServiceChange={handleServiceChange}
                  services={services}
                  startDateStr={startDateStr}
                  setStartDateStr={setStartDateStr}
                  endDateStr={endDateStr}
                  setEndDateStr={setEndDateStr}
                  customTermsNote={customTermsNote}
                  setCustomTermsNote={setCustomTermsNote}
                  combinedTerms={combinedTerms}
                  ctaType={ctaType}
                  setCtaType={setCtaType}
                  ctaLabel={ctaLabel}
                  setCtaLabel={setCtaLabel}
                  ctaUrl={ctaUrl}
                  setCtaUrl={setCtaUrl}
                  showBanner={showBanner}
                  setShowBanner={setShowBanner}
                  showModal={showModal}
                  setShowModal={setShowModal}
                  showSection={showSection}
                  setShowSection={setShowSection}
                  priority={priority}
                  setPriority={setPriority}
                  broadcastToUsers={broadcastToUsers}
                  setBroadcastToUsers={setBroadcastToUsers}
                  broadcastInApp={broadcastInApp}
                  setBroadcastInApp={setBroadcastInApp}
                  broadcastPush={broadcastPush}
                  setBroadcastPush={setBroadcastPush}
                  isPublished={isPublished}
                  setIsPublished={setIsPublished}
                />
              </div>

              {/* Kolom Kanan: Box 2 (Visual) + Box 3 (Studio Pratinjau di bawahnya) */}
              <div className='col-span-12 lg:col-span-5 flex flex-col gap-4 h-full min-h-0 overflow-y-auto pr-0.5 scrollbar-thin'>
                <PromotionVisualBento
                  imageType={imageType}
                  setImageType={setImageType}
                  imageValue={imageValue}
                  setImageValue={(val) => {
                    setImageValue(val);
                    setUrlTestStatus('idle');
                  }}
                  imageAlt={imageAlt}
                  setImageAlt={setImageAlt}
                  urlTestStatus={urlTestStatus}
                  onTestUrl={() => testImageUrl(imageValue)}
                />

                <PromotionPreviewBento
                  imageType={imageType}
                  imageValue={imageValue}
                  imageAlt={imageAlt}
                  urlTestStatus={urlTestStatus}
                  previewPromotion={previewPromotion}
                  onRetryTest={() => testImageUrl(imageValue)}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Pinned Footer (Format Form Reguler - Pill Buttons) */}
        <div className='shrink-0 pt-3.5 border-t border-border/40 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            shape='pill'
            onClick={onClose}
            disabled={isSubmitting}
            className='px-5 text-xs font-semibold'
          >
            Batal
          </Button>
          <Button
            type='submit'
            form='promo-detail-form'
            size='sm'
            shape='pill'
            disabled={isSubmitting}
            className='px-6 text-xs font-semibold'
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className='size-3.5 mr-1.5 animate-spin' />
                Menyimpan...
              </>
            ) : (
              <>
                <Icons.check className='size-3.5 mr-1.5' />
                {isEdit ? 'Simpan Perubahan' : 'Simpan Promosi'}
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
