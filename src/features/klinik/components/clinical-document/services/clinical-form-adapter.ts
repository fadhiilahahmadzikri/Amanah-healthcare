import type {
  UnifiedInspectorData,
  EditableMaternalData,
  EditableImmunizationData,
  EditableRegularData
} from '../../inspector/types';
import type { Appointment } from '../../../api/types';
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
 * Prioritizes live in-flight form data when editing so preview & downloads reflect live state.
 */
export function adaptToPmbFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment,
  liveMaternal?: EditableMaternalData
): PmbFormData {
  const m = data.maternal;
  const p = data.patient;
  const _answers = data.answers || {};

  const motherName = liveMaternal?.motherName || m?.motherName || p?.fullName || '-';
  const marriageOrder = liveMaternal?.marriageOrder
    ? String(liveMaternal.marriageOrder)
    : m?.marriageOrder
      ? String(m.marriageOrder)
      : '1';
  const rawMarriageDate = liveMaternal?.marriageDate || m?.marriageDate;
  const marriageDate = rawMarriageDate
    ? formatClinicDate(rawMarriageDate, { style: 'human_full' })
    : '-';
  const motherNik = liveMaternal?.motherNik || m?.motherNik || p?.nik || '-';
  const rawMotherBirthDate = liveMaternal?.motherBirthDate || m?.motherBirthDate || p?.birthDate;
  const motherBirthDate = rawMotherBirthDate
    ? formatClinicDate(rawMotherBirthDate, { style: 'human_full' })
    : '-';
  const motherAge = liveMaternal?.motherAge
    ? `${liveMaternal.motherAge} tahun`
    : m?.motherAge
      ? `${m.motherAge} tahun`
      : '-';
  const motherJob = liveMaternal?.motherJob || m?.motherJob || p?.occupation || '-';
  const motherEducation = liveMaternal?.motherEducation || m?.motherEducation || '-';

  const partnerName = liveMaternal?.partnerName || m?.partnerName || '-';
  const partnerAge = liveMaternal?.partnerAge
    ? `${liveMaternal.partnerAge} tahun`
    : m?.partnerAge
      ? `${m.partnerAge} tahun`
      : '-';
  const partnerNik = liveMaternal?.partnerNik || m?.partnerNik || '-';
  const rawPartnerBirthDate = liveMaternal?.partnerBirthDate || m?.partnerBirthDate;
  const partnerBirthDate = rawPartnerBirthDate
    ? formatClinicDate(rawPartnerBirthDate, { style: 'human_full' })
    : '-';
  const partnerJob = liveMaternal?.partnerJob || m?.partnerJob || '-';
  const partnerEducation = liveMaternal?.partnerEducation || m?.partnerEducation || '-';

  const fullRows = [
    liveMaternal?.religion || m?.religion || 'Islam',
    liveMaternal?.domicileAddress || m?.domicileAddress || p?.address || '-',
    liveMaternal?.identityCardAddress || m?.identityCardAddress || p?.address || '-',
    liveMaternal?.phoneNumber || m?.phoneNumber || p?.phone || '-'
  ];

  const locationValues = [
    liveMaternal?.dasawisma || m?.dasawisma || '-',
    liveMaternal?.posyandu || m?.posyandu || '-',
    liveMaternal?.puskesmas || m?.puskesmas || '-'
  ];

  const motherBlood = (
    liveMaternal?.motherBloodType ||
    m?.motherBloodType ||
    p?.bloodType ||
    '-'
  ).toUpperCase();
  const partnerBlood = (liveMaternal?.partnerBloodType || m?.partnerBloodType || '-').toUpperCase();

  const rawHeight = liveMaternal?.heightCm ?? m?.heightCm;
  const tb = rawHeight ? `${rawHeight} cm` : '-';

  const rawWeight = liveMaternal?.prePregnancyWeightKg ?? m?.prePregnancyWeightKg;
  const bbAwal = rawWeight ? `${rawWeight} kg` : '-';

  const rawLila = liveMaternal?.upperArmCircumferenceCm ?? m?.upperArmCircumferenceCm;
  const lila = rawLila ? `${rawLila} cm` : '-';

  const rawBmi = liveMaternal?.initialBmi ?? m?.initialBmi;
  const imt = rawBmi ? String(rawBmi) : '-';

  const tetanus = liveMaternal?.tetanusStatus || m?.tetanusStatus || '-';

  const measurementValues = [
    [tb, lila, tetanus, motherBlood],
    [bbAwal, imt, '', partnerBlood]
  ];

  // Anamnesa prompts
  const rawHpht = liveMaternal?.hpht || m?.hpht;
  const hpht = rawHpht ? formatClinicDate(rawHpht, { style: 'human_full' }) : '-';

  const rawHpl = liveMaternal?.estimatedDueDate || m?.estimatedDueDate;
  const hpl = rawHpl ? formatClinicDate(rawHpl, { style: 'human_full' }) : '-';

  const uk =
    liveMaternal?.gestationalAgeFormatted ||
    m?.gestationalAgeFormatted ||
    (liveMaternal?.gestationalAgeWeeks
      ? `${liveMaternal.gestationalAgeWeeks} minggu`
      : m?.gestationalAgeWeeks
        ? `${m.gestationalAgeWeeks} minggu`
        : '-');

  const keluhan =
    liveMaternal?.currentComplaints ||
    m?.currentComplaints ||
    appointment?.complaint ||
    data.complaint ||
    '-';

  const riskChecked: Record<string, boolean> = {
    Merokok: Boolean(
      (liveMaternal?.smokedBeforePregnancy ?? m?.smokedBeforePregnancy) &&
      (liveMaternal?.smokedBeforePregnancy ?? m?.smokedBeforePregnancy) !== 'no' &&
      (liveMaternal?.smokedBeforePregnancy ?? m?.smokedBeforePregnancy) !== 'Tidak'
    ),
    'Pola Makan Beresiko': Boolean(
      liveMaternal?.irregularDietBeforePregnancy ?? m?.irregularDietBeforePregnancy
    ),
    'Aktivitas fisik berkurang': Boolean(
      liveMaternal?.reducedPhysicalActivityBeforePregnancy ??
      m?.reducedPhysicalActivityBeforePregnancy
    ),
    Alkohol: Boolean(liveMaternal?.alcoholBeforePregnancy ?? m?.alcoholBeforePregnancy),
    'Obat Teratogenik': Boolean(
      liveMaternal?.unprescribedMedicationBeforePregnancy ??
      m?.unprescribedMedicationBeforePregnancy
    ),
    'Kosmetik dengan zat berbahaya': Boolean(
      liveMaternal?.concerningCosmeticUseBeforePregnancy ?? m?.concerningCosmeticUseBeforePregnancy
    )
  };

  // Disease history mapping: Initialize all 14 diseases default to 'tidak'
  const diseaseHistory: Record<string, DiseaseRecord> = {};
  CANONICAL_PMB_DISEASE_KEYS.forEach((dKey) => {
    diseaseHistory[dKey] = { status: 'tidak' };
  });

  if (liveMaternal?.diseaseHistory) {
    const dMap = liveMaternal.diseaseHistory;
    // Map live form fields
    const liveFieldMappings: [string, string, string?][] = [
      ['hasHypertensionHistory', 'Hipertensi', 'hypertensionHistoryNotes'],
      ['hasHeartDiseaseHistory', 'Jantung', 'heartDiseaseHistoryNotes'],
      ['hasThyroidDiseaseHistory', 'Tiroid', 'thyroidDiseaseHistoryNotes'],
      ['hasAutoimmuneHistory', 'Autoimun', 'autoimmuneHistoryNotes'],
      ['hasDiabetesHistory', 'Diabetes', 'diabetesHistoryNotes'],
      ['hasAsthmaHistory', 'Asma', 'asthmaHistoryNotes'],
      ['hasTuberculosisHistory', 'TBC', 'tuberculosisHistoryNotes'],
      ['hasHepatitisBHistory', 'Hepatitis B', 'hepatitisBHistoryNotes'],
      ['hasHivOrSyphilisHistory', 'HIV/Sifilis', 'hivOrSyphilisHistoryNotes'],
      ['hasMentalHealthHistory', 'Jiwa', 'mentalHealthHistoryNotes'],
      ['hasTwinPregnancyHistory', 'Riwayat Gemelli', 'twinPregnancyHistoryNotes'],
      ['hasCystMyomaTumorHistory', 'Kista/Miom/Tumor', 'cystMyomaTumorHistoryNotes'],
      ['hasSurgeryHistory', 'Operasi', 'surgeryHistoryNotes'],
      ['hasOtherDiseaseHistory', '', 'otherDiseaseHistoryYear']
    ];

    liveFieldMappings.forEach(([fieldKey, targetLabel, noteFieldKey]) => {
      const has = Boolean(dMap[fieldKey]);
      const rawYear = noteFieldKey ? dMap[noteFieldKey] : undefined;
      const year = rawYear ? String(rawYear) : undefined;
      diseaseHistory[targetLabel] = {
        status: has ? 'ya' : 'tidak',
        year: has ? year : undefined
      };
      if (targetLabel === '') {
        diseaseHistory['Lain-lain'] = {
          status: has ? 'ya' : 'tidak',
          year: has ? year : undefined
        };
      }
    });
  } else if (m?.diseaseHistory && typeof m.diseaseHistory === 'object') {
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

  // Also support healthConditions array from backend intake if present
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
  const sourcePregnancies = liveMaternal?.previousPregnancies || m?.previousPregnancies || [];
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
  const sourceKb = liveMaternal?.contraceptiveHistories || m?.contraceptiveHistories || [];
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
      allergy: liveMaternal?.allergyInfo || m?.allergyInfo || '-',
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
      environment: liveMaternal?.concerningEnvironmentNotes || m?.concerningEnvironmentNotes || '-',
      otherLines: [liveMaternal?.otherNotes || m?.otherNotes || '', '', ''],
      diseaseHistory
    },
    pregnancyFields: {
      G: String(liveMaternal?.gravidaCount ?? m?.gravidaCount ?? 1),
      P: String(liveMaternal?.parityCount ?? m?.parityCount ?? 0),
      Ab: String(liveMaternal?.abortionCount ?? m?.abortionCount ?? 0),
      Ah: String(liveMaternal?.livingChildrenCount ?? m?.livingChildrenCount ?? 0)
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
  liveImmunization?: EditableImmunizationData
): ImunisasiFormData {
  const c = data.child;
  const p = data.patient;
  const answers = data.answers || {};

  const mrn = p?.medicalRecordNumber || '0000000000';
  const cleanDigits = mrn.replace(/\D/g, '').padStart(10, '0').slice(-10);
  const recordDigits = cleanDigits.split('');

  const childName = liveImmunization?.childName || c?.childName || p?.fullName || '-';
  const childNik = liveImmunization?.childNik || c?.childNik || p?.nik || '-';
  const rawBirthDate = liveImmunization?.childBirthDate || c?.childBirthDate || p?.birthDate;
  const childBirthDate = rawBirthDate
    ? formatClinicDate(rawBirthDate, { style: 'human_full' })
    : '-';
  const phone = liveImmunization?.parentPhone || c?.parentPhone || p?.phone || '-';

  const fatherName = liveImmunization?.fatherName || c?.fatherName || '-';
  const motherName = liveImmunization?.motherName || c?.motherName || p?.motherName || '-';
  const address = liveImmunization?.childAddress || c?.childAddress || p?.address || '-';

  // Construct 15 entries strictly mapped to defaultImunisasiConfig.vaccineTable.rows
  const vaccineRows: (VaccineRowData | undefined)[] = Array.from({ length: 15 }, () => undefined);

  // Relational entries from backend
  const relationalEntries: any[] = Array.isArray(c?.entries) ? c.entries : [];

  VACCINE_SCHEDULE_DEFINITIONS.forEach((def) => {
    let matchedDate: string | undefined = undefined;
    let matchedAge: string | undefined = undefined;
    let matchedPlanning: string | undefined = undefined;

    // Check live form state first
    if (liveImmunization?.vaccineValues) {
      for (const code of def.codes) {
        const status = liveImmunization.vaccineValues[`vaccine_${code}_status`];
        const dateVal = liveImmunization.vaccineValues[`vaccine_${code}_date`];
        if (status === 'Sudah' && dateVal) {
          matchedDate = formatClinicDate(dateVal, { style: 'human_short' });
          matchedAge = def.defaultAge;
          matchedPlanning = def.defaultNotes;
          break;
        }
      }
    }

    // Fallback to relational entries
    if (!matchedDate && relationalEntries.length > 0) {
      const match = relationalEntries.find((entry) =>
        def.codes.some(
          (code) =>
            entry.vaccineCode?.toUpperCase() === code.toUpperCase() ||
            entry.vaccineName?.toUpperCase() === code.toUpperCase()
        )
      );
      if (match && match.status === 'GIVEN') {
        matchedDate = match.givenDate
          ? formatClinicDate(match.givenDate, { style: 'human_short' })
          : '-';
        matchedAge =
          match.ageEstimateMonths !== undefined ? `${match.ageEstimateMonths} bln` : def.defaultAge;
        matchedPlanning = match.notes || def.defaultNotes;
      }
    }

    // Fallback to raw answers keys
    if (!matchedDate && Object.keys(answers).length > 0) {
      for (const code of def.codes) {
        const status = answers[`vaccine_${code}_status`];
        const dateVal = answers[`vaccine_${code}_date`];
        if (status === 'Sudah' && dateVal) {
          matchedDate = formatClinicDate(dateVal, { style: 'human_short' });
          matchedAge = def.defaultAge;
          matchedPlanning = def.defaultNotes;
          break;
        }
      }
    }

    if (matchedDate) {
      vaccineRows[def.rowIdx] = {
        injectionDate: matchedDate,
        age: matchedAge || def.defaultAge,
        subjective: ['-', '-', '-'],
        objective: ['-', '-'],
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
      previousVaccines:
        liveImmunization?.previousVaccineHistory || c?.previousVaccineHistory || '-',
      allergy: liveImmunization?.childAllergyHistory || c?.childAllergyHistory || '-'
    },
    vaccineRows
  };
}

/**
 * Adapter from upstream UnifiedInspectorData to 1:1 RegulerFormData (Poli Umum)
 * Prioritizes live in-flight form data when editing.
 */
export function adaptToRegulerFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment,
  liveRegular?: EditableRegularData
): RegulerFormData {
  const p = data.patient;
  const answers = data.answers || {};

  const bDate = p?.birthDate;
  const age = bDate ? `${new Date().getFullYear() - new Date(bDate).getFullYear()} Tahun` : '-';

  const complaint =
    liveRegular?.complaint ||
    appointment?.complaint ||
    data.complaint ||
    answers.complaint ||
    answers.keluhanUtama ||
    '-';

  const allergy =
    liveRegular?.allergyHistory ||
    answers.allergy ||
    answers.allergyHistory ||
    'Tidak ada riwayat alergi obat maupun makanan.';

  const heightVal = liveRegular?.heightCm || answers.height || answers.vitalHeightCm;
  const vitalHeightCm = heightVal ? `${heightVal} cm` : '-';

  const weightVal = liveRegular?.weightKg || answers.weight || answers.vitalWeightKg;
  const vitalWeightKg = weightVal ? `${weightVal} kg` : '-';

  const vitalBloodPressure =
    liveRegular?.bloodPressure || answers.bloodPressure || answers.vitalBloodPressure || '-';

  const additionalNotes = liveRegular?.notes || answers.notes || answers.additionalNotes || '-';

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
      nik: p?.nik || '-',
      fullName: p?.fullName || '-',
      gender: formatGender(p?.gender),
      birthDate: bDate ? formatClinicDate(bDate, { style: 'human_full' }) : '-',
      birthPlace: p?.birthPlace || '-',
      age,
      bloodType: (p?.bloodType || '-').toUpperCase(),
      motherName: p?.motherName || '-',
      occupation: p?.occupation || '-',
      religion: 'Islam',
      phoneNumber: p?.phone || '-',
      email: p?.email || '-',
      address: p?.address || '-',
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
