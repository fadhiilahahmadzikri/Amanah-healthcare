import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  HealthcareHeading,
  HealthcareShell,
  HealthcareText,
  SectionContainer,
  ViewportLine
} from '@/features/public-site/components/shared';
import { healthcareContactItems } from '@/features/public-site/components/shared/data';
import { PublicSiteRouteShell } from '@/features/public-site/route-shell';

const lastUpdated = '17 September 2026';
const contactEmail = healthcareContactItems.find((item) => item.href.startsWith('mailto:'));

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Ringkasan cara Klinik Pratama Amanah Healthcare menangani data pada website publik dan area aplikasi yang memerlukan autentikasi.',
  robots: {
    index: false,
    follow: true
  },
  alternates: {
    canonical: '/privacy-policy'
  }
};

type PrivacySectionProps = {
  children: ReactNode;
  title: string;
};

function PrivacySection({ children, title }: PrivacySectionProps) {
  return (
    <section className='relative border-t border-line px-6 py-8 md:px-10 md:py-10'>
      <HealthcareHeading as='h2' size='subsection' className='max-w-3xl text-foreground'>
        {title}
      </HealthcareHeading>
      <div className='mt-4 max-w-3xl space-y-4'>{children}</div>
      <ViewportLine position='bottom' />
    </section>
  );
}

function PrivacyList({ items }: { items: string[] }) {
  return (
    <ul className='list-disc space-y-2 pl-5 amanah-type-body text-muted-foreground'>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <PublicSiteRouteShell>
      <HealthcareShell activePath='/privacy-policy' showFaq={false}>
        <SectionContainer className='px-0 sm:px-0'>
          <section className='relative bg-background px-6 py-12 md:px-10 md:py-16'>
            <HealthcareText size='caption' className='font-semibold text-muted-foreground'>
              Terakhir diperbarui: {lastUpdated}
            </HealthcareText>
            <HealthcareHeading as='h1' size='display' className='mt-4 max-w-4xl text-foreground'>
              Kebijakan Privasi
            </HealthcareHeading>
            <HealthcareText size='lead' className='mt-5 max-w-3xl text-muted-foreground'>
              Halaman ini menjelaskan praktik privasi pada website publik dan area aplikasi Klinik
              Pratama Amanah Healthcare berdasarkan implementasi frontend saat ini.
            </HealthcareText>
          </section>

          <PrivacySection title='Ringkasan'>
            <HealthcareText className='text-muted-foreground'>
              Website publik saat ini berisi informasi layanan, fasilitas, testimoni, ulasan,
              kontak, dan tautan ke layanan eksternal seperti email, telepon, WhatsApp, Google Maps,
              dan media sosial. Website publik tidak memasang Google Analytics, Google Tag Manager,
              Meta Pixel, Hotjar, Microsoft Clarity, atau pelacak pemasaran sejenis.
            </HealthcareText>
            <HealthcareText className='text-muted-foreground'>
              Beberapa bagian aplikasi membutuhkan autentikasi dan dapat memproses data akun atau
              data pasien. Detail bisnis seperti masa simpan resmi, penanggung jawab data, dan
              prosedur permintaan data perlu dikonfirmasi oleh pengelola klinik.
            </HealthcareText>
          </PrivacySection>

          <PrivacySection title='Data yang Diproses'>
            <PrivacyList
              items={[
                'Kontak publik: ketika pengunjung memilih tautan email, telepon, WhatsApp, Google Maps, atau media sosial, interaksi berikutnya diproses oleh aplikasi atau layanan tujuan.',
                'Autentikasi: area masuk menggunakan Clerk untuk proses sign-in, sign-up, sesi pengguna, dan data profil akun yang tersedia dari penyedia autentikasi.',
                'Pendaftaran pasien: area aplikasi dapat meminta nama, NIK, nama ibu kandung, tempat dan tanggal lahir, jenis kelamin, golongan darah, domisili, dan pekerjaan.',
                'Data pasien dan operasional: dashboard dapat menampilkan atau mengelola data pasien, janji temu, jadwal dokter, antrean, presensi, dan catatan administratif sesuai fitur yang digunakan.',
                'Asisten AI dashboard: pesan yang dikirim ke asisten AI diproses melalui endpoint aplikasi dan dapat diteruskan ke layanan model AI yang dikonfigurasi.'
              ]}
            />
          </PrivacySection>

          <PrivacySection title='Cookie dan Penyimpanan Browser'>
            <HealthcareText className='text-muted-foreground'>
              Website tidak membutuhkan banner cookie untuk analytics atau marketing karena audit
              kode tidak menemukan teknologi pelacakan opsional tersebut. Penyimpanan yang ada
              digunakan untuk fungsi aplikasi dan preferensi pengguna.
            </HealthcareText>
            <PrivacyList
              items={[
                'Cookie active_theme dan localStorage theme atau amanah-theme menyimpan pilihan tampilan terang atau gelap.',
                'Cookie sidebar_state menyimpan preferensi tampilan sidebar di dashboard.',
                'Cookie patient_registration_completed menandai bahwa pengguna terautentikasi sudah menyelesaikan pendaftaran pasien.',
                'Clerk dapat menggunakan cookie atau storage yang diperlukan untuk autentikasi, keamanan sesi, dan manajemen akun.',
                'LocalStorage pada fitur dashboard dapat menyimpan preferensi lokal seperti notifikasi, devtools, atau data mock operasional selama pengembangan.'
              ]}
            />
          </PrivacySection>

          <PrivacySection title='Layanan Pihak Ketiga'>
            <PrivacyList
              items={[
                'Clerk digunakan untuk autentikasi dan manajemen akun pada area masuk aplikasi.',
                'Sentry dapat digunakan untuk pemantauan error jika dikonfigurasi melalui environment variable. Konfigurasi aplikasi tidak mengirim PII secara default.',
                'YouTube no-cookie digunakan untuk beberapa video testimoni. Iframe video dimuat secara lazy agar permintaan pihak ketiga tidak terjadi lebih awal dari kebutuhan tampilan.',
                'Google Maps, Instagram, TikTok, Facebook, dan WhatsApp hanya dibuka ketika pengguna memilih tautan terkait.',
                'Tidak ada Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, atau Microsoft Clarity yang diaktifkan dari kode frontend saat audit ini dibuat.'
              ]}
            />
          </PrivacySection>

          <PrivacySection title='Pengaturan Cookie'>
            <HealthcareText className='text-muted-foreground'>
              Karena tidak ada cookie analytics atau marketing opsional yang ditemukan, website
              tidak menampilkan banner persetujuan cookie. Jika di masa depan analytics, iklan, atau
              pelacak pemasaran ditambahkan, mekanisme persetujuan perlu ditinjau ulang sebelum
              teknologi tersebut dijalankan.
            </HealthcareText>
          </PrivacySection>

          <PrivacySection title='Kontak'>
            <HealthcareText className='text-muted-foreground'>
              Untuk pertanyaan mengenai halaman ini, hubungi Klinik Pratama Amanah Healthcare
              melalui kanal kontak resmi yang tersedia di website.
              {contactEmail ? (
                <>
                  {' '}
                  Email:{' '}
                  <a
                    href={contactEmail.href}
                    className='font-semibold text-foreground underline-offset-4 hover:underline'
                  >
                    {contactEmail.value}
                  </a>
                  .
                </>
              ) : null}
            </HealthcareText>
          </PrivacySection>
        </SectionContainer>
      </HealthcareShell>
    </PublicSiteRouteShell>
  );
}
