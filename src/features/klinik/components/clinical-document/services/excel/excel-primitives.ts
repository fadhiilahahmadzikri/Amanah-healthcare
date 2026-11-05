import ExcelJS from 'exceljs';
import { CLINIC_LOGO_BASE64 } from '../../assets/clinic-logo.asset';

export const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
};

export const SECTION_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFEAEAEA' }
};

export const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFDFDFDF' }
};

export function applyCellBorder(cell: ExcelJS.Cell) {
  cell.border = THIN_BORDER;
}

export function applyRowBorders(row: ExcelJS.Row, startCol: number, endCol: number) {
  for (let c = startCol; c <= endCol; c += 1) {
    applyCellBorder(row.getCell(c));
  }
}

export function addSquareLogo(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet) {
  const imageId = wb.addImage({
    base64: CLINIC_LOGO_BASE64,
    extension: 'png'
  });
  ws.addImage(imageId, {
    tl: { col: 0.1, row: 0.2 },
    ext: { width: 54, height: 54 }
  });
}

export function parseNativeNumber(val: any): number | string {
  if (typeof val === 'number') return val;
  if (!val || typeof val !== 'string') return '-';
  const clean = val.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  if (clean && !isNaN(Number(clean))) {
    return Number(clean);
  }
  return val;
}

export function addSectionHeader(
  ws: ExcelJS.Worksheet,
  rowIdx: number,
  title: string,
  endCol = 8
) {
  const endLetter = String.fromCharCode(64 + endCol);
  ws.mergeCells(`A${rowIdx}:${endLetter}${rowIdx}`);
  const c = ws.getCell(`A${rowIdx}`);
  c.value = title;
  c.font = { bold: true, size: 9.5, name: 'Calibri' };
  c.fill = SECTION_FILL;
  c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  applyRowBorders(ws.getRow(rowIdx), 1, endCol);
}

export function addFourFieldRow(
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
    indent: 1,
    wrapText: true
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
    indent: 1,
    wrapText: true
  };

  applyRowBorders(r, 1, 8);
}

export function addFullFieldRow(
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
  cC.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };

  applyRowBorders(r, 1, 8);
}
