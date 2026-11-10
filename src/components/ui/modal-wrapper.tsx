'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '@/components/icons';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  dismissible?: boolean;
  className?: string;
  backdropClassName?: string;
  portalContainer?: HTMLElement | null;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  attachedAside?: React.ReactNode;
  canvasMode?: boolean;
}

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-[560px]',
  showCloseButton = false,
  dismissible = true,
  className,
  backdropClassName,
  portalContainer,
  portalContainerRef,
  attachedAside,
  canvasMode = false
}: ModalWrapperProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const handleClose = React.useCallback(() => {
    if (!dismissible) {
      return;
    }

    if (backdropRef.current && modalBoxRef.current) {
      gsap.to(modalBoxRef.current, {
        opacity: 0,
        scale: 0.97,
        duration: 0.18,
        ease: 'power2.in'
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  }, [dismissible, onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!dismissible) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissible, handleClose, isOpen]);

  useEffect(() => {
    if (isOpen && backdropRef.current && modalBoxRef.current) {
      document.body.style.overflow = 'hidden';

      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' }
      );

      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.24, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const container = portalContainer ?? portalContainerRef?.current ?? document.body;

  return createPortal(
    <div
      ref={backdropRef}
      data-slot='modal-wrapper'
      className={cn(
        'pointer-events-auto fixed inset-0 z-50 flex h-[100dvh] w-full items-center justify-center p-4 sm:p-6 backdrop-blur-xs select-none',
        canvasMode
          ? 'bg-background/90 bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_12%,transparent)_1px,transparent_1px)] [background-size:20px_20px]'
          : 'bg-gradient-to-b from-black/0 via-black/45 to-black/85',
        backdropClassName
      )}
    >
      {dismissible && (
        <button
          type='button'
          aria-label='Tutup modal'
          onClick={handleClose}
          className='absolute inset-0 cursor-default'
        />
      )}

      {attachedAside ? (
        <div
          className={cn(
            'pointer-events-none relative z-10 m-0 flex w-full justify-center gap-3',
            canvasMode ? 'max-w-[1440px] items-stretch px-2 sm:px-4' : 'max-w-full items-center'
          )}
        >
          <div
            ref={modalBoxRef}
            role='dialog'
            aria-modal='true'
            className={cn(
              'pointer-events-auto relative w-full rounded-2xl border border-border/50 bg-card p-6 font-sans text-card-foreground shadow-2xl transition-[max-width,width,max-height,height] duration-300 ease-out sm:p-7 overflow-hidden',
              maxWidth,
              className
            )}
          >
            {dismissible && showCloseButton && (
              <button
                type='button'
                onClick={handleClose}
                aria-label='Tutup modal'
                className='absolute top-4 right-4 z-20 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
              >
                <Icons.close className='size-4' />
              </button>
            )}
            {children}
          </div>
          <div className='pointer-events-auto shrink-0 flex items-stretch'>
            {attachedAside}
          </div>
        </div>
      ) : (
        <div
          ref={modalBoxRef}
          role='dialog'
          aria-modal='true'
          className={cn(
            'relative z-10 m-0 w-full rounded-2xl border border-border/50 bg-card p-6 font-sans text-card-foreground shadow-2xl transition-[max-width,width,max-height,height] duration-300 ease-out sm:p-7 overflow-hidden',
            maxWidth,
            className
          )}
        >
          {dismissible && showCloseButton && (
            <button
              type='button'
              onClick={handleClose}
              aria-label='Tutup modal'
              className='absolute top-4 right-4 z-20 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            >
              <Icons.close className='size-4' />
            </button>
          )}
          {children}
        </div>
      )}
    </div>,
    container
  );
}
