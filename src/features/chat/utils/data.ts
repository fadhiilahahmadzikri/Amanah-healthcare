import type { Conversation } from './types';

export const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Ahmad Fauzi',
    id_pasien: 'RM-2026-001',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
    time: '2m',
    status: 'SUDAH DATANG',
    unread: 3,
    phone: '+62 812-9876-5432',
    email: 'ahmad.fauzi@example.com',
    gender: 'Laki-laki',
    age: 34,
    dpjp: {
      name: 'dr. Andi Wijaya',
      specialty: 'Spesialis Penyakit Dalam',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&h=120&fit=crop'
    },
    quickReplies: [
      'Konfirmasi Kedatangan',
      'Kirim Petunjuk Poli',
      'Hasil Lab Siap',
      'Jadwalkan Kontrol'
    ],
    timeline: [
      {
        id: 1,
        title: 'Registrasi Online',
        subtitle: 'Diverifikasi oleh Admin Pelayanan',
        date: '10 Mei',
        iconType: 'lead',
        hasUserAvatar: true,
        userAvatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop'
      },
      {
        id: 2,
        title: 'Keluhan Masuk',
        subtitle: 'Pasien mengeluhkan nyeri punggung bawah',
        date: '11 Mei',
        iconType: 'contact'
      },
      {
        id: 3,
        title: 'Skrining Awal Selesai',
        subtitle: 'Triage: Prioritas Poli Penyakit Dalam',
        date: '11 Mei',
        iconType: 'qualified'
      },
      {
        id: 4,
        title: 'Janji Temu Dikonfirmasi – 14 Mei, 09:00',
        subtitle: 'DPJP: dr. Andi Wijaya',
        date: '12 Mei',
        iconType: 'booked',
        hasUserAvatar: true,
        userAvatar:
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=60&h=60&fit=crop'
      },
      {
        id: 5,
        title: 'Pemeriksaan Selesai',
        subtitle: 'Rekomendasi Fisioterapi & Obat NSAID',
        date: '14 Mei',
        iconType: 'completed',
        hasAction: true,
        actionLabel: 'Lihat Resume Medis'
      },
      {
        id: 6,
        title: 'Pembayaran & Resep Selesai',
        subtitle: 'Klaim Asuransi Terverifikasi (Rp 750.000)',
        date: '14 Mei',
        iconType: 'payment'
      }
    ],
    messages: [
      {
        id: 'm1',
        sender: 'contact',
        author: 'Ahmad Fauzi',
        text: 'Halo Admin Amanah, saya ingin konfirmasi janji temu dengan dr. Andi Wijaya besok pagi apakah jadwalnya masih sesuai?',
        timestamp: '08:45 AM',
        type: 'text'
      },
      {
        id: 'm2',
        sender: 'user',
        author: 'Admin Klinik',
        text: 'Selamat pagi Pak Ahmad Fauzi. Jadwal konsultasi Anda bersama dr. Andi Wijaya terkonfirmasi besok pukul 09:00 WIB di Poli Penyakit Dalam Lantai 2.',
        timestamp: '08:48 AM',
        type: 'text'
      },
      {
        id: 'm3',
        sender: 'contact',
        author: 'Ahmad Fauzi',
        text: 'Baik bu, apakah saya perlu membawa hasil rontgen lumbal dari rumah sakit sebelumnya?',
        timestamp: '08:50 AM',
        type: 'text'
      },
      {
        id: 'm4',
        sender: 'user',
        author: 'Admin Klinik',
        text: 'Betul Pak, mohon dibawa beserta kartu identitas dan kartu asuransi ya. Berikut panduan singkat alur kedatangan:',
        timestamp: '08:52 AM',
        type: 'text'
      },
      {
        id: 'm5',
        sender: 'user',
        author: 'Admin Klinik',
        text: 'Audio petunjuk persiapan sebelum tindakan:',
        timestamp: '08:53 AM',
        type: 'audio',
        audioDuration: '0:24'
      },
      {
        id: 'm6',
        sender: 'contact',
        author: 'Ahmad Fauzi',
        text: 'Siap terima kasih banyak infonya Admin, sangat jelas!',
        timestamp: '08:55 AM',
        type: 'text'
      },
      {
        id: 'm7',
        sender: 'system',
        author: 'Sistem',
        text: 'Status Pasien: Sudah Datang di Poli Penyakit Dalam',
        timestamp: '08:58 AM',
        type: 'status_update',
        statusUpdateText: 'Status Pasien: Sudah Datang di Poli Penyakit Dalam'
      }
    ]
  },
  {
    id: 'conv-2',
    name: 'Madonna Sari',
    id_pasien: 'RM-2026-002',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
    time: '15m',
    status: 'SUDAH BUAT JANJI',
    unread: 1,
    phone: '+62 813-8877-6655',
    email: 'madonna.sari@example.com',
    gender: 'Perempuan',
    age: 28,
    dpjp: {
      name: 'dr. Sarah Aulia',
      specialty: 'Dokter Umum',
      avatar: 'https://images.unsplash.com/photo-1594824813620-4a81e3a98701?w=120&h=120&fit=crop'
    },
    quickReplies: [
      'Kirim Link Telekonsultasi',
      'Cek Status Lab',
      'Resep Digital',
      'Instruksi Minum Obat'
    ],
    timeline: [
      {
        id: 1,
        title: 'Konsultasi Telemedicine Masuk',
        subtitle: 'Melalui Portal Pasien Amanah',
        date: '12 Mei',
        iconType: 'lead'
      },
      {
        id: 2,
        title: 'Verifikasi BPJS / Asuransi',
        subtitle: 'Status: Aktif',
        date: '12 Mei',
        iconType: 'qualified'
      },
      {
        id: 3,
        title: 'Jadwal Konsultasi Dokter',
        subtitle: 'dr. Sarah Aulia – 15 Mei, 14:00',
        date: '13 Mei',
        iconType: 'booked'
      }
    ],
    messages: [
      {
        id: 'm21',
        sender: 'contact',
        author: 'Madonna Sari',
        text: 'Selamat siang dok/admin, hasil tes lab darah saya sudah keluar belum ya?',
        timestamp: '11:15 AM',
        type: 'text'
      },
      {
        id: 'm22',
        sender: 'user',
        author: 'Admin Klinik',
        text: 'Halo Ibu Madonna, hasil lab darah sudah selesai diverifikasi oleh dokter patologi klinis dan sudah kami sematkan di rekam medis Anda.',
        timestamp: '11:18 AM',
        type: 'text'
      }
    ]
  },
  {
    id: 'conv-3',
    name: 'Dewi Rahayu',
    id_pasien: 'RM-2026-003',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
    time: '30m',
    status: 'MENUNGGU',
    unread: 0,
    phone: '+62 811-2233-4455',
    email: 'dewi.rahayu@example.com',
    gender: 'Perempuan',
    age: 31,
    dpjp: {
      name: 'dr. Budi Santoso',
      specialty: 'Spesialis Anak',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&h=120&fit=crop'
    },
    quickReplies: ['Panggil Antrean', 'Cek Jadwal Vaksin', 'Resep Obat Anak'],
    timeline: [
      {
        id: 1,
        title: 'Booking Vaksinasi Anak',
        subtitle: 'Vaksin PCV Dosis ke-2',
        date: '14 Mei',
        iconType: 'booked'
      },
      {
        id: 2,
        title: 'Menunggu di Ruang Tunggu Poli Anak',
        subtitle: 'Nomor Antrean A-003',
        date: '15 Mei',
        iconType: 'contact'
      }
    ],
    messages: [
      {
        id: 'm31',
        sender: 'contact',
        author: 'Dewi Rahayu',
        text: 'Apakah antrean poli anak sedang ramai saat ini?',
        timestamp: '10:05 AM',
        type: 'text'
      },
      {
        id: 'm32',
        sender: 'user',
        author: 'Admin Klinik',
        text: 'Saat ini antrean sedang berada di nomor A-002, perkiraan 10 menit lagi nomor A-003 akan dipanggil ya Bu Dewi.',
        timestamp: '10:08 AM',
        type: 'text'
      }
    ]
  },
  {
    id: 'conv-4',
    name: 'Nadia Putri',
    id_pasien: 'RM-2026-004',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
    time: '2h',
    status: 'SUDAH BUAT JANJI',
    unread: 0,
    phone: '+62 817-6655-4433',
    email: 'nadia.putri@example.com',
    gender: 'Perempuan',
    age: 26,
    dpjp: {
      name: 'dr. Dina Kartika',
      specialty: 'Spesialis Kandungan',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop'
    },
    quickReplies: ['Konfirmasi Jadwal USG', 'Instruksi Pemeriksaan', 'Resep Vitamin'],
    timeline: [
      {
        id: 1,
        title: 'Booking Pemeriksaan USG Kandungan',
        subtitle: 'dr. Dina Kartika – 16 Mei, 13:00',
        date: '14 Mei',
        iconType: 'booked'
      }
    ],
    messages: [
      {
        id: 'm41',
        sender: 'contact',
        author: 'Nadia Putri',
        text: 'Terima kasih atas jadwalnya admin.',
        timestamp: '09:12 AM',
        type: 'text'
      }
    ]
  },
  {
    id: 'conv-5',
    name: 'Ilsa Namaga',
    id_pasien: 'RM-2026-005',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    time: '1d',
    status: 'MENUNGGU',
    unread: 0,
    phone: '+62 821-4433-2211',
    email: 'ilsa.namaga@example.com',
    gender: 'Laki-laki',
    age: 45,
    dpjp: {
      name: 'dr. Rudi Hermawan',
      specialty: 'Spesialis Kulit',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=120&h=120&fit=crop'
    },
    quickReplies: ['Panggil Nomor Antrean', 'Kirim Hasil Skrining'],
    timeline: [
      {
        id: 1,
        title: 'Antrean Poli Kulit & Kelamin',
        subtitle: 'Nomor Antrean A-008',
        date: '15 Mei',
        iconType: 'contact'
      }
    ],
    messages: [
      {
        id: 'm51',
        sender: 'contact',
        author: 'Ilsa Namaga',
        text: 'Saya sudah berada di ruang tunggu lantai 1.',
        timestamp: 'Yesterday',
        type: 'text'
      }
    ]
  }
];
