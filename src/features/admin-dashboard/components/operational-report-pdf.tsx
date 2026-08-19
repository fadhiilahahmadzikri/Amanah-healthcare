import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { OperationalSummary } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 18,
    borderBottom: '1.5px solid #2563eb',
    paddingBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 3
  },
  periodBadge: {
    marginTop: 6,
    fontSize: 9,
    color: '#2563eb',
    fontWeight: 'bold'
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  metricCard: {
    flex: 1,
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#f8fafc'
  },
  metricTitle: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  metricComparison: {
    fontSize: 8,
    marginTop: 4,
    color: '#16a34a'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    marginTop: 10
  },
  table: {
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    marginBottom: 14
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: '6px 8px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    padding: '6px 8px',
    borderBottom: '1px solid #f1f5f9'
  },
  col1: { flex: 4 },
  col2: { flex: 3, textAlign: 'center' },
  col3: { flex: 3, textAlign: 'center' },
  col4: { flex: 3, textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: '1px solid #f1f5f9',
    paddingTop: 8
  }
});

export function OperationalReportPDF({ data }: { data: OperationalSummary }) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Operasional Klinik Amanah</Text>
          <Text style={styles.subtitle}>
            Ringkasan performa operasional klinik dalam periode yang dipilih.
          </Text>
          <Text style={styles.periodBadge}>
            Periode: {data.period.start} - {data.period.end} (Pembanding: {data.period.compareStart}{' '}
            - {data.period.compareEnd})
          </Text>
        </View>

        {/* 4 Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Pasien</Text>
            <Text style={styles.metricValue}>{data.metrics.totalPatients.displayValue}</Text>
            <Text style={styles.metricComparison}>
              +{data.metrics.totalPatients.changePercentage}% vs periode lalu
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Pasien Baru</Text>
            <Text style={styles.metricValue}>{data.metrics.newPatients.displayValue}</Text>
            <Text style={styles.metricComparison}>
              +{data.metrics.newPatients.changePercentage}% vs periode lalu
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Kunjungan</Text>
            <Text style={styles.metricValue}>{data.metrics.totalVisits.displayValue}</Text>
            <Text style={styles.metricComparison}>
              +{data.metrics.totalVisits.changePercentage}% vs periode lalu
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>No Show Rate</Text>
            <Text style={styles.metricValue}>{data.metrics.noShowRate.displayValue}</Text>
            <Text style={{ ...styles.metricComparison, color: '#dc2626' }}>
              {data.metrics.noShowRate.changePercentage}% vs periode lalu
            </Text>
          </View>
        </View>

        {/* Layanan Dipesan */}
        <Text style={styles.sectionTitle}>Top Layanan yang Dipesan</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Layanan</Text>
            <Text style={styles.col2}>Total Pemesanan</Text>
            <Text style={styles.col3}>Persentase</Text>
            <Text style={styles.col4}>Tren Pertumbuhan</Text>
          </View>
          {data.topOrderedServices.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.col1}>{item.serviceName}</Text>
              <Text style={styles.col2}>{item.totalOrders}</Text>
              <Text style={styles.col3}>{item.percentage}%</Text>
              <Text style={styles.col4}>
                {item.trendPercentage >= 0
                  ? `+${item.trendPercentage}%`
                  : `${item.trendPercentage}%`}
              </Text>
            </View>
          ))}
        </View>

        {/* Top Dokter & Reschedule */}
        <Text style={styles.sectionTitle}>Top Dokter & Ringkasan Reschedule</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Dokter</Text>
            <Text style={styles.col2}>Spesialisasi</Text>
            <Text style={styles.col3}>Total Pasien</Text>
            <Text style={styles.col4}>Status</Text>
          </View>
          {data.topDoctors.map((doc) => (
            <View key={doc.id} style={styles.tableRow}>
              <Text style={styles.col1}>{doc.name}</Text>
              <Text style={styles.col2}>{doc.specialty}</Text>
              <Text style={styles.col3}>{doc.totalPatients}</Text>
              <Text style={styles.col4}>Aktif</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Dicetak otomatis dari Sistem Informasi Manajemen Klinik Amanah Healthcare</Text>
        </View>
      </Page>
    </Document>
  );
}
