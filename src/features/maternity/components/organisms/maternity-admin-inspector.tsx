'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import { TETANUS_STATUS_OPTIONS } from '../../constants/maternity.constants';
import type {
  MaternityIntake,
  MaternalHusbandProfile,
  MaternalPreviousPregnancy,
  MaternalContraceptiveHistory,
  MaternalConditionResponse
} from '../../types/maternity.types';
import {
  MaternityIdentitySection,
  MaternityObstetricSection,
  MaternityClinicalKbSection,
  MaternityScreeningSection
} from './maternity-inspector';
import {
  getMaternityTabWithErrors,
  type MaternityInspectorTab
} from '@/features/klinik/validations/maternity-form.schema';

export interface MaternityAdminInspectorProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onHusbandFieldChange?: (field: keyof MaternalHusbandProfile, value: any) => void;
  onPreviousPregnanciesChange?: (updated: MaternalPreviousPregnancy[]) => void;
  onContraceptiveHistoriesChange?: (updated: MaternalContraceptiveHistory[]) => void;
  onConditionsChange?: (updated: MaternalConditionResponse[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function MaternityAdminInspector({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  onHusbandFieldChange,
  onPreviousPregnanciesChange,
  onContraceptiveHistoriesChange,
  onConditionsChange,
  validationErrors = {},
  onClearError
}: MaternityAdminInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<MaternityInspectorTab>('identitas');

  // Automatically switch tab to the first error section when validation errors are present
  React.useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const errorTab = getMaternityTabWithErrors(validationErrors);
      if (errorTab) {
        setActiveTab(errorTab);
      }
    }
  }, [validationErrors]);

  const references = usePatientFormReferences();
  const bloodTypeOptions = React.useMemo(
    () => references.bloodTypes.map((b) => b.label || b.value),
    [references.bloodTypes]
  );
  const occupationOptions = React.useMemo(
    () => references.occupations.map((o) => o.name),
    [references.occupations]
  );
  const educationOptions = React.useMemo(
    () => references.educationLevels.map((e) => e.label || e.value),
    [references.educationLevels]
  );
  const religionOptions = React.useMemo(
    () => references.religions.map((r) => r.label || r.value),
    [references.religions]
  );

  const errorKeys = Object.keys(validationErrors);
  const hasIdentitasErrors = errorKeys.some((k) =>
    ['motherName', 'motherNik', 'motherBirthDate', 'phoneNumber', 'partnerNik', 'partnerPhone'].includes(k)
  );
  const hasObstetriErrors = errorKeys.some((k) =>
    ['hpht', 'estimatedDueDate', 'gravidaCount', 'parityCount', 'abortionCount'].includes(k)
  );
  const hasKlinisErrors = errorKeys.some((k) =>
    ['heightCm', 'prePregnancyWeightKg', 'upperArmCircumferenceCm', 'initialBmi', 'tetanusStatus'].includes(k)
  );
  const hasSkriningErrors = errorKeys.some(
    (k) => k.startsWith('condition_') || k === 'conditionResponses'
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as MaternityInspectorTab)}
      className='w-full flex flex-col h-full min-h-0'
    >
      <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer truncate relative'>
          Identitas
          {hasIdentitasErrors && (
            <span className='size-1.5 rounded-full bg-destructive absolute top-1.5 right-2' />
          )}
        </TabsTrigger>
        <TabsTrigger value='obstetri' className='text-xs font-semibold cursor-pointer truncate relative'>
          Riwayat Kehamilan
          {hasObstetriErrors && (
            <span className='size-1.5 rounded-full bg-destructive absolute top-1.5 right-2' />
          )}
        </TabsTrigger>
        <TabsTrigger value='klinis' className='text-xs font-semibold cursor-pointer truncate relative'>
          Pemeriksaan Fisik & KB
          {hasKlinisErrors && (
            <span className='size-1.5 rounded-full bg-destructive absolute top-1.5 right-2' />
          )}
        </TabsTrigger>
        <TabsTrigger value='skrining' className='text-xs font-semibold cursor-pointer truncate relative'>
          Skrining Penyakit
          {hasSkriningErrors && (
            <span className='size-1.5 rounded-full bg-destructive absolute top-1.5 right-2' />
          )}
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col'>
        {/* TAB 1: IDENTITAS IBU & SUAMI */}
        <TabsContent value='identitas' className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'>
          <MaternityIdentitySection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
            onHusbandFieldChange={onHusbandFieldChange}
            validationErrors={validationErrors}
            onClearError={onClearError}
            religionOptions={religionOptions}
            educationOptions={educationOptions}
            occupationOptions={occupationOptions}
            bloodTypeOptions={bloodTypeOptions}
          />
        </TabsContent>

        {/* TAB 2: OBSTETRI & RIWAYAT KEHAMILAN */}
        <TabsContent value='obstetri' className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'>
          <MaternityObstetricSection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
            onPreviousPregnanciesChange={onPreviousPregnanciesChange}
            validationErrors={validationErrors}
            onClearError={onClearError}
          />
        </TabsContent>

        {/* TAB 3: PEMERIKSAAN FISIK & KB */}
        <TabsContent value='klinis' className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'>
          <MaternityClinicalKbSection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
            onContraceptiveHistoriesChange={onContraceptiveHistoriesChange}
            validationErrors={validationErrors}
            onClearError={onClearError}
            tetanusOptions={TETANUS_STATUS_OPTIONS}
            bloodTypeOptions={bloodTypeOptions}
          />
        </TabsContent>

        {/* TAB 4: SKRINING PENYAKIT & FAKTOR RISIKO */}
        <TabsContent value='skrining' className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'>
          <MaternityScreeningSection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
            onConditionsChange={onConditionsChange}
            validationErrors={validationErrors}
            onClearError={onClearError}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
