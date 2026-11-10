'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { clinicEssentialsApi } from '@/features/clinic-essentials/api/clinic-essentials.api';
import type { Appointment } from '../api/types';
import {
  useInspectorData,
  useInspectorEditState,
  useInspectorSave,
  useActiveInspectorState
} from './inspector/model';
import { InspectorHeader } from './inspector/organisms/inspector-header';
import { InspectorFooter } from './inspector/organisms/inspector-footer';
import { MaternityAdminInspector } from '@/features/maternity';
import { ImmunizationAdminInspector } from '@/features/immunization';
import {
  RegularIdentitySection,
  RegularEncounterSection
} from './inspector/sections';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import {
  isAppointmentTerminal,
  isAppointmentBooked,
  isPatientPresentInClinic
} from '@/features/appointment-pasien/constants/options';
import {
  validateMaternalForm,
  validateRegularForm,
  validateImmunizationForm
} from '../validations/inspector-form.schema';
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
import { FLOW_NAMES } from '../constants/medical-appointment-types';

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
  const isTerminal = isAppointmentTerminal(appointment.status);
  const isPresentInClinic = isPatientPresentInClinic(appointment.status);
  const isBooked = isAppointmentBooked(appointment.status);
  const canEditIntake = !readOnly && !isTerminal && isPresentInClinic;
  const isReadOnly = !canEditIntake;

  const references = usePatientFormReferences();

  const {
    serverIntake,
    isLoading,
    parsedData,
    isPregnancy: _baseIsPregnancy,
    isImmunization: baseIsImmunization
  } = useInspectorData(appointment);

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
    handleImmunizationFieldChange,
    handleRegularFieldChange,
    handleCancelEdit,
    isDirty
  } = useInspectorEditState({ parsedData, appointment });

  const activeFlow =
    isEditing && regularFormData?.medicalFlow !== undefined
      ? regularFormData.medicalFlow
      : parsedData.flow;
  const isPregnancy = activeFlow === FLOW_NAMES.PREGNANCY;
  const isImmunization =
    activeFlow === FLOW_NAMES.IMMUNIZATION || (!isEditing && baseIsImmunization);

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

  const {
    activeMaternityIntake,
    activeChildIntake,
    activeUnifiedData,
    maternalRegionValues,
    handleMaternalRegionChange,
    handleMaternityFieldChange,
    handleHusbandFieldChange
  } = useActiveInspectorState({
    isPregnancy,
    isImmunization,
    isEditing,
    parsedData,
    appointment,
    formData,
    immunizationFormData,
    regularFormData,
    handleFieldChange,
    handleDiseaseChange,
    validationErrors,
    handleClearError
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

  const pmbFormData = React.useMemo(() => {
    if (isPregnancy && (!isEditing || isReaderOpen || isExporting)) {
      return adaptToPmbFormData(activeUnifiedData, appointment, activeSchema);
    }
    return null;
  }, [activeUnifiedData, appointment, isPregnancy, activeSchema, isEditing, isReaderOpen, isExporting]);

  const imunisasiFormData = React.useMemo(() => {
    if (isImmunization && (!isEditing || isReaderOpen || isExporting)) {
      return adaptToImunisasiFormData(activeUnifiedData, appointment, activeSchema);
    }
    return null;
  }, [activeUnifiedData, appointment, isImmunization, activeSchema, isEditing, isReaderOpen, isExporting]);

  const regulerFormData = React.useMemo(() => {
    if (!isPregnancy && !isImmunization && (!isEditing || isReaderOpen || isExporting)) {
      return adaptToRegulerFormData(activeUnifiedData, appointment, activeSchema);
    }
    return null;
  }, [activeUnifiedData, appointment, isPregnancy, isImmunization, activeSchema, isEditing, isReaderOpen, isExporting]);

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

  const isSaveDisabled = React.useMemo(() => {
    if (!isEditing) return false;
    if (Object.keys(validationErrors).length > 0) return true;
    if (!validateRegularForm(regularFormData).isValid) return true;
    if (isPregnancy) {
      return !validateMaternalForm(formData).isValid;
    }
    if (isImmunization) {
      return !validateImmunizationForm(immunizationFormData).isValid;
    }
    return false;
  }, [
    isEditing,
    validationErrors,
    isPregnancy,
    isImmunization,
    formData,
    immunizationFormData,
    regularFormData
  ]);

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
        ) : (
          <div className='flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col gap-5 font-sans'>
            {isBooked && !isTerminal && (
              <div className='flex items-start gap-2.5 p-3 rounded-xl bg-info-subtle border border-info-border text-info-foreground text-xs font-sans'>
                <Icons.info className='size-4 text-info shrink-0 mt-0.5' />
                <div className='space-y-0.5'>
                  <span className='font-semibold block text-foreground'>
                    Pasien Belum Melakukan Check-In
                  </span>
                  <p className='text-muted-foreground text-[11.5px] leading-relaxed'>
                    Pasien belum tiba di klinik (status: <span className='font-medium text-foreground'>Sudah Buat Janji</span>). Formulir medis terkunci dalam mode pratinjau dan baru dapat diedit setelah pasien tiba dan melakukan check-in.
                  </p>
                </div>
              </div>
            )}

            <RegularIdentitySection
              data={parsedData}
              isEditing={isEditing}
              regularFormData={regularFormData}
              onRegularFieldChange={handleRegularFieldChange}
              validationErrors={validationErrors}
              onClearError={handleClearError}
              references={references}
            />

            <RegularEncounterSection
              appointment={appointment}
              data={parsedData}
              isEditing={isEditing}
              regularFormData={regularFormData}
              onRegularFieldChange={handleRegularFieldChange}
              validationErrors={validationErrors}
              onClearError={handleClearError}
            />

            {isPregnancy && (
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
            )}

            {isImmunization && (
              <ImmunizationAdminInspector
                intake={activeChildIntake as any}
                entries={(activeChildIntake?.entries || immunizationFormData?.entries || []) as any}
                isEditing={isEditing}
                onIntakeFieldChange={(field, val) =>
                  handleImmunizationFieldChange(field as any, val)
                }
                onEntriesChange={(updatedEntries) =>
                  handleImmunizationFieldChange('entries' as any, updatedEntries)
                }
                validationErrors={validationErrors}
                onClearError={handleClearError}
              />
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <InspectorFooter
          isSaving={isSaving}
          isSaveDisabled={isSaveDisabled}
          onCancel={handleCancelEdit}
          onSave={() => handleSaveEdit(isDirty)}
        />
      )}

      {!isEditing && (
        <div
          id='isolated-clinical-printable'
          className='fixed left-[-9999px] top-[-9999px] pointer-events-none opacity-0'
          aria-hidden='true'
        >
          {isPregnancy && <PmbFormTemplate data={pmbFormData} />}
          {isImmunization && <ImunisasiFormTemplate data={imunisasiFormData} />}
          {!isPregnancy && !isImmunization && <RegulerFormTemplate data={regulerFormData} />}
        </div>
      )}

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
