'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { TrayTrigger } from '../atoms/tray-trigger';
import { TrayHeader } from '../molecules/tray-header';
import { TrayNavList } from '../molecules/tray-nav-list';
import type { SideTrayProps } from '../side-tray.types';

export function SideTray<T extends string = string>({
  items,
  activeKey,
  onSelect,
  title = 'Kategori',
  defaultExpanded = false,
  defaultPinned = false,
  isExpanded: controlledExpanded,
  isPinned: controlledPinned,
  onExpandedChange,
  onPinnedChange,
  width = 280,
  mode = 'auto',
  hoverToPeek = true,
  showPinButton = true,
  className,
  triggerAriaLabel,
  headerSlot,
  footerSlot
}: SideTrayProps<T>) {
  const { isOpen: isMobile } = useMediaQuery('(max-width: 1023px)');
  const effectiveMode = mode === 'auto' ? (isMobile ? 'overlay' : 'push') : mode;
  const isOverlay = effectiveMode === 'overlay';

  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const [internalPinned, setInternalPinned] = React.useState(defaultPinned);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const isPinned = controlledPinned !== undefined ? controlledPinned : internalPinned;

  const setExpanded = React.useCallback(
    (val: boolean) => {
      setInternalExpanded(val);
      onExpandedChange?.(val);
    },
    [onExpandedChange]
  );

  const setPinned = React.useCallback(
    (val: boolean) => {
      setInternalPinned(val);
      onPinnedChange?.(val);
    },
    [onPinnedChange]
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  const traySurfaceRef = React.useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear hover timeout on unmount
  React.useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  // Hover-to-peek handlers (desktop push mode only)
  const handleMouseEnter = React.useCallback(() => {
    if (!hoverToPeek || isOverlay) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (!isExpanded) {
      setExpanded(true);
    }
  }, [hoverToPeek, isOverlay, isExpanded, setExpanded]);

  const handleMouseMove = React.useCallback(() => {
    if (!hoverToPeek || isOverlay) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, [hoverToPeek, isOverlay]);

  const handleMouseLeave = React.useCallback(() => {
    if (!hoverToPeek || isOverlay || isPinned) return;
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);

    leaveTimeoutRef.current = setTimeout(() => {
      setExpanded(false);
    }, 350); // 350ms stable grace period so user moving across items doesn't cause flicker
  }, [hoverToPeek, isOverlay, isPinned, setExpanded]);

  // Click trigger handler: toggle expand and pin
  const handleTriggerClick = React.useCallback(() => {
    if (isOverlay) {
      setExpanded(!isExpanded);
      return;
    }

    if (isPinned) {
      setPinned(false);
      setExpanded(false);
    } else {
      setExpanded(true);
      setPinned(true);
    }
  }, [isOverlay, isPinned, isExpanded, setExpanded, setPinned]);

  const handleTogglePin = React.useCallback(() => {
    setPinned(!isPinned);
  }, [isPinned, setPinned]);

  const handleClose = React.useCallback(() => {
    setPinned(false);
    setExpanded(false);
  }, [setExpanded, setPinned]);

  const handleItemSelect = React.useCallback(
    (key: T) => {
      onSelect(key);
      if (isOverlay) {
        setExpanded(false);
      }
    },
    [isOverlay, onSelect, setExpanded]
  );

  // Smooth entrance animation for surface content when expanded
  React.useEffect(() => {
    if (traySurfaceRef.current && isExpanded) {
      gsap.fromTo(
        traySurfaceRef.current,
        { opacity: 0.6, x: 8 },
        { opacity: 1, x: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
  }, [isExpanded]);

  const totalCount = React.useMemo(() => {
    return items.reduce((acc, curr) => acc + (typeof curr.count === 'number' ? curr.count : 0), 0);
  }, [items]);

  const trayWidth = typeof width === 'number' ? `${width}px` : width;

  // Floating Overlay Mode for Mobile/Tablet (< 1024px) or Overlay Builder
  if (isOverlay) {
    if (!isClient || typeof document === 'undefined') {
      return null;
    }

    return createPortal(
      <>
        {/* Floating Trigger Handle (visible when collapsed) */}
        {!isExpanded && (
          <div className='fixed top-40 right-0 z-[60]'>
            <TrayTrigger
              isExpanded={false}
              isPinned={false}
              onClick={handleTriggerClick}
              ariaLabel={triggerAriaLabel}
            />
          </div>
        )}

        {/* Floating Backdrop Overlay (outside dismissal) */}
        {isExpanded && (
          <div
            className='fixed inset-0 bg-background/60 backdrop-blur-xs z-[70] transition-opacity duration-300'
            onClick={handleClose}
            aria-hidden='true'
          />
        )}

        {/* Floating Drawer (slides out over content without compressing cards) */}
        <aside
          ref={traySurfaceRef}
          aria-label={title}
          className={cn(
            'fixed inset-y-0 right-0 z-[70] w-72 sm:w-80 h-full max-h-screen flex flex-col bg-card/98 text-card-foreground border-l border-border/80 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 ease-out',
            isExpanded
              ? 'translate-x-0 opacity-100 visible pointer-events-auto'
              : 'translate-x-full opacity-0 invisible pointer-events-none'
          )}
        >
          {headerSlot || (
            <TrayHeader
              title={title}
              totalCount={totalCount}
              isPinned={false}
              onClose={handleClose}
              showPinButton={false}
            />
          )}

          <TrayNavList items={items} activeKey={activeKey} onSelect={handleItemSelect} />

          {footerSlot && (
            <div className='p-3 border-t border-border/40 shrink-0 bg-muted/20'>{footerSlot}</div>
          )}
        </aside>
      </>,
      document.body
    );
  }

  // Push Mode for Desktop (>= 1024px)
  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative shrink-0 flex flex-col h-full select-none transition-[width] duration-300 ease-out z-20',
        className
      )}
      style={{ width: isExpanded ? trayWidth : '0px' }}
    >
      {/* Floating Trigger Handle anchored on left of tray surface, layered BEHIND panel */}
      <div className='absolute top-4 -left-7 z-10'>
        <TrayTrigger
          isExpanded={isExpanded}
          isPinned={isPinned}
          onClick={handleTriggerClick}
          onMouseEnter={handleMouseEnter}
          ariaLabel={triggerAriaLabel}
        />
      </div>

      {/* Tray Surface Drawer (Slides out in front of lip with z-20) */}
      <aside
        ref={traySurfaceRef}
        aria-label={title}
        className={cn(
          'relative z-20 h-full flex flex-col min-h-0 bg-card/95 text-card-foreground border border-border/70 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 ease-out',
          isExpanded
            ? 'opacity-100 visible w-full pointer-events-auto'
            : 'opacity-0 invisible w-0 pointer-events-none'
        )}
        style={{ width: isExpanded ? trayWidth : '0px' }}
      >
        {/* Header Slot or Default TrayHeader */}
        {headerSlot || (
          <TrayHeader
            title={title}
            totalCount={totalCount}
            isPinned={isPinned}
            onTogglePin={handleTogglePin}
            onClose={handleClose}
            showPinButton={showPinButton}
          />
        )}

        {/* Agnostic Navigation List */}
        <TrayNavList items={items} activeKey={activeKey} onSelect={handleItemSelect} />

        {/* Optional Footer Slot */}
        {footerSlot && (
          <div className='p-3 border-t border-border/40 shrink-0 bg-muted/20'>{footerSlot}</div>
        )}
      </aside>
    </div>
  );
}
