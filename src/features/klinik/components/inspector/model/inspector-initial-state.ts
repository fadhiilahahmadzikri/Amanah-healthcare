import type { Appointment } from '../../../api/types';
import type {
  UnifiedInspectorData,
  EditableMaternalData,
  EditableImmunizationData,
  EditableRegularData
} from '../types';
import { calculateChildAge } from '../../../utils/medical-appointment';

export function buildInitialMaternalData(parsedData: UnifiedInspectorData): EditableMaternalData {
  const m = parsedData.maternal;

  const conditions = Array.isArray(m?.conditionResponses) ? m.conditionResponses : [];
  const diseaseHistory: Record<string, any> = {};

  conditions.forEach((c: any) => {
    if (c.conditionCode) {
      diseaseHistory[c.conditionCode] = Boolean(c.hasCondition);
      if (c.diagnosisYear) {
        diseaseHistory[`${c.conditionCode}Notes`] = String(c.diagnosisYear);
      }
      if (c.notes) {
        diseaseHistory[`${c.conditionCode}Detail`] = c.notes;
      }
    }
  });

  const prevPregnancies: any[] = Array.isArray(m?.previousPregnancies) ? m.previousPregnancies : [];
  const kbList: any[] = Array.isArray(m?.contraceptiveHistories) ? m.contraceptiveHistories : [];

  return {
    medicalRecordNumber: parsedData.patient?.medicalRecordNumber || '',
    birthPlace: parsedData.patient?.birthPlace || '',
    motherName: m?.motherName || parsedData.patient?.fullName || '',
    motherNik: m?.motherNik || parsedData.patient?.nik || '',
    motherBirthDate: m?.motherBirthDate || parsedData.patient?.birthDate || '',
    motherAge: m?.motherAge || '',
    marriageOrder: m?.marriageOrder ?? '',
    marriageDate: m?.marriageDate || '',
    motherJob: m?.motherJob || '',
    motherEducation: m?.motherEducation || '',
    religion: m?.religion || '',
    phoneNumber: m?.phoneNumber || '',
    domicileAddress: m?.domicileAddress || '',
    identityCardAddress: m?.identityCardAddress || '',
    line1: m?.line1 || parsedData.patient?.line1 || '',
    provinceName: m?.provinceName || parsedData.patient?.provinceName || '',
    provinceCode: m?.provinceCode || parsedData.patient?.provinceCode || '',
    regencyName: m?.regencyName || parsedData.patient?.regencyName || '',
    regencyCode: m?.regencyCode || parsedData.patient?.regencyCode || '',
    districtName: m?.districtName || parsedData.patient?.districtName || '',
    districtCode: m?.districtCode || parsedData.patient?.districtCode || '',
    villageName: m?.villageName || parsedData.patient?.villageName || '',
    villageCode: m?.villageCode || parsedData.patient?.villageCode || '',
    dasawisma: m?.dasawisma || '',
    posyandu: m?.posyandu || '',
    puskesmas: m?.puskesmas || '',

    partnerName: m?.partnerName || '',
    partnerNik: m?.partnerNik || '',
    partnerBirthDate: m?.partnerBirthDate || '',
    partnerAge: m?.partnerAge || '',
    partnerJob: m?.partnerJob || '',
    partnerEducation: m?.partnerEducation || '',
    partnerBloodType: m?.partnerBloodType || '',
    partnerPhone: m?.husbandProfile?.phoneNumber || '',

    heightCm: m?.heightCm || '',
    prePregnancyWeightKg: m?.prePregnancyWeightKg || '',
    upperArmCircumferenceCm: m?.upperArmCircumferenceCm || '',
    initialBmi: m?.initialBmi || '',
    tetanusStatus: m?.tetanusStatus || '',
    motherBloodType: m?.motherBloodType || '',

    hpht: m?.hpht || '',
    estimatedDueDate: m?.estimatedDueDate || '',
    gestationalAgeWeeks: m?.gestationalAgeWeeks || '',
    gestationalAgeFormatted: m?.gestationalAgeFormatted || '',
    currentComplaints: m?.currentComplaints || '',

    gravidaCount: m?.gravidaCount ?? '',
    parityCount: m?.parityCount ?? '',
    abortionCount: m?.abortionCount ?? '',
    livingChildrenCount: m?.livingChildrenCount ?? '',
    hasPreviousPregnancyHistory: Boolean(m?.hasPreviousPregnancyHistory),
    hasContraceptionHistory: Boolean(m?.hasContraceptionHistory),

    smokedBeforePregnancy: m?.smokedBeforePregnancy || '',
    alcoholBeforePregnancy: Boolean(m?.alcoholBeforePregnancy),
    irregularDietBeforePregnancy: Boolean(m?.irregularDietBeforePregnancy),
    reducedPhysicalActivityBeforePregnancy: Boolean(m?.reducedPhysicalActivityBeforePregnancy),
    unprescribedMedicationBeforePregnancy: Boolean(m?.unprescribedMedicationBeforePregnancy),
    concerningCosmeticUseBeforePregnancy: Boolean(m?.concerningCosmeticUseBeforePregnancy),
    pesticideExposureBeforePregnancy: Boolean(m?.pesticideExposureBeforePregnancy),
    chemicalExposureBeforePregnancy: Boolean(m?.chemicalExposureBeforePregnancy),
    smokeExposureBeforePregnancy: Boolean(m?.smokeExposureBeforePregnancy),

    concerningEnvironmentNotes: m?.concerningEnvironmentNotes || '',
    allergyInfo: m?.allergyInfo || '',
    otherNotes: m?.otherNotes || '',

    diseaseHistory: diseaseHistory as any,
    previousPregnancies: prevPregnancies,
    contraceptiveHistories: kbList,
    conditionResponses: conditions as any
  };
}

export function buildInitialImmunizationData(
  parsedData: UnifiedInspectorData
): EditableImmunizationData {
  const c = parsedData.child;
  const a = parsedData.answers || {};
  const entries: any[] = c?.entries || [];

  const vaccineValues: Record<string, string> = {};
  if (entries.length > 0) {
    entries.forEach((e) => {
      const code = e.vaccineCode;
      if (code) {
        vaccineValues[`vaccine_${code}_status`] =
          e.status === 'GIVEN' ? 'Sudah' : e.status === 'NOT_GIVEN' ? 'Belum' : 'Tidak tahu';
        if (e.givenDate) {
          vaccineValues[`vaccine_${code}_date`] = e.givenDate;
        }
      }
    });
  } else {
    Object.keys(a).forEach((key) => {
      if (key.startsWith('vaccine_')) {
        vaccineValues[key] = String(a[key]);
      }
    });
  }

  const birthDate = c?.childBirthDate || a.childBirthDate || a.birthDate || '';
  let childAge = c?.childAgeFormatted || a.childAgeFormatted || '';
  if (!childAge && birthDate) {
    try {
      childAge = calculateChildAge(birthDate);
    } catch {
      childAge = '';
    }
  }

  const hasVaccineHistory =
    c?.previousVaccineHistory && c.previousVaccineHistory !== 'Belum pernah imunisasi sama sekali'
      ? 'Ya, pernah'
      : (a.hasVaccineHistory as string) ||
        (entries.length > 0 ? 'Ya, pernah' : 'Belum pernah sama sekali');

  const previousVaccineHistory =
    c?.previousVaccineHistory || (a.previousVaccineHistory as string) || '';

  const hasAllergyHistory =
    c?.childAllergyHistory && c.childAllergyHistory !== 'Tidak ada riwayat alergi.'
      ? 'Ada riwayat alergi'
      : (a.hasAllergyHistory as string) || 'Tidak ada alergi';

  const childAllergyHistory = c?.childAllergyHistory || (a.childAllergyHistory as string) || '';

  return {
    medicalRecordNumber: parsedData.patient?.medicalRecordNumber || '',
    birthPlace: parsedData.patient?.birthPlace || '',
    childName: c?.childName || parsedData.patient?.fullName || '',
    childNik: c?.childNik || parsedData.patient?.nik || '',
    childBirthDate: c?.childBirthDate || '',
    childSex: c?.childSex || '',
    childAgeFormatted: c?.childAgeFormatted || '',
    parentPhone: c?.parentPhone || parsedData.patient?.phone || '',
    fatherName: c?.fatherName || '',
    motherName: c?.motherName || parsedData.patient?.motherName || '',
    childAddress: c?.childAddress || parsedData.patient?.address || '',
    line1: c?.line1 || parsedData.patient?.line1 || '',
    provinceName: c?.provinceName || parsedData.patient?.provinceName || '',
    provinceCode: c?.provinceCode || parsedData.patient?.provinceCode || '',
    regencyName: c?.regencyName || parsedData.patient?.regencyName || '',
    regencyCode: c?.regencyCode || parsedData.patient?.regencyCode || '',
    districtName: c?.districtName || parsedData.patient?.districtName || '',
    districtCode: c?.districtCode || parsedData.patient?.districtCode || '',
    villageName: c?.villageName || parsedData.patient?.villageName || '',
    villageCode: c?.villageCode || parsedData.patient?.villageCode || '',
    hasVaccineHistory,
    previousVaccineHistory,
    hasAllergyHistory,
    childAllergyHistory,
    vaccineValues,
    entries: entries || []
  };
}

export function buildInitialRegularData(
  parsedData: UnifiedInspectorData,
  appointment: Appointment
): EditableRegularData {
  const a = parsedData.answers || {};
  const p = parsedData.patient;
  return {
    complaint: a.complaint || a.keluhanUtama || appointment.complaint || parsedData.complaint || '',
    answers: { ...a },
    medicalRecordNumber: p?.medicalRecordNumber || '',
    nik: p?.nik || '',
    fullName: p?.fullName || appointment.patient_name || '',
    motherName: p?.motherName || '',
    birthPlace: p?.birthPlace || '',
    birthDate: p?.birthDate || '',
    gender: p?.gender || '',
    bloodType: p?.bloodType || '',
    occupation: p?.occupation || '',
    phone: p?.phone || appointment.patient_phone || '',
    email: p?.email || '',
    address: p?.address || '',
    line1: p?.line1 || '',
    provinceName: p?.provinceName || '',
    provinceCode: p?.provinceCode || '',
    regencyName: p?.regencyName || '',
    regencyCode: p?.regencyCode || '',
    districtName: p?.districtName || '',
    districtCode: p?.districtCode || '',
    villageName: p?.villageName || '',
    villageCode: p?.villageCode || '',
    emergencyContactName: p?.emergencyContactName || '',
    emergencyContactPhone: p?.emergencyContactPhone || '',
    emergencyContactRelationship: p?.emergencyContactRelationship || ''
  };
}
