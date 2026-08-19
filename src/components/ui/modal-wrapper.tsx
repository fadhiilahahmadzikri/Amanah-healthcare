'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DismissableLayer } from 'radix-ui/internal';
import { Icons } from '@/components/icons';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  className?: string;
  portalContainer?: HTMLElement | null;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-[560px]',
  showCloseButton = false,
  className,
  portalContainer,
  portalContainerRef
}: ModalWrapperProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const handleClose = React.useCallback(() => {
    if (backdropRef.current && modalBoxRef.current) {
      gsap.to(modalBoxRef.current, {
        opacity: 0,
        scale: 0.96,
        y: 8,
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
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isOpen]);

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
        { opacity: 0, scale: 0.96, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: 'power3.out' }
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
    <DismissableLayer.Branch asChild>
      <div
        ref={backdropRef}
        data-slot='modal-wrapper'
        className='pointer-events-auto fixed inset-0 z-50 flex h-screen w-screen items-center justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-xs'
      >
        <button
          type='button'
          aria-label='Tutup modal'
          onClick={handleClose}
          className='absolute inset-0 cursor-default'
        />
        <div
          ref={modalBoxRef}
          role='dialog'
          aria-modal='true'
          className={cn(
            'relative z-10 my-auto w-full rounded-2xl border border-border/50 bg-card p-6 font-sans text-card-foreground shadow-2xl transition-[height] duration-300 ease-out sm:p-7',
            maxWidth,
            className
          )}
        >
          {showCloseButton && (
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
      </div>
    </DismissableLayer.Branch>,
    container
  );
}
