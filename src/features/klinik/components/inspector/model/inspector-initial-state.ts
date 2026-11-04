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
  const a = parsedData.answers || {};

  const diseaseHistory: Record<string, any> = {};
  if (m?.diseaseHistory && typeof m.diseaseHistory === 'object') {
    Object.assign(diseaseHistory, m.diseaseHistory);
  } else {
    Object.assign(diseaseHistory, a);
  }

  if (m?.healthConditions && Array.isArray(m.healthConditions)) {
    m.healthConditions.forEach((c) => {
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
  }

  let prevPregnancies: any[] = m?.previousPregnancies || [];
  if (prevPregnancies.length === 0) {
    const list: any[] = [];
    for (let i = 1; i <= 4; i += 1) {
      const year = a[`previousPregnancy${i}BirthYear`];
      if (year) {
        list.push({
          orderNumber: i,
          birthYear: year,
          gestationalAgeAtBirth: a[`previousPregnancy${i}GestationalAgeAtBirth`] || '',
          birthWeightGrams: a[`previousPregnancy${i}BirthWeight`]
            ? Number(a[`previousPregnancy${i}BirthWeight`])
            : '',
          birthLengthCm: a[`previousPregnancy${i}BirthLength`] || '',
          childSex: a[`previousPregnancy${i}ChildSex`] || '',
          deliveryMethod: a[`previousPregnancy${i}DeliveryMethod`] || 'Normal / Spontan',
          birthAttendant: a[`previousPregnancy${i}BirthAttendant`] || 'Bidan',
          deliveryPlace: a[`previousPregnancy${i}DeliveryPlace`] || 'Praktik Mandiri Bidan (PMB)',
          complications: a[`previousPregnancy${i}Complications`] || 'Tidak ada'
        });
      }
    }
    prevPregnancies = list;
  }

  let kbList: any[] = m?.contraceptiveHistories || [];
  if (kbList.length === 0) {
    const list: any[] = [];
    for (let i = 1; i <= 4; i += 1) {
      const type = a[`contraception${i}Type`] || a[`contraceptive${i}Type`];
      if (type) {
        list.push({
          orderNumber: i,
          contraceptiveType: type,
          startDate: a[`contraception${i}StartDate`] || a[`contraceptive${i}StartDate`] || '',
          stopDate: a[`contraception${i}StopDate`] || a[`contraceptive${i}StopDate`] || '',
          durationText: a[`contraception${i}Duration`] || a[`contraceptive${i}Duration`] || '',
          problems: a[`contraception${i}Problems`] || a[`contraceptive${i}Problems`] || 'Tidak ada',
          sideEffects:
            a[`contraception${i}SideEffects`] || a[`contraceptive${i}SideEffects`] || 'Tidak ada'
        });
      }
    }
    kbList = list;
  }

  return {
    medicalRecordNumber: parsedData.patient?.medicalRecordNumber || '',
    birthPlace: parsedData.patient?.birthPlace || '',
    motherName: m?.motherName ?? a.motherName ?? '',
    motherNik: m?.motherNik ?? a.motherNik ?? '',
    motherBirthDate: m?.motherBirthDate ?? a.motherBirthDate ?? '',
    motherAge: m?.motherAge ?? a.motherAge ?? '',
    marriageOrder: m?.marriageOrder ?? a.marriageOrder ?? 1,
    marriageDate: m?.marriageDate ?? a.marriageDate ?? '',
    motherJob: m?.motherJob ?? a.motherJob ?? '',
    motherEducation: m?.motherEducation ?? a.motherEducation ?? '',
    religion: m?.religion ?? a.religion ?? '',
    phoneNumber: m?.phoneNumber ?? a.phoneNumber ?? '',
    domicileAddress: m?.domicileAddress ?? a.domicileAddress ?? '',
    identityCardAddress: m?.identityCardAddress ?? a.identityCardAddress ?? '',
    dasawisma: m?.dasawisma ?? a.dasawisma ?? '',
    posyandu: m?.posyandu ?? a.posyandu ?? '',
    puskesmas: m?.puskesmas ?? a.puskesmas ?? '',

    partnerName: m?.partnerName ?? a.partnerName ?? '',
    partnerNik: m?.partnerNik ?? a.partnerNik ?? '',
    partnerBirthDate: m?.partnerBirthDate ?? a.partnerBirthDate ?? '',
    partnerAge: m?.partnerAge ?? a.partnerAge ?? '',
    partnerJob: m?.partnerJob ?? a.partnerJob ?? '',
    partnerEducation: m?.partnerEducation ?? a.partnerEducation ?? '',
    partnerBloodType: m?.partnerBloodType ?? a.partnerBloodType ?? '',
    partnerPhone: m?.husband?.phoneNumber ?? a.partnerPhone ?? '',

    heightCm: m?.heightCm ?? a.heightCm ?? '',
    prePregnancyWeightKg: m?.prePregnancyWeightKg ?? a.prePregnancyWeightKg ?? '',
    upperArmCircumferenceCm: m?.upperArmCircumferenceCm ?? a.upperArmCircumferenceCm ?? '',
    initialBmi: m?.initialBmi ?? a.initialBmi ?? '',
    tetanusStatus: m?.tetanusStatus ?? a.tetanusStatus ?? '',
    motherBloodType: m?.motherBloodType ?? a.motherBloodType ?? '',

    hpht: m?.hpht ?? a.hpht ?? '',
    estimatedDueDate: m?.estimatedDueDate ?? a.estimatedDueDate ?? '',
    gestationalAgeWeeks: m?.gestationalAgeWeeks ?? a.gestationalAgeWeeks ?? '',
    gestationalAgeFormatted: m?.gestationalAgeFormatted ?? a.gestationalAgeFormatted ?? '',
    currentComplaints: m?.currentComplaints ?? a.currentComplaints ?? '',

    gravidaCount: m?.gravidaCount ?? (a.gravidaCount ? Number(a.gravidaCount) : 1),
    parityCount:
      m?.parityCount ??
      (a.parityCount || a.partusCount ? Number(a.parityCount || a.partusCount) : 0),
    abortionCount:
      m?.abortionCount ??
      (a.abortionCount || a.abortusCount ? Number(a.abortionCount || a.abortusCount) : 0),
    livingChildrenCount:
      m?.livingChildrenCount ?? (a.livingChildrenCount ? Number(a.livingChildrenCount) : 0),
    hasPreviousPregnancyHistory: Boolean(
      m?.hasPreviousPregnancyHistory ?? a.hasPreviousPregnancyHistory === 'Ya, ada'
    ),
    hasContraceptionHistory: Boolean(
      m?.hasContraceptionHistory ?? a.hasContraceptionHistory === 'Ya, pernah'
    ),

    smokedBeforePregnancy: m?.smokedBeforePregnancy ?? a.smokedBeforePregnancy ?? 'Tidak',
    alcoholBeforePregnancy: Boolean(
      m?.alcoholBeforePregnancy ??
      (a.alcoholBeforePregnancy === true || a.alcoholBeforePregnancy === 'Ya')
    ),
    irregularDietBeforePregnancy: Boolean(
      m?.irregularDietBeforePregnancy ??
      (a.irregularDietBeforePregnancy === true || a.irregularDietBeforePregnancy === 'Ya')
    ),
    reducedPhysicalActivityBeforePregnancy: Boolean(
      m?.reducedPhysicalActivityBeforePregnancy ??
      (a.reducedPhysicalActivityBeforePregnancy === true ||
        a.reducedPhysicalActivityBeforePregnancy === 'Ya')
    ),
    unprescribedMedicationBeforePregnancy: Boolean(
      m?.unprescribedMedicationBeforePregnancy ??
      (a.unprescribedMedicationBeforePregnancy === true ||
        a.unprescribedMedicationBeforePregnancy === 'Ya')
    ),
    concerningCosmeticUseBeforePregnancy: Boolean(
      m?.concerningCosmeticUseBeforePregnancy ??
      (a.concerningCosmeticUseBeforePregnancy === true ||
        a.concerningCosmeticUseBeforePregnancy === 'Ya')
    ),
    pesticideExposureBeforePregnancy: Boolean(
      m?.pesticideExposureBeforePregnancy ??
      (a.pesticideExposureBeforePregnancy === true || a.pesticideExposureBeforePregnancy === 'Ya')
    ),
    chemicalExposureBeforePregnancy: Boolean(
      m?.chemicalExposureBeforePregnancy ??
      (a.chemicalExposureBeforePregnancy === true || a.chemicalExposureBeforePregnancy === 'Ya')
    ),
    smokeExposureBeforePregnancy: Boolean(
      m?.smokeExposureBeforePregnancy ??
      (a.smokeExposureBeforePregnancy === true || a.smokeExposureBeforePregnancy === 'Ya')
    ),

    concerningEnvironmentNotes: m?.concerningEnvironmentNotes ?? a.concerningEnvironmentNotes ?? '',
    allergyInfo: m?.allergyInfo ?? a.allergyInfo ?? '',
    otherNotes: m?.otherNotes ?? a.otherNotes ?? '',

    diseaseHistory: diseaseHistory as any,
    previousPregnancies: prevPregnancies,
    contraceptiveHistories: kbList
  };
}

export function buildInitialImmunizationData(parsedData: UnifiedInspectorData): EditableImmunizationData {
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
    c?.hasVaccineHistory ||
    a.hasVaccineHistory ||
    (entries.length > 0
      ? 'Ya, pernah'
      : c?.previousVaccineHistory &&
          c.previousVaccineHistory !== 'Belum pernah imunisasi sama sekali'
        ? 'Ya, pernah'
        : 'Belum pernah sama sekali');

  const previousVaccineHistory = c?.previousVaccineHistory || a.previousVaccineHistory || '';

  const hasAllergyHistory =
    c?.hasAllergyHistory ||
    a.hasAllergyHistory ||
    (c?.childAllergyHistory && c.childAllergyHistory !== 'Tidak ada riwayat alergi.'
      ? 'Ada riwayat alergi'
      : 'Tidak ada alergi');

  const childAllergyHistory =
    c?.childAllergyHistory ||
    a.childAllergyHistory ||
    (hasAllergyHistory === 'Ada riwayat alergi' ? 'Riwayat alergi tercatat.' : '');

  return {
    medicalRecordNumber: parsedData.patient?.medicalRecordNumber || '',
    birthPlace: parsedData.patient?.birthPlace || '',
    childName: c?.childName || a.childName || parsedData.patient?.fullName || '',
    childNik: c?.childNik || a.childNik || parsedData.patient?.nik || '',
    childBirthDate: birthDate,
    childSex: c?.childSex || a.childSex || parsedData.patient?.gender || '',
    childAgeFormatted: childAge,
    parentPhone: c?.parentPhone || a.parentPhone || parsedData.patient?.phone || '',
    fatherName: c?.fatherName || a.fatherName || '',
    motherName: c?.motherName || a.motherName || parsedData.patient?.motherName || '',
    childAddress: c?.childAddress || a.childAddress || parsedData.patient?.address || '',
    hasVaccineHistory,
    previousVaccineHistory,
    hasAllergyHistory,
    childAllergyHistory,
    vaccineValues
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
