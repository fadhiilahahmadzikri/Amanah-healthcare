'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Plasma3DLogo } from '@/components/ui/plasma-3d-logo';
import { useViewer } from '@/features/notifications/hooks/use-viewer';
import { AUDIENCE } from '@/core/auth/permissions.constants';
import { ConsultationAdminView } from './consultation-admin-view';
import { ConsultationExternalView } from './consultation-external-view';
import { cn } from '@/lib/utils';

export function ConsultationWidget() {
  const pathname = usePathname();
  const viewer = useViewer();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const morphContainerRef = useRef<HTMLDivElement | null>(null);
  const isAdmin = viewer.viewer && viewer.audience === AUDIENCE.INTERNAL;

  // Sembunyikan floating widget jika sedang berada di halaman chat penuh
  const isDedicatedChatPage =
    pathname?.startsWith('/admin/chat') || pathname?.startsWith('/klinik/chat');

  // Global Keyboard Shortcuts (Cmd/Ctrl + K or Escape)
  useEffect(() => {
    if (isDedicatedChatPage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDedicatedChatPage]);

  if (isDedicatedChatPage) {
    return null;
  }

  return (
    <div
      ref={morphContainerRef}
      onMouseEnter={() => !isOpen && setIsHovered(true)}
      onMouseLeave={() => !isOpen && setIsHovered(false)}
      onClick={() => !isOpen && setIsOpen(true)}
      style={
        !isOpen
          ? {
              background: 'var(--pill-3d-gradient)',
              borderColor: 'var(--pill-3d-border)',
              boxShadow: isHovered
                ? 'inset 0 1.5px 1.5px 0 rgba(255,255,255,0.8), 0 12px 28px -4px var(--pill-3d-shadow), 0 3px 6px 0 rgba(0,0,0,0.15)'
                : 'inset 0 1.5px 1.5px 0 rgba(255,255,255,0.7), 0 8px 24px -4px var(--pill-3d-shadow), 0 2px 4px 0 rgba(0,0,0,0.1)'
            }
          : undefined
      }
      className={cn(
        'fixed bottom-6 right-6 z-50 flex flex-col font-sans overflow-hidden border transition-[width,height,max-width,max-height,border-radius,padding,box-shadow,background-color] duration-300 ease-out select-none',
        !isOpen
          ? isHovered
            ? 'w-[200px] h-14 rounded-2xl px-3 py-1.5 cursor-pointer ring-4 ring-primary/25 text-white'
            : 'w-14 h-14 rounded-2xl p-0 cursor-pointer ring-2 ring-primary/20 text-white'
          : isExpanded
            ? 'w-[calc(100vw-2rem)] sm:w-[min(1080px,calc(100vw-3rem))] h-[min(820px,calc(100vh-4rem))] rounded-[28px] p-0 border-border/70 bg-card/98 text-card-foreground shadow-2xl backdrop-blur-2xl'
            : isAdmin
              ? 'w-[calc(100vw-2rem)] sm:w-[720px] md:w-[780px] h-[640px] max-h-[calc(100vh-5rem)] rounded-3xl p-0 border-border/70 bg-card/98 text-card-foreground shadow-2xl backdrop-blur-2xl'
              : 'w-[calc(100vw-2rem)] sm:w-[480px] md:w-[540px] h-[640px] max-h-[calc(100vh-5rem)] rounded-3xl p-0 border-border/70 bg-card/98 text-card-foreground shadow-2xl backdrop-blur-2xl'
      )}
    >
      {/* Collapsed Pill Button */}
      {!isOpen && (
        <div className='size-full flex items-center justify-between relative overflow-visible'>
          <div className='relative size-14 flex items-center justify-center shrink-0 overflow-visible'>
            <Plasma3DLogo size={isHovered ? 52 : 60} />
          </div>
          <div
            className={cn(
              'flex items-center justify-between flex-1 min-w-0 pl-1 pr-1.5 gap-2 transition-all duration-300',
              isHovered ? 'opacity-100 translate-x-0 max-w-44' : 'opacity-0 translate-x-2 max-w-0 pointer-events-none'
            )}
          >
            <span className='font-bold text-xs text-white tracking-tight truncate drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]'>
              {isAdmin ? 'Inbox Pasien' : 'Chat Klinik'}
            </span>
            <div className='flex items-center gap-1.5 shrink-0'>
              <kbd className='px-1.5 py-0.5 text-[9.5px] font-mono rounded bg-white/20 text-white border border-white/35'>
                ⌘K
              </kbd>
              <span className='flex size-2 rounded-full bg-emerald-400 ring-2 ring-white/70' />
            </div>
          </div>
          {!isHovered && (
            <span className='absolute top-1 right-1 flex size-2.5 pointer-events-none z-10'>
              <span className='relative inline-flex rounded-full size-2.5 bg-emerald-400 ring-2 ring-white/80' />
            </span>
          )}
        </div>
      )}

      {/* Expanded Modal Content */}
      {isOpen && (
        isAdmin ? (
          <ConsultationAdminView
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((prev) => !prev)}
            onClose={() => setIsOpen(false)}
          />
        ) : (
          <ConsultationExternalView
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((prev) => !prev)}
            onClose={() => setIsOpen(false)}
          />
        )
      )}
    </div>
  );
}
