import React, { useEffect, useState } from 'react';
import { X, Printer, FileDown, FileText, Check } from 'lucide-react';
import { PmbFormTemplate } from './templates/PmbFormTemplate';
import { ImunisasiFormTemplate } from './templates/ImunisasiFormTemplate';
import { RegulerFormTemplate } from './templates/RegulerFormTemplate';
import { exportPmbDocx, exportImunisasiDocx, exportRegulerDocx } from './services/docxExportService';
import { printDocument } from './services/printService';
import type { PmbFormData, ImunisasiFormData, RegulerFormData, ClinicalFormFlow } from './types';

export interface ClinicalDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: ClinicalFormFlow;
  pmbData?: PmbFormData | null;
  imunisasiData?: ImunisasiFormData | null;
  regulerData?: RegulerFormData | null;
}

export const ClinicalDocumentViewerModal: React.FC<ClinicalDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  flow,
  pmbData,
  imunisasiData,
  regulerData,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getFlowLabel = () => {
    switch (flow) {
      case 'pregnancy':
        return 'Persalinan (PMB ANC/KB)';
      case 'immunization':
        return 'Imunisasi Anak';
      case 'regular':
      default:
        return 'Poli Umum (Reguler)';
    }
  };

  const handlePrint = () => {
    const title = `Formulir-Klinis-${flow.toUpperCase()}`;
    printDocument(title);
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      if (flow === 'pregnancy') {
        const patientName = pmbData?.identity?.topRowValues?.[0]?.[0] || 'Pasien';
        await exportPmbDocx(pmbData, `Formulir_ANC_${patientName.replace(/\s+/g, '_')}.docx`);
      } else if (flow === 'immunization') {
        const childName = imunisasiData?.identity?.leftValues?.[0] || 'Anak';
        await exportImunisasiDocx(imunisasiData, `Formulir_Imunisasi_${childName.replace(/\s+/g, '_')}.docx`);
      } else {
        const patientName = regulerData?.identity?.fullName || 'Pasien';
        await exportRegulerDocx(regulerData, `Formulir_Rawat_Jalan_${patientName.replace(/\s+/g, '_')}.docx`);
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Error generating docx file:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/80 backdrop-blur-xs flex flex-col animate-in fade-in duration-200"
    >
      {/* Top Floating Control Bar (Hidden when printing) */}
      <header className="no-print h-14 bg-white/95 border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between shadow-xs shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Dokumen Klinis Resmi (A4 Canvas 1:1)
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                {getFlowLabel()}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Format 1:1 sesuai standar rekam medis fisik Klinik Amanah Healthcare
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-2xs"
            title="Cetak Dokumen (Print / PDF)"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span>Cetak / PDF</span>
          </button>

          {/* Download DOCX Button */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs disabled:opacity-60"
            title="Download Word (.docx)"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-white" />
                <span>{isExporting ? 'Memproses...' : 'Download Word'}</span>
              </>
            )}
          </button>

          <div className="w-[1px] h-6 bg-gray-200 mx-1" />

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Canvas Scroll Area (Gray canvas backdrop like PDF/Word reader) */}
      <main className="flex-1 overflow-y-auto bg-slate-200/90 p-4 sm:p-8 flex justify-center items-start">
        <div className="max-w-full">
          {flow === 'pregnancy' && <PmbFormTemplate data={pmbData} />}
          {flow === 'immunization' && <ImunisasiFormTemplate data={imunisasiData} />}
          {flow === 'regular' && <RegulerFormTemplate data={regulerData} />}
        </div>
      </main>
    </div>
  );
};
