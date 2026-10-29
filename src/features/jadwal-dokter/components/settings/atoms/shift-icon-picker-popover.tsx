'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { icons } from 'lucide-react';
import { ShiftIconDisplay, resolveLucideIcon } from './shift-icon-display';
import { useAttentionEmojiLoop } from '@/hooks/use-attention-emoji-loop';
import type { EmojiClickData } from 'emoji-picker-react';

// Dynamic import with SSR false for emoji-picker-react to optimize hydration
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className='flex items-center justify-center h-[320px] text-muted-foreground text-xs'>
      <Icons.spinner className='size-5 animate-spin mr-2' />
      Memuat daftar emoji...
    </div>
  )
});

const POPULAR_SHIFT_ICONS = [
  'Sun',
  'Moon',
  'Sunrise',
  'Sunset',
  'Clock',
  'AlarmClock',
  'Timer',
  'Hourglass',
  'Stethoscope',
  'Activity',
  'Heart',
  'HeartPulse',
  'Pill',
  'Syringe',
  'Thermometer',
  'Ambulance',
  'Cross',
  'Shield',
  'Sparkles',
  'Star',
  'Coffee',
  'Bell',
  'Calendar',
  'Zap',
  'Flame',
  'Eye',
  'Smile',
  'Users',
  'Bed',
  'Briefcase',
  'Building2',
  'Check'
];

export interface ShiftIconPickerPopoverProps {
  value?: string | null;
  onChange: (iconValue: string) => void;
  fallback?: string | null;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
  className?: string;
}

export function ShiftIconPickerPopover({
  value,
  onChange,
  fallback,
  portalContainerRef,
  disabled = false,
  className
}: ShiftIconPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'emoji' | 'svg'>('emoji');
  const [svgSearch, setSvgSearch] = useState('');

  const { currentEmoji, elementRef, triggerPlayfulBounce } = useAttentionEmojiLoop({
    enabled: !value
  });

  const filteredSvgIcons = useMemo(() => {
    const q = svgSearch.trim().toLowerCase();
    if (!q) {
      return POPULAR_SHIFT_ICONS;
    }
    const allKeys = Object.keys(icons);
    return allKeys.filter((k) => k.toLowerCase().includes(q)).slice(0, 60);
  }, [svgSearch]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji);
    setIsOpen(false);
  };

  const handleSelectSvg = (iconName: string) => {
    onChange(`lucide:${iconName}`);
    setIsOpen(false);
  };

  const handleResetIcon = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={disabled}
          onClick={!value ? triggerPlayfulBounce : undefined}
          onMouseEnter={!value ? triggerPlayfulBounce : undefined}
          className={`h-9 px-2.5 rounded-lg border border-border/80 bg-background hover:bg-muted/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0 ${
            className || ''
          }`}
          aria-label='Pilih visual icon atau emoji shift'
        >
          <div className='flex items-center justify-center shrink-0'>
            {value ? (
              value.startsWith('lucide:') ? (
                (() => {
                  const LucideComp = resolveLucideIcon(value);
                  return LucideComp ? (
                    <LucideComp className='size-4 text-foreground shrink-0' />
                  ) : (
                    <Icons.clock className='size-4 text-muted-foreground shrink-0' />
                  );
                })()
              ) : (
                <span className='text-base leading-none select-none shrink-0'>{value}</span>
              )
            ) : (
              <div
                ref={elementRef}
                className='flex items-center justify-center text-base leading-none select-none shrink-0'
                title='Pilih icon atau emoji'
              >
                {currentEmoji}
              </div>
            )}
          </div>
          <Icons.chevronDown className='size-3 text-muted-foreground shrink-0 transition-transform group-hover:text-foreground' />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        portalContainerRef={portalContainerRef}
        className='w-[340px] sm:w-[360px] p-0 rounded-2xl shadow-2xl border border-border bg-card overflow-hidden z-50'
      >
        <div className='p-3 border-b border-border/70 flex items-center justify-between gap-2 bg-muted/20'>
          <div className='flex items-center gap-2 min-w-0'>
            <ShiftIconDisplay icon={value} fallback={fallback} size='sm' />
            <div className='min-w-0'>
              <h4 className='text-xs font-bold text-foreground truncate'>Katalog Icon & Emoji</h4>
              <p className='text-[10px] text-muted-foreground truncate'>
                Pilih visual representasi shift
              </p>
            </div>
          </div>
          {value && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleResetIcon}
              className='h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer'
            >
              Hapus Icon
            </Button>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'emoji' | 'svg')}
          className='w-full'
        >
          <div className='px-3 pt-2.5 bg-background'>
            <TabsList className='grid w-full grid-cols-2 h-8 p-0.5 rounded-lg bg-muted/60'>
              <TabsTrigger
                value='emoji'
                className='text-xs h-7 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs'
              >
                😀 Emoticon
              </TabsTrigger>
              <TabsTrigger
                value='svg'
                className='text-xs h-7 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs'
              >
                ✨ SVG Icon
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='emoji' className='p-2 m-0 focus-visible:outline-none'>
            <div className='h-[320px] overflow-hidden rounded-xl border border-border/50'>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                searchPlaceHolder='Cari emoji shift...'
                width='100%'
                height={320}
                previewConfig={{ showPreview: false }}
              />
            </div>
          </TabsContent>

          <TabsContent value='svg' className='p-3 m-0 space-y-2.5 focus-visible:outline-none'>
            <div className='relative'>
              <Icons.search className='absolute left-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none' />
              <Input
                placeholder='Cari nama icon (misal: sun, moon, heart)...'
                value={svgSearch}
                onChange={(e) => setSvgSearch(e.target.value)}
                className='h-8.5 pl-8 text-xs rounded-lg border-border/80 bg-background'
              />
            </div>

            <ScrollArea className='h-[275px] pr-2'>
              <div className='grid grid-cols-6 gap-1.5'>
                {filteredSvgIcons.map((iconName) => {
                  const LucideComp = resolveLucideIcon(iconName);
                  if (!LucideComp) return null;
                  const isSelected = value === `lucide:${iconName}`;

                  return (
                    <button
                      key={iconName}
                      type='button'
                      onClick={() => handleSelectSvg(iconName)}
                      title={iconName}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-primary bg-primary/15 text-primary shadow-xs'
                          : 'border-border/40 hover:border-primary/50 hover:bg-muted/70 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <LucideComp size={18} />
                    </button>
                  );
                })}
              </div>

              {filteredSvgIcons.length === 0 && (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <p className='text-xs text-muted-foreground'>
                    Tidak ada icon dengan kata kunci tersebut.
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
