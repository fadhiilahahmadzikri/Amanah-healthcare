import {
  AlignmentType,
  BorderStyle,
  CheckBox,
  HeightRule,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalAlignTable,
  WidthType
} from 'docx';
import { CLINIC_LOGO_BASE64 } from '../../assets/clinic-logo.asset';

export const BLACK = '000000';
export const LIGHT = '777777';

export const TABLE_MARGIN = {
  marginUnitType: WidthType.DXA,
  top: 70,
  bottom: 70,
  left: 100,
  right: 100
};

export const DEFAULT_MARGIN = {
  marginUnitType: WidthType.DXA,
  top: 70,
  bottom: 70,
  left: 100,
  right: 100
};

export const TIGHT_MARGIN = {
  marginUnitType: WidthType.DXA,
  top: 0,
  bottom: 0,
  left: 18,
  right: 18
};

export function halfPoints(points: number): number {
  return Math.round(points * 2);
}

export function lineSpacing(extra: { before?: number; after?: number } = {}) {
  return {
    before: extra.before ?? 0,
    after: extra.after ?? 0
  };
}

export function border(
  style: (typeof BorderStyle)[keyof typeof BorderStyle] = BorderStyle.SINGLE,
  size = 4,
  color = BLACK
) {
  return { style, size, color };
}

export function noBorder() {
  return border(BorderStyle.NONE, 0, 'FFFFFF');
}

export function allBorders(
  style: (typeof BorderStyle)[keyof typeof BorderStyle] = BorderStyle.SINGLE,
  size = 4,
  color = BLACK
) {
  const value = border(style, size, color);
  return {
    top: value,
    bottom: value,
    left: value,
    right: value,
    insideHorizontal: value,
    insideVertical: value
  };
}

export function tableBorders(
  options: {
    style?: (typeof BorderStyle)[keyof typeof BorderStyle];
    size?: number;
    color?: string;
    insideHorizontal?: boolean;
    insideVertical?: boolean;
  } = {}
) {
  const outer = border(
    options.style || BorderStyle.SINGLE,
    options.size || 4,
    options.color || BLACK
  );
  const innerH = options.insideHorizontal === false ? noBorder() : outer;
  const innerV = options.insideVertical === false ? noBorder() : outer;
  return {
    top: outer,
    bottom: outer,
    left: outer,
    right: outer,
    insideHorizontal: innerH,
    insideVertical: innerV
  };
}

export function cellBorders(
  options: {
    top?: any;
    bottom?: any;
    left?: any;
    right?: any;
  } = {}
) {
  return {
    top: options.top || border(),
    bottom: options.bottom || border(),
    left: options.left || border(),
    right: options.right || border()
  };
}

export function noneTableBorders() {
  const value = noBorder();
  return {
    top: value,
    bottom: value,
    left: value,
    right: value,
    insideHorizontal: value,
    insideVertical: value
  };
}

export function noneCellBorders() {
  const value = noBorder();
  return {
    top: value,
    bottom: value,
    left: value,
    right: value
  };
}

export function textRun(
  text: string,
  options: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    size?: number;
    font?: string;
    color?: string;
  } = {}
) {
  return new TextRun({
    text,
    bold: options.bold,
    italics: options.italics,
    underline: options.underline ? { type: UnderlineType.SINGLE } : undefined,
    color: options.color,
    font: options.font || 'Times New Roman',
    size: halfPoints(options.size || 7.3)
  });
}

export function lineText(label = '', value = ''): string {
  if (!value) return label || '';
  return label ? `${label} ${value}` : value;
}

export function paragraph(
  text = '',
  options: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    size?: number;
    font?: string;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    border?: any;
    children?: TextRun[];
    spacing?: { before?: number; after?: number };
  } = {}
) {
  const children = options.children || [textRun(text || ' ', options)];
  return new Paragraph({
    children,
    alignment: options.alignment,
    border: options.border,
    spacing: lineSpacing(options.spacing)
  });
}

export function blankParagraph(size = 7.3): Paragraph {
  return paragraph(' ', { size });
}

export function sectionLabel(
  text: string,
  options: { before?: number; after?: number } = {}
): Paragraph {
  return paragraph(text, {
    bold: true,
    size: 8.2,
    spacing: {
      before: options.before ?? 90,
      after: options.after ?? 20
    }
  });
}

export function verticalGap(height: number): Paragraph {
  return paragraph(' ', {
    size: 1,
    spacing: { before: 0, after: height }
  });
}

export function writingLine(
  label = '',
  options: {
    size?: number;
    bold?: boolean;
    lineStyle?: (typeof BorderStyle)[keyof typeof BorderStyle];
    lineSize?: number;
    lineColor?: string;
  } = {}
): Paragraph {
  return paragraph(label || ' ', {
    size: options.size || 7.3,
    bold: options.bold,
    border: {
      bottom: border(
        options.lineStyle || BorderStyle.DOTTED,
        options.lineSize || 3,
        options.lineColor || LIGHT
      )
    }
  });
}

export function cell(
  children: Paragraph | Table | (Paragraph | Table)[],
  width: number,
  options: {
    columnSpan?: number;
    rowSpan?: number;
    verticalAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
    margins?: any;
    borders?: any;
  } = {}
): TableCell {
  const normalizedChildren = Array.isArray(children) ? children : [children];
  return new TableCell({
    children: normalizedChildren.length > 0 ? (normalizedChildren as any) : [blankParagraph()],
    width: { size: width, type: WidthType.DXA },
    columnSpan: options.columnSpan,
    rowSpan: options.rowSpan,
    verticalAlign: options.verticalAlign || VerticalAlignTable.CENTER,
    margins: options.margins || TABLE_MARGIN,
    borders: options.borders
  });
}

export function textCell(
  text: string,
  width: number,
  options: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    verticalAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
    columnSpan?: number;
    rowSpan?: number;
    borders?: any;
    margins?: any;
  } = {}
): TableCell {
  return cell(
    paragraph(text, {
      bold: options.bold,
      italics: options.italics,
      underline: options.underline,
      size: options.size || 7.3,
      alignment: options.alignment
    }),
    width,
    options
  );
}

export function checkboxCell(
  label: string,
  width: number,
  options: {
    checked?: boolean;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    verticalAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
    columnSpan?: number;
    rowSpan?: number;
    borders?: any;
    margins?: any;
  } = {}
): TableCell {
  return cell(
    new Paragraph({
      alignment: options.alignment,
      spacing: lineSpacing(),
      children: [
        new CheckBox({ checked: Boolean(options.checked) }),
        textRun(` ${label}`, { size: options.size || 7.3 })
      ]
    }),
    width,
    options
  );
}

export function lineCell(
  label: string,
  width: number,
  options: {
    value?: string;
    size?: number;
    bold?: boolean;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    verticalAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
    columnSpan?: number;
    rowSpan?: number;
    borders?: any;
    margins?: any;
    children?: TextRun[];
  } = {}
): TableCell {
  const align = options.alignment || AlignmentType.LEFT;
  if (options.children) {
    return cell(
      new Paragraph({
        children: options.children,
        alignment: align,
        spacing: lineSpacing()
      }),
      width,
      options
    );
  }
  const text = lineText(label, options.value);
  return cell(
    paragraph(text || ' ', {
      size: options.size || 7.3,
      bold: options.bold,
      alignment: align
    }),
    width,
    options
  );
}

export function dashedCell(
  label: string,
  width: number,
  options: {
    value?: string;
    size?: number;
    columnSpan?: number;
    topBorder?: any;
  } = {}
): TableCell {
  return cell(
    paragraph(lineText(label, options.value) || ' ', { size: options.size || 7.3 }),
    width,
    {
      ...options,
      borders: {
        top: options.topBorder || noBorder(),
        bottom: border(BorderStyle.DASHED, 4, LIGHT),
        left: border(),
        right: border()
      }
    }
  );
}

export function blankIntegratedCell(
  width: number,
  options: {
    columnSpan?: number;
    size?: number;
    isLast?: boolean;
  } = {}
): TableCell {
  return cell(blankParagraph(options.size || 7.3), width, {
    ...options,
    borders: {
      top: noBorder(),
      bottom: options.isLast ? border() : noBorder(),
      left: border(),
      right: border()
    }
  });
}

export function row(children: TableCell[], height?: number): TableRow {
  return new TableRow({
    children,
    height: height ? { value: height, rule: HeightRule.EXACT } : undefined
  });
}

export function table(
  columnWidths: number[],
  rows: TableRow[],
  options: {
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    borders?: any;
    margins?: any;
  } = {}
): Table {
  const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  return new Table({
    rows,
    columnWidths,
    width: { size: tableWidth, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    alignment: options.alignment || AlignmentType.CENTER,
    borders: options.borders || allBorders(),
    margins: options.margins || TIGHT_MARGIN
  });
}

export function columnWidth(columns: number[], start: number, count = 1): number {
  return columns.slice(start, start + count).reduce((sum, width) => sum + width, 0);
}

export function getLogoBytes(): Uint8Array {
  const base64 = CLINIC_LOGO_BASE64.replace(/^data:image\/[a-z]+;base64,/, '');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
