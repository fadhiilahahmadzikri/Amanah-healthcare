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
  getImmunizationTabErrorCounts,
  getImmunizationDomIdForErrorKey,
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

  // Automatically switch tab to the first error section and scroll to the first invalid field
  React.useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const errorTab = getImmunizationTabWithErrors(validationErrors);
      if (errorTab) {
        setActiveTab(errorTab);
      }

      const firstErrorKey = Object.keys(validationErrors)[0];
      const domId = getImmunizationDomIdForErrorKey(firstErrorKey);

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
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [validationErrors]);

  const tabErrorCounts = React.useMemo(
    () => getImmunizationTabErrorCounts(validationErrors),
    [validationErrors]
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as ImmunizationInspectorTab)}
      className='w-full flex flex-col h-full min-h-0'
    >
      <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger
          value='identitas'
          className='text-xs font-semibold cursor-pointer truncate relative flex items-center justify-center gap-1.5'
        >
          <span>Identitas Anak</span>
          {tabErrorCounts.identitas > 0 && (
            <span className='px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground min-w-4 text-center leading-none'>
              {tabErrorCounts.identitas}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value='orang-tua'
          className='text-xs font-semibold cursor-pointer truncate relative flex items-center justify-center gap-1.5'
        >
          <span>Orang Tua & Alamat</span>
          {tabErrorCounts['orang-tua'] > 0 && (
            <span className='px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground min-w-4 text-center leading-none'>
              {tabErrorCounts['orang-tua']}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value='riwayat'
          className='text-xs font-semibold cursor-pointer truncate relative flex items-center justify-center gap-1.5'
        >
          <span>Riwayat Pasien</span>
          {tabErrorCounts.riwayat > 0 && (
            <span className='px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground min-w-4 text-center leading-none'>
              {tabErrorCounts.riwayat}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value='trajektori'
          className='text-xs font-semibold cursor-pointer truncate relative flex items-center justify-center gap-1.5'
        >
          <span>Trajektori 15 Vaksin</span>
          {tabErrorCounts.trajektori > 0 && (
            <span className='px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground min-w-4 text-center leading-none'>
              {tabErrorCounts.trajektori}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col'>
        {/* TAB 1: IDENTITAS ANAK */}
        <TabsContent
          value='identitas'
          className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'
        >
          <ImmunizationChildIdentitySection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
            validationErrors={validationErrors}
            onClearError={onClearError}
          />
        </TabsContent>

        {/* TAB 2: ORANG TUA & ALAMAT */}
        <TabsContent
          value='orang-tua'
          className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'
        >
          <ImmunizationParentAddressSection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
            validationErrors={validationErrors}
            onClearError={onClearError}
          />
        </TabsContent>

        {/* TAB 3: RIWAYAT PASIEN */}
        <TabsContent
          value='riwayat'
          className='m-0 outline-none flex-1 min-h-0 flex flex-col h-full'
        >
          <ImmunizationHistorySection
            intake={intake}
            isEditing={isEditing}
            onIntakeFieldChange={onIntakeFieldChange}
          />
        </TabsContent>

        {/* TAB 4: TRAJEKTORI 15 VAKSIN */}
        <TabsContent value='trajektori' className='m-0 outline-none w-full min-h-0'>
          <ImmunizationMilestoneTrajectorySection
            entries={entries}
            isEditing={isEditing}
            onEntriesChange={onEntriesChange}
            childBirthDate={intake?.childBirthDate}
            validationErrors={validationErrors}
            onClearError={onClearError}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
