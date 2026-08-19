'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface GuideStepItem {
  id: string;
  stepNumber: number;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  points: { label: string; text: string }[];
  note?: string;
  actionUrl?: string;
  actionLabel?: string;
}

const GUIDE_DATA: GuideStepItem[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    category: 'Akun & Akses',
    title: 'Pendaftaran Akun dan Masuk ke Aplikasi',
    subtitle: 'Langkah awal untuk mengakses seluruh layanan kesehatan',
    description:
      'Setiap pasien memerlukan akun yang terdaftar menggunakan alamat email atau nomor telepon aktif. Jika Anda belum memiliki akun atau mengalami kesulitan, petugas di meja pendaftaran klinik siap membantu proses pembuatan akun.',
    points: [
      {
        label: 'Cara Masuk (Login)',
        text: 'Masukkan alamat email dan kata sandi yang telah didaftarkan pada formulir masuk, kemudian tekan tombol Masuk.'
      },
      {
        label: 'Jika Belum Punya Akun',
        text: 'Tekan tautan Daftar Akun Baru, lalu isi nama lengkap sesuai kartu identitas (KTP) dan nomor telepon Anda.'
      },
      {
        label: 'Bantuan Pendaftaran di Loket',
        text: 'Bagi pasien yang tidak terbiasa menggunakan telepon genggam atau internet, Anda dapat langsung menuju ke Loket 1 Pendaftaran Klinik untuk didaftarkan secara manual oleh petugas.'
      }
    ],
    note: 'Simpan alamat email dan kata sandi Anda di tempat yang aman agar tidak terlupa saat kunjungan berikutnya.',
    actionUrl: '/dashboard/klinik/profile',
    actionLabel: 'Lihat Data Profil Akun'
  },
  {
    id: 'step-2',
    stepNumber: 2,
    category: 'Janji Temu',
    title: 'Membuat dan Mengatur Janji Temu Dokter',
    subtitle: 'Reservasi jadwal konsultasi poliklinik sebelum datang ke klinik',
    description:
      'Halaman Janji Temu digunakan untuk memesan waktu periksa dengan dokter spesialis atau dokter umum tanpa perlu mengantre sejak pagi di lokasi klinik.',
    points: [
      {
        label: 'Memilih Poliklinik dan Dokter',
        text: 'Pilih layanan poli yang Anda butuhkan (misalnya Poli Umum, Poli Anak, Poli Gigi, atau Spesialis Penyakit Dalam) beserta dokter yang bertugas.'
      },
      {
        label: 'Menentukan Hari dan Jam',
        text: 'Pilih tanggal kunjungan pada kalender dan tentukan sesi jam pemeriksaan yang masih tersedia.'
      },
      {
        label: 'Mengisi Keluhan',
        text: 'Tuliskan keluhan atau alasan periksa secara singkat agar dokter dapat mempersiapkan rekam medis Anda sebelum pemeriksaan dimulai.'
      },
      {
        label: 'Mengubah Jadwal (Reschedule)',
        text: 'Jika Anda berhalangan hadir pada waktu yang telah ditentukan, tekan tombol Reschedule pada kartu janji temu untuk memilih hari pengganti.'
      }
    ],
    note: 'Disarankan hadir 15 menit sebelum jam pemeriksaan yang tertera pada jadwal janji temu Anda.',
    actionUrl: '/dashboard/klinik/janji-temu',
    actionLabel: 'Buka Halaman Janji Temu'
  },
  {
    id: 'step-3',
    stepNumber: 3,
    category: 'Antrean',
    title: 'Memantau Nomor Antrean di Ruang Tunggu',
    subtitle: 'Melihat giliran pemeriksaan secara langsung di layar monitor',
    description:
      'Halaman Cek Antrean menampilkan nomor urut pasien yang sedang diperiksa di dalam ruang dokter serta daftar pasien yang sedang duduk di ruang tunggu.',
    points: [
      {
        label: 'Bagian Sedang Dipanggil (Sisi Kiri)',
        text: 'Menampilkan nama pasien, nomor antrean besar, foto, dan nama dokter yang sedang melayani pemeriksaan di dalam ruangan.'
      },
      {
        label: 'Bagian Kursi Menunggu (Sisi Kanan)',
        text: 'Menampilkan susunan kursi antrean pasien berikutnya. Kartu dengan tanda Anda menunjukkan posisi nomor giliran Anda.'
      },
      {
        label: 'Estimasi Waktu Giliran',
        text: 'Sistem secara otomatis menghitung perkiraan sisa menit tunggu hingga nomor antrean Anda dipanggil oleh perawat.'
      }
    ],
    note: 'Saat nomor Anda muncul pada kotak Sedang Dipanggil, segera melangkah menuju pintu poliklinik yang dituju.',
    actionUrl: '/dashboard/klinik/antrean',
    actionLabel: 'Buka Layar Cek Antrean'
  },
  {
    id: 'step-4',
    stepNumber: 4,
    category: 'Notifikasi',
    title: 'Membaca Pemberitahuan dan Hasil Pemeriksaan',
    subtitle: 'Informasi pengingat obat, jadwal periksa, dan surat hasil laboratorium',
    description:
      'Setiap perkembangan medis Anda akan dikirimkan melalui halaman Notifikasi agar Anda tidak ketinggalan jadwal penting.',
    points: [
      {
        label: 'Tanda Titik Biru / Hijau',
        text: 'Notifikasi yang belum Anda buka ditandai dengan lingkaran berwarna. Setelah dibuka atau ditekan, status akan otomatis berubah menjadi Sudah Dibaca.'
      },
      {
        label: 'Pengambilan Obat di Farmasi',
        text: 'Saat dokter selesai menuliskan resep, Anda akan menerima pesan bahwa obat sudah siap diambil di Loket Apotek Klinik.'
      },
      {
        label: 'Unduh Hasil Tes Laboratorium',
        text: 'Hasil tes darah atau rontgen dapat diunduh langsung dalam bentuk dokumen PDF resmi tanpa perlu mengambil kertas fisik di klinik.'
      }
    ],
    note: 'Tekan tombol Tandai Semua Sudah Dibaca di sudut kanan atas untuk merapikan daftar pesan Anda.',
    actionUrl: '/dashboard/notifications',
    actionLabel: 'Buka Halaman Notifikasi'
  },
  {
    id: 'step-5',
    stepNumber: 5,
    category: 'Profil Pasien',
    title: 'Melihat Data Pasien, BPJS, dan Catatan Medis',
    subtitle: 'Pemeriksaan nomor rekam medis, golongan darah, dan kontak keluarga',
    description:
      'Halaman Profil Pasien memuat ringkasan identitas medis yang digunakan oleh dokter dan perawat saat melayani Anda.',
    points: [
      {
        label: 'Nomor Rekam Medis (No. RM)',
        text: 'Nomor identitas tetap pasien yang wajib ditunjukkan saat mengambil obat atau mendaftar di loket administrasi.'
      },
      {
        label: 'Status Kartu BPJS Kesehatan',
        text: 'Menampilkan apakah kepesertaan BPJS Anda aktif beserta kelas rawat yang terdaftar.'
      },
      {
        label: 'Kontak Darurat dan Riwayat Alergi',
        text: 'Pastikan nomor telepon keluarga terdekat dan catatan alergi obat (misalnya alergi antibiotik) selalu diperbarui demi keamanan pengobatan.'
      }
    ],
    note: 'Tekan tombol Edit profil jika terdapat perubahan nomor telepon atau alamat tempat tinggal.',
    actionUrl: '/dashboard/klinik/profile',
    actionLabel: 'Buka Profil Pasien'
  },
  {
    id: 'step-6',
    stepNumber: 6,
    category: 'Bantuan Chat',
    title: 'Menghubungi Petugas Bantuan Melalui Percakapan Langsung',
    subtitle: 'Bantuan cepat jika mengalami kendala teknis atau informasi klinik',
    description:
      'Jika Anda bingung atau membutuhkan panduan khusus, tim layanan pelanggan klinik siap menjawab pesan Anda secara langsung.',
    points: [
      {
        label: 'Tombol Bulat di Sudut Kanan Bawah',
        text: 'Tekan tombol bulat berwarna biru di sudut kanan bawah layar monitor untuk membuka kotak percakapan.'
      },
      {
        label: 'Menulis Pertanyaan',
        text: 'Ketik pertanyaan Anda pada kolom yang tersedia, kemudian tekan tombol kirim.'
      },
      {
        label: 'Pilihan Pertanyaan Cepat',
        text: 'Anda juga dapat menekan salah satu tombol pilihan cepat (seperti Jadwal Dokter Hari Ini atau Pendaftaran BPJS) untuk mendapatkan informasi otomatis.'
      }
    ],
    note: 'Layanan percakapan online aktif setiap hari kerja pada jam operasional klinik (08.00 - 17.00 WIB).'
  },
  {
    id: 'step-7',
    stepNumber: 7,
    category: 'Keamanan Akun',
    title: 'Cara Keluar dari Akun (Logout)',
    subtitle: 'Menjaga kerahasiaan data rekam medis setelah selesai menggunakan aplikasi',
    description:
      'Apabila Anda mengakses aplikasi melalui komputer umum di klinik atau meminjam perangkat orang lain, pastikan untuk selalu keluar dari akun setelah selesai.',
    points: [
      {
        label: 'Melalui Halaman Profil Pasien',
        text: 'Buka halaman Profil Pasien, geser ke bagian paling bawah, lalu tekan tombol Keluar Sesi.'
      },
      {
        label: 'Melalui Menu Samping',
        text: 'Anda juga dapat menekan nama akun Anda di bagian kiri bawah menu samping, kemudian pilih menu Keluar.'
      }
    ],
    note: 'Setelah keluar, orang lain yang menggunakan perangkat tersebut tidak dapat melihat data riwayat kesehatan Anda.'
  }
];

const CATEGORY_TABS = [
  'Semua Panduan',
  'Akun & Akses',
  'Janji Temu',
  'Antrean',
  'Notifikasi',
  'Profil Pasien',
  'Bantuan Chat',
  'Keamanan Akun'
];

export function GuideView() {
  const [activeTab, setActiveTab] = useState('Semua Panduan');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStepId, setActiveStepId] = useState<string>(GUIDE_DATA[0].id);

  const filteredSteps = useMemo(() => {
    return GUIDE_DATA.filter((item) => {
      const matchTab = activeTab === 'Semua Panduan' || item.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.points.some(
          (p) => p.label.toLowerCase().includes(q) || p.text.toLowerCase().includes(q)
        );

      return matchTab && matchSearch;
    });
  }, [activeTab, searchQuery]);

  // ScrollSpy with IntersectionObserver to activate glyph on scroll
  useEffect(() => {
    const handleScroll = () => {
      const stepElements = filteredSteps.map((step) => ({
        id: step.id,
        el: document.getElementById(`step-card-${step.id}`)
      }));

      const scrollPosition = window.scrollY + 220;

      for (let i = stepElements.length - 1; i >= 0; i--) {
        const item = stepElements[i];
        if (item.el) {
          const rect = item.el.getBoundingClientRect();
          const topPos = rect.top + window.scrollY;
          if (scrollPosition >= topPos) {
            setActiveStepId(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredSteps]);

  const activeIndex = useMemo(() => {
    const idx = filteredSteps.findIndex((s) => s.id === activeStepId);
    return idx === -1 ? 0 : idx;
  }, [filteredSteps, activeStepId]);

  return (
    <PageContainer
      pageTitle='Panduan Penggunaan'
      pageDescription='Petunjuk langkah demi langkah penggunaan layanan Klinik Amanah untuk pasien dan keluarga'
      scrollable
    >
      <div className='flex flex-col flex-1 w-full space-y-6 font-sans select-none pb-16'>
        {/* 1. Direct Search & Category Filter (No Redundant Wrapper) */}
        <div className='space-y-3.5'>
          {/* Search Box */}
          <div className='relative w-full max-w-xl'>
            <Icons.search className='size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Cari petunjuk atau topik bantuan (contoh: cara buat janji, hasil lab, antrean)...'
              className='h-10 pl-10 pr-4 text-xs sm:text-sm bg-card border-border/70 rounded-xl'
            />
          </div>

          {/* Category Tabs */}
          <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar'>
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type='button'
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer border',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-xs'
                      : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Vertical Stepper Timeline with Perfectly Centered Track & ScrollSpy Active States */}
        {filteredSteps.length > 0 ? (
          <div className='space-y-4 sm:space-y-6'>
            {filteredSteps.map((step, idx) => {
              const isLast = idx === filteredSteps.length - 1;
              const isActive = idx === activeIndex;
              const isPassed = idx < activeIndex;
              const isFuture = idx > activeIndex;

              return (
                <div
                  key={step.id}
                  id={`step-card-${step.id}`}
                  className='flex items-stretch gap-4 sm:gap-6 group'
                >
                  {/* Left Column: 100% Mathematically Centered Line & Circle Badge */}
                  <div className='relative flex flex-col items-center shrink-0 w-10 sm:w-12'>
                    {/* Top connecting line segment */}
                    <div
                      className={cn(
                        'w-[2px] h-6 transition-colors duration-300',
                        idx === 0
                          ? 'invisible'
                          : isPassed || isActive
                            ? 'bg-primary'
                            : 'bg-border/80'
                      )}
                    />

                    {/* Circular Step Badge (Glyph) with Scroll Active / Disabled States */}
                    <div
                      className={cn(
                        'size-10 sm:size-11 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center transition-all duration-300 select-none z-10 shrink-0',
                        isActive
                          ? 'bg-primary text-primary-foreground border-2 border-primary shadow-lg ring-4 ring-primary/20 scale-105'
                          : isPassed
                            ? 'bg-card text-primary border-2 border-primary ring-2 ring-primary/10 shadow-xs'
                            : 'bg-muted/50 text-muted-foreground border-2 border-border/80 opacity-50'
                      )}
                    >
                      {isPassed ? (
                        <Icons.check className='size-4.5 stroke-[2.5]' />
                      ) : (
                        <span>{step.stepNumber}</span>
                      )}
                    </div>

                    {/* Bottom connecting line segment */}
                    <div
                      className={cn(
                        'w-[2px] flex-1 min-h-[20px] transition-colors duration-300',
                        isLast ? 'invisible' : isPassed ? 'bg-primary' : 'bg-border/80'
                      )}
                    />
                  </div>

                  {/* Right Column: Step Content Card */}
                  <div
                    className={cn(
                      'flex-1 min-w-0 bg-card border rounded-2xl p-5 sm:p-6 shadow-none space-y-4 transition-all duration-300 my-1',
                      isActive
                        ? 'border-primary/60 shadow-xs ring-1 ring-primary/20 bg-card'
                        : isPassed
                          ? 'border-border/80 hover:border-border'
                          : 'border-border/50 opacity-75 hover:opacity-100'
                    )}
                  >
                    {/* Header Info */}
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between gap-3 flex-wrap'>
                        <Badge
                          variant={isActive ? 'default' : 'secondary'}
                          className={cn(
                            'text-[11px] font-semibold px-2.5 py-0.5 rounded-md border',
                            isActive
                              ? 'border-primary'
                              : 'border-border/50 bg-muted/50 text-foreground'
                          )}
                        >
                          {step.category}
                        </Badge>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                          )}
                        >
                          Langkah ke-{step.stepNumber}
                        </span>
                      </div>

                      <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight pt-1'>
                        {step.title}
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground font-normal'>
                        {step.subtitle}
                      </p>
                    </div>

                    {/* Overview Paragraph */}
                    <p className='text-xs sm:text-sm text-foreground/85 leading-relaxed font-normal'>
                      {step.description}
                    </p>

                    {/* Step-by-Step Points */}
                    <div className='space-y-2.5 pt-1'>
                      {step.points.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className={cn(
                            'flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm leading-relaxed transition-colors',
                            isActive
                              ? 'bg-primary/[0.03] border-primary/20'
                              : 'bg-muted/20 border-border/40'
                          )}
                        >
                          <div
                            className={cn(
                              'size-2 rounded-full shrink-0 mt-1.5',
                              isActive || isPassed ? 'bg-primary' : 'bg-muted-foreground/60'
                            )}
                          />
                          <div>
                            <span className='font-bold text-foreground mr-1.5'>{pt.label}:</span>
                            <span className='text-muted-foreground font-normal'>{pt.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Important Note Callout */}
                    {step.note && (
                      <div className='p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm text-foreground flex items-start gap-2.5'>
                        <Icons.info className='size-4 text-primary shrink-0 mt-0.5' />
                        <div>
                          <span className='font-bold text-foreground mr-1'>Catatan Penting:</span>
                          <span className='text-muted-foreground font-normal'>{step.note}</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Direct Link Action Button */}
                    {step.actionUrl && step.actionLabel && (
                      <div className='pt-1 flex items-center justify-end'>
                        <Button
                          asChild
                          variant='outline'
                          size='sm'
                          className='rounded-xl text-xs gap-1.5 font-medium'
                        >
                          <Link href={step.actionUrl}>
                            <span>{step.actionLabel}</span>
                            <Icons.arrowRight className='size-3.5' />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search Result */
          <div className='bg-card rounded-2xl p-10 text-center border border-border/60 shadow-none space-y-3 flex flex-col items-center justify-center'>
            <div className='size-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto ring-4 ring-muted/50'>
              <Icons.search className='size-6 opacity-40' />
            </div>
            <div className='space-y-1'>
              <h4 className='text-sm font-bold text-foreground'>Panduan Tidak Ditemukan</h4>
              <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
                Tidak ada topik panduan yang cocok dengan kata kunci pencarian Anda. Coba gunakan
                kata lain seperti janji temu, antrean, atau rekam medis.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSearchQuery('');
                setActiveTab('Semua Panduan');
              }}
              className='text-xs rounded-xl'
            >
              Lihat Semua Panduan
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
