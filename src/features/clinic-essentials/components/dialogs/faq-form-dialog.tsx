'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { ArrowUpDown } from 'lucide-react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  ClinicService,
  CreateSupportFaqPayload,
  ServiceCategory,
  SupportFaqItem,
  UpdateSupportFaqPayload,
} from '../../types/clinic-essentials.types';
import { FaqFormFieldsBento } from './faq/faq-form-fields-bento';
import { FaqMetaConfigBento } from './faq/faq-meta-config-bento';
import { FaqOrderPreviewPanel } from './faq/faq-order-preview-panel';

export interface FaqFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: SupportFaqItem | null;
  services: ClinicService[];
  categories: ServiceCategory[];
  allFaqs?: SupportFaqItem[];
  onSubmit: (
    payload: CreateSupportFaqPayload | UpdateSupportFaqPayload,
    id?: string
  ) => Promise<void>;
}

export function FaqFormDialog({
  open,
  onOpenChange,
  editItem,
  services,
  categories,
  allFaqs = [],
  onSubmit,
}: FaqFormDialogProps) {
  const isEditing = Boolean(editItem);

  // Form states
  const [title, setTitle] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [selectedPaths, setSelectedPaths] = React.useState<string[]>(['/']);
  const [serviceId, setServiceId] = React.useState<string>('none');
  const [categoryId, setCategoryId] = React.useState<string>('none');
  const [displayOrder, setDisplayOrder] = React.useState(0);
  const [isPublished, setIsPublished] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isOrderExpanded, setIsOrderExpanded] = React.useState(false);

  // Synchronize state when opened or editItem changes
  React.useEffect(() => {
    if (open) {
      if (editItem) {
        setTitle(editItem.title || '');
        setAnswer(
          Array.isArray(editItem.solutionSteps)
            ? editItem.solutionSteps.join('\n\n')
            : String(editItem.solutionSteps || '')
        );
        setSelectedPaths(
          editItem.paths && editItem.paths.length > 0 ? editItem.paths : ['/']
        );
        setServiceId(editItem.serviceId || 'none');
        setCategoryId(editItem.categoryId || 'none');
        setDisplayOrder(editItem.displayOrder ?? 0);
        setIsPublished(editItem.isPublished !== false);
      } else {
        setTitle('');
        setAnswer('');
        setSelectedPaths(['/']);
        setServiceId('none');
        setCategoryId('none');
        setDisplayOrder(0);
        setIsPublished(true);
      }
      setIsOrderExpanded(false);
    }
  }, [open, editItem]);

  const togglePath = (path: string) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Pertanyaan FAQ wajib diisi');
      return;
    }
    if (!answer.trim()) {
      toast.error('Jawaban FAQ wajib diisi');
      return;
    }
    if (selectedPaths.length === 0) {
      toast.error('Pilih minimal satu penempatan rute landing page');
      return;
    }

    try {
      setIsSubmitting(true);

      const steps = answer
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      // Derive category automatically from first selected route to eliminate redundancy
      const primaryCategory = selectedPaths[0]?.replace('/', '').trim() || 'general';

      const payload: CreateSupportFaqPayload = {
        title: title.trim(),
        solutionSteps: steps.length > 0 ? steps : [answer.trim()],
        category: primaryCategory,
        paths: selectedPaths,
        serviceId: serviceId !== 'none' ? serviceId : null,
        categoryId: categoryId !== 'none' ? categoryId : null,
        displayOrder: isEditing ? (Number(displayOrder) || 0) : undefined,
        isPublished,
      };

      await onSubmit(payload, editItem?.id);
      toast.success(isEditing ? 'FAQ berhasil diperbarui' : 'FAQ berhasil ditambahkan');
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <ModalWrapper
      isOpen={open}
      onClose={handleClose}
      maxWidth={isOrderExpanded ? 'max-w-[95vw] w-[95vw]' : 'max-w-4xl w-[95vw]'}
      showCloseButton={false}
      className={cn(
        'max-h-[90vh] h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl font-sans transition-[max-width,width] duration-300 ease-out'
      )}
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {isEditing ? 'Edit Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ'}
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              Kelola pertanyaan pasien, jawaban, rute landing page, serta relasi layanan klinik.
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <Button
              type='button'
              variant={isOrderExpanded ? 'secondary' : 'outline'}
              size='sm'
              shape='pill'
              onClick={() => setIsOrderExpanded(!isOrderExpanded)}
              className='text-xs font-semibold gap-1.5 cursor-pointer'
            >
              <ArrowUpDown className='size-3.5 text-primary' />
              <span>{isOrderExpanded ? 'Tutup Atur Urutan' : 'Atur Urutan & Pratinjau'}</span>
            </Button>

            <button
              type='button'
              onClick={handleClose}
              aria-label='Tutup modal'
              className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            >
              <Icons.close className='size-4' />
            </button>
          </div>
        </div>

        {/* Bento Grid Body (Expandable Side-by-Side Sesuai Paradigma Appointment Pasien) */}
        <div className='flex items-stretch flex-1 min-h-0 w-full py-4 gap-5'>
          {/* Kolom Kiri: Form Bento (Konten & Konfigurasi) */}
          <div
            className={cn(
              'flex flex-col h-full min-h-0 transition-all duration-300 ease-out',
              isOrderExpanded
                ? 'lg:w-[480px] xl:w-[520px] lg:shrink-0 lg:pr-5 lg:border-r border-border/40'
                : 'w-full'
            )}
          >
            <form id='faq-detail-form' onSubmit={handleSubmit} className='h-full flex flex-col min-h-0'>
              <div
                className={cn(
                  'grid gap-5 h-full min-h-0',
                  isOrderExpanded
                    ? 'grid-cols-1 overflow-y-auto pr-0.5 scrollbar-thin'
                    : 'grid-cols-1 lg:grid-cols-12'
                )}
              >
                {/* Box 1: Konten Pertanyaan & Jawaban */}
                <div
                  className={cn(
                    isOrderExpanded ? 'w-full' : 'col-span-12 lg:col-span-6',
                    'h-full min-h-0'
                  )}
                >
                  <FaqFormFieldsBento
                    title={title}
                    setTitle={setTitle}
                    answer={answer}
                    setAnswer={setAnswer}
                  />
                </div>

                {/* Box 2: Rute & Konfigurasi */}
                <div
                  className={cn(
                    isOrderExpanded ? 'w-full' : 'col-span-12 lg:col-span-6',
                    'h-full min-h-0'
                  )}
                >
                  <FaqMetaConfigBento
                    selectedPaths={selectedPaths}
                    togglePath={togglePath}
                    serviceId={serviceId}
                    setServiceId={setServiceId}
                    categoryId={categoryId}
                    setCategoryId={setCategoryId}
                    displayOrder={displayOrder}
                    setDisplayOrder={setDisplayOrder}
                    isPublished={isPublished}
                    setIsPublished={setIsPublished}
                    isOrderExpanded={isOrderExpanded}
                    onToggleExpandOrder={() => setIsOrderExpanded(!isOrderExpanded)}
                    services={services}
                    categories={categories}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Kolom Kanan: Expandable Reorder & Real Landing Page Accordion Preview Panel */}
          {isOrderExpanded && (
            <div className='hidden lg:flex flex-1 flex-col font-sans select-none h-full min-h-0 min-w-0 animate-in fade-in-0 slide-in-from-right-6 duration-300 ease-out'>
              <FaqOrderPreviewPanel
                allFaqs={allFaqs}
                activePaths={selectedPaths}
                currentFaq={{
                  id: editItem?.id,
                  title,
                  answer,
                  displayOrder,
                  isPublished,
                }}
                onDisplayOrderChange={setDisplayOrder}
                onClose={() => setIsOrderExpanded(false)}
              />
            </div>
          )}
        </div>

        {/* Pinned Footer (Format Form Reguler - Pill Buttons) */}
        <div className='shrink-0 pt-3.5 border-t border-border/40 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            shape='pill'
            onClick={handleClose}
            disabled={isSubmitting}
            className='px-5 text-xs font-semibold cursor-pointer'
          >
            Batal
          </Button>
          <Button
            type='submit'
            form='faq-detail-form'
            size='sm'
            shape='pill'
            disabled={isSubmitting}
            className='px-6 text-xs font-semibold cursor-pointer'
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className='size-3.5 mr-1.5 animate-spin' />
                Menyimpan...
              </>
            ) : (
              <>
                <Icons.check className='size-3.5 mr-1.5' />
                {isEditing ? 'Simpan Perubahan' : 'Simpan FAQ'}
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
