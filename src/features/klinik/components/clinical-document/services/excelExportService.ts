import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { PmbFormData, ImunisasiFormData, RegulerFormData } from '../types';
import { CLINIC_LOGO_BASE64 } from '../assets/clinic-logo.asset';
import { defaultImunisasiConfig } from '../config/imunisasi-config';

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
};

const SECTION_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFEAEAEA' }
};

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFDFDFDF' }
};

function applyCellBorder(cell: ExcelJS.Cell) {
  cell.border = THIN_BORDER;
}

function applyRowBorders(row: ExcelJS.Row, startCol: number, endCol: number) {
  for (let c = startCol; c <= endCol; c += 1) {
    applyCellBorder(row.getCell(c));
  }
}

function addSquareLogo(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet) {
  const imageId = wb.addImage({
    base64: CLINIC_LOGO_BASE64,
    extension: 'png'
  });
  ws.addImage(imageId, {
    tl: { col: 0.1, row: 0.2 },
    ext: { width: 54, height: 54 }
  });
}

function parseNativeNumber(val: any): number | string {
  if (typeof val === 'number') return val;
  if (!val || typeof val !== 'string') return '-';
  const clean = val.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  if (clean && !isNaN(Number(clean))) {
    return Number(clean);
  }
  return val;
}

function addSectionHeader(ws: ExcelJS.Worksheet, rowIdx: number, title: string, endCol = 8) {
  const endLetter = String.fromCharCode(64 + endCol);
  ws.mergeCells(`A${rowIdx}:${endLetter}${rowIdx}`);
  const c = ws.getCell(`A${rowIdx}`);
  c.value = title;
  c.font = { bold: true, size: 9.5, name: 'Calibri' };
  c.fill = SECTION_FILL;
  c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  applyRowBorders(ws.getRow(rowIdx), 1, endCol);
}

function addFourFieldRow(
  ws: ExcelJS.Worksheet,
  rowIdx: number,
  label1: string,
  val1: string | number,
  label2: string,
  val2: string | number
) {
  ws.mergeCells(`A${rowIdx}:B${rowIdx}`);
  ws.mergeCells(`C${rowIdx}:D${rowIdx}`);
  ws.mergeCells(`E${rowIdx}:F${rowIdx}`);
  ws.mergeCells(`G${rowIdx}:H${rowIdx}`);

  const r = ws.getRow(rowIdx);
  const cA = r.getCell(1);
  cA.value = label1;
  cA.font = { bold: true, name: 'Calibri', size: 9 };
  cA.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  const cC = r.getCell(3);
  cC.value = val1;
  cC.font = { name: 'Calibri', size: 9 };
  cC.alignment = {
    vertical: 'middle',
    horizontal: typeof val1 === 'number' ? 'right' : 'left',
    indent: 1
  };

  const cE = r.getCell(5);
  cE.value = label2;
  cE.font = { bold: true, name: 'Calibri', size: 9 };
  cE.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  const cG = r.getCell(7);
  cG.value = val2;
  cG.font = { name: 'Calibri', size: 9 };
  cG.alignment = {
    vertical: 'middle',
    horizontal: typeof val2 === 'number' ? 'right' : 'left',
    indent: 1
  };

  applyRowBorders(r, 1, 8);
}

function addFullFieldRow(
  ws: ExcelJS.Worksheet,
  rowIdx: number,
  label: string,
  val: string | number
) {
  ws.mergeCells(`A${rowIdx}:B${rowIdx}`);
  ws.mergeCells(`C${rowIdx}:H${rowIdx}`);

  const r = ws.getRow(rowIdx);
  const cA = r.getCell(1);
  cA.value = label;
  cA.font = { bold: true, name: 'Calibri', size: 9 };
  cA.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  const cC = r.getCell(3);
  cC.value = val;
  cC.font = { name: 'Calibri', size: 9 };
  cC.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  applyRowBorders(r, 1, 8);
}

/**
 * 1:1 Excel Exporter for PMB / Maternal / ANC
 */
export async function exportPmbExcel(
  data?: PmbFormData | null,
  filename = 'Formulir_Praktik_Mandiri_Bidan.xlsx'
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Amanah Healthcare';
  const ws = wb.addWorksheet('Rekam Medis ANC', {
    pageSetup: { paperSize: 9, orientation: 'portrait' }
  });

  // 8 balanced columns aligned with Obstetri & Identitas
  ws.columns = [
    { width: 7 }, // A: No
    { width: 23 }, // B: Label 1 part 2 / Tahun
    { width: 20 }, // C: Value 1 part 1 / BB/PB
    { width: 20 }, // D: Value 1 part 2 / Jenis Kelamin
    { width: 20 }, // E: Label 2 part 1 / Usia Kehamilan
    { width: 20 }, // F: Label 2 part 2 / Penolong
    { width: 22 }, // G: Value 2 part 1 / Cara Bersalin
    { width: 34 } // H: Value 2 part 2 / Tempat & Komplikasi
  ];

  addSquareLogo(wb, ws);

  // KOP Surat spanning full sheet width A:H
  ws.mergeCells('A1:H1');
  const t1 = ws.getCell('A1');
  t1.value = 'PRAKTIK MANDIRI BIDAN NUR HIDAYATUN, S.ST, BDN.';
  t1.font = { bold: true, size: 11, name: 'Calibri' };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A2:H2');
  const t2 = ws.getCell('A2');
  t2.value = 'SIPB: 503/000058.05.22/0053/K18/B/2022';
  t2.font = { size: 9, name: 'Calibri' };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A3:H3');
  const t3 = ws.getCell('A3');
  t3.value =
    'Jl. Anyelir I No. 243 Perumnas Condongcatur, Depok Sleman, DIY 55283 | WA: 081 392 45 6064';
  t3.font = { size: 8, name: 'Calibri' };
  t3.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A4:H4');
  const t4 = ws.getCell('A4');
  t4.value = 'FORMULIR REKAM MEDIS ANC & KESEHATAN IBU DAN ANAK';
  t4.font = { bold: true, underline: true, size: 11, name: 'Calibri' };
  t4.alignment = { horizontal: 'center', vertical: 'middle' };

  // Info RM ANC & Alergi
  ws.mergeCells('A6:B6');
  ws.mergeCells('C6:D6');
  ws.mergeCells('E6:F6');
  ws.mergeCells('G6:H6');
  const r6 = ws.getRow(6);
  r6.getCell(1).value = 'Nomor RM ANC:';
  r6.getCell(1).font = { bold: true, size: 9 };
  r6.getCell(3).value = data?.header?.rmAncCode || '-';
  r6.getCell(3).font = { size: 9 };
  r6.getCell(5).value = 'Riwayat Alergi:';
  r6.getCell(5).font = { bold: true, size: 9 };
  r6.getCell(7).value = data?.header?.allergy || 'Tidak ada riwayat alergi obat maupun makanan';
  r6.getCell(7).font = { size: 9 };
  applyRowBorders(r6, 1, 8);

  // Section I: IDENTITAS
  let currentLine = 8;
  addSectionHeader(ws, currentLine, 'I. IDENTITAS IBU & SUAMI', 8);

  const topRows = data?.identity?.topRowValues || [];
  const fullRows = data?.identity?.fullRowValues || [];
  const locations = data?.identity?.locationValues || [];
  const measurements = data?.identity?.measurementValues || [];

  const fourFieldRows = [
    ['Nama Ibu', topRows[0]?.[0] || '-', 'Pernikahan Ke', parseNativeNumber(topRows[0]?.[1])],
    ['NIK Ibu', topRows[1]?.[0] || '-', 'Tanggal Menikah', topRows[0]?.[2] || '-'],
    ['Tanggal Lahir Ibu', topRows[1]?.[1] || '-', 'Nama Suami', topRows[2]?.[0] || '-'],
    ['Umur Ibu', parseNativeNumber(topRows[2]?.[1]), 'NIK Suami', topRows[3]?.[0] || '-'],
    ['Pekerjaan Ibu', topRows[1]?.[2] || '-', 'Tanggal Lahir Suami', topRows[3]?.[1] || '-'],
    ['Pendidikan Ibu', topRows[2]?.[2] || '-', 'Umur Suami', parseNativeNumber(topRows[4]?.[1])],
    ['Golongan Darah Ibu', measurements[0]?.[3] || '-', 'Pekerjaan Suami', topRows[3]?.[2] || '-'],
    [
      'Tinggi Badan (TB)',
      parseNativeNumber(measurements[0]?.[0]),
      'Pendidikan Suami',
      topRows[4]?.[2] || '-'
    ],
    [
      'Berat Badan Sebelum Hamil (BB)',
      parseNativeNumber(measurements[1]?.[0]),
      'Golongan Darah Suami',
      measurements[1]?.[3] || '-'
    ],
    [
      'LILA',
      parseNativeNumber(measurements[0]?.[1]),
      'Status Imunisasi TT',
      measurements[0]?.[2] || '-'
    ],
    ['IMT Awal', parseNativeNumber(measurements[1]?.[1]), 'Dasawisma', locations[0] || '-'],
    ['Posyandu', locations[1] || '-', 'Puskesmas', locations[2] || '-']
  ];

  fourFieldRows.forEach((rowPair) => {
    currentLine += 1;
    addFourFieldRow(ws, currentLine, rowPair[0], rowPair[1], rowPair[2], rowPair[3]);
  });

  const fullFieldRows = [
    ['Agama', fullRows[0] || '-'],
    ['Alamat Domisili', fullRows[1] || '-'],
    ['Alamat KTP', fullRows[2] || '-'],
    ['Nomor Telepon / WA', fullRows[3] || '-']
  ];

  fullFieldRows.forEach((item) => {
    currentLine += 1;
    addFullFieldRow(ws, currentLine, item[0], item[1]);
  });

  // Section II: ANAMNESA
  currentLine += 2;
  addSectionHeader(ws, currentLine, 'II. ANAMNESA & FAKTOR RISIKO', 8);

  const prompts = data?.anamnesa?.promptValues || [];
  const risk = data?.anamnesa?.riskChecked || {};

  const anamnesaRows = [
    [
      'HPHT (Haid Pertama Terakhir)',
      prompts[0] || '-',
      'HPL (Hari Perkiraan Lahir)',
      prompts[1] || '-'
    ],
    ['Usia Kehamilan (UK)', prompts[2] || '-', 'Keluhan Saat Ini', prompts[3] || '-'],
    [
      'Merokok Sebelum Hamil',
      risk['Merokok'] ? 'Ya' : 'Tidak',
      'Pola Makan Berisiko',
      risk['Pola Makan Beresiko'] ? 'Ya' : 'Tidak'
    ],
    [
      'Aktivitas Fisik Berkurang',
      risk['Aktivitas fisik berkurang'] ? 'Ya' : 'Tidak',
      'Alkohol',
      risk['Alkohol'] ? 'Ya' : 'Tidak'
    ],
    [
      'Obat Teratogenik',
      risk['Obat Teratogenik'] ? 'Ya' : 'Tidak',
      'Kosmetik Berbahaya',
      risk['Kosmetik dengan zat berbahaya'] ? 'Ya' : 'Tidak'
    ]
  ];

  anamnesaRows.forEach((rowPair) => {
    currentLine += 1;
    addFourFieldRow(ws, currentLine, rowPair[0], rowPair[1], rowPair[2], rowPair[3]);
  });

  currentLine += 1;
  addFullFieldRow(
    ws,
    currentLine,
    'Paparan Lingkungan Berisiko',
    data?.anamnesa?.environment || '-'
  );
  currentLine += 1;
  addFullFieldRow(ws, currentLine, 'Catatan Lainnya', data?.anamnesa?.otherLines?.[0] || '-');

  // Section III: SKRINING 14 PENYAKIT
  currentLine += 2;
  addSectionHeader(ws, currentLine, 'III. SKRINING RIWAYAT PENYAKIT (14 KONDISI)', 8);

  currentLine += 1;
  ws.mergeCells(`B${currentLine}:D${currentLine}`);
  ws.mergeCells(`E${currentLine}:F${currentLine}`);
  ws.mergeCells(`G${currentLine}:H${currentLine}`);
  const diseaseHead = ws.getRow(currentLine);
  diseaseHead.getCell(1).value = 'No';
  diseaseHead.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  diseaseHead.getCell(2).value = 'Kondisi / Penyakit';
  diseaseHead.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  diseaseHead.getCell(5).value = 'Status (Ya / Tidak)';
  diseaseHead.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
  diseaseHead.getCell(7).value = 'Tahun / Catatan Diagnosa';
  diseaseHead.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
  for (let c = 1; c <= 8; c += 1) {
    diseaseHead.getCell(c).font = { bold: true, size: 9, name: 'Calibri' };
    diseaseHead.getCell(c).fill = HEADER_FILL;
  }
  applyRowBorders(diseaseHead, 1, 8);

  const diseaseNames = [
    'Hipertensi',
    'Jantung',
    'Tiroid',
    'Autoimun',
    'Diabetes',
    'Asma',
    'TBC',
    'Hepatitis B',
    'HIV/Sifilis',
    'Jiwa',
    'Riwayat Gemelli',
    'Kista/Miom/Tumor',
    'Operasi',
    'Lain-lain'
  ];

  const diseases = data?.anamnesa?.diseaseHistory || {};
  diseaseNames.forEach((d, idx) => {
    currentLine += 1;
    const rec = diseases[d] || (d === 'Lain-lain' ? diseases[''] : undefined);
    const status = rec?.status === 'ya' ? 'Ya' : rec?.status === 'tidak' ? 'Tidak' : '-';
    const year = rec?.year || '-';

    ws.mergeCells(`B${currentLine}:D${currentLine}`);
    ws.mergeCells(`E${currentLine}:F${currentLine}`);
    ws.mergeCells(`G${currentLine}:H${currentLine}`);

    const r = ws.getRow(currentLine);
    r.getCell(1).value = idx + 1;
    r.getCell(1).font = { name: 'Calibri', size: 9 };
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(2).value = d;
    r.getCell(2).font = { name: 'Calibri', size: 9 };
    r.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    r.getCell(5).value = status;
    r.getCell(5).font = { name: 'Calibri', size: 9 };
    r.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(7).value = year;
    r.getCell(7).font = { name: 'Calibri', size: 9 };
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };

    applyRowBorders(r, 1, 8);
  });

  // Section IV: OBSTETRI & RIWAYAT PERSALINAN
  currentLine += 2;
  addSectionHeader(
    ws,
    currentLine,
    `IV. STATUS OBSTETRI & RIWAYAT PERSALINAN LALU  (G: ${data?.pregnancyFields?.G || 1} | P: ${data?.pregnancyFields?.P || 0} | Ab: ${data?.pregnancyFields?.Ab || 0} | Ah: ${data?.pregnancyFields?.Ah || 0})`,
    8
  );

  currentLine += 1;
  const obstetriHead = ws.getRow(currentLine);
  const obsCols = [
    'No',
    'Tahun',
    'BB/PB Lahir',
    'Jenis Kelamin',
    'Usia Kehamilan',
    'Penolong',
    'Cara Bersalin',
    'Tempat & Komplikasi'
  ];
  obsCols.forEach((colName, idx) => {
    const cell = obstetriHead.getCell(idx + 1);
    cell.value = colName;
    cell.font = { bold: true, size: 9, name: 'Calibri' };
    cell.fill = HEADER_FILL;
    cell.alignment = {
      horizontal: idx === 0 ? 'center' : 'left',
      vertical: 'middle',
      indent: idx === 0 ? 0 : 1
    };
  });
  applyRowBorders(obstetriHead, 1, 8);

  const obstetriRows = data?.obstetriRows || [];
  if (obstetriRows.length > 0) {
    obstetriRows.forEach((r, idx) => {
      currentLine += 1;
      const row = ws.getRow(currentLine);
      row.getCell(1).value = idx + 1;
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(2).value = parseNativeNumber(r[1]);
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).value = r[2] || '-';
      row.getCell(4).value = r[3] || '-';
      row.getCell(5).value = r[4] || '-';
      row.getCell(6).value = r[5] || '-';
      row.getCell(7).value = r[6] || '-';
      row.getCell(8).value = `${r[7] || '-'} ${r[8] ? `(${r[8]})` : ''}`;

      for (let c = 1; c <= 8; c += 1) {
        row.getCell(c).font = { name: 'Calibri', size: 9 };
        if (c > 2) {
          row.getCell(c).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        }
      }
      applyRowBorders(row, 1, 8);
    });
  } else {
    currentLine += 1;
    ws.mergeCells(`A${currentLine}:H${currentLine}`);
    const emptyRow = ws.getCell(`A${currentLine}`);
    emptyRow.value = 'Tidak ada riwayat persalinan sebelumnya (Kehamilan Pertama / Primigravida)';
    emptyRow.font = { italic: true, size: 9, name: 'Calibri' };
    emptyRow.alignment = { vertical: 'middle', horizontal: 'center' };
    applyRowBorders(ws.getRow(currentLine), 1, 8);
  }

  // Section V: KONTRASEPSI / KB
  currentLine += 2;
  addSectionHeader(ws, currentLine, 'V. RIWAYAT PEMAKAIAN KONTRASEPSI / KB', 8);

  currentLine += 1;
  ws.mergeCells(`C${currentLine}:D${currentLine}`);
  ws.mergeCells(`G${currentLine}:H${currentLine}`);
  const kbHead = ws.getRow(currentLine);
  kbHead.getCell(1).value = 'No';
  kbHead.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  kbHead.getCell(2).value = 'Tgl Mulai';
  kbHead.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  kbHead.getCell(3).value = 'Metode Kontrasepsi';
  kbHead.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  kbHead.getCell(5).value = 'Masa Pakai';
  kbHead.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
  kbHead.getCell(6).value = 'Tgl Berhenti';
  kbHead.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
  kbHead.getCell(7).value = 'Masalah / Efek Samping';
  kbHead.getCell(7).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  for (let c = 1; c <= 8; c += 1) {
    kbHead.getCell(c).font = { bold: true, size: 9, name: 'Calibri' };
    kbHead.getCell(c).fill = HEADER_FILL;
  }
  applyRowBorders(kbHead, 1, 8);

  const kbRows = data?.kbRows || [];
  if (kbRows.length > 0) {
    kbRows.forEach((r, idx) => {
      currentLine += 1;
      ws.mergeCells(`C${currentLine}:D${currentLine}`);
      ws.mergeCells(`G${currentLine}:H${currentLine}`);

      const row = ws.getRow(currentLine);
      row.getCell(1).value = idx + 1;
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(2).value = r[1] || '-';
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).value = r[2] || '-';
      row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      row.getCell(5).value = r[3] || '-';
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(6).value = r[4] || '-';
      row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(7).value = `${r[5] || '-'} ${r[6] ? `(${r[6]})` : ''}`;
      row.getCell(7).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

      for (let c = 1; c <= 8; c += 1) {
        row.getCell(c).font = { name: 'Calibri', size: 9 };
      }
      applyRowBorders(row, 1, 8);
    });
  } else {
    currentLine += 1;
    ws.mergeCells(`A${currentLine}:H${currentLine}`);
    const emptyKb = ws.getCell(`A${currentLine}`);
    emptyKb.value = 'Belum pernah menggunakan kontrasepsi / KB sebelumnya';
    emptyKb.font = { italic: true, size: 9, name: 'Calibri' };
    emptyKb.alignment = { vertical: 'middle', horizontal: 'center' };
    applyRowBorders(ws.getRow(currentLine), 1, 8);
  }

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

/**
 * 1:1 Excel Exporter for Immunization
 */
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
  t3.value = `No. Rekam Medis: ${data?.header?.recordDigits?.join('') || '-'}`;
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
    r.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    r.getCell(3).value = leftVals[idx] || rDef.leftValue || '-';
    r.getCell(3).font = { size: 9, name: 'Calibri' };
    r.getCell(3).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    r.getCell(4).value = rDef.rightLabel;
    r.getCell(4).font = { bold: true, size: 9, name: 'Calibri' };
    r.getCell(4).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    r.getCell(6).value = rightVals[idx] || rDef.rightValue || '-';
    r.getCell(6).font = { size: 9, name: 'Calibri' };
    r.getCell(6).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

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
  p1.getCell(3).value = data?.preTable?.previousVaccines || '-';
  p1.getCell(3).font = { size: 9, name: 'Calibri' };
  p1.getCell(4).value = 'Riwayat Alergi Anak:';
  p1.getCell(4).font = { bold: true, size: 9, name: 'Calibri' };
  p1.getCell(6).value = data?.preTable?.allergy || '-';
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
    r.getCell(3).value = rec?.injectionDate || '-';
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).value = rec?.age || '-';
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(5).value = rec?.planning || '-';
    r.getCell(5).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    for (let c = 1; c <= 6; c += 1) {
      r.getCell(c).font = { name: 'Calibri', size: 9 };
    }
    applyRowBorders(r, 1, 6);
  });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

/**
 * 1:1 Excel Exporter for Regular Outpatient
 */
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
  addSectionHeader(ws, currentLine, 'I. IDENTITAS PASIEN', 4);

  const patientData = [
    ['Nama Pasien', data?.identity?.fullName || '-', 'NIK', data?.identity?.nik || '-'],
    [
      'Tanggal Lahir',
      data?.identity?.birthDate || '-',
      'Jenis Kelamin',
      data?.identity?.gender || '-'
    ],
    ['Nomor Telepon', data?.identity?.phoneNumber || '-', 'Alamat', data?.identity?.address || '-']
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
  addSectionHeader(ws, currentLine, 'II. KUNJUNGAN & TANDA VITAL', 4);

  const encounterData = [
    ['Kode Booking', data?.bookingCode || '-', 'Nomor Antrean', data?.queueNumber || '-'],
    ['Poli / Layanan', data?.serviceName || '-', 'Dokter Pemeriksa', data?.doctorName || '-'],
    [
      'Tinggi Badan (cm)',
      parseNativeNumber(data?.clinical?.vitalHeightCm),
      'Berat Badan (kg)',
      parseNativeNumber(data?.clinical?.vitalWeightKg)
    ],
    [
      'Tekanan Darah',
      data?.clinical?.vitalBloodPressure || '-',
      'Riwayat Alergi',
      data?.clinical?.allergyHistory || '-'
    ]
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
  addSectionHeader(ws, currentLine, 'III. ANAMNESA & CATATAN KLINIS', 4);

  currentLine += 1;
  const c1 = ws.getRow(currentLine);
  c1.getCell(1).value = 'Keluhan Utama:';
  c1.getCell(1).font = { bold: true, size: 9, name: 'Calibri' };
  ws.mergeCells(`B${currentLine}:D${currentLine}`);
  c1.getCell(2).value = data?.clinical?.chiefComplaint || '-';
  c1.getCell(2).font = { size: 9, name: 'Calibri' };
  applyRowBorders(c1, 1, 4);

  currentLine += 1;
  const c2 = ws.getRow(currentLine);
  c2.getCell(1).value = 'Catatan Dokter:';
  c2.getCell(1).font = { bold: true, size: 9, name: 'Calibri' };
  ws.mergeCells(`B${currentLine}:D${currentLine}`);
  c2.getCell(2).value = data?.clinical?.additionalNotes || '-';
  c2.getCell(2).font = { size: 9, name: 'Calibri' };
  applyRowBorders(c2, 1, 4);

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}
