import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { InvoiceDocumentData } from '../../api/types';

type InvoiceDocumentProps = {
  data: InvoiceDocumentData;
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6
  },
  muted: {
    color: '#6b7280'
  },
  titleBlock: {
    alignItems: 'flex-end'
  },
  title: {
    fontSize: 26,
    fontWeight: 700
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: 9,
    textTransform: 'uppercase'
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24
  },
  panel: {
    flex: 1,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: 12
  },
  panelTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  strong: {
    fontWeight: 700
  },
  table: {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: 700
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTop: '1px solid #e5e7eb'
  },
  itemCol: {
    width: '46%'
  },
  numberCol: {
    width: '18%',
    textAlign: 'right'
  },
  totals: {
    marginTop: 20,
    marginLeft: 'auto',
    width: 220
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid #111827',
    fontSize: 14,
    fontWeight: 700
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 20,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 18
  },
  barcode: {
    width: 210,
    height: 54,
    objectFit: 'contain'
  },
  qr: {
    width: 72,
    height: 72
  }
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function InvoiceDocument({ data, qrCodeDataUrl, barcodeDataUrl }: InvoiceDocumentProps) {
  const barcode = barcodeDataUrl ?? data.codes.barcodeDataUrl;
  const qr = qrCodeDataUrl ?? data.codes.qrCodeDataUrl;

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{data.seller.name}</Text>
            <Text style={styles.muted}>{data.seller.address}</Text>
            <Text style={styles.muted}>{data.seller.email}</Text>
            <Text style={styles.muted}>{data.seller.phone}</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Invoice</Text>
            <Text style={styles.muted}>{data.invoiceNumber}</Text>
            <Text style={styles.badge}>{data.status}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Bill To</Text>
            <Text style={styles.strong}>{data.customer.name}</Text>
            {data.customer.company && <Text>{data.customer.company}</Text>}
            {data.customer.email && <Text>{data.customer.email}</Text>}
            {data.customer.phone && <Text>{data.customer.phone}</Text>}
            <Text>{data.customer.address}</Text>
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Payment</Text>
            <Text>Issued: {formatDate(data.issuedAt)}</Text>
            <Text>Due: {formatDate(data.dueDate)}</Text>
            {data.orderNumber && <Text>Order: {data.orderNumber}</Text>}
            {data.paidAt && <Text>Paid: {formatDate(data.paidAt)}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.itemCol}>Item</Text>
            <Text style={styles.numberCol}>Qty</Text>
            <Text style={styles.numberCol}>Unit</Text>
            <Text style={styles.numberCol}>Total</Text>
          </View>
          {data.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.itemCol}>
                <Text style={styles.strong}>{item.description}</Text>
                {item.sku && <Text style={styles.muted}>{item.sku}</Text>}
              </View>
              <Text style={styles.numberCol}>{item.quantity}</Text>
              <Text style={styles.numberCol}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.numberCol}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <TotalRow label='Subtotal' value={data.totals.subtotal} />
          <TotalRow label='Tax' value={data.totals.tax} />
          {data.totals.shipping !== 0 && <TotalRow label='Shipping' value={data.totals.shipping} />}
          {data.totals.discount !== 0 && <TotalRow label='Discount' value={data.totals.discount} />}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>{formatCurrency(data.totals.total)}</Text>
          </View>
        </View>

        {data.notes && (
          <View style={[styles.panel, { marginTop: 24 }]}>
            <Text style={styles.panelTitle}>Notes</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View>
            {barcode && <Image src={barcode} style={styles.barcode} />}
            <Text style={[styles.muted, { marginTop: 4 }]}>{data.codes.barcodeValue}</Text>
          </View>
          <View>
            {qr && <Image src={qr} style={styles.qr} />}
            <Text style={[styles.muted, { marginTop: 4, textAlign: 'center' }]}>Invoice QR</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.totalRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text>{formatCurrency(value)}</Text>
    </View>
  );
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}
