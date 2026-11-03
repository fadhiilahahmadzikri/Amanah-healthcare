'use client';

import * as React from 'react';
import {
  Calendar,
  Type,
  FileText,
  CheckCircle2,
  ChevronDown,
  CheckSquare,
  MapPin,
  Table,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  X,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COMPONENT_OPTIONS } from '../../constants/component-registry';
import type { MedicalFormSection } from '../../constants/medical-appointment-schemas';

export interface MedicalBuilderTrayProps {
  isOpen: boolean;
  onToggle: () => void;
  sections: MedicalFormSection[];
  activeStep: number;
  onSelectStep: (stepNumber: number) => void;
  onAddField: (componentId: string) => void;
  onAddStep?: () => void;
  onDeleteStep?: (stepIndex: number) => void;
}

function getMonochromeIcon(componentId: string) {
  switch (componentId) {
    case 'calendar':
      return <Calendar className='size-5 text-foreground' />;
    case 'textarea':
      return <FileText className='size-5 text-foreground' />;
    case 'choice-chips':
      return <CheckCircle2 className='size-5 text-foreground' />;
    case 'select':
      return <ChevronDown className='size-5 text-foreground' />;
    case 'checkbox':
      return <CheckSquare className='size-5 text-foreground' />;
    case 'region-dropdown':
      return <MapPin className='size-5 text-foreground' />;
    case 'table':
      return <Table className='size-5 text-foreground' />;
    case 'text-input':
    default:
      return <Type className='size-5 text-foreground' />;
  }
}

export function MedicalBuilderTray({
  isOpen,
  onToggle,
  sections,
  activeStep,
  onSelectStep,
  onAddField,
  onAddStep,
  onDeleteStep
}: MedicalBuilderTrayProps) {
  const [activeTab, setActiveTab] = React.useState<'components' | 'steps'>('components');

  const totalSteps = sections.length || 1;

  return (
    <div className='relative shrink-0 flex items-center select-none z-20 self-stretch'>
      {/* Tray Surface Panel (Flush dock, zero awkward gap) */}
      <aside
        aria-label='Studio Formulir'
        className={cn(
          'relative flex flex-col rounded-2xl border border-border/70 bg-card text-card-foreground shadow-xl backdrop-blur-md overflow-hidden transition-all duration-200 ease-out',
          isOpen
            ? 'w-72 sm:w-80 h-[88dvh] max-h-[88dvh] opacity-100 visible pointer-events-auto'
            : 'w-0 h-[88dvh] max-h-[88dvh] opacity-0 invisible pointer-events-none border-0 p-0'
        )}
      >
        {/* Tray Header - Minimalist, no redundant badges/icons */}
        <div className='flex items-center justify-between gap-2 px-4 py-3 border-b border-border/50 shrink-0 bg-muted/10'>
          <h3 className='text-xs font-semibold tracking-tight text-foreground'>
            Studio Formulir
          </h3>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onToggle}
            className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 cursor-pointer'
            title='Tutup panel studio'
          >
            <span className='text-[11px] font-medium'>Tutup</span>
            <ChevronsRight className='size-3.5' />
          </Button>
        </div>

        {/* Tab Switcher: Komponen vs Langkah */}
        <div className='p-2 border-b border-border/40 bg-muted/5 shrink-0'>
          <div className='grid grid-cols-2 w-full gap-1 p-0.5 rounded-lg bg-muted/40 text-xs font-medium'>
            <button
              type='button'
              onClick={() => setActiveTab('components')}
              className={cn(
                'py-1.5 rounded-md transition-all text-xs font-medium text-center',
                activeTab === 'components'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Komponen
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('steps')}
              className={cn(
                'py-1.5 rounded-md transition-all text-xs font-medium text-center',
                activeTab === 'steps'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Langkah ({totalSteps})
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'components' ? (
          <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
            <div className='px-4 pt-3 pb-1 shrink-0'>
              <p className='text-[11px] text-muted-foreground'>
                Klik atau seret komponen untuk menambah ke formulir:
              </p>
            </div>

            {/* 2-Column Grid of Clean Monochrome Component Tiles */}
            <div className='flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5'>
              {COMPONENT_OPTIONS.map((comp) => {
                const labelClean = comp.label.split('(')[0].trim();
                return (
                  <button
                    key={comp.id}
                    type='button'
                    onClick={() => onAddField(comp.id)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-amanah-component-id', comp.id);
                      e.dataTransfer.setData('text/plain', comp.id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className={cn(
                      'group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-border/60 bg-card',
                      'hover:border-foreground/30 hover:bg-muted/30 transition-all duration-150 cursor-pointer text-center outline-none',
                      'focus-visible:ring-1 focus-visible:ring-ring'
                    )}
                    title={comp.description}
                  >
                    {/* Rounded square container with monochrome icon */}
                    <div className='flex size-11 items-center justify-center rounded-xl border border-border/70 bg-background text-foreground transition-transform duration-150 group-hover:scale-105'>
                      {getMonochromeIcon(comp.id)}
                    </div>

                    {/* Clean Label without snake_case / code redundant type */}
                    <span className='text-xs font-medium text-foreground tracking-tight line-clamp-1 w-full'>
                      {labelClean}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
            <div className='px-4 pt-3 pb-1 shrink-0 flex items-center justify-between'>
              <p className='text-[11px] text-muted-foreground'>
                Lompat langsung ke langkah tujuan:
              </p>
              {onAddStep && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onClick={onAddStep}
                  title='Tambah langkah baru'
                  className='text-foreground hover:bg-muted/50 size-6'
                >
                  <Plus className='size-3.5' />
                </Button>
              )}
            </div>

            {/* Steps List */}
            <div className='flex-1 overflow-y-auto p-2.5 space-y-1'>
              {sections.map((sec, idx) => {
                const stepNum = idx + 1;
                const isCurrent = stepNum === activeStep;
                const fieldCount = sec.fields ? sec.fields.length : 0;

                return (
                  <div
                    key={sec.id || idx}
                    className={cn(
                      'group flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all select-none cursor-pointer',
                      isCurrent
                        ? 'bg-muted/60 border-foreground/30 text-foreground font-semibold shadow-2xs'
                        : 'bg-card border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-border'
                    )}
                    onClick={() => onSelectStep(stepNum)}
                  >
                    <div className='flex items-center gap-2 min-w-0 flex-1'>
                      {/* Step Number Badge */}
                      <span
                        className={cn(
                          'flex size-5 items-center justify-center rounded-md text-[11px] font-medium border shrink-0 transition-colors',
                          isCurrent
                            ? 'border-foreground/40 bg-foreground text-background'
                            : 'border-border/70 bg-background text-muted-foreground'
                        )}
                      >
                        {stepNum}
                      </span>

                      {/* Step Title */}
                      <p
                        className={cn(
                          'text-xs truncate leading-tight',
                          isCurrent ? 'text-foreground font-semibold' : 'text-foreground/80'
                        )}
                      >
                        {sec.title || `Langkah ${stepNum}`}
                      </p>
                    </div>

                    <div className='flex items-center gap-1.5 shrink-0'>
                      <span className='text-[10px] font-mono text-muted-foreground'>
                        {fieldCount}
                      </span>

                      {totalSteps > 1 && onDeleteStep && (
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteStep(idx);
                          }}
                          title={`Hapus Langkah ${stepNum}`}
                          className='size-4 flex items-center justify-center rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Trash2 className='size-3' />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Step Button */}
            {onAddStep && (
              <div className='p-3 border-t border-border/40 bg-muted/5 shrink-0'>
                <Button
                  type='button'
                  variant='outline'
                  shape='pill'
                  onClick={onAddStep}
                  className='w-full text-xs h-8 border-dashed'
                >
                  <Plus className='mr-1.5 size-3.5' /> Tambah Langkah Baru
                </Button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
