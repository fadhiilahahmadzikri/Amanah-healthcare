import type { MedicalFlowDefinition } from './medical-appointment-types';
import {
  domicileHealthCoverageSection,
  motherIdentitySection,
  partnerIdentitySection
} from './pregnancy-sections/identity-sections';
import {
  baselineMeasurementsSection,
  currentPregnancySection,
  diseaseHistorySection,
  riskFactorsSection
} from './pregnancy-sections/clinical-sections';
import {
  closingSection,
  contraceptionGatewaySection,
  contraceptionSections,
  obstetricSummarySection,
  previousPregnancySections
} from './pregnancy-sections/history-sections';

export const pregnancyFlowDefinition: MedicalFlowDefinition = {
  flow: 'pregnancy',
  formTitle: 'Form Awal Kehamilan - Praktik Mandiri Bidan Nur Hidayatun',
  formDescription:
    'Form ini membantu bidan menyiapkan data awal pemeriksaan. Isi sesuai data dan kondisi Anda.',
  serviceName: 'Kebidanan & Kandungan',
  visitType: 'Pemeriksaan Kehamilan',
  patientNameFieldId: 'motherName',
  patientContactFieldId: 'phoneNumber',
  complaintFieldId: 'currentComplaints',
  sections: [
    motherIdentitySection,
    domicileHealthCoverageSection,
    partnerIdentitySection,
    baselineMeasurementsSection,
    currentPregnancySection,
    riskFactorsSection,
    diseaseHistorySection,
    obstetricSummarySection,
    ...previousPregnancySections,
    contraceptionGatewaySection,
    ...contraceptionSections,
    closingSection
  ]
};
