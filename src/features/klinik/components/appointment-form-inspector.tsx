'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clinicEssentialsApi } from '@/features/clinic-essentials/api/clinic-essentials.api';
import type { Appointment } from '../api/types';
import { useInspectorData, useInspectorEditState, useInspectorSave } from './inspector/model';
import { InspectorHeader } from './inspector/organisms/inspector-header';
import { InspectorFooter } from './inspector/organisms/inspector-footer';
import {
  MaternityAdminInspector,
  type MaternityIntake,
  type MaternalHusbandProfile
} from '@/features/maternity';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
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
    const targetCode = isPregnancy ? 'pregnancy' : isImmunization ? 'immunization' : null;
    if (!targetCode) return null;
    return intakeForms.find((f) => f.code === targetCode)?.schema ?? null;
  }, [intakeForms, isPregnancy, isImmunization]);

  const activeMaternityIntake = React.useMemo<MaternityIntake | null>(() => {
    if (!isPregnancy || !parsedData.maternal) return null;
    const resolvedMotherBirthDate =
      (isEditing ? formData.motherBirthDate : null) ||
      parsedData.maternal.motherBirthDate ||
      parsedData.patient?.birthDate ||
      null;

    if (!isEditing) {
      return {
        ...parsedData.maternal,
        motherBirthDate: resolvedMotherBirthDate,
        motherName: parsedData.maternal.motherName || parsedData.patient?.fullName || '',
        motherNik: parsedData.maternal.motherNik || parsedData.patient?.nik || '',
        line1: parsedData.maternal.line1 || parsedData.patient?.line1 || null,
        provinceName: parsedData.maternal.provinceName || parsedData.patient?.provinceName || null,
        provinceCode: parsedData.maternal.provinceCode || parsedData.patient?.provinceCode || null,
        regencyName: parsedData.maternal.regencyName || parsedData.patient?.regencyName || null,
        regencyCode: parsedData.maternal.regencyCode || parsedData.patient?.regencyCode || null,
        districtName: parsedData.maternal.districtName || parsedData.patient?.districtName || null,
        districtCode: parsedData.maternal.districtCode || parsedData.patient?.districtCode || null,
        villageName: parsedData.maternal.villageName || parsedData.patient?.villageName || null,
        villageCode: parsedData.maternal.villageCode || parsedData.patient?.villageCode || null
      };
    }

    const currentPartnerPhone =
      formData.partnerPhone ?? parsedData.maternal.husbandProfile?.phoneNumber ?? '';

    return {
      ...parsedData.maternal,
      ...formData,
      motherBirthDate: resolvedMotherBirthDate,
      husbandProfile: {
        ...parsedData.maternal.husbandProfile,
        fullName: formData.partnerName || '',
        nik: formData.partnerNik || null,
        birthDate: formData.partnerBirthDate || null,
        age: formData.partnerAge || null,
        job: formData.partnerJob || null,
        education: formData.partnerEducation || null,
        bloodType: formData.partnerBloodType || null,
        phoneNumber: currentPartnerPhone || null
      }
    };
  }, [isPregnancy, isEditing, parsedData.maternal, parsedData.patient, formData]);

  const activeChildIntake = React.useMemo(() => {
    if (!isImmunization || !parsedData.child) return null;
    const resolvedChildBirthDate =
      (isEditing ? immunizationFormData.childBirthDate : null) ||
      (parsedData.child as any).childBirthDate ||
      parsedData.patient?.birthDate ||
      null;

    if (!isEditing) {
      return {
        ...parsedData.child,
        childBirthDate: resolvedChildBirthDate
      } as any;
    }
    return {
      ...parsedData.child,
      ...immunizationFormData,
      childBirthDate: resolvedChildBirthDate
    } as any;
  }, [isImmunization, isEditing, parsedData.child, parsedData.patient, immunizationFormData]);

  const activeUnifiedData = React.useMemo<typeof parsedData>(() => {
    const activePatient = parsedData.patient
      ? {
          ...parsedData.patient,
          fullName: isPregnancy
            ? formData.motherName || parsedData.patient.fullName
            : isImmunization
              ? immunizationFormData.childName || parsedData.patient.fullName
              : regularFormData.fullName || parsedData.patient.fullName,
          nik: isPregnancy
            ? formData.motherNik || parsedData.patient.nik
            : isImmunization
              ? immunizationFormData.childNik || parsedData.patient.nik
              : regularFormData.nik || parsedData.patient.nik,
          phone: isPregnancy
            ? formData.phoneNumber || parsedData.patient.phone
            : isImmunization
              ? immunizationFormData.parentPhone || parsedData.patient.phone
              : regularFormData.phone || parsedData.patient.phone,
          address: isPregnancy
            ? formData.domicileAddress || parsedData.patient.address
            : isImmunization
              ? immunizationFormData.childAddress || parsedData.patient.address
              : regularFormData.line1 || regularFormData.address || parsedData.patient.address,
          line1: isPregnancy
            ? formData.line1 || parsedData.patient.line1
            : isImmunization
              ? parsedData.patient.line1
              : regularFormData.line1 || parsedData.patient.line1,
          villageName: isPregnancy
            ? formData.villageName || parsedData.patient.villageName
            : isImmunization
              ? parsedData.patient.villageName
              : regularFormData.villageName || parsedData.patient.villageName,
          districtName: isPregnancy
            ? formData.districtName || parsedData.patient.districtName
            : isImmunization
              ? parsedData.patient.districtName
              : regularFormData.districtName || parsedData.patient.districtName,
          regencyName: isPregnancy
            ? formData.regencyName || parsedData.patient.regencyName
            : isImmunization
              ? parsedData.patient.regencyName
              : regularFormData.regencyName || parsedData.patient.regencyName,
          provinceName: isPregnancy
            ? formData.provinceName || parsedData.patient.provinceName
            : isImmunization
              ? parsedData.patient.provinceName
              : regularFormData.provinceName || parsedData.patient.provinceName,
          ...(isPregnancy || isImmunization
            ? {}
            : {
                medicalRecordNumber:
                  regularFormData.medicalRecordNumber || parsedData.patient.medicalRecordNumber,
                motherName: regularFormData.motherName || parsedData.patient.motherName,
                birthPlace: regularFormData.birthPlace || parsedData.patient.birthPlace,
                birthDate: regularFormData.birthDate || parsedData.patient.birthDate,
                gender: regularFormData.gender || parsedData.patient.gender,
                bloodType: regularFormData.bloodType || parsedData.patient.bloodType,
                occupation: regularFormData.occupation || parsedData.patient.occupation,
                email: regularFormData.email || parsedData.patient.email,
                emergencyContactName:
                  regularFormData.emergencyContactName || parsedData.patient.emergencyContactName,
                emergencyContactPhone:
                  regularFormData.emergencyContactPhone || parsedData.patient.emergencyContactPhone,
                emergencyContactRelationship:
                  regularFormData.emergencyContactRelationship ||
                  parsedData.patient.emergencyContactRelationship
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
    formData.line1,
    formData.villageName,
    formData.districtName,
    formData.regencyName,
    formData.provinceName,
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
        handleFieldChange('conditionResponses' as any, val);
        val.forEach((cond: any) => {
          handleDiseaseChange(
            cond.conditionCode,
            cond.hasCondition,
            cond.diagnosisYear ? String(cond.diagnosisYear) : undefined
          );
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

  const maternalRegionValues: PatientRegionValues = React.useMemo(
    () => ({
      provinceName: formData.provinceName || parsedData.patient?.provinceName || '',
      provinceCode: formData.provinceCode || parsedData.patient?.provinceCode || '',
      regencyName: formData.regencyName || parsedData.patient?.regencyName || '',
      regencyCode: formData.regencyCode || parsedData.patient?.regencyCode || '',
      districtName: formData.districtName || parsedData.patient?.districtName || '',
      districtCode: formData.districtCode || parsedData.patient?.districtCode || '',
      villageName: formData.villageName || parsedData.patient?.villageName || '',
      villageCode: formData.villageCode || parsedData.patient?.villageCode || '',
      line1: formData.line1 || parsedData.patient?.line1 || formData.domicileAddress || ''
    }),
    [formData, parsedData.patient]
  );

  const handleMaternalRegionChange = React.useCallback(
    (updates: Partial<PatientRegionValues>) => {
      Object.entries(updates).forEach(([key, val]) => {
        handleFieldChange(key as any, val);
      });
      const merged = { ...maternalRegionValues, ...updates };
      const parts = [
        merged.line1,
        merged.villageName ? `Kel. ${merged.villageName}` : '',
        merged.districtName ? `Kec. ${merged.districtName}` : '',
        merged.regencyName,
        merged.provinceName ? `Prov. ${merged.provinceName}` : ''
      ].filter(Boolean);
      handleFieldChange('domicileAddress', parts.join(', '));
      if (validationErrors.domicileAddress) {
        handleClearError('domicileAddress');
      }
    },
    [handleFieldChange, maternalRegionValues, validationErrors.domicileAddress, handleClearError]
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

  const handleDownload = async (format: 'docx' | 'xlsx') => {
    try {
      setIsExporting(true);
      const patientName = appointment.patient_name || 'Pasien';
      const safeName = patientName.replace(/\s+/g, '_');

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
            regionValues={maternalRegionValues}
            onRegionChange={handleMaternalRegionChange}
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
            onEntriesChange={(updatedEntries) =>
              handleImmunizationFieldChange('entries' as any, updatedEntries)
            }
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
        <InspectorFooter isSaving={isSaving} onCancel={handleCancelEdit} onSave={handleSaveEdit} />
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
