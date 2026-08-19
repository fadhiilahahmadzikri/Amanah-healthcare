import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { ShippingLabelData } from './types';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
    backgroundColor: '#ffffff'
  },
  label: {
    border: '2px solid #111827',
    padding: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  courier: {
    fontSize: 24,
    fontWeight: 700
  },
  routeBox: {
    border: '2px solid #111827',
    padding: 8,
    alignItems: 'center'
  },
  route: {
    fontSize: 20,
    fontWeight: 700
  },
  section: {
    borderTop: '1px solid #d1d5db',
    marginTop: 12,
    paddingTop: 12
  },
  labelText: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: 700
  },
  strong: {
    fontWeight: 700
  },
  barcode: {
    height: 60,
    width: 300,
    objectFit: 'contain'
  },
  qr: {
    width: 86,
    height: 86
  }
});

export function ShippingLabelDocument({
  data,
  qrCodeDataUrl,
  barcodeDataUrl
}: {
  data: ShippingLabelData;
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
}) {
  return (
    <Document>
      <Page size='A6' orientation='landscape' style={styles.page}>
        <View style={styles.label}>
          <View style={styles.row}>
            <View>
              <Text style={styles.courier}>{data.courier.name}</Text>
              <Text>
                {data.courier.service} · {data.trackingNumber}
              </Text>
            </View>
            <View style={styles.routeBox}>
              <Text style={styles.labelText}>Route</Text>
              <Text style={styles.route}>{data.routeCode}</Text>
            </View>
          </View>

          <View style={[styles.row, styles.section]}>
            <View>
              {barcodeDataUrl && <Image src={barcodeDataUrl} style={styles.barcode} />}
              <Text style={styles.strong}>{data.trackingNumber}</Text>
            </View>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qr} />}
          </View>

          <View style={[styles.row, styles.section]}>
            <Address title='Sender' name={data.sender.name} address={data.sender.address} />
            <Address title='Receiver' name={data.receiver.name} address={data.receiver.address} />
          </View>

          <View style={[styles.row, styles.section]}>
            <Text>Payment: {data.payment.method}</Text>
            <Text>COD: ${data.payment.codAmount.toFixed(2)}</Text>
            <Text>Weight: {data.package.weightKg} kg</Text>
            <Text>Pieces: {data.package.pieces}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function Address({ title, name, address }: { title: string; name: string; address: string }) {
  return (
    <View style={{ width: '48%' }}>
      <Text style={styles.labelText}>{title}</Text>
      <Text style={styles.strong}>{name}</Text>
      <Text>{address}</Text>
    </View>
  );
}
