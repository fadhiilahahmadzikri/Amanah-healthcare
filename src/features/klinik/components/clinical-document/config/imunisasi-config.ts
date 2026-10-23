import type { ImunisasiFormConfig, ImunisasiFormData } from '../types';

export const defaultImunisasiConfig: ImunisasiFormConfig = {
  page: {
    size: {
      width: 11906,
      height: 16838,
    },
    margin: {
      top: 420,
      right: 520,
      bottom: 420,
      left: 520,
    },
    contentWidth: 10866,
  },
  typography: {
    font: 'Times New Roman',
    title: 11,
    subtitle: 10,
    body: 7.2,
    small: 6.3,
    tableHeader: 7.5,
  },
  header: {
    height: 1500,
    titleWidth: 4850,
    codeWidth: 6016,
    topBoxWidth: 1120,
    topBoxHeight: 410,
    numberBoxCount: 10,
    numberBoxWidth: 430,
    numberBoxHeight: 540,
    title: 'AMANAH HEALTH CARE',
    subtitle: 'REKAM MEDIS IMUNISASI',
  },
  identity: {
    columns: [1350, 4083, 1300, 4133],
    rowHeight: 315,
    rows: [
      { leftLabel: 'Nama Anak', rightLabel: 'Nama Ayah' },
      { leftLabel: 'NIK', rightLabel: 'Nama Ibu' },
      { leftLabel: 'Tanggal Lahir', leftValue: '( L / P )', rightLabel: 'Alamat' },
      { leftLabel: 'No HP', rightLabel: '' },
    ],
  },
  preTable: {
    columns: [5433, 5433],
    leftLabel: 'Riwayat Vaksin Sebelumnya',
    rightLabel: 'Riwayat Alergi :',
    height: 320,
  },
  vaccineTable: {
    columns: [2800, 1100, 850, 1850, 2100, 2166],
    headerHeight: 610,
    rowHeight: 690,
    headers: ['JENIS VAKSIN', 'TGL SUNTIK', 'UMUR', 'SUBJEKTIF', 'OBJEKTIF', 'PLANNING'],
    subjective: ['Demam :', 'Batuk :', 'Pilek :'],
    objective: ['BB / PB :', 'LK / S :'],
    rows: [
      { vaccine: [{ left: 'HB 0' }] },
      { vaccine: [{ left: 'BCG' }], separatorAfter: true },
      {
        vaccine: [
          { left: 'PENTA 1', right: 'HEKSAVALEN' },
          { left: 'IPV 1', right: '1' },
        ],
      },
      { vaccine: [{ left: 'PCV 1' }] },
      { vaccine: [{ left: 'RV 1' }], separatorAfter: true },
      {
        vaccine: [
          { left: 'PENTA 2', right: 'HEKSAVALEN' },
          { left: 'IPV 2', right: '2' },
        ],
      },
      { vaccine: [{ left: 'PCV 2' }] },
      { vaccine: [{ left: 'RV 2' }], separatorAfter: true },
      {
        vaccine: [
          { left: 'PENTA 3', right: 'HEKSAVALEN' },
          { left: 'IPV 3', right: '3' },
        ],
      },
      { vaccine: [{ left: 'RV 3' }], separatorAfter: true },
      { vaccine: [{ left: 'MR' }] },
      { vaccine: [{ left: 'JE' }], separatorAfter: true },
      { vaccine: [{ left: 'PCV-B' }] },
      { vaccine: [{ left: 'PENTA-B' }] },
      { vaccine: [{ left: 'MR-B' }] },
    ],
  },
};

export const sampleImunisasiData: ImunisasiFormData = {
  header: {
    topCode: 'RM-01',
    recordDigits: ['0', '0', '0', '1', '2', '4', '0', '1', '2', '6'],
  },
  identity: {
    leftValues: [
      'Muhammad Rayyan Al-Fatih',
      '3404071203240001',
      '12 Maret 2024 ( L )',
      '081298765432',
    ],
    rightValues: [
      'Budi Pratama',
      'Siti Nurhaliza',
      'Jl. Kaliurang Km 9, Sinduharjo, Ngaglik, Sleman, D.I. Yogyakarta',
      '',
    ],
  },
  preTable: {
    previousVaccines: 'HB 0 (Klinik Amanah), BCG (Puskesmas Ngaglik)',
    allergy: 'Tidak ada riwayat alergi obat maupun vaksin',
  },
  vaccineRows: [
    {
      injectionDate: '12-03-2024',
      age: '0 bln',
      subjective: ['-', '-', '-'],
      objective: ['3.2 kg / 49 cm', '34 cm / 36.5 C'],
      planning: 'HB 0 0.5 ml IM paha kanan',
    },
    {
      injectionDate: '15-04-2024',
      age: '1 bln',
      subjective: ['-', '-', '-'],
      objective: ['4.1 kg / 53 cm', '36 cm / 36.6 C'],
      planning: 'BCG 0.05 ml IC lengan kanan',
    },
    {
      injectionDate: '14-05-2024',
      age: '2 bln',
      subjective: ['-', '-', '-'],
      objective: ['5.0 kg / 57 cm', '38 cm / 36.7 C'],
      planning: 'Penta 1 + IPV 1 + PCV 1 + RV 1',
    },
    {
      injectionDate: '14-06-2024',
      age: '3 bln',
      subjective: ['-', '-', '-'],
      objective: ['5.8 kg / 60 cm', '39.5 cm / 36.5 C'],
      planning: 'Penta 2 + IPV 2 + RV 2',
    },
  ],
};
