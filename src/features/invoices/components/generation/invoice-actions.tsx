'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { generateDocumentCodes, type DocumentCodes } from '@/lib/documents/codes';
import { printElementById } from '@/lib/documents/print-target';
import type { InvoiceDocumentData } from '../../api/types';
import { InvoiceDocument } from './invoice-document';

const PDFDownloadButton = dynamic(() => import('@/components/pdf/pdf-download-button'), {
  ssr: false
});

type InvoiceActionsProps = {
  data: InvoiceDocumentData;
  targetId: string;
  onCodesReady?: (codes: DocumentCodes) => void;
};

export function InvoiceActions({ data, targetId, onCodesReady }: InvoiceActionsProps) {
  const [codes, setCodes] = useState<DocumentCodes | null>(null);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsGeneratingCodes(true);

    generateDocumentCodes({
      qrText: data.codes.qrPayload,
      barcodeText: data.codes.barcodeValue
    })
      .then((generatedCodes) => {
        if (!isMounted) {
          return;
        }

        setCodes(generatedCodes);
        onCodesReady?.(generatedCodes);
      })
      .catch(() => {
        if (isMounted) {
          toast.error('Failed to generate invoice codes');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsGeneratingCodes(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [data.codes.barcodeValue, data.codes.qrPayload, onCodesReady]);

  const document = useMemo(
    () => (
      <InvoiceDocument
        data={data}
        qrCodeDataUrl={codes?.qrCodeDataUrl}
        barcodeDataUrl={codes?.barcodeDataUrl}
      />
    ),
    [codes?.barcodeDataUrl, codes?.qrCodeDataUrl, data]
  );

  const handlePrint = () => {
    try {
      printElementById(targetId, data.invoiceNumber);
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to print invoice');
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Invoice ${data.invoiceNumber}`);
    const body = encodeURIComponent(
      `Hello ${data.customer.name},\n\nYour invoice ${data.invoiceNumber} total is ${formatCurrency(data.totals.total)}.\n\nThis prototype opens email only; no SMTP message has been sent.`
    );

    window.location.href = `mailto:${data.customer.email ?? ''}?subject=${subject}&body=${body}`;
    toast.success('Email draft opened');
  };

  return (
    <div className='flex flex-wrap justify-end gap-2'>
      <Button type='button' variant='outline' onClick={handlePrint}>
        <Icons.post />
        Print
      </Button>
      {codes ? (
        <PDFDownloadButton
          document={document}
          fileName={`${data.invoiceNumber}.pdf`}
          buttonText='Export PDF'
          variant='outline'
        />
      ) : (
        <Button type='button' variant='outline' disabled isLoading={isGeneratingCodes}>
          <Icons.fileTypePdf />
          Export PDF
        </Button>
      )}
      <Button type='button' onClick={handleEmail}>
        <Icons.send />
        Send via Email
      </Button>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}
