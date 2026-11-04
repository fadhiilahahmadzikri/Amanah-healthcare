import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import { getGenderLabel } from '@/constants/gender.constants';
import type { MaternityIntake } from '../types/maternity.types';

const BLACK = '000000';
const LIGHT = '777777';

function halfPoints(points: number): number {
  return Math.round(points * 2);
}

function border(style: any = BorderStyle.SINGLE, size = 4, color = BLACK) {
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

function noneCellBorders() {
  const value = noBorder();
  return { top: value, bottom: value, left: value, right: value };
}

export const maternityDocxService = {
  async generateAndDownload(
    intake: MaternityIntake,
    fileName?: string,
  ): Promise<void> {
    const defaultFileName = `Formulir_ANC_${(intake.motherName || 'Pasien').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.docx`;

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
              margin: { top: 420, right: 520, bottom: 420, left: 520 },
            },
          },
          children: [
            // HEADER TABLE
            new Table({
              width: { size: 10866, type: WidthType.DXA },
              borders: allBorders(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 7500, type: WidthType.DXA },
                      borders: noneCellBorders(),
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'PRAKTIK MANDIRI BIDAN NUR HIDAYATUN, S.ST, BDN.',
                              bold: true,
                              font: 'Times New Roman',
                              size: halfPoints(10),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'SIPB: 503/000058.05.22/0053/K18/B/2022 | WA. 081 392 45 6064',
                              font: 'Times New Roman',
                              size: halfPoints(7),
                              color: LIGHT,
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Jl. Anyelir I No. 243 Perumnas Condongcatur, Depok, Sleman, DIY 55283',
                              font: 'Times New Roman',
                              size: halfPoints(7),
                              color: LIGHT,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 3366, type: WidthType.DXA },
                      borders: allBorders(),
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: 'RM ANC : K1 / K4',
                              bold: true,
                              font: 'Times New Roman',
                              size: halfPoints(8),
                            }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: `Alergi: ${intake.allergyInfo || 'Tidak ada'}`,
                              italics: true,
                              font: 'Times New Roman',
                              size: halfPoints(7),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '' }),

            // SECTION 1: IDENTITAS
            new Paragraph({
              children: [
                new TextRun({
                  text: 'I. IDENTITAS PASIEN & SUAMI',
                  bold: true,
                  font: 'Times New Roman',
                  size: halfPoints(8.5),
                }),
              ],
            }),

            new Table({
              width: { size: 10866, type: WidthType.DXA },
              borders: allBorders(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 5433, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Nama Ibu: ${intake.motherName || '-'}`,
                              bold: true,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `NIK: ${intake.motherNik || '-'} | Umur: ${intake.motherAge ? `${intake.motherAge} th` : '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Pekerjaan: ${intake.motherJob || '-'} | Pendidikan: ${intake.motherEducation || '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Agama: ${intake.religion || '-'} | No. Telp: ${intake.phoneNumber || '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Alamat Domisili: ${intake.domicileAddress || '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 5433, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Nama Suami: ${intake.husbandProfile?.fullName || intake.partnerName || '-'}`,
                              bold: true,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `NIK Suami: ${intake.husbandProfile?.nik || intake.partnerNik || '-'} | Umur: ${intake.husbandProfile?.age || intake.partnerAge || '-'} th`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Pekerjaan: ${intake.husbandProfile?.job || intake.partnerJob || '-'} | Pendidikan: ${intake.husbandProfile?.education || intake.partnerEducation || '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Gol. Darah Suami: ${intake.husbandProfile?.bloodType || intake.partnerBloodType || '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Pernikahan Ke: ${intake.marriageOrder || '1'} | Tgl Menikah: ${intake.marriageDate || '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '' }),

            // SECTION 2: OBSTETRI & KLINIS
            new Paragraph({
              children: [
                new TextRun({
                  text: `II. DATA OBSTETRI (G${intake.gravidaCount || 1} P${intake.parityCount || 0} Ab${intake.abortionCount || 0} Ah${intake.livingChildrenCount || 0}) & FISIK AWAL`,
                  bold: true,
                  font: 'Times New Roman',
                  size: halfPoints(8.5),
                }),
              ],
            }),

            new Table({
              width: { size: 10866, type: WidthType.DXA },
              borders: allBorders(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 10866, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `HPHT: ${intake.hpht || '-'}   |   HPL (Taksiran Persalinan): ${intake.estimatedDueDate || '-'}   |   Usia Kehamilan: ${intake.gestationalAgeFormatted || `${intake.gestationalAgeWeeks || 0} minggu`}`,
                              bold: true,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Keluhan Saat Ini: ${intake.currentComplaints || '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `TB: ${intake.heightCm || '-'} cm   |   BB Awal: ${intake.prePregnancyWeightKg || '-'} kg   |   IMT: ${intake.initialBmi || '-'}   |   LiLA: ${intake.upperArmCircumferenceCm || '-'} cm   |   Gol. Darah Ibu: ${intake.motherBloodType || '-'}   |   Status TT: ${intake.tetanusStatus || '-'}`,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '' }),

            // SECTION 3: RIWAYAT PERSALINAN LALU
            new Paragraph({
              children: [
                new TextRun({
                  text: 'III. RIWAYAT KEHAMILAN & PERSALINAN LALU',
                  bold: true,
                  font: 'Times New Roman',
                  size: halfPoints(8.5),
                }),
              ],
            }),

            new Table({
              width: { size: 10866, type: WidthType.DXA },
              borders: allBorders(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 600, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: 'No', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 1200, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Tahun', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 1400, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'BB/PB', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 800, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'JK', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 1400, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'UK', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 1500, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Penolong', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 1500, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Cara Lahir', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 2466, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Komplikasi', bold: true })],
                        }),
                      ],
                    }),
                  ],
                }),
                ...(intake.previousPregnancies &&
                intake.previousPregnancies.length > 0
                  ? intake.previousPregnancies.map(
                      (p, idx) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph({
                                  text: String(p.orderNumber || idx + 1),
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({ text: p.birthYear || '-' }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  text: `${p.birthWeightGrams || '-'}gr / ${p.birthLengthCm || '-'}cm`,
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({ text: getGenderLabel(p.childSex) }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  text: p.gestationalAgeAtBirth || '-',
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({ text: p.birthAttendant || '-' }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({ text: p.deliveryMethod || '-' }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  text: p.complications || 'Tidak ada',
                                }),
                              ],
                            }),
                          ],
                        }),
                    )
                  : [
                      new TableRow({
                        children: [
                          new TableCell({
                            columnSpan: 8,
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: 'Tidak ada riwayat kehamilan dan persalinan sebelumnya (Primigravida).',
                                    italics: true,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ]),
              ],
            }),

            new Paragraph({ text: '' }),

            // SECTION 4: SKRINING PENYAKIT & KB
            new Paragraph({
              children: [
                new TextRun({
                  text: 'IV. SKRINING KONDISI KESEHATAN & RIWAYAT KB',
                  bold: true,
                  font: 'Times New Roman',
                  size: halfPoints(8.5),
                }),
              ],
            }),

            new Table({
              width: { size: 10866, type: WidthType.DXA },
              borders: allBorders(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 6000, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Kondisi Kesehatan / Penyakit Medis Terkonfirmasi:',
                              bold: true,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        ...(intake.conditionResponses &&
                        intake.conditionResponses.filter((c) => c.hasCondition)
                          .length > 0
                          ? intake.conditionResponses
                              .filter((c) => c.hasCondition)
                              .map(
                                (c) =>
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: `• ${c.conditionCode.replace(/_/g, ' ')}${c.diagnosisYear ? ` (th ${c.diagnosisYear})` : ''}${c.notes ? `: ${c.notes}` : ''}`,
                                        font: 'Times New Roman',
                                        size: halfPoints(7.2),
                                      }),
                                    ],
                                  }),
                              )
                          : [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: '• Tidak ada riwayat penyakit sistemik yang terkonfirmasi.',
                                    italics: true,
                                  }),
                                ],
                              }),
                            ]),
                      ],
                    }),
                    new TableCell({
                      width: { size: 4866, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Riwayat KB Sebelumnya:',
                              bold: true,
                              font: 'Times New Roman',
                              size: halfPoints(7.5),
                            }),
                          ],
                        }),
                        ...(intake.contraceptiveHistories &&
                        intake.contraceptiveHistories.length > 0
                          ? intake.contraceptiveHistories.map(
                              (k) =>
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: `• ${k.contraceptiveType || '-'}: ${k.durationText || '-'} (${k.problems || 'Tidak ada keluhan'})`,
                                      font: 'Times New Roman',
                                      size: halfPoints(7.2),
                                    }),
                                  ],
                                }),
                            )
                          : [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: '• Belum pernah menggunakan kontrasepsi.',
                                    italics: true,
                                  }),
                                ],
                              }),
                            ]),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName || defaultFileName);
  },
};
