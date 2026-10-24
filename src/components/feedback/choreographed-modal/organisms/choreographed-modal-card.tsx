'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { ChoreographyStyleAtom } from '../atoms/choreography-styles';
import { SunburstRaysAtom } from '../atoms/sunburst-rays';
import { HeroBadgeMolecule } from '../molecules/hero-badge';
import { ModalTypographyMolecule } from '../molecules/modal-typography';
import { ModalIdentityCard } from '../molecules/modal-identity-card';
import { ModalActionsMolecule } from '../molecules/modal-actions';
import { useConfettiCannon } from '../use-confetti-cannon';
import { useNotificationModalStore } from '../model/notification-modal-store';

export function ChoreographedNotificationModal() {
  const { isOpen, payload, animationKey, closeModal } = useNotificationModalStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const variant = payload?.variant || 'success';
  const choreography = payload?.choreography || 'classic';

  // Run confetti cannon physics simulation
  useConfettiCannon(canvasRef, variant, animationKey, variant === 'reward' ? 85 : 65);

  // Keyboard navigation: ESC to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Compute modern OKLCH CSS variables honoring the active theme
  const themeVars = useMemo(() => {
    switch (variant) {
      case 'info':
        return {
          '--theme-primary': 'var(--info, #0284c7)',
          '--theme-badge-bg': 'var(--info, #0284c7)',
          '--theme-pill-bg': 'var(--info-subtle, rgba(2, 132, 199, 0.12))',
          '--theme-pill-text': 'var(--info, #0284c7)',
          '--theme-pill-border': 'var(--info-border, rgba(2, 132, 199, 0.25))',
          '--theme-ray': 'color-mix(in oklch, var(--info, #0284c7) 12%, transparent)',
          '--theme-shadow': 'color-mix(in oklch, var(--info, #0284c7) 28%, transparent)'
        } as React.CSSProperties;

      case 'warning':
        return {
          '--theme-primary': 'var(--warning, #d97706)',
          '--theme-badge-bg': 'var(--warning, #d97706)',
          '--theme-pill-bg': 'var(--warning-subtle, rgba(217, 119, 6, 0.12))',
          '--theme-pill-text': 'var(--warning, #d97706)',
          '--theme-pill-border': 'var(--warning-border, rgba(217, 119, 6, 0.25))',
          '--theme-ray': 'color-mix(in oklch, var(--warning, #d97706) 12%, transparent)',
          '--theme-shadow': 'color-mix(in oklch, var(--warning, #d97706) 28%, transparent)'
        } as React.CSSProperties;

      case 'error':
        return {
          '--theme-primary': 'var(--destructive, #e11d48)',
          '--theme-badge-bg': 'var(--destructive, #e11d48)',
          '--theme-pill-bg': 'var(--destructive-subtle, rgba(225, 29, 72, 0.12))',
          '--theme-pill-text': 'var(--destructive, #e11d48)',
          '--theme-pill-border': 'var(--destructive-border, rgba(225, 29, 72, 0.25))',
          '--theme-ray': 'color-mix(in oklch, var(--destructive, #e11d48) 12%, transparent)',
          '--theme-shadow': 'color-mix(in oklch, var(--destructive, #e11d48) 28%, transparent)'
        } as React.CSSProperties;

      case 'reward':
        return {
          '--theme-primary': 'var(--status-completed, var(--primary))',
          '--theme-badge-bg': 'var(--status-completed, var(--primary))',
          '--theme-pill-bg': 'var(--status-completed-subtle, var(--primary-subtle))',
          '--theme-pill-text': 'var(--status-completed, var(--primary))',
          '--theme-pill-border': 'var(--status-completed-border, var(--border))',
          '--theme-ray':
            'color-mix(in oklch, var(--status-completed, var(--primary)) 14%, transparent)',
          '--theme-shadow':
            'color-mix(in oklch, var(--status-completed, var(--primary)) 28%, transparent)'
        } as React.CSSProperties;

      case 'success':
      default:
        return {
          '--theme-primary': 'var(--success, #16a34a)',
          '--theme-badge-bg': 'var(--success, #16a34a)',
          '--theme-pill-bg': 'var(--success-subtle, rgba(22, 163, 74, 0.12))',
          '--theme-pill-text': 'var(--success, #16a34a)',
          '--theme-pill-border': 'var(--success-border, rgba(22, 163, 74, 0.25))',
          '--theme-ray': 'color-mix(in oklch, var(--success, #16a34a) 12%, transparent)',
          '--theme-shadow': 'color-mix(in oklch, var(--success, #16a34a) 28%, transparent)'
        } as React.CSSProperties;
    }
  }, [variant]);

  if (!isOpen || !payload) return null;

  const handlePrimary = () => {
    payload.onPrimaryAction?.();
    closeModal();
  };

  const handleSecondary = () => {
    payload.onSecondaryAction?.();
    closeModal();
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      style={themeVars}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none'
    >
      <ChoreographyStyleAtom />

      {/* Backdrop with smooth blur (outside click to dismiss) */}
      <div
        onClick={closeModal}
        className='fixed inset-0 bg-background/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in'
        aria-hidden='true'
      />

      {/* Main Choreographed Modal Card */}
      <div
        key={animationKey}
        className={`modal-choreographed-enter choreo-${choreography} relative z-10 w-full max-w-[380px] bg-card text-card-foreground rounded-[32px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.45)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-border/80 p-6 pt-9 pb-7 flex flex-col items-center text-center`}
      >
        {/* Real Physics Confetti Canvas Cannon */}
        <canvas
          ref={canvasRef}
          className='absolute inset-0 size-full pointer-events-none z-40'
          aria-hidden='true'
        />

        {/* Rotating Sunburst Silhouette Rays */}
        <SunburstRaysAtom />

        {/* Top-Right Close Button */}
        <button
          type='button'
          onClick={closeModal}
          aria-label='Tutup dialog'
          className='absolute top-4 right-4 z-30 size-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer'
        >
          <Icons.close className='size-4' />
        </button>

        {/* Modal Body Composition */}
        <div className='relative z-10 w-full flex flex-col items-center'>
          <HeroBadgeMolecule iconType={variant === 'reward' ? 'reward' : variant === 'error' ? 'error' : variant === 'warning' ? 'warning' : variant === 'info' ? 'info' : 'check'} />

          <ModalTypographyMolecule
            statusText={payload.statusText}
            title={payload.title}
            subtitle={payload.subtitle}
          />

          {/* Agnostic Identity Slot (Staff/Doctor avatar, name, specialty) */}
          <ModalIdentityCard identity={payload.identity} />

          {/* Action Buttons */}
          <ModalActionsMolecule
            primaryLabel={payload.primaryBtnText || 'Selesai'}
            secondaryLabel={payload.secondaryBtnText}
            onPrimary={handlePrimary}
            onSecondary={handleSecondary}
          />
        </div>
      </div>
    </div>
  );
}
