import type { MedicalAppointmentFlow } from '../api/types';

export type MedicalFieldType = 'TEXT' | 'PARAGRAPH' | 'DATE' | 'MULTIPLE_CHOICE' | 'LIST';

export interface MedicalFormField {
  id: string;
  type: MedicalFieldType;
  title: string;
  label: string;
  helpText: string;
  required: boolean;
  choices: string[];
  goToSectionIdByChoice: Record<string, string> | null;
}

export interface MedicalFormSection {
  id: string;
  title: string;
  description: string;
  fields: MedicalFormField[];
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
const yesNoUnsureChoices = ['Tidak', 'Ya', 'Belum tahu'];
const educationChoices = ['Tidak sekolah', 'SD', 'SMP', 'SMA/SMK', 'D1-D3', 'S1', 'S2/S3'];
const knownPersonEducationChoices = [...educationChoices, 'Belum tahu'];
const bloodTypeChoices = ['A', 'B', 'AB', 'O', 'Belum tahu'];
const vaccineHistoryChoices = ['Sudah', 'Belum', 'Belum tahu'];
const vaccineCheckChoices = ['Tidak', 'Ya', 'Belum tahu, minta petugas cek'];

function field(
  id: string,
  type: MedicalFieldType,
  title: string,
  label: string,
  options?: Partial<
    Pick<MedicalFormField, 'helpText' | 'required' | 'choices' | 'goToSectionIdByChoice'>
  >
): MedicalFormField {
  return {
    id,
    type,
    title,
    label,
    helpText: options?.helpText || '',
    required: options?.required !== false,
    choices: options?.choices || [],
    goToSectionIdByChoice: options?.goToSectionIdByChoice || null
  };
}

function optionalField(
  id: string,
  type: MedicalFieldType,
  title: string,
  label: string,
  options?: Partial<Pick<MedicalFormField, 'helpText' | 'choices' | 'goToSectionIdByChoice'>>
): MedicalFormField {
  return field(id, type, title, label, { ...options, required: false });
}

function yesNoField(id: string, title: string, label: string, helpText = ''): MedicalFormField {
  return field(id, MULTIPLE_CHOICE, title, label, {
    helpText,
    choices: yesNoChoices
  });
}

function yesNoUnsureField(
  id: string,
  title: string,
  label: string,
  helpText = ''
): MedicalFormField {
  return field(id, MULTIPLE_CHOICE, title, label, {
    helpText,
    choices: yesNoUnsureChoices
  });
}

function vaccineHistoryField(
  id: string,
  title: string,
  label: string,
  helpText = ''
): MedicalFormField {
  return field(id, MULTIPLE_CHOICE, title, label, {
    helpText,
    choices: vaccineHistoryChoices
  });
}

function vaccineCheckField(
  id: string,
  title: string,
  label: string,
  helpText = ''
): MedicalFormField {
  return field(id, MULTIPLE_CHOICE, title, label, {
    helpText,
    choices: vaccineCheckChoices
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
    yesNoField(config.statusId, config.statusTitle, config.statusLabel, config.statusHelpText),
    optionalField(config.notesId, TEXT, config.notesTitle, config.notesLabel, {
      helpText: 'Isi tahun atau cerita singkat jika ingat. Kosongkan jika tidak ada catatan.'
    })
  ];
}

function previousPregnancyFields(order: number): MedicalFormField[] {
  const prefix = `previousPregnancy${order}`;
  const labelPrefix = `Riwayat ${order}`;
  const titlePrefix = `Riwayat ${order}: `;
  const emptyHelp = 'Kosongkan jika tidak ada atau tidak ingat.';

  return [
    optionalField(
      `${prefix}BirthYear`,
      TEXT,
      `${titlePrefix}tahun lahir atau tahun kehamilan berakhir`,
      `${labelPrefix} - tahun lahir`,
      { helpText: `Contoh: 2024. ${emptyHelp}` }
    ),
    optionalField(
      `${prefix}BirthWeight`,
      TEXT,
      `${titlePrefix}berat lahir bayi`,
      `${labelPrefix} - berat lahir`,
      {
        helpText: `Contoh: 3100 gram. ${emptyHelp}`
      }
    ),
    optionalField(
      `${prefix}BirthLength`,
      TEXT,
      `${titlePrefix}panjang lahir bayi`,
      `${labelPrefix} - panjang lahir`,
      {
        helpText: `Contoh: 49 cm. ${emptyHelp}`
      }
    ),
    optionalField(
      `${prefix}ChildSex`,
      LIST,
      `${titlePrefix}jenis kelamin bayi`,
      `${labelPrefix} - jenis kelamin`,
      {
        choices: ['Laki-laki', 'Perempuan', 'Belum tahu']
      }
    ),
    optionalField(
      `${prefix}GestationalAgeAtBirth`,
      TEXT,
      `${titlePrefix}usia kehamilan saat lahir atau berakhir`,
      `${labelPrefix} - usia kehamilan`,
      { helpText: `Contoh: 39 minggu. ${emptyHelp}` }
    ),
    optionalField(
      `${prefix}BirthAttendant`,
      TEXT,
      `${titlePrefix}ditolong oleh siapa?`,
      `${labelPrefix} - penolong`,
      {
        helpText: `Contoh: bidan, dokter, atau rumah sakit. ${emptyHelp}`
      }
    ),
    optionalField(
      `${prefix}DeliveryMethod`,
      LIST,
      `${titlePrefix}cara persalinan atau akhir kehamilan`,
      `${labelPrefix} - cara persalinan`,
      {
        choices: [
          'Normal/spontan',
          'Operasi caesar',
          'Vakum/forceps',
          'Keguguran',
          'Lainnya',
          'Belum tahu'
        ]
      }
    ),
    optionalField(
      `${prefix}DeliveryPlace`,
      TEXT,
      `${titlePrefix}tempat persalinan atau perawatan`,
      `${labelPrefix} - tempat`,
      {
        helpText: `Contoh: PMB, puskesmas, klinik, atau rumah sakit. ${emptyHelp}`
      }
    ),
    optionalField(
      `${prefix}Complications`,
      PARAGRAPH,
      `${titlePrefix}apakah ada komplikasi atau masalah?`,
      `${labelPrefix} - komplikasi`,
      {
        helpText: `Contoh: perdarahan, bayi dirawat, atau tulis Tidak ada. ${emptyHelp}`
      }
    )
  ];
}

function contraceptionFields(order: number): MedicalFormField[] {
  const prefix = `contraception${order}`;
  const labelPrefix = `KB ${order}`;
  const titlePrefix = `KB ${order}: `;
  const emptyHelp = 'Kosongkan jika tidak ada atau tidak ingat.';

  return [
    optionalField(
      `${prefix}StartDate`,
      DATE,
      `${titlePrefix}kapan mulai dipakai?`,
      `${labelPrefix} - tanggal mulai`,
      {
        helpText: `Pilih tanggal mulai pakai KB jika ingat. ${emptyHelp}`
      }
    ),
    optionalField(
      `${prefix}Type`,
      LIST,
      `${titlePrefix}jenis KB/kontrasepsi`,
      `${labelPrefix} - jenis`,
      {
        choices: [
          'Pil KB',
          'Suntik 1 bulan',
          'Suntik 3 bulan',
          'Implan',
          'IUD/spiral',
          'Kondom',
          'Steril',
          'Lainnya',
          'Belum tahu'
        ]
      }
    ),
    optionalField(
      `${prefix}Duration`,
      TEXT,
      `${titlePrefix}berapa lama dipakai?`,
      `${labelPrefix} - masa pakai`,
      {
        helpText: `Contoh: 6 bulan atau 2 tahun. ${emptyHelp}`
      }
    ),
    optionalField(
      `${prefix}StopDate`,
      DATE,
      `${titlePrefix}kapan berhenti atau dilepas?`,
      `${labelPrefix} - tanggal lepas`,
      {
        helpText: `Pilih tanggal berhenti atau dilepas jika ingat. ${emptyHelp}`
      }
    ),
    optionalField(
      `${prefix}Problems`,
      PARAGRAPH,
      `${titlePrefix}apakah ada masalah saat memakai KB?`,
      `${labelPrefix} - masalah`,
      {
        helpText: `Jika tidak ada, tulis Tidak ada. ${emptyHelp}`
      }
    ),
    optionalField(
      `${prefix}SideEffects`,
      PARAGRAPH,
      `${titlePrefix}apakah ada efek samping?`,
      `${labelPrefix} - efek samping`,
      {
        helpText: `Jika tidak ada, tulis Tidak ada. ${emptyHelp}`
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
      id: 'opening',
      title: 'Sebelum mulai',
      description:
        'Siapkan KTP, buku KIA, atau catatan pemeriksaan jika ada. Data yang belum tersedia akan dikonfirmasi petugas saat kunjungan.',
      fields: [
        field(
          'patientConsent',
          MULTIPLE_CHOICE,
          'Saya memahami form ini dipakai untuk membantu pelayanan bidan',
          'Persetujuan pengisian',
          { choices: ['Ya, saya mengerti'] }
        )
      ]
    },
    {
      id: 'motherIdentity',
      title: 'Data Diri',
      description: 'Isi data sesuai identitas dan kondisi saat ini.',
      fields: [
        field('motherName', TEXT, 'Nama lengkap', 'Nama lengkap'),
        field('motherNik', TEXT, 'NIK', 'NIK', {
          helpText: 'Isi 16 digit angka sesuai KTP.'
        }),
        field('motherBirthDate', DATE, 'Tanggal lahir', 'Tanggal lahir'),
        field('motherAge', TEXT, 'Umur saat ini', 'Umur', {
          helpText: 'Otomatis terhitung dari tanggal lahir.'
        }),
        field('marriageOrder', TEXT, 'Pernikahan ke berapa?', 'Pernikahan ke', {
          helpText: 'Isi angka urutan pernikahan. Contoh: 1.'
        }),
        optionalField('marriageDate', DATE, 'Tanggal menikah', 'Tanggal menikah', {
          helpText: 'Pilih tanggal menikah jika ingat. Kosongkan jika belum ingat.'
        }),
        field('motherJob', TEXT, 'Pekerjaan', 'Pekerjaan'),
        field('motherEducation', LIST, 'Pendidikan terakhir', 'Pendidikan', {
          choices: educationChoices
        }),
        field('religion', LIST, 'Agama', 'Agama', {
          choices: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']
        }),
        field('phoneNumber', TEXT, 'Nomor WhatsApp/telepon aktif', 'No. telp'),
        field('domicileAddress', PARAGRAPH, 'Alamat tempat tinggal sekarang', 'Domisili'),
        field('identityCardAddress', PARAGRAPH, 'Alamat sesuai KTP', 'Alamat KTP'),
        field('dasawisma', TEXT, 'Nama Dasawisma', 'Dasawisma', {
          helpText: 'Isi nama kelompok Dasawisma jika terdaftar. Jika tidak tahu, isi Belum tahu.'
        }),
        field('posyandu', TEXT, 'Nama Posyandu', 'Posyandu', {
          helpText: 'Isi nama Posyandu wilayah domisili. Jika tidak tahu, isi Belum tahu.'
        }),
        field('puskesmas', TEXT, 'Nama Puskesmas wilayah domisili', 'Puskesmas', {
          helpText: 'Isi nama Puskesmas wilayah domisili. Jika tidak tahu, isi Belum tahu.'
        })
      ]
    },
    {
      id: 'partnerIdentity',
      title: 'Data Suami/Pasangan',
      description: 'Isi sesuai data pasangan yang diketahui.',
      fields: [
        field('partnerName', TEXT, 'Nama lengkap suami/pasangan', 'Nama suami'),
        field('partnerNik', TEXT, 'NIK suami/pasangan', 'NIK suami', {
          helpText: 'Isi 16 digit angka sesuai KTP atau KK pasangan.'
        }),
        optionalField(
          'partnerBirthDate',
          DATE,
          'Tanggal lahir suami/pasangan',
          'Tanggal lahir suami',
          {
            helpText: 'Pilih tanggal lahir suami/pasangan jika diketahui.'
          }
        ),
        field('partnerAge', TEXT, 'Umur suami/pasangan saat ini', 'Umur suami', {
          helpText: 'Contoh: 31 tahun. Boleh isi perkiraan jika usia pasti belum diketahui.'
        }),
        field('partnerJob', TEXT, 'Pekerjaan suami/pasangan', 'Pekerjaan suami'),
        field('partnerEducation', LIST, 'Pendidikan terakhir suami/pasangan', 'Pendidikan suami', {
          choices: educationChoices
        })
      ]
    },
    {
      id: 'baselineMeasurements',
      title: 'Ukuran tubuh dan data dasar',
      description:
        'Isi angka dari catatan atau alat ukur jika ada. Untuk ukuran yang belum pernah diukur, isi Belum tahu.',
      fields: [
        field('heightCm', TEXT, 'Tinggi badan', 'TB', {
          helpText: 'Contoh: 156 cm. Jika tidak ada hasil ukur, isi Belum tahu.'
        }),
        field(
          'prePregnancyWeightKg',
          TEXT,
          'Berat badan sebelum hamil atau awal hamil',
          'BB awal',
          {
            helpText: 'Contoh: 52 kg. Jika tidak ada hasil ukur, isi Belum tahu.'
          }
        ),
        field('upperArmCircumferenceCm', TEXT, 'Lingkar lengan atas jika pernah diukur', 'LILA', {
          helpText:
            'LILA adalah ukuran lingkar lengan atas, biasanya diukur dengan pita ukur. Jika belum pernah diukur, isi Belum tahu.'
        }),
        field('initialBmi', TEXT, 'IMT (Indeks Massa Tubuh)', 'IMT awal', {
          helpText:
            'Otomatis terhitung dari Berat Badan (kg) / [Tinggi Badan (m) x Tinggi Badan (m)].'
        }),
        field('tetanusStatus', LIST, 'Status imunisasi tetanus yang diketahui', 'Status TT', {
          helpText:
            'TT/Td adalah imunisasi untuk membantu perlindungan dari tetanus. Pilih sesuai kartu atau catatan jika tahu.',
          choices: ['T1', 'T2', 'T3', 'T4', 'T5', 'Belum pernah', 'Belum tahu']
        }),
        field('motherBloodType', LIST, 'Golongan darah', 'Gol. darah', {
          choices: bloodTypeChoices
        }),
        field('partnerBloodType', LIST, 'Golongan darah suami/pasangan', 'Gol. darah suami', {
          choices: bloodTypeChoices
        })
      ]
    },
    {
      id: 'currentPregnancy',
      title: 'Kehamilan saat ini',
      description: 'Bagian ini dipakai bidan untuk membaca kondisi kehamilan saat ini.',
      fields: [
        optionalField('hpht', DATE, 'Tanggal pertama haid terakhir yang diingat', 'HPHT', {
          helpText:
            'Isi jika ingat tanggalnya. Kosongkan jika tidak ingat; bidan akan membantu memperkirakan saat pemeriksaan.'
        }),
        field('currentComplaints', PARAGRAPH, 'Keluhan yang dirasakan sekarang', 'Keluhan', {
          helpText: 'Contoh: mual, pusing, cepat lelah, nyeri perut, atau tulis Tidak ada.'
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
          notesLabel: 'HIV/Sifilis - tahun/catatan',
          statusHelpText: 'Jawaban ini membantu keamanan pelayanan kesehatan Anda dan bayi.'
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
        ...diseaseStatusFields({
          statusId: 'hasOtherDiseaseHistory',
          notesId: 'otherDiseaseHistoryNotes',
          statusTitle: 'Apakah Anda memiliki riwayat penyakit lain yang belum disebutkan di atas?',
          statusLabel: 'Riwayat penyakit lain',
          notesTitle: 'Nama penyakit atau catatan riwayat penyakit lain',
          notesLabel: 'Penyakit lain - catatan',
          statusHelpText:
            'Pilih Ya jika Anda pernah atau sedang mengalami penyakit lain yang belum tercantum.'
        })
      ]
    },
    {
      id: 'obstetricSummary',
      title: 'Riwayat kehamilan dan persalinan',
      description:
        'Isi jumlahnya dulu. Detail riwayat sebelumnya akan ditanyakan satu per satu jika ada.',
      fields: [
        field('gravidaCount', TEXT, 'Total kehamilan termasuk yang sekarang', 'G', {
          helpText: 'Contoh: sedang hamil anak kedua, isi 2.'
        }),
        field('parityCount', TEXT, 'Berapa kali pernah melahirkan?', 'P', {
          helpText: 'Jika belum pernah, isi 0.'
        }),
        field(
          'abortionCount',
          TEXT,
          'Berapa kali pernah keguguran atau kehamilan tidak berlanjut?',
          'Ab',
          {
            helpText: 'Jika tidak pernah, isi 0.'
          }
        ),
        field('livingChildrenCount', TEXT, 'Berapa anak yang saat ini masih hidup?', 'Ah', {
          helpText: 'Jika belum ada, isi 0.'
        }),
        field(
          'hasPreviousPregnancyHistory',
          MULTIPLE_CHOICE,
          'Apakah ada riwayat kehamilan atau persalinan sebelumnya yang perlu dicatat?',
          'Ada riwayat obstetri',
          {
            choices: ['Ya, ada', 'Belum/tidak ada'],
            goToSectionIdByChoice: {
              'Ya, ada': 'previousPregnancy1Details',
              'Belum/tidak ada': 'contraceptionGateway'
            }
          }
        )
      ]
    },
    {
      id: 'previousPregnancy1Details',
      title: 'Riwayat kehamilan/persalinan sebelumnya 1',
      description: 'Isi riwayat yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
      fields: previousPregnancyFields(1)
    },
    {
      id: 'previousPregnancy2Details',
      title: 'Riwayat kehamilan/persalinan sebelumnya 2',
      description: 'Isi jika ada riwayat berikutnya. Lewati jika tidak ada.',
      fields: previousPregnancyFields(2)
    },
    {
      id: 'previousPregnancy3Details',
      title: 'Riwayat kehamilan/persalinan sebelumnya 3',
      description: 'Isi jika ada riwayat berikutnya. Lewati jika tidak ada.',
      fields: previousPregnancyFields(3)
    },
    {
      id: 'previousPregnancy4Details',
      title: 'Riwayat kehamilan/persalinan sebelumnya 4',
      description:
        'Isi jika ada riwayat berikutnya. Bila lebih dari 4, sampaikan sisanya ke bidan saat kunjungan.',
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
      title: 'Riwayat KB 1',
      description:
        'Isi satu riwayat KB dalam bagian ini. Lewati bagian yang tidak ada atau tidak ingat.',
      fields: contraceptionFields(1)
    },
    {
      id: 'contraception2Details',
      title: 'Riwayat KB 2',
      description: 'Isi jika ada riwayat KB berikutnya. Lewati jika tidak ada.',
      fields: contraceptionFields(2)
    },
    {
      id: 'contraception3Details',
      title: 'Riwayat KB 3',
      description: 'Isi jika ada riwayat KB berikutnya. Lewati jika tidak ada.',
      fields: contraceptionFields(3)
    },
    {
      id: 'contraception4Details',
      title: 'Riwayat KB 4',
      description:
        'Isi jika ada riwayat KB berikutnya. Bila lebih dari 4, sampaikan sisanya ke bidan saat kunjungan.',
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
      fields: [
        field('childName', TEXT, 'Nama lengkap anak', 'Nama anak'),
        field('childNik', TEXT, 'NIK anak', 'NIK anak', {
          helpText: 'Isi 16 digit angka sesuai KK atau kartu identitas anak.'
        }),
        field('childBirthDate', DATE, 'Tanggal lahir anak', 'Tanggal lahir anak', {
          helpText: 'Pilih tanggal lahir anak pada kalender.'
        }),
        field('childSex', LIST, 'Jenis kelamin anak', 'Jenis kelamin anak', {
          choices: ['Laki-laki', 'Perempuan']
        }),
        field('parentPhone', TEXT, 'Nomor WhatsApp/HP orang tua', 'No HP', {
          helpText: 'Nomor aktif yang dapat dihubungi untuk konfirmasi jadwal.'
        })
      ]
    },
    {
      id: 'parentIdentity',
      title: 'Data Orang Tua & Alamat',
      description: 'Isi data orang tua/wali dan alamat domisili tempat tinggal anak.',
      fields: [
        field('fatherName', TEXT, 'Nama Ayah', 'Nama ayah', {
          helpText: 'Isi nama ayah kandung/wali sesuai KK.'
        }),
        field('motherName', TEXT, 'Nama Ibu', 'Nama ibu', {
          helpText: 'Isi nama ibu kandung sesuai KK.'
        }),
        field('childAddress', PARAGRAPH, 'Alamat tempat tinggal', 'Alamat', {
          helpText: 'Tuliskan alamat domisili tempat tinggal anak saat ini.'
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
