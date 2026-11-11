'use client';

import * as React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientSearchableSelect } from '@/features/data-pasien/components/registration/molecules/patient-searchable-select';
import type {
  ClinicService,
  ServiceCategory,
} from '../../../types/clinic-essentials.types';
import { cn } from '@/lib/utils';

export interface FaqMetaConfigBentoProps {
  selectedPaths: string[];
  togglePath: (path: string) => void;
  serviceId: string;
  setServiceId: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  displayOrder: number;
  setDisplayOrder: (val: number) => void;
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
  isOrderExpanded: boolean;
  onToggleExpandOrder: () => void;
  services: ClinicService[];
  categories: ServiceCategory[];
  className?: string;
}

const AVAILABLE_PATHS = [
  { path: '/', label: 'Beranda (/)', desc: 'Halaman utama klinik' },
  { path: '/fasilitas', label: 'Fasilitas (/fasilitas)', desc: 'Katalog layanan medis' },
  { path: '/tentang-kami', label: 'Tentang Kami (/tentang-kami)', desc: 'Profil klinik & dokter' },
  { path: '/kontak', label: 'Kontak (/kontak)', desc: 'Informasi lokasi & darurat' },
];

export function FaqMetaConfigBento({
  selectedPaths,
  togglePath,
  serviceId,
  setServiceId,
  categoryId,
  setCategoryId,
  displayOrder,
  setDisplayOrder,
  isPublished,
  setIsPublished,
  isOrderExpanded,
  onToggleExpandOrder,
  services,
  categories,
  className,
}: FaqMetaConfigBentoProps) {
  const serviceOptions = React.useMemo(() => {
    return [
      {
        id: 'none',
        name: '— Tanpa Layanan Khusus —',
        description: 'FAQ berlaku untuk seluruh klinik',
      },
      ...services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.categoryName || undefined,
      })),
    ];
  }, [services]);

  const activeServiceName = React.useMemo(() => {
    if (!serviceId || serviceId === 'none') return '';
    const found = services.find((s) => s.id === serviceId);
    return found ? found.name : '';
  }, [services, serviceId]);

  const categoryGroupOptions = React.useMemo(() => {
    return [
      {
        id: 'none',
        name: '— Tanpa Kelompok Khusus —',
        description: 'Tidak terikat kelompok kategori tertentu',
      },
      ...categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: undefined,
      })),
    ];
  }, [categories]);

  const activeCategoryGroupName = React.useMemo(() => {
    if (!categoryId || categoryId === 'none') return '';
    const found = categories.find((c) => c.id === categoryId);
    return found ? found.name : '';
  }, [categories, categoryId]);

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
            Penempatan Rute & Konfigurasi
          </h4>
          <p className='text-[11px] text-muted-foreground mt-0.5 font-medium'>
            Halaman tayang, relasi layanan medis, dan urutan tampil
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 pt-3 space-y-4 scrollbar-thin'>
        {/* Penempatan Rute Landing Page */}
        <div className='space-y-2'>
          <span className='text-xs font-semibold text-foreground block'>
            Penempatan Rute Landing Page *
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {AVAILABLE_PATHS.map((item) => {
              const isChecked = selectedPaths.includes(item.path);
              return (
                <label
                  key={item.path}
                  htmlFor={`faq_path_${item.path}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border p-2.5 cursor-pointer transition-all',
                    isChecked
                      ? 'border-primary bg-primary/10 text-foreground shadow-2xs font-semibold'
                      : 'border-border/60 bg-card/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  <input
                    id={`faq_path_${item.path}`}
                    type='checkbox'
                    aria-label={item.label}
                    checked={isChecked}
                    onChange={() => togglePath(item.path)}
                    className='size-4 rounded accent-primary cursor-pointer'
                  />
                  <div className='min-w-0 flex-1'>
                    <span className='text-xs font-semibold text-foreground block truncate'>
                      {item.label}
                    </span>
                    <span className='text-[10px] text-muted-foreground block truncate'>
                      {item.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Relasi Layanan Medis & Kelompok Layanan */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40'>
          <div>
            <PatientSearchableSelect
              id='faq_service_picker'
              label='Relasi Layanan (Opsional)'
              placeholder='Pilih layanan medis...'
              value={activeServiceName}
              options={serviceOptions}
              onSelect={(item) => setServiceId(item.id || 'none')}
              searchPlaceholder='Cari nama layanan medis...'
            />
          </div>

          <div>
            <PatientSearchableSelect
              id='faq_category_group_picker'
              label='Kelompok Layanan (Opsional)'
              placeholder='Pilih kelompok layanan...'
              value={activeCategoryGroupName}
              options={categoryGroupOptions}
              onSelect={(item) => setCategoryId(item.id || 'none')}
              searchPlaceholder='Cari kelompok layanan...'
            />
          </div>
        </div>

        {/* Urutan Tampil & Tombol Expand Preview Reorder */}
        <div className='pt-2 border-t border-border/40 space-y-2'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <label htmlFor='faq_display_order' className='text-xs font-semibold text-foreground block'>
                Urutan Tampil
              </label>
              <p className='text-[11px] text-muted-foreground'>
                Nomor urutan penempatan akordion pada landing page
              </p>
            </div>
            <div className='w-20 shrink-0'>
              <PatientLineInput
                id='faq_display_order'
                label=''
                type='number'
                min={0}
                value={displayOrder}
                onChange={(val) => setDisplayOrder(Math.max(0, parseInt(val, 10) || 0))}
                isMonospace
              />
            </div>
          </div>

          {/* Tombol Expand Preview & Reorder */}
          <div className='pt-1'>
            <Button
              type='button'
              variant={isOrderExpanded ? 'secondary' : 'outline'}
              size='sm'
              shape='pill'
              onClick={onToggleExpandOrder}
              className='w-full text-xs font-semibold gap-2 h-9 border-dashed cursor-pointer'
            >
              <ArrowUpDown className='size-3.5 text-primary' />
              <span>
                {isOrderExpanded ? 'Tutup Panel Urutan' : 'Lihat & Atur Urutan Tampil'}
              </span>
            </Button>
          </div>
        </div>

        {/* Status Publikasi */}
        <div className='pt-2 border-t border-border/40 flex items-start justify-between gap-4'>
          <div className='space-y-0.5'>
            <div className='text-xs font-semibold text-foreground'>Publikasikan Sekarang</div>
            <p className='text-[11px] text-muted-foreground'>
              Jika aktif, FAQ akan langsung ditampilkan pada landing page
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
  );
}
