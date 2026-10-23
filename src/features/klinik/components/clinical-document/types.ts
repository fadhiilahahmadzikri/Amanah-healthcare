export type ClinicalDocumentType = 'pmb' | 'imunisasi' | 'reguler';
export type ClinicalFormFlow = 'pregnancy' | 'immunization' | 'regular';

// ==========================================
// 1. PMB (Praktik Mandiri Bidan - ANC & KB)
// ==========================================

export interface PmbClinicLine {
  text: string;
  bold?: boolean;
  size?: number;
}

export interface PmbHeaderConfig {
  leftBoxWidth: number;
  centerWidth: number;
  rightBoxWidth: number;
  height: number;
  logoHeight: number;
  rmRowHeight: number;
  rmInset: number;
  allergyTopGap: number;
  clinicLines: PmbClinicLine[];
  rmRows: string[];
  allergyLabel: string;
}

export interface PmbIdentityConfig {
  columns: number[];
  topRows: string[][];
  fullRows: string[];
  locationLabels: string[];
  measurementRows: string[][];
}

export interface PmbAnamnesaConfig {
  leftWidth: number;
  rightWidth: number;
  prompts: string[];
  riskTitle: string;
  riskColumns: number[];
  riskGrid: string[][];
  environmentLabel: string;
  otherLabel: string;
  diseaseColumns: number[];
  otherDashedRows: number;
  integratedBlankRows: number;
  diseases: string[];
}

export interface PmbObstetriConfig {
  title: string;
  pregnancyFields: string[];
  columns: number[];
  headers: string[];
  blankRows: number;
}

export interface PmbKbConfig {
  title: string;
  columns: number[];
  headers: string[];
  blankRows: number;
}

export interface PmbTypographyConfig {
  font: string;
  body: number;
  small: number;
  identity: number;
  section: number;
  title: number;
}

export interface PmbPageConfig {
  size: {
    width: number;
    height: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentWidth: number;
}

export interface PmbLayoutConfig {
  sectionLabelBefore: number;
  sectionLabelAfter: number;
  obstetriTitleBefore: number;
}

export interface PmbFormConfig {
  page: PmbPageConfig;
  typography: PmbTypographyConfig;
  layout: PmbLayoutConfig;
  header: PmbHeaderConfig;
  identity: PmbIdentityConfig;
  anamnesa: PmbAnamnesaConfig;
  obstetri: PmbObstetriConfig;
  kb: PmbKbConfig;
}

export interface DiseaseRecord {
  status: 'ya' | 'tidak' | '';
  year?: string;
}

export interface PmbFormData {
  header?: {
    allergy?: string;
    rmAncCode?: string;
  };
  identity?: {
    topRowValues?: (string | undefined)[][];
    fullRowValues?: (string | undefined)[];
    locationValues?: (string | undefined)[];
    measurementValues?: (string | undefined)[][];
  };
  anamnesa?: {
    promptValues?: (string | undefined)[];
    riskChecked?: Record<string, boolean>;
    environment?: string;
    otherLines?: string[];
    diseaseHistory?: Record<string, DiseaseRecord>;
  };
  pregnancyFields?: Record<string, string>;
  obstetriRows?: (string | undefined)[][];
  kbRows?: (string | undefined)[][];
}

// ==========================================
// 2. Imunisasi Anak (Amanah Health Care)
// ==========================================

export interface ImunisasiTypographyConfig {
  font: string;
  title: number;
  subtitle: number;
  body: number;
  small: number;
  tableHeader: number;
}

export interface ImunisasiPageConfig {
  size: {
    width: number;
    height: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentWidth: number;
}

export interface ImunisasiHeaderConfig {
  height: number;
  titleWidth: number;
  codeWidth: number;
  topBoxWidth: number;
  topBoxHeight: number;
  numberBoxCount: number;
  numberBoxWidth: number;
  numberBoxHeight: number;
  title: string;
  subtitle: string;
}

export interface ImunisasiIdentityRowConfig {
  leftLabel: string;
  leftValue?: string;
  rightLabel: string;
  rightValue?: string;
}

export interface ImunisasiIdentityConfig {
  columns: number[];
  rowHeight: number;
  rows: ImunisasiIdentityRowConfig[];
}

export interface ImunisasiPreTableConfig {
  columns: number[];
  leftLabel: string;
  rightLabel: string;
  height: number;
}

export interface VaccineItem {
  left: string;
  right?: string;
}

export interface VaccineRowDefinition {
  vaccine: VaccineItem[];
  separatorAfter?: boolean;
}

export interface ImunisasiVaccineTableConfig {
  columns: number[];
  headerHeight: number;
  rowHeight: number;
  headers: string[];
  subjective: string[];
  objective: string[];
  rows: VaccineRowDefinition[];
}

export interface ImunisasiFormConfig {
  page: ImunisasiPageConfig;
  typography: ImunisasiTypographyConfig;
  header: ImunisasiHeaderConfig;
  identity: ImunisasiIdentityConfig;
  preTable: ImunisasiPreTableConfig;
  vaccineTable: ImunisasiVaccineTableConfig;
}

export interface VaccineRowData {
  injectionDate?: string;
  age?: string;
  subjective?: string[];
  objective?: string[];
  planning?: string;
}

export interface ImunisasiFormData {
  header?: {
    topCode?: string;
    recordDigits?: (string | undefined)[];
  };
  identity?: {
    leftValues?: (string | undefined)[];
    rightValues?: (string | undefined)[];
  };
  preTable?: {
    previousVaccines?: string;
    allergy?: string;
  };
  vaccineRows?: (VaccineRowData | undefined)[];
}

// ==========================================
// 3. Reguler / Rawat Jalan / Pendaftaran Pasien Umum
// ==========================================

export interface RegulerHeaderConfig {
  clinicName: string;
  clinicTagline: string;
  clinicAddress: string;
  clinicContact: string;
  formTitle: string;
  formSubtitle: string;
}

export interface RegulerFormConfig {
  header: RegulerHeaderConfig;
}

export interface RegulerFormData {
  medicalRecordNumber?: string;
  registrationDate?: string;
  bookingCode?: string;
  queueNumber?: string;
  serviceName?: string;
  doctorName?: string;
  scheduledTime?: string;
  identity?: {
    nik?: string;
    fullName?: string;
    gender?: string;
    birthDate?: string;
    birthPlace?: string;
    age?: string;
    bloodType?: string;
    motherName?: string;
    occupation?: string;
    religion?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    relationship?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  clinical?: {
    chiefComplaint?: string;
    allergyHistory?: string;
    vitalHeightCm?: string;
    vitalWeightKg?: string;
    vitalBloodPressure?: string;
    additionalNotes?: string;
  };
}
