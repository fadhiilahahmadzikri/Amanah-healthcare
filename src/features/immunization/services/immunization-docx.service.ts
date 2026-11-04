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
  UnderlineType,
  VerticalAlign,
  WidthType
} from 'docx';
import { saveAs } from 'file-saver';
import {
  CANONICAL_IMMUNIZATION_ROWS,
  DEFAULT_OBJECTIVE_PLACEHOLDERS,
  DEFAULT_SUBJECTIVE_PLACEHOLDERS,
  IMMUNIZATION_DOC_CONFIG
} from '../constants/immunization.constants';
import type {
  ImmunizationClinicalEntry,
  ImmunizationIntakeRecord
} from '../types/immunization.types';

const BLACK = '000000';
const LIGHT = '777777';

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

type AlignmentValue = (typeof AlignmentType)[keyof typeof AlignmentType];
type BorderStyleValue = (typeof BorderStyle)[keyof typeof BorderStyle];

function border(
  style: BorderStyleValue = BorderStyle.SINGLE,
  size = 4,
  color = BLACK
) {
  return { style, size, color };
}

function noBorder() {
  return border(BorderStyle.NONE, 0, 'FFFFFF');
}

function tableBorders(options: {
  style?: BorderStyleValue;
  size?: number;
  color?: string;
  insideHorizontal?: boolean;
  insideVertical?: boolean;
} = {}) {
  const outer = border(options.style || BorderStyle.SINGLE, options.size || 4, options.color || BLACK);
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

function cellBorders(options: {
  top?: any;
  bottom?: any;
  left?: any;
  right?: any;
} = {}) {
  return {
    top: options.top || border(),
    bottom: options.bottom || border(),
    left: options.left || border(),
    right: options.right || border()
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

function textRun(text: string, options: { bold?: boolean; italics?: boolean; underline?: boolean; size?: number } = {}) {
  return new TextRun({
    text,
    bold: options.bold,
    italics: options.italics,
    underline: options.underline ? { type: UnderlineType.SINGLE } : undefined,
    font: 'Times New Roman',
    size: halfPoints(options.size || 7.2)
  });
}

function paragraph(text = '', options: { bold?: boolean; italics?: boolean; underline?: boolean; size?: number; alignment?: AlignmentValue; spacing?: any; children?: TextRun[] } = {}) {
  const children = options.children || [textRun(text || ' ', options)];
  return new Paragraph({
    children,
    alignment: options.alignment,
    spacing: { before: 0, after: 0, ...options.spacing }
  });
}

function cell(children: any, width: number, options: { columnSpan?: number; verticalAlign?: any; margins?: any; borders?: any } = {}) {
  const normalizedChildren = Array.isArray(children) ? children : [children];
  return new TableCell({
    children: (normalizedChildren.length > 0 ? normalizedChildren : [paragraph(' ')]) as any,
    width: { size: width, type: WidthType.DXA },
    columnSpan: options.columnSpan,
    verticalAlign: options.verticalAlign || VerticalAlign.CENTER,
    margins: options.margins || DEFAULT_MARGIN,
    borders: options.borders
  });
}

function textCell(text: string, width: number, options: { bold?: boolean; italics?: boolean; underline?: boolean; size?: number; alignment?: AlignmentValue; margins?: any; borders?: any } = {}) {
  return cell(
    paragraph(text, {
      bold: options.bold,
      italics: options.italics,
      underline: options.underline,
      size: options.size,
      alignment: options.alignment
    }),
    width,
    options
  );
}

function lineCell(text: string, width: number, options: { bold?: boolean; size?: number; alignment?: AlignmentValue; borders?: any; children?: TextRun[] } = {}) {
  return cell(
    new Paragraph({
      children: options.children || [textRun(text || ' ', { bold: options.bold, size: options.size || 7.2 })],
      alignment: options.alignment,
      spacing: { before: 0, after: 0 },
      border: { bottom: border(BorderStyle.DOTTED, 3, LIGHT) }
    }),
    width,
    options
  );
}

function row(children: TableCell[], height?: number) {
  return new TableRow({
    children,
    height: height ? { value: height, rule: HeightRule.EXACT } : undefined
  });
}

function table(columnWidths: number[], rows: TableRow[], options: { alignment?: AlignmentValue; borders?: any; margins?: any } = {}) {
  const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);
  return new Table({
    rows,
    columnWidths,
    width: { size: tableWidth, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    alignment: options.alignment || AlignmentType.CENTER,
    borders: options.borders || tableBorders(),
    margins: options.margins || TIGHT_MARGIN
  });
}

export const immunizationDocxService = {
  async exportDocx(
    intake?: ImmunizationIntakeRecord | null,
    entries: ImmunizationClinicalEntry[] = [],
    patientDigits: string[] = [],
    filename = 'rekam_medis_imunisasi.docx'
  ): Promise<void> {
    const entriesMap = new Map<number, ImmunizationClinicalEntry>();
    for (const e of entries) {
      entriesMap.set(e.rowIndex, e);
    }

    // 1. Build Header Code Boxes
    const topBox = table(
      [1120],
      [
        row(
          [
            textCell(IMMUNIZATION_DOC_CONFIG.header.topCode, 1120, {
              alignment: AlignmentType.CENTER,
              bold: true,
              margins: TIGHT_MARGIN
            })
          ],
          410
        )
      ],
      { alignment: AlignmentType.RIGHT }
    );

    const boxWidths = Array.from({ length: 10 }, () => 430);
    const numberBoxes = table(
      boxWidths,
      [
        row(
          boxWidths.map((width, index) =>
            textCell(patientDigits[index] || '', width, {
              alignment: AlignmentType.CENTER,
              bold: Boolean(patientDigits[index]),
              margins: TIGHT_MARGIN
            })
          ),
          540
        )
      ],
      { alignment: AlignmentType.RIGHT }
    );

    const headerTable = table(
      [4850, 6016],
      [
        row(
          [
            cell(
              [
                paragraph(IMMUNIZATION_DOC_CONFIG.header.title, {
                  bold: true,
                  underline: true,
                  size: 11
                }),
                paragraph(IMMUNIZATION_DOC_CONFIG.header.subtitle, {
                  size: 10
                })
              ],
              4850,
              {
                borders: noneCellBorders(),
                margins: TIGHT_MARGIN,
                verticalAlign: VerticalAlign.BOTTOM
              }
            ),
            cell(
              [topBox, paragraph(' ', { size: 1, spacing: { after: 85 } }), numberBoxes],
              6016,
              {
                borders: noneCellBorders(),
                margins: TIGHT_MARGIN,
                verticalAlign: VerticalAlign.TOP
              }
            )
          ],
          1500
        )
      ],
      { borders: noneTableBorders() }
    );

    // 2. Build Identity Table
    const sexLetter = intake?.childSex === 'Perempuan' ? 'P' : 'L';
    const birthDateSex = intake?.childBirthDate
      ? `${intake.childBirthDate} (${sexLetter})`
      : '( L / P )';

    const identityColumns = [1350, 4083, 1300, 4133];
    const identityRowDefinitions = [
      { leftLabel: 'Nama Anak', leftVal: intake?.childName, rightLabel: 'Nama Ayah', rightVal: intake?.fatherName },
      { leftLabel: 'NIK', leftVal: intake?.childNik, rightLabel: 'Nama Ibu', rightVal: intake?.motherName },
      { leftLabel: 'Tanggal Lahir', leftVal: birthDateSex, rightLabel: 'Alamat', rightVal: intake?.childAddress },
      { leftLabel: 'No HP', leftVal: intake?.parentPhone, rightLabel: '', rightVal: '' }
    ];

    const identityRows = identityRowDefinitions.map((def) =>
      row(
        [
          textCell(def.leftLabel, identityColumns[0], { size: 7.2, borders: noneCellBorders() }),
          lineCell(def.leftVal || '', identityColumns[1], {
            alignment: def.leftVal ? AlignmentType.RIGHT : undefined,
            bold: Boolean(def.leftVal && def.leftVal !== '( L / P )'),
            borders: { ...noneCellBorders(), right: border() }
          }),
          textCell(def.rightLabel, identityColumns[2], { size: 7.2, borders: noneCellBorders() }),
          lineCell(def.rightVal || '', identityColumns[3], {
            bold: Boolean(def.rightVal),
            borders: noneCellBorders()
          })
        ],
        315
      )
    );

    const identityTable = table(identityColumns, identityRows, {
      borders: tableBorders({ insideHorizontal: false, insideVertical: false })
    });

    // 3. Build Pre-Table
    const previousVaccines = intake?.previousVaccineHistory;
    const allergy = intake?.childAllergyHistory;

    const preTable = table(
      [5433, 5433],
      [
        row(
          [
            textCell(
              previousVaccines
                ? `Riwayat Vaksin Sebelumnya: ${previousVaccines}`
                : 'Riwayat Vaksin Sebelumnya',
              5433,
              { size: 7.2, italics: true, borders: noneCellBorders() }
            ),
            lineCell(
              allergy ? `Riwayat Alergi : ${allergy}` : 'Riwayat Alergi :',
              5433,
              { bold: true, size: 7.2, borders: noneCellBorders() }
            )
          ],
          320
        )
      ],
      { borders: noneTableBorders() }
    );

    // 4. Build 15 Canonical Vaccine Rows
    const vaccineCols = [2800, 1100, 850, 1850, 2100, 2166];
    const vaccineHeaderRow = row(
      IMMUNIZATION_DOC_CONFIG.tableHeaders.map((headerLabel, index) => {
        const children =
          headerLabel === 'TGL SUNTIK'
            ? [
                paragraph('TGL', { bold: true, size: 7.5, alignment: AlignmentType.CENTER }),
                paragraph('SUNTIK', { bold: true, size: 7.5, alignment: AlignmentType.CENTER })
              ]
            : [paragraph(headerLabel, { bold: true, size: 7.5, alignment: AlignmentType.CENTER })];

        return cell(children, vaccineCols[index], { margins: DEFAULT_MARGIN });
      }),
      610
    );

    const vaccineTableRows: TableRow[] = [vaccineHeaderRow];

    for (const milestone of CANONICAL_IMMUNIZATION_ROWS) {
      const entry = entriesMap.get(milestone.rowIndex);
      const isGiven = entry?.status === 'GIVEN';

      const subjectiveLines = isGiven
        ? [
            `Demam: ${entry?.fever || 'Tidak'}`,
            `Batuk: ${entry?.cough || 'Tidak'}`,
            `Pilek: ${entry?.runnyNose || 'Tidak'}`
          ]
        : DEFAULT_SUBJECTIVE_PLACEHOLDERS;

      const bbStr = entry?.weightKg != null ? `${entry.weightKg} kg` : '-';
      const pbStr = entry?.heightCm != null ? `${entry.heightCm} cm` : '-';
      const lkStr = entry?.headCircumferenceCm != null ? `${entry.headCircumferenceCm} cm` : '-';
      const tempStr = entry?.temperatureCelsius != null ? `${entry.temperatureCelsius} C` : '-';

      const objectiveLines = isGiven
        ? [`BB/PB: ${bbStr}/${pbStr}`, `LK/S: ${lkStr}/${tempStr}`]
        : DEFAULT_OBJECTIVE_PLACEHOLDERS;

      const bottomBorder = milestone.separatorAfter
        ? border(BorderStyle.SINGLE, 8, BLACK)
        : border();
      const borders = cellBorders({ bottom: bottomBorder });

      // Vaccine name cell content
      let vaccineCellContent: any;
      if (milestone.displayLines.length === 1 && !milestone.displayLines[0].right) {
        vaccineCellContent = [paragraph(milestone.displayLines[0].left, { size: 7.2 })];
      } else {
        vaccineCellContent = table(
          [1180, 1450],
          milestone.displayLines.map((line) =>
            row(
              [
                textCell(line.left || '', 1180, { size: 7.2, borders: noneCellBorders(), margins: TIGHT_MARGIN }),
                textCell(line.right || '', 1450, { size: 7.2, borders: noneCellBorders(), margins: TIGHT_MARGIN })
              ],
              250
            )
          ),
          { alignment: AlignmentType.LEFT, borders: noneTableBorders(), margins: TIGHT_MARGIN }
        );
      }

      vaccineTableRows.push(
        row(
          [
            cell(vaccineCellContent, vaccineCols[0], { borders }),
            textCell(entry?.injectionDate || '', vaccineCols[1], { borders, size: 6.4, alignment: AlignmentType.CENTER }),
            textCell(entry?.ageDisplay || '', vaccineCols[2], { borders, size: 6.4, alignment: AlignmentType.CENTER }),
            cell(
              subjectiveLines.map((line) => paragraph(line, { size: 6.3 })),
              vaccineCols[3],
              { borders, verticalAlign: VerticalAlign.CENTER }
            ),
            cell(
              objectiveLines.map((line) =>
                paragraph(line, { size: isGiven ? 6.3 : 7.2, bold: !isGiven })
              ),
              vaccineCols[4],
              { borders, verticalAlign: VerticalAlign.CENTER }
            ),
            textCell(entry?.planning || '', vaccineCols[5], { borders, size: 6.3 })
          ],
          690
        )
      );
    }

    const vaccineTable = table(vaccineCols, vaccineTableRows);

    // 5. Assemble Complete Document
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Times New Roman', size: halfPoints(7.2) },
            paragraph: { spacing: { before: 0, after: 0 } }
          }
        }
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
              margin: { top: 420, right: 520, bottom: 420, left: 520 }
            }
          },
          children: [headerTable, identityTable, preTable, vaccineTable]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  }
};
