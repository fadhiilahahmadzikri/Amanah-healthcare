import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import {
  buildReportSummary,
  formatCurrency,
  formatDate,
  type ReportRecord,
  type ReportSources
} from '../lib/report-data';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
    backgroundColor: '#ffffff'
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 8
  },
  title: {
    fontSize: 25,
    fontWeight: 700,
    marginBottom: 8
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 24
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  metric: {
    flex: 1,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: 12
  },
  metricLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700
  },
  section: {
    marginTop: 18
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10
  },
  table: {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 700
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderTop: '1px solid #e5e7eb'
  },
  colWide: {
    width: '42%'
  },
  col: {
    width: '19%'
  },
  colRight: {
    width: '20%',
    textAlign: 'right'
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#6b7280',
    fontSize: 8
  }
});

export function ReportPDF({
  sources,
  appendixRecords,
  dateParams
}: {
  sources: ReportSources;
  appendixRecords: ReportRecord[];
  dateParams?: { from: Date | null; to: Date | null };
}) {
  const summary = buildReportSummary(sources);

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <ReportHeader
          eyebrow='Executive Summary'
          title='Business Performance Report'
          subtitle={
            dateParams?.from && dateParams?.to
              ? `For period: ${formatDate(dateParams.from.toISOString())} - ${formatDate(dateParams.to.toISOString())}. Revenue, fulfillment, customer activity, and inventory health.`
              : 'Revenue, fulfillment, customer activity, and inventory health.'
          }
        />
        <View style={styles.grid}>
          <Metric label='Total Revenue' value={formatCurrency(summary.totalRevenue)} />
          <Metric label='Orders' value={String(summary.totalOrders)} />
          <Metric label='Average Order' value={formatCurrency(summary.averageOrderValue)} />
        </View>
        <View style={styles.grid}>
          <Metric label='Conversion Rate' value={`${summary.conversionRate.toFixed(1)}%`} />
          <Metric label='Return Rate' value={`${summary.returnRate.toFixed(1)}%`} />
          <Metric label='Active Customers' value={String(summary.activeCustomers)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operational Notes</Text>
          <Text>
            Outstanding invoices total {formatCurrency(summary.outstandingInvoiceAmount)} while{' '}
            {summary.lowStockCount} products are at or below their minimum stock threshold.
          </Text>
        </View>
        <PageFooter page='1 / 3' />
      </Page>

      <Page size='A4' style={styles.page}>
        <ReportHeader
          eyebrow='Sales and Inventory'
          title='Performance Snapshot'
          subtitle='Top products and category contribution from the full source dataset.'
        />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          <View style={styles.table}>
            <ReportTableHeader columns={['Product', 'SKU', 'Sold', 'Revenue']} />
            {summary.topProducts.slice(0, 8).map((product) => (
              <View key={product.productId} style={styles.tableRow}>
                <Text style={styles.colWide}>{product.productName}</Text>
                <Text style={styles.col}>{product.sku}</Text>
                <Text style={styles.col}>{product.quantity}</Text>
                <Text style={styles.colRight}>{formatCurrency(product.revenue)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Revenue</Text>
          <View style={styles.table}>
            <ReportTableHeader columns={['Category', 'Quantity', 'Revenue', 'Share']} />
            {summary.categorySales.slice(0, 8).map((category) => (
              <View key={category.category} style={styles.tableRow}>
                <Text style={styles.colWide}>{category.category}</Text>
                <Text style={styles.col}>{category.quantity}</Text>
                <Text style={styles.col}>{formatCurrency(category.revenue)}</Text>
                <Text style={styles.colRight}>
                  {summary.totalRevenue
                    ? `${((category.revenue / summary.totalRevenue) * 100).toFixed(1)}%`
                    : '0%'}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <PageFooter page='2 / 3' />
      </Page>

      <Page size='A4' style={styles.page}>
        <ReportHeader
          eyebrow='Appendix'
          title='Curated Operational Records'
          subtitle='Capped to 30 records to match the dashboard table appendix.'
        />
        <View style={styles.table}>
          <ReportTableHeader columns={['Record', 'Type', 'Status', 'Amount']} />
          {appendixRecords.slice(0, 18).map((record) => (
            <View key={record.id} style={styles.tableRow}>
              <Text style={styles.colWide}>
                {record.title} · {formatDate(record.date)}
              </Text>
              <Text style={styles.col}>{record.kind}</Text>
              <Text style={styles.col}>{record.status}</Text>
              <Text style={styles.colRight}>{formatCurrency(record.amount)}</Text>
            </View>
          ))}
        </View>
        <PageFooter page='3 / 3' />
      </Page>
    </Document>
  );
}

function ReportHeader({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ReportTableHeader({ columns }: { columns: string[] }) {
  return (
    <View style={styles.tableHeader}>
      <Text style={styles.colWide}>{columns[0]}</Text>
      <Text style={styles.col}>{columns[1]}</Text>
      <Text style={styles.col}>{columns[2]}</Text>
      <Text style={styles.colRight}>{columns[3]}</Text>
    </View>
  );
}

function PageFooter({ page }: { page: string }) {
  return (
    <View style={styles.footer}>
      <Text>Generated {new Date().toISOString().slice(0, 10)}</Text>
      <Text>{page}</Text>
    </View>
  );
}
