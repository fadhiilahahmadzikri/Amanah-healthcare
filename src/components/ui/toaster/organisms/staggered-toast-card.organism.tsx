'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ToastPreLayers } from '../atoms/toast-pre-layers.atom';
import { ToastCloseButton } from '../atoms/toast-close-button.atom';
import { ToastMedia } from '../molecules/toast-media.molecule';
import { ToastContent } from '../molecules/toast-content.molecule';
import { ToastActions } from '../molecules/toast-actions.molecule';
import { getToastColors } from '../constants/toast-colors.oklch';
import type { StaggeredToastProps } from '../types';

const LAYER_PEEK_PX = 10;

export interface StaggeredToastCardProps extends StaggeredToastProps {
  isDark?: boolean;
}

export const StaggeredToastCard: React.FC<StaggeredToastCardProps> = ({
  id,
  type = 'default',
  title,
  description,
  icon,
  avatar,
  duration = 4000,
  dismissible = true,
  action,
  cancel,
  extraAction,
  customContent,
  className = '',
  isDark = false,
  onClick,
  onDismiss
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTlRef = useRef<gsap.core.Timeline | null>(null);
  const busyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingTimeRef = useRef<number>(duration);
  const startTimeRef = useRef<number>(Date.now());

  const colors = getToastColors(type, isDark);
  const layers = [colors.layer1, colors.layer2];
  const totalLayers = layers.length;
  const totalPeek = totalLayers * LAYER_PEEK_PX;

  // Callback to play smooth exit animation
  const playClose = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    // Clear auto-dismiss timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const content = contentRef.current;
    const preLayers = preLayerElsRef.current;

    if (!panel) {
      onDismiss(id);
      return;
    }

    closeTlRef.current?.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        busyRef.current = false;
        onDismiss(id);
      }
    });

    // 1. Fade out content quickly
    if (content) {
      tl.to(content, { opacity: 0, duration: 0.15, ease: 'power2.in' }, 0);
    }

    // 2. Main panel slides out first to the right
    tl.to(panel, { xPercent: 110, x: 0, duration: 0.35, ease: 'power3.in' }, 0.05);

    // 3. Pre-layers slide out in reverse order (reverted stagger)
    const reversedPreLayers = preLayers.toReversed();
    reversedPreLayers.forEach((el, i) => {
      tl.to(
        el,
        { xPercent: 110, x: 0, duration: 0.35, ease: 'power3.in' },
        0.1 + i * 0.07
      );
    });

    closeTlRef.current = tl;
  }, [id, onDismiss]);

  // Handle timer with pause/resume on hover
  const startTimer = useCallback(
    (timeMs: number) => {
      if (timeMs <= 0 || timeMs === Infinity || type === 'loading') return;
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(playClose, timeMs);
    },
    [playClose, type]
  );

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (remainingTimeRef.current > 0) {
      startTimer(remainingTimeRef.current);
    }
  }, [startTimer]);

  useEffect(() => {
    startTimer(duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, startTimer]);

  // Entrance animation setup
  useEffect(() => {
    let ctx: gsap.Context | null = null;
    if (wrapperRef.current) {
      ctx = gsap.context(() => {
        const panel = panelRef.current;
        const wrapper = wrapperRef.current;
        const content = contentRef.current;
        if (!panel || !wrapper || !content) return;

        const preLayers = Array.from(
          wrapper.querySelectorAll('.st-prelayer')
        ) as HTMLElement[];
        preLayerElsRef.current = preLayers;

        const offscreen = 110;

        // Set initial state
        gsap.set(panel, { xPercent: offscreen, opacity: 1 });
        preLayers.forEach((el) => {
          gsap.set(el, { xPercent: offscreen, opacity: 1 });
        });
        gsap.set(content, { opacity: 0 });

        // Build stagger entrance timeline
        const tl = gsap.timeline();

        // Pre-layers slide in first, peeking out to negative X
        preLayers.forEach((el, i) => {
          const peekOffset = -(totalLayers - i) * LAYER_PEEK_PX;
          tl.to(
            el,
            { xPercent: 0, x: peekOffset, duration: 0.5, ease: 'power4.out' },
            i * 0.07
          );
        });

        // Panel slides in after layers
        const lastTime = preLayers.length ? (preLayers.length - 1) * 0.07 : 0;
        const panelInsertTime = lastTime + (preLayers.length ? 0.08 : 0);
        const panelDuration = 0.65;

        tl.to(
          panel,
          { xPercent: 0, x: 0, duration: panelDuration, ease: 'power4.out' },
          panelInsertTime
        );

        // Content fades in as panel arrives
        const contentStart = panelInsertTime + panelDuration * 0.15;
        tl.to(content, { opacity: 1, duration: 0.4, ease: 'power2.out' }, contentStart);

        openTlRef.current = tl;
      }, wrapperRef);
    }

    return () => {
      openTlRef.current?.kill();
      closeTlRef.current?.kill();
      try {
        ctx?.revert();
      } catch {
        // Safe catch for React unmount race condition
      }
    };
  }, [totalLayers]);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role='status'
      aria-live='polite'
      className={`relative w-full pointer-events-auto transition-transform ${className}`}
      style={{ paddingLeft: `${totalPeek}px` }}
    >
      {/* Decorative Pre-layers */}
      <ToastPreLayers layers={layers} totalPeekPx={totalPeek} />

      {/* Main Staggered Panel */}
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={panelRef}
        role={onClick ? 'button' : 'status'}
        tabIndex={onClick ? 0 : undefined}
        onClick={(e) => {
          if (!onClick) return;
          if ((e.target as HTMLElement).closest('button')) return;
          onClick();
        }}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === 'Enter' || e.key === ' ') {
            if ((e.target as HTMLElement).closest('button')) return;
            e.preventDefault();
            onClick();
          }
        }}
        className={`relative flex items-center gap-3 rounded-xl px-4 py-3.5 shadow-lg border ${
          onClick ? 'cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring' : ''
        }`}
        style={{
          zIndex: totalLayers + 1,
          backgroundColor: colors.panelBg,
          borderColor: colors.panelBorder,
          color: colors.textColor
        }}
      >
        <div ref={contentRef} className='flex flex-1 items-start sm:items-center gap-3 min-w-0 opacity-0'>
          {customContent ? (
            customContent
          ) : (
            <>
              {/* Media / Icon / Avatar */}
              <ToastMedia
                avatar={avatar}
                icon={icon}
                type={type}
                iconColor={colors.iconColor}
              />

              {/* Title & Description with graceful wrapping */}
              <ToastContent
                title={title}
                description={description}
                textColor={colors.textColor}
                descriptionColor={colors.descriptionColor}
              />

              {/* Actions & Cancel */}
              <ToastActions
                action={action}
                cancel={cancel}
                textColor={colors.textColor}
              />

              {/* Extra Action (e.g. status pill or badge) */}
              {extraAction && (
                <div className='shrink-0 self-start sm:self-center'>{extraAction}</div>
              )}
            </>
          )}
        </div>

        {/* Close Button */}
        {dismissible && (
          <ToastCloseButton
            onClick={playClose}
            color={colors.textColor}
          />
        )}
      </div>
    </div>
  );
};
