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
  className?: string;
}

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-[560px]',
  showCloseButton = false,
  className
}: ModalWrapperProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

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
  }, [isOpen]);

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

  const handleClose = () => {
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
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      handleClose();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs overflow-y-auto w-screen h-screen'
      role='dialog'
      aria-modal='true'
    >
      <div
        ref={modalBoxRef}
        className={cn(
          'relative my-auto w-full rounded-2xl border border-border/50 bg-card text-card-foreground p-6 sm:p-7 shadow-2xl transition-[height] duration-300 ease-out font-sans',
          maxWidth,
          className
        )}
      >
        {showCloseButton && (
          <button
            type='button'
            onClick={handleClose}
            aria-label='Tutup modal'
            className='absolute top-4 right-4 z-20 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer'
          >
            <Icons.close className='size-4' />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
