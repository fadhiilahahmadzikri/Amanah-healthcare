'use client';

import * as React from 'react';
import { ChevronDown, GripVertical, Layers, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { SupportFaqItem } from '../../../types/clinic-essentials.types';

export interface FaqOrderPreviewPanelProps {
  allFaqs: SupportFaqItem[];
  activePaths: string[];
  currentFaq: {
    id?: string;
    title: string;
    answer: string;
    displayOrder: number;
    isPublished: boolean;
  };
  onDisplayOrderChange: (newOrder: number) => void;
  onClose: () => void;
  className?: string;
}

interface DisplayFaqItem {
  id: string;
  title: string;
  solutionSteps: string[];
  serviceName?: string | null;
  displayOrder: number;
  isPublished: boolean;
  isCurrent?: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Beranda (/)',
  '/fasilitas': 'Fasilitas (/fasilitas)',
  '/tentang-kami': 'Tentang Kami (/tentang-kami)',
  '/kontak': 'Kontak (/kontak)',
};

export function FaqOrderPreviewPanel({
  allFaqs,
  activePaths,
  currentFaq,
  onDisplayOrderChange,
  onClose,
  className,
}: FaqOrderPreviewPanelProps) {
  const availableRoutes = activePaths.length > 0 ? activePaths : ['/'];
  const [selectedRoute, setSelectedRoute] = React.useState<string>(availableRoutes[0] || '/');
  const [expandedIds, setExpandedIds] = React.useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  // Sync selectedRoute if activePaths change
  React.useEffect(() => {
    if (!availableRoutes.includes(selectedRoute)) {
      setSelectedRoute(availableRoutes[0] || '/');
    }
  }, [availableRoutes, selectedRoute]);

  // Construct initial ordered list for the selected route
  const [orderedItems, setOrderedItems] = React.useState<DisplayFaqItem[]>([]);

  React.useEffect(() => {
    const rawFiltered = allFaqs
      .filter((f) => f.paths && f.paths.includes(selectedRoute))
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    const currentTitle = currentFaq.title.trim() || 'Pertanyaan Baru (Draf)';
    const currentSteps = currentFaq.answer
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    let list: DisplayFaqItem[] = [];

    if (currentFaq.id) {
      // Edit mode: replace existing item with current form values
      const existsInRoute = rawFiltered.some((f) => f.id === currentFaq.id);
      if (existsInRoute) {
        list = rawFiltered.map((f) => {
          if (f.id === currentFaq.id) {
            return {
              id: f.id,
              title: currentTitle,
              solutionSteps: currentSteps.length > 0 ? currentSteps : f.solutionSteps,
              serviceName: f.serviceName,
              displayOrder: currentFaq.displayOrder,
              isPublished: currentFaq.isPublished,
              isCurrent: true,
            };
          }
          return {
            id: f.id,
            title: f.title,
            solutionSteps: Array.isArray(f.solutionSteps) ? f.solutionSteps : [String(f.solutionSteps || '')],
            serviceName: f.serviceName,
            displayOrder: f.displayOrder,
            isPublished: f.isPublished !== false,
          };
        });
      } else {
        // Current item was not yet in this route, insert it
        const currentItem: DisplayFaqItem = {
          id: currentFaq.id,
          title: currentTitle,
          solutionSteps: currentSteps.length > 0 ? currentSteps : ['Jawaban draf...'],
          displayOrder: currentFaq.displayOrder,
          isPublished: currentFaq.isPublished,
          isCurrent: true,
        };
        list = rawFiltered.map((f) => ({
          id: f.id,
          title: f.title,
          solutionSteps: Array.isArray(f.solutionSteps) ? f.solutionSteps : [String(f.solutionSteps || '')],
          serviceName: f.serviceName,
          displayOrder: f.displayOrder,
          isPublished: f.isPublished !== false,
        }));
        const insertIdx = Math.min(Math.max(0, currentFaq.displayOrder), list.length);
        list.splice(insertIdx, 0, currentItem);
      }
    } else {
      // Create mode: insert draft item into route list
      const draftItem: DisplayFaqItem = {
        id: '__current_draft__',
        title: currentTitle,
        solutionSteps: currentSteps.length > 0 ? currentSteps : ['Jawaban draf...'],
        displayOrder: currentFaq.displayOrder,
        isPublished: currentFaq.isPublished,
        isCurrent: true,
      };

      list = rawFiltered.map((f) => ({
        id: f.id,
        title: f.title,
        solutionSteps: Array.isArray(f.solutionSteps) ? f.solutionSteps : [String(f.solutionSteps || '')],
        serviceName: f.serviceName,
        displayOrder: f.displayOrder,
        isPublished: f.isPublished !== false,
      }));

      const targetIndex = Math.min(Math.max(0, currentFaq.displayOrder), list.length);
      list.splice(targetIndex, 0, draftItem);
    }

    setOrderedItems(list);
    // Expand current item by default
    const currentItemId = currentFaq.id || '__current_draft__';
    setExpandedIds((prev) => ({ ...prev, [currentItemId]: true }));
  }, [allFaqs, selectedRoute, currentFaq.id, currentFaq.title, currentFaq.answer, currentFaq.isPublished]);

  // Toggle Accordion Item
  const toggleAccordion = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) return;

    setOrderedItems((prev) => {
      const draggedIdx = prev.findIndex((item) => item.id === draggedId);
      const targetIdx = prev.findIndex((item) => item.id === targetId);
      if (draggedIdx === -1 || targetIdx === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(draggedIdx, 1);
      updated.splice(targetIdx, 0, moved);

      // Re-assign display order
      const currentItemId = currentFaq.id || '__current_draft__';
      const newCurrentIdx = updated.findIndex((item) => item.id === currentItemId);
      if (newCurrentIdx !== -1) {
        onDisplayOrderChange(newCurrentIdx);
      }

      return updated;
    });

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 flex flex-col h-full overflow-hidden shadow-2xs font-sans',
        className
      )}
    >
      {/* Panel Header */}
      <div className='flex items-start justify-between pb-3 border-b border-border/40 shrink-0 gap-3'>
        <div className='min-w-0 flex-1 space-y-0.5'>
          <div className='flex items-center gap-2'>
            <h4 className='text-xs sm:text-sm font-bold text-foreground tracking-tight'>
              Pratinjau Urutan FAQ Landing Page
            </h4>
            <span className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary'>
              Drag & Drop
            </span>
          </div>
          <p className='text-[11px] text-muted-foreground font-medium'>
            Tarik baris ke atas atau bawah untuk menentukan susunan urutan tampil
          </p>
        </div>

        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={onClose}
          aria-label='Tutup panel pratinjau'
          className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md shrink-0 cursor-pointer'
        >
          <Icons.close className='size-4' />
        </Button>
      </div>

      {/* Route Switcher Pills (If multiple paths selected) */}
      {availableRoutes.length > 1 && (
        <div className='pt-2.5 flex items-center gap-1.5 flex-wrap shrink-0'>
          <span className='text-[11px] font-semibold text-muted-foreground mr-1'>Rute:</span>
          {availableRoutes.map((route) => (
            <button
              key={route}
              type='button'
              onClick={() => setSelectedRoute(route)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                selectedRoute === route
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border/60'
              )}
            >
              {ROUTE_LABELS[route] || route}
            </button>
          ))}
        </div>
      )}

      {/* Draggable Accordion List */}
      <div className='flex-1 min-h-0 overflow-y-auto pr-1 py-3 space-y-2.5 scrollbar-thin'>
        {orderedItems.length === 0 ? (
          <div className='p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-card/40 my-auto'>
            Belum ada FAQ lain pada rute ini. FAQ ini akan menjadi urutan pertama.
          </div>
        ) : (
          orderedItems.map((item, index) => {
            const isCurrent = Boolean(item.isCurrent);
            const isExpanded = Boolean(expandedIds[item.id]);
            const isBeingDragged = draggedId === item.id;
            const isDragTarget = dragOverId === item.id && draggedId !== item.id;

            return (
              <div
                key={item.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'group relative rounded-xl border bg-card p-3 transition-all select-none',
                  isCurrent
                    ? 'border-primary/70 bg-primary/[0.03] shadow-xs ring-1 ring-primary/40'
                    : 'border-border/70 hover:border-border hover:shadow-2xs',
                  isBeingDragged && 'opacity-40 scale-98 border-dashed border-primary',
                  isDragTarget && 'border-primary bg-primary/10 shadow-sm'
                )}
              >
                {/* Card Title & Drag Handle Bar */}
                <div className='flex items-start gap-2.5'>
                  {/* Drag Handle */}
                  <div
                    title='Tarik untuk memindahkan urutan'
                    className='cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground shrink-0 rounded-md hover:bg-muted transition-colors mt-0.5'
                  >
                    <GripVertical className='size-4' />
                  </div>

                  {/* Order Index Pill */}
                  <span className='font-mono text-[11px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded shrink-0 mt-0.5'>
                    #{index + 1}
                  </span>

                  {/* Question Header & Expand Toggle */}
                  <div
                    onClick={() => toggleAccordion(item.id)}
                    className='min-w-0 flex-1 cursor-pointer'
                  >
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      {isCurrent && (
                        <Badge variant='outline' className='text-[9px] font-semibold text-primary border-primary/40 bg-primary/10 px-1.5 py-0'>
                          FAQ Ini
                        </Badge>
                      )}
                      {item.serviceName && (
                        <span className='text-[10px] text-muted-foreground font-medium flex items-center gap-1'>
                          <Layers className='size-2.5' /> {item.serviceName}
                        </span>
                      )}
                      <Badge
                        variant='outline'
                        className={cn(
                          'text-[9px] px-1.5 py-0 ml-auto shrink-0',
                          item.isPublished
                            ? 'border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'border-destructive/40 text-destructive bg-destructive/10'
                        )}
                      >
                        {item.isPublished ? 'Aktif' : 'Draf'}
                      </Badge>
                    </div>

                    <h5 className='text-xs sm:text-sm font-semibold text-foreground pt-1 leading-snug group-hover:text-primary transition-colors'>
                      {item.title}
                    </h5>
                  </div>

                  {/* Chevron Toggle */}
                  <button
                    type='button'
                    onClick={() => toggleAccordion(item.id)}
                    className='text-muted-foreground hover:text-foreground p-1 shrink-0 cursor-pointer'
                    aria-label='Buka rincian jawaban'
                  >
                    <ChevronDown
                      className={cn(
                        'size-3.5 transition-transform duration-200',
                        isExpanded && 'rotate-180 text-primary'
                      )}
                    />
                  </button>
                </div>

                {/* Expanded Accordion Body (Landing Page Solution Steps) */}
                {isExpanded && (
                  <div className='mt-2.5 pt-2.5 border-t border-border/40 pl-8 pr-1 text-xs text-muted-foreground leading-relaxed'>
                    {item.solutionSteps.length > 1 ? (
                      <ol className='space-y-1.5 list-none'>
                        {item.solutionSteps.map((step, stepIdx) => (
                          <li key={stepIdx} className='flex items-start gap-2'>
                            <span className='size-3.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5'>
                              {stepIdx + 1}
                            </span>
                            <span className='flex-1'>{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p>{item.solutionSteps[0] || 'Tidak ada uraian jawaban'}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className='shrink-0 pt-2.5 mt-auto border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground'>
        <div className='flex items-center gap-1 font-medium'>
          <MapPin className='size-3 text-primary' />
          <span>Rute: {selectedRoute}</span>
        </div>
        <span className='font-mono text-[10px] text-muted-foreground/80'>
          Total: {orderedItems.length} FAQ
        </span>
      </div>
    </div>
  );
}
