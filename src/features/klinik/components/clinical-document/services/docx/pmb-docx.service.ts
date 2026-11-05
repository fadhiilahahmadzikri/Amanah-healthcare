import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph,
  TableRow,
  VerticalAlignTable
} from 'docx';
import { saveAs } from 'file-saver';
import { defaultPmbConfig } from '../../config/pmb-config';
import type { PmbFormData } from '../../types';
import {
  BLACK,
  TIGHT_MARGIN,
  border,
  noBorder,
  noneTableBorders,
  noneCellBorders,
  paragraph,
  sectionLabel,
  verticalGap,
  cell,
  textCell,
  lineCell,
  row,
  table,
  columnWidth,
  getLogoBytes,
  lineSpacing,
  halfPoints
} from './docx-primitives';
import { buildPmbAnamnesaRows } from './pmb-docx-anamnesa';

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
  const anamnesaColumns = [...cfg.anamnesa.riskColumns, ...cfg.anamnesa.diseaseColumns];
  const anamnesaRows = buildPmbAnamnesaRows(cfg, data);
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
