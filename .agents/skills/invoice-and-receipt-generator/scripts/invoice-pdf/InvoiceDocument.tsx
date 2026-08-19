/**
 * InvoiceDocument.tsx
 *
 * Layout invoice sebagai komponen @react-pdf/renderer. Ini KOMPONEN
 * SERVER-SIDE biasa — bukan client component, dan tidak butuh "use client".
 * Dia hanya dipakai lewat renderToBuffer()/renderToStream() di dalam
 * route.ts, bukan di-render langsung di browser.
 *
 * Sesuaikan struktur InvoiceData, kolom tabel, dan styling dengan
 * kebutuhan bisnis aslinya — bagian yang penting dipertahankan adalah
 * urutan header → info penagihan → tabel item → total → QR/barcode.
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

export type InvoiceItem = {
  description: string;
  qty: number;
  unitPrice: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  issueDate: string; // sudah diformat, mis. "20 Juni 2026"
  dueDate: string;
  seller: { name: string; address: string; taxId?: string };
  buyer: { name: string; address: string };
  items: InvoiceItem[];
  notes?: string;
  qrDataUri: string; // dari generateQrDataUri() — link pembayaran/verifikasi
  barcodeDataUri: string; // dari generateBarcodeDataUri() — nomor invoice
};

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  muted: { color: '#666666' },
  section: { marginBottom: 16 },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between' },
  table: { marginTop: 8, borderTop: '1pt solid #DDDDDD' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottom: '1pt solid #EEEEEE'
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    fontWeight: 700
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '17.5%', textAlign: 'right' },
  colTotal: { width: '17.5%', textAlign: 'right' },
  totalsBlock: { marginTop: 12, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 2 },
  grandTotal: { fontSize: 13, fontWeight: 700 },
  footer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  qr: { width: 70, height: 70 },
  barcode: { width: 160, height: 40 }
});

function formatRupiah(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID');
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  // Ganti/tambah baris pajak, diskon, ongkir, dll. di sini sesuai kebutuhan.
  const grandTotal = subtotal;

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text>{data.invoiceNumber}</Text>
          </View>
          <View>
            <Text style={{ fontWeight: 700 }}>{data.seller.name}</Text>
            <Text style={styles.muted}>{data.seller.address}</Text>
            {data.seller.taxId ? <Text style={styles.muted}>NPWP: {data.seller.taxId}</Text> : null}
          </View>
        </View>

        <View style={[styles.section, styles.twoCol]}>
          <View>
            <Text style={styles.muted}>Ditagihkan kepada</Text>
            <Text style={{ fontWeight: 700 }}>{data.buyer.name}</Text>
            <Text>{data.buyer.address}</Text>
          </View>
          <View>
            <Text style={styles.muted}>Tanggal terbit: {data.issueDate}</Text>
            <Text style={styles.muted}>Jatuh tempo: {data.dueDate}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colDesc}>Deskripsi</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Harga</Text>
            <Text style={styles.colTotal}>Subtotal</Text>
          </View>
          {data.items.map((item, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>{formatRupiah(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatRupiah(item.qty * item.unitPrice)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatRupiah(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotal}>Total</Text>
            <Text style={styles.grandTotal}>{formatRupiah(grandTotal)}</Text>
          </View>
        </View>

        {data.notes ? (
          <View style={styles.section}>
            <Text style={styles.muted}>{data.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View>
            <Text style={styles.muted}>Scan untuk bayar / verifikasi</Text>
            <Image src={data.qrDataUri} style={styles.qr} />
          </View>
          <Image src={data.barcodeDataUri} style={styles.barcode} />
        </View>
      </Page>
    </Document>
  );
}
