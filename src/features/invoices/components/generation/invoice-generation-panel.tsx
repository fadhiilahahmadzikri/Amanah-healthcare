'use client';

import { useCallback, useMemo, useState } from 'react';

import { AdaptiveSheet } from '@/components/sheets/adaptive-sheet';
import type { DocumentCodes } from '@/lib/documents/codes';
import type { InvoiceDocumentData } from '../../api/types';
import { InvoiceActions } from './invoice-actions';
import { InvoicePreview } from './invoice-preview';

export function InvoiceGenerationPanel({ invoice }: { invoice: InvoiceDocumentData }) {
  const [codes, setCodes] = useState<DocumentCodes | null>(null);
  const targetId = useMemo(() => `invoice-preview-${invoice.id}`, [invoice.id]);
  const handleCodesReady = useCallback((nextCodes: DocumentCodes) => {
    setCodes(nextCodes);
  }, []);

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1 overflow-auto p-4'>
        <InvoicePreview
          data={invoice}
          targetId={targetId}
          isPrinting={true}
          qrCodeDataUrl={codes?.qrCodeDataUrl}
          barcodeDataUrl={codes?.barcodeDataUrl}
        />
      </div>
      <div className='border-t border-sidebar-border bg-sidebar p-4'>
        <InvoiceActions data={invoice} targetId={targetId} onCodesReady={handleCodesReady} />
      </div>
    </div>
  );
}
