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
    yesNoUnsureField(
      config.statusId,
      config.statusTitle,
      config.statusLabel,
      config.statusHelpText
    ),
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
      TEXT,
      `${titlePrefix}kapan mulai dipakai?`,
      `${labelPrefix} - tanggal mulai`,
      {
        helpText: `Boleh isi tanggal, bulan, atau tahun sesuai ingatan. ${emptyHelp}`
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
      TEXT,
      `${titlePrefix}kapan berhenti atau dilepas?`,
      `${labelPrefix} - tanggal lepas`,
      {
        helpText: `Boleh isi tanggal, bulan, atau tahun sesuai ingatan. ${emptyHelp}`
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
          helpText: 'Contoh: 28 tahun.'
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
          TEXT,
          'Tanggal lahir suami/pasangan',
          'Tanggal lahir suami',
          {
            helpText:
              'Boleh isi tanggal, bulan, atau tahun sesuai ingatan. Kosongkan jika tidak ingat.'
          }
        ),
        field('partnerAge', TEXT, 'Umur suami/pasangan saat ini', 'Umur suami', {
          helpText: 'Contoh: 31 tahun. Boleh isi perkiraan jika usia pasti belum diketahui.'
        }),
        field('partnerJob', TEXT, 'Pekerjaan suami/pasangan', 'Pekerjaan suami'),
        field('partnerEducation', LIST, 'Pendidikan terakhir suami/pasangan', 'Pendidikan suami', {
          choices: knownPersonEducationChoices
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
        field('initialBmi', TEXT, 'IMT awal jika pernah diberi tahu petugas', 'IMT awal', {
          helpText:
            'IMT adalah perbandingan berat dan tinggi badan. Jika belum pernah diberi tahu, tulis Belum tahu.'
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
      description:
        'Jawab satu per satu untuk kondisi sekitar 1 bulan sebelum hamil. Pilih Belum tahu jika tidak yakin.',
      fields: [
        yesNoUnsureField(
          'smokedBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda merokok?',
          'Merokok sebelum hamil',
          'Termasuk rokok elektrik/vape jika digunakan.'
        ),
        yesNoUnsureField(
          'alcoholBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda minum alkohol?',
          'Alkohol sebelum hamil'
        ),
        yesNoUnsureField(
          'irregularDietBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah pola makan Anda sering tidak teratur atau sering tinggi gula/lemak?',
          'Pola makan sebelum hamil'
        ),
        yesNoUnsureField(
          'reducedPhysicalActivityBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah aktivitas fisik Anda jauh berkurang?',
          'Aktivitas fisik sebelum hamil'
        ),
        yesNoUnsureField(
          'unprescribedMedicationBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda minum obat tertentu tanpa arahan dokter/bidan?',
          'Obat tanpa arahan petugas',
          'Jika minum vitamin hamil dari petugas, pilih Tidak.'
        ),
        yesNoUnsureField(
          'concerningCosmeticUseBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda memakai kosmetik atau produk perawatan yang membuat Anda khawatir?',
          'Produk perawatan yang dikhawatirkan'
        ),
        yesNoUnsureField(
          'pesticideExposureBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda sering terkena pestisida atau obat tanaman?',
          'Paparan pestisida'
        ),
        yesNoUnsureField(
          'chemicalExposureBeforePregnancy',
          'Dalam 1 bulan sebelum hamil, apakah Anda sering terkena bahan kimia kerja atau rumah tangga yang kuat?',
          'Paparan bahan kimia'
        ),
        yesNoUnsureField(
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
  formTitle: 'Form Awal Imunisasi Anak - Amanah Health Care',
  formDescription:
    'Form ini membantu petugas menyiapkan data imunisasi anak. Siapkan buku KIA atau kartu imunisasi jika ada.',
  serviceName: 'Spesialis Anak',
  visitType: 'Imunisasi Anak',
  patientNameFieldId: 'childName',
  patientContactFieldId: 'parentPhone',
  complaintFieldId: 'currentSymptoms',
  sections: [
    {
      id: 'opening',
      title: 'Sebelum mulai',
      description:
        'Form ini diisi oleh orang tua/wali. Bila ada buku KIA atau kartu imunisasi, gunakan sebagai panduan. Bila tidak ada, pilih Belum tahu dan petugas akan membantu cek jadwal.',
      fields: [
        field(
          'parentConsent',
          MULTIPLE_CHOICE,
          'Saya memahami form ini dipakai untuk membantu pelayanan imunisasi anak',
          'Persetujuan pengisian',
          { choices: ['Ya, saya mengerti'] }
        )
      ]
    },
    {
      id: 'childIdentity',
      title: 'Data Anak',
      description: 'Isi data anak sesuai identitas dan buku KIA jika tersedia.',
      fields: [
        field('childName', TEXT, 'Nama lengkap anak', 'Nama anak'),
        field('childNik', TEXT, 'NIK anak', 'NIK anak', {
          helpText: 'Isi 16 digit angka sesuai KK atau kartu identitas anak.'
        }),
        field('childBirthDate', DATE, 'Tanggal lahir anak', 'Tanggal lahir anak'),
        field('childSex', LIST, 'Jenis kelamin anak', 'Jenis kelamin anak', {
          choices: ['Laki-laki', 'Perempuan']
        }),
        field('parentPhone', TEXT, 'Nomor WhatsApp/telepon aktif orang tua', 'No HP')
      ]
    },
    {
      id: 'parentIdentity',
      title: 'Data Orang Tua/Wali',
      description: 'Isi sesuai data keluarga atau wali yang diketahui.',
      fields: [
        field('fatherName', TEXT, 'Nama orang tua/wali utama', 'Orang tua/wali utama', {
          helpText: 'Isi nama sesuai KK atau identitas keluarga.'
        }),
        field('motherName', TEXT, 'Nama orang tua/wali kedua', 'Orang tua/wali kedua', {
          helpText: 'Isi nama orang tua atau wali lain yang tercatat.'
        }),
        field('childAddress', PARAGRAPH, 'Alamat tempat tinggal anak', 'Alamat')
      ]
    },
    {
      id: 'kiaBook',
      title: 'Buku KIA atau kartu imunisasi',
      description: 'Bagian ini membantu petugas mengecek catatan imunisasi anak.',
      fields: [
        field(
          'hasKiaBook',
          MULTIPLE_CHOICE,
          'Apakah membawa buku KIA atau kartu imunisasi?',
          'Membawa buku KIA/kartu imunisasi',
          {
            choices: ['Ya, dibawa', 'Ada tetapi tidak dibawa', 'Tidak ada', 'Belum tahu']
          }
        )
      ]
    },
    {
      id: 'immunizationHistory',
      title: 'Riwayat imunisasi sebelumnya',
      description:
        'Pilih Sudah jika tertulis di buku/kartu atau orang tua/wali yakin. Pilih Belum tahu jika tidak yakin.',
      fields: [
        vaccineHistoryField(
          'hasReceivedHb0',
          'Apakah anak sudah pernah mendapat HB 0?',
          'Riwayat HB 0',
          'HB 0 adalah vaksin hepatitis B untuk bayi baru lahir.'
        ),
        vaccineHistoryField(
          'hasReceivedBcg',
          'Apakah anak sudah pernah mendapat BCG?',
          'Riwayat BCG',
          'BCG membantu perlindungan dari TBC.'
        ),
        vaccineHistoryField(
          'hasReceivedPentaIpv1',
          'Apakah anak sudah pernah mendapat PENTA/IPV 1?',
          'Riwayat PENTA/IPV 1',
          'PENTA/IPV adalah imunisasi kombinasi; petugas akan mencocokkan dengan usia anak.'
        ),
        vaccineHistoryField(
          'hasReceivedPcv1',
          'Apakah anak sudah pernah mendapat PCV 1?',
          'Riwayat PCV 1',
          'PCV membantu perlindungan dari penyakit pneumokokus.'
        ),
        vaccineHistoryField(
          'hasReceivedRv1',
          'Apakah anak sudah pernah mendapat RV 1?',
          'Riwayat RV 1',
          'RV adalah imunisasi rotavirus.'
        ),
        vaccineHistoryField(
          'hasReceivedPentaIpv2',
          'Apakah anak sudah pernah mendapat PENTA/IPV 2?',
          'Riwayat PENTA/IPV 2',
          'Pilih Belum tahu jika dosisnya belum yakin.'
        ),
        vaccineHistoryField(
          'hasReceivedPcv2',
          'Apakah anak sudah pernah mendapat PCV 2?',
          'Riwayat PCV 2',
          'Pilih sesuai catatan bila ada.'
        ),
        vaccineHistoryField(
          'hasReceivedRv2',
          'Apakah anak sudah pernah mendapat RV 2?',
          'Riwayat RV 2',
          'Pilih sesuai catatan bila ada.'
        ),
        vaccineHistoryField(
          'hasReceivedPentaIpv3',
          'Apakah anak sudah pernah mendapat PENTA/IPV 3?',
          'Riwayat PENTA/IPV 3',
          'Pilih Belum tahu jika dosisnya belum yakin.'
        ),
        vaccineHistoryField(
          'hasReceivedRv3',
          'Apakah anak sudah pernah mendapat RV 3?',
          'Riwayat RV 3',
          'Pilih sesuai catatan bila ada.'
        ),
        vaccineHistoryField(
          'hasReceivedMr',
          'Apakah anak sudah pernah mendapat MR?',
          'Riwayat MR',
          'MR membantu perlindungan dari campak dan rubella.'
        ),
        vaccineHistoryField(
          'hasReceivedJe',
          'Apakah anak sudah pernah mendapat JE?',
          'Riwayat JE',
          'JE adalah imunisasi Japanese Encephalitis sesuai jadwal atau arahan petugas.'
        ),
        vaccineHistoryField(
          'hasReceivedPcvBooster',
          'Apakah anak sudah pernah mendapat PCV booster?',
          'Riwayat PCV booster',
          'Booster adalah dosis lanjutan/penguatan.'
        ),
        vaccineHistoryField(
          'hasReceivedPentaBooster',
          'Apakah anak sudah pernah mendapat PENTA booster?',
          'Riwayat PENTA booster',
          'Booster adalah dosis lanjutan/penguatan.'
        ),
        vaccineHistoryField(
          'hasReceivedMrBooster',
          'Apakah anak sudah pernah mendapat MR booster?',
          'Riwayat MR booster',
          'Booster adalah dosis lanjutan/penguatan.'
        ),
        optionalField(
          'immunizationHistoryNotes',
          PARAGRAPH,
          'Catatan imunisasi lain yang ingin disampaikan',
          'Catatan imunisasi lain',
          {
            helpText: 'Isi hanya jika ada catatan tambahan dari buku KIA/kartu.'
          }
        )
      ]
    },
    {
      id: 'todayVaccineCheck',
      title: 'Imunisasi yang ingin dicek hari ini',
      description:
        'Pilih Ya jika orang tua/wali ingin petugas mengecek jenis imunisasi itu hari ini. Vaksin yang diberikan tetap dipastikan oleh petugas.',
      fields: [
        vaccineCheckField(
          'checkHb0Today',
          'Hari ini, apakah HB 0 perlu dicek?',
          'Cek hari ini - HB 0',
          'Biasanya untuk bayi baru lahir; petugas akan memastikan sesuai usia anak.'
        ),
        vaccineCheckField(
          'checkBcgToday',
          'Hari ini, apakah BCG perlu dicek?',
          'Cek hari ini - BCG',
          'Untuk membantu perlindungan dari TBC.'
        ),
        vaccineCheckField(
          'checkPentaIpvToday',
          'Hari ini, apakah PENTA/IPV perlu dicek?',
          'Cek hari ini - PENTA/IPV',
          'Imunisasi kombinasi yang dijadwalkan bertahap.'
        ),
        vaccineCheckField(
          'checkPcvToday',
          'Hari ini, apakah PCV perlu dicek?',
          'Cek hari ini - PCV',
          'Untuk membantu perlindungan dari penyakit pneumokokus.'
        ),
        vaccineCheckField(
          'checkRvToday',
          'Hari ini, apakah RV perlu dicek?',
          'Cek hari ini - RV',
          'RV adalah imunisasi rotavirus.'
        ),
        vaccineCheckField(
          'checkMrToday',
          'Hari ini, apakah MR perlu dicek?',
          'Cek hari ini - MR',
          'MR untuk campak dan rubella.'
        ),
        vaccineCheckField(
          'checkJeToday',
          'Hari ini, apakah JE perlu dicek?',
          'Cek hari ini - JE',
          'JE diberikan sesuai jadwal atau arahan petugas.'
        ),
        vaccineCheckField(
          'checkBoosterToday',
          'Hari ini, apakah imunisasi booster perlu dicek?',
          'Cek hari ini - booster',
          'Booster adalah dosis lanjutan/penguatan.'
        )
      ]
    },
    {
      id: 'currentCondition',
      title: 'Kondisi anak hari ini',
      description:
        'Jawaban ini membantu petugas menilai kesiapan imunisasi. Jika punya termometer, boleh ukur suhu dulu; jika tidak ada, pilih sesuai kondisi yang terlihat.',
      fields: [
        field(
          'hasFever',
          MULTIPLE_CHOICE,
          'Apakah anak sedang demam atau terasa lebih panas dari biasanya?',
          'Demam',
          {
            helpText:
              'Jika sempat diukur, gunakan hasil suhu yang orang tua/wali punya. Jika tidak yakin, pilih Belum tahu.',
            choices: ['Tidak', 'Ya', 'Belum tahu']
          }
        ),
        field('hasCough', MULTIPLE_CHOICE, 'Apakah anak sedang batuk?', 'Batuk', {
          choices: ['Tidak', 'Ya', 'Belum tahu']
        }),
        field('hasCold', MULTIPLE_CHOICE, 'Apakah anak sedang pilek?', 'Pilek', {
          choices: ['Tidak', 'Ya', 'Belum tahu']
        }),
        field(
          'currentSymptoms',
          PARAGRAPH,
          'Keluhan lain yang sedang dialami anak',
          'Keluhan lain',
          {
            helpText: 'Contoh: rewel, muntah, diare, ruam kulit. Jika tidak ada, tulis Tidak ada.'
          }
        )
      ]
    },
    {
      id: 'allergyAndReaction',
      title: 'Alergi dan reaksi setelah imunisasi',
      description:
        'Ceritakan dengan bahasa sehari-hari. Petugas akan memastikan kembali saat kunjungan.',
      fields: [
        field(
          'allergyInfo',
          PARAGRAPH,
          'Apakah anak punya alergi obat, makanan, atau hal lain?',
          'Riwayat alergi',
          {
            helpText:
              'Contoh: alergi obat tertentu, telur, susu, seafood, atau debu. Jika tidak ada, tulis Tidak ada.'
          }
        ),
        field(
          'previousVaccineReaction',
          PARAGRAPH,
          'Apakah pernah ada reaksi setelah imunisasi sebelumnya?',
          'Reaksi imunisasi sebelumnya',
          {
            helpText:
              'Contoh: demam tinggi, bengkak, ruam, atau sesak. Jika tidak ada, tulis Tidak ada.'
          }
        )
      ]
    },
    {
      id: 'closing',
      title: 'Selesai',
      description:
        'Terima kasih. Petugas akan memeriksa data dan melengkapi rekam medis imunisasi saat kunjungan.',
      fields: []
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
