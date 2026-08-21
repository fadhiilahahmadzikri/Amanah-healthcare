export interface AmanahService {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  iconName: string;
  codePrefix: string;
  commonComplaints: string[];
}

export interface ComplaintQuickSuggestion {
  label: string;
  serviceName: string;
  description: string;
}

export const AMANAH_SERVICES: AmanahService[] = [
  {
    id: 'srv-penyakit-dalam',
    name: 'Poli Penyakit Dalam',
    shortName: 'Penyakit Dalam',
    category: 'Spesialis Medikal',
    description: 'Diagnosa & terapi komprehensif penyakit organ dalam dewasa, metabolik & infeksi.',
    iconName: 'health',
    codePrefix: 'A',
    commonComplaints: [
      'Demam tinggi & meriang',
      'Diabetes & gula darah tinggi',
      'Hipertensi / darah tinggi',
      'Asam lambung / GERD & maag',
      'Lemas & pusing berkepanjangan'
    ]
  },
  {
    id: 'srv-anak',
    name: 'Spesialis Anak',
    shortName: 'Spesialis Anak',
    category: 'Ibu & Anak',
    description: 'Kesehatan anak, imunisasi lengkap, pemantauan tumbuh kembang & nutrisi balita.',
    iconName: 'baby',
    codePrefix: 'B',
    commonComplaints: [
      'Demam, batuk & pilek anak',
      'Diare & muntah anak',
      'Imunisasi rutin bayi & balita',
      'Konsultasi tumbuh kembang',
      'Alergi makanan / susu sapi'
    ]
  },
  {
    id: 'srv-gigi',
    name: 'Dokter Gigi',
    shortName: 'Dokter Gigi',
    category: 'Gigi & Mulut',
    description: 'Perawatan konservasi gigi, tambal, pembersihan karang gigi, behel & bedah mulut.',
    iconName: 'smile',
    codePrefix: 'C',
    commonComplaints: [
      'Sakit gigi berdenyut',
      'Gigi ngilu saat minum dingin',
      'Pembersihan karang gigi (scaling)',
      'Tambal gigi berlubang',
      'Cabut gigi bungsu'
    ]
  },
  {
    id: 'srv-obgyn',
    name: 'Kebidanan & Kandungan',
    shortName: 'Kebidanan & Kandungan',
    category: 'Ibu & Anak',
    description:
      'Pemeriksaan kehamilan, USG 4D fetomaternal, persalinan terpadu & kesehatan reproduksi.',
    iconName: 'heartPulse',
    codePrefix: 'D',
    commonComplaints: [
      'Pemeriksaan rutin kehamilan',
      'USG 4D janin',
      'Nyeri haid & siklus tidak teratur',
      'Program hamil (promil)',
      'Konsultasi KB & kesehatan rahim'
    ]
  },
  {
    id: 'srv-ortopedi',
    name: 'Ortopedi & Traumatologi',
    shortName: 'Ortopedi & Traumatologi',
    category: 'Bedah & Tulang',
    description:
      'Penanganan kelainan tulang, sendi, saraf tulang belakang, fraktur & cedera olahraga.',
    iconName: 'bone',
    codePrefix: 'E',
    commonComplaints: [
      'Sakit pinggang / boyok',
      'Nyeri sendi lutut / pengapuran',
      'Cedera olahraga / terkilir',
      'Patah / retak tulang',
      'Saraf kejepit tulang belakang'
    ]
  },
  {
    id: 'srv-dermatologi',
    name: 'Dermatologi',
    shortName: 'Dermatologi',
    category: 'Spesialisasi Kulit',
    description: 'Perawatan infeksi kulit, eksim, jerawat, alergi, laser medis & estetika klinis.',
    iconName: 'sparkles',
    codePrefix: 'F',
    commonComplaints: [
      'Ruam merah & gatal-gatal',
      'Jerawat parah & bekas radang',
      'Eksim / dermatitis alergi',
      'Infeksi jamur / herpes kulit',
      'Perawatan flek & laser kulit'
    ]
  },
  {
    id: 'srv-jantung',
    name: 'Jantung & Kardiovaskular',
    shortName: 'Jantung & Kardiovaskular',
    category: 'Spesialis Medikal',
    description:
      'Deteksi dini penyakit jantung koroner, hipertensi resisten, EKG & ekokardiografi.',
    iconName: 'heart',
    codePrefix: 'G',
    commonComplaints: [
      'Nyeri dada kiri menjalar',
      'Jantung berdebar (palpitasi)',
      'Sesak napas saat aktivitas',
      'Screening kesehatan jantung',
      'Kontrol rutin pasca ring jantung'
    ]
  },
  {
    id: 'srv-mata',
    name: 'Spesialis Mata',
    shortName: 'Spesialis Mata',
    category: 'Indra & Sensori',
    description: 'Pemeriksaan refraksi mata, skrining katarak, glaukoma & terapi retina modern.',
    iconName: 'eye',
    codePrefix: 'H',
    commonComplaints: [
      'Penglihatan buram & kabur',
      'Mata merah, perih & berair',
      'Skrining katarak & glaukoma',
      'Pemeriksaan mata minus/silinder',
      'Bintitan & infeksi kelopak mata'
    ]
  },
  {
    id: 'srv-tht',
    name: 'Spesialis THT',
    shortName: 'Spesialis THT',
    category: 'Indra & Sensori',
    description: 'Diagnosis gangguan telinga, hidung, tenggorokan, alergi saluran nafas & suara.',
    iconName: 'headset',
    codePrefix: 'I',
    commonComplaints: [
      'Telinga berdenging (tinnitus)',
      'Hidung mampet kronis / sinusitis',
      'Sakit menelan / radang amandel',
      'Pembersihan kotoran telinga',
      'Suara serak berkepanjangan'
    ]
  },
  {
    id: 'srv-jiwa',
    name: 'Kesehatan Jiwa & Psikiatri',
    shortName: 'Kesehatan Jiwa & Psikiatri',
    category: 'Kesehatan Mental',
    description:
      'Konseling psikoterapi, terapi gangguan kecemasan, depresi, insomnia & manajemen stres.',
    iconName: 'brain',
    codePrefix: 'J',
    commonComplaints: [
      'Susah tidur / insomnia kronis',
      'Stres kerja berlebih & burnout',
      'Kecemasan / panik berlebih',
      'Mood swing & depresi',
      'Konseling mental & psikoterapi'
    ]
  },
  {
    id: 'srv-saraf',
    name: 'Neurologi / Saraf',
    shortName: 'Neurologi / Saraf',
    category: 'Spesialis Medikal',
    description: 'Penanganan nyeri saraf, stroke, migrain kronis, vertigo, kejang & neuropati.',
    iconName: 'activity',
    codePrefix: 'K',
    commonComplaints: [
      'Sakit kepala hebat / migrain / vertigo',
      'Kebas & kesemutan tangan/kaki',
      'Saraf kejepit leher / pinggang',
      'Pemulihan pasca stroke',
      'Tremor & gangguan saraf'
    ]
  },
  {
    id: 'srv-gizi',
    name: 'Gizi Klinik',
    shortName: 'Gizi Klinik',
    category: 'Rehabilitasi & Nutrisi',
    description:
      'Panduan nutrisi medis diabetes/ginjal, program diet obesitas & rehabilitasi fisik.',
    iconName: 'apple',
    codePrefix: 'L',
    commonComplaints: [
      'Konsultasi diet & obesitas',
      'Panduan gizi pasien diabetes/ginjal',
      'Malnutrisi & pemulihan sakit',
      'Fisioterapi pemulihan cedera',
      'Terapi gerak pasca operasi'
    ]
  }
];

export const QUICK_COMPLAINT_SUGGESTIONS: ComplaintQuickSuggestion[] = [
  {
    label: 'Demam & Flu',
    serviceName: 'Poli Penyakit Dalam',
    description: 'Demam tinggi 2 hari, meriang & lemas'
  },
  {
    label: 'Sakit Pinggang',
    serviceName: 'Ortopedi & Traumatologi',
    description: 'Nyeri pinggang dan boyok kaku saat beraktivitas'
  },
  {
    label: 'Sakit Gigi & Ngilu',
    serviceName: 'Dokter Gigi',
    description: 'Gigi geraham ngilu saat mengunyah & minum dingin'
  },
  {
    label: 'Periksa Kehamilan / USG',
    serviceName: 'Kebidanan & Kandungan',
    description: 'Pemeriksaan rutin USG janin trimester ke-2'
  },
  {
    label: 'Demam Anak',
    serviceName: 'Spesialis Anak',
    description: 'Demam naik turun disertai batuk pilek anak'
  },
  {
    label: 'Gatal & Ruam Kulit',
    serviceName: 'Dermatologi',
    description: 'Bercak merah gatal di lengan dan punggung'
  },
  {
    label: 'Nyeri Dada / Jantung',
    serviceName: 'Jantung & Kardiovaskular',
    description: 'Dada terasa berdebar kencang dan sedikit sesak'
  },
  {
    label: 'Insomnia & Stres',
    serviceName: 'Kesehatan Jiwa & Psikiatri',
    description: 'Sulit tidur nyenyak dan sering cemas saat malam'
  }
];

/**
 * Helper to get Service info by service or poliklinik name
 */
export function getAmanahServiceByName(name?: string): AmanahService | undefined {
  if (!name) return undefined;
  const clean = name
    .toLowerCase()
    .replace(/^poli(klinik)?\s*/i, '')
    .trim();
  return AMANAH_SERVICES.find(
    (s) =>
      s.name.toLowerCase().includes(clean) ||
      s.shortName.toLowerCase().includes(clean) ||
      clean.includes(s.shortName.toLowerCase())
  );
}

/**
 * Smart detector: match complaint text to the most relevant Amanah service
 */
export function detectServiceFromComplaint(text: string): AmanahService | undefined {
  if (!text || text.trim().length < 3) return undefined;
  const q = text.toLowerCase();

  // 1. Check quick suggestion keywords
  for (const sug of QUICK_COMPLAINT_SUGGESTIONS) {
    if (q.includes(sug.label.toLowerCase()) || sug.description.toLowerCase().includes(q)) {
      return getAmanahServiceByName(sug.serviceName);
    }
  }

  // 2. Check complaints in each service
  for (const srv of AMANAH_SERVICES) {
    for (const c of srv.commonComplaints) {
      const words = c.toLowerCase().split(/[ &/,]+/);
      for (const w of words) {
        if (w.length > 3 && q.includes(w)) {
          return srv;
        }
      }
    }
  }

  // 3. Fallback keywords
  if (
    q.includes('pinggang') ||
    q.includes('tulang') ||
    q.includes('sendi') ||
    q.includes('patah') ||
    q.includes('boyok')
  ) {
    return getAmanahServiceByName('Ortopedi & Traumatologi');
  }
  if (q.includes('gigi') || q.includes('gusi') || q.includes('behel') || q.includes('karang')) {
    return getAmanahServiceByName('Dokter Gigi');
  }
  if (
    q.includes('hamil') ||
    q.includes('usg') ||
    q.includes('janin') ||
    q.includes('kandungan') ||
    q.includes('haid')
  ) {
    return getAmanahServiceByName('Kebidanan & Kandungan');
  }
  if (q.includes('anak') || q.includes('bayi') || q.includes('imunisasi')) {
    return getAmanahServiceByName('Spesialis Anak');
  }
  if (
    q.includes('kulit') ||
    q.includes('gatal') ||
    q.includes('ruam') ||
    q.includes('jerawat') ||
    q.includes('alergi')
  ) {
    return getAmanahServiceByName('Dermatologi');
  }
  if (q.includes('jantung') || q.includes('dada') || q.includes('debar')) {
    return getAmanahServiceByName('Jantung & Kardiovaskular');
  }
  if (q.includes('mata') || q.includes('rabun') || q.includes('katarak') || q.includes('buram')) {
    return getAmanahServiceByName('Spesialis Mata');
  }
  if (
    q.includes('telinga') ||
    q.includes('hidung') ||
    q.includes('tenggorokan') ||
    q.includes('sinus')
  ) {
    return getAmanahServiceByName('Spesialis THT');
  }
  if (
    q.includes('stres') ||
    q.includes('tidur') ||
    q.includes('insomnia') ||
    q.includes('cemas') ||
    q.includes('panik')
  ) {
    return getAmanahServiceByName('Kesehatan Jiwa & Psikiatri');
  }
  if (
    q.includes('kepala') ||
    q.includes('migrain') ||
    q.includes('vertigo') ||
    q.includes('saraf') ||
    q.includes('kebas')
  ) {
    return getAmanahServiceByName('Neurologi / Saraf');
  }
  if (
    q.includes('diet') ||
    q.includes('gizi') ||
    q.includes('nutrisi') ||
    q.includes('gemuk') ||
    q.includes('obesitas')
  ) {
    return getAmanahServiceByName('Gizi Klinik');
  }
  if (
    q.includes('demam') ||
    q.includes('lambung') ||
    q.includes('maag') ||
    q.includes('gerd') ||
    q.includes('gula') ||
    q.includes('tensi')
  ) {
    return getAmanahServiceByName('Poli Penyakit Dalam');
  }

  return undefined;
}
