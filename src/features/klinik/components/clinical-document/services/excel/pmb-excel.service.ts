import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CANONICAL_MATERNAL_CONDITIONS } from '@/features/maternity/constants/maternity.constants';
import type { PmbFormData } from '../../types';
import {
  HEADER_FILL,
  applyRowBorders,
  addSquareLogo,
  parseNativeNumber,
  addSectionHeader,
  addFourFieldRow,
  addFullFieldRow
} from './excel-primitives';

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
  r6.getCell(3).value = data?.header?.rmAncCode || '';
  r6.getCell(3).font = { size: 9 };
  r6.getCell(5).value = 'Riwayat Alergi:';
  r6.getCell(5).font = { bold: true, size: 9 };
  r6.getCell(7).value = data?.header?.allergy || 'Tidak ada riwayat alergi obat maupun makanan';
  r6.getCell(7).font = { size: 9 };
  applyRowBorders(r6, 1, 8);

  // Section I: IDENTITAS IBU, SUAMI & WILAYAH
  let currentLine = 8;
  addSectionHeader(ws, currentLine, 'I.A. DATA DIRI', 8);

  const topRows = data?.identity?.topRowValues || [];
  const fullRows = data?.identity?.fullRowValues || [];
  const locations = data?.identity?.locationValues || [];
  const measurements = data?.identity?.measurementValues || [];

  const motherFieldRows = [
    ['Nama Ibu', data?.identity?.motherRows?.[0]?.[0]?.[1] || topRows[0]?.[0] || ''],
    ['NIK Ibu', data?.identity?.motherRows?.[1]?.[0]?.[1] || topRows[1]?.[0] || ''],
    ['Tanggal Lahir / Umur', data?.identity?.motherRows?.[0]?.[1]?.[1] || topRows[1]?.[1] || ''],
    ['Pekerjaan / Pendidikan', data?.identity?.motherRows?.[1]?.[1]?.[1] || topRows[1]?.[2] || ''],
    ['Agama / Golongan Darah', data?.identity?.motherRows?.[2]?.[0]?.[1] || fullRows[0] || ''],
    ['Nomor Telepon / WA', data?.identity?.motherRows?.[2]?.[1]?.[1] || fullRows[3] || '']
  ];

  motherFieldRows.forEach((item) => {
    currentLine += 1;
    addFullFieldRow(ws, currentLine, item[0], item[1]);
  });

  currentLine += 1;
  addSectionHeader(ws, currentLine, 'I.B. DATA SUAMI', 8);

  const husbandFieldRows = [
    ['Nama Suami', data?.identity?.husbandRows?.[0]?.[0]?.[1] || topRows[2]?.[0] || ''],
    ['NIK Suami', data?.identity?.husbandRows?.[1]?.[0]?.[1] || topRows[3]?.[0] || ''],
    ['Tanggal Lahir / Umur', data?.identity?.husbandRows?.[2]?.[0]?.[1] || topRows[3]?.[1] || ''],
    ['Pekerjaan / Pendidikan', data?.identity?.husbandRows?.[2]?.[1]?.[1] || topRows[3]?.[2] || ''],
    [
      'Golongan Darah Suami',
      data?.identity?.husbandRows?.[3]?.[0]?.[1] || measurements[1]?.[3] || ''
    ],
    ['Nomor Telepon Suami', data?.identity?.husbandRows?.[3]?.[1]?.[1] || topRows[4]?.[0] || ''],
    ['Pernikahan Ke', data?.identity?.husbandRows?.[0]?.[1]?.[1] || topRows[0]?.[1] || ''],
    ['Tanggal Menikah', data?.identity?.husbandRows?.[1]?.[1]?.[1] || topRows[0]?.[2] || '']
  ];

  husbandFieldRows.forEach((item) => {
    currentLine += 1;
    addFullFieldRow(ws, currentLine, item[0], item[1]);
  });

  currentLine += 1;
  addSectionHeader(ws, currentLine, 'I.C. ALAMAT DAN DOMISILI', 8);

  const locSummary = [
    data?.identity?.locationRows?.[0]?.[1] || locations[0],
    data?.identity?.locationRows?.[1]?.[1] || locations[1],
    data?.identity?.locationRows?.[2]?.[1] || locations[2]
  ]
    .filter(Boolean)
    .join(' | ');

  const addressFieldRows = [
    ['Alamat Domisili', data?.identity?.addressRows?.[0]?.[1] || fullRows[1] || ''],
    ['Alamat KTP', data?.identity?.addressRows?.[1]?.[1] || fullRows[2] || ''],
    ['Dasawisma / Posyandu / Puskesmas', locSummary]
  ];

  addressFieldRows.forEach((item) => {
    currentLine += 1;
    addFullFieldRow(ws, currentLine, item[0], item[1]);
  });

  currentLine += 1;
  addSectionHeader(ws, currentLine, 'I.D. PEMERIKSAAN FISIK', 8);

  const physSummary =
    data?.identity?.physicalRows?.map((p) => `${p[0]}: ${p[1]}`).join('  |  ') ||
    `TB: ${measurements[0]?.[0]}  |  BB: ${measurements[1]?.[0]}  |  LiLA: ${measurements[0]?.[1]}  |  IMT: ${measurements[1]?.[1]}`;

  currentLine += 1;
  addFullFieldRow(ws, currentLine, 'Hasil Pengukuran Fisik', physSummary);

  // Section II: ANAMNESA
  currentLine += 2;
  addSectionHeader(ws, currentLine, 'II. ANAMNESA & FAKTOR RISIKO', 8);

  const prompts = data?.anamnesa?.promptValues || [];
  const risk = data?.anamnesa?.riskChecked || {};

  const anamnesaRows = [
    [
      'HPHT (Haid Pertama Terakhir)',
      prompts[0] || '',
      'HPL (Hari Perkiraan Lahir)',
      prompts[1] || ''
    ],
    ['Usia Kehamilan (UK)', prompts[2] || '', 'Keluhan Saat Ini', prompts[3] || ''],
    [
      'Merokok',
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
    data?.anamnesa?.environment || ''
  );
  currentLine += 1;
  addFullFieldRow(ws, currentLine, 'Catatan Lainnya', data?.anamnesa?.otherLines?.[0] || '');

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

  const diseases = data?.anamnesa?.diseaseHistory || {};
  CANONICAL_MATERNAL_CONDITIONS.forEach((condDef, idx) => {
    currentLine += 1;
    const rec = diseases[condDef.docLabel];
    const status = rec?.status === 'ya' ? 'Ya' : rec?.status === 'tidak' ? 'Tidak' : '';
    const year = rec?.year || '';

    ws.mergeCells(`B${currentLine}:D${currentLine}`);
    ws.mergeCells(`E${currentLine}:F${currentLine}`);
    ws.mergeCells(`G${currentLine}:H${currentLine}`);

    const r = ws.getRow(currentLine);
    r.getCell(1).value = idx + 1;
    r.getCell(1).font = { name: 'Calibri', size: 9 };
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(2).value =
      condDef.code === 'OTHER' && rec?.notes
        ? rec.notes
        : condDef.docLabel || '..............................';
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
      row.getCell(3).value = r[2] || '';
      row.getCell(4).value = r[3] || '';
      row.getCell(5).value = r[4] || '';
      row.getCell(6).value = r[5] || '';
      row.getCell(7).value = r[6] || '';
      row.getCell(8).value = r[7] ? (r[8] ? `${r[7]} (${r[8]})` : r[7]) : r[8] || '';

      for (let c = 1; c <= 8; c += 1) {
        row.getCell(c).font = { name: 'Calibri', size: 9 };
        if (c > 2) {
          row.getCell(c).alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true,
            indent: 1
          };
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
      row.getCell(2).value = r[1] || '';
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).value = r[2] || '';
      row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      row.getCell(5).value = r[3] || '';
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(6).value = r[4] || '';
      row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(7).value = r[5] ? (r[6] ? `${r[5]} (${r[6]})` : r[5]) : r[6] || '';
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
