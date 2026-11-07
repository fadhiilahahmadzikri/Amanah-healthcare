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
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import {
  MaternityIdentitySection,
  MaternityObstetricSection,
  MaternityClinicalKbSection,
  MaternityScreeningSection
} from './maternity-inspector';
import {
  getMaternityTabWithErrors,
  getMaternityTabErrorCounts,
  MATERNITY_FIELD_DOM_ID_MAP,
  type MaternityInspectorTab
} from '@/features/klinik/validations/maternity-form.schema';

export interface MaternityAdminInspectorProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onHusbandFieldChange?: (field: keyof MaternalHusbandProfile, value: any) => void;
  regionValues?: PatientRegionValues;
  onRegionChange?: (updates: Partial<PatientRegionValues>) => void;
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
  regionValues,
  onRegionChange,
  onPreviousPregnanciesChange,
  onContraceptiveHistoriesChange,
  onConditionsChange,
  validationErrors = {},
  onClearError
}: MaternityAdminInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<MaternityInspectorTab>('identitas');

  // Automatically switch tab to the first error section and scroll to the first invalid field
  React.useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const errorTab = getMaternityTabWithErrors(validationErrors);
      if (errorTab) {
        setActiveTab(errorTab);
      }

      const firstErrorKey = Object.keys(validationErrors)[0];
      let domId = MATERNITY_FIELD_DOM_ID_MAP[firstErrorKey];
      if (!domId) {
        if (firstErrorKey.startsWith('prev_preg_')) {
          const match = firstErrorKey.match(/^prev_preg_(\d+)_(.+)$/);
          if (match) {
            const idx = match[1];
            const field = match[2];
            if (field === 'birthYear') domId = `prev-preg-year-${idx}`;
            else if (field === 'birthWeightGrams') domId = `prev-preg-weight-${idx}`;
            else if (field === 'birthLengthCm') domId = `prev-preg-length-${idx}`;
          }
        } else if (firstErrorKey.startsWith('condition_')) {
          const match = firstErrorKey.match(/^condition_([A-Z_]+)_year$/);
          if (match) {
            domId = `condition-year-${match[1].toLowerCase()}`;
          }
        } else {
          domId = `maternity-${firstErrorKey}`;
        }
      }

      const timer = setTimeout(() => {
        if (domId) {
          const el = document.getElementById(domId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (
              el instanceof HTMLInputElement ||
              el instanceof HTMLTextAreaElement ||
              el instanceof HTMLSelectElement
            ) {
              el.focus({ preventScroll: true });
            }
          }
        }
      }, 100);

      return () => clearTimeout(timer);
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

  const tabErrorCounts = React.useMemo(
    () => getMaternityTabErrorCounts(validationErrors),
    [validationErrors]
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as MaternityInspectorTab)}
      className='w-full flex flex-col h-full min-h-0'
    >
      <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer truncate relative flex items-center justify-center gap-1.5'>
          <span>Identitas</span>
          {tabErrorCounts.identitas > 0 && (
            <span className='px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground min-w-4 text-center leading-none'>
              {tabErrorCounts.identitas}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value='obstetri' className='text-xs font-semibold cursor-pointer truncate relative flex items-center justify-center gap-1.5'>
          <span>Riwayat Kehamilan</span>
          {tabErrorCounts.obstetri > 0 && (
            <span className='px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground min-w-4 text-center leading-none'>
              {tabErrorCounts.obstetri}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value='klinis' className='text-xs font-semibold cursor-pointer truncate relative flex items-center justify-center gap-1.5'>
          <span>Pemeriksaan Fisik & KB</span>
          {tabErrorCounts.klinis > 0 && (
            <span className='px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground min-w-4 text-center leading-none'>
              {tabErrorCounts.klinis}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value='skrining' className='text-xs font-semibold cursor-pointer truncate relative flex items-center justify-center gap-1.5'>
          <span>Skrining Penyakit</span>
          {tabErrorCounts.skrining > 0 && (
            <span className='px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground min-w-4 text-center leading-none'>
              {tabErrorCounts.skrining}
            </span>
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
            regionValues={regionValues}
            onRegionChange={onRegionChange}
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
