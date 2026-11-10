'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { SupportFaqCard } from '../cards/support-faq-card';
import type { SupportFaqItem } from '../../types/clinic-essentials.types';

export interface FaqsTabProps {
  faqs: SupportFaqItem[];
  totalCount: number;
  isLoading: boolean;
  canManage: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleActive: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onCardClick?: (item: SupportFaqItem) => void;
  onEdit: (item: SupportFaqItem) => void;
  onDelete: (item: SupportFaqItem) => void;
  onOpenCreate: () => void;
  onResetFilter: () => void;
  cardGridClassName: string;
}

const PATH_FILTERS = [
  { label: 'Semua Rute', value: 'all' },
  { label: 'Beranda (/)', value: '/' },
  { label: 'Fasilitas (/fasilitas)', value: '/fasilitas' },
  { label: 'Tentang Kami (/tentang-kami)', value: '/tentang-kami' },
  { label: 'Kontak (/kontak)', value: '/kontak' }
];

export function FaqsTab({
  faqs,
  totalCount,
  isLoading,
  canManage,
  selectedIds,
  onToggleSelect,
  onToggleActive,
  isTogglingActiveId,
  onCardClick,
  onEdit,
  onDelete,
  onOpenCreate,
  onResetFilter,
  cardGridClassName
}: FaqsTabProps) {
  const [selectedPathFilter, setSelectedPathFilter] = React.useState('all');

  const pathFilteredFaqs = React.useMemo(() => {
    if (selectedPathFilter === 'all') return faqs;
    return (Array.isArray(faqs) ? faqs : []).filter(
      (f) => f.paths && f.paths.includes(selectedPathFilter)
    );
  }, [faqs, selectedPathFilter]);

  if (isLoading) {
    return <EntityCardGridSkeleton count={6} className={cardGridClassName} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        title='Belum ada pertanyaan FAQ'
        description='Tambahkan pertanyaan dan jawaban seputar layanan atau fasilitas untuk memandu pasien di landing page.'
        action={
          canManage ? (
            <Button size='sm' onClick={onOpenCreate} className='text-xs gap-1.5 h-8'>
              <Plus className='size-3.5' /> Tambah FAQ
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (pathFilteredFaqs.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-1.5'>
          {PATH_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type='button'
              onClick={() => setSelectedPathFilter(filter.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedPathFilter === filter.value
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <EmptyState
          title='Tidak ada pertanyaan FAQ yang cocok'
          description='Coba sesuaikan pilihan filter rute atau reset pencarian untuk melihat data.'
          resetAction={{
            label: 'Reset Filter',
            onReset: () => {
              setSelectedPathFilter('all');
              onResetFilter();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {/* Path Filter Pills */}
      <div className='flex items-center justify-between pb-1'>
        <div className='flex flex-wrap items-center gap-1.5'>
          {PATH_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type='button'
              onClick={() => setSelectedPathFilter(filter.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedPathFilter === filter.value
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cardGridClassName}>
        {pathFilteredFaqs.map((f) => (
          <SupportFaqCard
            key={f.id}
            faq={f}
            canManage={canManage}
            selected={selectedIds.includes(f.id)}
            isBulkingActive={selectedIds.length > 0}
            onToggleSelect={() => onToggleSelect(f.id)}
            onToggleActive={(newActive) => onToggleActive(f.id, newActive)}
            isTogglingActive={isTogglingActiveId === f.id}
            onCardClick={onCardClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
