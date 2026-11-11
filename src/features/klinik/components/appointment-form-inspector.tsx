'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { clinicEssentialsApi } from '@/features/clinic-essentials/api/clinic-essentials.api';
import type { Appointment } from '../api/types';
import type { EditableImmunizationData } from './inspector/types';
import {
  useInspectorData,
  useInspectorEditState,
  useInspectorSave,
  useActiveInspectorState
} from './inspector/model';
import { InspectorHeader } from './inspector/organisms/inspector-header';
import { InspectorFooter } from './inspector/organisms/inspector-footer';
import { MaternityAdminInspector } from '@/features/maternity';
import {
  ImmunizationAdminInspector,
  type ImmunizationIntakeRecord
} from '@/features/immunization';
import {
  RegularIdentitySection,
  RegularAddressSection,
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
  validatePatientIdentityForm,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FLOW_NAMES } from '../constants/medical-appointment-types';

export interface AppointmentFormInspectorProps {
  appointment: Appointment;
  onClose?: () => void;
  hideHeader?: boolean;
  readOnly?: boolean;
  showBottomActions?: boolean;
}

export function AppointmentFormInspector({
  appointment,
  onClose,
  hideHeader = false,
  readOnly,
  showBottomActions = false
}: AppointmentFormInspectorProps) {
  const isTerminal = isAppointmentTerminal(appointment.status);
  const isPresentInClinic = isPatientPresentInClinic(appointment.status);
  const isBooked = isAppointmentBooked(appointment.status);
  const canEditIntake = !readOnly && !isTerminal && isPresentInClinic;
  const isReadOnly = !canEditIntake;

  const references = usePatientFormReferences();

  const { serverIntake, isLoading, parsedData } = useInspectorData(appointment);

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
  const isImmunization = activeFlow === FLOW_NAMES.IMMUNIZATION;

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

  const isSaveDisabled = isSaving;

  const handleSave = React.useCallback(() => {
    if (isSaving) return;

    if (isPregnancy) {
      const matValidation = validateMaternalForm(formData);
      const idValidation = validatePatientIdentityForm(regularFormData);

      const allErrors: Record<string, string> = {
        ...idValidation.errors,
        ...matValidation.errors
      };

      if (!matValidation.isValid || !idValidation.isValid) {
        setValidationErrors(allErrors);
        const firstMatKey = Object.keys(matValidation.errors)[0];
        const firstIdKey = Object.keys(idValidation.errors)[0];
        const firstMsg = matValidation.errors[firstMatKey] || idValidation.errors[firstIdKey];
        toast.error(`Mohon lengkapi data yang ditandai merah: ${firstMsg}`);
        return;
      }
    } else if (isImmunization) {
      const imValidation = validateImmunizationForm(immunizationFormData);
      const idValidation = validatePatientIdentityForm(regularFormData);

      const allErrors: Record<string, string> = {
        ...idValidation.errors,
        ...imValidation.errors
      };

      if (!imValidation.isValid || !idValidation.isValid) {
        setValidationErrors(allErrors);
        const firstImKey = Object.keys(imValidation.errors)[0];
        const firstIdKey = Object.keys(idValidation.errors)[0];
        const firstMsg = imValidation.errors[firstImKey] || idValidation.errors[firstIdKey];
        toast.error(`Mohon lengkapi data yang ditandai merah: ${firstMsg}`);
        return;
      }
    } else {
      const regValidation = validateRegularForm(regularFormData);
      if (!regValidation.isValid) {
        setValidationErrors(regValidation.errors);
        const firstKey = Object.keys(regValidation.errors)[0];
        const firstMsg = regValidation.errors[firstKey];
        toast.error(`Mohon lengkapi data yang ditandai merah: ${firstMsg}`);
        const REGULAR_DOM_MAP: Record<string, string> = {
          fullName: 'reg-name-input',
          nik: 'reg-nik-input',
          birthDate: 'reg-birthdate-input',
          gender: 'reg-gender-select',
          complaint: 'reg-complaint-input',
          emergencyContactName: 'reg-emg-name-input',
          emergencyContactPhone: 'reg-emg-phone-input',
          phone: 'reg-phone-input',
          email: 'reg-email-input'
        };
        const domId = REGULAR_DOM_MAP[firstKey] || `reg-${firstKey}-input`;
        setTimeout(() => {
          const el = document.getElementById(domId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
              el.focus({ preventScroll: true });
            }
          }
        }, 100);
        return;
      }
    }

    void handleSaveEdit(isDirty);
  }, [
    isSaving,
    isPregnancy,
    isImmunization,
    formData,
    immunizationFormData,
    regularFormData,
    setValidationErrors,
    handleSaveEdit,
    isDirty
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

            <RegularAddressSection
              data={parsedData}
              isEditing={isEditing}
              regularFormData={regularFormData}
              onRegularFieldChange={handleRegularFieldChange}
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
                intake={activeChildIntake as ImmunizationIntakeRecord | null}
                entries={activeChildIntake?.entries || immunizationFormData?.entries || []}
                isEditing={isEditing}
                onIntakeFieldChange={(field, val) =>
                  handleImmunizationFieldChange(field as keyof EditableImmunizationData, val)
                }
                onEntriesChange={(updatedEntries) =>
                  handleImmunizationFieldChange('entries', updatedEntries)
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
          onSave={handleSave}
        />
      )}

      {!isEditing && showBottomActions && (
        <div className='pt-3 border-t border-border/40 flex items-center justify-between gap-2 shrink-0 select-none'>
          <div className='flex items-center gap-1.5'>
            {/* Download Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  size='icon-sm'
                  shape='rounded'
                  disabled={isExporting}
                  isLoading={isExporting}
                  className='size-8 text-foreground/80 hover:text-foreground cursor-pointer rounded-xl'
                  title='Unduh Formulir (Multi-Format)'
                  aria-label='Unduh Formulir'
                >
                  <Icons.download className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' side='top' className='w-48 text-xs font-medium'>
                <DropdownMenuItem onClick={() => handleDownload('docx')} className='gap-2 cursor-pointer'>
                  <Icons.fileTypeDoc className='size-3.5 text-blue-600 dark:text-blue-400' />
                  <span>Word (.docx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('xlsx')} className='gap-2 cursor-pointer'>
                  <Icons.fileTypeXls className='size-3.5 text-emerald-600 dark:text-emerald-400' />
                  <span>Excel (.xlsx)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Expand / Reader Button */}
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              shape='rounded'
              onClick={() => setIsReaderOpen(true)}
              className='size-8 text-foreground/80 hover:text-foreground cursor-pointer rounded-xl'
              title='Buka Layar Penuh (Reader)'
              aria-label='Buka Layar Penuh'
            >
              <Icons.maximize className='size-4' />
            </Button>
          </div>

          {onClose && (
            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='sm'
              onClick={onClose}
              className='text-xs font-semibold px-4 h-8 cursor-pointer'
            >
              Kembali
            </Button>
          )}
        </div>
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
