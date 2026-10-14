'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import type { SearchEngineDialogProps, SearchEngineResultItem } from './types';

const MAX_RECENT_ITEMS = 6;

export function SearchEngineDialog({
  config,
  isOpen,
  onClose
}: SearchEngineDialogProps) {
  const [internalQuery, setInternalQuery] = useState(config.query);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const storageKey = config.recentSearchesKey || `clinic_recent_search_${config.id}`;

  useEffect(() => {
    if (isOpen) {
      setInternalQuery(config.query);
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setRecentSearches(parsed.slice(0, MAX_RECENT_ITEMS));
            }
          }
        }
      } catch {
        setRecentSearches([]);
      }
      // Focus after mount
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, config.query, storageKey]);

  // Real-time sync: apapun yang diketik di search wizard langsung merefleksikan konten utama di belakangnya
  useEffect(() => {
    if (!isOpen || config.realtimeSync === false) return;
    const timer = setTimeout(() => {
      if (internalQuery !== config.query) {
        config.onQueryChange(internalQuery);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [internalQuery, isOpen, config]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      if (typeof window !== 'undefined') {
        const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(
          0,
          MAX_RECENT_ITEMS
        );
        setRecentSearches(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    } catch {
      // Ignore storage errors safely
    }
  };

  const clearRecentSearches = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
      setRecentSearches([]);
    } catch {
      setRecentSearches([]);
    }
  };

  const handleApply = (termToApply?: string) => {
    const finalTerm = termToApply !== undefined ? termToApply : internalQuery;
    config.onQueryChange(finalTerm);
    if (finalTerm.trim()) {
      saveRecentSearch(finalTerm);
    }
    if (config.onSubmit) {
      config.onSubmit(finalTerm);
    }
    onClose();
  };

  const handleClear = () => {
    setInternalQuery('');
    config.onQueryChange('');
    config.onClear?.();
    inputRef.current?.focus();
  };

  const handleSelectRecentOrSuggestion = (term: string) => {
    setInternalQuery(term);
    handleApply(term);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const filteredResults = useMemo(() => {
    const q = internalQuery.trim().toLowerCase();
    if (!q || !config.indexItems) return [];
    return config.indexItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = Boolean(item.subtitle && item.subtitle.toLowerCase().includes(q));
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchQueryVal = Boolean(item.queryValue && item.queryValue.toLowerCase().includes(q));
      return matchTitle || matchSubtitle || matchCategory || matchQueryVal;
    });
  }, [internalQuery, config.indexItems]);

  const groupedResults = useMemo(() => {
    const map = new Map<string, SearchEngineResultItem[]>();
    for (const item of filteredResults) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, [filteredResults]);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-lg'
      showCloseButton={false}
      className='flex flex-col max-h-[85vh] overflow-hidden p-0'
    >
      <div className='flex flex-col font-sans select-none h-full min-h-0'>
        {/* Header Modal */}
        <div className='flex items-center justify-between gap-3 px-5 py-4 border-b border-border/40 shrink-0'>
          <div className='flex items-center gap-3 min-w-0 flex-1'>
            <div className='size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-border/40'>
              <Icons.search className='size-4' />
            </div>
            <div className='flex flex-col min-w-0 flex-1'>
              <h3 className='text-sm sm:text-base font-bold text-foreground truncate tracking-tight'>
                {config.title}
              </h3>
              <p className='text-xs text-muted-foreground truncate'>
                {config.description || 'Pencarian cerdas terpadu'}
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer shrink-0'
            aria-label='Tutup modal pencarian'
          >
            <Icons.close className='size-4.5' />
          </button>
        </div>

        {/* Input Field Section */}
        <div className='p-4 pb-2 border-b border-border/30 shrink-0'>
          <div className='relative'>
            <Icons.search className='absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
            <Input
              ref={inputRef}
              type='text'
              value={internalQuery}
              onChange={(e) => setInternalQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={config.placeholder || 'Ketik kata kunci pencarian...'}
              className='h-11 pl-10 pr-9 text-sm rounded-xl bg-card border-border/60 shadow-xs focus-visible:ring-1 focus-visible:ring-primary'
            />
            {internalQuery && (
              <button
                type='button'
                onClick={handleClear}
                aria-label='Bersihkan input pencarian'
                className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer'
              >
                <Icons.close className='size-3.5' />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Live Results & Recent Searches */}
        <div className='flex-1 min-h-0 overflow-y-auto p-4 space-y-4'>
          {internalQuery.trim() ? (
            groupedResults.length > 0 ? (
              <div className='space-y-3.5'>
                {groupedResults.map(([category, items]) => (
                  <div key={category} className='space-y-1.5'>
                    <div className='px-1 text-[11px] font-semibold text-muted-foreground'>
                      {category}
                    </div>
                    <div className='divide-y divide-border/30 rounded-xl border border-border/50 bg-card overflow-hidden'>
                      {items.map((item) => {
                        const IconComp = item.icon || Icons.search;
                        return (
                          <button
                            key={item.id}
                            type='button'
                            onClick={() => {
                              item.onSelect?.();
                              handleApply(item.queryValue || item.title);
                            }}
                            className='w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-muted/60 transition-colors cursor-pointer group'
                          >
                            <div className='flex items-center gap-3 min-w-0 flex-1'>
                              <div className='size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                                <IconComp className='size-4' />
                              </div>
                              <div className='flex flex-col min-w-0 flex-1 space-y-0.5'>
                                <span className='text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors'>
                                  {item.title}
                                </span>
                                {item.subtitle && (
                                  <span className='text-[11px] text-muted-foreground truncate'>
                                    {item.subtitle}
                                  </span>
                                )}
                              </div>
                            </div>
                            {item.badge ? (
                              <span className='text-[10.5px] px-2 py-0.5 rounded-md font-medium bg-muted text-muted-foreground shrink-0'>
                                {item.badge}
                              </span>
                            ) : (
                              <Icons.chevronRight className='size-3.5 text-muted-foreground/60 group-hover:text-foreground shrink-0' />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-8 text-center space-y-2'>
                <div className='size-10 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto'>
                  <Icons.search className='size-5' />
                </div>
                <p className='text-xs font-medium text-foreground'>
                  Tidak ada hasil untuk &ldquo;{internalQuery}&rdquo;
                </p>
                <p className='text-[11px] text-muted-foreground'>
                  Coba gunakan kata kunci dokter, pasien, atau layanan lain.
                </p>
              </div>
            )
          ) : (
            <>
              {/* Quick Filters (if configured) */}
              {config.quickFilters && config.quickFilters.length > 0 && (
                <div>
                  <span className='text-[11px] font-semibold text-muted-foreground block mb-2'>
                    Filter Cepat
                  </span>
                  <div className='flex flex-wrap gap-1.5'>
                    {config.quickFilters.map((qf) => (
                      <button
                        key={qf.id}
                        type='button'
                        onClick={qf.onToggle}
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer border',
                          qf.isActive
                            ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-2xs'
                            : 'bg-muted/50 hover:bg-muted text-foreground border-border/60'
                        )}
                      >
                        {qf.label}
                        {qf.count !== undefined && (
                          <span className='ml-1 opacity-70 font-mono'>({qf.count})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches (from LocalStorage) */}
              {recentSearches.length > 0 && (
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5'>
                      <Icons.history className='size-3.5' />
                      Pencarian Terkini
                    </span>
                    <button
                      type='button'
                      onClick={clearRecentSearches}
                      className='text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer'
                    >
                      Hapus Riwayat
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {recentSearches.map((term, idx) => (
                      <button
                        key={`${term}-${idx}`}
                        type='button'
                        onClick={() => handleSelectRecentOrSuggestion(term)}
                        className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-medium bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer group'
                      >
                        <Icons.clock className='size-3 text-muted-foreground group-hover:text-foreground transition-colors' />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Active Query Status Information */}
          {config.query && (
            <div className='p-3 rounded-xl bg-card border border-border/50 text-xs text-muted-foreground flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 truncate'>
                <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                <span className='truncate'>
                  Filter aktif: <strong className='text-foreground'>{config.query}</strong>
                </span>
              </div>
              <button
                type='button'
                onClick={handleClear}
                className='text-xs text-destructive hover:underline cursor-pointer shrink-0'
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Footer Modal with Standard size='card-action' & shape='pill' */}
        <div className='px-5 py-3.5 border-t border-border/40 flex items-center justify-between gap-3 shrink-0 bg-muted/10'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='card-action'
            onClick={onClose}
            className='px-6 font-semibold text-xs cursor-pointer'
          >
            Tutup
          </Button>

          <div className='flex items-center gap-2'>
            {internalQuery && (
              <Button
                type='button'
                variant='ghost'
                shape='pill'
                size='card-action'
                onClick={handleClear}
                className='px-4 font-semibold text-xs cursor-pointer text-muted-foreground'
              >
                Hapus
              </Button>
            )}

            <Button
              type='button'
              variant='primary'
              shape='pill'
              size='card-action'
              onClick={() => handleApply()}
              className='px-6 font-semibold text-xs cursor-pointer shadow-xs'
              leadingIcon={<Icons.search className='size-3.5' />}
            >
              Terapkan
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
