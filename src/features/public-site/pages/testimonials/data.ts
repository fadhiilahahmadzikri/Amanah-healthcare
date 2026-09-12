import type { TestimonialsHeroData, TestimonialShowcaseItem } from './types';

export const testimonialsHeroData: TestimonialsHeroData = {
  eyebrow: 'Cerita & Pengalaman Pasien',
  title: 'Kisah Nyata Keluarga Amanah',
  subtitle:
    'Dokumentasi autentik dan pengalaman nyata para keluarga yang mempercayakan kesehatan, persalinan, dan perawatan buah hati di Klinik Pratama Amanah Healthcare.'
};

export const testimonialShowcaseItems: TestimonialShowcaseItem[] = [
  {
    id: 'khitan-gibran',
    eyebrow: 'Pengalaman Nyata',
    title: 'Khitan Nyaman, Anak Tenang.',
    quote: '“Gibran aja sudah buktiin, kalau khitan itu nggak semenakutkan yang dibayangkan! 🤩✨”',
    paragraphs: [
      'Bukannya nangis, Gibran malah ketiduran saking nyamannya proses khitan di Klinik Amanah Health Care Yogyakarta. 💤👍',
      'Buat Ayah & Bunda yang masih ragu pilih tempat khitan untuk si kecil, yuk ke Klinik Amanah aja! Prosesnya cepat, minim sakit, dan ditangani oleh tim profesional.'
    ],
    authorName: 'Gibran (8 tahun)',
    authorRole: 'Pasien Khitan Anak Klinik Amanah',
    ctaLabel: 'Jadwalkan Khitan',
    ctaHref:
      'https://wa.me/6281392456664?text=Halo%20Klinik%20Amanah,%20saya%20ingin%20jadwalkan%20layanan%20khitan%20anak',
    video: {
      src: '/healthcare/assets/videos/khitan-anak-gibran.mp4',
      youtubeUrl: 'https://youtube.com/shorts/XJ2av2DOyEU',
      youtubeId: 'XJ2av2DOyEU',
      poster: '/healthcare/assets/images/dokumentasi/dokumentasi-1.webp',
      title: 'Dokumentasi Khitan Anak Gibran di Klinik Amanah',
      isPlaceholder: false
    },
    pixelIcons: [
      { name: 'roket', title: 'Roket Petualangan Anak' },
      { name: 'bintang', title: 'Bintang Berani' },
      { name: 'gamepad', title: 'Gamepad Santai' }
    ],
    reversed: false
  },
  {
    id: 'cukur-rambut-bayi',
    eyebrow: 'Perawatan Buah Hati',
    title: 'Cukur Rambut Bayi Nyaman & Tenang',
    quote:
      '“Pengalaman pertama cukur rambut bayi di @amanahhealthcare. Beneran sesuai jargonnya: Mudah, Aman, dan Cepat! ✂️👶✨”',
    paragraphs: [
      'Petugasnya Bidan @a_maliaam dan Bidan @alfymsyfh telaten banget bikin si kecil tetap tenang selama proses cukur rambut berlangsung.',
      'Highly recommended buat Moms yang deg-degan mau cukur rambut anaknya! Pelayanan ramah, perlengkapan steril, dan sentuhan penuh kelembutan.'
    ],
    authorName: 'Moms & Si Kecil',
    authorRole: 'Layanan Cukur Rambut Bayi Klinik Amanah',
    ctaLabel: 'Konsultasi Cukur Bayi',
    ctaHref:
      'https://wa.me/6281392456664?text=Halo%20Klinik%20Amanah,%20saya%20ingin%20konsultasi%20layanan%20cukur%20rambut%20bayi',
    video: {
      youtubeUrl: 'https://youtube.com/shorts/q3RpdZNW3A8',
      youtubeId: 'q3RpdZNW3A8',
      poster: '/healthcare/assets/images/dokumentasi/dokumentasi-2.webp',
      title: 'Dokumentasi Cukur Rambut Bayi di Klinik Amanah',
      isPlaceholder: false
    },
    pixelIcons: [
      { name: 'bunga', title: 'Bunga Kelembutan' },
      { name: 'bintang', title: 'Bintang Ceria' },
      { name: 'sakura', title: 'Sakura Kasih Sayang' }
    ],
    reversed: true
  },
  {
    id: 'baby-spa',
    eyebrow: 'Relaksasi & Kebugaran Si Kecil',
    title: 'Happy Baby Spa Bersama Bidan Profesional',
    quote:
      '“Happy baby spa bersama @bidan.hida 🩷🥰! Si kecil super rileks, ceria, dan pulas banget tidurnya.”',
    paragraphs: [
      'Mulai dari pijat bayi relaksasi, baby swim di air hangat bersuhu terjaga, hingga senam stimulasi motorik dipandu langsung oleh bidan berlisensi dengan penuh kasih sayang.',
      'Bunda tidak perlu khawatir karena seluruh perlengkapan higienis, steril, serta terbukti membantu melancarkan peredaran darah, merangsang nafsu makan, dan membuat si kecil lebih bugar.'
    ],
    authorName: 'Bunda & Baby Cantik',
    authorRole: 'Layanan Baby Spa & Wellness Klinik Amanah',
    ctaLabel: 'Reservasi Baby Spa',
    ctaHref:
      'https://wa.me/6281392456664?text=Halo%20Klinik%20Amanah,%20saya%20ingin%20reservasi%20layanan%20baby%20spa',
    video: {
      youtubeUrl: 'https://youtube.com/shorts/oqh6yCl3v8M',
      youtubeId: 'oqh6yCl3v8M',
      poster: '/healthcare/assets/images/dokumentasi/dokumentasi-3.webp',
      title: 'Dokumentasi Happy Baby Spa bersama Bidan Hida',
      isPlaceholder: false
    },
    pixelIcons: [
      { name: 'bunga-matahari', title: 'Bunga Matahari Ceria' },
      { name: 'sakura', title: 'Sakura Lembut' },
      { name: 'bintang', title: 'Bintang Berkilau' }
    ],
    reversed: false
  },
  {
    id: 'pijat-oksitosin',
    eyebrow: 'Semangat Pejuang ASI',
    title: 'Treatment Pijat Oksitosin Ibu Menyusui',
    quote:
      '“Hallo Bunda.. Salam Sehat selalu! Hari ini Amanah Health Care kembali lagi dengan Treatment Pijat Oksitosin untuk kelancaran ASI. 🤱🤍✨”',
    paragraphs: [
      'Ada banyak sekali tujuan dan manfaat dari Pijat Oksitosin, salah satunya adalah merangsang hormon oksitosin untuk memperlancar produksi ASI dan meredakan ketegangan tubuh Bunda.',
      'Yuk untuk para pejuang ASI, tetap semangat ya! Bersama bidan laktasi profesional Klinik Amanah, proses menyusui terasa lebih nyaman, tenang, rileks, dan minim rasa cemas. 🙏🤍💞🥰'
    ],
    authorName: 'Bunda Pejuang ASI',
    authorRole: 'Layanan Pijat Laktasi & Oksitosin Klinik Amanah',
    ctaLabel: 'Jadwalkan Pijat Oksitosin',
    ctaHref:
      'https://wa.me/6281392456664?text=Halo%20Klinik%20Amanah,%20saya%20ingin%20jadwalkan%20treatment%20pijat%20oksitosin',
    video: {
      youtubeUrl: 'https://youtube.com/shorts/ZuZv9i5ZWCY',
      youtubeId: 'ZuZv9i5ZWCY',
      poster: '/healthcare/assets/images/dokumentasi/dokumentasi-4.webp',
      title: 'Dokumentasi Treatment Pijat Oksitosin Pejuang ASI',
      isPlaceholder: false
    },
    pixelIcons: [
      { name: 'bunga', title: 'Bunga Kehangatan' },
      { name: 'p3k', title: 'Peduli Medis' },
      { name: 'obat', title: 'Kesehatan Laktasi' }
    ],
    reversed: true
  },
  {
    id: 'usg-hermina',
    eyebrow: 'Kolaborasi Layanan Spesialistik',
    title: 'Amanah Health Care X RS Hermina: USG dr. Spesialis Kandungan',
    quote:
      '“Pemeriksaan USG Kehamilan Berkualitas Bersama Dokter Spesialis Kandungan (Sp.OG) Kolaborasi Amanah X RS Hermina! 🩺🤰✨”',
    paragraphs: [
      'Kolaborasi istimewa antara Klinik Amanah Health Care dan RS Hermina menghadirkan kemudahan pemeriksaan USG kehamilan berkualitas rumah sakit dengan suasana klinik yang ramah dan nyaman.',
      'Ditangani langsung oleh Dokter Spesialis Obstetri & Ginekologi (Sp.OG) berpengalaman dengan peralatan ultrasonografi modern untuk memantau tumbuh kembang dan kesehatan janin secara mendalam.'
    ],
    authorName: 'Keluarga Amanah & Bunda Hamil',
    authorRole: 'Program USG Spesialis Kandungan (Sp.OG)',
    ctaLabel: 'Jadwalkan USG Spesialis',
    ctaHref:
      'https://wa.me/6281392456664?text=Halo%20Klinik%20Amanah,%20saya%20ingin%20jadwalkan%20USG%20Spesialis%20Kandungan%20Hermina',
    video: {
      youtubeUrl: 'https://youtube.com/shorts/Iaq_KBnwuDw?feature=share',
      youtubeId: 'Iaq_KBnwuDw',
      poster: '/healthcare/assets/images/asset-index-5.webp',
      title: 'Dokumentasi USG dr. Spesialis Kandungan Kolaborasi RS Hermina',
      isPlaceholder: false
    },
    pixelIcons: [
      { name: 'p3k', title: 'Layanan Medis' },
      { name: 'bintang', title: 'Kualitas Prima' },
      { name: 'tabung', title: 'Diagnostik Akurat' }
    ],
    reversed: false
  },
  {
    id: 'kb-iud-kepercayaan-bunda',
    eyebrow: 'Kontrasepsi Jangka Panjang',
    title: 'Terima Kasih Kepercayaannya: 3x Pemasangan KB IUD di Klinik Amanah',
    quote:
      '“Terimakasih atas kepercayaannya bunda sudah 3x pemasangan KB IUD di Klinik Amanah 💕. Prosesnya nyaman, minim rasa sakit, dan selalu ditangani dengan telaten.”',
    paragraphs: [
      'Memilih metode kontrasepsi jangka panjang (MKJP) seperti KB IUD memerlukan rasa percaya dan kenyamanan tinggi. Bunda yang telah 3 kali mempercayakan pemasangan dan kontrol berkala IUD di Klinik Amanah membuktikan komitmen kami dalam memberikan pendampingan keluarga berencana yang ramah, higienis, serta minim rasa cemas.',
      'Dengan prosedur steril berstandar klinis tinggi dan sentuhan kelembutan para bidan berpengalaman, proses pemasangan berlangsung cepat serta aman. Bunda juga mendapatkan konsultasi menyeluruh mengenai pemilihan jenis IUD yang tepat dan edukasi adaptasi tubuh agar kenyamanan tetap terjaga. #kontrasepsi #kontrasepsijangkapanjang'
    ],
    authorName: 'Bunda Setia Amanah',
    authorRole: 'Pasien KB IUD 3 Periode Klinik Amanah',
    ctaLabel: 'Konsultasi KB IUD',
    ctaHref:
      'https://wa.me/6281392456664?text=Halo%20Klinik%20Amanah,%20saya%20ingin%20konsultasi%20layanan%20pemasangan%20KB%20IUD',
    video: {
      youtubeUrl: 'https://youtube.com/shorts/6NQa1Uk1kZk',
      youtubeId: '6NQa1Uk1kZk',
      poster: '/healthcare/assets/images/asset_kb.webp',
      title: 'Dokumentasi Pemasangan KB IUD di Klinik Amanah',
      isPlaceholder: false
    },
    pixelIcons: [
      { name: 'obat', title: 'Perlindungan Mantap' },
      { name: 'bintang', title: 'Terpercaya 3x' },
      { name: 'sakura', title: 'Nyaman & Telaten' }
    ],
    reversed: true
  },
  {
    id: 'rangkaian-iva-kontrol-iud',
    eyebrow: 'Kesehatan Reproduksi Wanita',
    title: '1 Tindakan 3 Rangkaian: Toilet Vagina, IVA Test & Kontrol IUD',
    quote:
      '“1 tindakan dalam 3 rangkaian: toilet vagina, IVA Test, dan kontrol IUD. Jangan pernah takut untuk cek ya, lakukan pemeriksaan secara berkala untuk mendeteksi dan mencegah kanker serviks! 🌸✨”',
    paragraphs: [
      'Menjaga organ kewanitaan tetap sehat adalah investasi masa depan yang sangat berharga. Melalui paket terpadu 1 tindakan dalam 3 rangkaian, Bunda mendapatkan perawatan higienis toilet vagina, penapisan deteksi dini kanker leher rahim lewat pemeriksaan IVA Test, sekaligus pemantauan posisi benang dan efektivitas kontrasepsi IUD dalam satu sesi kunjungan praktis.',
      'Pemeriksaan dilaksanakan di ruang tindakan privat yang nyaman dengan instrumen steril sekali pakai serta didampingi tim medis wanita yang bersahabat dan empatik. Hilangkan rasa takut dan malu, karena pemeriksaan berkala adalah langkah proteksi terbaik untuk diri sendiri dan keluarga tercinta. #kontrasepsijangkapanjang #deteksidinikankerserviks'
    ],
    authorName: 'Sahabat Sehat Amanah',
    authorRole: 'Layanan Pemeriksaan Kesehatan Reproduksi & IVA Test',
    ctaLabel: 'Jadwalkan IVA Test & Kontrol',
    ctaHref:
      'https://wa.me/6281392456664?text=Halo%20Klinik%20Amanah,%20saya%20ingin%20jadwalkan%20pemeriksaan%20IVA%20Test%20dan%20kontrol%20IUD',
    video: {
      youtubeUrl: 'https://youtube.com/shorts/wU3CDcbn3b0',
      youtubeId: 'wU3CDcbn3b0',
      poster: '/healthcare/assets/images/asset_konsul_kb.webp',
      title: 'Dokumentasi Rangkaian Toilet Vagina, IVA Test, dan Kontrol IUD',
      isPlaceholder: false
    },
    pixelIcons: [
      { name: 'p3k', title: 'Deteksi Dini' },
      { name: 'bunga', title: 'Perawatan Higienis' },
      { name: 'tabung', title: 'Skrining Akurat' }
    ],
    reversed: false
  }
];
