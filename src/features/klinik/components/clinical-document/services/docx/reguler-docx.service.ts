import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph
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
                textCell('Poliklinik Tujuan', 2500, { bold: true, size: 7.5 }),
                textCell(data?.poliklinikName || '-', 3500, { bold: true, size: 7.5 }),
                textCell('Layanan Medis', 2500, { bold: true, size: 7.5 }),
                textCell(data?.serviceName || '-', 3400, { size: 7.5 })
              ]),
              row([
                textCell('Dokter Pemeriksa', 2500, { bold: true, size: 7.5 }),
                textCell(data?.doctorName || '-', 3500, { bold: true, size: 7.5 }),
                textCell('Waktu & Sesi', 2500, { bold: true, size: 7.5 }),
                textCell(data?.scheduledTime || '-', 3400, { size: 7.5 })
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
                  { size: 7.5 }
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
                textCell('Kontak Darurat', 2500, { bold: true, size: 7.5 }),
                cell(
                  [
                    paragraph(
                      data?.emergencyContact?.phoneNumber
                        ? `${data?.emergencyContact?.name || 'Kerabat'}${data?.emergencyContact?.relationship ? ` (${data?.emergencyContact?.relationship})` : ''} - Telp: ${data?.emergencyContact?.phoneNumber}`
                        : '-',
                      { size: 7.5 }
                    )
                  ],
                  9400,
                  { columnSpan: 3 }
                )
              ]),
              row([
                textCell('Alamat Lengkap', 2500, { bold: true, size: 7.5 }),
                cell([paragraph(data?.identity?.address || '-')], 9400, { columnSpan: 3 })
              ])
            ]
          ),
          paragraph(' ', { size: 4 }),
          paragraph('III. KELUHAN', { bold: true, size: 8 }),
          table(
            [2500, 9400],
            [
              row([
                textCell('Keluhan', 2500, { bold: true, size: 7.5 }),
                textCell(
                  data?.chiefComplaint ||
                    data?.clinical?.chiefComplaint ||
                    'Tidak ada keluhan klinis yang dicatat saat pendaftaran.',
                  9400,
                  { size: 7.5 }
                )
              ])
            ]
          ),
          paragraph(' ', { size: 6 }),
          table(
            [5950, 5950],
            [
              row([
                cell(
                  [
                    paragraph(`Tanggal: ${data?.registrationDate || '-'}`, {
                      size: 7.5,
                      alignment: AlignmentType.CENTER
                    }),
                    paragraph('Pasien / Keluarga', {
                      bold: true,
                      size: 7.5,
                      alignment: AlignmentType.CENTER
                    }),
                    paragraph(' ', { size: 30 }),
                    paragraph(
                      `( ${data?.identity?.fullName || '................................'} )`,
                      { size: 7.5, alignment: AlignmentType.CENTER }
                    )
                  ],
                  5950,
                  { borders: noneCellBorders() }
                ),
                cell(
                  [
                    paragraph(`Tanggal: ${data?.registrationDate || '-'}`, {
                      size: 7.5,
                      alignment: AlignmentType.CENTER
                    }),
                    paragraph('Dokter Pemeriksa', {
                      bold: true,
                      size: 7.5,
                      alignment: AlignmentType.CENTER
                    }),
                    paragraph(' ', { size: 30 }),
                    paragraph(`( ${data?.doctorName || '................................'} )`, {
                      size: 7.5,
                      alignment: AlignmentType.CENTER
                    })
                  ],
                  5950,
                  { borders: noneCellBorders() }
                )
              ])
            ],
            { borders: noneTableBorders() }
          )
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
