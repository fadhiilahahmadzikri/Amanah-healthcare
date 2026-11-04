export interface CanonicalMilestoneDefinition {
  rowIndex: number;
  vaccineName: string;
  vaccineCode: string;
  displayLines: { left: string; right?: string }[];
  separatorAfter?: boolean;
}

export const CANONICAL_IMMUNIZATION_ROWS: CanonicalMilestoneDefinition[] = [
  {
    rowIndex: 0,
    vaccineName: 'HB 0',
    vaccineCode: 'hb0',
    displayLines: [{ left: 'HB 0' }]
  },
  {
    rowIndex: 1,
    vaccineName: 'BCG',
    vaccineCode: 'bcg',
    displayLines: [{ left: 'BCG' }],
    separatorAfter: true
  },
  {
    rowIndex: 2,
    vaccineName: 'PENTA 1 / IPV 1',
    vaccineCode: 'penta1_ipv1',
    displayLines: [
      { left: 'PENTA 1', right: 'HEKSAVALEN' },
      { left: 'IPV 1', right: '1' }
    ]
  },
  {
    rowIndex: 3,
    vaccineName: 'PCV 1',
    vaccineCode: 'pcv1',
    displayLines: [{ left: 'PCV 1' }]
  },
  {
    rowIndex: 4,
    vaccineName: 'RV 1',
    vaccineCode: 'rv1',
    displayLines: [{ left: 'RV 1' }],
    separatorAfter: true
  },
  {
    rowIndex: 5,
    vaccineName: 'PENTA 2 / IPV 2',
    vaccineCode: 'penta2_ipv2',
    displayLines: [
      { left: 'PENTA 2', right: 'HEKSAVALEN' },
      { left: 'IPV 2', right: '2' }
    ]
  },
  {
    rowIndex: 6,
    vaccineName: 'PCV 2',
    vaccineCode: 'pcv2',
    displayLines: [{ left: 'PCV 2' }]
  },
  {
    rowIndex: 7,
    vaccineName: 'RV 2',
    vaccineCode: 'rv2',
    displayLines: [{ left: 'RV 2' }],
    separatorAfter: true
  },
  {
    rowIndex: 8,
    vaccineName: 'PENTA 3 / IPV 3',
    vaccineCode: 'penta3_ipv3',
    displayLines: [
      { left: 'PENTA 3', right: 'HEKSAVALEN' },
      { left: 'IPV 3', right: '3' }
    ]
  },
  {
    rowIndex: 9,
    vaccineName: 'RV 3',
    vaccineCode: 'rv3',
    displayLines: [{ left: 'RV 3' }],
    separatorAfter: true
  },
  {
    rowIndex: 10,
    vaccineName: 'MR',
    vaccineCode: 'mr',
    displayLines: [{ left: 'MR' }]
  },
  {
    rowIndex: 11,
    vaccineName: 'JE',
    vaccineCode: 'je',
    displayLines: [{ left: 'JE' }],
    separatorAfter: true
  },
  {
    rowIndex: 12,
    vaccineName: 'PCV-B',
    vaccineCode: 'pcvb',
    displayLines: [{ left: 'PCV-B' }]
  },
  {
    rowIndex: 13,
    vaccineName: 'PENTA-B',
    vaccineCode: 'pentab',
    displayLines: [{ left: 'PENTA-B' }]
  },
  {
    rowIndex: 14,
    vaccineName: 'MR-B',
    vaccineCode: 'mrb',
    displayLines: [{ left: 'MR-B' }]
  }
];

export const DEFAULT_SUBJECTIVE_PLACEHOLDERS = ['Demam :', 'Batuk :', 'Pilek :'];
export const DEFAULT_OBJECTIVE_PLACEHOLDERS = ['BB / PB :', 'LK / S :'];

export const IMMUNIZATION_DOC_CONFIG = {
  header: {
    title: 'AMANAH HEALTH CARE',
    subtitle: 'REKAM MEDIS IMUNISASI',
    topCode: 'RM-01',
    numberBoxCount: 10
  },
  tableHeaders: ['JENIS VAKSIN', 'TGL SUNTIK', 'UMUR', 'SUBJEKTIF', 'OBJEKTIF', 'PLANNING']
} as const;
