import type { UnifiedInspectorData } from '../../inspector/types';
import type { Appointment } from '../../../api/types';
import type { FormJsonSchema } from '../../../constants/default-form-template';
import type {
  PmbFormData,
  ImunisasiFormData,
  RegulerFormData,
  VaccineRowData,
  DiseaseRecord
} from '../types';
import { getGenderLabel } from '@/constants/gender.constants';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import { formatClinicDate } from '@/lib/date-format';

function getInactiveFieldIds(schema?: FormJsonSchema | Record<string, any> | null): Set<string> {
  const inactive = new Set<string>();
  if (!schema || !Array.isArray(schema.steps)) return inactive;
  for (const step of schema.steps) {
    if (step && Array.isArray(step.fields)) {
      for (const field of step.fields) {
        if (field && field.isActive === false && field.id) {
          inactive.add(field.id);
        }
      }
    }
  }
  return inactive;
}

/**
 * Maps raw gender string to formal presentation label
 */
function formatGender(gender?: string): string {
  return getGenderLabel(gender);
}

/**
 * Canonical dictionary mapping all backend / answer disease identifiers to
 * the exact Indonesian labels declared in pmb-config.ts
 */
const DISEASE_CANONICAL_TO_LABEL_MAP: Record<string, string> = {
  hasHypertensionHistory: 'Hipertensi',
  hypertension: 'Hipertensi',
  hasHeartDiseaseHistory: 'Jantung',
  heart_disease: 'Jantung',
  hasThyroidDiseaseHistory: 'Tiroid',
  thyroid_disease: 'Tiroid',
  hasAutoimmuneHistory: 'Autoimun',
  autoimmune: 'Autoimun',
  hasDiabetesHistory: 'Diabetes',
  diabetes: 'Diabetes',
  hasAsthmaHistory: 'Asma',
  asthma: 'Asma',
  hasTuberculosisHistory: 'TBC',
  tuberculosis: 'TBC',
  tbc: 'TBC',
  hasHepatitisBHistory: 'Hepatitis B',
  hepatitis_b: 'Hepatitis B',
  hasHivOrSyphilisHistory: 'HIV/Sifilis',
  hiv_syphilis: 'HIV/Sifilis',
  hasMentalHealthHistory: 'Jiwa',
  mental_health: 'Jiwa',
  hasTwinPregnancyHistory: 'Riwayat Gemelli',
  twin_pregnancy: 'Riwayat Gemelli',
  hasCystMyomaTumorHistory: 'Kista/Miom/Tumor',
  cyst_myoma_tumor: 'Kista/Miom/Tumor',
  hasSurgeryHistory: 'Operasi',
  surgery: 'Operasi',
  hasOtherDiseaseHistory: '',
  other: ''
};

/**
 * Ordered list of 14 canonical diseases for PMB anamnesis
 */
const CANONICAL_PMB_DISEASE_KEYS = [
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
];

/**
 * 15 canonical vaccine schedule rows mapped to defaultImunisasiConfig.vaccineTable.rows
 */
interface VaccineScheduleDef {
  rowIdx: number;
  codes: string[];
  defaultAge: string;
  defaultNotes: string;
}

const VACCINE_SCHEDULE_DEFINITIONS: VaccineScheduleDef[] = [
  {
    rowIdx: 0,
    codes: ['HB_0', 'hb_0', 'hb0', 'HB0'],
    defaultAge: '0 bln',
    defaultNotes: 'HB 0 telah diberikan'
  },
  { rowIdx: 1, codes: ['BCG', 'bcg'], defaultAge: '1 bln', defaultNotes: 'BCG telah diberikan' },
  {
    rowIdx: 2,
    codes: ['PENTA_1', 'IPV_1', 'HEXA_1', 'penta_1', 'ipv_1', 'hexa_1'],
    defaultAge: '2 bln',
    defaultNotes: 'Penta 1 + IPV 1 telah diberikan'
  },
  {
    rowIdx: 3,
    codes: ['PCV_1', 'pcv_1'],
    defaultAge: '2 bln',
    defaultNotes: 'PCV 1 telah diberikan'
  },
  { rowIdx: 4, codes: ['RV_1', 'rv_1'], defaultAge: '2 bln', defaultNotes: 'RV 1 telah diberikan' },
  {
    rowIdx: 5,
    codes: ['PENTA_2', 'IPV_2', 'HEXA_2', 'penta_2', 'ipv_2', 'hexa_2'],
    defaultAge: '3 bln',
    defaultNotes: 'Penta 2 + IPV 2 telah diberikan'
  },
  {
    rowIdx: 6,
    codes: ['PCV_2', 'pcv_2'],
    defaultAge: '3 bln',
    defaultNotes: 'PCV 2 telah diberikan'
  },
  { rowIdx: 7, codes: ['RV_2', 'rv_2'], defaultAge: '3 bln', defaultNotes: 'RV 2 telah diberikan' },
  {
    rowIdx: 8,
    codes: ['PENTA_3', 'IPV_3', 'HEXA_3', 'penta_3', 'ipv_3', 'hexa_3'],
    defaultAge: '4 bln',
    defaultNotes: 'Penta 3 + IPV 3 telah diberikan'
  },
  { rowIdx: 9, codes: ['RV_3', 'rv_3'], defaultAge: '4 bln', defaultNotes: 'RV 3 telah diberikan' },
  {
    rowIdx: 10,
    codes: ['MR', 'mr', 'campak', 'CAMPAK'],
    defaultAge: '9 bln',
    defaultNotes: 'MR telah diberikan'
  },
  { rowIdx: 11, codes: ['JE', 'je'], defaultAge: '10 bln', defaultNotes: 'JE telah diberikan' },
  {
    rowIdx: 12,
    codes: ['PCV_B', 'pcv_b', 'PCV_BOOSTER'],
    defaultAge: '12 bln',
    defaultNotes: 'PCV Booster telah diberikan'
  },
  {
    rowIdx: 13,
    codes: ['PENTA_B', 'penta_b', 'PENTA_BOOSTER'],
    defaultAge: '18 bln',
    defaultNotes: 'Penta Booster telah diberikan'
  },
  {
    rowIdx: 14,
    codes: ['MR_B', 'mr_b', 'MR_BOOSTER'],
    defaultAge: '18 bln',
    defaultNotes: 'MR Booster telah diberikan'
  }
];

/**
 * Adapter from upstream UnifiedInspectorData to 1:1 PmbFormData (ANC & KB)
 */
export function adaptToPmbFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment,
  schema?: FormJsonSchema | Record<string, any> | null
): PmbFormData {
  const m = data.maternal;
  const p = data.patient;
  const inactive = getInactiveFieldIds(schema);
  const isFieldActive = (id: string) => !inactive.has(id);

  const motherName = isFieldActive('motherName') ? (m?.motherName || p?.fullName || '-') : '-';
  const marriageOrder = isFieldActive('marriageOrder') ? (m?.marriageOrder ? String(m.marriageOrder) : '1') : '-';
  const rawMarriageDate = isFieldActive('marriageDate') ? m?.marriageDate : undefined;
  const marriageDate = rawMarriageDate
    ? formatClinicDate(rawMarriageDate, { style: 'human_full' })
    : '-';
  const motherNik = isFieldActive('motherNik') ? (m?.motherNik || p?.nik || '-') : '-';
  const rawMotherBirthDate = isFieldActive('motherBirthDate') ? (m?.motherBirthDate || p?.birthDate) : undefined;
  const motherBirthDate = rawMotherBirthDate
    ? formatClinicDate(rawMotherBirthDate, { style: 'human_full' })
    : '-';
  const motherAge = isFieldActive('motherAge') ? (m?.motherAge ? `${m.motherAge} tahun` : '-') : '-';
  const motherJob = isFieldActive('motherJob') ? (m?.motherJob || p?.occupation || '-') : '-';
  const motherEducation = isFieldActive('motherEducation') ? (m?.motherEducation || '-') : '-';

  const partnerName = isFieldActive('partnerName') ? (m?.partnerName || '-') : '-';
  const partnerAge = isFieldActive('partnerAge') ? (m?.partnerAge ? `${m.partnerAge} tahun` : '-') : '-';
  const partnerNik = isFieldActive('partnerNik') ? (m?.partnerNik || '-') : '-';
  const rawPartnerBirthDate = isFieldActive('partnerBirthDate') ? m?.partnerBirthDate : undefined;
  const partnerBirthDate = rawPartnerBirthDate
    ? formatClinicDate(rawPartnerBirthDate, { style: 'human_full' })
    : '-';
  const partnerJob = isFieldActive('partnerJob') ? (m?.partnerJob || '-') : '-';
  const partnerEducation = isFieldActive('partnerEducation') ? (m?.partnerEducation || '-') : '-';

  const fullRows = [
    isFieldActive('religion') ? (m?.religion || '-') : '-',
    isFieldActive('domicileAddress') ? (m?.domicileAddress || p?.address || '-') : '-',
    isFieldActive('identityCardAddress') ? (m?.identityCardAddress || p?.address || '-') : '-',
    isFieldActive('phoneNumber') ? (m?.phoneNumber || p?.phone || '-') : '-'
  ];

  const locationValues = [
    isFieldActive('dasawisma') ? (m?.dasawisma || '-') : '-',
    isFieldActive('posyandu') ? (m?.posyandu || '-') : '-',
    isFieldActive('puskesmas') ? (m?.puskesmas || '-') : '-'
  ];

  const motherBlood = (m?.motherBloodType || p?.bloodType || '-').toUpperCase();
  const partnerBlood = (m?.partnerBloodType || '-').toUpperCase();

  const rawHeight = m?.heightCm;
  const tb = rawHeight ? `${rawHeight} cm` : '-';

  const rawWeight = m?.prePregnancyWeightKg;
  const bbAwal = rawWeight ? `${rawWeight} kg` : '-';

  const rawLila = m?.upperArmCircumferenceCm;
  const lila = rawLila ? `${rawLila} cm` : '-';

  const rawBmi = m?.initialBmi;
  const imt = rawBmi ? String(rawBmi) : '-';

  const tetanus = m?.tetanusStatus || '-';

  const measurementValues = [
    [tb, lila, tetanus, motherBlood],
    [bbAwal, imt, '', partnerBlood]
  ];

  // Anamnesa prompts
  const rawHpht = m?.hpht;
  const hpht = rawHpht ? formatClinicDate(rawHpht, { style: 'human_full' }) : '-';

  const rawHpl = m?.estimatedDueDate;
  const hpl = rawHpl ? formatClinicDate(rawHpl, { style: 'human_full' }) : '-';

  const uk =
    m?.gestationalAgeFormatted ||
    (m?.gestationalAgeWeeks ? `${m.gestationalAgeWeeks} minggu` : '-');

  const keluhan =
    m?.currentComplaints ||
    appointment?.complaint ||
    data.complaint ||
    '-';

  const riskChecked: Record<string, boolean> = {
    Merokok: Boolean(
      m?.smokedBeforePregnancy &&
      m.smokedBeforePregnancy !== 'no' &&
      m.smokedBeforePregnancy !== 'Tidak'
    ),
    'Pola Makan Beresiko': Boolean(m?.irregularDietBeforePregnancy),
    'Aktivitas fisik berkurang': Boolean(m?.reducedPhysicalActivityBeforePregnancy),
    Alkohol: Boolean(m?.alcoholBeforePregnancy),
    'Obat Teratogenik': Boolean(m?.unprescribedMedicationBeforePregnancy),
    'Kosmetik dengan zat berbahaya': Boolean(m?.concerningCosmeticUseBeforePregnancy)
  };

  // Disease history mapping: Initialize all 14 diseases default to 'tidak'
  const diseaseHistory: Record<string, DiseaseRecord> = {};
  CANONICAL_PMB_DISEASE_KEYS.forEach((dKey) => {
    diseaseHistory[dKey] = { status: 'tidak' };
  });

  if (m?.diseaseHistory && typeof m.diseaseHistory === 'object') {
    for (const [key, val] of Object.entries(m.diseaseHistory)) {
      const targetLabel = DISEASE_CANONICAL_TO_LABEL_MAP[key] ?? key;
      if (typeof val === 'object' && val !== null) {
        const has = (val as any).status === 'ya' || (val as any).hasCondition === true;
        diseaseHistory[targetLabel] = {
          status: has ? 'ya' : 'tidak',
          year: has && (val as any).year ? String((val as any).year) : undefined
        };
      } else if (typeof val === 'boolean') {
        diseaseHistory[targetLabel] = { status: val ? 'ya' : 'tidak' };
      }
    }
  }

  // Support healthConditions array from backend intake if present
  if (Array.isArray(m?.healthConditions)) {
    m.healthConditions.forEach((c) => {
      if (c.conditionCode) {
        const targetLabel = DISEASE_CANONICAL_TO_LABEL_MAP[c.conditionCode] ?? c.conditionCode;
        diseaseHistory[targetLabel] = {
          status: c.hasCondition ? 'ya' : 'tidak',
          year: c.hasCondition && c.diagnosisYear ? String(c.diagnosisYear) : undefined
        };
      }
    });
  }

  // Obstetri rows mapping
  const sourcePregnancies = m?.previousPregnancies || [];
  const obstetriRows: (string | undefined)[][] = [];

  if (Array.isArray(sourcePregnancies) && sourcePregnancies.length > 0) {
    sourcePregnancies.forEach((row, idx) => {
      obstetriRows.push([
        String(idx + 1),
        row.birthYear ? String(row.birthYear) : '-',
        row.birthWeightGrams && row.birthLengthCm
          ? `${row.birthWeightGrams}g / ${row.birthLengthCm}cm`
          : row.birthWeightGrams
            ? `${row.birthWeightGrams}g`
            : '-',
        formatGender(row.childSex),
        row.gestationalAgeAtBirth || '-',
        row.birthAttendant || '-',
        row.deliveryMethod || '-',
        row.deliveryPlace || '-',
        row.complications || 'Tidak ada'
      ]);
    });
  }

  // KB rows mapping
  const sourceKb = m?.contraceptiveHistories || [];
  const kbRows: (string | undefined)[][] = [];

  if (Array.isArray(sourceKb) && sourceKb.length > 0) {
    sourceKb.forEach((row, idx) => {
      kbRows.push([
        String(idx + 1),
        row.startDate ? formatClinicDate(row.startDate, { style: 'human_short' }) : '-',
        row.contraceptiveType || '-',
        row.durationText || '-',
        row.stopDate ? formatClinicDate(row.stopDate, { style: 'human_short' }) : '-',
        row.problems || '-',
        row.sideEffects || '-'
      ]);
    });
  }

  return {
    header: {
      allergy: m?.allergyInfo || '-',
      rmAncCode: p?.medicalRecordNumber || '-'
    },
    identity: {
      topRowValues: [
        [motherName, marriageOrder, marriageDate],
        [motherNik, motherBirthDate, motherJob],
        [partnerName, motherAge, motherEducation],
        [partnerNik, partnerBirthDate, partnerJob],
        ['', partnerAge, partnerEducation]
      ],
      fullRowValues: fullRows,
      locationValues,
      measurementValues
    },
    anamnesa: {
      promptValues: [hpht, hpl, uk, keluhan],
      riskChecked,
      environment: m?.concerningEnvironmentNotes || '-',
      otherLines: [m?.otherNotes || '', '', ''],
      diseaseHistory
    },
    pregnancyFields: {
      G: String(m?.gravidaCount ?? 1),
      P: String(m?.parityCount ?? 0),
      Ab: String(m?.abortionCount ?? 0),
      Ah: String(m?.livingChildrenCount ?? 0)
    },
    obstetriRows,
    kbRows
  };
}

/**
 * Adapter from upstream UnifiedInspectorData to 1:1 ImunisasiFormData
 * Aligns vaccine rows strictly by vaccine code to the 15 standard table slots.
 */
export function adaptToImunisasiFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment,
  schema?: FormJsonSchema | Record<string, any> | null
): ImunisasiFormData {
  const c = data.child;
  const p = data.patient;
  const answers = data.answers || {};
  const inactive = getInactiveFieldIds(schema);
  const isFieldActive = (id: string) => !inactive.has(id);

  const mrn = p?.medicalRecordNumber || '0000000000';
  const cleanDigits = mrn.replace(/\D/g, '').padStart(10, '0').slice(-10);
  const recordDigits = cleanDigits.split('');

  const childName = isFieldActive('childName') ? (c?.childName || p?.fullName || '-') : '-';
  const childNik = isFieldActive('childNik') ? (c?.childNik || p?.nik || '-') : '-';
  const rawBirthDate = isFieldActive('childBirthDate') ? (c?.childBirthDate || p?.birthDate) : undefined;
  const childBirthDate = rawBirthDate
    ? formatClinicDate(rawBirthDate, { style: 'human_full' })
    : '-';
  const phone = isFieldActive('parentPhone') ? (c?.parentPhone || p?.phone || '-') : '-';

  const fatherName = isFieldActive('fatherName') ? (c?.fatherName || '-') : '-';
  const motherName = isFieldActive('motherName') ? (c?.motherName || p?.motherName || '-') : '-';
  const address = isFieldActive('childAddress') ? (c?.childAddress || p?.address || '-') : '-';

  // Construct 15 entries strictly mapped to defaultImunisasiConfig.vaccineTable.rows
  const vaccineRows: (VaccineRowData | undefined)[] = Array.from({ length: 15 }, () => undefined);

  // Relational entries from backend
  const relationalEntries: any[] = Array.isArray(c?.entries) ? c.entries : [];

  VACCINE_SCHEDULE_DEFINITIONS.forEach((def) => {
    let matchedDate: string | undefined = undefined;
    let matchedAge: string | undefined = undefined;
    let matchedPlanning: string | undefined = undefined;
    let matchedSubjective: string[] | undefined = undefined;
    let matchedObjective: string[] | undefined = undefined;

    // Relational entries from backend
    if (relationalEntries.length > 0) {
      const match = relationalEntries.find(
        (entry) =>
          entry.rowIndex === def.rowIdx ||
          def.codes.some(
            (code) =>
              entry.vaccineCode?.toUpperCase() === code.toUpperCase() ||
              entry.vaccineName?.toUpperCase() === code.toUpperCase()
          )
      );
      if (match && match.status === 'GIVEN') {
        matchedDate = match.givenDate || match.injectionDate
          ? formatClinicDate(match.givenDate || match.injectionDate, { style: 'human_short' })
          : '-';
        matchedAge =
          match.ageDisplay ||
          (match.ageEstimateMonths !== undefined ? `${match.ageEstimateMonths} bln` : def.defaultAge);
        matchedPlanning = match.planning || match.notes || def.defaultNotes;

        matchedSubjective = [
          `Demam: ${match.fever || 'Tidak'}`,
          `Batuk: ${match.cough || 'Tidak'}`,
          `Pilek: ${match.runnyNose || 'Tidak'}`
        ];

        const bbStr = match.weightKg != null ? `${match.weightKg} kg` : '-';
        const pbStr = match.heightCm != null ? `${match.heightCm} cm` : '-';
        const lkStr = match.headCircumferenceCm != null ? `${match.headCircumferenceCm} cm` : '-';
        const tempStr = match.temperatureCelsius != null ? `${match.temperatureCelsius} C` : '-';
        matchedObjective = [`BB/PB: ${bbStr}/${pbStr}`, `LK/S: ${lkStr}/${tempStr}`];
      }
    }

    // Answers from schema JSONB fallback
    if (!matchedDate && Object.keys(answers).length > 0) {
      for (const code of def.codes) {
        const status = answers[`vaccine_${code}_status`];
        const dateVal = answers[`vaccine_${code}_date`];
        if (status === 'Sudah' && dateVal) {
          matchedDate = formatClinicDate(dateVal, { style: 'human_short' });
          matchedAge = def.defaultAge;
          matchedPlanning = def.defaultNotes;
          matchedSubjective = ['Demam: Tidak', 'Batuk: Tidak', 'Pilek: Tidak'];
          matchedObjective = ['BB/PB: -', 'LK/S: -'];
          break;
        }
      }
    }

    if (matchedDate) {
      vaccineRows[def.rowIdx] = {
        injectionDate: matchedDate,
        age: matchedAge || def.defaultAge,
        subjective: matchedSubjective || ['Demam: Tidak', 'Batuk: Tidak', 'Pilek: Tidak'],
        objective: matchedObjective || ['BB/PB: -', 'LK/S: -'],
        planning: matchedPlanning || def.defaultNotes
      };
    }
  });

  return {
    header: {
      topCode: 'RM-01',
      recordDigits
    },
    identity: {
      leftValues: [childName, childNik, childBirthDate, phone],
      rightValues: [fatherName, motherName, address, '']
    },
    preTable: {
      previousVaccines: c?.previousVaccineHistory || '-',
      allergy: c?.childAllergyHistory || '-'
    },
    vaccineRows
  };
}

/**
 * Adapter from upstream UnifiedInspectorData to 1:1 RegulerFormData (General Intake)
 */
export function adaptToRegulerFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment,
  schema?: FormJsonSchema | Record<string, any> | null
): RegulerFormData {
  const p = data.patient;
  const answers = data.answers || {};
  const inactive = getInactiveFieldIds(schema);
  const isFieldActive = (id: string) => !inactive.has(id);

  const bDate = p?.birthDate;
  const age = bDate ? `${new Date().getFullYear() - new Date(bDate).getFullYear()} Tahun` : '-';

  const complaint = appointment?.complaint || data.complaint || '-';
  const allergy = answers.allergyHistory || '-';

  const heightVal = answers.vitalHeightCm;
  const vitalHeightCm = heightVal ? `${heightVal} cm` : '-';

  const weightVal = answers.vitalWeightKg;
  const vitalWeightKg = weightVal ? `${weightVal} kg` : '-';

  const vitalBloodPressure = answers.vitalBloodPressure || '-';
  const additionalNotes = answers.additionalNotes || '-';

  const resolvedAddress = (() => {
    const l1 = p?.line1;
    const vill = p?.villageName;
    const dist = p?.districtName;
    const reg = p?.regencyName;
    const prov = p?.provinceName;
    const parts = [
      l1,
      vill ? `Kel. ${vill}` : '',
      dist ? `Kec. ${dist}` : '',
      reg,
      prov ? `Prov. ${prov}` : ''
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : p?.address || '-';
  })();

  return {
    medicalRecordNumber: p?.medicalRecordNumber || '-',
    registrationDate: data.scheduledDate
      ? formatClinicDate(data.scheduledDate, { style: 'human_full' })
      : formatClinicDate(new Date().toISOString(), { style: 'human_full' }),
    bookingCode: appointment?.booking_code || data.bookingCode || '-',
    queueNumber: appointment?.queue_number || '-',
    serviceName: appointment?.service || data.serviceName || '-',
    doctorName: appointment?.doctor_name || '-',
    scheduledTime: `${appointment?.scheduled_start_time || data.scheduledStartTime || '-'} WIB`,
    identity: {
      nik: isFieldActive('nik') ? (p?.nik || '-') : '-',
      fullName: isFieldActive('fullName') ? (p?.fullName || '-') : '-',
      gender: isFieldActive('gender') ? formatGender(p?.gender) : '-',
      birthDate: isFieldActive('dateOfBirth') && bDate ? formatClinicDate(bDate, { style: 'human_full' }) : '-',
      birthPlace: isFieldActive('placeOfBirth') ? (p?.birthPlace || '-') : '-',
      age: isFieldActive('dateOfBirth') ? age : '-',
      bloodType: isFieldActive('bloodType') ? (p?.bloodType || '-').toUpperCase() : '-',
      motherName: isFieldActive('motherName') ? (p?.motherName || '-') : '-',
      occupation: isFieldActive('occupationCode') || isFieldActive('occupation') ? (p?.occupation || '-') : '-',
      phoneNumber: isFieldActive('phone') ? (p?.phone || '-') : '-',
      email: isFieldActive('email') ? (p?.email || '-') : '-',
      address: isFieldActive('region') ? resolvedAddress : '-',
      relationship: getRelationshipLabel(p?.relationshipType)
    },
    emergencyContact: {
      name: p?.emergencyContactName || '-',
      relationship: p?.emergencyContactRelationship || '-',
      phoneNumber: p?.emergencyContactPhone || '-'
    },
    clinical: {
      chiefComplaint: complaint,
      allergyHistory: allergy,
      vitalHeightCm,
      vitalWeightKg,
      vitalBloodPressure,
      additionalNotes
    }
  };
}
