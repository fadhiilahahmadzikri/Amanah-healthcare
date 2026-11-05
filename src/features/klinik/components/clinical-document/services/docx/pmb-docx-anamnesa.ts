import { AlignmentType, TableRow } from 'docx';
import type { defaultPmbConfig } from '../../config/pmb-config';
import type { PmbFormData } from '../../types';
import {
  border,
  noBorder,
  textCell,
  checkboxCell,
  lineCell,
  dashedCell,
  blankIntegratedCell,
  row
} from './docx-primitives';

type PmbConfig = typeof defaultPmbConfig;

export function buildPmbAnamnesaRows(cfg: PmbConfig, data?: PmbFormData | null): TableRow[] {
  const leftColumns = cfg.anamnesa.riskColumns;
  const leftWidth = cfg.anamnesa.leftWidth;
  const riskStartRow = cfg.anamnesa.prompts.length + 1;
  const riskEndRow = riskStartRow + cfg.anamnesa.riskGrid.length;
  const envRow = riskEndRow;
  const otherStartRow = envRow + 1;
  const otherEndRow = otherStartRow + (cfg.anamnesa.otherDashedRows || 3);
  const diseaseColumns = cfg.anamnesa.diseaseColumns;

  const totalAnamnesaRows = Math.max(
    1 + cfg.anamnesa.diseases.length,
    cfg.anamnesa.prompts.length + 1 + cfg.anamnesa.riskGrid.length + 1 + (cfg.anamnesa.otherDashedRows || 3) + cfg.anamnesa.integratedBlankRows
  );

  const anamnesaRows: TableRow[] = [];

  for (let rowIndex = 0; rowIndex < totalAnamnesaRows; rowIndex += 1) {
    let leftCells: any[] = [];
    if (rowIndex < cfg.anamnesa.prompts.length) {
      leftCells = [
        lineCell(cfg.anamnesa.prompts[rowIndex], leftWidth, {
          columnSpan: 3,
          size: 6.8,
          value: data?.anamnesa?.promptValues?.[rowIndex]
        })
      ];
    } else if (rowIndex === cfg.anamnesa.prompts.length) {
      leftCells = [
        textCell(cfg.anamnesa.riskTitle, leftWidth, {
          columnSpan: 3,
          bold: true,
          size: 6.7
        })
      ];
    } else if (rowIndex >= riskStartRow && rowIndex < riskEndRow) {
      const riskRow = cfg.anamnesa.riskGrid[rowIndex - riskStartRow] || [];
      leftCells = riskRow.map((label, index) =>
        checkboxCell(label, leftColumns[index] || leftColumns[0], {
          size: 6.5,
          checked: data?.anamnesa?.riskChecked?.[label]
        })
      );
      while (leftCells.length < leftColumns.length) {
        leftCells.push(blankIntegratedCell(leftColumns[leftCells.length], { size: 6.5 }));
      }
    } else if (rowIndex === envRow) {
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

    let rightCells: any[] = [];
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
          : diseaseRecord?.notes
            ? textCell(diseaseRecord.notes, diseaseColumns[1], { size: 6.5 })
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

    let rHeight = 235;
    if (rowIndex === 0) rHeight = 260;
    else if (rowIndex === 5 || rowIndex === 6) rHeight = 320;

    anamnesaRows.push(row([...leftCells, ...rightCells], rHeight));
  }

  return anamnesaRows;
}
