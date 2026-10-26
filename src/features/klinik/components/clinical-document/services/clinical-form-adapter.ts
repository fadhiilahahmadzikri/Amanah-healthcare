import type { UnifiedInspectorData } from '../../inspector/types';
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
 * Adapter from upstream UnifiedInspectorData to 1:1 PmbFormData (ANC & KB)
 */
export function adaptToPmbFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment
): PmbFormData {
  const m = data.maternal;
  const p = data.patient;
  const answers = data.answers || {};

  const motherName = m?.motherName || '-';
  const marriageOrder = m?.marriageOrder ? String(m.marriageOrder) : '1';
  const marriageDate = m?.marriageDate
    ? formatClinicDate(m.marriageDate, { style: 'human_full' })
    : '-';
  const motherNik = m?.motherNik || '-';
  const motherBirthDate = m?.motherBirthDate
    ? formatClinicDate(m.motherBirthDate, { style: 'human_full' })
    : '-';
  const motherAge = m?.motherAge ? `${m.motherAge} tahun` : '-';
  const motherJob = m?.motherJob || '-';
  const motherEducation = m?.motherEducation || '-';

  const partnerName = m?.partnerName || '-';
  const partnerAge = m?.partnerAge ? `${m.partnerAge} tahun` : '-';
  const partnerNik = m?.partnerNik || '-';
  const partnerBirthDate = m?.partnerBirthDate
    ? formatClinicDate(m.partnerBirthDate, { style: 'human_full' })
    : '-';
  const partnerJob = m?.partnerJob || '-';
  const partnerEducation = m?.partnerEducation || '-';

  const fullRows = [
    m?.religion || 'Islam',
    m?.domicileAddress || '-',
    m?.identityCardAddress || '-',
    m?.phoneNumber || '-'
  ];

  const locationValues = [m?.dasawisma || '-', m?.posyandu || '-', m?.puskesmas || '-'];

  const motherBlood = (m?.motherBloodType || '-').toUpperCase();
  const partnerBlood = (m?.partnerBloodType || '-').toUpperCase();
  const tb = m?.heightCm ? `${m.heightCm} cm` : '-';
  const bbAwal = m?.prePregnancyWeightKg ? `${m.prePregnancyWeightKg} kg` : '-';
  const lila = m?.upperArmCircumferenceCm ? `${m.upperArmCircumferenceCm} cm` : '-';
  const imt = m?.initialBmi ? String(m.initialBmi) : '-';
  const tetanus = m?.tetanusStatus || '-';

  const measurementValues = [
    [tb, lila, tetanus, motherBlood],
    [bbAwal, imt, '', partnerBlood]
  ];

  // Anamnesa prompts
  const hpht = m?.hpht ? formatClinicDate(m.hpht, { style: 'human_full' }) : '-';
  const hpl = m?.estimatedDueDate
    ? formatClinicDate(m.estimatedDueDate, { style: 'human_full' })
    : '-';
  const uk =
    m?.gestationalAgeFormatted ||
    (m?.gestationalAgeWeeks ? `${m.gestationalAgeWeeks} minggu` : '-');
  const keluhan = m?.currentComplaints || '-';

  const riskChecked: Record<string, boolean> = {
    Merokok: Boolean(m?.smokedBeforePregnancy && m.smokedBeforePregnancy !== 'no'),
    'Pola Makan Beresiko': Boolean(m?.irregularDietBeforePregnancy),
    'Aktivitas fisik berkurang': Boolean(m?.reducedPhysicalActivityBeforePregnancy),
    Alkohol: Boolean(m?.alcoholBeforePregnancy),
    'Obat Teratogenik': Boolean(m?.unprescribedMedicationBeforePregnancy),
    'Kosmetik dengan zat berbahaya': Boolean(m?.concerningCosmeticUseBeforePregnancy)
  };

  // Disease history mapping
  const diseaseHistory: Record<string, DiseaseRecord> = {};
  if (m?.diseaseHistory && typeof m.diseaseHistory === 'object') {
    for (const [key, val] of Object.entries(m.diseaseHistory)) {
      if (typeof val === 'object' && val !== null) {
        diseaseHistory[key] = {
          status: (val as any).status || ((val as any).hasCondition ? 'ya' : 'tidak'),
          year: (val as any).year ? String((val as any).year) : undefined
        };
      } else if (typeof val === 'boolean') {
        diseaseHistory[key] = { status: val ? 'ya' : 'tidak' };
      }
    }
  }

  // Obstetri rows mapping
  const obstetriRows: (string | undefined)[][] = [];
  if (Array.isArray(m?.previousPregnancies) && m.previousPregnancies.length > 0) {
    m.previousPregnancies.forEach((row, idx) => {
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
  const kbRows: (string | undefined)[][] = [];
  if (Array.isArray(m?.contraceptiveHistories) && m.contraceptiveHistories.length > 0) {
    m.contraceptiveHistories.forEach((row, idx) => {
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
        [partnerName, partnerAge, motherEducation],
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
      G: m?.gravidaCount !== undefined ? String(m.gravidaCount) : '1',
      P: m?.parityCount !== undefined ? String(m.parityCount) : '0',
      Ab: m?.abortionCount !== undefined ? String(m.abortionCount) : '0',
      Ah: m?.livingChildrenCount !== undefined ? String(m.livingChildrenCount) : '0'
    },
    obstetriRows,
    kbRows
  };
}

/**
 * Adapter from upstream UnifiedInspectorData to 1:1 ImunisasiFormData
 */
export function adaptToImunisasiFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment
): ImunisasiFormData {
  const c = data.child;
  const p = data.patient;
  const answers = data.answers || {};

  const mrn = p?.medicalRecordNumber || '0000000000';
  // Strip non-digits and take last 10 digits
  const cleanDigits = mrn.replace(/\D/g, '').padStart(10, '0').slice(-10);
  const recordDigits = cleanDigits.split('');

  const childName = c?.childName || '-';
  const childNik = c?.childNik || '-';
  const childBirthDate = c?.childBirthDate
    ? formatClinicDate(c.childBirthDate, { style: 'human_full' })
    : '-';
  const phone = c?.parentPhone || '-';

  const fatherName = c?.fatherName || '-';
  const motherName = c?.motherName || '-';
  const address = c?.childAddress || '-';

  const vaccineRows: VaccineRowData[] = [];
  if (Array.isArray(c?.entries) && c.entries.length > 0) {
    c.entries.forEach((entry) => {
      vaccineRows.push({
        injectionDate: entry.givenDate
          ? formatClinicDate(entry.givenDate, { style: 'human_short' })
          : '-',
        age: entry.ageEstimateMonths !== undefined ? `${entry.ageEstimateMonths} bln` : '-',
        subjective: ['-', '-', '-'],
        objective: ['-', '-'],
        planning: entry.notes || '-'
      });
    });
  }

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
 * Adapter from upstream UnifiedInspectorData to 1:1 RegulerFormData (Poli Umum)
 */
export function adaptToRegulerFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment
): RegulerFormData {
  const p = data.patient;
  const answers = data.answers || {};

  const bDate = p?.birthDate;
  const age = bDate ? `${new Date().getFullYear() - new Date(bDate).getFullYear()} Tahun` : '-';

  return {
    medicalRecordNumber: p?.medicalRecordNumber || '-',
    registrationDate: data.scheduledDate
      ? formatClinicDate(data.scheduledDate, { style: 'human_full' })
      : formatClinicDate(new Date().toISOString(), { style: 'human_full' }),
    bookingCode: appointment?.booking_code || '-',
    queueNumber: appointment?.queue_number || '-',
    serviceName: appointment?.service || '-',
    doctorName: appointment?.doctor_name || '-',
    scheduledTime: `${appointment?.scheduled_start_time || '-'} WIB`,
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
      chiefComplaint: appointment?.complaint || '-',
      allergyHistory: answers.allergy || 'Tidak ada riwayat alergi obat maupun makanan.',
      vitalHeightCm: answers.height ? `${answers.height} cm` : '-',
      vitalWeightKg: answers.weight ? `${answers.weight} kg` : '-',
      vitalBloodPressure: answers.bloodPressure || '-',
      additionalNotes: answers.notes || '-'
    }
  };
}
