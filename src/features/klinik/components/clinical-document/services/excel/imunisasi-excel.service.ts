import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { defaultImunisasiConfig } from '../../config/imunisasi-config';
import type { ImunisasiFormData } from '../../types';
import { HEADER_FILL, applyRowBorders, addSquareLogo, addSectionHeader } from './excel-primitives';

export async function exportImunisasiExcel(
  data?: ImunisasiFormData | null,
  filename = 'Formulir_Imunisasi.xlsx'
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Amanah Healthcare';
  const ws = wb.addWorksheet('Rekam Medis Imunisasi', {
    pageSetup: { paperSize: 9, orientation: 'portrait' }
  });

  ws.columns = [
    { width: 8 }, // A: No
    { width: 30 }, // B: Parameter 1 / Vaksin
    { width: 24 }, // C: Nilai 1 / Tgl Suntik
    { width: 24 }, // D: Parameter 2 / Umur
    { width: 24 }, // E: Nilai 2 / Planning
    { width: 28 } // F: Catatan
  ];

  addSquareLogo(wb, ws);

  // KOP Surat
  ws.mergeCells('A1:F1');
  const t1 = ws.getCell('A1');
  t1.value = 'AMANAH HEALTH CARE - REKAM MEDIS IMUNISASI';
  t1.font = { bold: true, size: 11, name: 'Calibri' };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A2:F2');
  const t2 = ws.getCell('A2');
  t2.value = 'Pelayanan Kesehatan Ibu dan Anak & Vaksinasi Nasional';
  t2.font = { size: 9, name: 'Calibri' };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A3:F3');
  const t3 = ws.getCell('A3');
  t3.value = `No. Rekam Medis: ${data?.header?.recordDigits?.join('') || ''}`;
  t3.font = { bold: true, size: 10, name: 'Calibri' };
  t3.alignment = { horizontal: 'center', vertical: 'middle' };

  // Section I: IDENTITAS ANAK & ORANG TUA
  let currentLine = 5;
  addSectionHeader(ws, currentLine, 'I. IDENTITAS ANAK & ORANG TUA', 6);

  const leftVals = data?.identity?.leftValues || [];
  const rightVals = data?.identity?.rightValues || [];
  const cfg = defaultImunisasiConfig;

  cfg.identity.rows.forEach((rDef, idx) => {
    currentLine += 1;
    ws.mergeCells(`A${currentLine}:B${currentLine}`);
    ws.mergeCells(`D${currentLine}:E${currentLine}`);

    const r = ws.getRow(currentLine);
    r.getCell(1).value = rDef.leftLabel;
    r.getCell(1).font = { bold: true, size: 9, name: 'Calibri' };
    r.getCell(1).alignment = { vertical: 'top', horizontal: 'left', indent: 1 };

    r.getCell(3).value = leftVals[idx] || rDef.leftValue || '';
    r.getCell(3).font = { size: 9, name: 'Calibri' };
    r.getCell(3).alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 };

    r.getCell(4).value = rDef.rightLabel;
    r.getCell(4).font = { bold: true, size: 9, name: 'Calibri' };
    r.getCell(4).alignment = { vertical: 'top', horizontal: 'left', indent: 1 };

    r.getCell(6).value = rightVals[idx] || rDef.rightValue || '';
    r.getCell(6).font = { size: 9, name: 'Calibri' };
    r.getCell(6).alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 };

    applyRowBorders(r, 1, 6);
  });

  // Section II: SKRINING & ALERGI
  currentLine += 2;
  addSectionHeader(ws, currentLine, 'II. SKRINING PRA-IMUNISASI & RIWAYAT ALERGI', 6);

  currentLine += 1;
  ws.mergeCells(`A${currentLine}:B${currentLine}`);
  ws.mergeCells(`D${currentLine}:E${currentLine}`);
  const p1 = ws.getRow(currentLine);
  p1.getCell(1).value = 'Pernah Imunisasi Sebelumnya:';
  p1.getCell(1).font = { bold: true, size: 9, name: 'Calibri' };
  p1.getCell(3).value = data?.preTable?.previousVaccines || '';
  p1.getCell(3).font = { size: 9, name: 'Calibri' };
  p1.getCell(4).value = 'Riwayat Alergi Anak:';
  p1.getCell(4).font = { bold: true, size: 9, name: 'Calibri' };
  p1.getCell(6).value = data?.preTable?.allergy || '';
  p1.getCell(6).font = { size: 9, name: 'Calibri' };
  applyRowBorders(p1, 1, 6);

  // Section III: JADWAL VAKSINASI (15 BARIS)
  currentLine += 2;
  addSectionHeader(
    ws,
    currentLine,
    'III. CATATAN PEMBERIAN IMUNISASI (JADWAL STANDAR NASIONAL)',
    6
  );

  currentLine += 1;
  ws.mergeCells(`E${currentLine}:F${currentLine}`);
  const vHead = ws.getRow(currentLine);
  vHead.getCell(1).value = 'No';
  vHead.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  vHead.getCell(2).value = 'Jenis Vaksin / Antigen';
  vHead.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  vHead.getCell(3).value = 'Tanggal Suntik';
  vHead.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
  vHead.getCell(4).value = 'Umur';
  vHead.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
  vHead.getCell(5).value = 'Keterangan / Planning';
  vHead.getCell(5).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  for (let c = 1; c <= 6; c += 1) {
    vHead.getCell(c).font = { bold: true, size: 9, name: 'Calibri' };
    vHead.getCell(c).fill = HEADER_FILL;
  }
  applyRowBorders(vHead, 1, 6);

  const vaccineRows = data?.vaccineRows || [];
  cfg.vaccineTable.rows.forEach((cfgRow, idx) => {
    currentLine += 1;
    ws.mergeCells(`E${currentLine}:F${currentLine}`);

    const rec = vaccineRows[idx];
    const vaccineLabel = cfgRow.vaccine
      .map((v) => (v.right ? `${v.left} / ${v.right}` : v.left))
      .join(', ');
    const r = ws.getRow(currentLine);
    r.getCell(1).value = idx + 1;
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).value = vaccineLabel;
    r.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    r.getCell(3).value = rec?.injectionDate || '';
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).value = rec?.age || '';
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(5).value = rec?.planning || '';
    r.getCell(5).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    for (let c = 1; c <= 6; c += 1) {
      r.getCell(c).font = { name: 'Calibri', size: 9 };
    }
    applyRowBorders(r, 1, 6);
  });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}
