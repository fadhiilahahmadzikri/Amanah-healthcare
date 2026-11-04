'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clinicEssentialsApi } from '@/features/clinic-essentials/api/clinic-essentials.api';
import type { Appointment } from '../api/types';
import {
  useInspectorData,
  useInspectorEditState,
  useInspectorSave
} from './inspector/model';
import { InspectorHeader } from './inspector/organisms/inspector-header';
import { InspectorFooter } from './inspector/organisms/inspector-footer';
import { MaternityAdminInspector, type MaternityIntake, type MaternalHusbandProfile } from '@/features/maternity';
import { ImmunizationAdminInspector } from '@/features/immunization';
import { InspectorGenericView } from './inspector/inspector-generic-view';
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

  const { serverIntake, isLoading, parsedData, isPregnancy, isImmunization } =
    useInspectorData(appointment);

  const {
    isEditing,
    setIsEditing,
    validationErrors,
    setValidationErrors,
    handleClearError,
    formData,
    immunizationFormData,
    regularFormData,
    handleFieldChange,
    handleDiseaseChange,
    handleNestedArrayChange,
    handleAddNestedItem,
    handleRemoveNestedItem,
    handleImmunizationFieldChange,
    handleVaccineValueChange,
    handleRegularFieldChange,
    handleCancelEdit
  } = useInspectorEditState({ parsedData, appointment });

  const { isSaving, handleSaveEdit } = useInspectorSave({
    appointment,
    parsedData,
    serverIntake,
    isPregnancy,
    isImmunization,
    formData,
    immunizationFormData,
    regularFormData,
    setValidationErrors,
    setIsEditing
  });

  const [isReaderOpen, setIsReaderOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const { data: intakeForms } = useQuery({
    queryKey: ['clinical-intake-forms'],
    queryFn: () => clinicEssentialsApi.getForms(),
    staleTime: 5 * 60_000
  });

  const activeSchema = React.useMemo(() => {
    if (!intakeForms) return null;
    const targetCode = isPregnancy
      ? 'pregnancy'
      : isImmunization
        ? 'immunization'
        : null;
    if (!targetCode) return null;
    return intakeForms.find((f) => f.code === targetCode)?.schema ?? null;
  }, [intakeForms, isPregnancy, isImmunization]);

  const activeMaternityIntake: MaternityIntake | null = React.useMemo(() => {
    if (!isPregnancy) return null;
    const m = parsedData.maternal;
    return {
      id: m?.id || appointment.id,
      patientId: m?.patientId || appointment.patient_id || '',
      appointmentId: m?.appointmentId || appointment.id,
      motherName: formData.motherName || m?.motherName || appointment.patient_name || '',
      motherNik: formData.motherNik || m?.motherNik || '',
      motherBirthDate: formData.motherBirthDate || m?.motherBirthDate || null,
      motherAge: formData.motherAge ? Number(formData.motherAge) : m?.motherAge || null,
      marriageOrder: formData.marriageOrder ? Number(formData.marriageOrder) : m?.marriageOrder || 1,
      marriageDate: formData.marriageDate || m?.marriageDate || null,
      motherJob: formData.motherJob || m?.motherJob || null,
      motherEducation: formData.motherEducation || m?.motherEducation || null,
      religion: formData.religion || m?.religion || null,
      phoneNumber: formData.phoneNumber || m?.phoneNumber || appointment.patient_phone || null,
      domicileAddress: formData.domicileAddress || m?.domicileAddress || null,
      identityCardAddress: formData.identityCardAddress || m?.identityCardAddress || null,
      dasawisma: formData.dasawisma || m?.dasawisma || null,
      posyandu: formData.posyandu || m?.posyandu || null,
      puskesmas: formData.puskesmas || m?.puskesmas || null,

      partnerName: formData.partnerName || m?.partnerName || null,
      partnerNik: formData.partnerNik || m?.partnerNik || null,
      partnerBirthDate: formData.partnerBirthDate || m?.partnerBirthDate || null,
      partnerAge: formData.partnerAge ? Number(formData.partnerAge) : m?.partnerAge || null,
      partnerJob: formData.partnerJob || m?.partnerJob || null,
      partnerEducation: formData.partnerEducation || m?.partnerEducation || null,
      partnerBloodType: formData.partnerBloodType || m?.partnerBloodType || null,
      husbandProfile: {
        fullName: formData.partnerName || m?.husband?.fullName || m?.partnerName || '',
        nik: formData.partnerNik || m?.husband?.nik || m?.partnerNik || null,
        birthDate: formData.partnerBirthDate || m?.husband?.birthDate || m?.partnerBirthDate || null,
        age: formData.partnerAge ? Number(formData.partnerAge) : m?.husband?.age || null,
        job: formData.partnerJob || m?.husband?.job || m?.partnerJob || null,
        education: formData.partnerEducation || m?.husband?.education || m?.partnerEducation || null,
        bloodType: formData.partnerBloodType || m?.husband?.bloodType || m?.partnerBloodType || null,
        phoneNumber: (formData as any).partnerPhone || m?.husband?.phoneNumber || null
      },

      heightCm: formData.heightCm ? Number(formData.heightCm) : m?.heightCm || null,
      prePregnancyWeightKg: formData.prePregnancyWeightKg ? Number(formData.prePregnancyWeightKg) : m?.prePregnancyWeightKg || null,
      upperArmCircumferenceCm: formData.upperArmCircumferenceCm ? Number(formData.upperArmCircumferenceCm) : m?.upperArmCircumferenceCm || null,
      initialBmi: formData.initialBmi ? Number(formData.initialBmi) : m?.initialBmi || null,
      tetanusStatus: formData.tetanusStatus || m?.tetanusStatus || null,
      motherBloodType: formData.motherBloodType || m?.motherBloodType || null,

      hpht: formData.hpht || m?.hpht || null,
      estimatedDueDate: formData.estimatedDueDate || m?.estimatedDueDate || null,
      gestationalAgeWeeks: formData.gestationalAgeWeeks || m?.gestationalAgeWeeks || null,
      gestationalAgeFormatted: formData.gestationalAgeFormatted || m?.gestationalAgeFormatted || null,
      currentComplaints: formData.currentComplaints || m?.currentComplaints || appointment.complaint || '',

      gravidaCount: Number(formData.gravidaCount) || m?.gravidaCount || 1,
      parityCount: Number(formData.parityCount) || m?.parityCount || 0,
      abortionCount: Number(formData.abortionCount) || m?.abortionCount || 0,
      livingChildrenCount: Number(formData.livingChildrenCount) || m?.livingChildrenCount || 0,

      hasPreviousPregnancyHistory: Boolean(formData.hasPreviousPregnancyHistory),
      hasContraceptionHistory: Boolean(formData.hasContraceptionHistory),

      smokedBeforePregnancy: formData.smokedBeforePregnancy || m?.smokedBeforePregnancy || null,
      alcoholBeforePregnancy: Boolean(formData.alcoholBeforePregnancy ?? m?.alcoholBeforePregnancy),
      irregularDietBeforePregnancy: Boolean(formData.irregularDietBeforePregnancy ?? m?.irregularDietBeforePregnancy),
      reducedPhysicalActivityBeforePregnancy: Boolean(formData.reducedPhysicalActivityBeforePregnancy ?? m?.reducedPhysicalActivityBeforePregnancy),
      unprescribedMedicationBeforePregnancy: Boolean(formData.unprescribedMedicationBeforePregnancy ?? m?.unprescribedMedicationBeforePregnancy),
      concerningCosmeticUseBeforePregnancy: Boolean(formData.concerningCosmeticUseBeforePregnancy ?? m?.concerningCosmeticUseBeforePregnancy),
      pesticideExposureBeforePregnancy: Boolean(formData.pesticideExposureBeforePregnancy ?? m?.pesticideExposureBeforePregnancy),
      chemicalExposureBeforePregnancy: Boolean(formData.chemicalExposureBeforePregnancy ?? m?.chemicalExposureBeforePregnancy),
      smokeExposureBeforePregnancy: Boolean(formData.smokeExposureBeforePregnancy ?? m?.smokeExposureBeforePregnancy),
      concerningEnvironmentNotes: formData.concerningEnvironmentNotes || m?.concerningEnvironmentNotes || null,
      allergyInfo: formData.allergyInfo || m?.allergyInfo || null,
      otherNotes: formData.otherNotes || m?.otherNotes || null,

      createdAt: m?.createdAt || new Date().toISOString(),
      updatedAt: m?.updatedAt || new Date().toISOString(),

      previousPregnancies: (formData.previousPregnancies || m?.previousPregnancies || []) as any,
      contraceptiveHistories: (formData.contraceptiveHistories || m?.contraceptiveHistories || []) as any,
      diseaseHistory: formData.diseaseHistory || m?.diseaseHistory || null,
      conditionResponses: ((m as any)?.conditionResponses || m?.healthConditions || Object.entries(formData.diseaseHistory || {}).map(([key, val]) => ({
        conditionCode: key,
        hasCondition: Boolean(val),
        diagnosisYear: (formData.diseaseHistory as any)[`${key}Notes`] ? Number((formData.diseaseHistory as any)[`${key}Notes`]) : null,
        notes: null
      }))) as any
    };
  }, [isPregnancy, parsedData.maternal, formData, appointment]);

  const activeChildIntake = React.useMemo(() => {
    if (!isImmunization) return null;
    const c = parsedData.child;
    return {
      id: c?.id || appointment.id,
      patientId: c?.patientId || parsedData.patient?.id || '',
      appointmentId: c?.appointmentId || appointment.id,
      childName: immunizationFormData.childName || c?.childName || appointment.patient_name || '',
      childNik: immunizationFormData.childNik || c?.childNik || null,
      childBirthDate: immunizationFormData.childBirthDate || c?.childBirthDate || '',
      childSex: (immunizationFormData.childSex || c?.childSex || 'male') as any,
      childAgeFormatted: immunizationFormData.childAgeFormatted || c?.childAgeFormatted || null,
      parentPhone: immunizationFormData.parentPhone || c?.parentPhone || appointment.patient_phone || '',
      fatherName: immunizationFormData.fatherName || c?.fatherName || null,
      motherName: immunizationFormData.motherName || c?.motherName || null,
      childAddress: immunizationFormData.childAddress || c?.childAddress || null,
      previousVaccineHistory: immunizationFormData.previousVaccineHistory || c?.previousVaccineHistory || null,
      childAllergyHistory: immunizationFormData.childAllergyHistory || c?.childAllergyHistory || null,
      entries: (immunizationFormData.entries && immunizationFormData.entries.length > 0
        ? immunizationFormData.entries
        : (c as any)?.entries || []) as any
    };
  }, [isImmunization, parsedData.child, parsedData.patient, immunizationFormData, appointment]);

  const activeUnifiedData = React.useMemo<typeof parsedData>(() => {
    const activePatient = parsedData.patient
      ? {
          ...parsedData.patient,
          fullName: isPregnancy
            ? (formData.motherName || parsedData.patient.fullName)
            : isImmunization
              ? (immunizationFormData.childName || parsedData.patient.fullName)
              : (regularFormData.fullName || parsedData.patient.fullName),
          nik: isPregnancy
            ? (formData.motherNik || parsedData.patient.nik)
            : isImmunization
              ? (immunizationFormData.childNik || parsedData.patient.nik)
              : (regularFormData.nik || parsedData.patient.nik),
          phone: isPregnancy
            ? (formData.phoneNumber || parsedData.patient.phone)
            : isImmunization
              ? (immunizationFormData.parentPhone || parsedData.patient.phone)
              : (regularFormData.phone || parsedData.patient.phone),
          address: isPregnancy
            ? (formData.domicileAddress || parsedData.patient.address)
            : isImmunization
              ? (immunizationFormData.childAddress || parsedData.patient.address)
              : (regularFormData.line1 || regularFormData.address || parsedData.patient.address),
          ...(isPregnancy || isImmunization
            ? {}
            : {
                medicalRecordNumber: regularFormData.medicalRecordNumber || parsedData.patient.medicalRecordNumber,
                motherName: regularFormData.motherName || parsedData.patient.motherName,
                birthPlace: regularFormData.birthPlace || parsedData.patient.birthPlace,
                birthDate: regularFormData.birthDate || parsedData.patient.birthDate,
                gender: regularFormData.gender || parsedData.patient.gender,
                bloodType: regularFormData.bloodType || parsedData.patient.bloodType,
                occupation: regularFormData.occupation || parsedData.patient.occupation,
                email: regularFormData.email || parsedData.patient.email,
                line1: regularFormData.line1 || parsedData.patient.line1,
                villageName: regularFormData.villageName || parsedData.patient.villageName,
                districtName: regularFormData.districtName || parsedData.patient.districtName,
                regencyName: regularFormData.regencyName || parsedData.patient.regencyName,
                provinceName: regularFormData.provinceName || parsedData.patient.provinceName,
                emergencyContactName: regularFormData.emergencyContactName || parsedData.patient.emergencyContactName,
                emergencyContactPhone: regularFormData.emergencyContactPhone || parsedData.patient.emergencyContactPhone,
                emergencyContactRelationship: regularFormData.emergencyContactRelationship || parsedData.patient.emergencyContactRelationship
              })
        }
      : undefined;

    const activeAnswers = {
      ...parsedData.answers,
      ...regularFormData.answers,
      complaint: regularFormData.complaint || parsedData.complaint,
      keluhanUtama: regularFormData.complaint || parsedData.complaint
    };

    return {
      ...parsedData,
      patient: activePatient,
      answers: activeAnswers,
      maternal: activeMaternityIntake as any,
      child: activeChildIntake as any
    };
  }, [
    parsedData,
    activeMaternityIntake,
    activeChildIntake,
    regularFormData,
    isPregnancy,
    isImmunization,
    formData.motherName,
    formData.motherNik,
    formData.phoneNumber,
    formData.domicileAddress,
    immunizationFormData.childName,
    immunizationFormData.childNik,
    immunizationFormData.parentPhone,
    immunizationFormData.childAddress
  ]);

  const handleMaternityFieldChange = React.useCallback(
    (field: keyof MaternityIntake, val: any) => {
      if (field === 'previousPregnancies') {
        handleFieldChange('previousPregnancies' as any, val);
      } else if (field === 'contraceptiveHistories') {
        handleFieldChange('contraceptiveHistories' as any, val);
      } else if (field === 'conditionResponses') {
        val.forEach((cond: any) => {
          handleDiseaseChange(cond.conditionCode, cond.hasCondition, cond.diagnosisYear ? String(cond.diagnosisYear) : undefined);
        });
      } else {
        handleFieldChange(field as any, val);
      }
    },
    [handleFieldChange, handleDiseaseChange]
  );

  const handleHusbandFieldChange = React.useCallback(
    (field: keyof MaternalHusbandProfile, val: any) => {
      if (field === 'fullName') handleFieldChange('partnerName' as any, val);
      else if (field === 'nik') handleFieldChange('partnerNik' as any, val);
      else if (field === 'birthDate') handleFieldChange('partnerBirthDate' as any, val);
      else if (field === 'job') handleFieldChange('partnerJob' as any, val);
      else if (field === 'education') handleFieldChange('partnerEducation' as any, val);
      else if (field === 'bloodType') handleFieldChange('partnerBloodType' as any, val);
      else if (field === 'phoneNumber') handleFieldChange('partnerPhone' as any, val);
    },
    [handleFieldChange]
  );

  const pmbFormData = React.useMemo(() => {
    if (isPregnancy) {
      return adaptToPmbFormData(activeUnifiedData, appointment, activeSchema);
    }
    return null;
  }, [activeUnifiedData, appointment, isPregnancy, activeSchema]);

  const imunisasiFormData = React.useMemo(() => {
    if (isImmunization) {
      return adaptToImunisasiFormData(activeUnifiedData, appointment, activeSchema);
    }
    return null;
  }, [activeUnifiedData, appointment, isImmunization, activeSchema]);

  const regulerFormData = React.useMemo(() => {
    if (!isPregnancy && !isImmunization) {
      return adaptToRegulerFormData(activeUnifiedData, appointment, activeSchema);
    }
    return null;
  }, [activeUnifiedData, appointment, isPregnancy, isImmunization, activeSchema]);

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
      <InspectorHeader
        isPregnancy={isPregnancy}
        isImmunization={isImmunization}
        isEditing={isEditing}
        isReadOnly={isReadOnly}
        isExporting={isExporting}
        hideHeader={hideHeader}
        onStartEdit={() => setIsEditing(true)}
        onOpenReader={() => setIsReaderOpen(true)}
        onDownload={handleDownload}
        onClose={onClose}
      />

      <div className='py-3 flex-1 min-h-0 flex flex-col'>
        {isLoading && !appointment.medical_intake ? (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2'>
            <Icons.spinner className='size-5 animate-spin text-primary' />
            <span className='text-xs font-medium'>Memuat formulir medis...</span>
          </div>
        ) : isPregnancy ? (
          <MaternityAdminInspector
            intake={activeMaternityIntake}
            isEditing={isEditing}
            onIntakeFieldChange={handleMaternityFieldChange}
            onHusbandFieldChange={handleHusbandFieldChange}
            onPreviousPregnanciesChange={(updated) =>
              handleMaternityFieldChange('previousPregnancies', updated)
            }
            onContraceptiveHistoriesChange={(updated) =>
              handleMaternityFieldChange('contraceptiveHistories', updated)
            }
            onConditionsChange={(updated) =>
              handleMaternityFieldChange('conditionResponses', updated)
            }
            validationErrors={validationErrors}
            onClearError={handleClearError}
          />
        ) : isImmunization ? (
          <ImmunizationAdminInspector
            intake={activeChildIntake}
            entries={(activeChildIntake?.entries || []) as any}
            isEditing={isEditing}
            onIntakeFieldChange={(field, val) => handleImmunizationFieldChange(field as any, val)}
            onEntriesChange={(updatedEntries) => handleImmunizationFieldChange('entries' as any, updatedEntries)}
            validationErrors={validationErrors}
            onClearError={handleClearError}
          />
        ) : (
          <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
            <InspectorGenericView
              appointment={appointment}
              data={parsedData}
              isEditing={isEditing}
              regularFormData={regularFormData}
              onRegularFieldChange={handleRegularFieldChange}
              validationErrors={validationErrors}
              onClearError={handleClearError}
            />
          </div>
        )}
      </div>

      {isEditing && (
        <InspectorFooter
          isSaving={isSaving}
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
        />
      )}

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
