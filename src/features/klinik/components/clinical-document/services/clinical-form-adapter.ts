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
import { CANONICAL_MATERNAL_CONDITIONS } from '@/features/maternity/constants/maternity.constants';

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
 * Ordered list of 14 canonical diseases for PMB anamnesis derived directly from CANONICAL_MATERNAL_CONDITIONS
 */
const CANONICAL_PMB_DISEASE_KEYS = CANONICAL_MATERNAL_CONDITIONS.map((c) => c.docLabel);

/**
 * 15 canonical vaccine schedule rows mapped to defaultImunisasiConfig.vaccineTable.rows
 */
interface VaccineScheduleDef {
  rowIdx: number;
  codes: string[];
  defaultAge: string;
}

const VACCINE_SCHEDULE_DEFINITIONS: VaccineScheduleDef[] = [
  {
    rowIdx: 0,
    codes: ['HB_0', 'hb_0', 'hb0', 'HB0'],
    defaultAge: '0 bln'
  },
  { rowIdx: 1, codes: ['BCG', 'bcg'], defaultAge: '1 bln' },
  {
    rowIdx: 2,
    codes: ['PENTA_1', 'IPV_1', 'HEXA_1', 'penta_1', 'ipv_1', 'hexa_1'],
    defaultAge: '2 bln'
  },
  {
    rowIdx: 3,
    codes: ['PCV_1', 'pcv_1'],
    defaultAge: '2 bln'
  },
  { rowIdx: 4, codes: ['RV_1', 'rv_1'], defaultAge: '2 bln' },
  {
    rowIdx: 5,
    codes: ['PENTA_2', 'IPV_2', 'HEXA_2', 'penta_2', 'ipv_2', 'hexa_2'],
    defaultAge: '3 bln'
  },
  {
    rowIdx: 6,
    codes: ['PCV_2', 'pcv_2'],
    defaultAge: '3 bln'
  },
  { rowIdx: 7, codes: ['RV_2', 'rv_2'], defaultAge: '3 bln' },
  {
    rowIdx: 8,
    codes: ['PENTA_3', 'IPV_3', 'HEXA_3', 'penta_3', 'ipv_3', 'hexa_3'],
    defaultAge: '4 bln'
  },
  { rowIdx: 9, codes: ['RV_3', 'rv_3'], defaultAge: '4 bln' },
  {
    rowIdx: 10,
    codes: ['MR', 'mr', 'campak', 'CAMPAK'],
    defaultAge: '9 bln'
  },
  { rowIdx: 11, codes: ['JE', 'je'], defaultAge: '10 bln' },
  {
    rowIdx: 12,
    codes: ['PCV_B', 'pcv_b', 'PCV_BOOSTER'],
    defaultAge: '12 bln'
  },
  {
    rowIdx: 13,
    codes: ['PENTA_B', 'penta_b', 'PENTA_BOOSTER'],
    defaultAge: '18 bln'
  },
  {
    rowIdx: 14,
    codes: ['MR_B', 'mr_b', 'MR_BOOSTER'],
    defaultAge: '18 bln'
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

  const isSmokingActive = m?.smokedBeforePregnancy === 'Aktif';
  const isSmokingPassive =
    m?.smokedBeforePregnancy === 'Pasif' || Boolean(m?.smokeExposureBeforePregnancy);

  const riskChecked: Record<string, boolean> = {
    'Merokok (Aktif)': isSmokingActive,
    'Perokok Pasif': isSmokingPassive,
    'Pola Makan Beresiko': Boolean(m?.irregularDietBeforePregnancy),
    'Aktivitas fisik berkurang': Boolean(m?.reducedPhysicalActivityBeforePregnancy),
    Alkohol: Boolean(m?.alcoholBeforePregnancy),
    'Obat Teratogenik': Boolean(m?.unprescribedMedicationBeforePregnancy),
    'Kosmetik dengan zat berbahaya': Boolean(m?.concerningCosmeticUseBeforePregnancy)
  };

  // 1-to-1 mapping from canonical conditionResponses array
  const conditionsByCode = new Map<string, any>();
  if (Array.isArray(m?.conditionResponses)) {
    m.conditionResponses.forEach((c) => {
      if (c.conditionCode) {
        conditionsByCode.set(c.conditionCode, c);
      }
    });
  }

  const diseaseHistory: Record<string, DiseaseRecord> = {};
  for (const condDef of CANONICAL_MATERNAL_CONDITIONS) {
    const resp = conditionsByCode.get(condDef.code);
    const has = Boolean(resp?.hasCondition);
    diseaseHistory[condDef.docLabel] = {
      status: has ? 'ya' : 'tidak',
      year: has && resp?.diagnosisYear ? String(resp.diagnosisYear) : undefined,
      notes: condDef.code === 'OTHER' ? (resp?.notes || undefined) : undefined
    };
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
    // 1. Relational entries from backend or live active inspector state
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

      if (match) {
        const rawDate = match.givenDate || match.injectionDate;
        const hasDate = Boolean(rawDate);
        const hasVitals =
          match.weightKg != null ||
          match.heightCm != null ||
          match.headCircumferenceCm != null ||
          match.temperatureCelsius != null;
        const hasSymptoms = Boolean(match.fever || match.cough || match.runnyNose);
        const hasPlanning = Boolean(match.planning || match.notes);
        const isGiven = match.status === 'GIVEN';

        // Include row if it has any recorded clinical activity
        if (isGiven || hasDate || hasVitals || hasSymptoms || hasPlanning) {
          const matchedDate = rawDate
            ? formatClinicDate(rawDate, { style: 'human_short' })
            : '';

          const matchedAge =
            match.ageDisplay ||
            (match.ageEstimateMonths !== undefined ? `${match.ageEstimateMonths} bln` : '');

          const matchedPlanning = match.planning || match.notes || '';

          const matchedSubjective = [
            `Demam: ${match.fever || '-'}`,
            `Batuk: ${match.cough || '-'}`,
            `Pilek: ${match.runnyNose || '-'}`
          ];

          const bbStr = match.weightKg != null ? `${match.weightKg} kg` : '-';
          const pbStr = match.heightCm != null ? `${match.heightCm} cm` : '-';
          const lkStr = match.headCircumferenceCm != null ? `${match.headCircumferenceCm} cm` : '-';
          const tempStr = match.temperatureCelsius != null ? `${match.temperatureCelsius}°C` : '-';
          const matchedObjective = [`BB/PB: ${bbStr}/${pbStr}`, `LK/S: ${lkStr}/${tempStr}`];

          vaccineRows[def.rowIdx] = {
            injectionDate: matchedDate,
            age: matchedAge,
            subjective: matchedSubjective,
            objective: matchedObjective,
            planning: matchedPlanning
          };
          return;
        }
      }
    }

    // 2. Answers from schema JSONB fallback
    if (Object.keys(answers).length > 0) {
      for (const code of def.codes) {
        const status = answers[`vaccine_${code}_status`];
        const dateVal = answers[`vaccine_${code}_date`];
        if ((status === 'Sudah' || status === 'GIVEN') && dateVal) {
          const formattedDate = formatClinicDate(dateVal, { style: 'human_short' });
          vaccineRows[def.rowIdx] = {
            injectionDate: formattedDate,
            age: def.defaultAge,
            subjective: ['Demam: -', 'Batuk: -', 'Pilek: -'],
            objective: ['BB/PB: -', 'LK/S: -'],
            planning: ''
          };
          break;
        }
      }
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
    poliklinikName: appointment?.poliklinik_name || data?.poliklinikName || '-',
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
      bloodType: p?.bloodType ? p.bloodType.toUpperCase() : '-',
      motherName: p?.motherName || '-',
      occupation: p?.occupation || '-',
      phoneNumber: p?.phone || '-',
      email: p?.email || '-',
      address: resolvedAddress,
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
