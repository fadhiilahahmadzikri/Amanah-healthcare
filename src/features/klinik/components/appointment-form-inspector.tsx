'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { klinikKeys } from '../api/query-keys';
import { FLOW_NAMES } from '../constants/kia-constants';
import {
  kiaIntakeService,
  type MaternalIntakeResponse,
  type ChildImmunizationResponse
} from '../api/kia-intake-service';
import { updatePatient } from '@/features/data-pasien/api/service';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import { calculateChildAge } from '../utils/medical-appointment';
import type { Appointment } from '../api/types';
import type {
  UnifiedInspectorData,
  UnifiedInspectorPatient,
  EditableMaternalData,
  EditableImmunizationData,
  EditableRegularData
} from './inspector/types';
import { InspectorIdentityTab } from './inspector/inspector-identity-tab';
import { InspectorPartnerTab } from './inspector/inspector-partner-tab';
import { InspectorClinicalTab } from './inspector/inspector-clinical-tab';
import { InspectorObstetricTab } from './inspector/inspector-obstetric-tab';
import { InspectorImmunizationTab } from './inspector/inspector-immunization-tab';
import { InspectorGenericView } from './inspector/inspector-generic-view';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  ClinicalDocumentFullscreenReader,
  adaptToPmbFormData,
  adaptToImunisasiFormData,
  adaptToRegulerFormData,
  exportPmbDocx,
  exportImunisasiDocx,
  exportRegulerDocx,
  exportPmbExcel,
  exportImunisasiExcel,
  exportRegulerExcel,
  downloadPdfFromElement,
  PmbFormTemplate,
  ImunisasiFormTemplate,
  RegulerFormTemplate,
  type ClinicalFormFlow
} from './clinical-document';

export interface AppointmentFormInspectorProps {
  appointment: Appointment;
  onClose?: () => void;
  hideHeader?: boolean;
  readOnly?: boolean;
}

function buildInitialFormData(parsedData: UnifiedInspectorData): EditableMaternalData {
  const m = parsedData.maternal;
  const a = parsedData.answers || {};

  // Construct diseaseHistory map
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

  // Previous pregnancies
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
          childSex: a[`previousPregnancy${i}ChildSex`] || 'Laki-laki',
          deliveryMethod: a[`previousPregnancy${i}DeliveryMethod`] || 'Normal / Spontan',
          birthAttendant: a[`previousPregnancy${i}BirthAttendant`] || 'Bidan',
          deliveryPlace: a[`previousPregnancy${i}DeliveryPlace`] || 'Praktik Mandiri Bidan (PMB)',
          complications: a[`previousPregnancy${i}Complications`] || 'Tidak ada'
        });
      }
    }
    prevPregnancies = list;
  }

  // Contraceptive histories
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

function buildInitialImmunizationData(parsedData: UnifiedInspectorData): EditableImmunizationData {
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
    childSex: c?.childSex || a.childSex || parsedData.patient?.gender || 'Laki-laki',
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

function buildInitialRegularData(
  parsedData: UnifiedInspectorData,
  appointment: Appointment
): EditableRegularData {
  const a = parsedData.answers || {};
  const p = parsedData.patient;
  return {
    complaint: a.complaint || a.keluhanUtama || appointment.complaint || parsedData.complaint || '',
    allergyHistory: a.allergy || a.allergyHistory || a.riwayatAlergi || '',
    heightCm: a.height || a.heightCm || a.vitalHeightCm || '',
    weightKg: a.weight || a.weightKg || a.vitalWeightKg || '',
    bloodPressure: a.bloodPressure || a.vitalBloodPressure || '',
    notes: a.notes || a.additionalNotes || '',
    answers: { ...a },

    // Demographic fields
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
    address: p?.address || '',
    emergencyContactName: p?.emergencyContactName || '',
    emergencyContactPhone: p?.emergencyContactPhone || '',
    emergencyContactRelationship: p?.emergencyContactRelationship || ''
  };
}

export function AppointmentFormInspector({
  appointment,
  onClose,
  hideHeader = false,
  readOnly
}: AppointmentFormInspectorProps) {
  const isReadOnly =
    readOnly ??
    ((appointment.status as string) === 'COMPLETED' ||
      (appointment.status as string) === 'completed' ||
      (appointment.status as string) === 'SELESAI');

  const queryClient = useQueryClient();

  const { data: serverIntake, isLoading } = useQuery({
    queryKey: klinikKeys.appointmentIntake(appointment.id),
    queryFn: () => kiaIntakeService.getIntakeByAppointmentId(appointment.id),
    enabled: Boolean(appointment.id),
    staleTime: 60_000,
    retry: false
  });

  const { data: affiliations } = useQuery({
    queryKey: ['patient-affiliations', 'me'],
    queryFn: () => patientAffiliationService.getMyAffiliations(),
    staleTime: 60_000
  });

  const matchingAffiliation = React.useMemo(() => {
    if (!affiliations?.length) return null;
    return affiliations.find((a) => a.id === appointment.patient_id) || null;
  }, [affiliations, appointment.patient_id]);

  const parsedData = React.useMemo<UnifiedInspectorData>(() => {
    const rawData =
      serverIntake &&
      typeof serverIntake === 'object' &&
      'data' in serverIntake &&
      serverIntake.data
        ? typeof serverIntake.data === 'object' && 'data' in serverIntake.data
          ? (serverIntake.data as any).data
          : serverIntake.data
        : serverIntake;

    const flow = serverIntake?.flow ?? appointment.medical_flow;

    let answers: Record<string, any> = {};
    let automatic: Record<string, any> = {};
    let maternal: MaternalIntakeResponse | undefined = undefined;
    let child: ChildImmunizationResponse | undefined = undefined;

    if (rawData) {
      if (flow === FLOW_NAMES.PREGNANCY) {
        maternal = rawData as MaternalIntakeResponse;
        answers = (maternal.answers as Record<string, any>) || {};
        automatic = (maternal.automatic as Record<string, any>) || {};
      } else if (flow === FLOW_NAMES.IMMUNIZATION) {
        child = rawData as ChildImmunizationResponse;
        answers = (child.answers as Record<string, any>) || {};
        automatic = (child.automatic as Record<string, any>) || {};
      } else {
        answers = (rawData.answers as Record<string, any>) || {};
        automatic = (rawData.automatic as Record<string, any>) || {};
      }
    }

    if (appointment.medical_intake) {
      if (Object.keys(answers).length === 0 && appointment.medical_intake.answersByFieldId) {
        answers = { ...appointment.medical_intake.answersByFieldId };
      }
      if (Object.keys(automatic).length === 0 && appointment.medical_intake.automatic) {
        automatic = { ...appointment.medical_intake.automatic };
      }
    }

    const patient: UnifiedInspectorPatient | undefined =
      rawData?.patient ||
      (matchingAffiliation
        ? {
            id: matchingAffiliation.id,
            nik: matchingAffiliation.nik || undefined,
            fullName: matchingAffiliation.fullName,
            motherName: matchingAffiliation.motherName || undefined,
            birthPlace: matchingAffiliation.birthPlace || undefined,
            birthDate: matchingAffiliation.birthDate || undefined,
            gender: matchingAffiliation.gender,
            bloodType: matchingAffiliation.bloodType || undefined,
            occupation: matchingAffiliation.occupationName || undefined,
            phone: matchingAffiliation.phoneNumber || undefined,
            address: matchingAffiliation.address || undefined,
            relationshipType: matchingAffiliation.relationship,
            relationLabel: matchingAffiliation.relationshipLabel
          }
        : appointment.patient_name
          ? {
              fullName: appointment.patient_name,
              phone: appointment.patient_phone
            }
          : undefined);

    return {
      flow,
      answers,
      automatic,
      maternal,
      child,
      patient,
      appointmentId: appointment.id,
      bookingCode: appointment.booking_code,
      scheduledDate: appointment.date,
      scheduledStartTime: appointment.scheduled_start_time || '-',
      complaint: appointment.complaint || '-',
      serviceName: appointment.service || '-'
    };
  }, [serverIntake, appointment, matchingAffiliation]);

  const isPregnancy = parsedData.flow === FLOW_NAMES.PREGNANCY;
  const isImmunization = parsedData.flow === FLOW_NAMES.IMMUNIZATION || Boolean(parsedData.child);

  // Edit Mode States for all flows
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [formData, setFormData] = React.useState<EditableMaternalData>(() =>
    buildInitialFormData(parsedData)
  );
  const [immunizationFormData, setImmunizationFormData] = React.useState<EditableImmunizationData>(
    () => buildInitialImmunizationData(parsedData)
  );
  const [regularFormData, setRegularFormData] = React.useState<EditableRegularData>(() =>
    buildInitialRegularData(parsedData, appointment)
  );

  // Re-sync initial form data when server intake is updated and not in editing mode
  React.useEffect(() => {
    if (!isEditing) {
      setFormData(buildInitialFormData(parsedData));
      setImmunizationFormData(buildInitialImmunizationData(parsedData));
      setRegularFormData(buildInitialRegularData(parsedData, appointment));
    }
  }, [parsedData, appointment, isEditing]);

  // Maternal Form Handlers
  const handleFieldChange = (field: keyof EditableMaternalData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiseaseChange = (key: string, value: any, yearOrNotes?: string) => {
    setFormData((prev) => {
      const updatedDiseaseHistory = { ...prev.diseaseHistory, [key]: value };
      if (yearOrNotes !== undefined) {
        updatedDiseaseHistory[`${key}Notes`] = yearOrNotes;
      }
      return {
        ...prev,
        diseaseHistory: updatedDiseaseHistory
      };
    });
  };

  const handleNestedArrayChange = (
    key: 'previousPregnancies' | 'contraceptiveHistories',
    index: number,
    field: string,
    value: any
  ) => {
    setFormData((prev) => {
      const currentList = [...(prev[key] as any[])];
      if (currentList[index]) {
        currentList[index] = {
          ...currentList[index],
          [field]: value
        };
      }
      return {
        ...prev,
        [key]: currentList
      };
    });
  };

  const handleAddNestedItem = (
    key: 'previousPregnancies' | 'contraceptiveHistories',
    defaultItem: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] as any[]), defaultItem]
    }));
  };

  const handleRemoveNestedItem = (
    key: 'previousPregnancies' | 'contraceptiveHistories',
    index: number
  ) => {
    setFormData((prev) => {
      const currentList = [...(prev[key] as any[])];
      currentList.splice(index, 1);
      return {
        ...prev,
        [key]: currentList
      };
    });
  };

  // Immunization Form Handlers
  const handleImmunizationFieldChange = (field: keyof EditableImmunizationData, value: any) => {
    setImmunizationFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVaccineValueChange = (fieldId: string, value: string) => {
    setImmunizationFormData((prev) => ({
      ...prev,
      vaccineValues: {
        ...prev.vaccineValues,
        [fieldId]: value
      }
    }));
  };

  // Regular Form Handlers
  const handleRegularFieldChange = (field: keyof EditableRegularData, value: any) => {
    setRegularFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancelEdit = () => {
    setFormData(buildInitialFormData(parsedData));
    setImmunizationFormData(buildInitialImmunizationData(parsedData));
    setRegularFormData(buildInitialRegularData(parsedData, appointment));
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);

      if (isPregnancy) {
        if (!formData) return;
        const targetId = parsedData.maternal?.id || appointment.id;

        // Map healthConditions array for relational backend
        const conditionCodesMap: Record<string, string> = {
          hasHypertensionHistory: 'hypertension',
          hasHeartDiseaseHistory: 'heart_disease',
          hasThyroidDiseaseHistory: 'thyroid_disease',
          hasAutoimmuneHistory: 'autoimmune',
          hasDiabetesHistory: 'diabetes',
          hasAsthmaHistory: 'asthma',
          hasTuberculosisHistory: 'tuberculosis',
          hasHepatitisBHistory: 'hepatitis_b',
          hasHivOrSyphilisHistory: 'hiv_syphilis',
          hasMentalHealthHistory: 'mental_health',
          hasTwinPregnancyHistory: 'twin_pregnancy',
          hasCystMyomaTumorHistory: 'cyst_myoma_tumor',
          hasSurgeryHistory: 'surgery',
          hasOtherDiseaseHistory: 'other'
        };

        const healthConditionsPayload = Object.entries(conditionCodesMap).map(
          ([fieldKey, code]) => {
            const has = Boolean(formData.diseaseHistory[fieldKey]);
            const rawYearStr =
              fieldKey === 'hasOtherDiseaseHistory'
                ? formData.diseaseHistory.otherDiseaseHistoryYear
                : formData.diseaseHistory[`${fieldKey}Notes`] || formData.diseaseHistory[fieldKey];
            const year = rawYearStr ? parseInt(String(rawYearStr), 10) : NaN;
            const notes =
              fieldKey === 'hasOtherDiseaseHistory'
                ? formData.diseaseHistory.otherDiseaseHistoryNotes || null
                : null;
            return {
              conditionCode: code,
              hasCondition: has,
              diagnosisYear: !isNaN(year) ? year : null,
              notes
            };
          }
        );

        const payload = {
          motherName: formData.motherName || undefined,
          motherNik: formData.motherNik || undefined,
          motherBirthDate: formData.motherBirthDate || undefined,
          motherAge: formData.motherAge ? Number(formData.motherAge) : undefined,
          marriageOrder: formData.marriageOrder ? Number(formData.marriageOrder) : 1,
          marriageDate: formData.marriageDate || undefined,
          motherJob: formData.motherJob || undefined,
          motherEducation: formData.motherEducation || undefined,
          religion: formData.religion || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          domicileAddress: formData.domicileAddress || undefined,
          identityCardAddress: formData.identityCardAddress || undefined,
          dasawisma: formData.dasawisma || undefined,
          posyandu: formData.posyandu || undefined,
          puskesmas: formData.puskesmas || undefined,

          partnerName: formData.partnerName || undefined,
          partnerNik: formData.partnerNik || undefined,
          partnerBirthDate: formData.partnerBirthDate || undefined,
          partnerAge: formData.partnerAge ? Number(formData.partnerAge) : undefined,
          partnerJob: formData.partnerJob || undefined,
          partnerEducation: formData.partnerEducation || undefined,
          partnerBloodType: formData.partnerBloodType || undefined,
          husband: {
            fullName: formData.partnerName || undefined,
            nik: formData.partnerNik || undefined,
            birthDate: formData.partnerBirthDate || undefined,
            age: formData.partnerAge ? Number(formData.partnerAge) : undefined,
            job: formData.partnerJob || undefined,
            education: formData.partnerEducation || undefined,
            bloodType: formData.partnerBloodType || undefined,
            phoneNumber: formData.partnerPhone || undefined
          },

          heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
          prePregnancyWeightKg: formData.prePregnancyWeightKg
            ? Number(formData.prePregnancyWeightKg)
            : undefined,
          upperArmCircumferenceCm: formData.upperArmCircumferenceCm
            ? Number(formData.upperArmCircumferenceCm)
            : undefined,
          initialBmi: formData.initialBmi ? Number(formData.initialBmi) : undefined,
          tetanusStatus: formData.tetanusStatus || undefined,
          motherBloodType: formData.motherBloodType || undefined,

          hpht: formData.hpht || undefined,
          estimatedDueDate: formData.estimatedDueDate || undefined,
          gestationalAgeWeeks: formData.gestationalAgeWeeks
            ? Number(formData.gestationalAgeWeeks)
            : undefined,
          gestationalAgeFormatted: formData.gestationalAgeFormatted || undefined,
          currentComplaints: formData.currentComplaints || undefined,

          gravidaCount: Number(formData.gravidaCount) || 1,
          parityCount: Number(formData.parityCount) || 0,
          abortionCount: Number(formData.abortionCount) || 0,
          livingChildrenCount: Number(formData.livingChildrenCount) || 0,
          hasPreviousPregnancyHistory: Boolean(formData.hasPreviousPregnancyHistory),
          hasContraceptionHistory: Boolean(formData.hasContraceptionHistory),

          smokedBeforePregnancy: formData.smokedBeforePregnancy,
          alcoholBeforePregnancy: formData.alcoholBeforePregnancy,
          irregularDietBeforePregnancy: formData.irregularDietBeforePregnancy,
          reducedPhysicalActivityBeforePregnancy: formData.reducedPhysicalActivityBeforePregnancy,
          unprescribedMedicationBeforePregnancy: formData.unprescribedMedicationBeforePregnancy,
          concerningCosmeticUseBeforePregnancy: formData.concerningCosmeticUseBeforePregnancy,
          pesticideExposureBeforePregnancy: formData.pesticideExposureBeforePregnancy,
          chemicalExposureBeforePregnancy: formData.chemicalExposureBeforePregnancy,
          smokeExposureBeforePregnancy: formData.smokeExposureBeforePregnancy,

          concerningEnvironmentNotes: formData.concerningEnvironmentNotes,
          allergyInfo: formData.allergyInfo,
          otherNotes: formData.otherNotes,

          previousPregnancies: formData.previousPregnancies.map((p, idx) => ({
            orderNumber: p.orderNumber || idx + 1,
            birthYear: p.birthYear || undefined,
            birthWeightGrams: p.birthWeightGrams ? Number(p.birthWeightGrams) : undefined,
            birthLengthCm: p.birthLengthCm ? Number(p.birthLengthCm) : undefined,
            childSex: p.childSex || undefined,
            gestationalAgeAtBirth: p.gestationalAgeAtBirth || undefined,
            birthAttendant: p.birthAttendant || undefined,
            deliveryMethod: p.deliveryMethod || undefined,
            deliveryPlace: p.deliveryPlace || undefined,
            complications: p.complications || undefined
          })),

          contraceptiveHistories: formData.contraceptiveHistories.map((c, idx) => ({
            orderNumber: c.orderNumber || idx + 1,
            contraceptiveType: c.contraceptiveType || undefined,
            startDate: c.startDate || undefined,
            stopDate: c.stopDate || undefined,
            durationText: c.durationText || undefined,
            problems: c.problems || undefined,
            sideEffects: c.sideEffects || undefined
          })),

          healthConditions: healthConditionsPayload,
          answers: {
            ...formData,
            ...formData.diseaseHistory
          }
        };

        const patientId = parsedData.patient?.id || appointment.patient_id;
        if (patientId) {
          try {
            await updatePatient(patientId, {
              name: formData.motherName || undefined,
              nik: formData.motherNik || undefined,
              medical_record_number: formData.medicalRecordNumber || undefined,
              birth_place: formData.birthPlace || undefined,
              birth_date: formData.motherBirthDate || undefined,
              blood_type: (formData.motherBloodType as any) || undefined,
              occupation: formData.motherJob || undefined,
              phone: formData.phoneNumber || undefined,
              line1: formData.domicileAddress || undefined
            });
          } catch (patErr) {
            console.error('Failed to update patient demographic:', patErr);
          }
        }

        await kiaIntakeService.updateMaternityIntake(targetId, payload);
        await queryClient.invalidateQueries({
          queryKey: klinikKeys.appointmentIntake(appointment.id)
        });
        await queryClient.invalidateQueries({ queryKey: ['patients'] });
        await queryClient.invalidateQueries({ queryKey: ['patient-affiliations'] });
        if (patientId) {
          await queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
        }
        toast.success('Perubahan formulir KIA & Kehamilan berhasil disimpan!');
        setIsEditing(false);
        return;
      }

      if (isImmunization) {
        if (!immunizationFormData) return;
        const targetId = parsedData.child?.id || appointment.id;

        // Parse entries from vaccineValues
        const entries: any[] = [];
        const processedCodes = new Set<string>();

        Object.keys(immunizationFormData.vaccineValues).forEach((key) => {
          if (key.startsWith('vaccine_') && key.endsWith('_status')) {
            const code = key.replace('vaccine_', '').replace('_status', '');
            if (!processedCodes.has(code)) {
              processedCodes.add(code);
              const statusVal = immunizationFormData.vaccineValues[key];
              const dateVal = immunizationFormData.vaccineValues[`vaccine_${code}_date`];

              let status: 'GIVEN' | 'NOT_GIVEN' | 'UNKNOWN' = 'UNKNOWN';
              if (statusVal === 'Sudah') status = 'GIVEN';
              else if (statusVal === 'Belum') status = 'NOT_GIVEN';

              entries.push({
                vaccineCode: code,
                status,
                givenDate: status === 'GIVEN' && dateVal ? dateVal : null
              });
            }
          }
        });

        const payload = {
          childName: immunizationFormData.childName,
          childNik: immunizationFormData.childNik || undefined,
          childBirthDate: immunizationFormData.childBirthDate || undefined,
          childSex: immunizationFormData.childSex || undefined,
          childAgeFormatted: immunizationFormData.childAgeFormatted || undefined,
          parentPhone: immunizationFormData.parentPhone,
          fatherName: immunizationFormData.fatherName || undefined,
          motherName: immunizationFormData.motherName || undefined,
          childAddress: immunizationFormData.childAddress || undefined,
          hasVaccineHistory: immunizationFormData.hasVaccineHistory,
          previousVaccineHistory: immunizationFormData.previousVaccineHistory,
          hasAllergyHistory: immunizationFormData.hasAllergyHistory,
          childAllergyHistory: immunizationFormData.childAllergyHistory,
          entries
        };

        const patientId = parsedData.patient?.id || appointment.patient_id;
        if (patientId) {
          try {
            await updatePatient(patientId, {
              name: immunizationFormData.childName || undefined,
              nik: immunizationFormData.childNik || undefined,
              medical_record_number: immunizationFormData.medicalRecordNumber || undefined,
              birth_place: immunizationFormData.birthPlace || undefined,
              birth_date: immunizationFormData.childBirthDate || undefined,
              gender: immunizationFormData.childSex === 'Perempuan' ? 'female' : 'male',
              mother_name: immunizationFormData.motherName || undefined,
              phone: immunizationFormData.parentPhone || undefined,
              line1: immunizationFormData.childAddress || undefined
            });
          } catch (patErr) {
            console.error('Failed to update child demographic:', patErr);
          }
        }

        await kiaIntakeService.updateImmunizationIntake(targetId, payload);
        await queryClient.invalidateQueries({
          queryKey: klinikKeys.appointmentIntake(appointment.id)
        });
        await queryClient.invalidateQueries({ queryKey: ['patients'] });
        await queryClient.invalidateQueries({ queryKey: ['patient-affiliations'] });
        if (patientId) {
          await queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
        }
        toast.success('Perubahan formulir imunisasi anak berhasil disimpan!');
        setIsEditing(false);
        return;
      }

      // Regular Flow
      const targetId =
        (serverIntake as any)?.data?.id || (serverIntake as any)?.id || appointment.id;

      const answersPayload = {
        ...regularFormData.answers,
        complaint: regularFormData.complaint,
        keluhanUtama: regularFormData.complaint,
        allergy: regularFormData.allergyHistory,
        allergyHistory: regularFormData.allergyHistory,
        riwayatAlergi: regularFormData.allergyHistory,
        height: regularFormData.heightCm,
        weight: regularFormData.weightKg,
        bloodPressure: regularFormData.bloodPressure,
        notes: regularFormData.notes
      };

      const patientId = parsedData.patient?.id || appointment.patient_id;
      if (patientId) {
        try {
          await updatePatient(patientId, {
            name: regularFormData.fullName || undefined,
            nik: regularFormData.nik || undefined,
            medical_record_number: regularFormData.medicalRecordNumber || undefined,
            birth_place: regularFormData.birthPlace || undefined,
            birth_date: regularFormData.birthDate || undefined,
            gender: (regularFormData.gender as any) || undefined,
            blood_type: (regularFormData.bloodType as any) || undefined,
            mother_name: regularFormData.motherName || undefined,
            occupation: regularFormData.occupation || undefined,
            phone: regularFormData.phone || undefined,
            line1: regularFormData.address || undefined,
            emergency_contact: regularFormData.emergencyContactPhone || undefined
          });
        } catch (patErr) {
          console.error('Failed to update regular patient demographic:', patErr);
        }
      }

      await kiaIntakeService.updateGenericIntake(targetId, answersPayload);
      await queryClient.invalidateQueries({
        queryKey: klinikKeys.appointmentIntake(appointment.id)
      });
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      await queryClient.invalidateQueries({ queryKey: ['patient-affiliations'] });
      if (patientId) {
        await queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      }
      toast.success('Perubahan formulir intake pasien berhasil disimpan!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update intake:', err);
      toast.error(err?.message || 'Gagal menyimpan perubahan formulir');
    } finally {
      setIsSaving(false);
    }
  };

  const [isReaderOpen, setIsReaderOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const pmbFormData = React.useMemo(() => {
    if (parsedData.flow === FLOW_NAMES.PREGNANCY) {
      return adaptToPmbFormData(parsedData, appointment, formData);
    }
    return null;
  }, [parsedData, appointment, formData]);

  const imunisasiFormData = React.useMemo(() => {
    if (parsedData.flow === FLOW_NAMES.IMMUNIZATION || Boolean(parsedData.child)) {
      return adaptToImunisasiFormData(parsedData, appointment, immunizationFormData);
    }
    return null;
  }, [parsedData, appointment, immunizationFormData]);

  const regulerFormData = React.useMemo(() => {
    if (!isPregnancy && !isImmunization) {
      return adaptToRegulerFormData(parsedData, appointment, regularFormData);
    }
    return null;
  }, [parsedData, appointment, isPregnancy, isImmunization, regularFormData]);

  const handleDownload = async (format: 'docx' | 'pdf' | 'xlsx') => {
    try {
      setIsExporting(true);
      const patientName = appointment.patient_name || 'Pasien';
      const safeName = patientName.replace(/\s+/g, '_');

      if (format === 'pdf') {
        const title = isPregnancy
          ? `Formulir_ANC_${safeName}`
          : isImmunization
            ? `Formulir_Imunisasi_${safeName}`
            : `Formulir_Rawat_Jalan_${safeName}`;
        const targetEl = document
          .getElementById('isolated-clinical-printable')
          ?.querySelector('.document-a4-page') as HTMLElement | null;
        await downloadPdfFromElement(targetEl, `${title}.pdf`);
        return;
      }

      if (format === 'docx') {
        if (isPregnancy) {
          await exportPmbDocx(pmbFormData, `Formulir_ANC_${safeName}.docx`);
        } else if (isImmunization) {
          await exportImunisasiDocx(imunisasiFormData, `Formulir_Imunisasi_${safeName}.docx`);
        } else {
          await exportRegulerDocx(regulerFormData, `Formulir_Rawat_Jalan_${safeName}.docx`);
        }
        return;
      }

      if (format === 'xlsx') {
        if (isPregnancy) {
          await exportPmbExcel(pmbFormData, `Formulir_ANC_${safeName}.xlsx`);
        } else if (isImmunization) {
          await exportImunisasiExcel(imunisasiFormData, `Formulir_Imunisasi_${safeName}.xlsx`);
        } else {
          await exportRegulerExcel(regulerFormData, `Formulir_Rawat_Jalan_${safeName}.xlsx`);
        }
        return;
      }
    } catch (err) {
      console.error('Failed to export:', err);
      toast.error('Gagal mengunduh formulir');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='w-full flex flex-col font-sans select-none justify-between h-full min-h-0'>
      {!hideHeader ? (
        <div className='flex items-center justify-between gap-4 pb-3 border-b border-border/40 shrink-0 min-h-[77px]'>
          <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5 justify-center'>
            <div className='flex items-center gap-2'>
              <h3 className='text-base sm:text-lg font-bold text-foreground truncate tracking-tight'>
                {isPregnancy
                  ? 'Formulir KIA & Kehamilan'
                  : isImmunization
                    ? 'Formulir Imunisasi Anak'
                    : 'Formulir Pendaftaran Pasien'}
              </h3>
            </div>
            <p className='text-sm font-medium text-muted-foreground truncate w-full'>
              {isPregnancy
                ? isEditing
                  ? 'Perbarui data skrining klinis, kebiasaan, obstetri & riwayat KB pasien'
                  : 'Data skrining klinis, kebiasaan, obstetri & riwayat KB'
                : isImmunization
                  ? isEditing
                    ? 'Perbarui identitas anak, orang tua, riwayat vaksin & catatan alergi'
                    : 'Data riwayat vaksinasi dan tumbuh kembang anak'
                  : isEditing
                    ? 'Perbarui data keluhan, riwayat alergi & tanda vital intake pasien'
                    : 'Data rekam medis & profil intake pasien'}
            </p>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            {!isEditing && !isReadOnly && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsEditing(true)}
                className='h-8 text-xs font-semibold gap-1.5 text-foreground hover:bg-muted'
                title='Edit Data Intake Medis'
              >
                <Icons.edit className='size-3.5 text-primary' />
                <span className='hidden sm:inline'>Edit Intake</span>
              </Button>
            )}

            <Button
              type='button'
              variant='secondary'
              size='icon-sm'
              shape='rounded'
              onClick={() => setIsReaderOpen(true)}
              className='size-8 text-foreground/80 hover:text-foreground'
              title='Buka Formulir Ukuran Penuh (Web Viewer)'
              aria-label='Buka Formulir Ukuran Penuh'
            >
              <Icons.maximize className='size-4' />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  variant='secondary'
                  size='icon-sm'
                  shape='rounded'
                  disabled={isExporting}
                  isLoading={isExporting}
                  className='size-8 text-foreground/80 hover:text-foreground'
                  title='Unduh Formulir (Multi-Format)'
                  aria-label='Unduh Formulir Multi-Format'
                >
                  <Icons.download className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48 text-xs font-medium'>
                <DropdownMenuItem
                  onClick={() => handleDownload('docx')}
                  className='gap-2 cursor-pointer'
                >
                  <Icons.fileTypeDoc className='size-3.5 text-blue-600 dark:text-blue-400' />
                  <span>Dokumen Word (.docx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload('pdf')}
                  className='gap-2 cursor-pointer'
                >
                  <Icons.fileTypePdf className='size-3.5 text-rose-600 dark:text-rose-400' />
                  <span>Dokumen PDF (.pdf)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload('xlsx')}
                  className='gap-2 cursor-pointer'
                >
                  <Icons.fileTypeXls className='size-3.5 text-emerald-600 dark:text-emerald-400' />
                  <span>Spreadsheet Excel (.xlsx)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {onClose && (
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                shape='pill'
                onClick={onClose}
                aria-label='Tutup formulir'
                className='text-muted-foreground hover:text-foreground hover:bg-muted/70 size-8'
              >
                <Icons.chevronRight className='size-5' />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-border/30 shrink-0'>
          <div className='flex items-center gap-2'>
            {isEditing ? (
              <span className='text-xs font-semibold text-primary'>Mode Edit Aktif</span>
            ) : !isReadOnly ? (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsEditing(true)}
                className='h-7.5 text-xs font-semibold gap-1.5'
              >
                <Icons.edit className='size-3.5 text-primary' /> Edit Data
              </Button>
            ) : null}
          </div>

          <div className='flex items-center gap-1.5 ml-auto'>
            <Button
              type='button'
              variant='secondary'
              size='icon-sm'
              shape='rounded'
              onClick={() => setIsReaderOpen(true)}
              className='size-8 text-foreground/80 hover:text-foreground'
              title='Buka Formulir Ukuran Penuh'
              aria-label='Buka Formulir Ukuran Penuh'
            >
              <Icons.maximize className='size-4' />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  variant='secondary'
                  size='icon-sm'
                  shape='rounded'
                  disabled={isExporting}
                  isLoading={isExporting}
                  className='size-8 text-foreground/80 hover:text-foreground'
                  title='Unduh Formulir (Multi-Format)'
                  aria-label='Unduh Formulir Multi-Format'
                >
                  <Icons.download className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48 text-xs font-medium'>
                <DropdownMenuItem
                  onClick={() => handleDownload('docx')}
                  className='gap-2 cursor-pointer'
                >
                  <Icons.fileTypeDoc className='size-3.5 text-blue-600 dark:text-blue-400' />
                  <span>Dokumen Word (.docx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload('pdf')}
                  className='gap-2 cursor-pointer'
                >
                  <Icons.fileTypePdf className='size-3.5 text-rose-600 dark:text-rose-400' />
                  <span>Dokumen PDF (.pdf)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload('xlsx')}
                  className='gap-2 cursor-pointer'
                >
                  <Icons.fileTypeXls className='size-3.5 text-emerald-600 dark:text-emerald-400' />
                  <span>Spreadsheet Excel (.xlsx)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className='py-3 flex-1 min-h-0 flex flex-col'>
        {isLoading && !appointment.medical_intake ? (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2'>
            <Icons.spinner className='size-5 animate-spin text-primary' />
            <span className='text-xs font-medium'>Memuat formulir medis...</span>
          </div>
        ) : isPregnancy ? (
          <Tabs defaultValue='identitas' className='w-full flex flex-col h-full min-h-0'>
            <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
              <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer'>
                Identitas Ibu
              </TabsTrigger>
              <TabsTrigger value='suami' className='text-xs font-semibold cursor-pointer'>
                Suami & Alamat
              </TabsTrigger>
              <TabsTrigger value='klinis' className='text-xs font-semibold cursor-pointer'>
                Skrining Klinis
              </TabsTrigger>
              <TabsTrigger value='obstetri' className='text-xs font-semibold cursor-pointer'>
                Obstetri & KB
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
              <TabsContent value='identitas' className='m-0 outline-none'>
                <InspectorIdentityTab
                  appointment={appointment}
                  data={parsedData}
                  isEditing={isEditing}
                  formData={formData}
                  onFieldChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value='suami' className='m-0 outline-none'>
                <InspectorPartnerTab
                  appointment={appointment}
                  data={parsedData}
                  isEditing={isEditing}
                  formData={formData}
                  onFieldChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value='klinis' className='m-0 outline-none'>
                <InspectorClinicalTab
                  appointment={appointment}
                  data={parsedData}
                  isEditing={isEditing}
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  onDiseaseChange={handleDiseaseChange}
                />
              </TabsContent>

              <TabsContent value='obstetri' className='m-0 outline-none'>
                <InspectorObstetricTab
                  appointment={appointment}
                  data={parsedData}
                  isEditing={isEditing}
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  onNestedArrayChange={handleNestedArrayChange}
                  onAddNestedItem={handleAddNestedItem}
                  onRemoveNestedItem={handleRemoveNestedItem}
                />
              </TabsContent>
            </div>
          </Tabs>
        ) : isImmunization ? (
          <InspectorImmunizationTab
            appointment={appointment}
            data={parsedData}
            isEditing={isEditing}
            immunizationFormData={immunizationFormData}
            onImmunizationFieldChange={handleImmunizationFieldChange}
            onVaccineValueChange={handleVaccineValueChange}
          />
        ) : (
          <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
            <InspectorGenericView
              appointment={appointment}
              data={parsedData}
              isEditing={isEditing}
              regularFormData={regularFormData}
              onRegularFieldChange={handleRegularFieldChange}
            />
          </div>
        )}
      </div>

      {/* Standardized Footer Bar untuk Aksi Edit (Save & Cancel) for ALL flows */}
      {isEditing && (
        <div className='flex items-center justify-between pt-3 mt-1 border-t border-border/40 shrink-0 bg-background'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              Perubahan belum disimpan ke server
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleCancelEdit}
              disabled={isSaving}
              className='h-8 text-xs font-medium'
            >
              Batal
            </Button>

            <Button
              type='button'
              variant='default'
              size='sm'
              onClick={handleSaveEdit}
              isLoading={isSaving}
              disabled={isSaving}
              className='h-8 text-xs font-semibold gap-1.5'
            >
              <Icons.check className='size-3.5' /> Simpan Perubahan
            </Button>
          </div>
        </div>
      )}

      {/* Offscreen A4 container for isolated PDF printing */}
      <div
        id='isolated-clinical-printable'
        className='fixed left-[-9999px] top-[-9999px] pointer-events-none opacity-0'
        aria-hidden='true'
      >
        {isPregnancy && <PmbFormTemplate data={pmbFormData} />}
        {isImmunization && <ImunisasiFormTemplate data={imunisasiFormData} />}
        {!isPregnancy && !isImmunization && <RegulerFormTemplate data={regulerFormData} />}
      </div>

      <ClinicalDocumentFullscreenReader
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        flow={parsedData.flow as ClinicalFormFlow}
        pmbData={pmbFormData}
        imunisasiData={imunisasiFormData}
        regulerData={regulerFormData}
      />
    </div>
  );
}
