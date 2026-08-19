/**
 * app/api/invoice/[id]/route.ts
 *
 * Route Handler yang generate invoice PDF di server lalu mengirimkannya
 * sebagai response. Tidak ada react-pdf yang jalan di browser sama
 * sekali di pendekatan ini — jadi tidak perlu "use client" atau
 * dynamic import ssr:false di mana pun. Itu hanya dibutuhkan kalau user
 * juga mau tombol "Download PDF" / preview PDF langsung di browser
 * (lewat <PDFDownloadLink> atau <PDFViewer>), yang merupakan fitur
 * terpisah dari endpoint ini.
 *
 * Ganti getInvoiceById() dengan query database/ORM asli (Prisma, Drizzle,
 * dll). Bagian render PDF di bawahnya bisa dipertahankan apa adanya.
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument, type InvoiceData } from './InvoiceDocument';
import { generateQrDataUri, generateBarcodeDataUri } from './generate-codes';

// Route Handler ini file .ts biasa (bukan .tsx), jadi elemen React dibuat
// lewat React.createElement, bukan sintaks JSX <Tag />.

// --- Ganti dengan query data invoice yang sesungguhnya ---
async function getInvoiceById(id: string) {
  return {
    invoiceNumber: id,
    issueDate: '20 Juni 2026',
    dueDate: '27 Juni 2026',
    seller: {
      name: 'Toko Maju Jaya',
      address: 'Jl. Contoh No. 123, Bandung',
      taxId: '01.234.567.8-901.000'
    },
    buyer: {
      name: 'PT Klien Sejahtera',
      address: 'Jl. Pelanggan No. 45, Jakarta'
    },
    items: [{ description: 'Jasa konsultasi - Juni 2026', qty: 1, unitPrice: 1_250_000 }],
    paymentUrl: `https://pay.example.com/invoice/${id}`
  };
}
// ----------------------------------------------------------

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const invoice = await getInvoiceById(params.id);

  if (!invoice) {
    return new Response('Invoice tidak ditemukan', { status: 404 });
  }

  const [qrDataUri, barcodeDataUri] = await Promise.all([
    generateQrDataUri(invoice.paymentUrl),
    generateBarcodeDataUri(invoice.invoiceNumber)
  ]);

  const invoiceData: InvoiceData = {
    ...invoice,
    qrDataUri,
    barcodeDataUri
  };

  // @react-pdf/renderer mengetik renderToBuffer() supaya hanya menerima
  // elemen <Document> langsung (React.ReactElement<DocumentProps>).
  // InvoiceDocument adalah komponen pembungkus kita sendiri, jadi secara
  // tipe TS tidak otomatis dianggap cocok meskipun yang dikembalikan
  // tetap <Document> di dalamnya. Ini aman di-cast karena di runtime
  // memang itulah yang terjadi.
  const pdfBuffer = await renderToBuffer(
    React.createElement(InvoiceDocument, { data: invoiceData }) as unknown as Parameters<
      typeof renderToBuffer
    >[0]
  );

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      // Ganti ke "attachment" kalau mau browser langsung download
      // alih-alih menampilkan PDF inline.
      'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`
    }
  });
}
