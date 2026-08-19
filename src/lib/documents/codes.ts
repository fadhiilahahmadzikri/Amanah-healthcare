'use client';

import { toCanvas } from 'bwip-js/browser';
import QRCode from 'qrcode';

export type DocumentCodes = {
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
};

export async function generateDocumentCodes({
  qrText,
  barcodeText,
  barcodeHeight = 12
}: {
  qrText: string;
  barcodeText: string;
  barcodeHeight?: number;
}): Promise<DocumentCodes> {
  const [qrCodeDataUrl, barcodeDataUrl] = await Promise.all([
    QRCode.toDataURL(qrText, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180
    }),
    generateBarcodeDataUrl(barcodeText, barcodeHeight)
  ]);

  return { qrCodeDataUrl, barcodeDataUrl };
}

export function generateBarcodeDataUrl(text: string, height = 12): string {
  const canvas = document.createElement('canvas');

  toCanvas(canvas, {
    bcid: 'code128',
    text,
    scale: 2,
    height,
    includetext: true,
    textxalign: 'center'
  });

  return canvas.toDataURL('image/png');
}
