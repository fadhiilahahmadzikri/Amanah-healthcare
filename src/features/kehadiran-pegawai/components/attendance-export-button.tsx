'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import type { StaffAttendance } from '../api/types';

interface AttendanceExportDropdownProps {
  data: StaffAttendance[];
  buttonVariant?: 'default' | 'outline';
}

function getExportDateLabel(data: StaffAttendance[]): string {
  return (
    data[0]?.tanggal_presensi ||
    new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  );
}

function getExportShiftLabel(data: StaffAttendance[]): string {
  const shifts = Array.from(new Set(data.map((record) => record.shift).filter(Boolean)));
  return shifts.length > 0 ? shifts.join(', ') : '-';
}

function createFilenameDateSlug(label: string): string {
  return label.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function AttendanceExportDropdown({
  data,
  buttonVariant = 'default'
}: AttendanceExportDropdownProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const exportDateLabel = getExportDateLabel(data);
      const headers = [
        'ID Staf',
        'Nama Staf',
        'Kategori',
        'Tanggal Presensi',
        'Waktu Presensi',
        'Waktu Datang',
        'Status',
        'Shift'
      ];

      const rows = data.map((doc) => [
        `"${doc.id_staf}"`,
        `"${doc.nama_staf.replace(/"/g, '""')}"`,
        `"${doc.kategori}"`,
        `"${doc.tanggal_presensi}"`,
        `"${doc.waktu_presensi}"`,
        `"${doc.waktu}"`,
        `"${doc.status}"`,
        `"${doc.shift}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `Presensi_Pegawai_Amanah_${createFilenameDateSlug(exportDateLabel)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Data presensi berhasil diekspor ke format Excel (.csv / .xlsx).');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor data presensi.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExportingPDF(true);
      const exportDateLabel = getExportDateLabel(data);
      const exportShiftLabel = getExportShiftLabel(data);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Izinkan pop-up untuk mengunduh PDF.');
        return;
      }

      const rowsHtml = data
        .map(
          (r, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 8px 12px; font-family: monospace; font-size: 11px;">${r.id_staf}</td>
          <td style="padding: 8px 12px; font-weight: 600;">${r.nama_staf}</td>
          <td style="padding: 8px 12px;">${r.kategori}</td>
          <td style="padding: 8px 12px;">${r.waktu_presensi}</td>
          <td style="padding: 8px 12px; font-family: monospace;">${r.waktu}</td>
          <td style="padding: 8px 12px; color: ${r.status === 'Hadir' ? '#16a34a' : '#dc2626'}; font-weight: bold;">● ${r.status}</td>
          <td style="padding: 8px 12px; color: #2563eb; font-weight: 600;">${r.shift}</td>
        </tr>
      `
        )
        .join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laporan Presensi Pegawai - Amanah Healthcare</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #0f172a; }
              h1 { font-size: 18px; margin-bottom: 4px; }
              p { font-size: 12px; color: #64748b; margin-top: 0; margin-bottom: 16px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
              th { background-color: #f1f5f9; padding: 8px 12px; border-bottom: 2px solid #cbd5e1; }
            </style>
          </head>
          <body>
            <h1>Laporan Presensi Kehadiran Pegawai</h1>
            <p>Amanah Healthcare • Tanggal: ${exportDateLabel} (Shift: ${exportShiftLabel})</p>
            <table>
              <thead>
                <tr>
                  <th>ID Staf</th>
                  <th>Nama Staf</th>
                  <th>Kategori</th>
                  <th>Waktu Presensi</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Shift</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);

      toast.success('Pratinjau cetak / unduh PDF presensi telah dibuka.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mencetak PDF presensi.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const isBusy = isExportingExcel || isExportingPDF;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          size='sm'
          disabled={isBusy || data.length === 0}
          className='h-9 font-medium shadow-xs gap-1.5 px-3.5'
        >
          {isBusy ? (
            <Icons.spinner className='size-3.5 animate-spin' />
          ) : (
            <Icons.upload className='size-3.5' />
          )}
          <span>Ekspor Data</span>
          <Icons.chevronDown className='size-3.5 opacity-80' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56 font-sans'>
        <div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
          Pilih Format Ekspor
        </div>
        <DropdownMenuItem
          onClick={handleExportExcel}
          className='cursor-pointer text-xs font-medium gap-2.5 py-2'
        >
          <Icons.fileSpreadsheet className='size-4 text-emerald-600 dark:text-emerald-400' />
          <div>
            <span className='font-semibold block'>Ekspor Excel (.csv / .xlsx)</span>
            <span className='text-[10.5px] text-muted-foreground block'>
              Tabel spreadsheet terstruktur
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportPDF}
          className='cursor-pointer text-xs font-medium gap-2.5 py-2'
        >
          <Icons.fileTypePdf className='size-4 text-rose-600 dark:text-rose-400' />
          <div>
            <span className='font-semibold block'>Ekspor Dokumen PDF (.pdf)</span>
            <span className='text-[10.5px] text-muted-foreground block'>
              Dokumen siap cetak dan arsip
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface AttendanceHeaderActionsProps {
  activeTab?: string;
  data: StaffAttendance[];
  onOpenGenerateQR?: () => void;
  onOpenManualAttendance?: () => void;
  onRefresh?: () => void;
  isQRVisible?: boolean;
}

export function AttendanceHeaderActions({
  activeTab = 'operational',
  data,
  onOpenGenerateQR,
  onOpenManualAttendance,
  onRefresh,
  isQRVisible = false
}: AttendanceHeaderActionsProps) {
  return (
    <div className='flex flex-wrap items-center gap-2.5'>
      {/* Jika berada di Tab Operasional, tampilkan aksi operasional */}
      {activeTab === 'operational' && (
        <>
          {/* 1. Presensi Manual Button (Outline styling harmonis) */}
          {onOpenManualAttendance && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onOpenManualAttendance}
              className='h-9 text-xs font-medium px-3.5 bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs gap-1.5'
            >
              <Icons.user className='size-3.5' />
              <span>Presensi Manual</span>
            </Button>
          )}

          {/* 2. Generate QR Presensi Button (Outline styling sama dengan Presensi Manual, teks tetap Generate QR Presensi) */}
          {onOpenGenerateQR && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onOpenGenerateQR}
              className='h-9 text-xs font-medium px-3.5 bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs gap-1.5'
            >
              <Icons.qrCode className='size-3.5' />
              <span>Generate QR Presensi</span>
            </Button>
          )}
        </>
      )}

      {/* Ekspor Data Dropdown (Tampil di kedua tab dengan primary fill default seperti Data Pasien) */}
      <AttendanceExportDropdown data={data} buttonVariant='default' />

      {/* Segarkan Data Icon Button */}
      {onRefresh && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onRefresh}
          title='Segarkan data'
          aria-label='Segarkan data'
          className='h-9 w-9 p-0 bg-card border-border/70 text-muted-foreground hover:text-foreground shadow-2xs'
        >
          <Icons.refresh className='size-4' />
        </Button>
      )}
    </div>
  );
}

// Backward-compatibility alias
export { AttendanceHeaderActions as AttendanceExportButtons };
