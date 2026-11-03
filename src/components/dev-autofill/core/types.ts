export type PatientRelationshipTypeKey =
  | 'anak'
  | 'pasangan'
  | 'orang_tua'
  | 'diri_sendiri'
  | 'kerabat'
  | 'lainnya'
  | 'teman'
  | string;

export interface DynamicProfileOptions {
  relationship?: PatientRelationshipTypeKey;
  gender?: 'male' | 'female';
  ageMin?: number;
  ageMax?: number;
  bloodType?: string;
  occupationCode?: string;
  city?: string;
}

export interface GeneratedAddress {
  provinceName: string;
  provinceCode: string;
  regencyName: string;
  regencyCode: string;
  districtName: string;
  districtCode: string;
  villageName: string;
  villageCode: string;
  line1: string;
  fullAddress: string;
}

export interface GeneratedPatientProfile {
  relationship: string;
  relationshipLabel: string;
  fullName: string;
  nik: string;
  motherName: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodType: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  provinceName: string;
  provinceCode: string;
  regencyName: string;
  regencyCode: string;
  districtName: string;
  districtCode: string;
  villageName: string;
  villageCode: string;
  line1: string;
  fullAddress: string;
  occupationCode: string;
  occupationName: string;
}
