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
}

export function PatientQrScanner({ onScan, onError, isSubmitting = false }: PatientQrScannerProps) {
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
          advanced: [{ torch: next } as any]
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
    if (isSubmitting) return;
    if (codes && codes.length > 0) {
      const first = codes[0].rawValue;
      if (first) {
        onScan(first);
      }
    }
  };

  return (
    <div className='relative w-full h-full overflow-hidden rounded-2xl bg-black flex items-center justify-center'>
      <Scanner
        ref={scannerHandleRef}
        constraints={{
          facingMode: { ideal: facingMode }
        }}
        onScan={handleDetected}
        onError={(err) => {
          const msg = err instanceof Error ? err.message : String(err);
          onError?.(msg);
        }}
        components={{
          finder: true,
          torch: false
        }}
        styles={{
          container: {
            width: '100%',
            height: '100%',
            borderRadius: '1rem',
            overflow: 'hidden'
          },
          video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }
        }}
      />

      <div className='absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg'>
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
