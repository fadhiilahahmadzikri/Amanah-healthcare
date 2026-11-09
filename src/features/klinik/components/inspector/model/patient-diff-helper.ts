import type { PatientMutationPayload } from '@/features/data-pasien/api/types';
import type { Gender } from '@/constants/gender.constants';
import type { EditableMaternalData, EditableImmunizationData, EditableRegularData } from '../types';

function getCleanDiffValue(
  newVal: string | null | undefined,
  oldVal: string | null | undefined
): string | undefined {
  const normalizedNew = newVal?.trim() || '';
  const normalizedOld = oldVal?.trim() || '';
  if (normalizedNew === normalizedOld) return undefined;
  return normalizedNew;
}

export function getMaternalPatientDiff(
  formData: EditableMaternalData,
  initialMaternal: EditableMaternalData
): Partial<PatientMutationPayload> {
  const diffPayload: Partial<PatientMutationPayload> = {};

  const check = (
    key: keyof PatientMutationPayload,
    newVal: string | null | undefined,
    oldVal: string | null | undefined
  ) => {
    const val = getCleanDiffValue(newVal, oldVal);
    if (val !== undefined) {
      diffPayload[key] = val as any;
    }
  };

  check('name', formData.motherName, initialMaternal.motherName);
  check('nik', formData.motherNik, initialMaternal.motherNik);
  check('medical_record_number', formData.medicalRecordNumber, initialMaternal.medicalRecordNumber);
  check('birth_place', formData.birthPlace, initialMaternal.birthPlace);
  check('birth_date', formData.motherBirthDate, initialMaternal.motherBirthDate);
  check('occupation', formData.motherJob, initialMaternal.motherJob);
  check('phone', formData.phoneNumber, initialMaternal.phoneNumber);
  check(
    'line1',
    formData.line1 || formData.domicileAddress,
    initialMaternal.line1 || initialMaternal.domicileAddress
  );
  check('province_name', formData.provinceName, initialMaternal.provinceName);
  check('province_code', formData.provinceCode, initialMaternal.provinceCode);
  check('regency_name', formData.regencyName, initialMaternal.regencyName);
  check('regency_code', formData.regencyCode, initialMaternal.regencyCode);
  check('district_name', formData.districtName, initialMaternal.districtName);
  check('district_code', formData.districtCode, initialMaternal.districtCode);
  check('village_name', formData.villageName, initialMaternal.villageName);
  check('village_code', formData.villageCode, initialMaternal.villageCode);

  if (formData.motherBloodType !== initialMaternal.motherBloodType) {
    diffPayload.blood_type = (formData.motherBloodType as any) || '';
  }

  return diffPayload;
}

export function getImmunizationPatientDiff(
  formData: EditableImmunizationData,
  initialChild: EditableImmunizationData
): Partial<PatientMutationPayload> {
  const diffPayload: Partial<PatientMutationPayload> = {};

  const check = (
    key: keyof PatientMutationPayload,
    newVal: string | null | undefined,
    oldVal: string | null | undefined
  ) => {
    const val = getCleanDiffValue(newVal, oldVal);
    if (val !== undefined) {
      diffPayload[key] = val as any;
    }
  };

  check('name', formData.childName, initialChild.childName);
  check('nik', formData.childNik, initialChild.childNik);
  check('medical_record_number', formData.medicalRecordNumber, initialChild.medicalRecordNumber);
  check('birth_place', formData.birthPlace, initialChild.birthPlace);
  check('birth_date', formData.childBirthDate, initialChild.childBirthDate);
  check('mother_name', formData.motherName, initialChild.motherName);
  check('phone', formData.parentPhone, initialChild.parentPhone);
  check(
    'line1',
    formData.line1 || formData.childAddress,
    initialChild.line1 || initialChild.childAddress
  );
  check('province_name', formData.provinceName, initialChild.provinceName);
  check('province_code', formData.provinceCode, initialChild.provinceCode);
  check('regency_name', formData.regencyName, initialChild.regencyName);
  check('regency_code', formData.regencyCode, initialChild.regencyCode);
  check('district_name', formData.districtName, initialChild.districtName);
  check('district_code', formData.districtCode, initialChild.districtCode);
  check('village_name', formData.villageName, initialChild.villageName);
  check('village_code', formData.villageCode, initialChild.villageCode);

  if (formData.childSex !== initialChild.childSex) {
    diffPayload.gender = (formData.childSex as Gender) || '';
  }

  return diffPayload;
}

export function getRegularPatientDiff(
  formData: EditableRegularData,
  initialRegular: EditableRegularData
): Partial<PatientMutationPayload> {
  const diffPayload: Partial<PatientMutationPayload> = {};

  const check = (
    key: keyof PatientMutationPayload,
    newVal: string | null | undefined,
    oldVal: string | null | undefined
  ) => {
    const val = getCleanDiffValue(newVal, oldVal);
    if (val !== undefined) {
      diffPayload[key] = val as any;
    }
  };

  check('name', formData.fullName, initialRegular.fullName);
  check('nik', formData.nik, initialRegular.nik);
  check('medical_record_number', formData.medicalRecordNumber, initialRegular.medicalRecordNumber);
  check('birth_place', formData.birthPlace, initialRegular.birthPlace);
  check('birth_date', formData.birthDate, initialRegular.birthDate);
  check('mother_name', formData.motherName, initialRegular.motherName);
  check('occupation', formData.occupation, initialRegular.occupation);
  check('phone', formData.phone, initialRegular.phone);
  check('email', formData.email, initialRegular.email);
  check('line1', formData.line1, initialRegular.line1);
  check('province_name', formData.provinceName, initialRegular.provinceName);
  check('province_code', formData.provinceCode, initialRegular.provinceCode);
  check('regency_name', formData.regencyName, initialRegular.regencyName);
  check('regency_code', formData.regencyCode, initialRegular.regencyCode);
  check('district_name', formData.districtName, initialRegular.districtName);
  check('district_code', formData.districtCode, initialRegular.districtCode);
  check('village_name', formData.villageName, initialRegular.villageName);
  check('village_code', formData.villageCode, initialRegular.villageCode);
  check('relationshipTypeId', formData.relationshipTypeId, initialRegular.relationshipTypeId);
  check('relationshipType', formData.relationshipType, initialRegular.relationshipType);
  check('emergencyContactName', formData.emergencyContactName, initialRegular.emergencyContactName);
  check('emergencyContactPhone', formData.emergencyContactPhone, initialRegular.emergencyContactPhone);
  check(
    'emergencyContactRelationship',
    formData.emergencyContactRelationship,
    initialRegular.emergencyContactRelationship
  );

  if (formData.gender !== initialRegular.gender) {
    diffPayload.gender = (formData.gender as any) || '';
  }
  if (formData.bloodType !== initialRegular.bloodType) {
    diffPayload.blood_type = (formData.bloodType as any) || '';
  }
  if (formData.emergencyContactPhone !== initialRegular.emergencyContactPhone) {
    diffPayload.emergency_contact = formData.emergencyContactPhone?.trim() || '';
  }

  return diffPayload;
}
