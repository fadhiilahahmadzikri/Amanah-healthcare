'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PmbFormTemplate } from './templates/PmbFormTemplate';
import { ImunisasiFormTemplate } from './templates/ImunisasiFormTemplate';
import { RegulerFormTemplate } from './templates/RegulerFormTemplate';
import {
  exportPmbDocx,
  exportImunisasiDocx,
  exportRegulerDocx
} from './services/docxExportService';
import { printDocument } from './services/printService';
import type { PmbFormData, ImunisasiFormData, RegulerFormData, ClinicalFormFlow } from './types';

export interface ClinicalDocumentFullscreenReaderProps {
  isOpen: boolean;
  onClose: () => void;
  flow: ClinicalFormFlow;
  pmbData?: PmbFormData | null;
  imunisasiData?: ImunisasiFormData | null;
  regulerData?: RegulerFormData | null;
}

export const ClinicalDocumentFullscreenReader: React.FC<ClinicalDocumentFullscreenReaderProps> = ({
  isOpen,
  onClose,
  flow,
  pmbData,
  imunisasiData,
  regulerData
}) => {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isHardwareFullscreen, setIsHardwareFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = useCallback(() => {
    const title = `Formulir-Klinis-${flow.toUpperCase()}`;
    printDocument(title);
  }, [flow]);

  // Lock body scroll while reader is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Sync hardware fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsHardwareFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1.0);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrint]);

  if (!isOpen || !mounted) return null;

  const handleZoomIn = () => {
    setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  const handleFitWidth = () => {
    if (!canvasRef.current) return;
    const availableWidth = canvasRef.current.clientWidth - 48;
    const a4PixelWidth = 794; // 210mm in standard screen CSS pixels
    const computedZoom = Math.min(
      1.8,
      Math.max(0.6, Number((availableWidth / a4PixelWidth).toFixed(2)))
    );
    setZoom(computedZoom);
  };

  const toggleHardwareFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsHardwareFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsHardwareFullscreen(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      if (flow === 'pregnancy') {
        const patientName = pmbData?.identity?.topRowValues?.[0]?.[0] || 'Pasien';
        await exportPmbDocx(pmbData, `Formulir_ANC_${patientName.replace(/\s+/g, '_')}.docx`);
      } else if (flow === 'immunization') {
        const childName = imunisasiData?.identity?.leftValues?.[0] || 'Anak';
        await exportImunisasiDocx(
          imunisasiData,
          `Formulir_Imunisasi_${childName.replace(/\s+/g, '_')}.docx`
        );
      } else {
        const patientName = regulerData?.identity?.fullName || 'Pasien';
        await exportRegulerDocx(
          regulerData,
          `Formulir_Rawat_Jalan_${patientName.replace(/\s+/g, '_')}.docx`
        );
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Error generating docx file:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const readerContent = (
    <div
      role='region'
      aria-label='PDF Document Fullscreen Reader'
      className='fixed inset-0 z-[99999] overflow-hidden bg-slate-950 flex flex-col font-sans select-none animate-in fade-in duration-200'
    >
      {/* Top Floating Control Bar (Hidden when printing) */}
      <header className='no-print relative h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between text-slate-100 shadow-xl shrink-0 select-none z-10'>
        {/* Left: Polosan (Clean & Plain) */}
        <div className='flex items-center min-w-0' />

        {/* Middle: PDF Reader Zoom Controls Dead-Center (Tengah Atas di Header) */}
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-700/60 shadow-xs z-20'>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            shape='rounded'
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className='text-slate-300 hover:text-white hover:bg-slate-700/70 size-7'
            title='Perkecil (-)'
            aria-label='Perkecil Zoom'
          >
            <Icons.zoomOut className='size-4' />
          </Button>

          <span className='text-xs font-mono font-medium text-slate-200 min-w-[44px] text-center select-none'>
            {Math.round(zoom * 100)}%
          </span>

          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            shape='rounded'
            onClick={handleZoomIn}
            disabled={zoom >= 2.0}
            className='text-slate-300 hover:text-white hover:bg-slate-700/70 size-7'
            title='Perbesar (+)'
            aria-label='Perbesar Zoom'
          >
            <Icons.zoomIn className='size-4' />
          </Button>

          <div className='w-[1px] h-4 bg-slate-700 mx-0.5' />

          <Button
            type='button'
            variant='ghost'
            size='sm'
            shape='rounded'
            onClick={handleResetZoom}
            className='h-7 px-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/70'
            title='Reset ke 100%'
            aria-label='Reset Zoom 100%'
          >
            100%
          </Button>

          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            shape='rounded'
            onClick={handleFitWidth}
            className='text-slate-300 hover:text-white hover:bg-slate-700/70 size-7'
            title='Sesuaikan Lebar Layar (Fit Width)'
            aria-label='Sesuaikan Lebar Layar'
          >
            <Icons.maximize className='size-3.5' />
          </Button>
        </div>

        {/* Right: Actions (Icon-only buttons with project's own Icons) */}
        <div className='flex items-center gap-1.5 ml-auto z-10'>
          {/* Hardware Fullscreen Toggle */}
          <Button
            type='button'
            variant='outline'
            size='icon-sm'
            shape='rounded'
            onClick={toggleHardwareFullscreen}
            className='border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white size-8'
            title={isHardwareFullscreen ? 'Keluar Layar Penuh (F11)' : 'Layar Penuh Monitor'}
            aria-label={isHardwareFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isHardwareFullscreen ? (
              <Icons.minimize className='size-4 text-slate-300' />
            ) : (
              <Icons.maximize className='size-4 text-slate-300' />
            )}
          </Button>

          {/* Print Button */}
          <Button
            type='button'
            variant='outline'
            size='icon-sm'
            shape='rounded'
            onClick={handlePrint}
            className='border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white size-8'
            title='Cetak Dokumen / Simpan PDF (Ctrl+P)'
            aria-label='Cetak Dokumen / Simpan PDF'
          >
            <Icons.printer className='size-4 text-slate-300' />
          </Button>

          {/* Download DOCX Button */}
          <Button
            type='button'
            variant='default'
            size='icon-sm'
            shape='rounded'
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className='bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/40 shadow-xs size-8'
            title={downloadSuccess ? 'Tersimpan!' : 'Download Dokumen Word (.docx)'}
            aria-label='Download Word'
          >
            {isExporting ? (
              <Icons.spinner className='size-4 text-white animate-spin' />
            ) : downloadSuccess ? (
              <Icons.check className='size-4 text-white' />
            ) : (
              <Icons.download className='size-4 text-white' />
            )}
          </Button>

          <div className='w-[1px] h-5 bg-slate-800 mx-1' />

          {/* Close / Back to Appointment Button */}
          <Button
            type='button'
            variant='destructive'
            size='icon-sm'
            shape='rounded'
            onClick={onClose}
            className='shadow-xs size-8'
            title='Tutup PDF Reader (Esc)'
            aria-label='Tutup PDF Reader'
          >
            <Icons.close className='size-4 text-white' />
          </Button>
        </div>
      </header>

      {/* Main Canvas Scroll Area (Slate PDF Reader Backdrop) */}
      <main
        ref={canvasRef}
        className='flex-1 overflow-auto bg-[#1a1f26] p-4 sm:p-10 flex justify-center items-start scroll-smooth'
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            marginBottom: zoom > 1 ? `${(zoom - 1) * 310}mm` : '2.5rem'
          }}
          className='max-w-full drop-shadow-2xl'
        >
          {flow === 'pregnancy' && <PmbFormTemplate data={pmbData} />}
          {flow === 'immunization' && <ImunisasiFormTemplate data={imunisasiData} />}
          {flow === 'regular' && <RegulerFormTemplate data={regulerData} />}
        </div>
      </main>
    </div>
  );

  return createPortal(readerContent, document.body);
};
