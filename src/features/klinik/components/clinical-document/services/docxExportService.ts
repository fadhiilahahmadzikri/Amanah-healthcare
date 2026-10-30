import {
  AlignmentType,
  BorderStyle,
  CheckBox,
  Document,
  HeightRule,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalAlign,
  VerticalAlignTable,
  WidthType
} from 'docx';
import { saveAs } from 'file-saver';
import { defaultPmbConfig } from '../config/pmb-config';
import { defaultImunisasiConfig } from '../config/imunisasi-config';
import { defaultRegulerConfig } from '../config/reguler-config';
import type { PmbFormData, ImunisasiFormData, RegulerFormData } from '../types';
import { CLINIC_LOGO_BASE64 } from '../assets/clinic-logo.asset';

const BLACK = '000000';
const LIGHT = '777777';

const TABLE_MARGIN = {
  marginUnitType: WidthType.DXA,
  top: 18,
  bottom: 18,
  left: 28,
  right: 28
};

const DEFAULT_MARGIN = {
  marginUnitType: WidthType.DXA,
  top: 18,
  bottom: 18,
  left: 42,
  right: 42
};

const TIGHT_MARGIN = {
  marginUnitType: WidthType.DXA,
  top: 0,
  bottom: 0,
  left: 18,
  right: 18
};

function halfPoints(points: number): number {
  return Math.round(points * 2);
}

function lineSpacing(extra: { before?: number; after?: number } = {}) {
  return {
    before: extra.before ?? 0,
    after: extra.after ?? 0
  };
}

function border(
  style: (typeof BorderStyle)[keyof typeof BorderStyle] = BorderStyle.SINGLE,
  size = 4,
  color = BLACK
) {
  return { style, size, color };
}

function noBorder() {
  return border(BorderStyle.NONE, 0, 'FFFFFF');
}

function allBorders(
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

function tableBorders(
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

function cellBorders(
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

function noneTableBorders() {
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

function noneCellBorders() {
  const value = noBorder();
  return {
    top: value,
    bottom: value,
    left: value,
    right: value
  };
}

function textRun(
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

function lineText(label = '', value = ''): string {
  if (!value) return label || '';
  return label ? `${label} ${value}` : value;
}

function paragraph(
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

function blankParagraph(size = 7.3): Paragraph {
  return paragraph(' ', { size });
}

function sectionLabel(text: string, options: { before?: number; after?: number } = {}): Paragraph {
  return paragraph(text, {
    bold: true,
    size: 8.2,
    spacing: {
      before: options.before ?? 90,
      after: options.after ?? 20
    }
  });
}

function verticalGap(height: number): Paragraph {
  return paragraph(' ', {
    size: 1,
    spacing: { before: 0, after: height }
  });
}

function writingLine(
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

function cell(
  children: Paragraph | Table | (Paragraph | Table)[],
  width: number,
  options: {
    columnSpan?: number;
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
    verticalAlign: options.verticalAlign || VerticalAlignTable.CENTER,
    margins: options.margins || TABLE_MARGIN,
    borders: options.borders
  });
}

function textCell(
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

function checkboxCell(
  label: string,
  width: number,
  options: {
    checked?: boolean;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    verticalAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
    columnSpan?: number;
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

function lineCell(
  label: string,
  width: number,
  options: {
    value?: string;
    size?: number;
    bold?: boolean;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    verticalAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
    columnSpan?: number;
    borders?: any;
    margins?: any;
    children?: TextRun[];
  } = {}
): TableCell {
  if (options.children) {
    return cell(
      new Paragraph({
        children: options.children,
        alignment: options.alignment,
        border: { bottom: border(BorderStyle.DOTTED, 3, LIGHT) },
        spacing: lineSpacing()
      }),
      width,
      options
    );
  }
  return cell(writingLine(lineText(label, options.value), options), width, options);
}

function dashedCell(
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

function blankIntegratedCell(
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

function row(children: TableCell[], height?: number): TableRow {
  return new TableRow({
    children,
    height: height ? { value: height, rule: HeightRule.EXACT } : undefined
  });
}

function table(
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

function columnWidth(columns: number[], start: number, count = 1): number {
  return columns.slice(start, start + count).reduce((sum, width) => sum + width, 0);
}

function getLogoBytes(): Uint8Array {
  const base64 = CLINIC_LOGO_BASE64.replace(/^data:image\/[a-z]+;base64,/, '');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Ported 1:1 from D:\docucare\scripts\generate-praktik-mandiri-bidan-form.cjs
 */
export async function exportPmbDocx(
  data?: PmbFormData | null,
  filename = 'form_praktik_mandiri_bidan.docx'
): Promise<void> {
  const cfg = defaultPmbConfig;

  // 1. Build Header
  const headerWidths = [cfg.header.leftBoxWidth, cfg.header.centerWidth, cfg.header.rightBoxWidth];
  const rmInnerWidth = cfg.header.rightBoxWidth - cfg.header.rmInset;

  const logoBytes = getLogoBytes();
  const logoParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: lineSpacing(),
    children: [
      new ImageRun({
        data: logoBytes,
        transformation: {
          width: 50,
          height: 50
        },
        type: 'png'
      })
    ]
  });

  const logoBox = table(
    [cfg.header.leftBoxWidth - 260],
    [
      row(
        [
          cell(logoParagraph, cfg.header.leftBoxWidth - 260, {
            margins: TIGHT_MARGIN,
            verticalAlign: VerticalAlignTable.CENTER,
            borders: noneCellBorders()
          })
        ],
        cfg.header.logoHeight
      )
    ],
    { borders: noneTableBorders() }
  );

  const clinicChildren = cfg.header.clinicLines.map((line) =>
    paragraph(line.text, {
      alignment: AlignmentType.CENTER,
      bold: line.bold,
      size: line.size
    })
  );

  const rmCode = data?.header?.rmAncCode;
  const rmTable = table(
    [rmInnerWidth],
    cfg.header.rmRows.map((text, idx) =>
      row(
        [
          textCell(idx === 0 && rmCode ? `RM ANC : ${rmCode}` : text, rmInnerWidth, {
            alignment: AlignmentType.CENTER,
            size: text.startsWith('RM') ? 7.6 : 7.2
          })
        ],
        cfg.header.rmRowHeight
      )
    )
  );

  const headerTable = table(
    headerWidths,
    [
      row(
        [
          cell(logoBox, headerWidths[0], { borders: noneCellBorders(), margins: TIGHT_MARGIN }),
          cell(clinicChildren, headerWidths[1], {
            borders: noneCellBorders(),
            margins: TIGHT_MARGIN
          }),
          cell(rmTable, headerWidths[2], { borders: noneCellBorders(), margins: TIGHT_MARGIN })
        ],
        cfg.header.height
      )
    ],
    { borders: noneTableBorders() }
  );

  const doubleRule = paragraph(' ', {
    size: 1,
    border: {
      bottom: border(BorderStyle.DOUBLE, 8, BLACK)
    }
  });

  const allergyTable = table(
    [760, 3420],
    [
      row(
        [
          textCell(cfg.header.allergyLabel, 760, { size: 7.2 }),
          lineCell('', 3420, {
            margins: TIGHT_MARGIN,
            value: data?.header?.allergy
          })
        ],
        300
      )
    ],
    { alignment: AlignmentType.RIGHT }
  );

  const headerChildren = [
    headerTable,
    doubleRule,
    verticalGap(cfg.header.allergyTopGap),
    allergyTable
  ];

  // 2. Build Identity
  const identityColumns = cfg.identity.columns;
  const identitySize = cfg.typography.identity;
  const identityRows: TableRow[] = [];

  for (const [rowIndex, values] of cfg.identity.topRows.entries()) {
    identityRows.push(
      row(
        values.map((value, index) => {
          if (index % 2 === 0) {
            return textCell(value, identityColumns[index], { size: identitySize });
          }
          return lineCell('', identityColumns[index], {
            size: identitySize,
            value: data?.identity?.topRowValues?.[rowIndex]?.[(index - 1) / 2]
          });
        }),
        265
      )
    );
  }

  for (const [rowIndex, label] of cfg.identity.fullRows.entries()) {
    identityRows.push(
      row(
        [
          textCell(label, identityColumns[0], { size: identitySize }),
          lineCell('', columnWidth(identityColumns, 1, 5), {
            columnSpan: 5,
            size: identitySize,
            value: data?.identity?.fullRowValues?.[rowIndex]
          })
        ],
        265
      )
    );
  }

  // Location record cells
  const groupStarts = [0, 2, 4];
  const locationCells = cfg.identity.locationLabels.map((label, index) => {
    const isFirst = index === 0;
    const isLast = index === cfg.identity.locationLabels.length - 1;
    return lineCell(label, columnWidth(identityColumns, groupStarts[index], 2), {
      columnSpan: 2,
      size: identitySize,
      value: data?.identity?.locationValues?.[index],
      borders: {
        top: border(),
        bottom: border(),
        left: isFirst ? border() : noBorder(),
        right: isLast ? border() : noBorder()
      }
    });
  });
  identityRows.push(row(locationCells, 285));

  // Measurement rows
  const measurementSpans = [2, 2, 1, 1];
  const measurementStarts = [0, 2, 4, 5];
  for (const [rowIndex, measurementRow] of cfg.identity.measurementRows.entries()) {
    identityRows.push(
      row(
        measurementRow.map((label, index) =>
          lineCell(
            label,
            columnWidth(identityColumns, measurementStarts[index], measurementSpans[index]),
            {
              columnSpan: measurementSpans[index],
              size: identitySize,
              value: data?.identity?.measurementValues?.[rowIndex]?.[index]
            }
          )
        ),
        265
      )
    );
  }

  const identityChildren = [
    sectionLabel('IDENTITAS', { before: 70 }),
    table(identityColumns, identityRows)
  ];

  // 3. Build Anamnesa (Left Prompts/Risk + Right 14 Diseases)
  const leftColumns = cfg.anamnesa.riskColumns;
  const leftWidth = cfg.anamnesa.leftWidth;
  const otherStartRow = 8;
  const otherEndRow = otherStartRow + cfg.anamnesa.otherDashedRows;
  const diseaseColumns = cfg.anamnesa.diseaseColumns;
  const anamnesaColumns = [...cfg.anamnesa.riskColumns, ...cfg.anamnesa.diseaseColumns];

  const totalAnamnesaRows = Math.max(
    1 + cfg.anamnesa.diseases.length,
    cfg.anamnesa.prompts.length + 5 + cfg.anamnesa.integratedBlankRows
  );

  const anamnesaRows: TableRow[] = [];

  for (let rowIndex = 0; rowIndex < totalAnamnesaRows; rowIndex += 1) {
    // Build Left Cells
    let leftCells: TableCell[] = [];
    if (rowIndex < cfg.anamnesa.prompts.length) {
      leftCells = [
        lineCell(cfg.anamnesa.prompts[rowIndex], leftWidth, {
          columnSpan: 3,
          size: 6.8,
          value: data?.anamnesa?.promptValues?.[rowIndex]
        })
      ];
    } else if (rowIndex === 4) {
      leftCells = [
        textCell(cfg.anamnesa.riskTitle, leftWidth, {
          columnSpan: 3,
          bold: true,
          size: 6.7
        })
      ];
    } else if (rowIndex === 5 || rowIndex === 6) {
      const riskRow = cfg.anamnesa.riskGrid[rowIndex - 5];
      leftCells = riskRow.map((label, index) =>
        checkboxCell(label, leftColumns[index], {
          size: 6.5,
          checked: data?.anamnesa?.riskChecked?.[label]
        })
      );
    } else if (rowIndex === 7) {
      leftCells = [
        lineCell(cfg.anamnesa.environmentLabel, leftWidth, {
          columnSpan: 3,
          size: 6.8,
          value: data?.anamnesa?.environment
        })
      ];
    } else if (rowIndex >= otherStartRow && rowIndex < otherEndRow) {
      leftCells = [
        dashedCell(rowIndex === otherStartRow ? cfg.anamnesa.otherLabel : '', leftWidth, {
          columnSpan: 3,
          size: 6.8,
          value: data?.anamnesa?.otherLines?.[rowIndex - otherStartRow],
          topBorder: rowIndex === otherStartRow ? border() : noBorder()
        })
      ];
    } else {
      leftCells = [
        blankIntegratedCell(leftWidth, {
          columnSpan: 3,
          size: 6.8,
          isLast: rowIndex === totalAnamnesaRows - 1
        })
      ];
    }

    // Build Disease Cells
    let rightCells: TableCell[] = [];
    if (rowIndex === 0) {
      rightCells = ['No', 'Riwayat Penyakit', 'Ya', 'Tidak', 'Tahun'].map((label, index) =>
        textCell(label, diseaseColumns[index], {
          alignment: AlignmentType.CENTER,
          bold: true,
          size: 6.6
        })
      );
    } else {
      const disease = cfg.anamnesa.diseases[rowIndex - 1] || '';
      const diseaseRecord = disease
        ? data?.anamnesa?.diseaseHistory?.[disease]
        : data?.anamnesa?.diseaseHistory?.[''] || data?.anamnesa?.diseaseHistory?.['Lain-lain'];

      rightCells = [
        textCell(`${rowIndex}.`, diseaseColumns[0], {
          alignment: AlignmentType.CENTER,
          size: 6.5
        }),
        disease
          ? textCell(disease, diseaseColumns[1], { size: 6.5 })
          : lineCell('', diseaseColumns[1], { size: 6.5 }),
        textCell(diseaseRecord?.status === 'ya' ? 'X' : '', diseaseColumns[2], {
          alignment: AlignmentType.CENTER,
          size: 6.5
        }),
        textCell(diseaseRecord?.status === 'tidak' ? 'X' : '', diseaseColumns[3], {
          alignment: AlignmentType.CENTER,
          size: 6.5
        }),
        textCell(diseaseRecord?.year || '', diseaseColumns[4], {
          alignment: AlignmentType.CENTER,
          size: 6.5
        })
      ];
    }

    // Row Height
    let rHeight = 235;
    if (rowIndex === 0) rHeight = 260;
    else if (rowIndex === 5 || rowIndex === 6) rHeight = 320;

    anamnesaRows.push(row([...leftCells, ...rightCells], rHeight));
  }

  const anamnesaChildren = [sectionLabel('ANAMNESA'), table(anamnesaColumns, anamnesaRows)];

  // 4. Build Obstetri
  const titleWidth = 2800;
  const labelWidth = 340;
  const fieldWidth = 620;
  const closeWidth =
    cfg.page.contentWidth -
    titleWidth -
    (labelWidth + fieldWidth) * cfg.obstetri.pregnancyFields.length;
  const obstetriTitleWidths = [titleWidth];
  const obstetriTitleCells = [
    textCell(cfg.obstetri.title, titleWidth, {
      bold: true,
      size: cfg.typography.section,
      borders: noneCellBorders(),
      margins: TIGHT_MARGIN
    })
  ];

  cfg.obstetri.pregnancyFields.forEach((field) => {
    obstetriTitleWidths.push(labelWidth, fieldWidth);
    obstetriTitleCells.push(
      textCell(field, labelWidth, {
        bold: true,
        size: 7.2,
        borders: noneCellBorders(),
        margins: TIGHT_MARGIN
      })
    );
    obstetriTitleCells.push(
      lineCell('', fieldWidth, {
        borders: noneCellBorders(),
        margins: TIGHT_MARGIN,
        value: data?.pregnancyFields?.[field]
      })
    );
  });

  obstetriTitleWidths.push(closeWidth);
  obstetriTitleCells.push(
    textCell('', closeWidth, { borders: noneCellBorders(), margins: TIGHT_MARGIN })
  );

  const obstetriTitleTable = table(obstetriTitleWidths, [row(obstetriTitleCells, 260)], {
    borders: noneTableBorders(),
    alignment: AlignmentType.LEFT
  });

  // Obstetri Data Table
  const obstetriTableRows: TableRow[] = [
    row(
      cfg.obstetri.headers.map((header, index) =>
        textCell(header, cfg.obstetri.columns[index], {
          alignment: AlignmentType.CENTER,
          bold: true,
          size: 6.8
        })
      ),
      255
    )
  ];

  const sourceObstetri = data?.obstetriRows || [];
  for (let rowIndex = 0; rowIndex < cfg.obstetri.blankRows; rowIndex += 1) {
    const sampleRow = sourceObstetri[rowIndex] || [];
    obstetriTableRows.push(
      row(
        cfg.obstetri.columns.map((width, columnIndex) =>
          textCell(sampleRow[columnIndex] || '', width, {
            alignment: columnIndex === 0 ? AlignmentType.CENTER : undefined,
            size: 6.8
          })
        ),
        680
      )
    );
  }

  const obstetriChildren = [
    verticalGap(cfg.layout.obstetriTitleBefore),
    obstetriTitleTable,
    table(cfg.obstetri.columns, obstetriTableRows)
  ];

  // 5. Build KB
  const kbTableRows: TableRow[] = [
    row(
      cfg.kb.headers.map((header, index) =>
        textCell(header, cfg.kb.columns[index], {
          alignment: AlignmentType.CENTER,
          bold: true,
          size: 6.8
        })
      ),
      255
    )
  ];

  const sourceKb = data?.kbRows || [];
  for (let rowIndex = 0; rowIndex < cfg.kb.blankRows; rowIndex += 1) {
    const sampleRow = sourceKb[rowIndex] || [];
    kbTableRows.push(
      row(
        cfg.kb.columns.map((width, columnIndex) =>
          textCell(sampleRow[columnIndex] || '', width, {
            alignment: columnIndex === 0 ? AlignmentType.CENTER : undefined,
            size: 6.8
          })
        ),
        620
      )
    );
  }

  const kbChildren = [sectionLabel(cfg.kb.title), table(cfg.kb.columns, kbTableRows)];

  // Assemble full document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: cfg.typography.font,
            size: halfPoints(cfg.typography.body)
          },
          paragraph: {
            spacing: lineSpacing()
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: cfg.page.size.width,
              height: cfg.page.size.height,
              orientation: PageOrientation.PORTRAIT
            },
            margin: cfg.page.margin
          }
        },
        children: [
          ...headerChildren,
          ...identityChildren,
          ...anamnesaChildren,
          ...obstetriChildren,
          ...kbChildren
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Ported 1:1 from D:\docucare\scripts\generate-amanah-health-care-imunisasi-form.cjs
 */
export async function exportImunisasiDocx(
  data?: ImunisasiFormData | null,
  filename = 'rekam_medis_imunisasi.docx'
): Promise<void> {
  const cfg = defaultImunisasiConfig;

  // 1. Build Header with Code Boxes
  const topBox = table(
    [cfg.header.topBoxWidth],
    [
      row(
        [
          textCell(data?.header?.topCode || 'RM-01', cfg.header.topBoxWidth, {
            alignment: AlignmentType.CENTER,
            bold: true,
            margins: TIGHT_MARGIN
          })
        ],
        cfg.header.topBoxHeight
      )
    ],
    { alignment: AlignmentType.RIGHT }
  );

  const boxWidths = Array.from(
    { length: cfg.header.numberBoxCount },
    () => cfg.header.numberBoxWidth
  );
  const numberBoxes = table(
    boxWidths,
    [
      row(
        boxWidths.map((width, index) =>
          textCell(data?.header?.recordDigits?.[index] || '', width, {
            alignment: AlignmentType.CENTER,
            bold: Boolean(data?.header?.recordDigits?.[index]),
            margins: TIGHT_MARGIN
          })
        ),
        cfg.header.numberBoxHeight
      )
    ],
    { alignment: AlignmentType.RIGHT }
  );

  const codeBoxes = [topBox, paragraph(' ', { size: 1, spacing: { after: 85 } }), numberBoxes];

  const headerTable = table(
    [cfg.header.titleWidth, cfg.header.codeWidth],
    [
      row(
        [
          cell(
            [
              paragraph(cfg.header.title, {
                bold: true,
                underline: true,
                size: cfg.typography.title
              }),
              paragraph(cfg.header.subtitle, {
                size: cfg.typography.subtitle
              })
            ],
            cfg.header.titleWidth,
            {
              borders: noneCellBorders(),
              margins: TIGHT_MARGIN,
              verticalAlign: VerticalAlign.BOTTOM
            }
          ),
          cell(codeBoxes, cfg.header.codeWidth, {
            borders: noneCellBorders(),
            margins: TIGHT_MARGIN,
            verticalAlign: VerticalAlign.TOP
          })
        ],
        cfg.header.height
      )
    ],
    { borders: noneTableBorders() }
  );

  // 2. Build Identity
  const [leftLabelW, leftFieldW, rightLabelW, rightFieldW] = cfg.identity.columns;
  const identityRows = cfg.identity.rows.map((identityRow, index) => {
    const leftVal = data?.identity?.leftValues?.[index] ?? identityRow.leftValue;
    const rightVal = data?.identity?.rightValues?.[index] ?? identityRow.rightValue;

    return row(
      [
        textCell(identityRow.leftLabel, leftLabelW, {
          size: cfg.typography.body,
          borders: noneCellBorders()
        }),
        lineCell('', leftFieldW, {
          children: [
            textRun(leftVal || ' ', { size: cfg.typography.body, bold: Boolean(leftVal) })
          ],
          alignment: leftVal ? AlignmentType.RIGHT : undefined,
          borders: { ...noneCellBorders(), right: border() }
        }),
        textCell(identityRow.rightLabel, rightLabelW, {
          size: cfg.typography.body,
          borders: noneCellBorders()
        }),
        lineCell('', rightFieldW, {
          children: [
            textRun(rightVal || ' ', { size: cfg.typography.body, bold: Boolean(rightVal) })
          ],
          borders: noneCellBorders()
        })
      ],
      cfg.identity.rowHeight
    );
  });

  const identityTable = table(cfg.identity.columns, identityRows, {
    borders: tableBorders({ insideHorizontal: false, insideVertical: false })
  });

  // 3. Build Pre-Table
  const [preLeftW, preRightW] = cfg.preTable.columns;
  const previousVaccines = data?.preTable?.previousVaccines;
  const allergy = data?.preTable?.allergy;

  const preTable = table(
    cfg.preTable.columns,
    [
      row(
        [
          textCell(
            previousVaccines
              ? `${cfg.preTable.leftLabel}: ${previousVaccines}`
              : cfg.preTable.leftLabel,
            preLeftW,
            { size: cfg.typography.body, italics: true, borders: noneCellBorders() }
          ),
          lineCell(
            allergy ? `${cfg.preTable.rightLabel} ${allergy}` : cfg.preTable.rightLabel,
            preRightW,
            { bold: true, size: cfg.typography.body, borders: noneCellBorders() }
          )
        ],
        cfg.preTable.height
      )
    ],
    { borders: noneTableBorders() }
  );

  // 4. Build Vaccine Table (15 canonical rows)
  const vaccineTableColumns = cfg.vaccineTable.columns;
  const vaccineTableRows: TableRow[] = [
    row(
      cfg.vaccineTable.headers.map((headerLabel, index) => {
        const children =
          headerLabel === 'TGL SUNTIK'
            ? [
                paragraph('TGL', {
                  bold: true,
                  size: cfg.typography.tableHeader,
                  alignment: AlignmentType.CENTER
                }),
                paragraph('SUNTIK', {
                  bold: true,
                  size: cfg.typography.tableHeader,
                  alignment: AlignmentType.CENTER
                })
              ]
            : [
                paragraph(headerLabel, {
                  bold: true,
                  size: cfg.typography.tableHeader,
                  alignment: AlignmentType.CENTER
                })
              ];
        return cell(children, vaccineTableColumns[index], { margins: DEFAULT_MARGIN });
      }),
      cfg.vaccineTable.headerHeight
    )
  ];

  cfg.vaccineTable.rows.forEach((vDef, rowIndex) => {
    const bottom = vDef.separatorAfter ? border(BorderStyle.SINGLE, 8, BLACK) : border();
    const b = cellBorders({ bottom });
    const rowData = data?.vaccineRows?.[rowIndex];

    // Vaccine Name Cell
    let nameContent: Paragraph | Table;
    if (vDef.vaccine.length === 1 && !vDef.vaccine[0].right) {
      nameContent = paragraph(vDef.vaccine[0].left, { size: cfg.typography.body });
    } else {
      nameContent = table(
        [1180, 1450],
        vDef.vaccine.map((line) =>
          row(
            [
              textCell(line.left || '', 1180, {
                size: cfg.typography.body,
                borders: noneCellBorders(),
                margins: TIGHT_MARGIN
              }),
              textCell(line.right || '', 1450, {
                size: cfg.typography.body,
                borders: noneCellBorders(),
                margins: TIGHT_MARGIN
              })
            ],
            250
          )
        ),
        { alignment: AlignmentType.LEFT, borders: noneTableBorders(), margins: TIGHT_MARGIN }
      );
    }

    const subjectiveLabels = rowData?.subjective || cfg.vaccineTable.subjective;
    const subjectiveCell = cell(
      subjectiveLabels.map((lbl) => paragraph(lbl, { size: cfg.typography.small })),
      vaccineTableColumns[3],
      { borders: b, verticalAlign: VerticalAlign.CENTER }
    );

    const objectiveLabels = rowData?.objective || cfg.vaccineTable.objective;
    const objectiveCell = cell(
      objectiveLabels.map((lbl) =>
        paragraph(lbl, {
          size: rowData?.objective ? cfg.typography.small : cfg.typography.body,
          bold: !rowData?.objective
        })
      ),
      vaccineTableColumns[4],
      { borders: b, verticalAlign: VerticalAlign.CENTER }
    );

    vaccineTableRows.push(
      row(
        [
          cell(nameContent, vaccineTableColumns[0], { borders: b }),
          textCell(rowData?.injectionDate || '', vaccineTableColumns[1], {
            borders: b,
            size: 6.4,
            alignment: AlignmentType.CENTER
          }),
          textCell(rowData?.age || '', vaccineTableColumns[2], {
            borders: b,
            size: 6.4,
            alignment: AlignmentType.CENTER
          }),
          subjectiveCell,
          objectiveCell,
          textCell(rowData?.planning || '', vaccineTableColumns[5], { borders: b, size: 6.3 })
        ],
        cfg.vaccineTable.rowHeight
      )
    );
  });

  const fullVaccineTable = table(vaccineTableColumns, vaccineTableRows);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: cfg.typography.font,
            size: halfPoints(cfg.typography.body)
          },
          paragraph: {
            spacing: lineSpacing()
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: cfg.page.size.width,
              height: cfg.page.size.height,
              orientation: PageOrientation.PORTRAIT
            },
            margin: cfg.page.margin
          }
        },
        children: [headerTable, identityTable, preTable, fullVaccineTable]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Ported 1:1 for Reguler (Rawat Jalan / General Intake)
 */
export async function exportRegulerDocx(
  data?: RegulerFormData | null,
  filename = 'rekam_medis_rawat_jalan.docx'
): Promise<void> {
  const cfg = defaultRegulerConfig;

  const logoBytes = getLogoBytes();
  const logoBox = cell(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: lineSpacing(),
      children: [
        new ImageRun({
          data: logoBytes,
          transformation: { width: 50, height: 50 },
          type: 'png'
        })
      ]
    }),
    2000,
    { borders: noneCellBorders() }
  );

  const headerTable = table(
    [2000, 5500, 3100],
    [
      row([
        logoBox,
        cell(
          [
            paragraph(cfg.header.clinicName, {
              bold: true,
              size: 10,
              alignment: AlignmentType.CENTER
            }),
            paragraph(cfg.header.clinicTagline, {
              bold: true,
              size: 8,
              alignment: AlignmentType.CENTER
            }),
            paragraph(cfg.header.clinicAddress, { size: 7, alignment: AlignmentType.CENTER }),
            paragraph(cfg.header.clinicContact, { size: 6.5, alignment: AlignmentType.CENTER })
          ],
          5500,
          { borders: noneCellBorders() }
        ),
        cell(
          [
            paragraph('NOMOR REKAM MEDIS', {
              bold: true,
              size: 7.5,
              alignment: AlignmentType.CENTER
            }),
            paragraph(data?.medicalRecordNumber || '-', {
              bold: true,
              size: 9,
              alignment: AlignmentType.CENTER
            })
          ],
          3100
        )
      ])
    ],
    { borders: noneTableBorders() }
  );

  const doubleRule = paragraph(' ', {
    size: 1,
    border: { bottom: border(BorderStyle.DOUBLE, 8, BLACK) }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
            margin: { top: 720, right: 720, bottom: 720, left: 720 }
          }
        },
        children: [
          headerTable,
          doubleRule,
          paragraph('FORMULIR PENDAFTARAN & REKAM MEDIS RAWAT JALAN', {
            bold: true,
            size: 10,
            alignment: AlignmentType.CENTER
          }),
          paragraph('I. INFORMASI KUNJUNGAN', { bold: true, size: 8 }),
          table(
            [2500, 3500, 2500, 3400],
            [
              row([
                textCell('Kode Booking', 2500, { bold: true, size: 7.5 }),
                textCell(data?.bookingCode || '-', 3500, { size: 7.5 }),
                textCell('Nomor Antrean', 2500, { bold: true, size: 7.5 }),
                textCell(data?.queueNumber || '-', 3400, { bold: true, size: 7.5 })
              ]),
              row([
                textCell('Layanan / Poli', 2500, { bold: true, size: 7.5 }),
                textCell(data?.serviceName || '-', 3500, { size: 7.5 }),
                textCell('Dokter Pemeriksa', 2500, { bold: true, size: 7.5 }),
                textCell(data?.doctorName || '-', 3400, { bold: true, size: 7.5 })
              ])
            ]
          ),
          paragraph(' ', { size: 4 }),
          paragraph('II. IDENTITAS PASIEN', { bold: true, size: 8 }),
          table(
            [2500, 3500, 2500, 3400],
            [
              row([
                textCell('NIK', 2500, { bold: true, size: 7.5 }),
                textCell(data?.identity?.nik || '-', 3500, { size: 7.5 }),
                textCell('Nama Lengkap', 2500, { bold: true, size: 7.5 }),
                textCell(data?.identity?.fullName || '-', 3400, { bold: true, size: 7.5 })
              ]),
              row([
                textCell('Tempat/Tgl Lahir', 2500, { bold: true, size: 7.5 }),
                textCell(
                  `${data?.identity?.birthPlace || ''}, ${data?.identity?.birthDate || ''}`,
                  3500,
                  {
                    size: 7.5
                  }
                ),
                textCell('Jenis Kelamin / Usia', 2500, { bold: true, size: 7.5 }),
                textCell(`${data?.identity?.gender || '-'} (${data?.identity?.age || '-'})`, 3400, {
                  size: 7.5
                })
              ]),
              row([
                textCell('No Handphone', 2500, { bold: true, size: 7.5 }),
                textCell(data?.identity?.phoneNumber || '-', 3500, { size: 7.5 }),
                textCell('Email', 2500, { bold: true, size: 7.5 }),
                textCell(data?.identity?.email || '-', 3400, { size: 7.5 })
              ]),
              row([
                textCell('Alamat Lengkap', 2500, { bold: true, size: 7.5 }),
                cell([paragraph(data?.identity?.address || '-')], 9400, { columnSpan: 3 })
              ])
            ]
          ),
          paragraph(' ', { size: 4 }),
          paragraph('III. ANAMNESIS & PEMERIKSAAN KLINIS', { bold: true, size: 8 }),
          table(
            [3968, 3968, 3970],
            [
              row([
                textCell(`Tinggi Badan: ${data?.clinical?.vitalHeightCm || '-'}`, 3968, {
                  size: 7.5
                }),
                textCell(`Berat Badan: ${data?.clinical?.vitalWeightKg || '-'}`, 3968, {
                  size: 7.5
                }),
                textCell(`Tekanan Darah: ${data?.clinical?.vitalBloodPressure || '-'}`, 3970, {
                  size: 7.5
                })
              ])
            ]
          ),
          paragraph(`Keluhan Utama: ${data?.clinical?.chiefComplaint || '-'}`, { size: 7.5 }),
          paragraph(`Riwayat Alergi: ${data?.clinical?.allergyHistory || '-'}`, {
            size: 7.5,
            bold: true
          }),
          paragraph(`Catatan Terapi: ${data?.clinical?.additionalNotes || '-'}`, { size: 7.5 })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
