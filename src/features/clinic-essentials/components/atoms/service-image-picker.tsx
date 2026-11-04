'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, ImageIcon, Search, Trash2, X } from 'lucide-react';
import {
  PREDEFINED_SERVICE_IMAGES,
  type PredefinedServiceImage
} from '../../constants/service-image-catalog.constants';
import { cn } from '@/lib/utils';

export interface ServiceImagePickerProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ServiceImagePicker({
  value,
  onChange,
  disabled = false,
  className
}: ServiceImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = useMemo(() => {
    const set = new Set<string>();
    PREDEFINED_SERVICE_IMAGES.forEach((img) => {
      if (img.category) set.add(img.category);
    });
    return ['Semua', ...Array.from(set)];
  }, []);

  const filteredImages = useMemo(() => {
    return PREDEFINED_SERVICE_IMAGES.filter((img) => {
      const matchSearch =
        img.label.toLowerCase().includes(search.toLowerCase()) ||
        img.path.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === 'Semua' || img.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  const selectedImageMeta = useMemo(() => {
    if (!value) return null;
    return PREDEFINED_SERVICE_IMAGES.find((img) => img.path === value) || null;
  }, [value]);

  const handleSelect = (img: PredefinedServiceImage) => {
    onChange(img.path);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('flex items-center gap-2', className)}>
        <PopoverTrigger asChild>
          <button
            type='button'
            disabled={disabled}
            className={cn(
              'group relative flex h-10 w-28 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-muted/20 transition-all hover:border-primary/60 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              value && 'border-primary/40 shadow-2xs',
              disabled && 'pointer-events-none opacity-50'
            )}
            title={selectedImageMeta ? selectedImageMeta.label : 'Pilih Gambar'}
          >
            {value ? (
              <>
                <Image
                  src={value}
                  alt={selectedImageMeta?.label || 'Thumbnail Layanan'}
                  fill
                  sizes='120px'
                  className='object-cover transition-transform group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-black/25 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center'>
                  <span className='text-[10px] font-semibold text-white drop-shadow-sm'>
                    Ubah
                  </span>
                </div>
              </>
            ) : (
              <div className='flex items-center gap-1.5 px-2 text-muted-foreground transition-colors group-hover:text-foreground'>
                <ImageIcon className='size-4' />
                <span className='text-xs font-medium'>Gambar</span>
              </div>
            )}
          </button>
        </PopoverTrigger>

        {value && !disabled && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleClear}
            className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer'
            title='Hapus Gambar (Gunakan Icon)'
          >
            <Trash2 className='size-3.5' />
          </Button>
        )}
      </div>

      <PopoverContent
        align='start'
        className='w-[360px] sm:w-[420px] p-3 font-sans rounded-xl border-border/80 shadow-lg'
      >
        <div className='space-y-3'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-border/50 pb-2'>
            <div className='flex items-center gap-1.5'>
              <ImageIcon className='size-4 text-primary' />
              <h4 className='text-xs font-bold text-foreground'>
                Katalog Asset Gambar Layanan
              </h4>
            </div>
            <Badge variant='outline' className='text-[10px] px-1.5 py-0'>
              {PREDEFINED_SERVICE_IMAGES.length} Predefined
            </Badge>
          </div>

          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Cari gambar layanan (misal: vaksin, periksa, tensi)...'
              className='h-8 pl-8 pr-7 text-xs bg-muted/30'
            />
            {search && (
              <button
                type='button'
                onClick={() => setSearch('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5'
              >
                <X className='size-3' />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className='flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none'>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type='button'
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'shrink-0 text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Image Grid */}
          <ScrollArea className='h-[250px] pr-2'>
            {filteredImages.length > 0 ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1'>
                {filteredImages.map((img) => {
                  const isCurrent = value === img.path;
                  return (
                    <button
                      key={img.path}
                      type='button'
                      onClick={() => handleSelect(img)}
                      className={cn(
                        'group relative flex flex-col rounded-lg border border-border/70 overflow-hidden bg-card text-left transition-all hover:border-primary/80 hover:shadow-xs cursor-pointer',
                        isCurrent && 'ring-2 ring-primary border-primary bg-primary/5'
                      )}
                    >
                      <div className='relative h-18 w-full overflow-hidden bg-muted/20'>
                        <Image
                          src={img.path}
                          alt={img.label}
                          fill
                          sizes='140px'
                          className='object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                        {isCurrent && (
                          <div className='absolute top-1.5 right-1.5 rounded-full bg-primary p-0.5 text-primary-foreground shadow-xs'>
                            <Check className='size-3 stroke-[3]' />
                          </div>
                        )}
                      </div>
                      <div className='p-1.5 min-w-0'>
                        <p
                          className='text-[11px] font-semibold text-foreground truncate leading-tight'
                          title={img.label}
                        >
                          {img.label}
                        </p>
                        <span className='text-[9px] text-muted-foreground uppercase tracking-wider'>
                          {img.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className='h-[180px] flex flex-col items-center justify-center text-center p-4 text-muted-foreground'>
                <ImageIcon className='size-8 opacity-40 mb-1' />
                <p className='text-xs font-medium'>Tidak ada gambar yang cocok</p>
                <p className='text-[10px] text-muted-foreground/80 mt-0.5'>
                  Sesuaikan kata kunci pencarian Anda
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
