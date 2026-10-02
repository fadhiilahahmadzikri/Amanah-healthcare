import type { MedicalFormSection } from '../medical-appointment-types';
import {
  DATE,
  LIST,
  MULTIPLE_CHOICE,
  PARAGRAPH,
  TEXT,
  bloodTypeChoices,
  diseaseStatusFields,
  field,
  optionalField,
  tetanusChoices,
  yesNoChoices,
  yesNoField
} from '../medical-appointment-field-builders';

export const baselineMeasurementsSection: MedicalFormSection = {
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
      helpText: 'Otomatis terhitung dari Berat Badan (kg) / [Tinggi Badan (m) x Tinggi Badan (m)].',
      colSpan: 1
    }),
    field('tetanusStatus', LIST, 'Status imunisasi tetanus yang diketahui', 'Status TT', {
      helpText:
        'TT/Td adalah imunisasi untuk membantu perlindungan dari tetanus. Pilih sesuai kartu atau catatan jika tahu.',
      choices: tetanusChoices,
      colSpan: 'full'
    }),
    field('motherBloodType', LIST, 'Golongan darah', 'Gol. darah', {
      choices: bloodTypeChoices,
      colSpan: 1
    })
  ]
};

export const currentPregnancySection: MedicalFormSection = {
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
};

export const riskFactorsSection: MedicalFormSection = {
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
        helpText: 'Contoh: alergi amoxicillin, seafood, atau debu. Jika tidak ada, tulis Tidak ada.'
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
};

export const diseaseHistorySection: MedicalFormSection = {
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
      statusTitle: 'Apakah Anda pernah atau sedang mendapat bantuan untuk masalah kesehatan jiwa?',
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
};
