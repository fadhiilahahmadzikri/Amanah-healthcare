import type { UnifiedInspectorData } from '../../../inspector/types';
import type { Appointment } from '../../../../api/types';
import type { FormJsonSchema } from '../../../../constants/medical-appointment-types';
import type { PmbFormData, DiseaseRecord } from '../../types';
import { formatClinicDate } from '@/lib/date-format';
import { CANONICAL_MATERNAL_CONDITIONS } from '@/features/maternity/constants/maternity.constants';
import { getInactiveFieldIds, formatGender } from './clinical-adapter-helpers';

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
    Merokok: isSmokingActive || isSmokingPassive,
    'Pola Makan Beresiko': Boolean(m?.irregularDietBeforePregnancy),
    'Aktivitas fisik berkurang': Boolean(m?.reducedPhysicalActivityBeforePregnancy),
    Alkohol: Boolean(m?.alcoholBeforePregnancy),
    'Obat Teratogenik': Boolean(m?.unprescribedMedicationBeforePregnancy),
    'Kosmetik dengan zat berbahaya': Boolean(m?.concerningCosmeticUseBeforePregnancy)
  };

  // 1-to-1 mapping from canonical conditionResponses array
  const conditionsByCode = new Map<string, any>();
  if (Array.isArray(m?.conditionResponses)) {
    m.conditionResponses.forEach((c: any) => {
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
        row.birthYear ? String(row.birthYear) : '',
        row.birthWeightGrams && row.birthLengthCm
          ? `${row.birthWeightGrams}g / ${row.birthLengthCm}cm`
          : row.birthWeightGrams
            ? `${row.birthWeightGrams}g`
            : row.birthLengthCm
              ? `${row.birthLengthCm}cm`
              : '',
        row.childSex ? formatGender(row.childSex) : '',
        row.gestationalAgeAtBirth || '',
        row.birthAttendant || '',
        row.deliveryMethod || '',
        row.deliveryPlace || '',
        row.complications || ''
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
        row.startDate ? formatClinicDate(row.startDate, { style: 'human_short' }) : '',
        row.contraceptiveType || '',
        row.durationText || '',
        row.stopDate ? formatClinicDate(row.stopDate, { style: 'human_short' }) : '',
        row.problems || '',
        row.sideEffects || ''
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
