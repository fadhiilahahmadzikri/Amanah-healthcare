import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableRow,
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { defaultImunisasiConfig } from '../../config/imunisasi-config';
import type { ImunisasiFormData } from '../../types';
import {
  BLACK,
  DEFAULT_MARGIN,
  TIGHT_MARGIN,
  border,
  cellBorders,
  noneTableBorders,
  noneCellBorders,
  tableBorders,
  paragraph,
  textRun,
  cell,
  textCell,
  lineCell,
  row,
  table,
  lineSpacing,
  halfPoints
} from './docx-primitives';

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
