import type { PatientMutationPayload } from './types';
import type { PatientRegistrationFormValues } from '../schemas/patient-registration-schema';

export const PATIENT_REGISTRATION_COMPLETED_COOKIE = 'patient_registration_completed';
export const PATIENT_REGISTRATION_COMPLETED_METADATA_KEY = 'patientRegistrationCompleted';

const DEFAULT_PATIENT_AVATAR = '/logo-symbol-only.png';
const DEFAULT_VISIT_LABEL = 'Belum ada kunjungan';
const MEDICAL_RECORD_PADDING = 4;
const WIB_TIME_ZONE = 'Asia/Jakarta';
const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
] as const;

type RegistrationUserDefaults = {
  email?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
};

type BuildPatientMutationPayloadInput = {
  values: PatientRegistrationFormValues;
  user: RegistrationUserDefaults;
  now: Date;
  nextRecordNumber: number;
};

type RegistrationCompletionSources = {
  unsafeMetadata?: Record<string, unknown> | null;
  publicMetadata?: Record<string, unknown> | null;
  completionCookie?: string | null;
};

type PatientRegistrationRedirectInput = {
  isAuthenticated: boolean;
  isRegistrationComplete: boolean;
  pathname: string;
};

type DateParts = {
  day: number;
  month: number;
  year: number;
  hour: string;
  minute: string;
};

export function buildPatientMutationPayload({
  values,
  user,
  now,
  nextRecordNumber
}: BuildPatientMutationPayloadInput): PatientMutationPayload {
  const address = formatDomicile(values);
  const registrationDateParts = getDatePartsInTimeZone(now);
  const email = user.email ?? '';
  const phone = user.phone ?? '';

  return {
    name: values.name,
    patient_id: buildMedicalRecordNumber(registrationDateParts.year, nextRecordNumber),
    nik: values.nik,
    nik_ktp: values.nik,
    nama_ibu_kandung: values.nama_ibu_kandung,
    tempat_lahir: values.tempat_lahir,
    pekerjaan: values.pekerjaan,
    domisili: address,
    nomor_telepon_wa: phone,
    email_pasien: email,
    phone,
    email,
    gender: values.gender,
    age: calculateAgeFromBirthDate(values.birth_date, now),
    birth_date: values.birth_date,
    tanggal_lahir: formatIsoDateForPatient(values.birth_date),
    blood_type: values.blood_type,
    address,
    avatar: user.imageUrl || DEFAULT_PATIENT_AVATAR,
    allergies: [],
    emergency_contact: '',
    medical_history: '',
    account_status: 'Aktif',
    tanggal_registrasi_akun: formatDateForPatient(registrationDateParts),
    login_pertama_kali: formatWibDateTime(registrationDateParts),
    kunjungan_terakhir: DEFAULT_VISIT_LABEL,
    total_kunjungan: 0
  };
}

export function calculateAgeFromBirthDate(birthDate: string, referenceDate: Date): number {
  const birthParts = parseIsoDate(birthDate);
  const referenceParts = getDatePartsInTimeZone(referenceDate);

  const birthdayHasPassed =
    referenceParts.month > birthParts.month ||
    (referenceParts.month === birthParts.month && referenceParts.day >= birthParts.day);

  return referenceParts.year - birthParts.year - (birthdayHasPassed ? 0 : 1);
}

export function hasCompletedPatientRegistration({
  unsafeMetadata,
  publicMetadata,
  completionCookie
}: RegistrationCompletionSources): boolean {
  return (
    completionCookie === 'true' ||
    unsafeMetadata?.[PATIENT_REGISTRATION_COMPLETED_METADATA_KEY] === true ||
    publicMetadata?.[PATIENT_REGISTRATION_COMPLETED_METADATA_KEY] === true
  );
}

export function getPatientRegistrationRedirectPath({
  isAuthenticated,
  isRegistrationComplete: _isRegistrationComplete,
  pathname
}: PatientRegistrationRedirectInput): string | null {
  if (!isAuthenticated) {
    return '/auth/sign-in';
  }

  // Treat patient registration as a modal barrier on dashboard; clean up direct route hits
  if (pathname.startsWith('/patient-registration')) {
    return '/dashboard/overview';
  }

  return null;
}

function buildMedicalRecordNumber(year: number, nextRecordNumber: number): string {
  return `RM-${year}-${String(nextRecordNumber).padStart(MEDICAL_RECORD_PADDING, '0')}`;
}

function formatDomicile(values: PatientRegistrationFormValues): string {
  return [
    values.alamat_detail,
    `Kel. ${values.kelurahan}`,
    `Kec. ${values.kecamatan}`,
    values.kabupaten,
    `Prov. ${values.provinsi}`
  ].join(', ');
}

function formatIsoDateForPatient(date: string): string {
  const { day, month, year } = parseIsoDate(date);
  return `${padDateNumber(day)}/${padDateNumber(month)}/${year}`;
}

function formatDateForPatient(parts: DateParts): string {
  return `${padDateNumber(parts.day)}/${padDateNumber(parts.month)}/${parts.year}`;
}

function formatWibDateTime(parts: DateParts): string {
  return `${parts.day} ${INDONESIAN_MONTHS[parts.month - 1]} ${parts.year}, ${parts.hour}:${parts.minute} WIB`;
}

function parseIsoDate(date: string) {
  const [year = 0, month = 0, day = 0] = date.split('-').map(Number);
  return { day, month, year };
}

function getDatePartsInTimeZone(date: Date): DateParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: WIB_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '0';

  return {
    day: Number(getPart('day')),
    month: Number(getPart('month')),
    year: Number(getPart('year')),
    hour: getPart('hour'),
    minute: getPart('minute')
  };
}

function padDateNumber(value: number): string {
  return String(value).padStart(2, '0');
}
