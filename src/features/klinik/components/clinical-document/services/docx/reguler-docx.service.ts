import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph,
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { defaultRegulerConfig } from '../../config/reguler-config';
import type { RegulerFormData } from '../../types';
import {
  BLACK,
  border,
  noneTableBorders,
  noneCellBorders,
  paragraph,
  cell,
  textCell,
  sectionLabel,
  verticalGap,
  row,
  table,
  lineSpacing,
  getLogoBytes
} from './docx-primitives';

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
    1800,
    { borders: noneCellBorders() }
  );

  const headerTable = table(
    [1800, 5666, 3000],
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
          5666,
          { borders: noneCellBorders() }
        ),
        cell(
          [
            paragraph('NOMOR REKAM MEDIS', {
              bold: true,
              size: 7.5,
              alignment: AlignmentType.CENTER
            }),
            paragraph('\u00A0', {
              size: 9,
              alignment: AlignmentType.CENTER
            })
          ],
          3000
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
          verticalGap(80),
          doubleRule,
          paragraph('FORMULIR PENDAFTARAN & REKAM MEDIS RAWAT JALAN', {
            bold: true,
            size: 10,
            alignment: AlignmentType.CENTER,
            spacing: { before: 140, after: 120 }
          }),
          sectionLabel('I. INFORMASI KUNJUNGAN', { before: 100, after: 60 }),
          table(
            [2200, 3033, 2200, 3033],
            [
              row([
                textCell('Kode Booking', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.bookingCode || '', 3033, {
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell('Nomor Antrean', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.queueNumber || '', 3033, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                })
              ]),
              row([
                textCell('Poliklinik Tujuan', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.poliklinikName || '', 3033, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell('Layanan Medis', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.serviceName || '', 3033, {
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                })
              ]),
              row([
                textCell('Dokter Pemeriksa', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.doctorName || '', 3033, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell('Waktu & Sesi', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.scheduledTime || '', 3033, {
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                })
              ])
            ]
          ),
          sectionLabel('II. IDENTITAS PASIEN', { before: 180, after: 60 }),
          table(
            [2200, 3033, 2200, 3033],
            [
              row([
                textCell('NIK', 2200, { bold: true, size: 7.5, verticalAlign: VerticalAlign.TOP }),
                textCell(data?.identity?.nik || '', 3033, {
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell('Nama Lengkap', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.identity?.fullName || '', 3033, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                })
              ]),
              row([
                textCell('Tempat/Tgl Lahir', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(
                  [data?.identity?.birthPlace, data?.identity?.birthDate]
                    .filter(Boolean)
                    .join(', '),
                  3033,
                  { size: 7.5, verticalAlign: VerticalAlign.TOP }
                ),
                textCell('Jenis Kelamin / Usia', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(
                  [data?.identity?.gender, data?.identity?.age ? `(${data.identity.age})` : '']
                    .filter(Boolean)
                    .join(' '),
                  3033,
                  { size: 7.5, verticalAlign: VerticalAlign.TOP }
                )
              ]),
              row([
                textCell('No Handphone', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.identity?.phoneNumber || '', 3033, {
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell('Email', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.identity?.email || '', 3033, {
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                })
              ]),
              row([
                textCell('Kontak Darurat', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                cell(
                  [
                    paragraph(
                      data?.emergencyContact?.phoneNumber
                        ? `${data?.emergencyContact?.name || 'Kerabat'}${data?.emergencyContact?.relationship ? ` (${data?.emergencyContact?.relationship})` : ''} - Telp: ${data?.emergencyContact?.phoneNumber}`
                        : '',
                      { size: 7.5 }
                    )
                  ],
                  8266,
                  { columnSpan: 3, verticalAlign: VerticalAlign.TOP }
                )
              ]),
              row([
                textCell('Alamat Lengkap', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                cell([paragraph(data?.identity?.address || '')], 8266, {
                  columnSpan: 3,
                  verticalAlign: VerticalAlign.TOP
                })
              ])
            ]
          ),
          sectionLabel('III. KELUHAN', { before: 180, after: 60 }),
          table(
            [2200, 8266],
            [
              row([
                textCell('Keluhan', 2200, {
                  bold: true,
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                }),
                textCell(data?.chiefComplaint || data?.clinical?.chiefComplaint || '', 8266, {
                  size: 7.5,
                  verticalAlign: VerticalAlign.TOP
                })
              ])
            ]
          )
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
