import type { ImunisasiFormConfig } from '../types';

export const defaultImunisasiConfig: ImunisasiFormConfig = {
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
    title: 11,
    subtitle: 10,
    body: 7.2,
    small: 6.3,
    tableHeader: 7.5
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
    subtitle: 'REKAM MEDIS IMUNISASI'
  },
  identity: {
    columns: [1350, 4083, 1300, 4133],
    rowHeight: 315,
    rows: [
      { leftLabel: 'Nama Anak', rightLabel: 'Nama Ayah' },
      { leftLabel: 'NIK', rightLabel: 'Nama Ibu' },
      { leftLabel: 'Tanggal Lahir', leftValue: '( L / P )', rightLabel: 'Alamat' },
      { leftLabel: 'No HP', rightLabel: '' }
    ]
  },
  preTable: {
    columns: [5433, 5433],
    leftLabel: 'Riwayat Vaksin Sebelumnya',
    rightLabel: 'Riwayat Alergi :',
    height: 320
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
          { left: 'IPV 1', right: '1' }
        ]
      },
      { vaccine: [{ left: 'PCV 1' }] },
      { vaccine: [{ left: 'RV 1' }], separatorAfter: true },
      {
        vaccine: [
          { left: 'PENTA 2', right: 'HEKSAVALEN' },
          { left: 'IPV 2', right: '2' }
        ]
      },
      { vaccine: [{ left: 'PCV 2' }] },
      { vaccine: [{ left: 'RV 2' }], separatorAfter: true },
      {
        vaccine: [
          { left: 'PENTA 3', right: 'HEKSAVALEN' },
          { left: 'IPV 3', right: '3' }
        ]
      },
      { vaccine: [{ left: 'RV 3' }], separatorAfter: true },
      { vaccine: [{ left: 'MR' }] },
      { vaccine: [{ left: 'JE' }], separatorAfter: true },
      { vaccine: [{ left: 'PCV-B' }] },
      { vaccine: [{ left: 'PENTA-B' }] },
      { vaccine: [{ left: 'MR-B' }] }
    ]
  }
};
