/**
 * generate-codes.ts
 *
 * Mengubah teks (link pembayaran, nomor invoice) jadi data URI gambar
 * yang bisa langsung dipakai komponen <Image> dari @react-pdf/renderer.
 *
 * Kenapa dipisah dari InvoiceDocument.tsx?
 * @react-pdf/renderer me-render PDF secara sinkron-ish dari tree komponen,
 * sementara generate QR/barcode itu proses async. Jadi kita siapkan dulu
 * data URI-nya SEBELUM memanggil renderToBuffer(), bukan generate di
 * dalam komponennya.
 */

import QRCode from 'qrcode';
import bwipjs from 'bwip-js/node';

/**
 * Generate QR code sebagai data URI PNG.
 * Cocok untuk: link pembayaran, link verifikasi invoice, link tracking resi.
 */
export async function generateQrDataUri(
  text: string,
  options?: { width?: number }
): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: options?.width ?? 200,
    errorCorrectionLevel: 'M'
  });
}

/**
 * Generate barcode Code128 sebagai data URI PNG.
 * Cocok untuk: nomor invoice, nomor transaksi, SKU.
 *
 * Code128 dipilih karena bisa encode huruf+angka (cocok untuk format
 * nomor invoice seperti "INV-2026-0007"). Kalau perlu format lain
 * (EAN13 untuk produk retail, PDF417, dll), tinggal ganti `bcid`.
 * Daftar lengkap symbology bwip-js: https://github.com/metafloor/bwip-js
 */
export async function generateBarcodeDataUri(
  text: string,
  options?: { bcid?: string }
): Promise<string> {
  const buffer = await bwipjs.toBuffer({
    bcid: options?.bcid ?? 'code128',
    text,
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: 'center'
  });
  return 'data:image/png;base64,' + buffer.toString('base64');
}
