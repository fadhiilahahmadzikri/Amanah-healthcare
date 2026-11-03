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
import { InspectorIdentityTab } from './inspector/inspector-identity-tab';
import { InspectorPartnerTab } from './inspector/inspector-partner-tab';
import { InspectorClinicalTab } from './inspector/inspector-clinical-tab';
import { InspectorObstetricTab } from './inspector/inspector-obstetric-tab';
import { InspectorImmunizationTab } from './inspector/inspector-immunization-tab';
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
        : 'standard-registration';
    return intakeForms.find((f) => f.code === targetCode)?.schema ?? null;
  }, [intakeForms, isPregnancy, isImmunization]);

  const pmbFormData = React.useMemo(() => {
    if (isPregnancy) {
      return adaptToPmbFormData(parsedData, appointment, activeSchema);
    }
    return null;
  }, [parsedData, appointment, isPregnancy, activeSchema]);

  const imunisasiFormData = React.useMemo(() => {
    if (isImmunization) {
      return adaptToImunisasiFormData(parsedData, appointment, activeSchema);
    }
    return null;
  }, [parsedData, appointment, isImmunization, activeSchema]);

  const regulerFormData = React.useMemo(() => {
    if (!isPregnancy && !isImmunization) {
      return adaptToRegulerFormData(parsedData, appointment, activeSchema);
    }
    return null;
  }, [parsedData, appointment, isPregnancy, isImmunization, activeSchema]);

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
                  validationErrors={validationErrors}
                  onClearError={handleClearError}
                />
              </TabsContent>

              <TabsContent value='suami' className='m-0 outline-none'>
                <InspectorPartnerTab
                  appointment={appointment}
                  data={parsedData}
                  isEditing={isEditing}
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  validationErrors={validationErrors}
                  onClearError={handleClearError}
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
