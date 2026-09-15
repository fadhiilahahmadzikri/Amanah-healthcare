import type { MedicalAppointmentFlow } from '../api/types';

export type MedicalFieldType = 'TEXT' | 'PARAGRAPH' | 'DATE' | 'MULTIPLE_CHOICE' | 'LIST';

export interface MedicalFormField {
  id: string;
  type: MedicalFieldType;
  title: string;
  label: string;
  helpText: string;
  placeholder?: string;
  required: boolean;
  choices: string[];
  goToSectionIdByChoice: Record<string, string> | null;
  colSpan?: 1 | 2 | 'full';
  yearFieldId?: string;
  notesFieldId?: string;
  disabled?: boolean;
}

export interface MedicalFormSection {
  id: string;
  title: string;
  description: string;
  fields: MedicalFormField[];
  layout?: 'grid' | 'stack' | 'questionnaire';
}

export interface MedicalFlowDefinition {
  flow: MedicalAppointmentFlow;
  formTitle: string;
  formDescription: string;
  serviceName: string;
  visitType: string;
  patientNameFieldId: string;
  patientContactFieldId: string;
  complaintFieldId: string;
  sections: MedicalFormSection[];
}

const TEXT = 'TEXT';
const PARAGRAPH = 'PARAGRAPH';
const DATE = 'DATE';
const MULTIPLE_CHOICE = 'MULTIPLE_CHOICE';
const LIST = 'LIST';

const yesNoChoices = ['Tidak', 'Ya'];
const educationChoices = ['Tidak sekolah', 'SD', 'SMP', 'SMA/SMK', 'D1-D3', 'S1', 'S2/S3'];
const bloodTypeChoices = ['A', 'B', 'AB', 'O'];

function field(
  id: string,
  type: MedicalFieldType,
  title: string,
  label: string,
  options?: Partial<
    Pick<
      MedicalFormField,
      | 'helpText'
      | 'required'
      | 'choices'
      | 'goToSectionIdByChoice'
      | 'colSpan'
      | 'yearFieldId'
      | 'notesFieldId'
      | 'placeholder'
      | 'disabled'
    >
  >
): MedicalFormField {
  return {
    id,
    type,
    title,
    label,
    helpText: options?.helpText || '',
    placeholder: options?.placeholder,
    required: options?.required !== false,
    choices: options?.choices || [],
    goToSectionIdByChoice: options?.goToSectionIdByChoice || null,
    colSpan: options?.colSpan || (type === 'PARAGRAPH' ? 'full' : 1),
    yearFieldId: options?.yearFieldId,
    notesFieldId: options?.notesFieldId,
    disabled: options?.disabled
  };
}

function optionalField(
  id: string,
  type: MedicalFieldType,
  title: string,
  label: string,
  options?: Partial<
    Pick<
      MedicalFormField,
      | 'helpText'
      | 'choices'
      | 'goToSectionIdByChoice'
      | 'colSpan'
      | 'yearFieldId'
      | 'notesFieldId'
      | 'placeholder'
      | 'disabled'
    >
  >
): MedicalFormField {
  return field(id, type, title, label, { ...options, required: false });
}

function yesNoField(
  id: string,
  title: string,
  label: string,
  helpText = '',
  yearFieldId?: string
): MedicalFormField {
  return field(id, MULTIPLE_CHOICE, title, label, {
    helpText,
    choices: yesNoChoices,
    yearFieldId
  });
}

function diseaseStatusFields(config: {
  statusId: string;
  notesId: string;
  statusTitle: string;
  statusLabel: string;
  notesTitle: string;
  notesLabel: string;
  statusHelpText?: string;
}): MedicalFormField[] {
  return [
    field(config.statusId, MULTIPLE_CHOICE, config.statusTitle, config.statusLabel, {
      helpText: config.statusHelpText || '',
      choices: yesNoChoices,
      yearFieldId: config.notesId
    }),
    optionalField(
      config.notesId,
      TEXT,
      `Tahun terdiagnosis ${config.statusLabel}`,
      `${config.statusLabel} - tahun`,
      {
        helpText: 'Tahun terdiagnosis atau dialami. Contoh: 2021.'
      }
    )
  ];
}

function previousPregnancyFields(order: number): MedicalFormField[] {
  const prefix = `previousPregnancy${order}`;
  const labelPrefix = `Riwayat ${order}`;

  return [
    field(
      `${prefix}BirthYear`,
      TEXT,
      'Tahun lahir atau tahun berakhir',
      `${labelPrefix} - tahun lahir`,
      {
        helpText: 'Tuliskan tahun lahir atau tahun berakhir kehamilan. Contoh: 2024.',
        placeholder: 'Contoh: 2024',
        colSpan: 1
      }
    ),
    field(`${prefix}BirthWeight`, TEXT, 'Berat lahir bayi', `${labelPrefix} - berat lahir`, {
      helpText: 'Berat lahir bayi saat lahir. Contoh: 3100 gram.',
      placeholder: 'Contoh: 3100 gram',
      colSpan: 1
    }),
    field(`${prefix}BirthLength`, TEXT, 'Panjang lahir bayi', `${labelPrefix} - panjang lahir`, {
      helpText: 'Panjang badan bayi saat lahir. Contoh: 49 cm.',
      placeholder: 'Contoh: 49 cm',
      colSpan: 1
    }),
    field(`${prefix}ChildSex`, LIST, 'Jenis kelamin bayi', `${labelPrefix} - jenis kelamin`, {
      choices: ['Laki-laki', 'Perempuan'],
      colSpan: 1
    }),
    field(
      `${prefix}GestationalAgeAtBirth`,
      TEXT,
      'Usia kehamilan saat lahir',
      `${labelPrefix} - usia kehamilan`,
      {
        helpText: 'Usia kehamilan saat bayi lahir. Contoh: 39 minggu.',
        placeholder: 'Contoh: 39 minggu',
        colSpan: 1
      }
    ),
    field(`${prefix}BirthAttendant`, TEXT, 'Ditolong oleh siapa?', `${labelPrefix} - penolong`, {
      helpText: 'Contoh: bidan, dokter, atau rumah sakit.',
      placeholder: 'Contoh: Bidan, Dokter',
      colSpan: 1
    }),
    field(`${prefix}DeliveryMethod`, LIST, 'Cara persalinan', `${labelPrefix} - cara persalinan`, {
      choices: ['Normal/spontan', 'Operasi caesar', 'Vakum/forceps', 'Keguguran', 'Lainnya'],
      colSpan: 1
    }),
    field(`${prefix}DeliveryPlace`, TEXT, 'Tempat persalinan', `${labelPrefix} - tempat`, {
      helpText: 'Contoh: PMB, puskesmas, klinik, atau rumah sakit.',
      placeholder: 'Contoh: PMB, Puskesmas, RS',
      colSpan: 1
    }),
    field(
      `${prefix}Complications`,
      PARAGRAPH,
      'Apakah ada komplikasi atau masalah?',
      `${labelPrefix} - komplikasi`,
      {
        helpText: 'Tuliskan komplikasi jika ada, atau tulis Tidak ada.',
        placeholder: 'Contoh: Tidak ada, atau tuliskan komplikasi',
        colSpan: 'full'
      }
    )
  ];
}

function contraceptionFields(order: number): MedicalFormField[] {
  const prefix = `contraception${order}`;
  const labelPrefix = `KB ${order}`;

  return [
    field(`${prefix}StartDate`, DATE, 'Kapan mulai dipakai?', `${labelPrefix} - tanggal mulai`, {
      helpText: 'Pilih tanggal mulai menggunakan KB.',
      colSpan: 1
    }),
    field(`${prefix}Type`, LIST, 'Jenis KB/kontrasepsi', `${labelPrefix} - jenis`, {
      choices: [
        'Pil KB',
        'Suntik 1 bulan',
        'Suntik 3 bulan',
        'Implan',
        'IUD/spiral',
        'Kondom',
        'Steril',
        'Lainnya'
      ],
      colSpan: 1
    }),
    field(`${prefix}Duration`, TEXT, 'Berapa lama dipakai?', `${labelPrefix} - masa pakai`, {
      helpText: 'Contoh: 6 bulan atau 2 tahun.',
      colSpan: 1
    }),
    field(
      `${prefix}StopDate`,
      DATE,
      'Kapan berhenti atau dilepas?',
      `${labelPrefix} - tanggal lepas`,
      {
        helpText: 'Pilih tanggal berhenti atau dilepasnya KB.',
        colSpan: 1
      }
    ),
    field(
      `${prefix}Problems`,
      PARAGRAPH,
      'Apakah ada masalah saat memakai KB?',
      `${labelPrefix} - masalah`,
      {
        helpText: 'Tuliskan masalah atau keluhan jika ada, atau tulis Tidak ada.',
        colSpan: 'full'
      }
    ),
    field(
      `${prefix}SideEffects`,
      PARAGRAPH,
      'Apakah ada efek samping?',
      `${labelPrefix} - efek samping`,
      {
        helpText: 'Tuliskan efek samping jika ada, atau tulis Tidak ada.',
        colSpan: 'full'
      }
    )
  ];
}

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
    {
      id: 'motherIdentity',
      title: 'Data Diri',
      description: 'Isi data sesuai identitas dan kondisi saat ini.',
      layout: 'grid',
      fields: [
        field('motherName', TEXT, 'Nama lengkap', 'Nama lengkap', { colSpan: 1 }),
        field('motherNik', TEXT, 'NIK', 'NIK', {
          helpText: 'Isi 16 digit angka sesuai KTP.',
          colSpan: 1
        }),
        field('motherBirthDate', DATE, 'Tanggal lahir', 'Tanggal lahir', { colSpan: 1 }),
        field('motherAge', TEXT, 'Umur saat ini', 'Umur', {
          helpText: 'Otomatis terhitung dari tanggal lahir.',
          colSpan: 1
        }),
        field('marriageOrder', TEXT, 'Pernikahan ke berapa?', 'Pernikahan ke', {
          helpText: 'Isi angka urutan pernikahan. Contoh: 1.',
          colSpan: 1
        }),
        optionalField('marriageDate', DATE, 'Tanggal menikah', 'Tanggal menikah', {
          helpText: 'Pilih tanggal menikah jika ingat. Kosongkan jika belum ingat.',
          colSpan: 1
        }),
        field('motherJob', TEXT, 'Pekerjaan', 'Pekerjaan', { colSpan: 1 }),
        field('motherEducation', LIST, 'Pendidikan terakhir', 'Pendidikan', {
          choices: educationChoices,
          colSpan: 1
        }),
        field('religion', LIST, 'Agama', 'Agama', {
          choices: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'],
          colSpan: 1
        }),
        field('phoneNumber', TEXT, 'Nomor WhatsApp / telepon', 'No. telp', { colSpan: 1 }),
        field('domicileAddress', PARAGRAPH, 'Alamat tempat tinggal sekarang', 'Domisili', {
          colSpan: 'full'
        }),
        field('identityCardAddress', PARAGRAPH, 'Alamat sesuai KTP', 'Alamat KTP', {
          colSpan: 'full'
        }),
        field('dasawisma', TEXT, 'Nama Dasawisma', 'Dasawisma', {
          helpText: 'Isi nama kelompok Dasawisma jika terdaftar.',
          colSpan: 1
        }),
        field('posyandu', TEXT, 'Nama Posyandu', 'Posyandu', {
          helpText: 'Isi nama Posyandu wilayah domisili.',
          colSpan: 1
        }),
        field('puskesmas', TEXT, 'Nama Puskesmas wilayah domisili', 'Puskesmas', {
          helpText: 'Isi nama Puskesmas wilayah domisili.',
          colSpan: 'full'
        })
      ]
    },
    {
      id: 'partnerIdentity',
      title: 'Data Suami/Pasangan',
      description: 'Isi sesuai data pasangan yang diketahui.',
      layout: 'grid',
      fields: [
        field('partnerName', TEXT, 'Nama lengkap suami/pasangan', 'Nama suami', { colSpan: 1 }),
        field('partnerNik', TEXT, 'NIK suami/pasangan', 'NIK suami', {
          helpText: 'Isi 16 digit angka sesuai KTP atau KK pasangan.',
          colSpan: 1
        }),
        optionalField(
          'partnerBirthDate',
          DATE,
          'Tanggal lahir suami/pasangan',
          'Tanggal lahir suami',
          {
            helpText: 'Pilih tanggal lahir suami/pasangan jika diketahui.',
            colSpan: 1
          }
        ),
        field('partnerAge', TEXT, 'Umur suami/pasangan saat ini', 'Umur suami', {
          helpText: 'Contoh: 31 tahun. Boleh isi perkiraan jika usia pasti belum diketahui.',
          colSpan: 1
        }),
        field('partnerJob', TEXT, 'Pekerjaan suami/pasangan', 'Pekerjaan suami', { colSpan: 1 }),
        field('partnerEducation', LIST, 'Pendidikan terakhir suami/pasangan', 'Pendidikan suami', {
          choices: educationChoices,
          colSpan: 1
        })
      ]
    },
    {
      id: 'baselineMeasurements',
      title: 'Ukuran tubuh dan data dasar',
      description: 'Isi angka dari catatan buku KIA atau hasil pengukuran terkini.',
      layout: 'grid',
      fields: [
        field('heightCm', TEXT, 'Tinggi badan', 'TB', {
          helpText: 'Contoh: 156 cm.',
          colSpan: 1
        }),
        field('prePregnancyWeightKg', TEXT, 'Berat badan sebelum hamil', 'BB awal', {
          helpText: 'Berat badan sebelum atau awal hamil. Contoh: 52 kg.',
          colSpan: 1
        }),
        field('upperArmCircumferenceCm', TEXT, 'Lingkar lengan atas (LILA)', 'LILA', {
          helpText: 'Ukuran lingkar lengan atas jika pernah diukur. Contoh: 23.5 cm.',
          colSpan: 1
        }),
        field('initialBmi', TEXT, 'IMT (Indeks Massa Tubuh)', 'IMT awal', {
          helpText:
            'Otomatis terhitung dari Berat Badan (kg) / [Tinggi Badan (m) x Tinggi Badan (m)].',
          colSpan: 1
        }),
        field('tetanusStatus', LIST, 'Status imunisasi tetanus yang diketahui', 'Status TT', {
          helpText:
            'TT/Td adalah imunisasi untuk membantu perlindungan dari tetanus. Pilih sesuai kartu atau catatan jika tahu.',
          choices: ['T1', 'T2', 'T3', 'T4', 'T5', 'Belum pernah'],
          colSpan: 'full'
        }),
        field('motherBloodType', LIST, 'Golongan darah', 'Gol. darah', {
          choices: bloodTypeChoices,
          colSpan: 1
        }),
        field('partnerBloodType', LIST, 'Golongan darah suami/pasangan', 'Gol. darah suami', {
          choices: bloodTypeChoices,
          colSpan: 1
        })
      ]
    },
    {
      id: 'currentPregnancy',
      title: 'Kehamilan saat ini',
      description: 'Bagian ini dipakai bidan untuk membaca kondisi kehamilan saat ini.',
      layout: 'grid',
      fields: [
        optionalField('hpht', DATE, 'Tanggal pertama haid terakhir yang diingat (HPHT)', 'HPHT', {
          helpText:
            'Pilih tanggal hari pertama haid terakhir jika ingat. Kosongkan jika belum ingat; bidan akan membantu memperkirakan.',
          placeholder: 'Pilih tanggal HPHT...',
          colSpan: 'full'
        }),
        optionalField('estimatedDueDate', TEXT, 'Taksiran Persalinan (HPL)', 'HPL', {
          helpText: 'Otomatis terhitung dari HPHT + 280 hari (standar obstetri ACOG).',
          placeholder: 'Otomatis terhitung setelah HPHT dipilih',
          colSpan: 1,
          disabled: true
        }),
        optionalField('gestationalAge', TEXT, 'Usia Kehamilan (UK saat ini)', 'Usia Kehamilan', {
          helpText: 'Otomatis terhitung dari selisih HPL dan tanggal hari ini.',
          placeholder: 'Otomatis terhitung setelah HPHT dipilih',
          colSpan: 1,
          disabled: true
        }),
        field('currentComplaints', PARAGRAPH, 'Keluhan yang dirasakan sekarang', 'Keluhan', {
          helpText: 'Contoh: mual, pusing, cepat lelah, nyeri perut, atau tulis Tidak ada.',
          placeholder: 'Tuliskan keluhan yang dirasakan, atau tulis Tidak ada...',
          colSpan: 'full'
        })
      ]
    },
    {
      id: 'riskFactors',
      title: 'Kebiasaan dan lingkungan sebelum hamil',
      description: 'Jawab satu per satu untuk kondisi sekitar 1 bulan sebelum hamil.',
      fields: [
        field(
          'smokedBeforePregnancy',
          MULTIPLE_CHOICE,
          'Dalam 1 bulan sebelum hamil, apakah Anda merokok?',
          'Merokok sebelum hamil',
          {
            helpText: 'Termasuk rokok elektrik/vape jika digunakan.',
            choices: ['Aktif', 'Pasif', 'Tidak']
          }
        ),
        yesNoField(
          'alcoholBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda minum alkohol?',
          'Alkohol sebelum hamil'
        ),
        yesNoField(
          'irregularDietBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah pola makan Anda sering tidak teratur atau sering tinggi gula/lemak?',
          'Pola makan sebelum hamil'
        ),
        yesNoField(
          'reducedPhysicalActivityBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah aktivitas fisik Anda jauh berkurang?',
          'Aktivitas fisik sebelum hamil'
        ),
        yesNoField(
          'unprescribedMedicationBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda minum obat tertentu tanpa arahan dokter/bidan?',
          'Obat tanpa arahan petugas',
          'Jika minum vitamin hamil dari petugas, pilih Tidak.'
        ),
        yesNoField(
          'concerningCosmeticUseBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda menggunakan kosmetik atau produk perawatan tubuh yang Anda khawatirkan dapat memengaruhi kehamilan?',
          'Produk perawatan yang dikhawatirkan'
        ),
        yesNoField(
          'pesticideExposureBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda sering terkena pestisida atau obat tanaman?',
          'Paparan pestisida'
        ),
        yesNoField(
          'chemicalExposureBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda sering terkena bahan kimia kerja atau rumah tangga yang kuat?',
          'Paparan bahan kimia'
        ),
        yesNoField(
          'smokeExposureBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda sering terpapar asap rokok atau asap pembakaran?',
          'Paparan asap'
        ),
        optionalField(
          'concerningEnvironmentNotes',
          PARAGRAPH,
          'Catatan lingkungan lain yang membuat Anda khawatir',
          'Catatan lingkungan',
          {
            helpText: 'Jika tidak ada, tulis Tidak ada atau kosongkan.'
          }
        ),
        field(
          'allergyInfo',
          PARAGRAPH,
          'Apakah Anda punya alergi obat, makanan, atau hal lain?',
          'Alergi dari pasien',
          {
            helpText:
              'Contoh: alergi amoxicillin, seafood, atau debu. Jika tidak ada, tulis Tidak ada.'
          }
        ),
        optionalField(
          'otherNotes',
          PARAGRAPH,
          'Hal lain yang ingin disampaikan ke bidan',
          'Lain-lain',
          {
            helpText: 'Isi hanya jika ada tambahan.'
          }
        )
      ]
    },
    {
      id: 'diseaseHistory',
      title: 'Riwayat kesehatan',
      description:
        'Pilih Ya hanya jika pernah diberi tahu petugas kesehatan atau Anda memang sedang mengalaminya.',
      layout: 'questionnaire',
      fields: [
        ...diseaseStatusFields({
          statusId: 'hasHypertensionHistory',
          notesId: 'hypertensionHistoryNotes',
          statusTitle: 'Apakah Anda pernah atau sedang mengalami tekanan darah tinggi/hipertensi?',
          statusLabel: 'Riwayat darah tinggi',
          notesTitle: 'Catatan tekanan darah tinggi/hipertensi',
          notesLabel: 'Darah tinggi - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasHeartDiseaseHistory',
          notesId: 'heartDiseaseHistoryNotes',
          statusTitle: 'Apakah Anda pernah diberi tahu memiliki masalah jantung?',
          statusLabel: 'Riwayat jantung',
          notesTitle: 'Catatan masalah jantung',
          notesLabel: 'Jantung - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasThyroidDiseaseHistory',
          notesId: 'thyroidDiseaseHistoryNotes',
          statusTitle: 'Apakah Anda pernah diberi tahu memiliki masalah tiroid?',
          statusLabel: 'Riwayat tiroid',
          notesTitle: 'Catatan masalah tiroid',
          notesLabel: 'Tiroid - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasAutoimmuneHistory',
          notesId: 'autoimmuneHistoryNotes',
          statusTitle: 'Apakah Anda pernah diberi tahu memiliki penyakit autoimun?',
          statusLabel: 'Riwayat autoimun',
          notesTitle: 'Catatan autoimun',
          notesLabel: 'Autoimun - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasDiabetesHistory',
          notesId: 'diabetesHistoryNotes',
          statusTitle: 'Apakah Anda pernah atau sedang mengalami diabetes/kencing manis?',
          statusLabel: 'Riwayat diabetes',
          notesTitle: 'Catatan diabetes/kencing manis',
          notesLabel: 'Diabetes - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasAsthmaHistory',
          notesId: 'asthmaHistoryNotes',
          statusTitle: 'Apakah Anda pernah atau sedang mengalami asma?',
          statusLabel: 'Riwayat asma',
          notesTitle: 'Catatan asma',
          notesLabel: 'Asma - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasTuberculosisHistory',
          notesId: 'tuberculosisHistoryNotes',
          statusTitle: 'Apakah Anda pernah atau sedang mengalami TBC?',
          statusLabel: 'Riwayat TBC',
          notesTitle: 'Catatan TBC',
          notesLabel: 'TBC - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasHepatitisBHistory',
          notesId: 'hepatitisBHistoryNotes',
          statusTitle: 'Apakah Anda pernah diberi tahu mengalami Hepatitis B?',
          statusLabel: 'Riwayat Hepatitis B',
          notesTitle: 'Catatan Hepatitis B',
          notesLabel: 'Hepatitis B - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasHivOrSyphilisHistory',
          notesId: 'hivOrSyphilisHistoryNotes',
          statusTitle: 'Apakah Anda pernah diberi tahu mengalami HIV atau sifilis?',
          statusLabel: 'Riwayat HIV/Sifilis',
          notesTitle: 'Catatan HIV atau sifilis',
          notesLabel: 'HIV/Sifilis - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasMentalHealthHistory',
          notesId: 'mentalHealthHistoryNotes',
          statusTitle:
            'Apakah Anda pernah atau sedang mendapat bantuan untuk masalah kesehatan jiwa?',
          statusLabel: 'Riwayat kesehatan jiwa',
          notesTitle: 'Catatan kesehatan jiwa',
          notesLabel: 'Kesehatan jiwa - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasTwinPregnancyHistory',
          notesId: 'twinPregnancyHistoryNotes',
          statusTitle: 'Apakah Anda pernah hamil kembar?',
          statusLabel: 'Riwayat hamil kembar',
          notesTitle: 'Catatan hamil kembar',
          notesLabel: 'Hamil kembar - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasCystMyomaTumorHistory',
          notesId: 'cystMyomaTumorHistoryNotes',
          statusTitle: 'Apakah Anda pernah diberi tahu memiliki kista, miom, atau tumor?',
          statusLabel: 'Riwayat kista/miom/tumor',
          notesTitle: 'Catatan kista, miom, atau tumor',
          notesLabel: 'Kista/miom/tumor - tahun/catatan'
        }),
        ...diseaseStatusFields({
          statusId: 'hasSurgeryHistory',
          notesId: 'surgeryHistoryNotes',
          statusTitle: 'Apakah Anda pernah menjalani operasi?',
          statusLabel: 'Riwayat operasi',
          notesTitle: 'Catatan operasi',
          notesLabel: 'Operasi - tahun/catatan'
        }),
        field(
          'hasOtherDiseaseHistory',
          MULTIPLE_CHOICE,
          'Apakah Anda memiliki riwayat penyakit lain yang belum disebutkan di atas?',
          'Riwayat penyakit lain',
          {
            helpText:
              'Pilih Ya jika Anda pernah atau sedang mengalami penyakit lain yang belum tercantum.',
            choices: yesNoChoices,
            yearFieldId: 'otherDiseaseHistoryYear',
            notesFieldId: 'otherDiseaseHistoryNotes'
          }
        ),
        optionalField(
          'otherDiseaseHistoryNotes',
          TEXT,
          'Nama penyakit atau keluhan lain yang pernah dialami',
          'Penyakit lain - nama/keluhan',
          {
            placeholder: 'Contoh: Maag kronis, Asam urat',
            helpText: 'Tuliskan penyakit atau keluhan yang belum tercantum di atas.'
          }
        ),
        optionalField(
          'otherDiseaseHistoryYear',
          TEXT,
          'Tahun terdiagnosis penyakit lain',
          'Penyakit lain - tahun',
          {
            placeholder: 'Contoh: 2020',
            helpText: 'Tahun terdiagnosis atau dialami. Contoh: 2020.'
          }
        )
      ]
    },
    {
      id: 'obstetricSummary',
      title: 'Riwayat kehamilan dan persalinan',
      description:
        'Isi jumlahnya dulu. Detail riwayat sebelumnya akan ditanyakan satu per satu jika ada.',
      layout: 'grid',
      fields: [
        field('gravidaCount', TEXT, 'Berapa total kehamilan termasuk yang sekarang?', 'G', {
          helpText: 'Contoh: sedang hamil anak kedua, isi 2.',
          placeholder: 'Contoh: 1',
          colSpan: 1
        }),
        field('parityCount', TEXT, 'Berapa kali pernah melahirkan?', 'P', {
          helpText: 'Jika belum pernah, isi 0.',
          placeholder: 'Contoh: 0',
          colSpan: 1
        }),
        field(
          'abortionCount',
          TEXT,
          'Berapa kali pernah keguguran atau kehamilan tidak berlanjut?',
          'Ab',
          {
            helpText: 'Jika tidak pernah, isi 0.',
            placeholder: 'Contoh: 0',
            colSpan: 'full'
          }
        ),
        field('livingChildrenCount', TEXT, 'Berapa anak yang saat ini masih hidup?', 'Ah', {
          helpText: 'Jika belum ada, isi 0.',
          placeholder: 'Contoh: 1',
          colSpan: 'full'
        }),
        field(
          'hasPreviousPregnancyHistory',
          MULTIPLE_CHOICE,
          'Apakah Anda memiliki riwayat kehamilan atau persalinan sebelumnya?',
          'Ada riwayat obstetri',
          {
            choices: ['Ya, ada', 'Belum/tidak ada'],
            goToSectionIdByChoice: {
              'Ya, ada': 'previousPregnancy1Details',
              'Belum/tidak ada': 'contraceptionGateway'
            },
            colSpan: 'full'
          }
        )
      ]
    },
    {
      id: 'previousPregnancy1Details',
      title: 'Riwayat kehamilan/persalinan sebelumnya',
      description: 'Isi riwayat yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
      layout: 'grid',
      fields: previousPregnancyFields(1)
    },
    {
      id: 'previousPregnancy2Details',
      title: 'Riwayat kehamilan/persalinan sebelumnya',
      description:
        'Isi riwayat berikutnya yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
      layout: 'grid',
      fields: previousPregnancyFields(2)
    },
    {
      id: 'previousPregnancy3Details',
      title: 'Riwayat kehamilan/persalinan sebelumnya',
      description:
        'Isi riwayat berikutnya yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
      layout: 'grid',
      fields: previousPregnancyFields(3)
    },
    {
      id: 'previousPregnancy4Details',
      title: 'Riwayat kehamilan/persalinan sebelumnya',
      description:
        'Isi riwayat berikutnya yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
      layout: 'grid',
      fields: previousPregnancyFields(4)
    },
    {
      id: 'contraceptionGateway',
      title: 'Riwayat KB',
      description: 'KB berarti alat atau cara untuk mengatur kehamilan.',
      fields: [
        field(
          'hasContraceptionHistory',
          MULTIPLE_CHOICE,
          'Apakah Anda pernah menggunakan KB/kontrasepsi?',
          'Ada riwayat KB',
          {
            choices: ['Ya, pernah', 'Belum pernah'],
            goToSectionIdByChoice: {
              'Ya, pernah': 'contraception1Details',
              'Belum pernah': 'closing'
            }
          }
        )
      ]
    },
    {
      id: 'contraception1Details',
      title: 'Riwayat KB',
      description:
        'Isi riwayat KB dalam bagian ini. Lewati bagian yang tidak ada atau tidak ingat.',
      layout: 'grid',
      fields: contraceptionFields(1)
    },
    {
      id: 'contraception2Details',
      title: 'Riwayat KB',
      description: 'Isi jika ada riwayat KB berikutnya. Lewati jika tidak ada.',
      layout: 'grid',
      fields: contraceptionFields(2)
    },
    {
      id: 'contraception3Details',
      title: 'Riwayat KB',
      description: 'Isi jika ada riwayat KB berikutnya. Lewati jika tidak ada.',
      layout: 'grid',
      fields: contraceptionFields(3)
    },
    {
      id: 'contraception4Details',
      title: 'Riwayat KB',
      description:
        'Isi jika ada riwayat KB berikutnya. Bila lebih dari 4, sampaikan sisanya ke bidan saat kunjungan.',
      layout: 'grid',
      fields: contraceptionFields(4)
    },
    {
      id: 'closing',
      title: 'Selesai',
      description:
        'Terima kasih. Setelah form dikirim, petugas akan memeriksa dan melengkapi data rekam medis.',
      fields: []
    }
  ]
};

export const immunizationFlowDefinition: MedicalFlowDefinition = {
  flow: 'immunization',
  formTitle: 'Form Pendaftaran Imunisasi Anak - Amanah Health Care',
  formDescription:
    'Form pendaftaran ini diisi oleh orang tua/wali sebelum kunjungan imunisasi anak.',
  serviceName: 'Spesialis Anak',
  visitType: 'Imunisasi Anak',
  patientNameFieldId: 'childName',
  patientContactFieldId: 'parentPhone',
  complaintFieldId: 'previousVaccineHistory',
  sections: [
    {
      id: 'childIdentity',
      title: 'Data Identitas Anak',
      description: 'Isi data identitas anak sesuai KK atau kartu identitas anak.',
      layout: 'grid',
      fields: [
        field('childName', TEXT, 'Nama lengkap anak', 'Nama anak', {
          placeholder: 'Masukkan nama anak',
          colSpan: 1
        }),
        field('childNik', TEXT, 'NIK anak', 'NIK anak', {
          helpText: 'Isi 16 digit angka sesuai KK atau kartu identitas anak.',
          placeholder: '16 digit NIK anak',
          colSpan: 1
        }),
        field('childBirthDate', DATE, 'Tanggal lahir anak', 'Tanggal lahir anak', {
          helpText: 'Pilih tanggal lahir anak pada kalender.',
          colSpan: 1
        }),
        field('childSex', LIST, 'Jenis kelamin anak', 'Jenis kelamin anak', {
          choices: ['Laki-laki', 'Perempuan'],
          colSpan: 1
        }),
        field('parentPhone', TEXT, 'Nomor WhatsApp/HP orang tua', 'No HP', {
          helpText: 'Nomor aktif yang dapat dihubungi untuk konfirmasi jadwal.',
          placeholder: 'Contoh: 081234567890',
          colSpan: 'full'
        })
      ]
    },
    {
      id: 'parentIdentity',
      title: 'Data Orang Tua & Alamat',
      description: 'Isi data orang tua/wali dan alamat domisili tempat tinggal anak.',
      layout: 'grid',
      fields: [
        field('fatherName', TEXT, 'Nama Ayah', 'Nama ayah', {
          helpText: 'Isi nama ayah kandung/wali sesuai KK.',
          placeholder: 'Nama lengkap ayah/wali',
          colSpan: 1
        }),
        field('motherName', TEXT, 'Nama Ibu', 'Nama ibu', {
          helpText: 'Isi nama ibu kandung sesuai KK.',
          placeholder: 'Nama lengkap ibu kandung',
          colSpan: 1
        }),
        field('childAddress', PARAGRAPH, 'Alamat tempat tinggal', 'Alamat', {
          helpText: 'Tuliskan alamat domisili tempat tinggal anak saat ini.',
          placeholder: 'Tuliskan alamat domisili lengkap...',
          colSpan: 'full'
        })
      ]
    },
    {
      id: 'vaccineAndAllergyHistory',
      title: 'Riwayat Vaksin & Alergi',
      description:
        'Informasi riwayat vaksin sebelumnya dan riwayat alergi yang disampaikan orang tua.',
      fields: [
        field('previousVaccineHistory', PARAGRAPH, 'Riwayat vaksin sebelumnya', 'Riwayat vaksin', {
          helpText:
            'Contoh: HB 0 sudah diberikan setelah lahir, BCG dan Polio 1 saat usia 1 bulan. Tuliskan catatan dari buku KIA atau ingatan orang tua.'
        }),
        field('childAllergyHistory', PARAGRAPH, 'Riwayat alergi anak', 'Riwayat alergi', {
          helpText:
            'Tuliskan jika anak memiliki riwayat alergi obat, makanan, vaksin, atau hal lain. Jika tidak ada, tulis Tidak ada.'
        })
      ]
    }
  ]
};

export const medicalFlowDefinitions: Record<MedicalAppointmentFlow, MedicalFlowDefinition> = {
  pregnancy: pregnancyFlowDefinition,
  immunization: immunizationFlowDefinition
};

export function getMedicalFlowDefinition(flow: MedicalAppointmentFlow): MedicalFlowDefinition {
  return medicalFlowDefinitions[flow];
}
