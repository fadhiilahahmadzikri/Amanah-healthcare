'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import type { ClinicService } from '@/features/clinic-essentials/types/clinic-essentials.types';
import { clinicEssentialsKeys } from '@/features/clinic-essentials/api/query-keys';
import { promotionsApi } from '../api/promotions.api';
import type { AdminPromotion, PromoStatus } from '../types/promotions.types';
import { AdminPromotionCard } from '../components/AdminPromotionCard';
import { PromotionFormDialog } from './PromotionFormDialog';

export interface PromotionsManagementTabProps {
  promotions?: AdminPromotion[];
  totalCount?: number;
  isLoading?: boolean;
  services?: ClinicService[];
  canManage?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleActive?: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onDelete?: (promo: AdminPromotion) => void;
  cardGridClassName?: string;
  searchQuery?: string;
  statusFilter?: string;
  isCreateOpen?: boolean;
  onResetCreateOpen?: () => void;
  onOpenCreate?: () => void;
  onResetFilter?: () => void;
}

export function PromotionsManagementTab({
  promotions: externalPromotions,
  totalCount,
  isLoading: externalIsLoading,
  services = [],
  canManage = true,
  selectedIds = [],
  onToggleSelect,
  onToggleActive,
  isTogglingActiveId,
  onDelete,
  cardGridClassName,
  searchQuery = '',
  statusFilter = 'all',
  isCreateOpen = false,
  onResetCreateOpen,
  onOpenCreate,
  onResetFilter,
}: PromotionsManagementTabProps) {
  const queryClient = useQueryClient();

  // Internal state fallback for standalone usage
  const [internalPromotions, setInternalPromotions] = React.useState<AdminPromotion[]>([]);
  const [internalIsLoading, setInternalIsLoading] = React.useState(false);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedPromo, setSelectedPromo] = React.useState<AdminPromotion | null>(null);
  const [isDuplicateMode, setIsDuplicateMode] = React.useState(false);

  // Delete Alert State (fallback if parent onDelete is not provided)
  const [deletingPromo, setDeletingPromo] = React.useState<AdminPromotion | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Respond to parent create trigger from dynamic toolbar
  React.useEffect(() => {
    if (isCreateOpen) {
      setSelectedPromo(null);
      setIsDuplicateMode(false);
      setIsFormOpen(true);
      onResetCreateOpen?.();
    }
  }, [isCreateOpen, onResetCreateOpen]);

  // Standalone fallback fetch when parent does not supply promotions
  const isControlled = externalPromotions !== undefined;
  const promotions = isControlled ? externalPromotions : internalPromotions;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;

  React.useEffect(() => {
    if (isControlled) return;

    let isMounted = true;
    setInternalIsLoading(true);
    promotionsApi
      .getAdminPromotions({
        status: statusFilter !== 'all' ? (statusFilter as PromoStatus) : undefined,
        search: searchQuery.trim() || undefined,
      })
      .then((data) => {
        if (isMounted) {
          setInternalPromotions(Array.isArray(data) ? data : []);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          toast.error(err instanceof Error ? err.message : 'Gagal memuat daftar promosi');
          setInternalPromotions([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setInternalIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isControlled, statusFilter, searchQuery]);

  // Quick Toggle Publish fallback
  const handleTogglePublish = async (promo: AdminPromotion) => {
    const newPublished = !promo.isPublished;
    try {
      await promotionsApi.updatePromotion(promo.id, { isPublished: newPublished });
      toast.success(newPublished ? 'Promosi dipublikasikan' : 'Promosi dijadikan draf');
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.promotions() });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui status publikasi');
    }
  };

  const handleOpenCreate = () => {
    if (onOpenCreate) {
      onOpenCreate();
      return;
    }
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
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.promotions() });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus promosi');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.promotions() });
    queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
  };

  const effectiveTotalCount = totalCount !== undefined ? totalCount : promotions.length;
  const isFiltered = Boolean(searchQuery.trim()) || statusFilter !== 'all';

  return (
    <div className='flex flex-col gap-4 font-sans'>
      {/* Main Content Area */}
      {isLoading ? (
        <EntityCardGridSkeleton
          count={6}
          className={
            cardGridClassName || 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4'
          }
        />
      ) : effectiveTotalCount === 0 && !isFiltered ? (
        <EmptyState
          title='Belum ada promosi atau pengumuman'
          description='Tambahkan promosi spesial, paket MCU, atau banner pengumuman untuk ditampilkan kepada pasien di landing page dan mobile app.'
          action={
            canManage ? (
              <Button size='sm' onClick={handleOpenCreate} className='text-xs gap-1.5 h-8'>
                <Plus className='size-3.5' /> Tambah Promosi
              </Button>
            ) : undefined
          }
        />
      ) : promotions.length === 0 ? (
        <EmptyState
          title='Tidak ada promosi yang cocok'
          description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
          resetAction={onResetFilter ? { label: 'Reset Filter', onReset: onResetFilter } : undefined}
        />
      ) : (
        /* Promotions Grid */
        <div
          className={
            cardGridClassName || 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4'
          }
        >
          {promotions.map((promo) => (
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
        onSuccess={handleFormSuccess}
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
