import type { PatientMutationPayload } from '@/features/data-pasien/api/types';
import type { Gender } from '@/constants/gender.constants';
import type {
  EditableMaternalData,
  EditableImmunizationData,
  EditableRegularData
} from '../types';

export function getMaternalPatientDiff(
  formData: EditableMaternalData,
  initialMaternal: EditableMaternalData
): Partial<PatientMutationPayload> {
  const diffPayload: Partial<PatientMutationPayload> = {};

  if (formData.motherName !== initialMaternal.motherName) {
    diffPayload.name = formData.motherName?.trim() || undefined;
  }
  if (formData.motherNik !== initialMaternal.motherNik) {
    diffPayload.nik = formData.motherNik?.trim() || undefined;
  }
  if (formData.medicalRecordNumber !== initialMaternal.medicalRecordNumber) {
    diffPayload.medical_record_number = formData.medicalRecordNumber?.trim() || undefined;
  }
  if (formData.birthPlace !== initialMaternal.birthPlace) {
    diffPayload.birth_place = formData.birthPlace?.trim() || undefined;
  }
  if (formData.motherBirthDate !== initialMaternal.motherBirthDate) {
    diffPayload.birth_date = formData.motherBirthDate || undefined;
  }
  if (formData.motherBloodType !== initialMaternal.motherBloodType) {
    diffPayload.blood_type = (formData.motherBloodType as any) || undefined;
  }
  if (formData.motherJob !== initialMaternal.motherJob) {
    diffPayload.occupation = formData.motherJob?.trim() || undefined;
  }
  if (formData.phoneNumber !== initialMaternal.phoneNumber) {
    diffPayload.phone = formData.phoneNumber?.trim() || undefined;
  }
  if (formData.line1 !== initialMaternal.line1) {
    diffPayload.line1 = formData.line1 ? formData.line1.trim() : '';
  } else if (formData.domicileAddress !== initialMaternal.domicileAddress) {
    diffPayload.line1 = formData.domicileAddress?.trim() || undefined;
  }
  if (formData.provinceName !== initialMaternal.provinceName) {
    diffPayload.province_name = formData.provinceName || undefined;
  }
  if (formData.provinceCode !== initialMaternal.provinceCode) {
    diffPayload.province_code = formData.provinceCode || undefined;
  }
  if (formData.regencyName !== initialMaternal.regencyName) {
    diffPayload.regency_name = formData.regencyName || undefined;
  }
  if (formData.regencyCode !== initialMaternal.regencyCode) {
    diffPayload.regency_code = formData.regencyCode || undefined;
  }
  if (formData.districtName !== initialMaternal.districtName) {
    diffPayload.district_name = formData.districtName || undefined;
  }
  if (formData.districtCode !== initialMaternal.districtCode) {
    diffPayload.district_code = formData.districtCode || undefined;
  }
  if (formData.villageName !== initialMaternal.villageName) {
    diffPayload.village_name = formData.villageName || undefined;
  }
  if (formData.villageCode !== initialMaternal.villageCode) {
    diffPayload.village_code = formData.villageCode || undefined;
  }

  return diffPayload;
}

export function getImmunizationPatientDiff(
  formData: EditableImmunizationData,
  initialChild: EditableImmunizationData
): Partial<PatientMutationPayload> {
  const diffPayload: Partial<PatientMutationPayload> = {};

  if (formData.childName !== initialChild.childName) {
    diffPayload.name = formData.childName?.trim() || undefined;
  }
  if (formData.childNik !== initialChild.childNik) {
    diffPayload.nik = formData.childNik?.trim() || undefined;
  }
  if (formData.medicalRecordNumber !== initialChild.medicalRecordNumber) {
    diffPayload.medical_record_number = formData.medicalRecordNumber?.trim() || undefined;
  }
  if (formData.birthPlace !== initialChild.birthPlace) {
    diffPayload.birth_place = formData.birthPlace?.trim() || undefined;
  }
  if (formData.childBirthDate !== initialChild.childBirthDate) {
    diffPayload.birth_date = formData.childBirthDate || undefined;
  }
  if (formData.childSex !== initialChild.childSex) {
    diffPayload.gender = formData.childSex as Gender;
  }
  if (formData.motherName !== initialChild.motherName) {
    diffPayload.mother_name = formData.motherName?.trim() || undefined;
  }
  if (formData.parentPhone !== initialChild.parentPhone) {
    diffPayload.phone = formData.parentPhone?.trim() || undefined;
  }
  if (formData.childAddress !== initialChild.childAddress) {
    diffPayload.line1 = formData.childAddress?.trim() || undefined;
  }

  return diffPayload;
}

export function getRegularPatientDiff(
  formData: EditableRegularData,
  initialRegular: EditableRegularData
): Partial<PatientMutationPayload> {
  const diffPayload: Partial<PatientMutationPayload> = {};

  if (formData.fullName !== initialRegular.fullName) {
    diffPayload.name = formData.fullName?.trim() || undefined;
  }
  if (formData.nik !== initialRegular.nik) {
    diffPayload.nik = formData.nik?.trim() || undefined;
  }
  if (formData.medicalRecordNumber !== initialRegular.medicalRecordNumber) {
    diffPayload.medical_record_number = formData.medicalRecordNumber?.trim() || undefined;
  }
  if (formData.birthPlace !== initialRegular.birthPlace) {
    diffPayload.birth_place = formData.birthPlace?.trim() || undefined;
  }
  if (formData.birthDate !== initialRegular.birthDate) {
    diffPayload.birth_date = formData.birthDate || undefined;
  }
  if (formData.gender !== initialRegular.gender) {
    diffPayload.gender = (formData.gender as any) || undefined;
  }
  if (formData.bloodType !== initialRegular.bloodType) {
    diffPayload.blood_type = (formData.bloodType as any) || undefined;
  }
  if (formData.motherName !== initialRegular.motherName) {
    diffPayload.mother_name = formData.motherName?.trim() || undefined;
  }
  if (formData.occupation !== initialRegular.occupation) {
    diffPayload.occupation = formData.occupation?.trim() || undefined;
  }
  if (formData.phone !== initialRegular.phone) {
    diffPayload.phone = formData.phone?.trim() || undefined;
  }
  if (formData.email !== initialRegular.email) {
    diffPayload.email = formData.email ? formData.email.trim() : '';
  }
  if (formData.line1 !== initialRegular.line1) {
    diffPayload.line1 = formData.line1 ? formData.line1.trim() : '';
  }
  if (formData.provinceName !== initialRegular.provinceName) {
    diffPayload.province_name = formData.provinceName || undefined;
  }
  if (formData.provinceCode !== initialRegular.provinceCode) {
    diffPayload.province_code = formData.provinceCode || undefined;
  }
  if (formData.regencyName !== initialRegular.regencyName) {
    diffPayload.regency_name = formData.regencyName || undefined;
  }
  if (formData.regencyCode !== initialRegular.regencyCode) {
    diffPayload.regency_code = formData.regencyCode || undefined;
  }
  if (formData.districtName !== initialRegular.districtName) {
    diffPayload.district_name = formData.districtName || undefined;
  }
  if (formData.districtCode !== initialRegular.districtCode) {
    diffPayload.district_code = formData.districtCode || undefined;
  }
  if (formData.villageName !== initialRegular.villageName) {
    diffPayload.village_name = formData.villageName || undefined;
  }
  if (formData.villageCode !== initialRegular.villageCode) {
    diffPayload.village_code = formData.villageCode || undefined;
  }
  if (formData.emergencyContactPhone !== initialRegular.emergencyContactPhone) {
    diffPayload.emergency_contact = formData.emergencyContactPhone?.trim() || undefined;
    diffPayload.emergencyContactPhone = formData.emergencyContactPhone?.trim() || undefined;
  }
  if (formData.emergencyContactName !== initialRegular.emergencyContactName) {
    diffPayload.emergencyContactName = formData.emergencyContactName?.trim() || undefined;
  }
  if (formData.emergencyContactRelationship !== initialRegular.emergencyContactRelationship) {
    diffPayload.emergencyContactRelationship = formData.emergencyContactRelationship?.trim() || undefined;
  }

  return diffPayload;
}
