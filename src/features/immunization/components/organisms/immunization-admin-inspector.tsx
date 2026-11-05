'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  ImmunizationClinicalEntry,
  ImmunizationIntakeRecord
} from '../../types/immunization.types';
import {
  ImmunizationChildIdentitySection,
  ImmunizationParentAddressSection,
  ImmunizationHistorySection,
  ImmunizationMilestoneTrajectorySection
} from './immunization-inspector';
import {
  getImmunizationTabWithErrors,
  type ImmunizationInspectorTab
} from '@/features/klinik/validations/immunization-form.schema';

export interface ImmunizationAdminInspectorProps {
  intake?: ImmunizationIntakeRecord | null;
  entries: ImmunizationClinicalEntry[];
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof ImmunizationIntakeRecord, value: any) => void;
  onEntriesChange?: (updated: ImmunizationClinicalEntry[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function ImmunizationAdminInspector({
  intake,
  entries,
  isEditing = false,
  onIntakeFieldChange,
  onEntriesChange,
  validationErrors = {},
  onClearError
}: ImmunizationAdminInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<ImmunizationInspectorTab>('identitas');

  // Automatically switch tab to the first error section when validation errors are present
  React.useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const errorTab = getImmunizationTabWithErrors(validationErrors);
      if (errorTab) {
        setActiveTab(errorTab);
      }
    }
  }, [validationErrors]);

  const errorKeys = Object.keys(validationErrors);
  const hasIdentitasErrors = errorKeys.some((k) =>
    ['childName', 'childNik', 'childBirthDate', 'childSex'].includes(k)
  );
  const hasParentErrors = errorKeys.some((k) =>
    ['parentPhone', 'fatherName', 'motherName', 'childAddress'].includes(k)
  );
  const hasRiwayatErrors = errorKeys.some((k) =>
    ['previousVaccineHistory', 'childAllergyHistory'].includes(k)
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as ImmunizationInspectorTab)}
      className='w-full flex flex-col h-full min-h-0'
    >
      <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer relative truncate'>
          Identitas Anak
          {hasIdentitasErrors && (
            <span className='size-1.5 rounded-full bg-destructive absolute top-1.5 right-2' />
          )}
        </TabsTrigger>
        <TabsTrigger value='orang-tua' className='text-xs font-semibold cursor-pointer relative truncate'>
          Orang Tua & Alamat
          {hasParentErrors && (
            <span className='size-1.5 rounded-full bg-destructive absolute top-1.5 right-2' />
          )}
        </TabsTrigger>
        <TabsTrigger value='riwayat' className='text-xs font-semibold cursor-pointer relative truncate'>
          Riwayat Pasien
          {hasRiwayatErrors && (
            <span className='size-1.5 rounded-full bg-destructive absolute top-1.5 right-2' />
          )}
        </TabsTrigger>
        <TabsTrigger value='trajektori' className='text-xs font-semibold cursor-pointer truncate'>
          Trajektori 15 Vaksin
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col'>
        {/* TAB 1: IDENTITAS ANAK */}
        <TabsContent value='identitas' className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'>
          <ImmunizationChildIdentitySection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
            validationErrors={validationErrors}
            onClearError={onClearError}
          />
        </TabsContent>

        {/* TAB 2: ORANG TUA & ALAMAT */}
        <TabsContent value='orang-tua' className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'>
          <ImmunizationParentAddressSection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
            validationErrors={validationErrors}
            onClearError={onClearError}
          />
        </TabsContent>

        {/* TAB 3: RIWAYAT PASIEN */}
        <TabsContent value='riwayat' className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'>
          <ImmunizationHistorySection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
          />
        </TabsContent>

        {/* TAB 4: TRAJEKTORI 15 VAKSIN */}
        <TabsContent value='trajektori' className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'>
          <ImmunizationMilestoneTrajectorySection
            entries={entries}
            isEditing={isEditing}
            onEntriesChange={onEntriesChange}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
