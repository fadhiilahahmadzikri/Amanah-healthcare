export interface MaternalConditionDefinition {
  code: string;
  name: string;
  docLabel: string;
  questionPrompt: string;
}

export const CANONICAL_MATERNAL_CONDITIONS: readonly MaternalConditionDefinition[] = [
  { code: 'HYPERTENSION', name: 'Hipertensi / Tekanan Darah Tinggi', docLabel: 'Hipertensi', questionPrompt: 'Apakah Anda pernah atau sedang mengalami tekanan darah tinggi/hipertensi?' },
  { code: 'HEART_DISEASE', name: 'Penyakit Jantung', docLabel: 'Jantung', questionPrompt: 'Apakah Anda pernah diberi tahu memiliki masalah jantung?' },
  { code: 'THYROID_DISEASE', name: 'Masalah Tiroid', docLabel: 'Tiroid', questionPrompt: 'Apakah Anda pernah diberi tahu memiliki masalah tiroid?' },
  { code: 'AUTOIMMUNE', name: 'Penyakit Autoimun', docLabel: 'Autoimun', questionPrompt: 'Apakah Anda pernah diberi tahu memiliki penyakit autoimun?' },
  { code: 'DIABETES', name: 'Diabetes / Kencing Manis', docLabel: 'Diabetes', questionPrompt: 'Apakah Anda pernah atau sedang mengalami diabetes/kencing manis?' },
  { code: 'ASTHMA', name: 'Asma / Sesak Napas', docLabel: 'Asma', questionPrompt: 'Apakah Anda pernah atau sedang mengalami asma?' },
  { code: 'TUBERCULOSIS', name: 'TBC (Tuberkulosis)', docLabel: 'TBC', questionPrompt: 'Apakah Anda pernah atau sedang mengalami TBC?' },
  { code: 'HEPATITIS_B', name: 'Hepatitis B', docLabel: 'Hepatitis B', questionPrompt: 'Apakah Anda pernah diberi tahu mengalami Hepatitis B?' },
  { code: 'HIV_SYPHILIS', name: 'HIV atau Sifilis', docLabel: 'HIV/Sifilis', questionPrompt: 'Apakah Anda pernah diberi tahu mengalami HIV atau sifilis?' },
  { code: 'MENTAL_HEALTH', name: 'Kesehatan Jiwa / Depresi', docLabel: 'Jiwa', questionPrompt: 'Apakah Anda pernah atau sedang mendapat bantuan untuk masalah kesehatan jiwa?' },
  { code: 'TWIN_PREGNANCY', name: 'Riwayat Hamil Kembar', docLabel: 'Riwayat Gemelli', questionPrompt: 'Apakah Anda pernah hamil kembar?' },
  { code: 'CYST_MYOMA_TUMOR', name: 'Kista, Miom, atau Tumor Kandungan', docLabel: 'Kista/Miom/Tumor', questionPrompt: 'Apakah Anda pernah diberi tahu memiliki kista, miom, atau tumor?' },
  { code: 'SURGERY', name: 'Riwayat Operasi Caesar / Panggul', docLabel: 'Operasi', questionPrompt: 'Apakah Anda pernah menjalani operasi?' },
  { code: 'OTHER', name: 'Penyakit Lainnya', docLabel: '', questionPrompt: 'Apakah Anda memiliki riwayat penyakit lain yang belum disebutkan di atas?' },
] as const;

export const TETANUS_STATUS_OPTIONS: readonly string[] = [
  'Belum pernah',
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
] as const;

export const DELIVERY_METHOD_OPTIONS: readonly string[] = [
  'Normal / Spontan',
  'Sectio Caesarea (SC)',
  'Vakum',
  'Forsep',
  'Lainnya',
] as const;

export const BIRTH_ATTENDANT_OPTIONS: readonly string[] = [
  'Bidan',
  'Dokter Spesialis Obgyn',
  'Dokter Umum',
] as const;

export const DELIVERY_PLACE_OPTIONS: readonly string[] = [
  'Puskesmas',
  'Klinik / PMB',
  'Rumah Sakit',
  'Rumah Sendiri',
] as const;

export const CONTRACEPTIVE_TYPE_OPTIONS: readonly string[] = [
  'Suntik 3 Bulan',
  'Suntik 1 Bulan',
  'Pil KB',
  'IUD / Spiral',
  'Implan / Susuk',
  'Kondom',
  'MOW / Tubektomi',
  'MOP / Vasektomi',
  'Alami / Kalender',
  'Lainnya',
] as const;

export const MATERNAL_SMOKING_HABIT_OPTIONS = [
  { value: 'Tidak', label: 'Tidak Pernah' },
  { value: 'Pasif', label: 'Perokok Pasif (Suami/Keluarga)' },
  { value: 'Aktif', label: 'Aktif Merokok' }
] as const;

export function getMaternalSmokingLabel(val?: string | null): string {
  if (val === 'Tidak') return 'Tidak Pernah';
  if (val === 'Pasif') return 'Perokok Pasif (Suami/Keluarga)';
  if (val === 'Aktif') return 'Aktif Merokok';
  return val || '-';
}
