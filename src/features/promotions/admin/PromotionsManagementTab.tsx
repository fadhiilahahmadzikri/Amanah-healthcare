'use client';

import * as React from 'react';
import { Plus, RefreshCw, Search, Tag } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ClinicService } from '@/features/clinic-essentials/types/clinic-essentials.types';
import { promotionsApi } from '../api/promotions.api';
import type { AdminPromotion, PromoStatus } from '../types/promotions.types';
import { AdminPromotionCard } from '../components/AdminPromotionCard';
import { PromotionFormDialog } from './PromotionFormDialog';

export interface PromotionsManagementTabProps {
  services?: ClinicService[];
  canManage?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleActive?: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onDelete?: (promo: AdminPromotion) => void;
  cardGridClassName?: string;
}

const STATUS_FILTERS: Array<{ key: PromoStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Semua Status' },
  { key: 'live', label: 'Live' },
  { key: 'scheduled', label: 'Terjadwal' },
  { key: 'draft', label: 'Draf' },
  { key: 'expired', label: 'Kedaluwarsa' },
  { key: 'archived', label: 'Diarsipkan' },
];

export function PromotionsManagementTab({
  services = [],
  canManage = true,
  selectedIds = [],
  onToggleSelect,
  onToggleActive,
  isTogglingActiveId,
  onDelete,
  cardGridClassName,
}: PromotionsManagementTabProps) {
  const [promotions, setPromotions] = React.useState<AdminPromotion[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<PromoStatus | 'all'>('all');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedPromo, setSelectedPromo] = React.useState<AdminPromotion | null>(null);
  const [isDuplicateMode, setIsDuplicateMode] = React.useState(false);

  // Delete Alert State (fallback if parent onDelete is not provided)
  const [deletingPromo, setDeletingPromo] = React.useState<AdminPromotion | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchPromotions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await promotionsApi.getAdminPromotions({
        status: selectedStatus,
        search: searchQuery.trim() || undefined,
      });
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat daftar promosi');
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  React.useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Safe Status Filter Counts
  const counts = React.useMemo(() => {
    const list = Array.isArray(promotions) ? promotions : [];
    const total = list.length;
    const live = list.filter((p) => p.status === 'live').length;
    const scheduled = list.filter((p) => p.status === 'scheduled').length;
    const draft = list.filter((p) => p.status === 'draft').length;
    const expired = list.filter((p) => p.status === 'expired').length;
    const archived = list.filter((p) => p.status === 'archived').length;
    return { all: total, live, scheduled, draft, expired, archived };
  }, [promotions]);

  // Quick Toggle Publish
  const handleTogglePublish = async (promo: AdminPromotion) => {
    const newPublished = !promo.isPublished;
    try {
      await promotionsApi.updatePromotion(promo.id, { isPublished: newPublished });
      toast.success(newPublished ? 'Promosi dipublikasikan' : 'Promosi dijadikan draf');
      fetchPromotions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui status publikasi');
    }
  };

  const handleOpenCreate = () => {
    setSelectedPromo(null);
    setIsDuplicateMode(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promo: AdminPromotion) => {
    setSelectedPromo(promo);
    setIsDuplicateMode(false);
    setIsFormOpen(true);
  };

  const handleOpenDuplicate = (promo: AdminPromotion) => {
    setSelectedPromo(promo);
    setIsDuplicateMode(true);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPromo) return;
    setIsDeleting(true);
    try {
      await promotionsApi.deletePromotion(deletingPromo.id);
      toast.success('Promosi berhasil diarsipkan');
      setDeletingPromo(null);
      fetchPromotions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus promosi');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPromotions = React.useMemo(() => {
    const list = Array.isArray(promotions) ? promotions : [];
    return list.filter((promo) => {
      if (selectedStatus !== 'all' && promo.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          promo.title.toLowerCase().includes(q) ||
          promo.summary.toLowerCase().includes(q) ||
          Boolean(promo.serviceName && promo.serviceName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [promotions, selectedStatus, searchQuery]);

  return (
    <div className='flex flex-col gap-4 font-sans'>
      {/* Top Controls: Search, Status Filter & Actions */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Cari judul promosi atau layanan...'
            aria-label='Cari judul promosi atau layanan'
            className='h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
          />
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          <button
            type='button'
            onClick={() => fetchPromotions()}
            disabled={isLoading}
            className='inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer'
          >
            <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
            Segarkan
          </button>

          {canManage ? (
            <button
              type='button'
              onClick={handleOpenCreate}
              className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-98 transition-all cursor-pointer'
            >
              <Plus className='size-3.5' />
              Tambah Promosi
            </button>
          ) : null}
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className='flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none'>
        {STATUS_FILTERS.map((filter) => {
          const isSelected = selectedStatus === filter.key;
          const count = counts[filter.key];
          return (
            <button
              key={filter.key}
              type='button'
              onClick={() => setSelectedStatus(filter.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors shrink-0 cursor-pointer',
                isSelected
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{filter.label}</span>
              {count !== undefined && count > 0 ? (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                    isSelected ? 'bg-white/20 text-white' : 'bg-background text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className='flex flex-col items-center justify-center p-12 text-center text-muted-foreground'>
          <RefreshCw className='size-6 animate-spin mb-2 text-primary' />
          <p className='text-xs'>Memuat data promosi...</p>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center'>
          <div className='flex size-12 items-center justify-center rounded-full bg-muted mb-3 text-muted-foreground'>
            <Tag className='size-6' />
          </div>
          <h4 className='text-sm font-semibold text-foreground'>
            Tidak Ada Promosi Ditemukan
          </h4>
          <p className='text-xs text-muted-foreground max-w-sm mt-1'>
            {searchQuery
              ? 'Tidak ada promosi yang cocok dengan kata kunci pencarian.'
              : 'Belum ada promosi atau pengumuman yang didaftarkan pada sistem.'}
          </p>
          {canManage && !searchQuery ? (
            <button
              type='button'
              onClick={handleOpenCreate}
              className='mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer'
            >
              <Plus className='size-3.5' />
              Tambah Promosi Pertama
            </button>
          ) : null}
        </div>
      ) : (
        /* Promotions Grid */
        <div
          className={
            cardGridClassName || 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4'
          }
        >
          {filteredPromotions.map((promo) => (
            <AdminPromotionCard
              key={promo.id}
              promo={promo}
              canManage={canManage}
              selected={selectedIds.includes(promo.id)}
              isBulkingActive={selectedIds.length > 0}
              onToggleSelect={() => onToggleSelect?.(promo.id)}
              onToggleActive={(newActive) => {
                if (onToggleActive) {
                  onToggleActive(promo.id, newActive);
                } else {
                  handleTogglePublish(promo);
                }
              }}
              isTogglingActive={isTogglingActiveId === promo.id}
              onEdit={handleOpenEdit}
              onDuplicate={handleOpenDuplicate}
              onDelete={(p) => {
                if (onDelete) {
                  onDelete(p);
                } else {
                  setDeletingPromo(p);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Form Dialog: Create / Edit / Duplicate */}
      <PromotionFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        promotion={selectedPromo}
        isDuplicate={isDuplicateMode}
        services={services}
        onSuccess={fetchPromotions}
      />

      {/* Local Delete Confirmation Dialog Fallback */}
      <AlertDialog.Root
        open={Boolean(deletingPromo)}
        onOpenChange={(open) => !open && setDeletingPromo(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs' />
          <AlertDialog.Content className='fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-2xl'>
            <AlertDialog.Title className='text-base font-bold text-foreground'>
              Hapus Promosi Ini?
            </AlertDialog.Title>
            <AlertDialog.Description className='mt-2 text-xs text-muted-foreground leading-relaxed'>
              Apakah Anda yakin ingin menghapus promosi{' '}
              <strong className='text-foreground'>{deletingPromo?.title}</strong>? Promosi
              akan diarsipkan dan tidak akan ditampilkan lagi kepada pasien.
            </AlertDialog.Description>

            <div className='mt-5 flex items-center justify-end gap-2.5'>
              <AlertDialog.Cancel asChild>
                <button
                  type='button'
                  disabled={isDeleting}
                  className='rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted'
                >
                  Batal
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type='button'
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className='rounded-lg bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90'
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
