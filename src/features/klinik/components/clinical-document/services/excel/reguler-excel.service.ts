import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { RegulerFormData } from '../../types';
import {
  applyRowBorders,
  addSquareLogo,
  addSectionHeader
} from './excel-primitives';

export async function exportRegulerExcel(
  data?: RegulerFormData | null,
  filename = 'Formulir_Rawat_Jalan.xlsx'
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Amanah Healthcare';
  const ws = wb.addWorksheet('Rawat Jalan', {
    pageSetup: { paperSize: 9, orientation: 'portrait' }
  });

  ws.columns = [
    { width: 24 }, // A: Label 1
    { width: 34 }, // B: Nilai 1
    { width: 24 }, // C: Label 2
    { width: 34 } // D: Nilai 2
  ];

  addSquareLogo(wb, ws);

  ws.mergeCells('A1:D1');
  const t1 = ws.getCell('A1');
  t1.value = 'KLINIK AMANAH HEALTHCARE';
  t1.font = { bold: true, size: 11, name: 'Calibri' };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A2:D2');
  const t2 = ws.getCell('A2');
  t2.value = 'REKAM MEDIS RAWAT JALAN & PEMERIKSAAN PASIEN';
  t2.font = { bold: true, size: 10, name: 'Calibri' };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A3:D3');
  const t3 = ws.getCell('A3');
  t3.value = `Nomor RM: ${data?.medicalRecordNumber || '-'} | Tanggal: ${data?.registrationDate || '-'}`;
  t3.font = { size: 9, name: 'Calibri' };
  t3.alignment = { horizontal: 'center', vertical: 'middle' };

  let currentLine = 5;
  addSectionHeader(ws, currentLine, 'I. INFORMASI KUNJUNGAN', 4);

  const encounterData = [
    ['Kode Booking', data?.bookingCode || '-', 'Nomor Antrean', data?.queueNumber || '-'],
    ['Poliklinik Tujuan', data?.poliklinikName || '-', 'Layanan Medis', data?.serviceName || '-'],
    ['Dokter Pemeriksa', data?.doctorName || '-', 'Waktu & Sesi', data?.scheduledTime || '-']
  ];

  encounterData.forEach((rowPair) => {
    currentLine += 1;
    const r = ws.getRow(currentLine);
    r.getCell(1).value = rowPair[0];
    r.getCell(1).font = { bold: true, size: 9, name: 'Calibri' };
    r.getCell(2).value = rowPair[1];
    r.getCell(2).font = { size: 9, name: 'Calibri' };
    r.getCell(3).value = rowPair[2];
    r.getCell(3).font = { bold: true, size: 9, name: 'Calibri' };
    r.getCell(4).value = rowPair[3];
    r.getCell(4).font = { size: 9, name: 'Calibri' };
    applyRowBorders(r, 1, 4);
  });

  currentLine += 2;
  addSectionHeader(ws, currentLine, 'II. IDENTITAS PASIEN', 4);

  const emergencyStr = data?.emergencyContact?.phoneNumber
    ? `${data?.emergencyContact?.name || 'Kerabat'}${data?.emergencyContact?.relationship ? ` (${data?.emergencyContact?.relationship})` : ''} - ${data?.emergencyContact?.phoneNumber}`
    : '-';

  const patientData = [
    ['Nama Pasien', data?.identity?.fullName || '-', 'NIK', data?.identity?.nik || '-'],
    [
      'Tanggal Lahir',
      data?.identity?.birthDate || '-',
      'Jenis Kelamin',
      data?.identity?.gender || '-'
    ],
    ['Nomor Telepon', data?.identity?.phoneNumber || '-', 'Email', data?.identity?.email || '-'],
    ['Kontak Darurat', emergencyStr, 'Alamat', data?.identity?.address || '-']
  ];

  patientData.forEach((rowPair) => {
    currentLine += 1;
    const r = ws.getRow(currentLine);
    r.getCell(1).value = rowPair[0];
    r.getCell(1).font = { bold: true, size: 9, name: 'Calibri' };
    r.getCell(2).value = rowPair[1];
    r.getCell(2).font = { size: 9, name: 'Calibri' };
    r.getCell(3).value = rowPair[2];
    r.getCell(3).font = { bold: true, size: 9, name: 'Calibri' };
    r.getCell(4).value = rowPair[3];
    r.getCell(4).font = { size: 9, name: 'Calibri' };
    applyRowBorders(r, 1, 4);
  });

  currentLine += 2;
  addSectionHeader(ws, currentLine, 'III. KELUHAN', 4);

  currentLine += 1;
  const c1 = ws.getRow(currentLine);
  c1.getCell(1).value = 'Keluhan:';
  c1.getCell(1).font = { bold: true, size: 9, name: 'Calibri' };
  ws.mergeCells(`B${currentLine}:D${currentLine}`);
  c1.getCell(2).value =
    data?.chiefComplaint ||
    data?.clinical?.chiefComplaint ||
    'Tidak ada keluhan klinis yang dicatat saat pendaftaran.';
  c1.getCell(2).font = { size: 9, name: 'Calibri' };
  applyRowBorders(c1, 1, 4);

  currentLine += 2;
  addSectionHeader(ws, currentLine, 'IV. PENGESAHAN & TANDA TANGAN', 4);

  currentLine += 1;
  ws.mergeCells(`A${currentLine}:B${currentLine}`);
  ws.mergeCells(`C${currentLine}:D${currentLine}`);
  const sHeader = ws.getRow(currentLine);
  sHeader.getCell(1).value = `Tanggal: ${data?.registrationDate || '-'}\nPasien / Keluarga`;
  sHeader.getCell(1).font = { bold: true, size: 9, name: 'Calibri' };
  sHeader.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sHeader.getCell(3).value = `Tanggal: ${data?.registrationDate || '-'}\nDokter Pemeriksa`;
  sHeader.getCell(3).font = { bold: true, size: 9, name: 'Calibri' };
  sHeader.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  currentLine += 3;
  ws.mergeCells(`A${currentLine}:B${currentLine}`);
  ws.mergeCells(`C${currentLine}:D${currentLine}`);
  const sSign = ws.getRow(currentLine);
  sSign.getCell(1).value = `( ${data?.identity?.fullName || '................................'} )`;
  sSign.getCell(1).font = { size: 9, name: 'Calibri' };
  sSign.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  sSign.getCell(3).value = `( ${data?.doctorName || '................................'} )`;
  sSign.getCell(3).font = { size: 9, name: 'Calibri' };
  sSign.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}
