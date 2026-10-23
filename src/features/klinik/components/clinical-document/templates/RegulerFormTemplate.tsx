import React from 'react';
import { DocumentPage } from './DocumentPage';
import { RegulerHeader } from '../organisms/RegulerHeader';
import { RegulerEncounterSection } from '../organisms/RegulerEncounterSection';
import { RegulerIdentitySection } from '../organisms/RegulerIdentitySection';
import { RegulerClinicalNotesSection } from '../organisms/RegulerClinicalNotesSection';
import { RegulerSignSection } from '../organisms/RegulerSignSection';
import type { RegulerFormConfig, RegulerFormData } from '../types';
import { defaultRegulerConfig } from '../config/reguler-config';

export interface RegulerFormTemplateProps {
  data?: RegulerFormData | null;
  config?: RegulerFormConfig;
}

export const RegulerFormTemplate: React.FC<RegulerFormTemplateProps> = ({
  data = null,
  config = defaultRegulerConfig,
}) => {
  return (
    <DocumentPage>
      <RegulerHeader
        config={config.header}
        medicalRecordNumber={data?.medicalRecordNumber}
        registrationDate={data?.registrationDate}
        bookingCode={data?.bookingCode}
      />
      <RegulerEncounterSection data={data ?? undefined} />
      <RegulerIdentitySection
        identity={data?.identity}
        emergencyContact={data?.emergencyContact}
      />
      <RegulerClinicalNotesSection clinical={data?.clinical} />
      <RegulerSignSection
        doctorName={data?.doctorName}
        patientName={data?.identity?.fullName}
        registrationDate={data?.registrationDate}
      />
    </DocumentPage>
  );
};
