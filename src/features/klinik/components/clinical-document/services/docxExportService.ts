import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import { defaultPmbConfig } from '../config/pmb-config';
import { defaultImunisasiConfig } from '../config/imunisasi-config';
import { defaultRegulerConfig } from '../config/reguler-config';
import type { PmbFormData, ImunisasiFormData, RegulerFormData } from '../types';

const BLACK = '000000';
const LIGHT = '777777';
const PRIMARY = '166534'; // Forest green

function halfPoints(points: number): number {
  return Math.round(points * 2);
}

function lineSpacing() {
  return { before: 0, after: 0 };
}

function border(style: (typeof BorderStyle)[keyof typeof BorderStyle] = BorderStyle.SINGLE, size = 4, color = BLACK) {
  return { style, size, color };
}

function noBorder() {
  return border(BorderStyle.NONE, 0, 'FFFFFF');
}

function allBorders(style = BorderStyle.SINGLE, size = 4, color = BLACK) {
  const value = border(style, size, color);
  return {
    top: value,
    bottom: value,
    left: value,
    right: value,
    insideHorizontal: value,
    insideVertical: value,
  };
}

function noneTableBorders() {
  const value = noBorder();
  return {
    top: value,
    bottom: value,
    left: value,
    right: value,
    insideHorizontal: value,
    insideVertical: value,
  };
}

function noneCellBorders() {
  const value = noBorder();
  return { top: value, bottom: value, left: value, right: value };
}

function textRun(text: string, options: { bold?: boolean; italics?: boolean; size?: number; font?: string; color?: string } = {}) {
  return new TextRun({
    text,
    bold: options.bold,
    italics: options.italics,
    color: options.color,
    font: options.font || 'Times New Roman',
    size: halfPoints(options.size || 7.3),
  });
}

function paragraph(text = '', options: { bold?: boolean; italics?: boolean; size?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; children?: TextRun[] } = {}) {
  const children = options.children || [textRun(text || ' ', options)];
  return new Paragraph({
    children,
    alignment: options.alignment,
    spacing: lineSpacing(),
  });
}

function cell(children: Paragraph | Paragraph[] | Table, width: number, options: { colSpan?: number; borders?: any; margins?: any; verticalAlign?: any } = {}) {
  const normalizedChildren = Array.isArray(children) ? children : [children];
  return new TableCell({
    children: normalizedChildren.length > 0 ? (normalizedChildren as any) : [paragraph(' ')],
    width: { size: width, type: WidthType.DXA },
    columnSpan: options.colSpan,
    verticalAlign: options.verticalAlign || VerticalAlign.CENTER,
    margins: options.margins,
    borders: options.borders,
  });
}

function textCell(text: string, width: number, options: { bold?: boolean; size?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; borders?: any } = {}) {
  return cell(
    paragraph(text, {
      bold: options.bold,
      size: options.size,
      alignment: options.alignment,
    }),
    width,
    options
  );
}

function lineCell(label = '', width: number, options: { value?: string; size?: number; columnSpan?: number; borders?: any; margins?: any } = {}) {
  const text = options.value ? (label ? `${label} ${options.value}` : options.value) : label || ' ';
  return cell(
    new Paragraph({
      children: [textRun(text, { size: options.size || 7.3 })],
      border: { bottom: border(BorderStyle.DOTTED, 3, LIGHT) },
      spacing: lineSpacing(),
    }),
    width,
    options
  );
}

function row(children: TableCell[], height?: number) {
  return new TableRow({
    children,
    height: height ? { value: height, rule: HeightRule.EXACT } : undefined,
  });
}

function table(columnWidths: number[], rows: TableRow[], options: { alignment?: any; borders?: any; margins?: any } = {}) {
  const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  return new Table({
    rows,
    columnWidths,
    width: { size: tableWidth, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    alignment: options.alignment || AlignmentType.CENTER,
    borders: options.borders || allBorders(),
    margins: options.margins,
  });
}

export async function exportPmbDocx(data?: PmbFormData | null, filename = 'form_praktik_mandiri_bidan.docx') {
  const cfg = defaultPmbConfig;
  const headerWidths = [cfg.header.leftBoxWidth, cfg.header.centerWidth, cfg.header.rightBoxWidth];

  const logoBox = table([cfg.header.leftBoxWidth - 260], [row([cell(paragraph('AMANAH'), cfg.header.leftBoxWidth - 260)], cfg.header.logoHeight)]);
  const clinicChildren = cfg.header.clinicLines.map((line) =>
    paragraph(line.text, { alignment: AlignmentType.CENTER, bold: line.bold, size: line.size })
  );
  // Respect doctor order: RMANC.2 row is empty
  const rmTable = table(
    [cfg.header.rightBoxWidth - cfg.header.rmInset],
    cfg.header.rmRows.map((t) =>
      row([textCell(t, cfg.header.rightBoxWidth - cfg.header.rmInset, { alignment: AlignmentType.CENTER, size: t.startsWith('RM') ? 7.6 : 7.2 })], cfg.header.rmRowHeight)
    )
  );

  const headerTable = table(
    headerWidths,
    [row([cell(logoBox, headerWidths[0], { borders: noneCellBorders() }), cell(clinicChildren, headerWidths[1], { borders: noneCellBorders() }), cell(rmTable, headerWidths[2], { borders: noneCellBorders() })], cfg.header.height)],
    { borders: noneTableBorders() }
  );

  const doubleRule = new Paragraph({
    children: [new TextRun({ text: ' ', size: 1 })],
    border: { bottom: border(BorderStyle.DOUBLE, 8, BLACK) },
    spacing: lineSpacing(),
  });

  const allergyTable = table(
    [760, 3420],
    [row([textCell(cfg.header.allergyLabel, 760, { size: 7.2 }), lineCell('', 3420, { value: data?.header?.allergy })], 300)],
    { alignment: AlignmentType.RIGHT }
  );

  // Identity Table
  const identityRows: TableRow[] = [];
  cfg.identity.topRows.forEach((r, rowIdx) => {
    identityRows.push(
      row(
        r.map((val, colIdx) => {
          if (colIdx % 2 === 0) return textCell(val, cfg.identity.columns[colIdx], { size: cfg.typography.identity });
          const valIdx = (colIdx - 1) / 2;
          return lineCell('', cfg.identity.columns[colIdx], { size: cfg.typography.identity, value: data?.identity?.topRowValues?.[rowIdx]?.[valIdx] });
        }),
        265
      )
    );
  });

  cfg.identity.fullRows.forEach((lbl, rIdx) => {
    const spanWidth = cfg.identity.columns.slice(1).reduce((a, b) => a + b, 0);
    identityRows.push(
      row([textCell(lbl, cfg.identity.columns[0], { size: cfg.typography.identity }), lineCell('', spanWidth, { columnSpan: 5, size: cfg.typography.identity, value: data?.identity?.fullRowValues?.[rIdx] })], 265)
    );
  });

  const identityTable = table(cfg.identity.columns, identityRows);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: cfg.page.size.width, height: cfg.page.size.height, orientation: PageOrientation.PORTRAIT },
            margin: cfg.page.margin,
          },
        },
        children: [
          headerTable,
          doubleRule,
          allergyTable,
          paragraph('IDENTITAS', { bold: true, size: 8.2 }),
          identityTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

export async function exportImunisasiDocx(data?: ImunisasiFormData | null, filename = 'rekam_medis_imunisasi.docx') {
  const cfg = defaultImunisasiConfig;

  const headerTable = table(
    [cfg.header.titleWidth, cfg.header.codeWidth],
    [
      row([
        cell(
          [paragraph(cfg.header.title, { bold: true, size: 11 }), paragraph(cfg.header.subtitle, { size: 10 })],
          cfg.header.titleWidth,
          { borders: noneCellBorders() }
        ),
        cell(
          paragraph(data?.header?.topCode ? `RM Code: ${data.header.topCode}` : ' ', { alignment: AlignmentType.RIGHT }),
          cfg.header.codeWidth,
          { borders: noneCellBorders() }
        ),
      ]),
    ],
    { borders: noneTableBorders() }
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: cfg.page.size.width, height: cfg.page.size.height, orientation: PageOrientation.PORTRAIT },
            margin: cfg.page.margin,
          },
        },
        children: [
          headerTable,
          paragraph('REKAM MEDIS IMUNISASI ANAK', { bold: true, size: 9 }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

export async function exportRegulerDocx(data?: RegulerFormData | null, filename = 'rekam_medis_rawat_jalan.docx') {
  const cfg = defaultRegulerConfig;

  const headerTable = table(
    [2000, 5500, 3100],
    [
      row([
        textCell('AMANAH HEALTHCARE', 2000, { bold: true, size: 9, alignment: AlignmentType.CENTER }),
        cell([
          paragraph(cfg.header.clinicName, { bold: true, size: 10, alignment: AlignmentType.CENTER }),
          paragraph(cfg.header.clinicTagline, { bold: true, size: 8, alignment: AlignmentType.CENTER }),
          paragraph(cfg.header.clinicAddress, { size: 7, alignment: AlignmentType.CENTER }),
          paragraph(cfg.header.clinicContact, { size: 6.5, alignment: AlignmentType.CENTER }),
        ], 5500, { borders: noneCellBorders() }),
        cell([
          paragraph('NOMOR REKAM MEDIS', { bold: true, size: 7.5, alignment: AlignmentType.CENTER }),
          paragraph(data?.medicalRecordNumber || '-', { bold: true, size: 9, alignment: AlignmentType.CENTER }),
        ], 3100),
      ]),
    ],
    { borders: noneTableBorders() }
  );

  const doubleRule = new Paragraph({
    children: [new TextRun({ text: ' ', size: 1 })],
    border: { bottom: border(BorderStyle.DOUBLE, 8, BLACK) },
    spacing: lineSpacing(),
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          headerTable,
          doubleRule,
          paragraph('FORMULIR PENDAFTARAN & REKAM MEDIS RAWAT JALAN', { bold: true, size: 10, alignment: AlignmentType.CENTER }),
          paragraph('I. INFORMASI KUNJUNGAN', { bold: true, size: 8 }),
          table([2500, 3500, 2500, 3400], [
            row([
              textCell('Kode Booking', 2500, { bold: true, size: 7.5 }),
              textCell(data?.bookingCode || '-', 3500, { size: 7.5 }),
              textCell('Nomor Antrean', 2500, { bold: true, size: 7.5 }),
              textCell(data?.queueNumber || '-', 3400, { bold: true, size: 7.5 }),
            ]),
            row([
              textCell('Layanan / Poli', 2500, { bold: true, size: 7.5 }),
              textCell(data?.serviceName || 'Poli Umum', 3500, { size: 7.5 }),
              textCell('Dokter Pemeriksa', 2500, { bold: true, size: 7.5 }),
              textCell(data?.doctorName || '-', 3400, { bold: true, size: 7.5 }),
            ]),
          ]),
          paragraph(' ', { size: 4 }),
          paragraph('II. IDENTITAS PASIEN', { bold: true, size: 8 }),
          table([2500, 3500, 2500, 3400], [
            row([
              textCell('NIK', 2500, { bold: true, size: 7.5 }),
              textCell(data?.identity?.nik || '-', 3500, { size: 7.5 }),
              textCell('Nama Lengkap', 2500, { bold: true, size: 7.5 }),
              textCell(data?.identity?.fullName || '-', 3400, { bold: true, size: 7.5 }),
            ]),
            row([
              textCell('Tempat/Tgl Lahir', 2500, { bold: true, size: 7.5 }),
              textCell(`${data?.identity?.birthPlace || ''}, ${data?.identity?.birthDate || ''}`, 3500, { size: 7.5 }),
              textCell('Jenis Kelamin / Usia', 2500, { bold: true, size: 7.5 }),
              textCell(`${data?.identity?.gender || '-'} (${data?.identity?.age || '-'})`, 3400, { size: 7.5 }),
            ]),
            row([
              textCell('No Handphone', 2500, { bold: true, size: 7.5 }),
              textCell(data?.identity?.phoneNumber || '-', 3500, { size: 7.5 }),
              textCell('Email', 2500, { bold: true, size: 7.5 }),
              textCell(data?.identity?.email || '-', 3400, { size: 7.5 }),
            ]),
            row([
              textCell('Alamat Lengkap', 2500, { bold: true, size: 7.5 }),
              cell([paragraph(data?.identity?.address || '-')], 9400, { colSpan: 3 }),
            ]),
          ]),
          paragraph(' ', { size: 4 }),
          paragraph('III. ANAMNESIS & PEMERIKSAAN KLINIS', { bold: true, size: 8 }),
          table([3968, 3968, 3970], [
            row([
              textCell(`Tinggi Badan: ${data?.clinical?.vitalHeightCm || '-'}`, 3968, { size: 7.5 }),
              textCell(`Berat Badan: ${data?.clinical?.vitalWeightKg || '-'}`, 3968, { size: 7.5 }),
              textCell(`Tekanan Darah: ${data?.clinical?.vitalBloodPressure || '-'}`, 3970, { size: 7.5 }),
            ]),
          ]),
          paragraph(`Keluhan Utama: ${data?.clinical?.chiefComplaint || '-'}`, { size: 7.5 }),
          paragraph(`Riwayat Alergi: ${data?.clinical?.allergyHistory || '-'}`, { size: 7.5, bold: true }),
          paragraph(`Catatan Terapi: ${data?.clinical?.additionalNotes || '-'}`, { size: 7.5 }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
