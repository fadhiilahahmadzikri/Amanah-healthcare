import type { PmbFormConfig } from '../types';

export const defaultPmbConfig: PmbFormConfig = {
  page: {
    size: {
      width: 11906,
      height: 16838
    },
    margin: {
      top: 420,
      right: 520,
      bottom: 420,
      left: 520
    },
    contentWidth: 10866
  },
  typography: {
    font: 'Times New Roman',
    body: 7.3,
    small: 6.8,
    identity: 6.6,
    section: 8.2,
    title: 10
  },
  layout: {
    sectionLabelBefore: 90,
    sectionLabelAfter: 20,
    obstetriTitleBefore: 90
  },
  header: {
    leftBoxWidth: 2100,
    centerWidth: 5966,
    rightBoxWidth: 2800,
    height: 1040,
    logoHeight: 820,
    rmRowHeight: 430,
    rmInset: 240,
    allergyTopGap: 90,
    clinicLines: [
      { text: 'PRAKTIK MANDIRI BIDAN', bold: true, size: 10 },
      { text: 'NUR HIDAYATUN, S.ST, BDN.', bold: true, size: 10 },
      { text: 'SIPB: 503/000058.05.22/0053/K18/B/2022', size: 6.7 },
      { text: 'Jl. Anyelir I No. 243 Perumnas Condongcatur, Depok Sleman.', size: 6.7 },
      { text: 'DIY 55283 | WA. 081 392 45 6064', size: 6.7 }
    ],
    // Doctor instructed: RMANC.2 (row 2) must be left empty!
    rmRows: ['RM ANC :', ''],
    allergyLabel: 'Alergi :'
  },
  identity: {
    columns: [1250, 2900, 1550, 1100, 1600, 2466],
    topRows: [
      ['Nama Ibu :', '', 'Pernikahan Ke :', '', 'Tgl Menikah :', ''],
      ['NIK :', '', 'Tgl Lahir :', '', 'Pekerjaan Ibu :', ''],
      ['Nama Suami :', '', 'Umur :', '', 'Pendidikan Ibu :', ''],
      ['NIK :', '', 'Tgl. Lahir :', '', 'Pekerjaan Suami :', ''],
      ['', '', 'Umur :', '', 'Pendidikan Suami :', '']
    ],
    fullRows: ['Agama :', 'Domisili :', 'Alamat KTP :', 'No. Telp :'],
    locationLabels: ['Dasawisma :', 'Posyandu :', 'Puskesmas :'],
    measurementRows: [
      ['TB :', 'LILA :', 'Status TT :', 'Gol. Darah Ibu :'],
      ['BB awal :', 'IMT awal :', '', 'Gol. Darah Suami :']
    ]
  },
  anamnesa: {
    leftWidth: 5850,
    rightWidth: 5016,
    prompts: ['1. HPHT (Haid Pertama Haid Terakhir) :', '2. HPL :', '3. UK :', '4. Keluhan :'],
    riskTitle: 'Riwayat Perilaku Beresiko 1 Bulan Sebelum Hamil',
    riskColumns: [1950, 1950, 1950],
    riskGrid: [
      ['Merokok', 'Pola Makan Beresiko', 'Aktivitas fisik berkurang'],
      ['Alkohol', 'Obat Teratogenik', 'Kosmetik dengan zat berbahaya']
    ],
    environmentLabel: 'Lingkungan beresiko : Pestisida/ Lainnya',
    otherLabel: 'Lain-lain :',
    diseaseColumns: [520, 2246, 620, 750, 880],
    otherDashedRows: 3,
    integratedBlankRows: 3,
    diseases: [
      'Hipertensi',
      'Jantung',
      'Tiroid',
      'Autoimun',
      'Diabetes',
      'Asma',
      'TBC',
      'Hepatitis B',
      'HIV/Sifilis',
      'Jiwa',
      'Riwayat Gemelli',
      'Kista/Miom/Tumor',
      'Operasi',
      ''
    ]
  },
  obstetri: {
    title: 'RIWAYAT OBSTETRI',
    pregnancyFields: ['G', 'P', 'Ab', 'Ah'],
    columns: [520, 1550, 1500, 560, 620, 1240, 1720, 1950, 1206],
    headers: [
      'No',
      'Tahun Lahir',
      'BB/ PB Lahir',
      'JK',
      'UK',
      'Penolong',
      'Cara Persalinan',
      'Tempat Persalinan',
      'Komplikasi'
    ],
    blankRows: 4
  },
  kb: {
    title: 'RIWAYAT KB',
    columns: [520, 1690, 2200, 1380, 1700, 1900, 1476],
    headers: [
      'No',
      'Tanggal Mulai',
      'Jenis Kontrasepsi',
      'Masa Pakai',
      'Tanggal Lepas',
      'Masalah',
      'Efek samping'
    ],
    blankRows: 4
  }
};
