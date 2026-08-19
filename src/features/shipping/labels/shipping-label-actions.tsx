'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { generateDocumentCodes, type DocumentCodes } from '@/lib/documents/codes';
import { printElementById } from '@/lib/documents/print-target';
import { ShippingLabelDocument } from './shipping-label-document';
import type { ShippingLabelData } from './types';

const PDFDownloadButton = dynamic(() => import('@/components/pdf/pdf-download-button'), {
  ssr: false
});

export function ShippingLabelActions({
  data,
  targetId,
  onCodesReady
}: {
  data: ShippingLabelData;
  targetId: string;
  onCodesReady: (codes: DocumentCodes) => void;
}) {
  const [codes, setCodes] = useState<DocumentCodes | null>(null);

  useEffect(() => {
    let isMounted = true;

    generateDocumentCodes({
      qrText: data.codes.qrPayload,
      barcodeText: data.codes.barcodeValue,
      barcodeHeight: 14
    })
      .then((generatedCodes) => {
        if (!isMounted) {
          return;
        }

        setCodes(generatedCodes);
        onCodesReady(generatedCodes);
      })
      .catch(() => {
        if (isMounted) {
          toast.error('Failed to generate shipping label codes');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [data.codes.barcodeValue, data.codes.qrPayload, onCodesReady]);

  const document = useMemo(
    () => (
      <ShippingLabelDocument
        data={data}
        qrCodeDataUrl={codes?.qrCodeDataUrl}
        barcodeDataUrl={codes?.barcodeDataUrl}
      />
    ),
    [codes?.barcodeDataUrl, codes?.qrCodeDataUrl, data]
  );

  const handlePrint = () => {
    try {
      printElementById(targetId, data.trackingNumber);
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to print shipping label');
    }
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
          fileName={`${data.trackingNumber}.pdf`}
          buttonText='Export PDF'
          variant='outline'
        />
      ) : (
        <Button type='button' variant='outline' disabled isLoading>
          <Icons.fileTypePdf />
          Export PDF
        </Button>
      )}
    </div>
  );
}
