'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { SwitchCamera, Flashlight, FlashlightOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IDetectedBarcode, IScannerHandle } from '@yudiel/react-qr-scanner';

const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner), {
  ssr: false
});

export interface PatientQrScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  isSubmitting?: boolean;
  paused?: boolean;
}

export function PatientQrScanner({
  onScan,
  onError,
  isSubmitting = false,
  paused = false
}: PatientQrScannerProps) {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const scannerHandleRef = useRef<IScannerHandle | null>(null);

  const checkTorchCapability = useCallback(() => {
    try {
      const stream = scannerHandleRef.current?.getStream();
      const track = stream?.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        const caps = track.getCapabilities() as { torch?: boolean };
        setIsTorchSupported(Boolean(caps?.torch));
      } else {
        setIsTorchSupported(false);
      }
    } catch {
      setIsTorchSupported(false);
    }
  }, []);

  const handleToggleTorch = useCallback(async () => {
    try {
      const stream = scannerHandleRef.current?.getStream();
      const track = stream?.getVideoTracks()[0];
      if (track && typeof track.applyConstraints === 'function') {
        const next = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: next } as unknown as MediaTrackConstraintSet]
        });
        setIsTorchOn(next);
      }
    } catch {
      setIsTorchOn(false);
    }
  }, [isTorchOn]);

  const handleSwitchCamera = useCallback(() => {
    setIsTorchOn(false);
    setIsTorchSupported(false);
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      checkTorchCapability();
    }, 1200);
    return () => clearInterval(timer);
  }, [checkTorchCapability, facingMode]);

  const handleDetected = (codes: IDetectedBarcode[]) => {
    if (isSubmitting || paused) return;
    if (codes && codes.length > 0) {
      const first = codes[0].rawValue;
      if (first && first.trim()) {
        try {
          navigator.vibrate?.(40);
        } catch {
          // Ignore vibration error on unsupported browsers
        }
        onScan(first.trim());
      }
    }
  };

  return (
    <div className='relative w-full h-full overflow-hidden rounded-none bg-black flex items-center justify-center select-none'>
      <Scanner
        ref={scannerHandleRef}
        constraints={{
          facingMode: { ideal: facingMode }
        }}
        formats={['qr_code']}
        allowMultiple={true}
        scanDelay={1200}
        paused={paused || isSubmitting}
        onScan={handleDetected}
        onError={(err) => {
          const msg = err instanceof Error ? err.message : String(err);
          onError?.(msg);
        }}
        components={{
          finder: false,
          torch: false
        }}
        styles={{
          container: {
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          },
          video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }
        }}
      />

      {/* Custom Viewfinder Reticle & Laser Overlay */}
      <div className='absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center'>
        <style>{`
          @keyframes qrScanLine {
            0% { top: 8%; opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { top: 92%; opacity: 0; }
          }
        `}</style>

        {/* Viewfinder Target Box with responsive sizing */}
        <div className='relative size-60 sm:size-64 max-w-[70vw] max-h-[70vw] aspect-square rounded-2xl'>
          {/* Outer Vignette Glow / Ring */}
          <div className='absolute -inset-1 rounded-2xl border border-white/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]' />

          {/* 4 Corner Targeting Brackets */}
          <span className='absolute -top-1 -left-1 size-6 border-t-3 border-l-3 border-primary rounded-tl-lg' />
          <span className='absolute -top-1 -right-1 size-6 border-t-3 border-r-3 border-primary rounded-tr-lg' />
          <span className='absolute -bottom-1 -left-1 size-6 border-b-3 border-l-3 border-primary rounded-bl-lg' />
          <span className='absolute -bottom-1 -right-1 size-6 border-b-3 border-r-3 border-primary rounded-br-lg' />

          {/* Animated Laser Scanning Line (runs when active and not paused) */}
          {!paused && !isSubmitting && (
            <div className='absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-[qrScanLine_2.4s_ease-in-out_infinite]' />
          )}
        </div>

        {/* Viewfinder Guidance Label */}
        <div className='mt-5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-medium tracking-wide shadow-md'>
          Arahkan kamera ke Kode QR Janji Temu
        </div>
      </div>

      {/* Floating Camera Controls (Torch & Flip) */}
      <div className='absolute top-3.5 right-14 z-30 flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg'>
        {isTorchSupported && (
          <button
            type='button'
            onClick={handleToggleTorch}
            className={cn(
              'size-7 rounded-full flex items-center justify-center transition-all cursor-pointer',
              isTorchOn
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            )}
            title={isTorchOn ? 'Matikan Senter' : 'Nyalakan Senter'}
            aria-label='Senter'
          >
            {isTorchOn ? (
              <Flashlight className='size-3.5 fill-current' />
            ) : (
              <FlashlightOff className='size-3.5' />
            )}
          </button>
        )}
        <button
          type='button'
          onClick={handleSwitchCamera}
          className='size-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer'
          title='Ganti Kamera Depan/Belakang'
          aria-label='Ganti Kamera'
        >
          <SwitchCamera className='size-3.5' />
        </button>
      </div>
    </div>
  );
}
